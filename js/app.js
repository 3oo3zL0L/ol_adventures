import { background, character, CHAR_NAMES } from './art.js';
import { sfx } from './sfx.js';
import * as speech from './speech.js';
import { answer } from './brain.js';
import { GAMES, h, wait, shuffle } from './games.js';

// ---------- opslag (alleen lokaal op dit apparaat) ----------
const store = {
  get(k, def) { try { const v = localStorage.getItem(k); return v ? { ...def, ...JSON.parse(v) } : { ...def }; } catch { return { ...def }; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* privémodus: dan maar niet bewaren */ } },
};
const SKILLS = ['tellen', 'rekenen', 'woorden', 'geheugen', 'logica', 'ruimte'];
const DEF_SETTINGS = { name: '', pin: '', minutes: 20, difficulty: 'auto', talk: 'auto', volume: 0.8, music: true, allOpen: false };
const DEF_PROGRESS = {
  unlocked: 1, done: [], stars: 0, stickers: {}, resume: null,
  levels: Object.fromEntries(SKILLS.map((s) => [s, 1])), streak: {},
};
let settings = store.get('sk_settings', DEF_SETTINGS);
let progress = store.get('sk_progress', DEF_PROGRESS);
const saveSettings = () => store.set('sk_settings', settings);
const saveProgress = () => store.set('sk_progress', progress);

const CHAPTERS = [
  { n: 1, title: 'De Geheime Hut', icon: '🏕️' },
  { n: 2, title: 'Het Reuzenbos', icon: '🌲' },
  { n: 3, title: 'De Kleine Kapitein', icon: '⛵' },
  { n: 4, title: 'Het Ruimteschip', icon: '🚀' },
  { n: 5, title: 'De Grote Kartrace', icon: '🏁' },
];

// ---------- dom ----------
const $ = (id) => document.getElementById(id);
const bgEl = $('bg'), charsEl = $('chars'), ui = $('ui'), hud = $('hud'), overlay = $('overlay'), app = $('app');
const fill = (t = '') => String(t).replaceAll('{HELD}', settings.name || 'jij');
const labelOverride = {};
const nameOf = (who) => fill(labelOverride[who] ?? CHAR_NAMES?.[who] ?? who);
const clearUI = () => { ui.replaceChildren(); };

function safe(fn, fallback = '') { try { return fn() ?? fallback; } catch (e) { console.warn(e); return fallback; } }

let currentBg = null;
async function setBg(id) {
  if (id === currentBg) return;
  currentBg = id;
  bgEl.classList.add('fade');
  await wait(200);
  bgEl.innerHTML = safe(() => background(id));
  bgEl.classList.remove('fade');
}

// Personages: posities afhankelijk van het aantal op het scherm.
const SLOTS = { 1: [14], 2: [8, 66], 3: [4, 36, 68], 4: [2, 26, 50, 74] };
const SIZE = { brom: 'big', schoen: 'huge', raket: 'big', boot: 'big' };
let onStage = [];
function setChars(ids = []) {
  const pos = SLOTS[Math.min(ids.length, 4)] || [];
  const keep = new Map([...charsEl.children].map((el) => [el.dataset.id, el]));
  const next = ids.slice(0, 4).map((id, i) => {
    let el = keep.get(id);
    if (el) keep.delete(id);
    else {
      el = h('div', { class: `char enter ${SIZE[id] || ''}`, 'data-id': id });
      el.innerHTML = safe(() => character(id, 'blij'));
      charsEl.append(el);
      requestAnimationFrame(() => requestAnimationFrame(() => el.classList.remove('enter')));
    }
    el.style.left = `${pos[i]}%`;
    return el;
  });
  for (const el of keep.values()) { el.classList.add('enter'); setTimeout(() => el.remove(), 450); }
  onStage = next;
}
function setTalking(who, mood) {
  for (const el of onStage) {
    const me = el.dataset.id === who;
    el.classList.toggle('talking', me);
    el.classList.toggle('dim', who !== 'verteller' && !me && onStage.some((x) => x.dataset.id === who));
    if (me && mood && el.dataset.mood !== mood) { el.dataset.mood = mood; el.innerHTML = safe(() => character(who, mood)); }
  }
}
const stopTalking = () => onStage.forEach((el) => el.classList.remove('talking', 'dim'));

// ---------- spreken + tekstballon ----------
let bubbleEl = null;
function showBubble(who, text) {
  bubbleEl?.remove();
  const isNarrator = !who || who === 'verteller';
  const replay = h('button', { class: 'replay', 'aria-label': 'Nog eens' }, '🔊');
  bubbleEl = h('div', { class: `bubble ${isNarrator ? 'verteller' : ''}` },
    h('span', { class: 'who' }, isNarrator ? '📖' : nameOf(who)), fill(text), replay);
  replay.addEventListener('click', (e) => { e.stopPropagation(); sfx.play('tap'); say(who, text, { bubble: false }); });
  ui.append(bubbleEl);
}
async function say(who, text, { bubble = true, mood } = {}) {
  if (bubble) showBubble(who, text);
  setTalking(who, mood);
  try { await speech.speak(fill(text), who || 'verteller'); } catch { /* geen stem: gewoon doorgaan */ }
  stopTalking();
}
// Korte uitspraak van de verteller zonder ballon (tijdens games).
const narrate = (text, who = 'verteller') => speech.speak(fill(text), who).catch(() => {});

function nextButton() {
  return new Promise((resolve) => {
    const b = h('button', { class: 'btn next', 'aria-label': 'Verder' }, '▶');
    b.addEventListener('click', () => { sfx.play('tap'); speech.cancel(); b.remove(); resolve(); });
    ui.append(b);
  });
}

// ---------- HUD ----------
function renderHud(mode) {
  hud.replaceChildren();
  if (mode === 'play') {
    const home = h('button', { class: 'pill icon', 'aria-label': 'Naar de kaart' }, '🏠');
    home.addEventListener('click', () => { sfx.play('tap'); speech.cancel(); runId++; showMap(); });
    hud.append(home);
  }
  hud.append(h('div', { class: 'pill', id: 'starpill' }, '⭐', String(progress.stars)));
  hud.append(parentButton());
}
function bumpStars(n = 1) {
  progress.stars += n; saveProgress();
  const p = $('starpill'); if (p) p.lastChild.textContent = String(progress.stars);
  const s = h('div', { class: 'starfly', style: `left:45vw;top:40vh` }, '⭐');
  app.append(s); setTimeout(() => s.remove(), 1200);
  sfx.play('ster');
}
function confetti() {
  const bits = ['⭐', '🎉', '✨', '🌟', '🎊'];
  for (let i = 0; i < 26; i++) {
    const c = h('div', { class: 'confetti', style: `left:${Math.random() * 100}vw;animation-delay:${Math.random() * .8}s` }, bits[i % bits.length]);
    app.append(c); setTimeout(() => c.remove(), 3500);
  }
}

// Ouderknop: 1,5 seconde vasthouden, dan PIN.
function parentButton() {
  const b = h('button', { class: 'pill icon hold', 'aria-label': 'Voor ouders (vasthouden)' }, '⚙️');
  let t = null, start = 0, raf = 0;
  const reset = () => { clearTimeout(t); cancelAnimationFrame(raf); b.style.setProperty('--p', '0%'); };
  const tick = () => { b.style.setProperty('--p', `${Math.min(100, (Date.now() - start) / 15)}%`); raf = requestAnimationFrame(tick); };
  b.addEventListener('pointerdown', (e) => { e.preventDefault(); start = Date.now(); tick(); t = setTimeout(() => { reset(); pinGate().then((ok) => ok && parentMenu()); }, 1500); });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => b.addEventListener(ev, reset));
  b.addEventListener('contextmenu', (e) => e.preventDefault());
  return b;
}

// ---------- PIN ----------
let pinFails = 0, pinBlockedUntil = 0;
function pinGate(title = 'Voor ouders: PIN') {
  return new Promise((resolve) => {
    let entry = '';
    const dots = h('div', { class: 'pindots' }, '○○○○');
    const pad = h('div', { class: 'pinpad' });
    const close = (ok) => { overlay.replaceChildren(); resolve(ok); };
    const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '✕', '0', '⌫'];
    for (const k of keys) {
      const b = h('button', { class: 'tile num sm' }, k);
      b.addEventListener('click', () => {
        sfx.play('tap');
        if (k === '✕') return close(false);
        if (Date.now() < pinBlockedUntil) { dots.textContent = '⏳'; return; }
        if (k === '⌫') entry = entry.slice(0, -1); else if (entry.length < 4) entry += k;
        dots.textContent = '●'.repeat(entry.length) + '○'.repeat(4 - entry.length);
        if (entry.length === 4) {
          if (entry === settings.pin) { pinFails = 0; close(true); }
          else {
            if (++pinFails >= 3) { pinBlockedUntil = Date.now() + 30000; pinFails = 0; } sfx.play('fout'); dots.classList.add('shake'); setTimeout(() => { dots.classList.remove('shake'); entry = ''; dots.textContent = '○○○○'; }, 500); }
        }
      });
      pad.append(b);
    }
    overlay.replaceChildren(h('div', { class: 'card', style: 'width:min(70vw,520px);align-items:center' }, h('h2', {}, title), dots, pad));
  });
}

// ---------- ouder-instellingen ----------
function settingsForm({ first = false } = {}) {
  const name = h('input', { value: settings.name, maxlength: 20, autocomplete: 'off', placeholder: 'Voornaam' });
  const pin = h('input', { value: '', inputmode: 'numeric', maxlength: 4, pattern: '[0-9]*', placeholder: first ? '4 cijfers' : '(laat leeg = zelfde)' });
  const minutes = h('select', {}, ...[10, 15, 20, 30, 45, 60].map((m) => h('option', { value: m, selected: +settings.minutes === m }, `${m} minuten`)));
  const diff = h('select', {}, ...[['auto', 'Past zich aan (aanrader)'], ['1', 'Makkelijk'], ['2', 'Gemiddeld'], ['3', 'Moeilijk']].map(([v, l]) => h('option', { value: v, selected: settings.difficulty === v }, l)));
  const talk = h('select', {}, ...[['auto', 'Automatisch'], ['mic', 'Microfoonknop (Safari)'], ['dictate', 'Toetsenbord-dicteren'], ['buttons', 'Alleen tikknoppen']].map(([v, l]) => h('option', { value: v, selected: settings.talk === v }, l)));
  const vol = h('input', { type: 'range', min: 0, max: 1, step: 0.1, value: settings.volume });
  const music = h('input', { type: 'checkbox', checked: settings.music });
  const allOpen = h('input', { type: 'checkbox', checked: settings.allOpen });
  const err = h('div', { class: 'muted', style: 'color:#c0392b' });
  return {
    fields: [
      h('label', {}, 'Naam van de held', name),
      h('label', {}, first ? 'Kies een ouder-PIN' : 'Nieuwe PIN', pin),
      h('label', {}, 'Speeltijd per keer', minutes),
      h('label', {}, 'Moeilijkheid', diff),
      ...(first ? [] : [h('label', {}, 'Praten', talk), h('label', {}, 'Geluid', vol), h('label', {}, 'Muziekje', music), h('label', {}, 'Alle hoofdstukken open', allOpen)]),
      err,
    ],
    read() {
      const n = name.value.trim().replace(/[^\p{L} '-]/gu, '').slice(0, 20);
      const p = pin.value.trim();
      if (!n) { err.textContent = 'Vul een naam in.'; return null; }
      if ((first || p) && !/^\d{4}$/.test(p)) { err.textContent = 'De PIN moet 4 cijfers zijn.'; return null; }
      return { name: n, pin: p || settings.pin, minutes: +minutes.value, difficulty: diff.value, talk: talk.value, volume: +vol.value, music: music.checked, allOpen: allOpen.checked };
    },
  };
}

function firstRun() {
  return new Promise((resolve) => {
    const f = settingsForm({ first: true });
    const go = h('button', { class: 'btn go' }, 'Opslaan en beginnen');
    go.addEventListener('click', () => {
      const v = f.read(); if (!v) return;
      settings = { ...settings, ...v }; saveSettings(); overlay.replaceChildren(); resolve();
    });
    overlay.replaceChildren(h('div', { class: 'card' },
      h('h1', {}, '👋 Welkom, ouder!'),
      h('p', { class: 'muted' }, 'Deze instellingen blijven alleen op deze iPad. Er wordt niets verstuurd en niets bijgehouden. Tip: open in Safari en kies Deel → "Zet op beginscherm". Spraak werkt het best in Safari zelf.'),
      ...f.fields, go));
  });
}

function parentMenu() {
  const f = settingsForm();
  const save = h('button', { class: 'btn go' }, 'Opslaan');
  const testVoice = h('button', { class: 'btn white' }, '🔊 Test stem');
  const unlock = h('button', { class: 'btn white' }, '⏱️ Nieuwe speeltijd starten');
  const reset = h('button', { class: 'btn berry' }, 'Voortgang wissen');
  const wipe = h('button', { class: 'btn berry' }, '🔄 Alles opnieuw (nieuwe naam)');
  const close = h('button', { class: 'btn white' }, 'Sluiten');
  const info = h('p', { class: 'muted' },
    `Stem: ingesproken clips (${settings.name === 'Olivier' ? 'met naam' : 'naam via iPad-stem'}), reserve: ${speech.voiceName?.() || 'standaard'} · Microfoon: ${speech.canListen() ? 'beschikbaar' : 'niet beschikbaar hier (gebruik dicteren of knoppen)'} · Gespeeld: ${Math.round(playMs / 60000)} min`);
  save.addEventListener('click', () => {
    const v = f.read(); if (!v) return;
    settings = { ...settings, ...v }; saveSettings(); sfx.volume = settings.volume; sfx.music(settings.music && inPlay);
    overlay.replaceChildren(); renderHud(inPlay ? 'play' : 'map'); if (!inPlay) showMap();
  });
  testVoice.addEventListener('click', () => speech.speak(`Hallo ${settings.name}! Klaar voor avontuur?`, 'kwebbel'));
  unlock.addEventListener('click', () => { resetPlayTime(); lockUntil(0); overlay.replaceChildren(); showMap(); });
  reset.addEventListener('click', () => {
    if (!confirm('Alle sterren, stickers en voortgang wissen?')) return;
    progress = structuredClone(DEF_PROGRESS); saveProgress(); overlay.replaceChildren(); showMap();
  });
  wipe.addEventListener('click', () => {
    if (!confirm('Alles wissen: naam, PIN, instellingen, sterren en voortgang? Daarna begint het spel helemaal opnieuw.')) return;
    try { ['sk_settings', 'sk_progress', 'sk_lock', 'sk_time'].forEach((k) => localStorage.removeItem(k)); } catch {}
    location.reload();
  });
  close.addEventListener('click', () => overlay.replaceChildren());
  overlay.replaceChildren(h('div', { class: 'card' }, h('h2', {}, '⚙️ Voor ouders'), info, ...f.fields,
    h('div', { class: 'row' }, save, testVoice, unlock, reset, wipe, close)));
}

// ---------- speeltijd ----------
const TIME_KEY = 'sk_time', SESSION_GAP = 60 * 60000;
let playMs = 0, lastTick = Date.now(), inPlay = false, lastPlay = 0;
try { const t = JSON.parse(localStorage.getItem(TIME_KEY) || '{}'); if (Date.now() - (t.last || 0) < SESSION_GAP) { playMs = t.ms || 0; lastPlay = t.last; } } catch {}
setInterval(() => {
  const now = Date.now();
  if (inPlay && document.visibilityState === 'visible') {
    playMs += now - lastTick; lastPlay = now;
    try { localStorage.setItem(TIME_KEY, JSON.stringify({ ms: playMs, last: now })); } catch {}
  }
  lastTick = now;
}, 1000);
const resetPlayTime = () => { playMs = 0; try { localStorage.removeItem(TIME_KEY); } catch {} };
const LOCK_KEY = 'sk_lock';
const lockUntil = (t) => { try { localStorage.setItem(LOCK_KEY, String(t)); } catch {} };
const lockedUntil = () => { try { return +localStorage.getItem(LOCK_KEY) || 0; } catch { return 0; } };
const timeUp = () => playMs >= settings.minutes * 60000;

async function restScreen() {
  inPlay = false; sfx.music(false);
  if (lockedUntil() < Date.now()) lockUntil(Date.now() + 60 * 60000);
  clearUI(); await setBg('nacht'); setChars(['kwebbel']); renderHud('rest');
  const again = h('button', { class: 'btn white' }, '🔒 Ouder: verder spelen');
  again.addEventListener('click', async () => { if (await pinGate()) { resetPlayTime(); lockUntil(0); showMap(); } });
  ui.append(h('div', { class: 'title-screen' }, h('div', { class: 'logo' }, '🌙 Rustpauze', h('small', {}, 'Het avontuur wacht op je!')), again));
  await say('kwebbel', 'Gaap… tijd om uit te rusten, dat vind ik fijn. Straks weer avontuur, dan zal het nog leuker zijn!', { mood: 'blij' });
}

// ---------- adaptieve moeilijkheid ----------
function levelFor(skill) {
  if (settings.difficulty !== 'auto') return +settings.difficulty;
  return progress.levels[skill] || 1;
}
function recordResult(skill, mistakes) {
  if (!skill || settings.difficulty !== 'auto') return;
  const s = (progress.streak[skill] ||= { good: 0, bad: 0 });
  let lv = progress.levels[skill] || 1;
  if (mistakes === 0) { s.good++; s.bad = 0; if (s.good >= 2 && lv < 3) { lv++; s.good = 0; } }
  else if (mistakes >= 2) { s.bad++; s.good = 0; if ((s.bad >= 2 || mistakes >= 4) && lv > 1) { lv--; s.bad = 0; } }
  progress.levels[skill] = lv; saveProgress();
}

// ---------- stappen ----------
const gameCtx = (step) => ({ root: ui, speak: narrate, sfx, hintText: fill(step.hint) });

async function runChoice(step) {
  const p = h('div', { class: 'panel' }, h('h2', {}, fill(step.q)));
  const row = h('div', { class: 'row' });
  p.append(row); ui.append(p);
  const chosen = new Promise((resolve) => {
    for (const o of step.options) {
      const b = h('button', { class: 'tile' }, o.icon || '⭐', h('span', { class: 'lbl' }, fill(o.label)));
      b.addEventListener('click', () => { sfx.play('tap'); speech.cancel(); resolve(o); });
      row.append(b);
    }
  });
  (async () => { await narrate(step.q); for (const o of step.options) await narrate(o.label); })();
  const o = await chosen;
  speech.cancel(); p.remove();
  if (o.say) await say('verteller', o.say);
}

async function runGame(step) {
  const game = GAMES[step.game];
  if (!game) return;
  const lv = levelFor(step.skill);
  const params = step.params?.[lv] || step.params?.[1] || step.params || {};
  if (step.intro) { showBubble('verteller', step.intro); await narrate(step.intro); }
  const res = await game(params, gameCtx(step));
  recordResult(step.skill, res?.mistakes ?? 0);
  bumpStars(1);
  await wait(500);
  clearUI();
  if (step.success) await say('verteller', step.success);
}

async function runTalk(step) {
  const who = step.who;
  const brainState = { asked: 0, misses: 0, used: new Set() };
  const mode = settings.talk === 'auto' ? (speech.canListen() ? 'mic' : 'dictate') : settings.talk;
  const others = onStage.map((el) => el.dataset.id);
  if (step.label) labelOverride[who] = step.label;
  setChars([step.char || who]);
  if (step.char) onStage[0].dataset.id = who; // praat-animatie volgt de spreker
  if (step.intro) await say(who, step.intro);

  const p = h('div', { class: 'panel', style: 'top:auto;bottom:2.5vh;transform:translateX(-50%);left:62%;width:min(68vw,900px);max-height:74vh;overflow:auto;gap:1.6vmin' });
  const heard = h('div', { class: 'heard' });
  const know = h('button', { class: 'btn go', disabled: true }, '💡 Ik weet het!');
  const qbtns = h('div', { class: 'qbtns' });
  let busy = false, resolveWin;
  const won = new Promise((r) => (resolveWin = r));

  async function ask(q, fromKid) {
    if (busy || !q.trim()) return;
    busy = true;
    try {
      let res = {};
      try { res = answer(step, q, brainState) || {}; } catch (e) { console.warn(e); }
      const hide = ['safety', 'private', 'rude'].includes(res.kind);
      heard.textContent = fromKid && !hide ? `“${q}”` : '';
      if (!hide) showBubble('held', q);
      if (!fromKid) await narrate(q, 'held');
      brainState.asked++;
      if (res.solvedGuess) return win();
      await say(who, res.reply || 'Hmm, goeie vraag! Wat denk jij zelf?');
      if (brainState.asked >= (step.minQuestions ?? 2)) { know.disabled = false; know.classList.add('pulse'); }
    } finally { busy = false; }
  }
  async function win() {
    sfx.play('goed'); confetti();
    await say(who, step.win || 'Goed geraden!', { mood: 'lacht' });
    resolveWin();
  }

  // Invoer: microfoon, dicteren of alleen knoppen.
  let input = null;
  if (mode === 'mic') {
    const mic = h('button', { class: 'mic', 'aria-label': 'Houd vast om te praten' }, '🎤');
    let listening = false, autoStop = 0;
    const start = async (e) => {
      e.preventDefault(); if (busy || listening) return;
      listening = true; speech.cancel(); mic.classList.add('on'); heard.textContent = '… ik luister …';
      try { mic.setPointerCapture?.(e.pointerId); } catch {}
      try { speech.startListening(); } catch {}
      clearTimeout(autoStop); autoStop = setTimeout(stop, 10000);
    };
    const stop = async () => {
      clearTimeout(autoStop);
      if (!listening) return; listening = false; mic.classList.remove('on'); mic.classList.add('busy');
      let text = '';
      try { text = await speech.stopListening(); } catch {}
      mic.classList.remove('busy');
      if (text) return ask(text, true);
      heard.textContent = '';
      const err = speech.listenError?.();
      await narrate(err === 'not-allowed' || err === 'service-not-allowed'
        ? 'Ik mag de microfoon nog niet gebruiken. Vraag papa of mama even om hulp. Je kunt ook op de knoppen tikken!'
        : 'Ik hoorde je niet goed. Hou de knop ingedrukt terwijl je praat, en laat dan los.');
    };
    mic.addEventListener('pointerdown', start);
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach((ev) => mic.addEventListener(ev, stop));
    mic.addEventListener('contextmenu', (e) => e.preventDefault());
    input = h('div', { class: 'row' }, mic, h('div', { class: 'muted', style: 'font-size:2.6vmin;max-width:26vmin' }, 'Houd vast en stel je vraag!'));
  } else if (mode === 'dictate') {
    const field = h('input', { type: 'text', placeholder: 'Tik hier, dan op 🎤 van het toetsenbord', enterkeyhint: 'send', autocomplete: 'off', autocorrect: 'off' });
    const send = h('button', { class: 'btn lake' }, 'Vraag!');
    const go = () => { const v = field.value; field.value = ''; field.blur(); ask(v, true); };
    send.addEventListener('click', go);
    field.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); go(); } });
    input = h('div', { class: 'dictate' }, field, send);
  }

  // Maximaal 3 vraagknoppen tegelijk (past op het scherm); een gebruikte maakt plaats voor de volgende.
  const pending = [...(step.fallbackQs || [])];
  const fillQs = () => { while (qbtns.children.length < 3 && pending.length) qbtns.append(qButton(pending.shift())); };
  const qButton = (fq) => {
    const b = h('button', { class: 'btn' }, fill(fq.q));
    b.addEventListener('click', async () => {
      if (busy) return; sfx.play('tap'); b.remove(); fillQs();
      busy = true;
      try {
        showBubble('held', fq.q); await narrate(fq.q, 'held');
        brainState.asked++;
        await say(who, fq.a);
        if (brainState.asked >= (step.minQuestions ?? 2)) know.disabled = false;
      } finally { busy = false; }
    });
    return b;
  };
  fillQs();

  know.addEventListener('click', () => {
    if (busy) return; sfx.play('tap'); speech.cancel();
    const row = h('div', { class: 'row' });
    row.style.paddingBottom = '4.5vmin';
    const box = h('div', { class: 'panel' }, h('h2', {}, fill(step.ask || 'Wat is het?')), row);
    box.dataset.answer = (step.answers || []).find((a) => a.correct)?.pic || '';
    for (const a of shuffle(step.answers || [])) {
      const b = h('button', { class: 'tile' }, a.pic, h('span', { class: 'lbl' }, fill(a.label)));
      b.addEventListener('click', async () => {
        if (busy) return; busy = true; sfx.play('tap');
        try {
          if (a.correct) { box.remove(); await win(); }
          else {
            b.classList.add('bad'); sfx.play('fout');
            await say(who, step.wrongGuess || 'Nee, dat is het niet. Stel nog een vraag!');
            box.remove();
          }
        } finally { busy = false; }
      });
      row.append(b);
    }
    const back = h('button', { class: 'btn white' }, '↩ Nog een vraag stellen');
    back.addEventListener('click', () => { sfx.play('tap'); box.remove(); });
    box.append(back); ui.append(box);
    narrate(step.ask || 'Wat is het?');
  });

  p.append(h('h2', {}, fill(step.ask || 'Stel een vraag!')));
  if (input) p.append(input, heard);
  p.append(qbtns, know);
  ui.append(p);
  narrate(mode === 'mic' ? 'Stel je vraag! Hou de rode knop vast terwijl je praat. Of tik op een vraag.' :
    mode === 'dictate' ? 'Stel je vraag! Tik op het witte vak en praat via het toetsenbord. Of tik op een vraag.' : 'Tik op een vraag!');

  await won;
  delete labelOverride[who];
  p.remove(); clearUI();
  setChars(others.includes(who) || step.char ? others : [...others, who]);
}

async function runReward(step) {
  sfx.play('fanfare'); confetti();
  const ch = currentChapter;
  progress.stickers[`h${ch}`] = step.sticker || '⭐';
  bumpStars(step.stars || 1);
  saveProgress();
  const p = h('div', { class: 'panel' }, h('div', { class: 'bigpic' }, step.sticker || '⭐'), h('h2', {}, 'Nieuwe sticker!'));
  ui.append(p);
  await say('verteller', step.text || 'Goed gedaan!');
  await nextButton();
  p.remove();
}

async function runCliff(step) {
  if (!step.end) { sfx.play('dreun'); app.classList.add('shake'); setTimeout(() => app.classList.remove('shake'), 600); }
  if (step.end) { /* feestelijk einde: decor blijft */ }
  else if (step.char || step.chars) setChars(step.chars || [...onStage.map((e) => e.dataset.id), step.char]);
  else if (!onStage.some((e) => e.dataset.id === 'schoen')) setChars([...onStage.map((e) => e.dataset.id).slice(0, 2), 'schoen']);
  await say('verteller', step.text);
  const c = h('div', { class: 'cliff' }, h('div', { class: 'vervolg' }, step.end ? '🏆 Einde! 🏆' : 'Wordt vervolgd…'));
  if (step.end) { confetti(); sfx.play('fanfare'); }
  ui.append(c);
  if (!step.end) sfx.play('dreun');
  await wait(1200);
  await nextButton();
}

async function runStep(step) {
  if (step.sfx && step.t !== 'cliff') sfx.play(step.sfx);
  switch (step.t) {
    case 'scene': await setBg(step.bg); setChars(step.chars || []); await wait(300); return;
    case 'say': showBubble(step.who, step.text); { const done = say(step.who, step.text, { bubble: false, mood: step.mood }); await Promise.race([done, wait(2200)]); await nextButton(); } return;
    case 'choice': return runChoice(step);
    case 'game': return runGame(step);
    case 'talk': return runTalk(step);
    case 'reward': return runReward(step);
    case 'cliff': return runCliff(step);
    default: console.warn('onbekende stap', step);
  }
}

// ---------- hoofdstuk spelen ----------
let currentChapter = 1, runId = 0;
async function playChapter(n) {
  if (lockedUntil() > Date.now() || timeUp()) return restScreen();
  let mod;
  try { mod = await import(`./story/h${n}.js`); } catch { return comingSoon(n); }
  const steps = mod.default.steps;
  const run = ++runId;
  currentChapter = n; inPlay = true;
  sfx.music(settings.music);
  renderHud('play'); clearUI();
  warmChapter(steps);
  let start = progress.resume?.ch === n ? progress.resume.step : 0;
  if (start >= steps.length) start = 0;
  // Herstel het decor van de laatste scene vóór het hervatpunt.
  const lastScene = steps.slice(0, start + 1).reverse().find((s) => s.t === 'scene') || steps.find((s) => s.t === 'scene');
  if (lastScene) { await setBg(lastScene.bg); setChars(lastScene.chars || []); }
  for (let i = start; i < steps.length; i++) {
    if (run !== runId) return;
    progress.resume = { ch: n, step: i }; saveProgress();
    if (timeUp() && steps[i].t !== 'game' && steps[i].t !== 'talk') return restScreen();
    const nx = steps[i + 1];
    if (nx?.t === 'say') speech.prefetch?.(fill(nx.text), nx.who);
    await runStep(steps[i]);
    if (run !== runId) return;
    if (steps[i].t !== 'say') bubbleEl?.remove();
  }
  progress.resume = null;
  if (!progress.done.includes(n)) progress.done.push(n);
  progress.unlocked = Math.max(progress.unlocked, n + 1);
  saveProgress();
  inPlay = false; sfx.music(false);
  showMap();
}

// Laad alle clips van dit hoofdstuk rustig op de achtergrond (sneller en offline via de service worker).
function warmChapter(steps) {
  const items = [];
  for (const s of steps) {
    if (s.t === 'say') items.push([s.text, s.who]);
    if (s.t === 'game') items.push([s.intro, 'verteller'], [s.success, 'verteller']);
    if (s.t === 'talk') items.push([s.intro, s.who], [s.win, s.who], ...(s.fallbackQs || []).map((q) => [q.a, s.who]));
    if (s.t === 'reward' || s.t === 'cliff') items.push([s.text, 'verteller']);
  }
  let i = 0;
  const next = () => { if (i >= items.length) return; const [t, w] = items[i++]; if (t) speech.warm?.(fill(t), w); setTimeout(next, 150); };
  setTimeout(next, 1500);
}

async function comingSoon(n) {
  clearUI(); await setBg('nacht'); setChars(['kwebbel']);
  await say('kwebbel', 'Dit avontuur wordt nog geschreven, het is nog niet klaar. Kom snel terug, dan staat het voor je paraat!');
  showMap();
}

// ---------- schermen ----------
function showSticker() {
  const grid = h('div', { class: 'stickers' }, ...CHAPTERS.map((c) => h('div', { class: progress.stickers[`h${c.n}`] ? '' : 'empty' }, progress.stickers[`h${c.n}`] || c.icon)));
  const close = h('button', { class: 'btn go' }, 'Terug');
  close.addEventListener('click', () => { sfx.play('tap'); overlay.replaceChildren(); });
  overlay.replaceChildren(h('div', { class: 'card', style: 'align-items:center' }, h('h2', {}, `🏅 Stickerboek · ⭐ ${progress.stars}`), grid, close));
  narrate('Kijk eens hoeveel sterren je al hebt verzameld!');
}

async function showMap() {
  inPlay = false; runId++; sfx.music(false); speech.cancel();
  if (lockedUntil() > Date.now()) return restScreen();
  clearUI(); bubbleEl = null; await setBg('titel'); setChars([]); renderHud('map');
  const row = h('div', { class: 'chapters' });
  const current = Math.min(progress.unlocked, 5);
  for (const c of CHAPTERS) {
    const open = settings.allOpen || c.n <= progress.unlocked;
    const done = progress.done.includes(c.n);
    const el = h('button', { class: `chap ${!open ? 'locked' : done ? 'done' : c.n === current ? 'current' : ''}` },
      h('div', { class: 'n' }, open ? c.icon : '🔒'), `${c.n}. ${c.title}`, done ? '⭐' : '');
    el.addEventListener('click', () => {
      sfx.play('tap');
      if (!open) return narrate('Dit hoofdstuk is nog op slot. Speel eerst het vorige avontuur!');
      playChapter(c.n);
    });
    row.append(el);
  }
  const sticker = h('button', { class: 'btn white' }, '🏅 Stickerboek');
  sticker.addEventListener('click', () => { sfx.play('tap'); showSticker(); });
  ui.append(h('div', { class: 'title-screen' }, h('div', { class: 'logo' }, 'Het Sterrenkompas', h('small', {}, `De avonturen van ${settings.name}`)), row, sticker));
}

async function titleScreen() {
  await setBg('titel');
  const play = h('button', { class: 'btn go', style: 'font-size:6vmin;padding:2.4vmin 7vmin' }, '▶ Spelen');
  ui.append(h('div', { class: 'title-screen' }, h('div', { class: 'logo' }, 'Het Sterrenkompas', h('small', {}, 'Een avontuur in Oisterwijk')), play));
  renderHud('title');
  await new Promise((r) => play.addEventListener('click', () => {
    // iOS: audio en spraak moeten binnen de tik zelf worden vrijgegeven.
    try { speech.unlock(); } catch {}
    try { sfx.unlock(); sfx.volume = settings.volume; sfx.play('tap'); } catch {}
    r();
  }, { once: true }));
  if (!settings.name || !settings.pin) await firstRun();
  await showMap();
  narrate(`Hoi ${settings.name}! Kies een avontuur.`, 'kwebbel');
}

// ---------- start ----------
if ('serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
document.addEventListener('visibilitychange', () => { if (document.hidden) { speech.cancel(); sfx.music(false); } else if (inPlay) sfx.music(settings.music); });
document.addEventListener('gesturestart', (e) => e.preventDefault());
window.__sk = { settings: () => settings, progress: () => progress, setPlayMs: (v) => (playMs = v) }; // voor tests
titleScreen();
