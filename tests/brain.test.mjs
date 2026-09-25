import { test } from 'node:test';
import assert from 'node:assert/strict';
import { answer, normalize, stem, levenshtein } from '../js/brain.js';
import h1 from '../js/story/h1.js';

const step = {
  t: 'talk', who: 'kwebbel',
  intents: [
    { id: 'dier', keys: ['dier', 'beest', 'leeft', 'levend'], a: 'Nee, het is geen dier!', a2: 'Nog steeds geen dier, hoor!' },
    { id: 'eten', keys: ['eten', 'opeten', 'lekker', 'snoep'], a: 'Nee, dat kun je niet opeten.' },
    { id: 'groot', keys: ['groot', 'klein', 'past in je hand'], a: 'Het is klein, het past in je hand.' },
    { id: 'glimt', keys: ['glimt', 'glimmen', 'goud', 'metaal'], a: 'Ja, het glimt als goud!' },
    { id: 'doen', keys: ['open maken', 'openmaken', 'deur'], a: 'Daarmee maak je iets open, klik!' },
  ],
  secretKeys: ['sleutel', 'sleuteltje'],
  win: 'Ja! Goed geraden, {HELD}!',
  wrongGuess: 'Nee, dat is het niet! Goed geprobeerd.',
  answers: [
    { pic: '🗝️', label: 'Een sleuteltje', correct: true },
    { pic: '🪙', label: 'Een muntje', correct: false },
    { pic: '🍪', label: 'Een koekje', correct: false, guessKeys: ['biscuit'] },
    { pic: '🐸', label: 'Een kikker', correct: false },
  ],
  hints: ['vaag', 'duidelijker', 'bijna weggeven'],
};

test('normalize en stem', () => {
  assert.equal(normalize('Is hét een DIER?!'), 'is het een dier');
  assert.equal(stem('sleuteltje'), 'sleutel');
  assert.equal(stem('sleutels'), 'sleutel');
  assert.equal(stem('koekjes'), 'koek');
  assert.equal(stem('dieren'), 'dier');
  assert.equal(stem('katten'), 'kat');
  assert.equal(levenshtein('sleutel', 'sleutle'), 2);
  assert.equal(levenshtein('glimmen', 'glimmer'), 1);
});

test('intent-match met vulwoorden, meervoud en leestekens', () => {
  const st = {};
  let r = answer(step, 'Is het een dier?', st);
  assert.equal(r.matched, 'dier');
  assert.equal(r.reply, 'Nee, het is geen dier!');
  assert.equal(r.solvedGuess, false);
  r = answer(step, 'kan het dieren?', st);
  assert.equal(r.matched, 'dier');
  assert.equal(r.reply, 'Nog steeds geen dier, hoor!', 'tweede keer a2');
  r = answer(step, 'Kun je het OPETEN', st);
  assert.equal(r.matched, 'eten');
});

test('meerwoordige keys', () => {
  assert.equal(answer(step, 'kun je er iets mee open maken?', {}).matched, 'doen');
  assert.equal(answer(step, 'past het in je hand', {}).matched, 'groot');
});

test('fuzzy: 1 fout bij woorden van 5+ letters, niet bij korte woorden', () => {
  assert.equal(answer(step, 'is het glimmend?', {}).matched, 'glimt'); // glimmend ~ glimmen
  assert.equal(answer(step, 'kan het glimen', {}).matched, 'glimt'); // glimen ~ glimmen
  assert.equal(answer(step, 'is het een sleuel', {}).solvedGuess, true); // sleuel ~ sleutel
  assert.equal(answer(step, 'is het een dir', {}).matched, null); // kort woord: geen fuzzy
});

test('goed geraden → win', () => {
  const r = answer(step, 'Is het een sleuteltje?', {});
  assert.deepEqual([r.solvedGuess, r.reply, r.matched], [true, step.win, 'secret']);
  assert.equal(answer(step, 'sleutels!', {}).solvedGuess, true);
});

test('fout geraden → wrongGuess (label en guessKeys)', () => {
  let r = answer(step, 'is het een muntje', {});
  assert.equal(r.solvedGuess, false);
  assert.equal(r.matched, 'wrong-guess');
  assert.equal(r.reply, step.wrongGuess);
  r = answer(step, 'een biscuit?', {});
  assert.equal(r.matched, 'wrong-guess');
  r = answer(step, 'kikkers', {});
  assert.equal(r.matched, 'wrong-guess');
});

test('geen match: roterende reacties zonder herhaling, na 2 missers oplopende hint', () => {
  const st = {};
  const r1 = answer(step, 'waarom is de lucht blauw', st);
  assert.equal(r1.matched, null);
  assert.equal(r1.kind, 'fallback');
  const r2 = answer(step, 'hoe laat is het', st);
  assert.notEqual(r2.reply.split(' Ik geef')[0], r1.reply);
  assert.equal(r2.kind, 'hint');
  assert.match(r2.reply, /vaag$/);
  answer(step, 'blabla', st);
  const r4 = answer(step, 'tralala', st);
  assert.match(r4.reply, /duidelijker$/);
  answer(step, 'xyz', st);
  const r6 = answer(step, 'qqq', st);
  assert.match(r6.reply, /bijna weggeven$/);
  answer(step, 'xyz', st);
  const r8 = answer(step, 'qqq', st);
  assert.match(r8.reply, /bijna weggeven$/, 'blijft op laatste hint');
});

test('een goede vraag reset de missers', () => {
  const st = {};
  answer(step, 'blabla', st);
  answer(step, 'is het een dier', st);
  assert.equal(answer(step, 'blabla', st).kind, 'fallback');
});

test('veiligheid: ongepaste woorden → terug naar verhaal, zonder herhalen', () => {
  for (const q of ['heb je een geweer', 'is het bloed', 'kut', 'ga je dood', 'messen']) {
    const r = answer(step, q, {});
    assert.equal(r.kind, 'safety', q);
    assert.equal(r.matched, null);
    assert.ok(!normalize(r.reply).includes(normalize(q)), q);
  }
});

test('veiligheid: persoonlijke info niet herhalen', () => {
  const cases = ['ik woon in de Kerkstraat 12', 'mijn telefoon is 0612345678', 'ik heet Piet', 'ik ben 6', '5061 AB', 'mijn school is groot'];
  for (const q of cases) {
    const r = answer(step, q, {});
    assert.equal(r.kind, 'private', q);
    assert.ok(!/\d/.test(r.reply), 'geen cijfers terug');
    assert.ok(!/kerkstraat|piet/i.test(r.reply));
  }
});

test('verdriet/pijn → papa of mama', () => {
  const r = answer(step, 'ik heb pijn', {});
  assert.equal(r.kind, 'sad');
  assert.match(r.reply, /papa of mama/);
});

test('lege invoer telt niet als vraag', () => {
  const st = {};
  const r = answer(step, '   ?! ', st);
  assert.equal(r.kind, 'empty');
  assert.equal(st.questions, undefined);
  answer(step, 'is het een dier', st);
  assert.equal(st.questions, 1);
});

test('{HELD} blijft staan en fallbackQs werken zonder intents', () => {
  const r = answer(step, 'sleutel', {});
  assert.ok(r.reply.includes('{HELD}'));
  const old = {
    answers: [{ label: 'Een sleuteltje', correct: true }, { label: 'Een muntje', correct: false }],
    fallbackQs: [{ q: 'Is het een dier?', a: 'Nee, geen dier.' }, { q: 'Glimt het?', a: 'Ja!' }],
  };
  assert.equal(answer(old, 'is het een beest of een dier', {}).reply, 'Nee, geen dier.');
  assert.equal(answer(old, 'glimt het', {}).reply, 'Ja!');
  assert.equal(answer(old, 'sleuteltje', {}).solvedGuess, true);
});

test('robuust bij rare invoer', () => {
  assert.doesNotThrow(() => answer(undefined, undefined, undefined));
  assert.doesNotThrow(() => answer({}, 'hallo', {}));
  assert.equal(typeof answer({}, 'hallo').reply, 'string');
});

// ======================================================================
// Echte h1-talk-stap (vangt formaat-mismatches tussen verhaaldata en brein).
// ======================================================================
const H1 = h1.steps.find((s) => s.t === 'talk' && s.puzzle === 'h1-zak');
const PRIV_ECHO = /kerkstraat|anja|sanne|held|kikkenduut|5061|\d{2,}/i;

// Realistische vragen van een 6-jarige via spraakherkenning: [vraag, verwacht].
// Verwacht is een `kind` of 'id:<intent>'; meerdere opties met '|'.
const KID = [
  ['is het een dier', 'id:dier'], ['leeft het', 'id:dier'], ['is het een beest', 'id:dier'], ['is het een die', 'fallback'],
  ['kun je het opeten', 'id:eten'], ['is het lekker', 'id:eten'], ['kan je het eten', 'id:eten'],
  ['is het groot', 'id:groot'], ['is het klein', 'id:groot'], ['past het in mijn hand', 'id:groot'],
  ['glimt het', 'id:glimt'], ['is het glimmend', 'id:glimt'], ['is het glimmer', 'id:glimt'], ['blinkt het', 'id:glimt'],
  ['welke kleur is het', 'id:kleur'], ['is het rood', 'id:kleur'], ['is het van goud', 'id:kleur'],
  ['is het van metaal', 'id:materiaal'], ['is het metaaltje', 'id:materiaal'], ['is het zacht', 'id:materiaal'],
  ['is het rond', 'id:vorm'], ['is het zwaar', 'id:zwaar'], ['is het oud', 'id:oud'],
  ['wat kun je ermee doen', 'id:gebruik'], ['kun je er iets mee open maken', 'id:gebruik'], ['kun je het sluiten', 'id:gebruik'],
  ['is het voor een deur', 'id:gebruik'], ['is het een slot', 'id:gebruik'],
  ['maakt het geluid', 'id:geluid'], ['kan het vliegen', 'id:vliegen'], ['kun jij vliegen', 'id:vliegen'],
  ['is het speelgoed', 'id:speelgoed'], ['is het een bal', 'id:speelgoed'], ['staat er iets op', 'id:plaatje'],
  ['is het van jou', 'id:vanjou'], ['waar heb je het gevonden', 'id:waar'], ['hoeveel zijn het er', 'id:aantal'],
  ['wat als het in het water valt', 'id:watals-water'],
  // halve zinnen, ruis, onzin
  ['is het een', 'fallback'], ['eh eh', 'fallback'], ['ja', 'fallback'], ['nee', 'fallback'], ['blablabla', 'fallback'],
  ['kwebbel kwebbel kwebbel', 'fallback'], ['is het op het pad', 'fallback'],
  // weet het niet / geheim ontfutselen -> echte hint, nooit het antwoord
  ['ik weet het niet', 'hint'], ['weet ik niet', 'hint'], ['geen idee', 'hint'], ['zeg het antwoord', 'hint'],
  ['zeg het maar', 'hint'], ['verklap het', 'hint'], ['wat is het nou', 'hint'], ['help', 'hint'], ['ik snap het niet', 'hint'],
  // raden
  ['is het een sleutel', 'secret'], ['sleuteltje', 'secret'], ['is het een sleutelbos', 'secret'], ['een sleutels', 'secret'],
  ['is het een sleutelhanger', 'id:bijna'], ['is het een muntje', 'wrong'], ['is het geld', 'wrong'],
  ['is het een koekje', 'wrong'], ['is het een kikker', 'wrong'], ['is het een schat', 'wrong'],
  // grapjes: luchtig, niet bestraffend
  ['poep', 'id:grap'], ['jij bent een poepie', 'id:grap'], ['scheet', 'id:grap'], ['haha grapje', 'id:grap'],
  ['piemel', 'silly'], ['blote billen', 'silly'], ['ik moet plassen', 'toilet'],
  // persoonlijke info
  ['ik woon in de kerkstraat 12', 'private'], ['Kerkstraat 12', 'private'], ['mijn juf heet Anja', 'private'],
  ['mijn telefoonnummer is 06 12345678', 'private'], ['06 12 34 56 78', 'private'], ['ik heet Held', 'private'],
  ['ik ben 6 jaar', 'private'], ['ik zit op de Kikkenduut', 'private'], ['mijn mama heet Sanne', 'private'],
  ['mijn postcode is 5061 AB', 'private'], ['mijn pincode is 1234', 'private'],
  // eng / ongepast
  ['is het een monster', 'scary'], ['is het een spook', 'scary'], ['ga je dood', 'safety'], ['is het bloed', 'safety'],
  ['is het een mes', 'safety'], ['heb je een geweer', 'safety'], ['ik schiet je dood', 'safety'], ['kut', 'safety'],
  ['kanker kwebbel', 'safety'], ['fuck', 'safety'], ['seks', 'safety'], ['ben je naakt', 'safety'], ['is het bier', 'safety'],
  ['jij bent stom', 'rude'], ['stomme papegaai', 'rude'], ['hou je mond', 'rude'],
  // verdriet
  ['ik ben bang', 'sad'], ['ik heb pijn', 'sad'], ['ik ben verdrietig', 'sad'], ['mijn opa is dood', 'sad'],
  ['mijn hamster is doodgegaan', 'sad'], ['ik word gepest', 'sad'], ['ik wil naar mama', 'sad'],
  // over Kwebbel, groeten, stoppen
  ['hallo kwebbel', 'id:groet'], ['hoe gaat het', 'id:groet'], ['waar woon jij', 'id:kwebbel'], ['wie ben jij', 'id:kwebbel'],
  ['ik wil stoppen', 'id:stoppen'], ['doei', 'id:stoppen'],
];

test('h1: talk-stap bestaat en guessKeys-object wordt geaccepteerd', () => {
  assert.ok(H1, 'talk-stap h1-zak');
  assert.equal(typeof H1.guessKeys, 'object');
  assert.doesNotThrow(() => answer(H1, 'is het een dier', {}));
  // array-vorm blijft werken
  assert.equal(answer({ ...H1, guessKeys: ['munt'] }, 'munt', {}).matched, 'wrong-guess');
});

test(`h1: ${KID.length} kindvragen krijgen een passend antwoord`, () => {
  assert.ok(KID.length >= 60);
  for (const [q, exp] of KID) {
    const r = answer(H1, q, {});
    const got = exp.startsWith('id:') ? `id:${r.matched}` : r.kind;
    assert.ok(exp.split('|').includes(got), `"${q}": verwacht ${exp}, kreeg ${got} (${r.reply})`);
    assert.equal(typeof r.reply, 'string');
    assert.ok(r.reply.length > 0 && r.reply.length < 260, `"${q}": antwoord te lang/leeg`);
    // Kwebbel zegt 'sleutel' nooit zelf, behalve bij goed geraden.
    if (!r.solvedGuess) assert.ok(!/sleutel/i.test(r.reply), `"${q}" verklapt het antwoord: ${r.reply}`);
    // Nooit de vraag/persoonlijke info herhalen.
    assert.ok(!PRIV_ECHO.test(r.reply), `"${q}" herhaalt info: ${r.reply}`);
    // Onveilig/verdrietig/persoonlijk: het brein citeert de vraag niet.
    if (['safety', 'private', 'sad', 'silly', 'rude', 'scary'].includes(r.kind)) {
      for (const w of normalize(q).split(' ').filter((x) => x.length > 3 && !['naar', 'mama', 'papa', 'maar'].includes(x))) {
        assert.ok(!normalize(r.reply).split(' ').includes(w), `"${q}": woord "${w}" herhaald`);
      }
    }
  }
});

test('h1: giechelwoorden worden luchtig afgebogen, niet als ongepast', () => {
  for (const q of ['poep', 'piemel', 'scheet', 'blote billen', 'plas']) {
    const r = answer(H1, q, {});
    assert.notEqual(r.kind, 'safety', q);
    assert.ok(!/niet over|hoort niet|foei|mag niet/i.test(r.reply), `${q}: ${r.reply}`);
  }
});

test('h1: "sluiten" of "sleuf" wint niet per ongeluk (fuzzy)', () => {
  for (const q of ['kun je het sluiten', 'sluit het', 'is het een sleuf', 'is het een slee']) {
    assert.equal(answer(H1, q, {}).solvedGuess, false, q);
  }
});

test('h1: "ik weet het niet" geeft echt een hint, steeds duidelijker', () => {
  const st = {};
  const r1 = answer(H1, 'ik weet het niet', st);
  const r2 = answer(H1, 'geen idee', st);
  const r3 = answer(H1, 'zeg het maar', st);
  assert.ok(r1.reply.includes(H1.hints[0]));
  assert.ok(r2.reply.includes(H1.hints[1]));
  assert.ok(r3.reply.includes(H1.hints[2]));
});

test('h1: frontend-state {asked:0} blijft een getal (knop "Ik weet het" gaat aan)', () => {
  const st = { asked: 0, misses: 0, used: new Set() }; // zoals app.js runTalk()
  for (const q of ['is het een dier', 'is het groot', 'is het een dier']) {
    answer(H1, q, st);
    st.asked++;
  }
  assert.equal(st.asked, 3);
  assert.equal(answer(H1, 'is het een dier', st).reply.includes(H1.intents.find((i) => i.id === 'dier').a2), false, 'derde keer: niet weer a2');
});

test('h1: een gesprek van 20 beurten herhaalt nooit direct dezelfde zin', () => {
  const st = {};
  const convo = ['hallo', 'is het een dier', 'is het een dier', 'is het een dier', 'blabla', 'eh', 'hmm ja', 'nee',
    'poep', 'poep', 'poep', 'is het groot', 'is het een koekje', 'is het een munt', 'is het een kikker', 'ik weet het niet',
    'ik weet het niet', 'ik weet het niet', 'ik weet het niet', 'waar is de wc'];
  let prev = '';
  for (const q of convo) {
    const r = answer(H1, q, st);
    assert.notEqual(r.reply, prev, `herhaling bij "${q}"`);
    prev = r.reply;
  }
});

test('h1: na 2 foute gokken volgt automatisch een hint', () => {
  const st = {};
  answer(H1, 'is het een munt', st);
  const r = answer(H1, 'is het een koekje', st);
  assert.equal(r.kind, 'hint');
  assert.ok(r.reply.includes(H1.hints[0]));
});

// ---------------------------------------------------------------- verhaalinhoud h1
const sentences = (t) => String(t).split(/[.!?…]+(?:\s|$)/).map((x) => x.trim()).filter(Boolean).length;

test('h1: elke say heeft max 2 zinnen', () => {
  for (const s of h1.steps.filter((x) => x.t === 'say')) assert.ok(sentences(s.text) <= 2, s.text);
});

test('h1: Kwebbel verklapt "sleutel" niet vóór het geraden is', () => {
  const idx = h1.steps.indexOf(H1);
  for (const s of h1.steps.slice(0, idx)) assert.ok(!/sleutel/i.test(JSON.stringify(s)), JSON.stringify(s).slice(0, 80));
  const spoken = [H1.intro, H1.ask, H1.wrongGuess, H1.wrongGuess2, ...H1.hints,
    ...H1.fallbackQs.flatMap((f) => [f.q, f.a]), ...H1.intents.flatMap((i) => [i.a, i.a2])];
  for (const t of spoken) assert.ok(!/sleutel/i.test(t || ''), t);
});

test('h1: spelniveaus passen bij groep 3', () => {
  const game = (g) => h1.steps.find((s) => s.t === 'game' && s.game === g);
  const c = game('count').params, su = game('sum').params;
  assert.ok(c[1].n <= 5 && c[3].n <= 20);
  assert.ok(su[1].a + su[1].b <= 5 && su[3].a + su[3].b <= 20);
  const pk = game('pick').params;
  assert.deepEqual([1, 2, 3].map((l) => pk[l].options.length), [3, 4, 5]);
  for (const l of [1, 2, 3]) {
    assert.equal(pk[l].options.filter((o) => o.correct).length, 1);
    for (const o of pk[l].options) assert.ok(o.label.length <= 10, `label te lang voor .lbl (nowrap): ${o.label}`);
  }
  const w = game('word');
  assert.ok(!/\b[a-z]-[a-z]-[a-z]\b/.test(w.intro), 'intro spelt het woord niet voor (TTS leest letternamen)');
  for (const l of [1, 2, 3]) assert.match(w.params[l].word, /^[^aeiou][aeiou][^aeiou]$/, 'mkm');
});

// ======================================================================
// Hoofdstuk 1-5: verhaalinhoud, niveaus en praatpuzzels (echte hoofdstukdata).
// ======================================================================
import h2 from '../js/story/h2.js';
import h3 from '../js/story/h3.js';
import h4 from '../js/story/h4.js';
import h5 from '../js/story/h5.js';

const CHAPTERS = [h1, h2, h3, h4, h5];
// ARCHITECTUUR.md: achtergronden, personages en props (boot, raket, kompas, kist, racer, schoen).
const BGS = ['bos', 'ven', 'hut', 'boom', 'boomtop', 'nacht', 'reuzenbos', 'zee', 'eiland', 'ruimte', 'ruimteschip', 'kartbaan',
  'rivier', 'strand', 'planeet', 'feest'];
const PEOPLE = ['held', 'florine', 'kwebbel', 'brom', 'rommel', 'piep'];
const PROPS = ['boot', 'raket', 'kompas', 'kist', 'racer', 'schoen'];
const SPEAKERS = ['verteller', ...PEOPLE];
const SFX = ['tap', 'goed', 'fout', 'ster', 'whoosh', 'dreun', 'bel', 'pop', 'klim', 'sprong', 'fanfare', 'papegaai', 'piep', 'wind'];
const MOODS = ['blij', 'verbaasd', 'denkt', 'lacht'];
const talks = (ch) => ch.steps.filter((s) => s.t === 'talk');
const answerOf = (r) => (r.op === '-' ? r.a - r.b : r.a + r.b);
// Alleen wat hardop gezegd/getoond wordt (trefwoordlijsten tellen niet mee).
const textOf = (x) => JSON.stringify(x, (k, v) => (['keys', 'secretKeys', 'guessKeys'].includes(k) ? undefined : v));
const spokenSentences = (t) => String(t).split(/[.!?]+(?:\s|$)/).map((x) => x.trim()).filter(Boolean).length;

test('alle hoofdstukken: alleen bekende achtergronden, personages, props, geluiden en moods', () => {
  for (const ch of CHAPTERS) {
    for (const s of ch.steps) {
      const where = `${ch.id} ${s.t} ${JSON.stringify(s).slice(0, 60)}`;
      if (s.t === 'scene') assert.ok(BGS.includes(s.bg), `onbekende bg: ${where}`);
      for (const c of [...(s.chars || []), ...(s.char ? [s.char] : [])]) assert.ok([...PEOPLE, ...PROPS].includes(c), `onbekend char "${c}": ${where}`);
      if (s.t === 'say' || s.t === 'talk') assert.ok(SPEAKERS.includes(s.who), `onbekende spreker: ${where}`);
      if (s.sfx) assert.ok(SFX.includes(s.sfx), `onbekend geluid: ${where}`);
      if (s.mood) assert.ok(MOODS.includes(s.mood), `onbekende mood: ${where}`);
      assert.ok(['scene', 'say', 'choice', 'game', 'talk', 'reward', 'cliff'].includes(s.t), where);
      if (s.t !== 'scene') assert.ok(!(s.chars || []).some((c) => PROPS.includes(c)) || s.t === 'cliff', where);
    }
  }
});

test('alle hoofdstukken: elke say heeft max 2 zinnen; talk-teksten max 3 korte zinnen', () => {
  for (const ch of CHAPTERS) {
    for (const s of ch.steps.filter((x) => x.t === 'say')) assert.ok(sentences(s.text) <= 2, `${ch.id}: ${s.text}`);
  }
  for (const ch of [h2, h3, h4, h5]) {
    for (const s of talks(ch)) {
      const texts = [s.intro, s.win, s.wrongGuess, s.wrongGuess2, ...s.hints, ...s.fallbackQs.map((f) => f.a),
        ...s.intents.flatMap((i) => [i.a, i.a2])].filter(Boolean);
      for (const t of texts) assert.ok(spokenSentences(t) <= 3 && t.length <= 140, `${s.puzzle}: ${t}`);
    }
  }
});

test('verhaal: elk hoofdstuk begint waar de vorige cliffhanger ophield', () => {
  const firstScene = (ch) => ch.steps.find((s) => s.t === 'scene');
  const cliff = (ch) => ch.steps[ch.steps.length - 1];
  for (const ch of CHAPTERS) assert.equal(cliff(ch).t, 'cliff', `${ch.id} eindigt met cliff`);
  assert.ok(/reuzenschoen/.test(cliff(h1).text) && firstScene(h2).chars.includes('schoen'), 'H1 schoen → H2 schoen');
  assert.ok(/brom/.test(JSON.stringify(h2.steps.slice(0, 20))), 'H2: reus Brom (eigenaar schoen)');
  assert.ok(/bootje/.test(cliff(h2).text) && /Florine/.test(cliff(h2).text), 'H2 eindigt met Florine in bootje');
  assert.ok(/bootje met Florine/.test(h3.steps[1].text), 'H3 begint bij het bootje van Florine');
  assert.ok(/raket/.test(cliff(h3).text) && firstScene(h4).chars.includes('raket'), 'H3 raket → H4 raket');
  assert.ok(/planeet/.test(JSON.stringify(h4.steps.slice(-6))) && firstScene(h5).bg === 'planeet', 'H4 landing → H5 planeet');
  assert.ok(cliff(h5).end, 'H5 is het einde');
  // Zonder chars zet de engine bij een cliff automatisch de reuzenschoen neer: alleen goed voor H1.
  for (const ch of [h2, h3, h4]) assert.ok(cliff(ch).chars?.length, `${ch.id}: cliff heeft eigen chars`);
  // Rode draad: het Sterrenkompas komt in elk hoofdstuk terug, en het sleuteltje uit H1 wordt in H3 gebruikt.
  for (const ch of CHAPTERS) assert.match(JSON.stringify(ch.steps), /Sterrenkompas/, `${ch.id} noemt het Sterrenkompas`);
  assert.match(JSON.stringify(h3.steps), /sleuteltje/);
});

test('verhaal: Rommel en "wasbeer" worden pas in H5 onthuld; Brom is bang voor muizen, Piep zegt bliep', () => {
  for (const ch of [h1, h2, h3, h4]) assert.ok(!/\bRommel\b|wasbeer/i.test(textOf(ch.steps)), ch.id);
  const t5 = talks(h5)[0];
  const before = h5.steps.slice(0, h5.steps.indexOf(t5));
  assert.ok(!/\bRommel\b|wasbeer/i.test(textOf(before)), 'H5 vóór de ontmaskering');
  const lines = (who) => CHAPTERS.flatMap((c) => c.steps.filter((s) => s.t === 'say' && s.who === who).map((s) => s.text));
  assert.ok(lines('piep').filter((t) => /bliep/i.test(t)).length >= lines('piep').length / 2, 'Piep zegt vaak bliep');
  assert.ok(lines('brom').some((t) => /muis/.test(t)), 'Brom en de muizen');
  // Brom bleef in H4 op het strand (past niet in de raket): niet op de kartplaneet in H5.
  const planet = h5.steps.slice(0, h5.steps.findIndex((s) => s.t === 'scene' && s.bg === 'ven'));
  assert.ok(!planet.some((s) => s.who === 'brom' || (s.chars || []).includes('brom')), 'Brom niet op de planeet');
});

test('alle hoofdstukken: spelparameters per niveau zijn geldig en oplosbaar', () => {
  for (const ch of CHAPTERS) {
    for (const s of ch.steps.filter((x) => x.t === 'game')) {
      const id = `${ch.id} ${s.game}`;
      assert.ok(['tellen', 'rekenen', 'woorden', 'geheugen', 'logica', 'ruimte'].includes(s.skill), id);
      assert.ok(s.intro && s.success && s.hint, `${id}: intro/success/hint`);
      for (const lv of [1, 2, 3]) {
        const p = s.params[lv];
        const at = `${id} niveau ${lv}`;
        assert.ok(p, at);
        if (s.game === 'count') {
          assert.ok(['tap', 'howmany'].includes(p.mode) && p.n >= 1 && p.n <= 20 && p.item, at);
          if (p.mode === 'tap') assert.ok((p.total ?? p.n + 3) >= p.n, `${at}: total >= n`);
        } else if (s.game === 'sum') {
          assert.ok(['+', '-'].includes(p.op) && p.item, at);
          const v = answerOf(p);
          assert.ok(v >= 0 && v <= 20 && p.a <= 20 && p.b <= 20, `${at}: antwoord ${v}`);
        } else if (s.game === 'race') {
          assert.ok(p.rounds.length >= 3 && p.rounds.length <= 5, `${at}: 3-5 rondes`);
          for (const r of p.rounds) {
            assert.ok(['+', '-'].includes(r.op), at);
            assert.ok(answerOf(r) >= 0 && answerOf(r) <= 20 && r.a <= 20 && r.b <= 20, `${at}: ${r.a}${r.op}${r.b}`);
          }
        } else if (s.game === 'memory') {
          assert.ok(new Set(p.items).size >= 2 && p.length >= 3 && p.length <= 6, at);
        } else if (s.game === 'word') {
          assert.equal(p.mode, ['listen', 'build', 'missing'][lv - 1], `${at}: mode`);
          assert.ok(/^[a-z]{2,5}$/.test(p.word) && p.pic, at);
          const others = p.options.filter((o) => o.w !== p.word);
          assert.ok(new Set(others.map((o) => o.w)).size >= 2, `${at}: minstens 2 afleiders`);
          if (ch !== h1) assert.equal(others.length, p.options.length, `${at}: afleiders verschillen van het woord`);
        } else if (s.game === 'pick') {
          assert.ok(p.q && p.options.length >= 3, at);
          assert.equal(p.options.filter((o) => o.correct === true).length, 1, `${at}: precies 1 goed`);
          for (const o of p.options) assert.ok(o.pic && o.label && o.label.length <= 24, `${at}: ${o.label}`);
        } else if (s.game === 'jump') {
          assert.ok(p.blocks >= 2 && p.coins <= p.blocks, at);
        } else assert.fail(`onbekende game ${id}`);
      }
    }
  }
});

test('leerlijn: rekenen loopt op van H1 naar H5 en de woorden uit VERHAAL.md komen terug', () => {
  const maxCalc = (ch) => Math.max(0, ...ch.steps.filter((s) => s.game === 'sum' || s.game === 'race').flatMap((s) =>
    [1, 2, 3].flatMap((l) => (s.params[l].rounds || [s.params[l]]).map((r) => Math.max(r.a, answerOf(r))))));
  const tops = CHAPTERS.map(maxCalc);
  for (let i = 1; i < tops.length; i++) assert.ok(tops[i] >= tops[i - 1], `rekenen daalt: ${tops}`);
  assert.equal(tops[4], 20, 'H5 tot 20');
  assert.ok(h3.steps.some((s) => s.game === 'sum' && s.params[1].op === '-'), 'H3: ook min');
  const words = (ch) => ch.steps.filter((s) => s.game === 'word').flatMap((s) => [1, 2, 3].map((l) => s.params[l].word));
  assert.ok(['sok', 'pen'].every((w) => words(h2).includes(w)), 'H2 sok, pen');
  assert.ok(['roos', 'maan', 'boot'].every((w) => words(h3).includes(w)), 'H3 roos, maan, boot');
  assert.ok(words(h4).includes('kip') && words(h5).includes('bal'));
  for (const ch of CHAPTERS) for (const l of [1, 2, 3]) {
    for (const s of ch.steps.filter((x) => x.game === 'count' || x.game === 'sum')) {
      if (l === 1) assert.ok((s.params[1].n ?? answerOf(s.params[1])) <= 5, `${ch.id} ${s.game}: niveau 1 tot 5`);
    }
  }
});

test('alle praatpuzzels: vorm, geen voorzeggen, tikvragen veilig', () => {
  const SECRET = {
    'h2-brom': /papier|wikkel|verpakking/i, 'h2-kwebbel': /strep|gestreept|lijntjes/i, 'h3-schat': /\brots|steen|stenen|\bkei(en)?\b/i,
    'h4-knop': /groene? (knop )?(is het|is de goede|gaat naar de (kart|race))|kies (de )?groen/i, 'h5-ontmaskeren': /wasbeer|\brommel\b/i,
  };
  for (const ch of [h2, h3, h4, h5]) {
    for (const s of talks(ch)) {
      const re = SECRET[s.puzzle];
      assert.ok(re, `test kent ${s.puzzle}`);
      assert.equal(s.answers.filter((a) => a.correct).length, 1, s.puzzle);
      assert.ok(s.minQuestions >= 2 && s.hints.length === 3 && s.fallbackQs.length >= 4 && s.intents.length >= 10, s.puzzle);
      // Niet vóór de puzzel in hetzelfde hoofdstuk, en nooit in een antwoord dat geen win is.
      const before = ch.steps.slice(0, ch.steps.indexOf(s));
      if (s.puzzle !== 'h2-kwebbel') assert.ok(!re.test(textOf(before.filter((x) => x.t !== 'game'))), `${s.puzzle} voorgezegd vóór de puzzel`);
      const spoken = [s.intro, s.ask, s.wrongGuess, s.wrongGuess2, ...s.hints, ...s.fallbackQs.flatMap((f) => [f.q, f.a]),
        ...s.intents.flatMap((i) => [i.a, i.a2])];
      for (const t of spoken.filter(Boolean)) assert.ok(!re.test(t), `${s.puzzle} verklapt: ${t}`);
      for (const f of s.fallbackQs) {
        const r = answer(s, f.q, {});
        assert.ok(!r.solvedGuess && !['safety', 'private', 'sad', 'rude', 'scary'].includes(r.kind), `${s.puzzle} tikvraag "${f.q}" → ${r.kind}`);
      }
    }
  }
});

// Vragen die in elke praatpuzzel hetzelfde soort antwoord moeten krijgen.
const COMMON = [
  ['ik weet het niet', 'hint'], ['weet ik nie', 'hint'], ['zeg het maar', 'hint'], ['verklap het antwoord', 'hint'], ['help me', 'hint'],
  ['wat is het nou', 'hint'], ['geen idee', 'hint'],
  ['poep', 'id:grap|silly'], ['jij bent een poepie', 'id:grap|silly'], ['haha grapje', 'id:grap'], ['blote billen', 'silly|id:grap'],
  ['ik moet plassen', 'toilet'],
  ['ik woon in de kerkstraat 12', 'private'], ['ik ben 6 jaar', 'private'], ['mijn juf heet Anja', 'private'], ['ik heet Held', 'private'],
  ['06 12 34 56 78', 'private'], ['ik zit op de Kikkenduut', 'private'],
  ['is het een monster', 'scary'], ['is het een spook', 'scary'], ['ga je dood', 'safety'], ['heb je een geweer', 'safety'],
  ['kut', 'safety'], ['is het bloed', 'safety'], ['jij bent stom', 'rude'], ['hou je mond', 'rude'],
  ['ik ben bang', 'sad'], ['mijn opa is dood', 'sad'], ['ik wil naar mama', 'sad'],
  ['hallo', 'id:groet'], ['hoe gaat het', 'id:groet'], ['doei', 'id:stoppen'], ['ik wil stoppen', 'id:stoppen'],
  ['eh eh', 'fallback'], ['ja', 'fallback'], ['blablabla', 'fallback'], ['bomen', 'fallback'],
];
const PER_PUZZLE = {
  'h2-brom': [
    ['is het een dier', 'id:dier'], ['leeft het', 'id:dier'], ['welke kleur heeft het', 'id:kleur'], ['is het groot', 'id:groot'],
    ['kun je het opeten', 'id:eten'], ['wat zat erin', 'id:eten'], ['maakt het geluid', 'id:geluid'], ['ritselt het', 'id:geluid'],
    ['ruikt het lekker', 'id:ruikt'], ['is het plakkerig', 'id:plakt'], ['is het zwaar', 'id:licht'], ['glimt het', 'id:glimt'],
    ['is het van plastic', 'id:materiaal'], ['waar lag het', 'id:waar'], ['hoeveel waren het er', 'id:aantal'],
    ['wie heeft het gedaan', 'id:wie'], ['was het een muis', 'id:muis'], ['hoe heet jij', 'id:brom'], ['is het speelgoed', 'id:speelgoed'],
    ['moet het in de prullenbak', 'id:afval'], ['wie belde er aan', 'id:bel'],
    ['is het snoep', 'id:bijna'], ['is het een lolly', 'id:bijna'], ['is het een wikkel', 'fallback'],
    ['zijn het snoeppapiertjes', 'secret'], ['snoep papiertjes', 'secret'], ['is het van papier', 'secret'], ['is het een verpakking', 'secret'],
    ['zijn het blaadjes', 'wrong'], ['bladeren', 'wrong'], ['veertjes', 'wrong'], ['zijn het nootjes', 'wrong'], ['steentjes', 'wrong'],
  ],
  'h2-kwebbel': [
    ['welke kleur had de staart', 'id:kleur'], ['was hij zwart', 'id:kleur'], ['zwart en grijs', 'id:kleur'], ['was de staart lang', 'id:lang'],
    ['was hij zacht', 'id:zacht'], ['was hij pluizig', 'id:zacht'], ['waar ging hij heen', 'id:waar'], ['zag je zijn gezicht', 'id:gezicht'],
    ['had hij handjes', 'id:handjes'], ['was hij snel', 'id:beweegt'], ['wat zei hij', 'id:geluid'], ['was je bang', 'id:bang'],
    ['hoe zag de staart eruit', 'id:patroon'], ['hoeveel staarten', 'id:aantal'], ['wie was het', 'id:wie'], ['was het brom', 'id:brom'],
    ['was het een zebra', 'id:bijna'], ['een tijger', 'id:bijna'], ['een eekhoorn', 'id:eekhoorn'], ['was het een vos', 'id:vos'],
    ['was het een wasbeer', 'id:dier'], ['was het een kat', 'id:dier'], ['waar zat jij', 'id:kwebbel'],
    ['had hij strepen', 'secret'], ['strepen', 'secret'], ['was hij gestreept', 'secret'], ['had hij lijnen', 'secret'], ['streepjes', 'secret'],
    ['had hij stippen', 'wrong'], ['vlekken', 'wrong'], ['was hij kaal', 'wrong'], ['een regenboog', 'wrong'], ['ruitjes', 'wrong'],
  ],
  'h3-schat': [
    ['is het bij de palmboom', 'id:palmboom'], ['moet ik naar links of rechts', 'id:richting'], ['rechts', 'id:richting'],
    ['hoeveel stappen', 'id:stappen'], ['is het ver', 'id:stappen'], ['welke kleur heeft het', 'id:kleur'], ['is het grijs', 'id:kleur'],
    ['is het groot', 'id:groot'], ['is het zacht', 'id:hard'], ['is het zwaar', 'id:zwaar'], ['is het in de zee', 'id:water'],
    ['moet ik graven', 'id:zand'], ['is het een dier', 'id:dier'], ['is het bij de boot', 'id:boot'], ['kan je erop zitten', 'id:zitten'],
    ['wat zit erin', 'id:inhoud'], ['wie heeft de schat verstopt', 'id:piraat'], ['ben jij een piraat', 'id:kwebbel'],
    ['ligt het in de zon', 'id:zon'], ['waar is de schat', 'id:waar'], ['is het een grot', 'id:bijna'], ['bij de berg', 'id:bijna'],
    ['kijk op de kaart', 'id:kaart'], ['wie gaat de schat stelen', 'fallback'], ['dat is kei leuk', 'fallback'],
    ['is het een rots', 'secret'], ['bij de rots', 'secret'], ['een grote steen', 'secret'], ['is het een grote kei', 'secret'], ['rotsen', 'secret'],
    ['is het een schelp', 'wrong'], ['bij de bloem', 'wrong'], ['is het een kokosnoot', 'wrong'],
  ],
  'h4-knop': [
    ['wat als ik op de rode knop druk', 'id:rood'], ['wat doet de blauwe knop', 'id:blauw'], ['wat gebeurt er als ik op geel druk', 'id:geel'],
    ['wat als ik op groen druk', 'id:groen'], ['wat als ik druk op de groene knop', 'id:groen'], ['wat als ik groen kies', 'id:groen'],
    ['rood', 'id:rood'], ['blauw', 'id:blauw'], ['geel', 'id:geel'], ['groen', 'id:groen'], ['de groene knop', 'id:groen'],
    ['wat als we op alle knoppen drukken', 'id:alles'], ['wat als we niks doen', 'id:niks'], ['paars', 'id:anderekleur'],
    ['welke knop gaat naar de karts', 'id:knop|id:kart'], ['wat als we op de maan landen', 'id:maan'], ['wat als we sneller gaan', 'id:snel'],
    ['wat als we remmen', 'id:rem'], ['wat als ik naar buiten ga', 'id:raam'], ['ik heb honger', 'id:eten'], ['ben jij een robot', 'id:piep'],
    ['waar is het kompas', 'id:computer'], ['wat als we naar huis gaan', 'id:aarde'],
    ['ik kies groen', 'secret'], ['ik kies de groene knop', 'secret'], ['druk op groen', 'secret'], ['ik druk op de groene knop', 'secret'],
    ['ik denk groen', 'secret'], ['ik neem de groene', 'secret'], ['het is de groene knop', 'secret'],
    ['ik kies rood', 'wrong'], ['ik kies de blauwe', 'wrong'], ['ik neem geel', 'wrong'],
  ],
  'h5-ontmaskeren': [
    ['heb jij kleine handjes', 'id:handjes'], ['is die staart van jou', 'id:staart'], ['heb jij strepen', 'id:staart'],
    ['waarom liggen er snoeppapiertjes', 'id:snoep'], ['deed jij belletje lellen', 'id:bel'], ['waarom heb jij het kompas', 'id:waarom'],
    ['mag je masker af', 'id:masker'], ['doe je helm af', 'id:masker'], ['wie ben jij', 'id:wie'], ['welk dier ben jij', 'id:wie'],
    ['wie heeft het kompas gepakt', 'id:dader'], ['ben je verdwaald', 'id:thuis'], ['waar woon je', 'id:thuis'], ['ben jij alleen', 'id:eenzaam'],
    ['ik ben niet boos', 'id:sorry'], ['lieg je', 'id:eerlijk'], ['heb jij de picknick opgegeten', 'id:picknick'], ['ben je bang', 'id:bang'],
    ['geef het kompas terug', 'id:kompas'], ['ken jij Brom', 'id:brom'], ['ken jij Florine', 'id:florine'], ['ben jij verdrietig', 'id:eenzaam'],
    ['waarom maak jij zo n rommel', 'id:waarom'], ['wat een rommel', 'fallback'], ['ben jij een beer', 'id:beer'],
    ['ben jij een wasbeer', 'secret'], ['wasbeer', 'secret'], ['ben jij een was beer', 'secret'], ['jij bent de dief', 'secret'],
    ['jij was het', 'secret'], ['jij hebt het kompas gepakt', 'secret'],
    ['ben jij een zebra', 'wrong'], ['een vos', 'wrong'], ['ben jij een eekhoorn', 'wrong'], ['ben jij een kat', 'wrong'],
  ],
};

for (const ch of [h2, h3, h4, h5]) {
  for (const s of talks(ch)) {
    const cases = [...PER_PUZZLE[s.puzzle], ...COMMON];
    test(`${s.puzzle}: ${cases.length} kindvragen krijgen een passend antwoord`, () => {
      assert.ok(PER_PUZZLE[s.puzzle].length >= 30);
      for (const [q, exp] of cases) {
        const r = answer(s, q, {});
        const got = [`id:${r.matched}`, r.kind];
        assert.ok(exp.split('|').some((e) => got.includes(e)), `"${q}": verwacht ${exp}, kreeg ${got} (${r.reply})`);
        assert.equal(r.solvedGuess, exp === 'secret', `"${q}": solvedGuess`);
        assert.ok(r.reply.length > 0 && r.reply.length < 300, `"${q}": antwoord te lang/leeg`);
        assert.ok(!PRIV_ECHO.test(r.reply), `"${q}" herhaalt info: ${r.reply}`);
      }
    });

    test(`${s.puzzle}: "ik weet het niet" geeft oplopende hints; een gewoon gesprek eindigt met winst`, () => {
      const st = {};
      const r = ['ik weet het niet', 'geen idee', 'zeg het maar'].map((q) => answer(s, q, st));
      r.forEach((x, i) => assert.ok(x.reply.includes(s.hints[i]) && !x.solvedGuess, `hint ${i + 1}`));
      const convo = {
        'h2-brom': ['hallo brom', 'is het een dier', 'is het klein', 'maakt het geluid', 'ik denk snoeppapiertjes'],
        'h2-kwebbel': ['welke kleur had de staart', 'was het een zebra', 'hoe zag de staart eruit', 'had hij strepen'],
        'h3-schat': ['is het bij de palmboom', 'moet ik naar links of rechts', 'hoeveel stappen', 'welke kleur', 'is het hard', 'is het een grote rots'],
        'h4-knop': ['wat als ik op de rode knop druk', 'wat als ik op de blauwe knop druk', 'wat als ik op de groene knop druk', 'ik kies de groene knop'],
        'h5-ontmaskeren': ['heb jij kleine handjes', 'is die staart van jou', 'mag je masker af', 'ben jij een wasbeer'],
      }[s.puzzle];
      const st2 = {};
      convo.forEach((q, i) => assert.equal(answer(s, q, st2).solvedGuess, i === convo.length - 1, `"${q}"`));
    });
  }
}

test('h4-knop: wat-als-vragen zijn nooit een gok; alleen een kleur noemen geeft het gevolg', () => {
  const s = talks(h4)[0];
  assert.equal(s.explore, true);
  for (const q of ['wat als ik druk op de groene knop', 'wat als ik groen kies', 'wat gebeurt er als ik op groen druk'])
    assert.equal(answer(s, q, {}).solvedGuess, false, q);
  for (const q of ['rood', 'is het rood', 'blauw?', 'geel']) assert.notEqual(answer(s, q, {}).kind, 'wrong', q);
  // Zonder explore-vlag blijven labels gewoon foute gokken (h1-gedrag).
  assert.equal(answer({ ...s, explore: false }, 'blauw', {}).kind, 'wrong');
});

test('giechelwoord wint van een fuzzy intent ("billen" is geen "tillen")', () => {
  const s = { intents: [{ id: 'zwaar', keys: ['tillen'], a: 'Zwaar!' }, { id: 'grap', keys: ['poep'], a: 'Hihi!' }] };
  assert.equal(answer(s, 'blote billen', {}).kind, 'silly');
  assert.equal(answer(s, 'kun je het tillen', {}).matched, 'zwaar');
  assert.equal(answer(s, 'poep', {}).matched, 'grap', 'eigen grap-intent blijft voorgaan');
});

test('geen onterechte veiligheidsreactie op verhaalwoorden (raket, piraat, dief, bommetje)', () => {
  const innocent = ['schiet de raket omhoog', 'de raket schiet weg', 'schieten we naar de maan', 'ben jij de dief', 'ben jij een boef',
    'is het een piraat', 'heb je een bommetje gemaakt', 'draag jij een rokje', 'lijkt het op een zebra', 'zijn er bomen', 'boem boem',
    'is het gevaarlijk', 'komt er rook uit'];
  for (const ch of [h1, h2, h3, h4, h5]) for (const s of talks(ch)) {
    for (const q of innocent) assert.ok(!['safety', 'private', 'sad'].includes(answer(s, q, {}).kind), `${s.puzzle}: "${q}"`);
    assert.equal(answer(s, 'dood eng', {}).kind, 'scary');
    for (const q of ['ik schiet je dood', 'schiet hem neer', 'ik schiet je dood met de raket']) assert.equal(answer(s, q, {}).kind, 'safety', q);
  }
});

test('alle hoofdstukken: wie praat (behalve de verteller) staat in beeld', () => {
  for (const ch of [h2, h3, h4, h5]) {
    let on = [];
    for (const s of ch.steps) {
      if (s.t === 'scene') on = s.chars;
      // Florine roept in H3 vanuit het wegdrijvende bootje: dat mag buiten beeld.
      if (s.t === 'say' && s.who !== 'verteller' && !(ch === h3 && s.who === 'florine' && on.includes('boot') === false && /Joehoe/.test(s.text)))
        assert.ok(on.includes(s.who), `${ch.id}: ${s.who} niet in beeld bij "${s.text}"`);
    }
  }
});
