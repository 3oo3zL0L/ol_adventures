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
//             |'silly'|'toilet'|'rude'|'scary'
//   intent.hint:true  -> antwoord + de volgende hint uit `hints` (voor 'ik weet het niet', 'zeg het maar').
//   wrongGuess2?      -> afwisselend met wrongGuess bij fout raden (minder herhaling).
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
  // Stammen alleen fuzzy als ze zelf 5+ letters hebben: anders is 'billen'(bil) ~ 'bolletje'(bol).
  if (tok.raw.length >= 5 && keyTok.raw.length >= 5 &&
      (levenshtein(tok.raw, keyTok.raw) <= 1 ||
       (tok.stem.length >= 5 && keyTok.stem.length >= 5 && levenshtein(tok.stem, keyTok.stem) <= 1))) return 1;
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
  // Blijft er na strippen maar één woord over ('zeg het maar' -> 'zeg'), dan moet de hele frase
  // letterlijk voorkomen; anders zou één los woord de bonus voor een meerwoordige key krijgen.
  let kk = strip(kt);
  let tt = strip(tokens);
  let exact = false;
  if (kk.length < 2) { kk = kt; tt = tokens; exact = true; }
  for (let i = 0; i + kk.length <= tt.length; i++) {
    let ok = true;
    for (let j = 0; j < kk.length; j++) if (!wordMatch(tt[i + j], kk[j], fuzzy && !exact)) { ok = false; break; }
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
  'dood', 'doodgaan', 'doodmaken', 'doodschieten', 'vermoord', 'vermoorden', 'moord', 'bloed', 'mes', 'geweer',
  'pistool', 'schieten', 'neerschieten', 'bom', 'zelfmoord', 'lijk', 'martelen', 'wapen', 'oorlog',
  'seks', 'sex', 'sexy', 'neuken', 'naakt', 'bloot', 'penis', 'vagina', 'borsten', 'tieten', 'porno',
  'kut', 'klote', 'kanker', 'tering', 'tyfus', 'godverdomme', 'verdomme', 'hoer', 'lul', 'klootzak', 'fuck',
  'shit', 'kill', 'gun', 'drugs', 'alcohol', 'bier', 'wijn', 'sigaret', 'roken', 'flikker', 'mongool', 'debiel',
];
// Giechelwoorden (poep/plas): luchtig afbuigen, niet als 'ongepast' behandelen.
export const SILLY = ['poep', 'poepen', 'poepie', 'drol', 'plas', 'plassen', 'pies', 'piesen', 'scheet', 'scheten',
  'wind laten', 'piemel', 'piemeltje', 'billen', 'billetjes', 'kont', 'wc', 'toilet', 'snot', 'boer laten'];
// Mild onaardig (vaak frustratie): lief terug + een hint.
export const RUDE = ['stom', 'stomme', 'dom', 'domme', 'sukkel', 'idioot', 'achterlijk', 'trut', 'eikel', 'rot op',
  'hou je mond', 'kop dicht', 'ik haat je', 'saai', 'stomkop', 'domkop', 'irritant'];
// Eng (maar niet ongepast): geruststellen.
export const SCARY = ['monster', 'monsters', 'spook', 'spoken', 'heks', 'zombie', 'vampier', 'skelet', 'eng', 'enge',
  'griezelig', 'doodeng', 'nachtmerrie', 'duivel'];
// Verdriet/rouw: woord uit GRIEF samen met iemand uit KIN -> 'sad' (bv. "mijn opa is dood").
const GRIEF = ['dood', 'doodgegaan', 'overleden', 'gestorven', 'begraven', 'begrafenis', 'kanker', 'ziekenhuis', 'ziek'];
const KIN = ['mijn', 'opa', 'oma', 'papa', 'mama', 'vader', 'moeder', 'broer', 'zus', 'zusje', 'broertje', 'oom',
  'tante', 'hond', 'poes', 'kat', 'konijn', 'hamster', 'cavia', 'vis', 'visje', 'juf', 'meester', 'vriend', 'vriendje'];
const TOILET_BREAK = ['moet plassen', 'moet poepen', 'moet piesen', 'moet naar de wc', 'moet naar het toilet',
  'naar de wc', 'moet naar de wc toe', 'ik moet plassen', 'hoge nood'];

const PRIVATE_PHRASES = [
  'ik woon', 'woon ik', 'wij wonen', 'we wonen', 'mijn adres', 'ons adres', 'mijn straat', 'mijn huisnummer',
  'mijn postcode', 'mijn telefoon', 'mijn nummer', 'telefoonnummer', 'mobiele nummer', 'nul zes', 'mijn wachtwoord',
  'wachtwoord', 'ik heet', 'mijn naam is', 'mijn achternaam', 'mijn school', 'ik zit op', 'ik zit in groep',
  'mijn juf', 'mijn meester', 'ik ben jaar', 'jaar oud', 'mijn email', 'mijn mail', 'mijn verjaardag',
  'ik ben geboren', 'mijn pincode', 'de pincode', 'mijn pin',
];
const SAD_PHRASES = [
  'ik heb pijn', 'heb pijn', 'doet pijn', 'doet zeer', 'ik ben verdrietig', 'ik ben bang', 'ik huil',
  'ik moet huilen', 'ik ben ziek', 'ik voel me niet', 'ik ben gevallen', 'ik bloed', 'au au', 'ik ben alleen',
  'ik ben verdwaald', 'ik wil naar mama', 'ik wil naar papa', 'ik mis mama', 'ik mis papa', 'ik word gepest',
  'ze pesten', 'hij pest', 'zij pest', 'gepest', 'hij slaat', 'zij slaat', 'slaat mij', 'slaat me', 'schopt me',
  'ik ben boos', 'ik ben zo moe', 'ik heb een nachtmerrie', 'ik ga dood',
];

function looksPrivate(original, norm) {
  if (hasPhrase(norm, PRIVATE_PHRASES)) return true;
  if (/\d{4,}/.test(original)) return true; // telefoonnummer, jaartal, pincode
  if ((original.match(/\d/g) || []).length >= 6) return true; // "06 12 34 56 78"
  if (/\b\d{4}\s?[a-z]{2}\b/i.test(original)) return true; // postcode
  if (/\bik ben \d{1,2}\b/.test(norm)) return true; // leeftijd
  if (/@/.test(original)) return true; // e-mail
  if (/\bmijn( \w+){1,2} heet\b/.test(norm)) return true; // "mijn juf heet …", "mijn grote broer heet …"
  // "Kerkstraat 12", "Lindelaan 4b", "nummer 12": ook als het straatwoord aan de naam vastzit.
  if (/(straat|laan|weg|plein|dreef|hof|singel|gracht|kade|dijk|pad|steeg|park|nummer)\s*\d+/.test(norm)) return true;
  return false;
}

// Woordenlijst -> matcher op heel woord/stam (nooit fuzzy) of letterlijke frase.
function lexicon(list) {
  const words = list.filter((w) => !w.includes(' '));
  const phrases = list.filter((w) => w.includes(' '));
  const raw = new Set(words);
  const stems = new Set(words.map((w) => stem(w)));
  return (tokens, norm) => tokens.some((t) => raw.has(t.raw) || stems.has(t.stem)) || hasPhrase(norm, phrases);
}
const isUnsafe = lexicon(UNSAFE);
const isSilly = lexicon(SILLY);
const isRude = lexicon(RUDE);
const isScary = lexicon(SCARY);
const isGrief = (tokens, norm) => lexicon(GRIEF)(tokens, norm) && lexicon(KIN)(tokens, norm);

// ------------------------------------------------------------------ ingebouwde reacties

export const SAFE_REDIRECTS = [
  'Hmm, dat past niet in ons verhaal. Kom, we gaan verder met ons avontuur!',
  'Dat laten we lekker buiten ons spel. Zullen we verder raden, {HELD}?',
  'Laten we het gezellig houden! Stel mij maar een andere vraag.',
];
export const PRIVATE_REPLIES = [
  'Dat is iets van jou zelf. Dat hoef je niemand op een scherm te vertellen, ook mij niet!',
  'Dat houden we lekker geheim, net als mijn raadsel! Stel mij maar een vraag over mijn geheim.',
];
export const SAD_REPLIES = [
  'Oh jee, wat naar. Ga even naar papa of mama, die helpen je graag. Daarna raden we samen verder, als je wilt.',
  'Wat naar voor je. Ga maar even naar papa of mama toe, ik wacht hier op je.',
];
export const SILLY_REPLIES = [
  'Hihi, wat een giechelwoord! Maar nu weer raden, kom maar op.',
  'Haha, jij bent een grapjas! Stel mij nu een raadvraag.',
  'Pfff, daar moet ik om lachen! Welke vraag heb je nog meer?',
];
export const TOILET_BREAK_REPLIES = [
  'Ga maar gauw! Ik wacht hier op je, ik vlieg niet weg.',
];
export const RUDE_REPLIES = [
  'Oei, dat vind ik niet zo lief. Misschien is het een beetje moeilijk?',
  'Hmm, niet zo aardig, hoor. Kom, we doen het samen!',
];
export const SCARY_REPLIES = [
  'Nee hoor, hier is niks engs! Stel maar een vraag, ik zit klaar.',
  'Eng? Welnee, ik ben een vrolijke papegaai! Vraag nog maar iets.',
];
export const REPEAT_PREFIX = ['Die vraag ken ik al!', 'Nog een keer? Goed hoor!', 'Dat vroeg je net ook al!'];
export const FALLBACKS = [
  'Hmm, dat weet ik niet zo goed. Stel mij maar een andere vraag!',
  'Goeie vraag! Maar daar kan ik niet op antwoorden. Probeer eens: is het groot of klein?',
  'Oei, daar moet ik over nadenken. Vraag eens iets anders, {HELD}!',
  'Dat snap ik niet helemaal. Kun je het nog eens anders vragen?',
  'Hihi, wat een vraag! Vraag eens hoe het eruitziet.',
  'Hmm, daar zeg ik niks over. Vraag eens wat je ermee kunt doen!',
];
export const EMPTY_REPLY = 'Ik hoorde je niet goed. Wil je het nog eens zeggen?';
export const DEFAULT_WIN = 'Ja! Goed geraden, {HELD}! Knap hoor!';
export const DEFAULT_WRONG = 'Nee, dat is het niet! Goed geprobeerd. Stel nog een vraag!';

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
  return step.fallbackQs.filter((f) => f && f.q).map((f, i) => ({
    id: 'fq' + i,
    keys: tokenize(f.q).filter((t) => !FILLER.has(t.raw) && !['wat', 'hoe', 'waar', 'wie'].includes(t.raw)).map((t) => t.raw),
    a: f.a,
  })).filter((it) => it.keys.length);
}

// guessKeys mag een array zijn ['munt', …] of een object { munt:[…], koekje:[…] } (zie ARCHITECTUUR.md).
function flatKeys(v) {
  if (!v) return [];
  if (typeof v === 'string') return [v];
  if (Array.isArray(v)) return v.flatMap(flatKeys);
  if (typeof v === 'object') return Object.values(v).flatMap(flatKeys);
  return [];
}

function wrongGuessKeys(step) {
  const keys = flatKeys(step.guessKeys);
  for (const ans of step.answers || []) {
    if (ans.correct) continue;
    keys.push(...flatKeys(ans.guessKeys));
    const label = tokenize(ans.label || '').filter((t) => !FILLER.has(t.raw)).map((t) => t.raw);
    keys.push(...label);
  }
  return keys;
}

function secretKeysOf(step) {
  const keys = flatKeys(step.secretKeys);
  if (!keys.length) {
    const good = (step.answers || []).find((a) => a.correct);
    if (good) keys.push(...tokenize(good.label || '').filter((t) => !FILLER.has(t.raw)).map((t) => t.raw));
  }
  return keys;
}

const firstSentence = (s) => (String(s).match(/^.*?[.!?…](\s|$)/) || [s])[0].trim();

// Volgende (steeds duidelijkere) hint; blijft op de laatste staan. '' als er geen hints zijn.
function nextHint(step, state) {
  const hints = Array.isArray(step.hints) ? step.hints.filter(Boolean) : [];
  if (!hints.length) return '';
  const idx = Math.min(state.hintIdx || 0, hints.length - 1);
  state.hintIdx = idx + 1;
  state.misses = 0;
  return hints[idx];
}

function miss(step, state, base) {
  state.misses = (state.misses || 0) + 1;
  if (state.misses >= 2) {
    const hint = nextHint(step, state);
    // Kort houden: alleen de eerste zin van de basisreactie, dan de hint.
    if (hint) return { reply: `${firstSentence(base)} Ik geef je een hint! ${hint}`, kind: 'hint' };
  }
  return { reply: base, kind: 'fallback' };
}

function withHint(step, st, base) {
  const hint = nextHint(step, st);
  return hint ? `${base} Ik geef je een hint! ${hint}` : base;
}

// Het geheim: exact/stam, of 1 fout alleen bij de ECHTE key (niet bij schrijf-varianten) en alleen
// als het woord geen bekend ander woord is ("sluiten" mag nooit "sleutel" winnen).
const NOT_SECRET = new Set(['sluiten', 'sluit', 'sluitje', 'slepen', 'sleutelen', 'steunen', 'sleuf']);
function secretMatch(tokens, keys) {
  const toks = tokens.filter((t) => !NOT_SECRET.has(t.raw));
  return bestKeyScore(toks, keys) > 0;
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

  // 1. Veiligheid en welzijn eerst (vaste teksten; de vraag wordt nooit herhaald).
  if (hasPhrase(norm, TOILET_BREAK)) return out(pickRotating(TOILET_BREAK_REPLIES, st, '_wc'), null, false, 'toilet');
  if (hasPhrase(norm, SAD_PHRASES) || isGrief(tokens, norm)) return out(pickRotating(SAD_REPLIES, st, '_sad'), null, false, 'sad');
  if (isUnsafe(tokens, norm)) return out(pickRotating(SAFE_REDIRECTS, st, '_safe'), null, false, 'safety');
  if (looksPrivate(original, norm)) return out(pickRotating(PRIVATE_REPLIES, st, '_priv'), null, false, 'private');
  if (isRude(tokens, norm)) {
    st.misses = 0;
    return out(withHint(step, st, pickRotating(RUDE_REPLIES, st, '_rude')), null, false, 'rude');
  }
  if (isScary(tokens, norm)) return out(pickRotating(SCARY_REPLIES, st, '_scary'), null, false, 'scary');

  // 2. Goed geraden? (niet-fuzzy tegen korte of veelvoorkomende woorden: zie secretMatch)
  if (secretMatch(tokens, secretKeysOf(step))) {
    st.solved = true;
    return out(step.win || DEFAULT_WIN, 'secret', true, 'secret');
  }

  // 3. Fout geraden (een van de andere plaatjes)?
  if (bestKeyScore(tokens, wrongGuessKeys(step), false) > 0) {
    st._wrong = (st._wrong || 0) + 1;
    const base = (st._wrong % 2 === 0 && step.wrongGuess2) || step.wrongGuess || DEFAULT_WRONG;
    const r = miss(step, st, base);
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
    // Eigen teller (`_seen`): de frontend gebruikt `state.asked` zelf als getal.
    const seen = (st._seen && typeof st._seen === 'object') ? st._seen : (st._seen = {});
    const n = (seen[best.id] = (seen[best.id] || 0) + 1);
    let reply = best.a;
    if (n === 2 && best.a2) reply = best.a2;
    else if (n >= 3 && !best.hint) {
      const again = n % 2 === 1 || !best.a2 ? best.a : best.a2;
      reply = again ? `${pickRotating(REPEAT_PREFIX, st, '_rep')} ${again}` : again;
    } else if (n >= 3 && best.a2) reply = n % 2 ? best.a : best.a2;
    reply = reply || pickRotating(FALLBACKS, st, '_fb');
    if (best.hint) return out(withHint(step, st, reply), best.id, false, 'hint');
    return out(reply, best.id, false, 'intent');
  }

  // 4b. Giechelwoorden zonder eigen intent: luchtig terug naar het spel.
  if (isSilly(tokens, norm)) return out(pickRotating(SILLY_REPLIES, st, '_silly'), null, false, 'silly');

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
