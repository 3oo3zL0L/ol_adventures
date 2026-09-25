import { test } from 'node:test';
import assert from 'node:assert/strict';
import { answer, normalize, stem, levenshtein } from '../js/brain.js';

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
