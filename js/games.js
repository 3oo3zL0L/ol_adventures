// Minigames. Elke game: (params, ctx) -> Promise<{mistakes}>.
// ctx: { root, speak(text, who), sfx, hint() }
// Een game eindigt altijd met succes; na fouten helpt hij steeds meer (steigeren).

export const h = (tag, attrs = {}, ...kids) => {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'style') el.style.cssText = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const c of kids.flat()) if (c != null && c !== false) el.append(c.nodeType ? c : String(c));
  return el;
};

export const wait = (ms) => new Promise((r) => setTimeout(r, ms));
export const shuffle = (a) => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const rnd = (n) => Math.floor(Math.random() * n);

export const NUM_WORDS = ['nul', 'een', 'twee', 'drie', 'vier', 'vijf', 'zes', 'zeven', 'acht', 'negen', 'tien',
  'elf', 'twaalf', 'dertien', 'veertien', 'vijftien', 'zestien', 'zeventien', 'achttien', 'negentien', 'twintig'];

// Tik-knop die niet dubbel reageert en een tikgeluid geeft.
function tapper(el, fn, ctx) {
  let busy = false;
  el.addEventListener('click', async (e) => {
    e.preventDefault();
    if (busy || el.disabled) return;
    busy = true;
    ctx.sfx.play('tap');
    try { await fn(e); } finally { busy = false; }
  });
  return el;
}

function panel(ctx, title) {
  const p = h('div', { class: 'panel' });
  if (title) p.append(h('h2', {}, title));
  ctx.root.append(p);
  return p;
}

// Drie getalknoppen: juiste antwoord + twee dichtbij.
function numberOptions(ans, max = 20) {
  const set = new Set([ans]);
  const near = shuffle([-2, -1, 1, 2, 3, -3]);
  for (const d of near) { if (set.size >= 3) break; const v = ans + d; if (v >= 0 && v <= max) set.add(v); }
  return shuffle([...set]);
}

async function chooseNumber(ctx, p, ans, { hintText } = {}) {
  let mistakes = 0;
  const row = h('div', { class: 'row' });
  p.append(row);
  return new Promise((resolve) => {
    for (const v of numberOptions(ans)) {
      const b = h('button', { class: 'tile num', 'aria-label': NUM_WORDS[v] || v }, String(v));
      tapper(b, async () => {
        if (v === ans) {
          b.classList.add('good'); ctx.sfx.play('goed');
          [...row.children].forEach((x) => (x.disabled = true));
          await ctx.speak(`${NUM_WORDS[v] || v}! Goed zo!`, 'verteller');
          resolve({ mistakes });
        } else {
          mistakes++; b.classList.add('bad'); ctx.sfx.play('fout');
          setTimeout(() => b.classList.remove('bad'), 500);
          if (mistakes >= 2) [...row.children].find((x) => x.textContent === String(ans))?.classList.add('hint');
          await ctx.speak(mistakes === 1 ? (hintText || 'Bijna! Tel nog eens rustig met je vinger.') : 'Kijk, deze knop glimt. Tel maar mee!', 'verteller');
        }
      }, ctx);
      row.append(b);
    }
  });
}

// ---------- tellen ----------
export async function count(params, ctx) {
  const { mode = 'tap', item = '🪵' } = params;
  const n = params.n ?? 5;
  if (mode === 'howmany') {
    const p = panel(ctx, 'Hoeveel zie je er?');
    p.dataset.answer = n;
    p.append(h('div', { class: 'objects' }, item.repeat(n)));
    return chooseNumber(ctx, p, n);
  }
  const total = Math.max(params.total ?? n + 3, n + 1);
  const p = panel(ctx, `Tik er ${n} aan`);
  p.dataset.answer = n;
  const field = h('div', { class: 'scatter' });
  p.append(field);
  const done = h('button', { class: 'btn go' }, '✔ Klaar');
  p.append(done);
  // Posities in een los raster, zodat niets overlapt.
  const cols = Math.ceil(Math.sqrt(total * 2)), rows = Math.ceil(total / cols);
  const cells = shuffle([...Array(cols * Math.max(rows, 2)).keys()]).slice(0, total);
  const picked = [];
  const tiles = cells.map((c) => {
    const x = (c % cols) / cols * 88 + rnd(4), y = Math.floor(c / cols) / Math.max(rows, 2) * 70 + rnd(8);
    const t = h('button', { class: 'tile sm', style: `left:${x}%;top:${y}%` }, item);
    tapper(t, async () => {
      const i = picked.indexOf(t);
      if (i >= 0) { picked.splice(i, 1); t.classList.remove('on'); t.querySelector('.badge')?.remove(); renumber(); ctx.sfx.play('pop'); return; }
      picked.push(t); t.classList.add('on'); renumber(); ctx.sfx.play('pop');
      ctx.speak(NUM_WORDS[picked.length] || String(picked.length), 'verteller');
    }, ctx);
    field.append(t);
    return t;
  });
  function renumber() {
    picked.forEach((t, i) => { let b = t.querySelector('.badge'); if (!b) { b = h('span', { class: 'badge' }); t.append(b); } b.textContent = i + 1; });
  }
  let mistakes = 0;
  return new Promise((resolve) => {
    tapper(done, async () => {
      if (picked.length === n) {
        ctx.sfx.play('goed'); picked.forEach((t) => t.classList.add('good'));
        tiles.forEach((t) => (t.disabled = true)); done.disabled = true;
        await ctx.speak(`Precies ${NUM_WORDS[n] || n}!`, 'verteller');
        resolve({ mistakes });
      } else {
        mistakes++; ctx.sfx.play('fout');
        const msg = picked.length > n ? `Oei, dat zijn er ${NUM_WORDS[picked.length]}. Te veel! Tik er eentje weg.` : `Je hebt er ${NUM_WORDS[picked.length] || picked.length}. We hebben er ${NUM_WORDS[n]} nodig.`;
        await ctx.speak(msg, 'verteller');
      }
    }, ctx);
  });
}

// ---------- sommen ----------
export async function sum(params, ctx) {
  const { a = 2, b = 1, op = '+', item = '🍎' } = params;
  const ans = op === '-' ? a - b : a + b;
  const p = panel(ctx, op === '-' ? `${a} − ${b} = ?` : `${a} + ${b} = ?`);
  p.dataset.answer = ans;
  if (op === '-') {
    p.append(h('div', { class: 'objects' }, ...Array.from({ length: a }, (_, i) => h('span', { class: i >= a - b ? 'x' : '' }, item))));
  } else {
    p.append(h('div', { class: 'row' }, h('div', { class: 'objects' }, item.repeat(a)), h('span', { class: 'plus' }, '+'), h('div', { class: 'objects' }, item.repeat(b))));
  }
  const say = op === '-' ? `${NUM_WORDS[a]} min ${NUM_WORDS[b]}. Hoeveel blijven er over?` : `${NUM_WORDS[a]} plus ${NUM_WORDS[b]}. Hoeveel zijn het er samen?`;
  ctx.speak(say, 'verteller');
  return chooseNumber(ctx, p, ans, { hintText: op === '-' ? 'Bijna! Tel alleen de plaatjes die nog niet weg zijn.' : 'Bijna! Tel ze allemaal samen, eentje voor eentje.' });
}

// ---------- geheugen / klimroute ----------
const ARROW_WORDS = { '⬅️': 'links', '➡️': 'rechts', '⬆️': 'omhoog', '⬇️': 'omlaag' };
export async function memory(params, ctx) {
  const items = params.items?.length ? params.items : ['⬅️', '⬆️', '➡️'];
  const length = params.length ?? 3;
  // Willekeurige route, nooit twee keer dezelfde richting achter elkaar.
  const seq = [];
  for (let i = 0; i < length; i++) {
    let v; do { v = items[rnd(items.length)]; } while (items.length > 1 && v === seq[i - 1]);
    seq.push(v);
  }

  const p = panel(ctx, 'Kijk en onthoud!');
  p.dataset.answer = seq.join(' ');
  const show = h('div', { class: 'row' }, ...seq.map(() => h('div', { class: 'tile sm' }, '❔')));
  const pad = h('div', { class: 'row' });
  const replay = h('button', { class: 'btn white' }, '👀 Nog een keer');
  p.append(show, pad, replay);
  let mistakes = 0, pos = 0, playing = false;

  async function play() {
    playing = true; replay.disabled = true;
    [...show.children].forEach((t) => { t.textContent = '❔'; t.classList.remove('good'); });
    for (let i = 0; i < seq.length; i++) {
      const t = show.children[i];
      t.textContent = seq[i]; t.classList.add('lit'); ctx.sfx.play('klim');
      await ctx.speak(ARROW_WORDS[seq[i]] || '', 'verteller');
      await wait(ARROW_WORDS[seq[i]] ? 250 : 700);
      t.classList.remove('lit');
    }
    await wait(300);
    [...show.children].forEach((t) => (t.textContent = '❔'));
    pos = 0; playing = false; replay.disabled = false;
    ctx.speak('Nu jij!', 'verteller');
  }

  return new Promise((resolve) => {
    for (const it of [...new Set(items)]) {
      const b = h('button', { class: 'tile' }, it);
      tapper(b, async () => {
        if (playing) return;
        if (it === seq[pos]) {
          show.children[pos].textContent = it; show.children[pos].classList.add('good'); ctx.sfx.play('klim');
          pos++;
          if (pos === seq.length) {
            [...pad.children].forEach((x) => (x.disabled = true)); replay.disabled = true; ctx.sfx.play('goed');
            await ctx.speak('Helemaal goed onthouden!', 'verteller');
            resolve({ mistakes });
          }
        } else {
          mistakes++; b.classList.add('bad'); ctx.sfx.play('fout');
          setTimeout(() => b.classList.remove('bad'), 500);
          await ctx.speak(mistakes >= 2 ? 'Geeft niks! We kijken nog een keer samen.' : 'Oeps, die niet. Probeer het nog eens vanaf het begin!', 'verteller');
          if (mistakes >= 2) await play(); else { pos = 0; [...show.children].forEach((t) => { t.textContent = '❔'; t.classList.remove('good'); }); }
        }
      }, ctx);
      pad.append(b);
    }
    tapper(replay, play, ctx);
    play();
  });
}

// ---------- woordjes (klankzuiver) ----------
const GRAPHEMES = ['sch', 'aa', 'ee', 'oo', 'uu', 'ie', 'oe', 'eu', 'ui', 'ei', 'ij', 'ou', 'au', 'ch', 'ng'];
export function graphemes(word) {
  const out = []; let i = 0; const w = word.toLowerCase();
  while (i < w.length) {
    const g = GRAPHEMES.find((x) => w.startsWith(x, i)) || w[i];
    out.push(g); i += g.length;
  }
  return out;
}
// Hoe een klank uitgesproken wordt door de TTS (benadering van de schoolklank).
const SOUND = {
  b: 'bu', d: 'du', k: 'ku', p: 'pu', t: 'tu', j: 'ju', w: 'wu', c: 'ku',
  m: 'mmm', n: 'nnn', s: 'sss', f: 'fff', v: 'vvv', z: 'zzz', r: 'rrr', l: 'lll', h: 'hhh', g: 'ggg', ch: 'ggg',
  a: 'ah', e: 'eh', i: 'ih', o: 'oh', u: 'uh',
  aa: 'aa', ee: 'ee', oo: 'oo', uu: 'uu', ie: 'ie', oe: 'oe', eu: 'eu', ui: 'ui', ei: 'ei', ij: 'ij', ou: 'ou', au: 'au', ng: 'ng', sch: 'sch',
};
export const sound = (g) => SOUND[g] || g;
const sounded = (word) => graphemes(word).map(sound).join(' ... ');

export async function word(params, ctx) {
  const { mode = 'listen', word: w, pic = '❓' } = params;
  const options = (params.options || []).filter((o) => o.w !== w);
  let mistakes = 0;

  if (mode === 'listen') {
    const p = panel(ctx, 'Luister goed… welk woord is het?');
    p.dataset.answer = pic;
    const again = h('button', { class: 'btn white' }, '👂 Nog eens horen');
    const row = h('div', { class: 'row' });
    p.append(again, row);
    const listen = async () => { await ctx.speak(sounded(w), 'verteller'); };
    tapper(again, listen, ctx);
    const opts = shuffle([{ w, pic }, ...options]);
    const done = new Promise((resolve) => {
      for (const o of opts) {
        const b = h('button', { class: 'tile' }, o.pic);
        tapper(b, async () => {
          if (o.w === w) {
            b.classList.add('good'); ctx.sfx.play('goed'); [...row.children].forEach((x) => (x.disabled = true));
            await ctx.speak(`${sounded(w)} ... ${w}! Knap gehoord!`, 'verteller');
            resolve({ mistakes });
          } else {
            mistakes++; b.classList.add('bad'); ctx.sfx.play('fout'); setTimeout(() => b.classList.remove('bad'), 500);
            await ctx.speak(`Dat is ${o.w}. Luister nog eens: ${sounded(w)}.`, 'verteller');
            if (mistakes >= 2) [...row.children][opts.findIndex((x) => x.w === w)]?.classList.add('hint');
          }
        }, ctx);
        row.append(b);
      }
    });
    listen();
    return done;
  }

  const gs = graphemes(w);
  if (mode === 'missing') {
    const gap = gs.findIndex((g) => /^[aeiou]/.test(g)) >= 0 ? gs.findIndex((g) => /^[aeiou]/.test(g)) : 1;
    const p = panel(ctx, 'Welke klank mist er?');
    p.dataset.answer = gs[gap];
    p.append(h('div', { class: 'bigpic' }, pic));
    const slots = h('div', { class: 'slots' }, ...gs.map((g, i) => h('div', { class: 'slot' }, i === gap ? '' : g)));
    const pool = new Set([gs[gap]]);
    for (const x of shuffle(['a', 'e', 'i', 'o', 'u', 'aa', 'oo', 'ee', 'ie', 'oe'])) { if (pool.size >= 3) break; pool.add(x); }
    const row = h('div', { class: 'row' });
    p.append(slots, row);
    ctx.speak(`${w}. Welke klank hoor je in het midden?`, 'verteller');
    return new Promise((resolve) => {
      for (const g of shuffle([...pool])) {
        const b = h('button', { class: 'tile letter' }, g);
        tapper(b, async () => {
          await ctx.speak(sound(g), 'verteller');
          if (g === gs[gap]) {
            slots.children[gap].textContent = g; b.classList.add('good'); ctx.sfx.play('goed');
            [...row.children].forEach((x) => (x.disabled = true));
            await ctx.speak(`${sounded(w)} ... ${w}!`, 'verteller');
            resolve({ mistakes });
          } else {
            mistakes++; b.classList.add('bad'); ctx.sfx.play('fout'); setTimeout(() => b.classList.remove('bad'), 500);
            if (mistakes >= 2) [...row.children].find((x) => x.textContent === gs[gap])?.classList.add('hint');
          }
        }, ctx);
        row.append(b);
      }
    });
  }

  // build: letters in de goede volgorde tikken
  const p = panel(ctx, 'Maak het woord!');
  p.dataset.answer = gs.join(' ');
  p.append(h('div', { class: 'bigpic' }, pic));
  const slots = h('div', { class: 'slots' }, ...gs.map(() => h('div', { class: 'slot' }, '')));
  const row = h('div', { class: 'row' });
  p.append(slots, row);
  ctx.speak(`${w}. ${sounded(w)}. Tik de klanken in de goede volgorde.`, 'verteller');
  let pos = 0;
  return new Promise((resolve) => {
    const tiles = shuffle(gs.map((g, i) => ({ g, i })));
    for (const { g } of tiles) {
      const b = h('button', { class: 'tile letter' }, g);
      tapper(b, async () => {
        ctx.speak(sound(g), 'verteller');
        if (g === gs[pos]) {
          slots.children[pos].textContent = g; b.disabled = true; b.classList.add('good'); ctx.sfx.play('pop');
          pos++;
          [...row.children].forEach((x) => x.classList.remove('hint'));
          if (pos === gs.length) {
            ctx.sfx.play('goed'); await wait(400);
            await ctx.speak(`${sounded(w)} ... ${w}! Jij kunt lezen!`, 'verteller');
            resolve({ mistakes });
          }
        } else {
          mistakes++; b.classList.add('bad'); ctx.sfx.play('fout'); setTimeout(() => b.classList.remove('bad'), 500);
          if (mistakes >= 2) [...row.children].find((x) => !x.disabled && x.textContent === gs[pos])?.classList.add('hint');
        }
      }, ctx);
      row.append(b);
    }
  });
}

// ---------- kiezen (logica) ----------
export async function pick(params, ctx) {
  const { q = 'Welke is het?', options = [] } = params;
  const p = panel(ctx, '');
  p.dataset.answer = options.find((o) => o.correct)?.pic || '';
  const row = h('div', { class: 'row' });
  p.append(row);
  let mistakes = 0;
  ctx.speak(q, 'verteller');
  const opts = shuffle(options);
  return new Promise((resolve) => {
    for (const o of opts) {
      const b = h('button', { class: 'tile' }, o.pic, o.label ? h('span', { class: 'lbl' }, o.label) : null);
      tapper(b, async () => {
        if (o.correct) {
          b.classList.add('good'); ctx.sfx.play('goed'); [...row.children].forEach((x) => (x.disabled = true));
          if (o.say) await ctx.speak(o.say, 'verteller');
          resolve({ mistakes });
        } else {
          mistakes++; b.classList.add('bad'); ctx.sfx.play('fout'); setTimeout(() => b.classList.remove('bad'), 500);
          await ctx.speak(o.say || (mistakes >= 2 ? ctx.hintText || 'Kijk nog eens goed.' : 'Hmm, die past niet. Kijk nog eens goed!'), 'verteller');
          if (mistakes >= 3) [...row.children][opts.findIndex((x) => x.correct)]?.classList.add('hint');
        }
      }, ctx);
      row.append(b);
    }
  });
}

// ---------- springen op blokken ----------
export async function jump(params, ctx) {
  const blocks = params.blocks ?? 5, coinsWanted = params.coins ?? blocks;
  const p = panel(ctx, 'Tik op het volgende blok om te springen!');
  const world = h('div', { class: 'jumpworld' });
  p.append(world);
  const heights = Array.from({ length: blocks }, (_, i) => 12 + ((i * 37) % 4) * 9 + rnd(5));
  const els = heights.map((ht, i) => {
    const el = h('div', { class: 'block', style: `left:${8 + i * (84 / blocks) + 4}%;height:${ht}%` });
    world.append(el);
    return el;
  });
  const coins = heights.slice(0, coinsWanted).map((ht, i) => {
    const c = h('div', { class: 'coin', style: `left:${8 + i * (84 / blocks) + 6}%;bottom:${ht + 22}%` }, '⭐');
    world.append(c); return c;
  });
  const hero = h('div', { class: 'hero', style: 'left:0%;bottom:0%' }, params.hero || '🧒');
  world.append(hero);
  let at = -1, got = 0;
  const mark = () => els.forEach((e, i) => e.classList.toggle('target', i === at + 1));
  mark();
  return new Promise((resolve) => {
    world.addEventListener('click', async (e) => {
      const i = els.indexOf(e.target);
      if (i < 0) return;
      if (i !== at + 1) { ctx.sfx.play('fout'); ctx.speak('Eén voor één springen! Het blok met de gele rand.', 'verteller'); return; }
      at = i; ctx.sfx.play('sprong');
      hero.style.bottom = `${heights[i] + 18}%`; hero.style.left = `${8 + i * (84 / blocks) + 5}%`;
      await wait(300);
      hero.style.bottom = `${heights[i]}%`;
      if (coins[i]) { coins[i].classList.add('got'); got++; ctx.sfx.play('ster'); ctx.speak(NUM_WORDS[got], 'verteller'); }
      mark();
      if (at === blocks - 1) { await wait(600); resolve({ mistakes: 0, coins: got }); }
    });
  });
}

export const GAMES = { count, sum, memory, word, pick, jump };
