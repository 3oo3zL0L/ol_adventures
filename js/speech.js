// Spraak: voorlezen (speechSynthesis) en luisteren (SpeechRecognition) voor iPad/Safari.
// Alles lokaal in de browser; geen netwerk vanuit deze module.

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
  if (!synth || typeof SpeechSynthesisUtterance === 'undefined') return;
  const clean = cleanForSpeech(text);
  if (!clean) return;
  // iOS-bug: eerst cancel(), anders blijft de wachtrij soms hangen.
  const wasBusy = synth.speaking || synth.pending;
  cancel();
  const gen = generation;
  if (!voice) await loadVoices(800);
  if (wasBusy) await new Promise((r) => setTimeout(r, 60)); // iOS heeft even nodig na cancel()
  const cfg = VOICES[who] || VOICES.verteller;
  for (const chunk of splitSentences(clean)) {
    if (gen !== generation) return;
    await speakChunk(chunk, cfg, gen);
  }
}

/** Stop direct met voorlezen; lopende speak()-promises resolven. */
export function cancel() {
  generation++;
  try { synth?.cancel(); } catch { /* negeren */ }
  const r = pendingResolve;
  pendingResolve = null;
  if (r) r();
}

export function isSpeaking() {
  return !!(synth && (synth.speaking || synth.pending));
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
