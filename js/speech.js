// Spraak: voorlezen en luisteren (SpeechRecognition) voor iPad/Safari.
// Voorlezen gebruikt vooraf ingesproken clips (audio/, zie tools/voice) en valt per zin
// terug op de ingebouwde stem (speechSynthesis) als er geen clip is.

const synth = typeof window !== 'undefined' ? window.speechSynthesis : undefined;

const VOICES = {
  verteller: { rate: 0.95, pitch: 1.0 },
  kwebbel: { rate: 1.05, pitch: 1.5 },
  florine: { rate: 1.0, pitch: 1.6 },
  held: { rate: 1.0, pitch: 1.3 },
  brom: { rate: 0.85, pitch: 0.6 },
  piep: { rate: 1.0, pitch: 1.8 },
  rommel: { rate: 1.05, pitch: 1.2 },
};

let voice = null;
let voicesLoaded = null;
let unlocked = false;
let generation = 0; // verhoogd bij cancel(); lopende speak() stopt dan
let pendingResolve = null;
const keepAlive = new Set(); // houdt utterances vast (anders GC → geen 'end' in sommige browsers)

// ------------------------------------------------------------------ stemmen

function scoreVoice(v) {
  const lang = (v.lang || '').replace('_', '-').toLowerCase();
  if (!lang.startsWith('nl')) return -1;
  let s = lang === 'nl-nl' ? 10 : 5;
  if (/xander|claire|ellen/i.test(v.name)) s += 3;
  if (/enhanced|premium|verbeterd|natural/i.test(v.name)) s += 4;
  if (v.localService) s += 1;
  return s;
}

function pickVoice() {
  if (!synth) return null;
  const list = synth.getVoices() || [];
  let best = null;
  let bestScore = -1;
  for (const v of list) {
    const s = scoreVoice(v);
    if (s > bestScore) { best = v; bestScore = s; }
  }
  voice = best; // null → default-stem met lang nl-NL
  return voice;
}

function loadVoices(timeoutMs = 1500) {
  if (!synth) return Promise.resolve(null);
  if (synth.getVoices().length) return Promise.resolve(pickVoice());
  if (voicesLoaded) return voicesLoaded;
  voicesLoaded = new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      synth.removeEventListener?.('voiceschanged', finish);
      resolve(pickVoice());
    };
    synth.addEventListener?.('voiceschanged', finish);
    setTimeout(finish, timeoutMs);
  });
  return voicesLoaded;
}

if (synth) {
  // Stemmen kunnen later nog wijzigen (bijv. Enhanced-stem net gedownload).
  synth.addEventListener?.('voiceschanged', pickVoice);
}

// ------------------------------------------------------------------ unlock

/** Aanroepen binnen een tik/klik: iOS staat spraak pas toe na een gebruikersgebaar. */
export function unlock() {
  unlockClips();
  if (!synth) return Promise.resolve();
  if (!unlocked) {
    try {
      const u = new SpeechSynthesisUtterance(' ');
      u.volume = 0;
      u.rate = 1;
      u.lang = 'nl-NL';
      synth.speak(u);
      unlocked = true;
    } catch { /* negeren */ }
  }
  return loadVoices();
}

// ------------------------------------------------------------------ tekst voorbereiden

const EMOJI_RE = /[\p{Extended_Pictographic}\u{1F1E6}-\u{1F1FF}\u{1F3FB}-\u{1F3FF}\u{FE0F}\u{200D}\u{20E3}]/gu;

function heroName() {
  try {
    const s = JSON.parse(localStorage.getItem('sk_settings') || '{}');
    return typeof s.name === 'string' && s.name.trim() ? s.name.trim() : '';
  } catch { return ''; }
}

export function cleanForSpeech(text) {
  let t = String(text ?? '');
  // Vangnet: als de frontend {HELD} nog niet verving.
  if (t.includes('{HELD}')) t = t.replaceAll('{HELD}', heroName() || 'held');
  t = t.replace(EMOJI_RE, '').replace(/[*_#~`<>|]/g, '').replace(/\s+/g, ' ').trim();
  return t;
}

// iOS kapt lange utterances af: splits in zinnen, en lange zinnen bij komma's.
export function splitSentences(text, max = 160) {
  const parts = String(text).match(/[^.!?…]+(?:[.!?…]+["'”’)]*|$)/g) || [];
  const out = [];
  for (let p of parts) {
    p = p.trim();
    if (!p) continue;
    while (p.length > max) {
      let cut = p.lastIndexOf(',', max);
      if (cut < max * 0.3) cut = p.lastIndexOf(' ', max);
      if (cut <= 0) cut = max;
      out.push(p.slice(0, cut + 1).trim());
      p = p.slice(cut + 1).trim();
    }
    if (p) out.push(p);
  }
  return out;
}

// ------------------------------------------------------------------ clips (vooraf ingesproken)

/** FNV-1a (32 bit) als hex; zelfde functie in tools/voice. */
export function hash(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return (h >>> 0).toString(16).padStart(8, '0');
}
/** Pad van de clip voor een zin: audio/<wie>/<hash>.mp3 */
export const clipPath = (chunk, who) => `audio/${who}/${hash(chunk)}.mp3`;

const hasWindow = typeof window !== 'undefined';
let actx = null;
let clipIndex = null; // Set met 'wie/hash'
let clipIndexLoad = null;
const buffers = new Map(); // pad -> Promise<AudioBuffer>
let currentSource = null;
const misses = hasWindow ? (window.__voiceMiss = window.__voiceMiss || []) : [];

function loadIndex() {
  if (clipIndexLoad) return clipIndexLoad;
  clipIndexLoad = (hasWindow && typeof fetch === 'function'
    ? fetch('audio/index.json').then((r) => (r.ok ? r.json() : { clips: [] })).catch(() => ({ clips: [] }))
    : Promise.resolve({ clips: [] })
  ).then((d) => { clipIndex = new Set(d.clips || []); return clipIndex; });
  return clipIndexLoad;
}
if (hasWindow) loadIndex();

function unlockClips() {
  if (!hasWindow) return;
  try {
    // iOS: WebAudio anders stil bij de stil-schakelaar.
    if (navigator.audioSession) navigator.audioSession.type = 'playback';
  } catch { /* */ }
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    if (!actx) actx = new AC();
    if (actx.state === 'suspended') actx.resume();
    const b = actx.createBuffer(1, 1, 22050);
    const src = actx.createBufferSource();
    src.buffer = b; src.connect(actx.destination); src.start(0);
  } catch { /* */ }
}

function hasClip(chunk, who) {
  return !!(actx && clipIndex && clipIndex.has(`${who}/${hash(chunk)}`));
}

function getBuffer(path) {
  if (!buffers.has(path)) {
    const p = fetch(path)
      .then((r) => { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); })
      .then((ab) => new Promise((res, rej) => actx.decodeAudioData(ab, res, rej)));
    p.catch(() => buffers.delete(path));
    buffers.set(path, p);
    if (buffers.size > 120) buffers.delete(buffers.keys().next().value);
  }
  return buffers.get(path);
}

function playClip(chunk, who, gen) {
  return new Promise((resolve) => {
    getBuffer(clipPath(chunk, who)).then((buf) => {
      if (gen !== generation) return resolve(true);
      if (actx.state === 'suspended') actx.resume();
      const src = actx.createBufferSource();
      src.buffer = buf;
      src.connect(actx.destination);
      let done = false;
      const finish = () => {
        if (done) return; done = true;
        clearTimeout(timer);
        if (currentSource === src) currentSource = null;
        if (pendingResolve === finish) pendingResolve = null;
        resolve(true);
      };
      const timer = setTimeout(finish, buf.duration * 1000 + 1500);
      src.onended = finish;
      currentSource = src;
      pendingResolve = finish;
      src.start(0);
    }).catch(() => resolve(false));
  });
}

/** Haal clips alvast op zonder te decoderen (vult de cache van de service worker). */
export function warm(text, who = 'verteller') {
  if (!clipIndex) return;
  for (const chunk of splitSentences(cleanForSpeech(text))) {
    if (clipIndex.has(`${who}/${hash(chunk)}`)) fetch(clipPath(chunk, who)).catch(() => {});
  }
}

/** Laad alvast de clips voor een tekst (zodat er geen pauze is als hij aan de beurt is). */
export function prefetch(text, who = 'verteller') {
  if (!actx || !clipIndex) return;
  for (const chunk of splitSentences(cleanForSpeech(text))) {
    if (hasClip(chunk, who)) getBuffer(clipPath(chunk, who)).catch(() => {});
  }
}

// ------------------------------------------------------------------ spreken

function speakChunk(chunk, cfg, gen) {
  return new Promise((resolve) => {
    if (gen !== generation) return resolve();
    const u = new SpeechSynthesisUtterance(chunk);
    u.lang = 'nl-NL';
    if (voice) u.voice = voice;
    u.rate = cfg.rate;
    u.pitch = cfg.pitch;
    u.volume = 1;
    keepAlive.add(u);
    let done = false;
    // Veiligheids-timeout: iOS vuurt soms geen 'end'. ~85 ms per teken bij rate 1, plus marge.
    const ms = 2000 + (chunk.length * 85) / cfg.rate;
    const finish = () => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      keepAlive.delete(u);
      if (pendingResolve === finish) pendingResolve = null;
      resolve();
    };
    const timer = setTimeout(finish, ms);
    u.onend = finish;
    u.onerror = finish;
    pendingResolve = finish;
    try {
      synth.speak(u);
      if (synth.paused) synth.resume(); // iOS kan in 'paused' blijven hangen
    } catch { finish(); }
  });
}

/**
 * Lees tekst voor met de stem van een personage. Resolvet als klaar (of afgebroken).
 * @param {string} text
 * @param {string} [who='verteller']
 */
export async function speak(text, who = 'verteller') {
  const clean = cleanForSpeech(text);
  if (!clean) return;
  if (!clipIndex && clipIndexLoad) await Promise.race([clipIndexLoad, new Promise((r) => setTimeout(r, 1500))]);
  const chunks = splitSentences(clean);
  if (chunks.every((c) => hasClip(c, who))) {
    cancel();
    const gen = generation;
    chunks.forEach((c) => getBuffer(clipPath(c, who)).catch(() => {}));
    for (const chunk of chunks) {
      if (gen !== generation) return;
      if (!(await playClip(chunk, who, gen))) await speakTts(chunk, who, gen);
    }
    return;
  }
  chunks.filter((c) => !hasClip(c, who)).forEach((c) => misses.push(`${who}: ${c}`));
  if (!synth || typeof SpeechSynthesisUtterance === 'undefined') return;
  // iOS-bug: eerst cancel(), anders blijft de wachtrij soms hangen.
  const wasBusy = synth.speaking || synth.pending;
  cancel();
  const gen = generation;
  if (!voice) await loadVoices(800);
  if (wasBusy) await new Promise((r) => setTimeout(r, 60)); // iOS heeft even nodig na cancel()
  const cfg = VOICES[who] || VOICES.verteller;
  for (const chunk of chunks) {
    if (gen !== generation) return;
    if (hasClip(chunk, who)) { if (await playClip(chunk, who, gen)) continue; }
    await speakChunk(chunk, cfg, gen);
  }
}

async function speakTts(chunk, who, gen) {
  if (!synth || typeof SpeechSynthesisUtterance === 'undefined') return;
  if (!voice) await loadVoices(800);
  await speakChunk(chunk, VOICES[who] || VOICES.verteller, gen);
}

/** Stop direct met voorlezen; lopende speak()-promises resolven. */
export function cancel() {
  generation++;
  try { synth?.cancel(); } catch { /* negeren */ }
  try { currentSource?.stop(); } catch { /* al gestopt */ }
  currentSource = null;
  const r = pendingResolve;
  pendingResolve = null;
  if (r) r();
}

export function isSpeaking() {
  return !!currentSource || !!(synth && (synth.speaking || synth.pending));
}

// ------------------------------------------------------------------ luisteren

function Recognition() {
  if (typeof window === 'undefined') return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

function isStandalone() {
  try {
    if (navigator.standalone === true) return true;
    return !!window.matchMedia?.('(display-mode: standalone)').matches;
  } catch { return false; }
}

/** true als vasthouden-om-te-praten kan (niet in iOS-standalone-PWA, daar werkt het niet). */
export function canListen() {
  return !!Recognition() && !isStandalone();
}

let rec = null;
let finalText = '';
let interimText = '';
let lastError = '';
let ended = true;
let endWaiters = [];

/** Laatste foutcode van luisteren ('not-allowed', 'no-speech', 'audio-capture', …) of ''. */
export function listenError() {
  return lastError;
}

function flushEnd() {
  ended = true;
  const w = endWaiters;
  endWaiters = [];
  w.forEach((f) => f());
}

/** Begin met luisteren (bij indrukken van de praatknop). */
export function startListening() {
  const R = Recognition();
  lastError = '';
  finalText = '';
  interimText = '';
  if (!R) { lastError = 'unsupported'; return false; }
  cancel(); // niet tegelijk praten en luisteren
  if (rec) { try { rec.abort(); } catch { /* */ } }
  const r = new R();
  rec = r;
  r.lang = 'nl-NL';
  r.interimResults = true;
  r.continuous = true;
  r.maxAlternatives = 3;
  ended = false;
  r.onresult = (e) => {
    if (rec !== r) return;
    let fin = '';
    let int = '';
    for (let i = 0; i < e.results.length; i++) {
      const res = e.results[i];
      let best = res[0];
      for (let j = 1; j < res.length; j++) if ((res[j].confidence || 0) > (best.confidence || 0)) best = res[j];
      if (res.isFinal) fin += ' ' + best.transcript;
      else int += ' ' + best.transcript;
    }
    finalText = fin.trim();
    interimText = int.trim();
  };
  r.onerror = (e) => {
    if (rec !== r) return;
    if (e.error !== 'aborted') lastError = e.error || 'error';
  };
  r.onend = () => { if (rec === r) flushEnd(); };
  try {
    r.start();
    return true;
  } catch {
    lastError = 'start-failed';
    flushEnd();
    return false;
  }
}

/** Stop met luisteren (bij loslaten). Levert de herkende tekst, of '' bij fout/stilte. */
export function stopListening() {
  const r = rec;
  if (!r) return Promise.resolve('');
  return new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      if (rec === r) rec = null;
      const bad = ['not-allowed', 'service-not-allowed', 'no-speech', 'audio-capture', 'unsupported', 'start-failed'];
      const text = (finalText || interimText || '').trim();
      if (bad.includes(lastError) && !(lastError === 'no-speech' && text)) return resolve('');
      resolve(text);
    };
    // Wacht max ~1.5 s op het laatste resultaat / 'end'.
    const timer = setTimeout(() => {
      try { r.abort(); } catch { /* */ }
      finish();
    }, 1500);
    if (ended) return finish();
    endWaiters.push(finish);
    try { r.stop(); } catch { finish(); }
  });
}

export default { unlock, speak, cancel, isSpeaking, canListen, startListening, stopListening, listenError };

/** Naam van de gekozen stem (voor het oudermenu). */
export function voiceName() {
  return voice ? `${voice.name} (${voice.lang})` : 'standaard nl-NL';
}
