// Verzamelt alle zinnen die de game kan uitspreken (per personage) en schrijft tools/voice/lines.json.
// Gebruik: HELD_NAAM=Olivier node tools/voice/lines.mjs
// Elke tekst wordt precies zo opgeknipt als js/speech.js dat tijdens het spelen doet,
// zodat iedere zin een eigen clip krijgt.
import { writeFileSync, existsSync } from 'node:fs';
import { cleanForSpeech, splitSentences, hash } from '../../js/speech.js';
import { NUM_WORDS, graphemes, sound, sounded, ARROW_WORDS } from '../../js/games.js';
import * as brain from '../../js/brain.js';

const NAME = process.env.HELD_NAAM || 'Olivier';
const lines = new Map(); // key -> {who, text, file}
const add = (who, text) => {
  if (!text) return;
  const filled = String(text).replaceAll('{HELD}', NAME);
  for (const chunk of splitSentences(cleanForSpeech(filled))) {
    const file = `${who}/${hash(chunk)}.mp3`;
    if (!lines.has(file)) lines.set(file, { who, text: chunk, file });
  }
};
const V = 'verteller';

// ---------- vaste zinnen uit app.js en games.js ----------
const STATIC = [
  'Bijna! Tel nog eens rustig met je vinger.', 'Kijk, deze knop glimt. Tel maar mee!', 'Hoeveel zie je er?',
  'Tik daarna op klaar.', 'Te veel!', 'Tik er eentje weg.', 'Nu jij!', 'Helemaal goed onthouden!',
  'Geeft niks! We kijken nog een keer samen.', 'Oeps, die niet. Probeer het nog eens vanaf het begin!',
  'Hoeveel zijn het er samen?', 'Hoeveel blijven er over?', 'Bijna! Tel alleen de plaatjes die nog niet weg zijn.',
  'Bijna! Tel ze allemaal samen, eentje voor eentje.', 'Welke is het?', 'Kijk nog eens goed.', 'Hmm, die past niet. Kijk nog eens goed!',
  'Eén voor één springen! Het blok met de gele rand.', 'Goed zo!', 'Knap gehoord!', 'Jij kunt lezen!',
  'Welke klank hoor je in het midden?', 'Tik de klanken in de goede volgorde.', 'Goed gedaan!',
  'Kijk eens hoeveel sterren je al hebt verzameld!', 'Dit hoofdstuk is nog op slot. Speel eerst het vorige avontuur!',
  'Kies een avontuur.', 'Klaar voor avontuur?', 'Wat is het?', 'Stel je vraag! Hou de rode knop vast terwijl je praat. Of tik op een vraag.',
  'Stel je vraag! Tik op het witte vak en praat via het toetsenbord. Of tik op een vraag.', 'Tik op een vraag!',
  'Ik mag de microfoon nog niet gebruiken. Vraag papa of mama even om hulp. Je kunt ook op de knoppen tikken!',
  'Ik hoorde je niet goed. Hou de knop ingedrukt terwijl je praat, en laat dan los.', 'Goed geraden!',
  'Hmm, goeie vraag! Wat denk jij zelf?', 'Nee, dat is het niet. Stel nog een vraag!',
];
STATIC.forEach((t) => add(V, t));
for (const w of Object.values(ARROW_WORDS)) add(V, w);
for (let i = 0; i <= 20; i++) {
  const n = NUM_WORDS[i];
  add(V, n); add(V, `${n}!`); add(V, `Precies ${n}!`); add(V, `Tik er ${n} aan.`);
  add(V, `Oei, dat zijn er ${n}.`); add(V, `Je hebt er ${n}.`); add(V, `We hebben er ${n} nodig.`);
}
add('kwebbel', `Hoi ${NAME}!`); add('kwebbel', `Hallo ${NAME}!`); add('kwebbel', 'Klaar voor avontuur?');
add('kwebbel', 'Gaap… tijd om uit te rusten, dat vind ik fijn. Straks weer avontuur, dan zal het nog leuker zijn!');
add('kwebbel', 'Dit avontuur wordt nog geschreven, het is nog niet klaar. Kom snel terug, dan staat het voor je paraat!');

// ---------- woordspelletjes ----------
const VOWELS = ['a', 'e', 'i', 'o', 'u', 'aa', 'oo', 'ee', 'ie', 'oe'];
function wordLines(p) {
  const w = p.word; if (!w) return;
  const words = [w, ...(p.options || []).map((o) => o.w)];
  add(V, sounded(w));
  add(V, `${sounded(w)} ... ${w}! Knap gehoord!`);
  add(V, `${sounded(w)} ... ${w}! Jij kunt lezen!`);
  add(V, `${w}. Welke klank hoor je in het midden?`);
  add(V, `${w}. ${sounded(w)}. Tik de klanken in de goede volgorde.`);
  for (const o of words) add(V, `Dat is ${o}. Luister nog eens: ${sounded(w)}.`);
  for (const g of [...graphemes(w), ...VOWELS]) add(V, sound(g));
}

// ---------- hoofdstukken ----------
for (let n = 1; n <= 5; n++) {
  const f = new URL(`../../js/story/h${n}.js`, import.meta.url);
  if (!existsSync(f)) continue;
  const { default: ch } = await import(f);
  for (const s of ch.steps) {
    switch (s.t) {
      case 'say': add(s.who || V, s.text); break;
      case 'choice': add(V, s.q); for (const o of s.options) { add(V, o.label); add(V, o.say); } break;
      case 'reward': case 'cliff': add(V, s.text); break;
      case 'game': {
        add(V, s.intro); add(V, s.success); add(V, s.hint);
        for (const p of Object.values(s.params || {})) {
          if (s.game === 'sum') add(V, `${NUM_WORDS[p.a]} ${p.op === '-' ? 'min' : 'plus'} ${NUM_WORDS[p.b]}.`);
          if (s.game === 'pick') { add(V, p.q); (p.options || []).forEach((o) => add(V, o.say)); }
          if (s.game === 'word') wordLines(p);
        }
        break;
      }
      case 'talk': {
        const who = s.who;
        for (const t of [s.intro, s.ask, s.win, s.wrongGuess, s.wrongGuess2, ...(s.hints || [])]) add(who, t);
        add(V, s.ask);
        for (const h of s.hints || []) add(who, `Ik geef je een hint! ${h}`);
        for (const it of s.intents || []) { add(who, it.a); add(who, it.a2); }
        for (const q of s.fallbackQs || []) { add('held', q.q); add(who, q.a); }
        for (const sm of s.smalltalk || []) add(who, typeof sm === 'string' ? sm : sm.a);
        for (const list of [brain.SAFE_REDIRECTS, brain.PRIVATE_REPLIES, brain.SAD_REPLIES, brain.SILLY_REPLIES,
          brain.TOILET_BREAK_REPLIES, brain.RUDE_REPLIES, brain.SCARY_REPLIES, brain.REPEAT_PREFIX, brain.FALLBACKS]) list.forEach((t) => add(who, t));
        [brain.EMPTY_REPLY, brain.DEFAULT_WIN, brain.DEFAULT_WRONG, 'Hmm, goeie vraag! Wat denk jij zelf?', 'Goed geraden!',
          'Nee, dat is het niet. Stel nog een vraag!'].forEach((t) => add(who, t));
        break;
      }
    }
  }
}

const out = [...lines.values()];
writeFileSync(new URL('./lines.json', import.meta.url), JSON.stringify(out, null, 1));
const chars = out.reduce((a, l) => a + l.text.length, 0);
console.log(`${out.length} zinnen, ${chars} tekens`);
