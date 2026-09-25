// sfx.js – alle geluiden gegenereerd met WebAudio (geen audiobestanden).
// Gebruik: sfx.unlock() bij eerste tik, sfx.play('goed'), sfx.music(true/false), sfx.volume = 0..1.
// Alles is een no-op als WebAudio ontbreekt; niets gooit een exception.

const AC = typeof window !== 'undefined' ? (window.AudioContext || window.webkitAudioContext) : null;
let ctx = null, master = null, musicBus = null, noiseBuf = null;
let vol = 0.8;

function init() {
  if (ctx || !AC) return ctx;
  try {
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = vol;
    const comp = ctx.createDynamicsCompressor();
    master.connect(comp); comp.connect(ctx.destination);
    musicBus = ctx.createGain();
    musicBus.gain.value = 0;
    musicBus.connect(master);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  } catch (e) { ctx = null; }
  return ctx;
}

// Eén toon met envelope. f1 = eindfrequentie (glijden), optioneel.
function tone(f0, t, dur, { type = 'sine', v = 0.3, f1 = null, a = 0.005, out = null, curve = 'exp' } = {}) {
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f0, t);
  if (f1) curve === 'exp' ? o.frequency.exponentialRampToValueAtTime(f1, t + dur) : o.frequency.linearRampToValueAtTime(f1, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(v, t + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(out || master);
  o.start(t); o.stop(t + dur + 0.05);
  return o;
}

// Ruis door een filter, met optionele filterzwaai.
function noise(t, dur, { type = 'bandpass', f = 1000, f1 = null, q = 1, v = 0.3, a = 0.01 } = {}) {
  const s = ctx.createBufferSource(), fl = ctx.createBiquadFilter(), g = ctx.createGain();
  s.buffer = noiseBuf; s.loop = true;
  fl.type = type; fl.Q.value = q;
  fl.frequency.setValueAtTime(f, t);
  if (f1) fl.frequency.exponentialRampToValueAtTime(f1, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(v, t + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(fl); fl.connect(g); g.connect(master);
  s.start(t, Math.random()); s.stop(t + dur + 0.05);
  return { fl, g };
}

const N = { C4: 261.63, D4: 293.66, E4: 329.63, G4: 392, A4: 440, C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880, C6: 1046.5, E6: 1318.5, G6: 1568, C7: 2093 };

const SOUNDS = {
  tap(t) { tone(700, t, 0.07, { v: 0.2, f1: 520 }); },
  goed(t) {
    [N.C5, N.E5, N.G5, N.C6].forEach((f, i) => tone(f, t + i * 0.08, 0.28, { type: 'triangle', v: 0.25 }));
  },
  fout(t) { // zacht "hmm-mm", niet bestraffend
    tone(392, t, 0.22, { type: 'sine', v: 0.18, f1: 370 });
    tone(330, t + 0.18, 0.32, { type: 'sine', v: 0.16, f1: 310 });
  },
  ster(t) {
    [N.E6, N.G6, N.C7, N.G6 * 2].forEach((f, i) => {
      tone(f, t + i * 0.06, 0.4, { type: 'triangle', v: 0.14 });
      tone(f * 1.5, t + i * 0.06 + 0.02, 0.25, { type: 'sine', v: 0.05 });
    });
  },
  whoosh(t) { noise(t, 0.55, { f: 300, f1: 2400, q: 2, v: 0.35, a: 0.2 }); },
  dreun(t) { // diepe BOEM
    tone(90, t, 1.1, { v: 0.9, f1: 32, a: 0.01 });
    tone(55, t, 1.3, { type: 'triangle', v: 0.5, f1: 28 });
    noise(t, 0.6, { type: 'lowpass', f: 400, f1: 60, q: 0.7, v: 0.7, a: 0.005 });
  },
  bel(t) { // fietsbelletje: tring-tring
    for (let r = 0; r < 2; r++) {
      const t0 = t + r * 0.32;
      for (let k = 0; k < 5; k++) {
        const tk = t0 + k * 0.035;
        const v = 0.16 * (1 - k * 0.12);
        tone(2350, tk, 0.28, { v, a: 0.002 });
        tone(3180, tk, 0.2, { v: v * 0.6, a: 0.002 });
        tone(5020, tk, 0.1, { v: v * 0.25, a: 0.002 });
      }
    }
  },
  pop(t) { tone(380, t, 0.1, { v: 0.35, f1: 1100 }); noise(t, 0.04, { f: 2000, q: 1, v: 0.1, a: 0.002 }); },
  klim(t) { [N.C5, N.D5, N.E5].forEach((f, i) => tone(f, t + i * 0.1, 0.09, { type: 'square', v: 0.07, f1: f * 1.06 })); },
  sprong(t) { // eigen "boing": snel omhoog glijden, zacht afronden
    tone(260, t, 0.28, { type: 'square', v: 0.09, f1: 980 });
    tone(520, t, 0.22, { type: 'triangle', v: 0.1, f1: 1500 });
  },
  fanfare(t) {
    const mel = [[N.G4, 0, 0.14], [N.C5, 0.15, 0.14], [N.E5, 0.3, 0.14], [N.G5, 0.45, 0.3], [N.E5, 0.78, 0.12], [N.G5, 0.92, 0.7]];
    mel.forEach(([f, d, l]) => {
      tone(f, t + d, l + 0.1, { type: 'square', v: 0.07 });
      tone(f, t + d, l + 0.1, { type: 'triangle', v: 0.16 });
    });
    [N.C4, N.E4, N.G4].forEach(f => tone(f, t + 0.92, 0.8, { type: 'triangle', v: 0.1 }));
  },
  papegaai(t) { // kwetter
    [0, 0.11, 0.2, 0.36].forEach((d, i) => {
      const f = 1600 + (i % 2) * 700;
      tone(f, t + d, 0.09, { type: 'sine', v: 0.18, f1: f * (i % 2 ? 0.7 : 1.6), a: 0.004 });
      tone(f * 2.02, t + d, 0.07, { type: 'triangle', v: 0.04, f1: f * 2.5 });
    });
  },
  piep(t) { // robot: bliep-bloep
    tone(880, t, 0.1, { type: 'square', v: 0.08 });
    tone(1320, t + 0.12, 0.1, { type: 'square', v: 0.08 });
    tone(660, t + 0.24, 0.16, { type: 'square', v: 0.07, f1: 990 });
  },
  wind(t) {
    const { fl } = noise(t, 2.4, { f: 400, q: 3, v: 0.25, a: 0.8 });
    fl.frequency.linearRampToValueAtTime(900, t + 1.1);
    fl.frequency.linearRampToValueAtTime(350, t + 2.3);
  },
};

// Achtergrondmuziekje: pentatonisch (C D E G A), zacht, loopt.
const MEL = ['E5', 'G5', 'A5', 'G5', 'E5', 'D5', 'C5', 'D5', 'E5', 'G5', 'E5', 'D5', 'C5', null, 'D5', null,
  'G4', 'A4', 'C5', 'D5', 'E5', 'D5', 'C5', 'A4', 'G4', 'A4', 'C5', 'E5', 'D5', null, 'C5', null];
const BASS = ['C4', 'A4', 'G4', 'C4'].map(n => N[n] / 2);
const STEP = 0.3; // seconden per achtste noot
let musicOn = false, timer = null, step = 0, nextT = 0;

function schedule() {
  if (!ctx || !musicOn) return;
  while (nextT < ctx.currentTime + 0.4) {
    const n = MEL[step % MEL.length];
    if (n) tone(N[n], nextT, STEP * 1.6, { type: 'triangle', v: 0.25, a: 0.02, out: musicBus });
    if (step % 4 === 0) tone(BASS[(step / 8 | 0) % BASS.length], nextT, STEP * 3.6, { type: 'sine', v: 0.3, a: 0.04, out: musicBus });
    step++; nextT += STEP;
  }
}

export const sfx = {
  get volume() { return vol; },
  set volume(v) {
    vol = Math.max(0, Math.min(1, Number(v) || 0));
    if (master) try { master.gain.setTargetAtTime(vol, ctx.currentTime, 0.02); } catch (e) { /* stil */ }
  },
  unlock() {
    if (!init()) return;
    try {
      if (ctx.state !== 'running') ctx.resume();
      // stille buffer: nodig op oudere iOS om audio vrij te geven
      const s = ctx.createBufferSource();
      s.buffer = ctx.createBuffer(1, 1, 22050);
      s.connect(ctx.destination); s.start(0);
    } catch (e) { /* stil */ }
  },
  play(name) {
    try {
      if (!init() || !SOUNDS[name]) return;
      if (ctx.state !== 'running') ctx.resume();
      SOUNDS[name](ctx.currentTime + 0.01);
    } catch (e) { /* stil */ }
  },
  music(on) {
    try {
      if (!init()) return;
      const t = ctx.currentTime;
      if (on) {
        if (musicOn) return;
        musicOn = true; step = 0; nextT = t + 0.1;
        musicBus.gain.cancelScheduledValues(t);
        musicBus.gain.setTargetAtTime(0.18, t, 0.5); // laag volume, stoort TTS niet
        schedule();
        timer = setInterval(schedule, 100);
      } else {
        musicOn = false;
        clearInterval(timer); timer = null;
        musicBus.gain.cancelScheduledValues(t);
        musicBus.gain.setTargetAtTime(0, t, 0.15);
      }
    } catch (e) { /* stil */ }
  },
};

export default sfx;
