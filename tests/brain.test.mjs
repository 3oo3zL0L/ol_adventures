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
const PRIV_ECHO = /kerkstraat|anja|sanne|olivier|kikkenduut|5061|\d{2,}/i;

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
  ['mijn telefoonnummer is 06 12345678', 'private'], ['06 12 34 56 78', 'private'], ['ik heet Olivier', 'private'],
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
