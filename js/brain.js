// Lokaal "personagebrein" voor praatpuzzels (t:'talk').
// Geen netwerk, geen API: trefwoordherkenning met eenvoudige NL-stemming en fuzzy matching
// (spraakherkenning maakt fouten). Onthoudt alleen iets in het meegegeven `state`-object
// (sessie, per talk-stap); schrijft niets weg.
//
// answer(talkStep, question, state) -> { reply, matched, solvedGuess, kind }
//   talkStep: { intents:[{id, keys:[...], a, a2?}], secretKeys:[...], win, wrongGuess, guessKeys?,
//               answers?:[{label, correct, guessKeys?}], hints:[...], smalltalk?, fallbackQs? }
//   state:    leeg object {} per talk-stap; brain houdt hier tellers bij.
//   kind:     'intent'|'secret'|'wrong'|'smalltalk'|'fallback'|'hint'|'safety'|'private'|'sad'|'empty'
// `{HELD}` in replies laat het brein staan; de frontend vervangt die.

// ------------------------------------------------------------------ normaliseren

export function normalize(s) {
  return String(s ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[’'`]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Eenvoudige NL-stemming: verkleinwoord (-tjes/-jes/-tje/-je), meervoud (-en/-s), dubbele medeklinker.
export function stem(w) {
  let s = w;
  if (s.length <= 3 || /^\d+$/.test(s)) return s;
  for (const suf of ['etjes', 'etje', 'tjes', 'pjes', 'jes', 'tje', 'pje', 'je']) {
    if (s.endsWith(suf) && s.length - suf.length >= 3) { s = s.slice(0, -suf.length); break; }
  }
  if (s === w) {
    if (s.endsWith('en') && s.length - 2 >= 3) s = s.slice(0, -2);
    else if (s.endsWith('s') && !s.endsWith('ss') && s.length - 1 >= 3) s = s.slice(0, -1);
  }
  // dubbele medeklinker aan het eind: katt -> kat, mess -> mes
  if (s.length >= 3 && s[s.length - 1] === s[s.length - 2] && !/[aeiou]/.test(s[s.length - 1])) s = s.slice(0, -1);
  return s;
}

// Vulwoorden die niets zeggen over de inhoud ('is het', 'kan het', …).
const FILLER = new Set([
  'is', 'het', 'kan', 'kun', 'kunt', 'je', 'jij', 'u', 'een', 'de', 'dat', 'die', 'dit', 'deze', 'er', 'ie',
  'ik', 'mag', 'heb', 'hebt', 'heeft', 'zit', 'zitten', 'was', 'wordt', 'ben', 'bent', 'zijn', 'ook', 'nou',
  'eh', 'uh', 'hm', 'hmm', 'dan', 'toch', 'eens', 'even', 'misschien', 'ofzo', 'zo', 'hè', 'he', 'hoor',
  'en', 'of', 'maar', 'wel', 'nog', 'jouw', 'je', 'mijn', 'in', 'op', 'aan', 'met', 'van', 'te',
]);

function tokenize(s) {
  const raw = normalize(s).split(' ').filter(Boolean);
  return raw.map((r) => ({ raw: r, stem: stem(r) }));
}

export function levenshtein(a, b) {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > 1) return 2; // we hebben alleen ≤1 nodig
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let diag = prev[0];
    prev[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = prev[j];
      prev[j] = Math.min(prev[j] + 1, prev[j - 1] + 1, diag + (a[i - 1] === b[j - 1] ? 0 : 1));
      diag = tmp;
    }
  }
  return prev[b.length];
}

function wordMatch(tok, keyTok, fuzzy = true) {
  if (tok.raw === keyTok.raw || tok.stem === keyTok.stem) return 2;
  if (!fuzzy) return 0;
  if (tok.raw.length >= 5 && keyTok.raw.length >= 5 &&
      (levenshtein(tok.raw, keyTok.raw) <= 1 || levenshtein(tok.stem, keyTok.stem) <= 1)) return 1;
  return 0;
}

// Score van één key (evt. meerwoordig) in de vraag. 0 = geen match.
function keyScore(tokens, key, fuzzy = true) {
  const kt = tokenize(key);
  if (!kt.length) return 0;
  if (kt.length === 1) {
    let best = 0;
    for (const t of tokens) best = Math.max(best, wordMatch(t, kt[0], fuzzy));
    return best;
  }
  // meerwoordig: aaneengesloten reeks, vulwoorden ('het', 'je', …) aan beide kanten genegeerd
  const strip = (arr) => arr.filter((t) => !FILLER.has(t.raw));
  let kk = strip(kt);
  let tt = strip(tokens);
  if (!kk.length) { kk = kt; tt = tokens; }
  for (let i = 0; i + kk.length <= tt.length; i++) {
    let ok = true;
    for (let j = 0; j < kk.length; j++) if (!wordMatch(tt[i + j], kk[j], fuzzy)) { ok = false; break; }
    if (ok) return 2 * kk.length + 1;
  }
  return 0;
}

function bestKeyScore(tokens, keys, fuzzy = true) {
  let best = 0;
  for (const k of keys || []) best = Math.max(best, keyScore(tokens, k, fuzzy));
  return best;
}

function hasPhrase(norm, phrases) {
  const padded = ' ' + norm + ' ';
  return phrases.some((p) => padded.includes(' ' + p + ' '));
}

// ------------------------------------------------------------------ veiligheid

// Ongepaste/enge woorden (genormaliseerd; vergeleken als heel woord of stam, nooit fuzzy).
export const UNSAFE = [
  'dood', 'doodgaan', 'doodmaken', 'vermoord', 'vermoorden', 'moord', 'bloed', 'mes', 'geweer', 'pistool',
  'neerschieten', 'bom', 'zelfmoord', 'lijk', 'martelen', 'wapen', 'oorlog',
  'seks', 'sex', 'sexy', 'naakt', 'bloot', 'piemel', 'penis', 'vagina', 'kont', 'borsten', 'porno',
  'kut', 'klote', 'kanker', 'tering', 'tyfus', 'godverdomme', 'verdomme', 'hoer', 'lul', 'fuck', 'shit',
  'kill', 'gun', 'drugs', 'alcohol', 'bier', 'wijn', 'sigaret', 'roken',
];
const UNSAFE_STEMS = new Set(UNSAFE.map((w) => stem(w)));
const UNSAFE_SET = new Set(UNSAFE);

const PRIVATE_PHRASES = [
  'ik woon', 'woon ik', 'mijn adres', 'ons adres', 'mijn straat', 'mijn huisnummer', 'mijn postcode',
  'mijn telefoon', 'mijn nummer', 'telefoonnummer', 'mobiele nummer', 'mijn wachtwoord', 'wachtwoord',
  'ik heet', 'mijn naam is', 'mijn achternaam', 'mijn school', 'ik zit op', 'mijn juf heet', 'mijn meester heet',
  'mijn mama heet', 'mijn papa heet', 'mijn moeder heet', 'mijn vader heet', 'ik ben jaar', 'jaar oud',
  'mijn email', 'mijn mail', 'mijn verjaardag', 'ik ben geboren',
];
const SAD_PHRASES = [
  'ik heb pijn', 'heb pijn', 'doet pijn', 'doet zeer', 'ik ben verdrietig', 'ik ben bang', 'ik huil',
  'ik moet huilen', 'ik ben ziek', 'ik voel me niet', 'ik ben gevallen', 'ik bloed', 'au au',
];

function looksPrivate(original, norm) {
  if (hasPhrase(norm, PRIVATE_PHRASES)) return true;
  if (/\d{3,}/.test(original.replace(/[\s-]/g, ''))) return true; // telefoon-/huisnummers
  if (/\b\d{4}\s?[a-z]{2}\b/i.test(original)) return true; // postcode
  if (/\bik ben \d{1,2}\b/.test(norm)) return true; // leeftijd
  if (/@/.test(original)) return true; // e-mail
  if (/\b(straat|laan|weg|plein|dreef|hof|singel|gracht)\s*\d+/.test(norm)) return true;
  return false;
}

function isUnsafe(tokens) {
  return tokens.some((t) => UNSAFE_SET.has(t.raw) || UNSAFE_STEMS.has(t.stem));
}

// ------------------------------------------------------------------ ingebouwde reacties

export const SAFE_REDIRECTS = [
  'Oei, daar praten we hier niet over. Kom, we gaan verder met ons avontuur!',
  'Hmm, dat hoort niet in ons verhaal. Zullen we verder raden, {HELD}?',
  'Laten we het gezellig houden! Stel mij maar een andere vraag.',
];
export const PRIVATE_REPLIES = [
  'Dat is iets van jou zelf, dat hoef je mij niet te vertellen! Zullen we verder raden?',
  'Dat houden we lekker geheim, net als mijn raadsel! Stel mij maar een vraag over mijn geheim.',
];
export const SAD_REPLIES = [
  'Oh jee. Vraag even papa of mama om hulp. Als je wilt, raden we daarna samen verder.',
];
export const FALLBACKS = [
  'Hmm, dat weet ik niet zo goed. Stel mij maar een andere vraag!',
  'Goeie vraag! Maar daar kan ik niet op antwoorden. Probeer eens: is het groot of klein?',
  'Oei, daar moet ik over nadenken. Vraag eens iets anders, {HELD}!',
  'Dat snap ik niet helemaal. Kun je het nog eens anders vragen?',
  'Hihi, wat een vraag! Vraag eens hoe het eruitziet.',
  'Hmm, daar zeg ik niks over. Vraag eens wat je ermee kunt doen!',
];
const EMPTY_REPLY = 'Ik hoorde je niet goed. Wil je het nog eens zeggen?';
const DEFAULT_WIN = 'Ja! Goed geraden, {HELD}! Knap hoor!';
const DEFAULT_WRONG = 'Nee, dat is het niet! Goed geprobeerd. Stel nog een vraag!';

// ------------------------------------------------------------------ helpers

function pickRotating(list, state, key) {
  if (!list.length) return '';
  const i = (state[key] = ((state[key] ?? -1) + 1)) % list.length;
  return list[i];
}

// Maak intents uit fallbackQs als de schrijver (nog) geen intents heeft.
function intentsOf(step) {
  if (Array.isArray(step.intents) && step.intents.length) return step.intents;
  if (!Array.isArray(step.fallbackQs)) return [];
  return step.fallbackQs.map((f, i) => ({
    id: 'fq' + i,
    keys: tokenize(f.q).filter((t) => !FILLER.has(t.raw) && !['wat', 'hoe', 'waar', 'wie'].includes(t.raw)).map((t) => t.raw),
    a: f.a,
  })).filter((it) => it.keys.length);
}

function wrongGuessKeys(step) {
  const keys = [...(step.guessKeys || [])];
  for (const ans of step.answers || []) {
    if (ans.correct) continue;
    if (Array.isArray(ans.guessKeys)) keys.push(...ans.guessKeys);
    const label = tokenize(ans.label).filter((t) => !FILLER.has(t.raw)).map((t) => t.raw);
    keys.push(...label);
  }
  return keys;
}

function secretKeysOf(step) {
  const keys = [...(step.secretKeys || [])];
  if (!keys.length) {
    const good = (step.answers || []).find((a) => a.correct);
    if (good) keys.push(...tokenize(good.label).filter((t) => !FILLER.has(t.raw)).map((t) => t.raw));
  }
  return keys;
}

function miss(step, state, base) {
  state.misses = (state.misses || 0) + 1;
  const hints = Array.isArray(step.hints) ? step.hints : [];
  if (state.misses >= 2 && hints.length) {
    state.misses = 0;
    const idx = Math.min(state.hintIdx || 0, hints.length - 1);
    state.hintIdx = idx + 1;
    return { reply: `${base} Ik geef je een hint: ${hints[idx]}`, kind: 'hint' };
  }
  return { reply: base, kind: 'fallback' };
}

// ------------------------------------------------------------------ hoofdfunctie

export function answer(talkStep, question, state = {}) {
  const step = talkStep || {};
  const st = state || {};
  const original = String(question ?? '').slice(0, 300);
  const norm = normalize(original);
  const tokens = tokenize(original);
  const out = (reply, matched = null, solvedGuess = false, kind = 'intent') => ({ reply, matched, solvedGuess, kind });

  if (!tokens.length) return out(EMPTY_REPLY, null, false, 'empty');
  st.questions = (st.questions || 0) + 1;

  // 1. Veiligheid eerst.
  if (hasPhrase(norm, SAD_PHRASES)) return out(pickRotating(SAD_REPLIES, st, '_sad'), null, false, 'sad');
  if (isUnsafe(tokens)) return out(pickRotating(SAFE_REDIRECTS, st, '_safe'), null, false, 'safety');
  if (looksPrivate(original, norm)) return out(pickRotating(PRIVATE_REPLIES, st, '_priv'), null, false, 'private');

  // 2. Goed geraden?
  if (bestKeyScore(tokens, secretKeysOf(step)) > 0) {
    st.solved = true;
    return out(step.win || DEFAULT_WIN, 'secret', true, 'secret');
  }

  // 3. Fout geraden (een van de andere plaatjes)?
  if (bestKeyScore(tokens, wrongGuessKeys(step)) > 0) {
    const r = miss(step, st, step.wrongGuess || DEFAULT_WRONG);
    return out(r.reply, 'wrong-guess', false, r.kind === 'hint' ? 'hint' : 'wrong');
  }

  // 4. Intents (beste score wint; bij gelijkspel de eerste).
  let best = null;
  let bestScore = 0;
  for (const it of intentsOf(step)) {
    const s = bestKeyScore(tokens, it.keys);
    if (s > bestScore) { best = it; bestScore = s; }
  }
  if (best) {
    st.misses = 0;
    st.asked = st.asked || {};
    const n = (st.asked[best.id] = (st.asked[best.id] || 0) + 1);
    const reply = n > 1 && best.a2 ? best.a2 : best.a;
    return out(reply || pickRotating(FALLBACKS, st, '_fb'), best.id, false, 'intent');
  }

  // 5. Smalltalk: objecten met keys (zoals intents) of losse zinnen als extra fallback.
  const small = Array.isArray(step.smalltalk) ? step.smalltalk : [];
  const smallObjs = small.filter((s) => s && typeof s === 'object' && Array.isArray(s.keys));
  for (const s of smallObjs) {
    if (bestKeyScore(tokens, s.keys) > 0) return out(s.a, s.id || 'smalltalk', false, 'smalltalk');
  }

  // 6. Geen match: roterende reactie, na 2 missers een (oplopende) hint.
  const lines = [...small.filter((s) => typeof s === 'string'), ...FALLBACKS];
  let base = pickRotating(lines, st, '_fb');
  if (base === st._lastFb && lines.length > 1) base = pickRotating(lines, st, '_fb');
  st._lastFb = base;
  const r = miss(step, st, base);
  return out(r.reply, null, false, r.kind);
}

export default { answer };
