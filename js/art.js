// art.js – vlakke SVG-kunst voor De Sterrenkompas-Avonturen.
// Eigen stijl: zachte ronde vormen, warme kleuren, dikke donkere contour, grote ogen.
// Geen dependencies. Alle functies geven een SVG-string terug en gooien nooit.

const OL = '#3b2a1a';           // contourkleur
const SKIN = '#f7c9a0';
const N = 'stroke="none"';
const MOODS = ['blij', 'verbaasd', 'denkt', 'lacht'];
let uid = 0;

// Template-tag die getallen afrondt (houdt de SVG klein).
const f = (s, ...v) => s.reduce((a, x, i) => a + x + (i < v.length ? (typeof v[i] === 'number' ? Math.round(v[i] * 10) / 10 : v[i]) : ''), '');
const rng = seed => { let s = seed; return () => (s = s * 16807 % 2147483647) / 2147483647; };

const svg = (vb, body, extra = '') =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="100%" height="100%" ${extra}>${body}</svg>`;

export const CHAR_NAMES = {
  held: '{HELD}', florine: 'Florine', kwebbel: 'Kwebbel', brom: 'Brom',
  rommel: 'Rommel', piep: 'Piep', schoen: 'Reuzenschoen', verteller: 'Verteller',
  racer: 'Gemaskerde racer', boot: 'Boot', raket: 'Raket', kompas: 'Sterrenkompas', kist: 'Schatkist',
};

/* ------------------------------------------------------------------ */
/* Bouwstenen achtergronden                                            */
/* ------------------------------------------------------------------ */
function sky(stops) {
  const id = 'sk' + (++uid);
  const st = stops.map((c, i) => `<stop offset="${i / (stops.length - 1)}" stop-color="${c}"/>`).join('');
  return `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">${st}</linearGradient></defs><rect width="1600" height="900" fill="url(#${id})"/>`;
}
function glow(cx, cy, r, c, op = 0.6) {
  const id = 'gl' + (++uid);
  return f`<defs><radialGradient id="${id}"><stop offset="0" stop-color="${c}" stop-opacity="${op}"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient></defs><circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#${id})"/>`;
}
function rays(x, y, n = 5, op = 0.2) {
  let s = '';
  for (let i = 0; i < n; i++) {
    const a = 0.45 + i * 0.2, b = a + 0.08;
    s += f`<polygon points="${x},${y} ${x + Math.cos(a) * 2200},${y + Math.sin(a) * 2200} ${x + Math.cos(b) * 2200},${y + Math.sin(b) * 2200}"/>`;
  }
  return `<g fill="#fffbe6" opacity="${op}">${s}</g>`;
}
function pine(x, by, h, c = '#3f8f5a', ol = true) {
  const st = ol ? `stroke="${OL}" stroke-width="5" stroke-linejoin="round"` : '';
  let s = ol ? f`<rect x="${x - h * 0.05}" y="${by - h * 0.2}" width="${h * 0.1}" height="${h * 0.2}" fill="#7a4e2d"/>` : '';
  for (let i = 2; i >= 0; i--) {
    const top = by - h + i * h * 0.22, bot = top + h * 0.42, hw = h * (0.2 + i * 0.1);
    s += f`<path d="M${x},${top}L${x + hw},${bot}Q${x},${bot + h * 0.06} ${x - hw},${bot}Z"/>`;
  }
  return `<g fill="${c}" ${st}>${s}</g>`;
}
function birch(x, by, h) {
  const w = h * 0.07;
  let s = f`<g stroke="${OL}" stroke-width="5"><rect x="${x - w / 2}" y="${by - h * 0.75}" width="${w}" height="${h * 0.75}" rx="${w / 3}" fill="#f5f0e6"/>`;
  s += f`<g fill="#8bc255"><circle cx="${x - h * 0.13}" cy="${by - h * 0.72}" r="${h * 0.16}"/><circle cx="${x + h * 0.14}" cy="${by - h * 0.76}" r="${h * 0.15}"/><circle cx="${x}" cy="${by - h * 0.88}" r="${h * 0.18}"/></g></g>`;
  for (let i = 0; i < 4; i++) s += f`<rect x="${x - w / 2 + (i % 2) * w * 0.4}" y="${by - h * (0.15 + i * 0.13)}" width="${w * 0.55}" height="6" rx="3" fill="${OL}"/>`;
  return s;
}
function blobs(pts, c, ol = true, sw = 5) {
  const st = ol ? `stroke="${OL}" stroke-width="${sw}"` : '';
  return `<g fill="${c}" ${st}>` + pts.map(p => f`<circle cx="${p[0]}" cy="${p[1]}" r="${p[2]}"/>`).join('') + '</g>';
}
function cloud(x, y, s) {
  return blobs([[x, y, 40 * s], [x + 45 * s, y - 20 * s, 50 * s], [x + 95 * s, y, 38 * s], [x + 45 * s, y + 10 * s, 40 * s]], '#fff', false).replace('<g', '<g opacity=".9"');
}
function ground(y, c, ol = false) {
  return f`<path d="M0,${y}Q400,${y - 24} 800,${y}T1600,${y}V900H0Z" fill="${c}" ${ol ? `stroke="${OL}" stroke-width="5"` : ''}/>`;
}
function tufts(list, c = '#6fae55') {
  return `<g fill="none" stroke="${c}" stroke-width="6" stroke-linecap="round">` +
    list.map(([x, y]) => f`<path d="M${x - 14},${y}Q${x - 12},${y - 20} ${x - 20},${y - 30}M${x},${y}V${y - 34}M${x + 14},${y}Q${x + 12},${y - 20} ${x + 20},${y - 30}"/>`).join('') + '</g>';
}
function mushroom(x, y, s = 1) {
  return f`<g stroke="${OL}" stroke-width="5"><rect x="${x - 10 * s}" y="${y - 34 * s}" width="${20 * s}" height="${34 * s}" rx="${8 * s}" fill="#f7ecd8"/><path d="M${x - 40 * s},${y - 30 * s}Q${x},${y - 90 * s} ${x + 40 * s},${y - 30 * s}Z" fill="#e5533f"/></g><g fill="#fff"><circle cx="${x - 14 * s}" cy="${y - 48 * s}" r="${6 * s}"/><circle cx="${x + 12 * s}" cy="${y - 54 * s}" r="${7 * s}"/><circle cx="${x + 26 * s}" cy="${y - 38 * s}" r="${4 * s}"/></g>`;
}
function flowers(list) {
  return list.map(([x, y, c]) => f`<g><circle cx="${x}" cy="${y}" r="9" fill="${c}" stroke="${OL}" stroke-width="3"/><circle cx="${x}" cy="${y}" r="3.5" fill="#ffd54a"/></g>`).join('');
}
function sparkle(x, y, s, c = '#fff6c8') {
  return f`<path d="M${x},${y - s}Q${x},${y} ${x + s},${y}Q${x},${y} ${x},${y + s}Q${x},${y} ${x - s},${y}Q${x},${y} ${x},${y - s}Z" fill="${c}"/>`;
}
function stars(seed, n, maxY, big = 6) {
  const r = rng(seed); let s = '<g fill="#fff">';
  for (let i = 0; i < n; i++) s += f`<circle cx="${r() * 1600}" cy="${r() * maxY}" r="${1 + r() * 2.4}" opacity="${0.5 + r() * 0.5}"/>`;
  s += '</g>';
  for (let i = 0; i < big; i++) s += sparkle(r() * 1600, r() * maxY * 0.8, 10 + r() * 10);
  return s;
}
function waterLines(list, c = '#fff', op = 0.55) {
  return `<g stroke="${c}" stroke-width="6" stroke-linecap="round" opacity="${op}">` +
    list.map(([x, y, w]) => f`<path d="M${x},${y}h${w}"/>`).join('') + '</g>';
}

function gull(x, y, s = 1) {
  return f`<path d="M${x - 34 * s},${y + 2 * s}Q${x - 18 * s},${y - 18 * s} ${x},${y}Q${x + 18 * s},${y - 18 * s} ${x + 34 * s},${y + 2 * s}Q${x + 18 * s},${y - 7 * s} ${x},${y + 6 * s}Q${x - 18 * s},${y - 7 * s} ${x - 34 * s},${y + 2 * s}Z" fill="#fff" stroke="${OL}" stroke-width="3.5" stroke-linejoin="round"/>`;
}
function waveBand(y, amp, len, c, off = 0, foam = '#e8f8ff') {
  let d = f`M${off - len},${y}`;
  for (let x = off - len; x < 1600 + len; x += len) d += f`q${len / 2},${-amp} ${len},0`;
  return `<path d="${d}V900H${off - len}Z" fill="${c}"/><path d="${d}" fill="none" stroke="${foam}" stroke-width="6" stroke-linecap="round" opacity=".75"/>`;
}
function palm(x, y, h, lean, s = 1) {
  const tx = x + lean * 1.4, ty = y - h, d = f`M${x},${y}Q${x + lean},${y - h / 2} ${tx},${ty}`;
  let fr = '', rib = '';
  for (const [dx, dy] of [[-150, 50], [-125, -25], [-45, -70], [50, -72], [128, -22], [150, 55]]) {
    const ex = tx + dx * s, ey = ty + dy * s, cx = tx + dx * s * 0.5, cy = ty + dy * s - 62 * s;
    fr += f`<path d="M${tx},${ty}Q${cx},${cy} ${ex},${ey}Q${cx + dx * s * 0.1},${cy + 84 * s} ${tx},${ty}Z"/>`;
    rib += f`M${tx},${ty}Q${cx + dx * s * 0.05},${cy + 38 * s} ${ex},${ey}`;
  }
  return `<path d="${d}" fill="none" stroke="${OL}" stroke-width="${32 * s}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#c08a50" stroke-width="${21 * s}" stroke-linecap="round"/>` +
    `<path d="${d}" fill="none" stroke="#9a6a3a" stroke-width="${21 * s}" stroke-dasharray="${5 * s} ${20 * s}"/>` +
    `<g fill="#4fae5a" stroke="${OL}" stroke-width="5" stroke-linejoin="round">${fr}</g><path d="${rib}" fill="none" stroke="#3a8a47" stroke-width="4"/>` +
    blobs([[tx - 14 * s, ty + 12 * s, 12 * s], [tx + 10 * s, ty + 16 * s, 12 * s], [tx - 2 * s, ty + 4 * s, 11 * s]], '#8a5a2b', true, 4);
}
function fern(x, y, s = 1, c = '#4f9a5a') {
  return `<g fill="${c}" stroke="${OL}" stroke-width="4">` + [-64, -32, 64, 32, 0].map(a => f`<ellipse cx="${x}" cy="${y - 58 * s}" rx="${13 * s}" ry="${60 * s}" transform="rotate(${a} ${x} ${y})"/>`).join('') + '</g>';
}
function rock(x, y, w, h, c = '#a3a8b4') {
  return f`<path d="M${x - w},${y}Q${x - w},${y - h} ${x - w * 0.2},${y - h}Q${x + w},${y - h * 1.05} ${x + w},${y}Z" fill="${c}" stroke="${OL}" stroke-width="5"/><path d="M${x - w * 0.6},${y - h * 0.55}Q${x - w * 0.4},${y - h * 0.85} ${x},${y - h * 0.86}" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".45"/>`;
}
function starfish(x, y, s = 1, c = '#ff9b6a') {
  let d = '';
  for (let i = 0; i < 10; i++) { const a = i * Math.PI / 5 - Math.PI / 2, r = (i % 2 ? 9 : 22) * s; d += f`${i ? 'L' : 'M'}${x + Math.cos(a) * r},${y + Math.sin(a) * r}`; }
  return `<path d="${d}Z" fill="${c}" stroke="${OL}" stroke-width="4" stroke-linejoin="round"/>`;
}
function shell(x, y, s = 1, c = '#ffd9e6') {
  return f`<path d="M${x - 18 * s},${y}Q${x - 20 * s},${y - 26 * s} ${x},${y - 28 * s}Q${x + 20 * s},${y - 26 * s} ${x + 18 * s},${y}Z" fill="${c}" stroke="${OL}" stroke-width="4" stroke-linejoin="round"/><path d="M${x},${y}V${y - 24 * s}M${x - 9 * s},${y}L${x - 12 * s},${y - 20 * s}M${x + 9 * s},${y}L${x + 12 * s},${y - 20 * s}" stroke="${OL}" stroke-width="2.5" opacity=".5"/>`;
}
// Slinger langs een doorhangende lijn: vlaggetjes (kind 0) of lampjes (kind 1).
function garland(x0, y0, x1, y1, sag, n, cols, kind = 0) {
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2 + sag * 2;
  const P = t => [(1 - t) * (1 - t) * x0 + 2 * t * (1 - t) * cx + t * t * x1, (1 - t) * (1 - t) * y0 + 2 * t * (1 - t) * cy + t * t * y1];
  const gid = 'gg' + (++uid);
  let s = (kind ? f`<defs><radialGradient id="${gid}"><stop offset="0" stop-color="#fff3c0" stop-opacity=".7"/><stop offset="1" stop-color="#fff3c0" stop-opacity="0"/></radialGradient></defs>` : '') + f`<path d="M${x0},${y0}Q${cx},${cy} ${x1},${y1}" fill="none" stroke="${OL}" stroke-width="4"/>`;
  for (let i = 0; i < n; i++) {
    const c = cols[i % cols.length];
    if (kind) {
      const [x, y] = P((i + 0.5) / n);
      s += f`<circle cx="${x}" cy="${y + 16}" r="36" fill="url(#${gid})"/><path d="M${x},${y - 2}v8" stroke="${OL}" stroke-width="12"/><ellipse cx="${x}" cy="${y + 18}" rx="10" ry="13" fill="${c}" stroke="${OL}" stroke-width="3"/>`;
    } else {
      const [ax, ay] = P((i + 0.12) / n), [bx, by] = P((i + 0.88) / n);
      s += f`<path d="M${ax},${ay}L${bx},${by}L${(ax + bx) / 2},${(ay + by) / 2 + 50}Z" fill="${c}" stroke="${OL}" stroke-width="4" stroke-linejoin="round"/>`;
    }
  }
  return s;
}
function crater(x, y, rx, ry, c = '#7a73a6', rim = '#b3acd9') {
  return f`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${c}" stroke="${OL}" stroke-width="4"/><path d="M${x - rx * 0.8},${y + ry * 0.3}Q${x},${y + ry * 1.1} ${x + rx * 0.8},${y + ry * 0.3}" fill="none" stroke="${rim}" stroke-width="4" stroke-linecap="round"/>`;
}
function moon(x, y, r, c, dark) {
  return glow(x, y, r * 2.2, c, 0.35) + f`<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" stroke="${OL}" stroke-width="5"/>` +
    blobs([[x - r * 0.35, y - r * 0.2, r * 0.22], [x + r * 0.3, y + r * 0.3, r * 0.16], [x + r * 0.25, y - r * 0.45, r * 0.1]], dark, false);
}

// Het sterrenkompas (gedeeld met titel en icoon).
export function compass(cx, cy, r) {
  let s = f`<circle cx="${cx}" cy="${cy}" r="${r}" fill="#f6c34a" stroke="${OL}" stroke-width="${r * 0.045}"/>`;
  s += f`<circle cx="${cx}" cy="${cy}" r="${r * 0.9}" fill="#fbd873"/>`;
  s += f`<circle cx="${cx}" cy="${cy}" r="${r * 0.8}" fill="#24346b" stroke="${OL}" stroke-width="${r * 0.035}"/>`;
  for (let i = 0; i < 16; i++) {
    const a = i * Math.PI / 8;
    s += f`<circle cx="${cx + Math.sin(a) * r * 0.85}" cy="${cy - Math.cos(a) * r * 0.85}" r="${r * (i % 4 ? 0.018 : 0.03)}" fill="#a8741e"/>`;
  }
  const ri = r * 0.15;
  let outline = '';
  for (let i = 0; i < 8; i++) {
    const a = i * Math.PI / 4, L = r * (i % 2 ? 0.44 : 0.74);
    const tip = [cx + Math.sin(a) * L, cy - Math.cos(a) * L];
    const lft = [cx + Math.sin(a - Math.PI / 8) * ri, cy - Math.cos(a - Math.PI / 8) * ri];
    const rgt = [cx + Math.sin(a + Math.PI / 8) * ri, cy - Math.cos(a + Math.PI / 8) * ri];
    const [c1, c2] = i === 0 ? ['#ff8a66', '#e0553a'] : i % 2 ? ['#fff7dc', '#d9cda4'] : ['#ffe38f', '#f0ae2c'];
    s += f`<path d="M${cx},${cy}L${tip[0]},${tip[1]}L${lft[0]},${lft[1]}Z" fill="${c1}"/><path d="M${cx},${cy}L${tip[0]},${tip[1]}L${rgt[0]},${rgt[1]}Z" fill="${c2}"/>`;
    outline += f`${i ? 'L' : 'M'}${lft[0]},${lft[1]}L${tip[0]},${tip[1]}L${rgt[0]},${rgt[1]}`;
  }
  s += `<path d="${outline}Z" fill="none" stroke="${OL}" stroke-width="${Math.max(2, r * 0.025)}" stroke-linejoin="round"/>`;
  s += f`<circle cx="${cx}" cy="${cy}" r="${r * 0.08}" fill="#fff" stroke="${OL}" stroke-width="${Math.max(2, r * 0.025)}"/>`;
  s += sparkle(cx - r * 0.42, cy - r * 0.5, r * 0.09, '#fff');
  return s;
}

/* ------------------------------------------------------------------ */
/* Achtergronden                                                        */
/* ------------------------------------------------------------------ */
const BG = {
  bos() {
    const r = rng(7); let far = '';
    for (let x = -30; x < 1650; x += 85) far += pine(x, 640, 220 + r() * 110, '#9ccfa2', false);
    return sky(['#b8e4f2', '#fff3d6']) + rays(160, -60, 6) +
      f`<path d="M0,560Q300,470 620,540T1200,520T1600,540V700H0Z" fill="#c4e3a8"/>` + far +
      ground(640, '#9dd07a') +
      pine(150, 690, 520) + pine(440, 660, 400, '#4b9c62') + birch(300, 700, 460) +
      birch(1210, 690, 440) + pine(1380, 700, 540) + pine(1080, 650, 360, '#4b9c62') + pine(1560, 690, 420, '#4b9c62') +
      ground(700, '#8cc56a') +
      `<path d="M640,900Q740,780 780,690L830,690Q880,780 1000,900Z" fill="#ead6a0"/>` +
      mushroom(110, 790) + mushroom(1490, 810, 0.8) +
      tufts([[260, 760], [520, 840], [1150, 780], [1330, 860]]) +
      flowers([[380, 800, '#fff'], [420, 820, '#ff9ec4'], [1240, 820, '#fff'], [1100, 850, '#ffb14a']]);
  },
  ven() {
    const id = 'w' + (++uid);
    let pads = '';
    for (const [x, y, s, fl] of [[330, 610, 1, 1], [470, 700, 1.2, 0], [1180, 640, 1.1, 1], [1330, 720, 1, 0], [760, 590, 0.8, 0], [1000, 760, 1, 1]]) {
      pads += f`<path d="M${x},${y}L${x + 44 * s},${y - 7 * s}A${47 * s},${20 * s} 0 1 1 ${x + 44 * s},${y + 7 * s}Z" fill="#5dbb63" stroke="${OL}" stroke-width="4"/>`;
      if (fl) pads += f`<g stroke="${OL}" stroke-width="3" fill="#ffa6cb"><ellipse cx="${x - 14}" cy="${y - 12}" rx="11" ry="18" transform="rotate(-30 ${x - 14} ${y - 12})"/><ellipse cx="${x + 14}" cy="${y - 12}" rx="11" ry="18" transform="rotate(30 ${x + 14} ${y - 12})"/><ellipse cx="${x}" cy="${y - 16}" rx="11" ry="20"/></g><circle cx="${x}" cy="${y - 8}" r="6" fill="#ffd54a"/>`;
    }
    let reeds = '';
    for (const x of [40, 80, 120, 170, 1440, 1490, 1530, 1575]) {
      const h = 230 + (x % 7) * 20;
      reeds += f`<path d="M${x},820Q${x + 8},${820 - h / 2} ${x - 6},${820 - h}" fill="none" stroke="#6a9a3a" stroke-width="8" stroke-linecap="round"/><rect x="${x - 17}" y="${820 - h + 10}" width="20" height="60" rx="10" fill="#8a5a2b" stroke="${OL}" stroke-width="4" transform="rotate(${(x % 3) * 4 - 4} ${x} ${820 - h})"/>`;
    }
    return sky(['#aee0f2', '#fff2d2']) + cloud(1100, 150, 1.1) + cloud(300, 110, 0.8) +
      blobs([[40, 470, 90], [170, 440, 100], [330, 470, 90], [480, 450, 100], [640, 480, 80], [800, 460, 100], [960, 480, 90], [1110, 440, 110], [1280, 470, 90], [1440, 450, 100], [1580, 470, 90]], '#7fbf7a', false) +
      blobs([[100, 510, 70], [400, 520, 70], [700, 520, 60], [1000, 515, 70], [1300, 520, 70], [1560, 520, 60]], '#5fa866', false) +
      `<rect y="520" width="1600" height="60" fill="#9dd07a"/>` +
      f`<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fd6ee"/><stop offset="1" stop-color="#4a9fd0"/></linearGradient></defs>` +
      `<path d="M0,560Q800,530 1600,560V820H0Z" fill="url(#${id})" stroke="${OL}" stroke-width="5"/>` +
      waterLines([[200, 600, 90], [560, 640, 120], [900, 620, 80], [1250, 600, 110], [680, 740, 100], [1400, 780, 70], [150, 760, 80]]) +
      pads + ground(800, '#8cc56a', true) + reeds +
      tufts([[400, 860], [700, 880], [1100, 850]]) + flowers([[520, 860, '#fff'], [1240, 870, '#ffb14a']]);
  },
  hut() {
    let planks = '';
    for (let i = 0; i < 9; i++) planks += f`<rect x="${700 + i * 38}" y="${470 + (i % 3) * 6}" width="38" height="${190 - (i % 3) * 6}" fill="${i % 2 ? '#b8793f' : '#a86a35'}"/>`;
    let sticks = '';
    for (let i = 0; i < 7; i++) sticks += f`<path d="M${880 - 10 + i * 4},335L${660 + i * 70},${490}"/>`;
    return sky(['#b8e4f2', '#fff3d6']) + rays(-100, -80, 4, 0.18) +
      pine(80, 640, 300, '#9ccfa2', false) + pine(220, 640, 360, '#9ccfa2', false) + pine(400, 640, 280, '#9ccfa2', false) +
      ground(630, '#9dd07a') +
      // grote boom
      `<path d="M1090,700Q1120,500 1110,240L1250,240Q1240,500 1290,700Z" fill="#8a5a33" stroke="${OL}" stroke-width="6"/>` +
      `<path d="M1150,650Q1160,500 1150,330M1215,620Q1205,480 1220,360" fill="none" stroke="#6d4424" stroke-width="7" stroke-linecap="round"/>` +
      blobs([[900, 200, 130], [1060, 120, 150], [1250, 90, 160], [1440, 150, 150], [1560, 260, 120], [1020, 270, 120], [1330, 270, 130]], '#5fae5a') +
      blobs([[1010, 110, 50], [1230, 60, 60], [1430, 110, 50]], '#86c96b', false) +
      // hut
      `<g stroke="${OL}" stroke-width="5" stroke-linejoin="round">` + planks +
      `<rect x="700" y="470" width="342" height="190" fill="none" stroke-width="6"/>` +
      `<path d="M650,495L880,330L1095,495Z" fill="#8a5a2b" stroke-width="6"/><g fill="none" stroke="#6d4424" stroke-width="6">` + sticks + `</g>` +
      `<path d="M835,660V580Q870,545 905,580V660Z" fill="#4a3020"/>` +
      `<rect x="945" y="535" width="60" height="55" rx="6" fill="#ffe9a8"/><path d="M975,535V590M945,562H1005" />` +
      `<path d="M880,330V250"/><path d="M880,252L940,270L880,290Z" fill="#e5533f"/>` +
      `<path d="M725,540L760,600M760,540L725,600" stroke="#6d4424" stroke-width="7"/>` +
      `</g>` +
      // ladder tegen boom
      `<g stroke="${OL}" stroke-width="5" fill="#c99a5a"><rect x="1300" y="360" width="14" height="330" rx="6" transform="rotate(8 1300 690)"/><rect x="1370" y="360" width="14" height="330" rx="6" transform="rotate(8 1370 690)"/></g>` +
      `<g stroke="${OL}" stroke-width="5" stroke-linecap="round">` + [430, 490, 550, 610].map(y => f`<path d="M${1307 - (690 - y) * 0.14},${y}H${1377 - (690 - y) * 0.14}"/>`).join('') + `</g>` +
      ground(690, '#8cc56a') + tufts([[120, 780], [560, 820], [1450, 800], [1000, 860]]) +
      mushroom(1520, 820, 0.8) + flowers([[300, 800, '#fff'], [340, 830, '#ff9ec4'], [1180, 830, '#fff']]);
  },
  boom() {
    return sky(['#8fd3f4', '#dff3e4']) + cloud(180, 160, 1) + cloud(1300, 420, 0.8) +
      // takken
      `<g fill="#8a5a33" stroke="${OL}" stroke-width="6" stroke-linejoin="round">` +
      `<path d="M930,420Q700,380 380,300L372,334Q690,430 920,480Z"/>` +
      `<path d="M1070,300Q1250,240 1560,200L1566,236Q1260,290 1080,360Z"/>` +
      `<path d="M950,170Q800,120 620,40L600,70Q780,160 940,230Z"/>` +
      `<path d="M960,900Q1000,600 950,0H1130Q1100,600 1200,900Z"/></g>` +
      `<path d="M1010,860Q1030,600 1000,300M1100,820Q1080,560 1090,200M1050,560q20,-30 0,-60" fill="none" stroke="#6d4424" stroke-width="8" stroke-linecap="round"/>` +
      blobs([[380, 290, 80], [300, 330, 60], [620, 40, 90], [520, 70, 60], [1560, 190, 100], [1450, 160, 70], [880, -20, 160], [1200, -30, 150]], '#5fae5a') +
      blobs([[360, 270, 30], [600, 20, 36], [1540, 160, 36], [860, -40, 50]], '#86c96b', false) +
      // touw
      `<path d="M470,330Q478,560 468,800" fill="none" stroke="${OL}" stroke-width="18" stroke-linecap="round"/><path d="M470,330Q478,560 468,800" fill="none" stroke="#e0bf7e" stroke-width="10" stroke-linecap="round"/>` +
      `<g fill="#e0bf7e" stroke="${OL}" stroke-width="5">` + [470, 590, 710].map(y => f`<ellipse cx="${474}" cy="${y}" rx="18" ry="14"/>`).join('') + `</g>` +
      ground(820, '#8cc56a', true) +
      `<path d="M940,900Q930,850 880,840M1210,900Q1220,850 1280,845" fill="none" stroke="${OL}" stroke-width="6"/>` +
      tufts([[200, 870], [640, 880], [1400, 870]]);
  },
  boomtop() {
    let row = (y, c, rr, step, seed) => { const r = rng(seed); const p = []; for (let x = -40; x < 1680; x += step) p.push([x, y + r() * 20, rr + r() * rr * 0.4]); return blobs(p, c, false); };
    return sky(['#8fd3f4', '#fde8c8']) + glow(1320, 170, 220, '#fff4c2', 0.9) +
      f`<circle cx="1320" cy="170" r="70" fill="#ffe27a" stroke="${OL}" stroke-width="5"/>` +
      cloud(240, 140, 1) + cloud(760, 90, 0.7) +
      `<path d="M0,470Q300,420 700,460T1600,440V600H0Z" fill="#b5d7e6"/>` +
      // dorp met kerktoren
      `<g stroke="${OL}" stroke-width="4" stroke-linejoin="round">` +
      `<rect x="1010" y="470" width="70" height="50" fill="#f3e2c4"/><path d="M1000,472L1045,440L1090,472Z" fill="#d9644a"/>` +
      `<rect x="1210" y="478" width="80" height="44" fill="#f3e2c4"/><path d="M1200,480L1250,448L1300,480Z" fill="#d9644a"/>` +
      `<rect x="1110" y="360" width="60" height="160" fill="#e8d3b0"/><path d="M1102,362L1140,230L1178,362Z" fill="#6f8aa6"/>` +
      `<circle cx="1140" cy="400" r="16" fill="#fff"/><path d="M1140,390V400H1148" fill="none"/><path d="M1140,230V200M1130,210H1150" fill="none"/>` +
      `<path d="M1125,470Q1140,450 1155,470V520H1125Z" fill="#6d4424"/></g>` +
      row(520, '#9ccfa2', 38, 55, 3) + row(575, '#74b87e', 50, 70, 5) + row(650, '#5aa266', 64, 90, 9) +
      // tak op de voorgrond
      `<path d="M-20,790Q500,740 900,770T1620,740V900H-20Z" fill="#8a5a33" stroke="${OL}" stroke-width="6"/>` +
      `<path d="M100,830Q400,800 700,820M1000,830Q1250,800 1500,810" fill="none" stroke="#6d4424" stroke-width="7" stroke-linecap="round"/>` +
      blobs([[-10, 700, 110], [90, 780, 80], [1610, 690, 120], [1500, 760, 80]], '#5fae5a') +
      blobs([[20, 680, 40], [1580, 660, 40]], '#86c96b', false);
  },
  nacht() {
    let trees = '';
    for (let x = -20; x < 1650; x += 90) trees += pine(x, 760, 240 + ((x * 37) % 120), '#1b2d57', false);
    const r = rng(11); let ff = '';
    for (let i = 0; i < 12; i++) ff += f`<circle cx="${100 + r() * 1400}" cy="${620 + r() * 220}" r="${4 + r() * 3}" fill="#fff38a" opacity="${0.6 + r() * 0.4}"/>`;
    return sky(['#0d1540', '#27367a', '#4a4f9a']) + stars(3, 60, 620, 8) +
      glow(1280, 180, 200, '#fff3b0', 0.45) +
      f`<circle cx="1280" cy="180" r="80" fill="#fff3b0" stroke="${OL}" stroke-width="5"/><circle cx="1255" cy="160" r="14" fill="#f0dd8a"/><circle cx="1305" cy="205" r="10" fill="#f0dd8a"/>` +
      trees + ground(750, '#1a2c52') + ground(800, '#15244a') + ff;
  },
  reuzenbos() {
    const giant = (x, w, by, c, ol = true) => {
      let s = f`<path d="M${x - w * 0.95},${by}Q${x - w * 0.5},${by - 20} ${x - w * 0.5},${by - w * 0.8}L${x - w * 0.42},-20H${x + w * 0.42}L${x + w * 0.5},${by - w * 0.8}Q${x + w * 0.5},${by - 20} ${x + w * 0.95},${by}Z" fill="${c}" ${ol ? `stroke="${OL}" stroke-width="6"` : ''}/>`;
      if (ol) s += f`<path d="M${x - w * 0.2},${by - 10}Q${x - w * 0.28},400 ${x - w * 0.18},80M${x + w * 0.15},${by - 30}Q${x + w * 0.08},380 ${x + w * 0.22},40M${x - w * 0.62},${by - 4}Q${x - w * 0.42},${by - 30} ${x - w * 0.36},${by - 110}M${x + w * 0.6},${by - 4}Q${x + w * 0.42},${by - 30} ${x + w * 0.38},${by - 100}" fill="none" stroke="#00000022" stroke-width="10" stroke-linecap="round"/>`;
      return s;
    };
    const foot = (x, y, s) => f`<ellipse cx="${x}" cy="${y - 13 * s}" rx="${19 * s}" ry="${10 * s}"/><ellipse cx="${x}" cy="${y + 7 * s}" rx="${13 * s}" ry="${7 * s}"/>`;
    const r = rng(4); let leaves = '';
    for (let i = 0; i < 9; i++) { const x = 250 + r() * 1100, y = 180 + r() * 330; leaves += f`<ellipse cx="${x}" cy="${y}" rx="11" ry="6" fill="${['#f0a040', '#8bc255', '#e5733f'][i % 3]}" stroke="${OL}" stroke-width="3" transform="rotate(${r() * 180} ${x} ${y})"/>`; }
    return sky(['#a8dcc8', '#f3f0c8']) + glow(800, 120, 420, '#fff8d0', 0.7) + rays(420, -120, 6, 0.2) +
      blobs([[0, 40, 170], [330, 0, 180], [800, -20, 220], [1250, 0, 180], [1600, 30, 170]], '#b4d9a8', false) +
      giant(320, 70, 620, '#c3d6ae', false) + giant(560, 50, 610, '#cbdcb6', false) + giant(1040, 60, 610, '#cbdcb6', false) + giant(1280, 80, 620, '#c3d6ae', false) +
      `<path d="M0,600Q400,560 800,590T1600,580V900H0Z" fill="#b6dc98"/>` +
      giant(690, 110, 660, '#a07b58') + giant(1120, 130, 670, '#a07b58') +
      ground(660, '#96cc78') +
      `<path d="M770,600Q720,700 540,900H1100Q900,720 830,600Z" fill="#e6cf98" stroke="#d2b77c" stroke-width="5"/>` +
      `<g fill="#d0b074">` + foot(790, 625, 0.8) + foot(820, 670, 1.1) + foot(775, 730, 1.5) + `</g>` +
      giant(90, 300, 750, '#7a5234') + giant(1520, 320, 760, '#7a5234') +
      f`<ellipse cx="1470" cy="430" rx="34" ry="46" fill="#3b2a1a"/><g fill="#ffe27a"><circle cx="1458" cy="424" r="7"/><circle cx="1482" cy="424" r="7"/></g>` +
      fern(300, 700, 1.3) + fern(620, 660, 0.8, '#5fae5a') + fern(1330, 720, 1.25) +
      mushroom(430, 690, 2.3) + mushroom(1180, 680, 1.5) + mushroom(1260, 700, 0.9) +
      blobs([[-40, 60, 200], [260, -30, 210], [560, -60, 190], [1000, -60, 200], [1330, -30, 210], [1640, 60, 200]], '#4f9a5a') +
      blobs([[240, -60, 80], [1020, -90, 80], [1330, -70, 80], [580, -100, 60]], '#6fb86a', false) + leaves +
      tufts([[230, 800], [1120, 820], [1380, 860], [480, 870]]) +
      flowers([[330, 820, '#fff'], [1260, 840, '#ff9ec4'], [1300, 860, '#fff']]);
  },
  zee() {
    const id = 'z' + (++uid);
    const r = rng(8); let glit = '';
    for (let i = 0; i < 9; i++) glit += f`<path d="M${1150 + r() * 200},${490 + i * 14}h${30 + r() * 50}"/>`;
    return sky(['#7fcdf0', '#cdeefa', '#fff1d6']) + glow(1250, 170, 240, '#fff4c2', 0.9) +
      f`<circle cx="1250" cy="170" r="72" fill="#ffe27a" stroke="${OL}" stroke-width="5"/>` +
      cloud(260, 130, 1.1) + cloud(760, 90, 0.8) + gull(520, 230) + gull(610, 190, 0.8) + gull(960, 270, 0.6) +
      // eilandje met vuurtoren
      `<path d="M150,472Q300,400 450,472Z" fill="#8cc98a" stroke="${OL}" stroke-width="4"/>` +
      `<g stroke="${OL}" stroke-width="4" stroke-linejoin="round"><path d="M288,440L294,340H316L322,440Z" fill="#fff"/><path d="M290,410H320M292,375H318" stroke="#e5533f" stroke-width="12"/><path d="M288,440L294,340H316L322,440Z" fill="none"/><rect x="292" y="318" width="26" height="22" rx="4" fill="#ffe27a"/><path d="M288,320L305,300L322,320Z" fill="#e5533f"/></g>` +
      f`<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6cc6ea"/><stop offset="1" stop-color="#2f86c6"/></linearGradient></defs>` +
      `<rect y="470" width="1600" height="430" fill="url(#${id})"/><path d="M0,470H1600" stroke="${OL}" stroke-width="4"/>` +
      `<g stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".7">${glit}</g>` +
      `<g stroke="${OL}" stroke-width="4" stroke-linejoin="round"><path d="M960,500H1040L1028,516H972Z" fill="#b8793f"/><path d="M1000,498V430L1034,492Z" fill="#fff"/><path d="M996,440L970,492H996Z" fill="#ffd54a"/></g>` +
      waveBand(560, 12, 90, '#58b5e1') + waveBand(640, 16, 130, '#4aa4d9', 50) + waveBand(720, 20, 170, '#3d93cf', 10) +
      `<g stroke="${OL}" stroke-width="4"><path d="M1300,640q-30,0 -30,-30q0,-30 30,-30q30,0 30,30q0,30 -30,30Z" fill="#fff"/><path d="M1272,600H1328V620H1272Z" fill="#e5533f" stroke="none"/><path d="M1300,640q-30,0 -30,-30q0,-30 30,-30q30,0 30,30q0,30 -30,30Z" fill="none"/><path d="M1300,580V556" /><circle cx="1300" cy="552" r="7" fill="#ffe27a"/></g>` +
      // steiger
      `<rect x="-10" y="780" width="1620" height="130" fill="#c99a62" stroke="${OL}" stroke-width="5"/>` +
      `<path d="M0,822H1600M0,862H1600" stroke="#a9794a" stroke-width="5"/><g fill="#8a5a33">` +
      [120, 420, 760, 1080, 1420].map((x, i) => f`<circle cx="${x + (i % 2) * 60}" cy="801" r="4"/><circle cx="${x + 170}" cy="842" r="4"/>`).join('') + `</g>` +
      [240, 1360].map(x => f`<rect x="${x - 18}" y="660" width="36" height="140" rx="8" fill="#a8743f" stroke="${OL}" stroke-width="5"/><ellipse cx="${x}" cy="662" rx="18" ry="7" fill="#c99a62" stroke="${OL}" stroke-width="4"/><path d="M${x - 20},700q20,12 40,0M${x - 20},716q20,12 40,0" fill="none" stroke="#e0bf7e" stroke-width="8"/>`).join('');
  },
  eiland() {
    return sky(['#86d0f2', '#d6f1f7', '#fff0cf']) + glow(380, 150, 220, '#fff4c2', 0.9) +
      f`<circle cx="380" cy="150" r="62" fill="#ffe27a" stroke="${OL}" stroke-width="5"/>` + cloud(700, 110, 0.9) + cloud(1180, 170, 1.1) + gull(980, 110, 0.7) +
      `<rect y="440" width="1600" height="300" fill="#44a9dc"/><path d="M0,440H1600" stroke="${OL}" stroke-width="4"/>` +
      waterLines([[80, 480, 110], [300, 530, 90], [1330, 490, 120], [1400, 560, 80]]) +
      `<path d="M1130,450Q1200,415 1270,450Z" fill="#f3dca0" stroke="${OL}" stroke-width="4"/>` + palm(1190, 440, 70, 6, 0.3) +
      blobs([[520, 560, 70], [620, 520, 80], [740, 500, 90], [870, 510, 85], [990, 530, 80], [1090, 560, 70]], '#4f9a5a') +
      blobs([[610, 500, 30], [760, 470, 34], [880, 480, 30]], '#6fb86a', false) +
      palm(1050, 580, 240, 25, 0.7) +
      `<path d="M-10,620Q300,590 600,605T1200,600T1610,612" fill="none" stroke="#e8f8ff" stroke-width="16" stroke-linecap="round"/>` +
      `<path d="M0,622Q300,596 600,610T1200,606T1600,616V900H0Z" fill="#f3dca0" stroke="${OL}" stroke-width="5"/>` +
      `<path d="M430,660Q800,450 1170,660Z" fill="#efd28e"/><path d="M430,660Q800,450 1170,660" fill="none" stroke="${OL}" stroke-width="5"/>` +
      `<path d="M855,568l22,16M877,568l-22,16" stroke="#d6b36e" stroke-width="6" stroke-linecap="round"/>` +
      tufts([[640, 590], [720, 560], [990, 580], [1080, 620]], '#8fb85a') +
      rock(470, 640, 50, 44) + rock(530, 646, 28, 26, '#b7bcc6') +
      palm(250, 800, 520, 40, 1.15) + palm(1360, 800, 470, -50, 1.05) +
      `<g stroke="${OL}" stroke-width="5" stroke-linejoin="round"><path d="M1130,690Q1150,730 1230,730Q1300,730 1320,690Z" fill="#b8793f"/><path d="M1134,692H1316" stroke-width="5"/><path d="M1170,700V726M1230,700V730M1285,700V724" stroke="#8a5a2b" stroke-width="4"/></g>` +
      starfish(230, 850) + shell(1330, 860) + shell(400, 875, 0.7, '#fff2c8');
  },
  ruimte() {
    const rid = 'rr' + (++uid);
    return sky(['#0b0f2e', '#1d1850', '#3a2a73']) + glow(380, 320, 360, '#b46bff', 0.28) + glow(1150, 560, 380, '#4fd1ff', 0.16) + stars(5, 80, 760, 10) +
      f`<defs><linearGradient id="${rid}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff6c8" stop-opacity="0"/><stop offset="1" stop-color="#fff6c8" stop-opacity=".8"/></linearGradient></defs><path d="M560,60L840,140L840,108Z" fill="url(#${rid})"/><circle cx="846" cy="124" r="18" fill="#fff6c8" stroke="${OL}" stroke-width="4"/>` +
      moon(640, 300, 32, '#d7d3e8', '#b3acd0') +
      f`<circle cx="330" cy="200" r="64" fill="#6fc3ff" stroke="${OL}" stroke-width="5"/><path d="M296,166q20,10 40,-5q12,30 -10,46q-30,5 -30,-41ZM350,222q20,-6 30,8q-10,20 -30,14Z" fill="#7ed67a"/><path d="M294,172q14,-20 40,-24" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round" opacity=".5"/>` +
      glow(1180, 270, 280, '#ffb86b', 0.32) +
      `<g transform="rotate(-15 1180 270)">` +
      f`<ellipse cx="1180" cy="270" rx="240" ry="52" fill="none" stroke="${OL}" stroke-width="30"/><ellipse cx="1180" cy="270" rx="240" ry="52" fill="none" stroke="#ffd98a" stroke-width="18"/></g>` +
      f`<circle cx="1180" cy="270" r="132" fill="#f79a5a" stroke="${OL}" stroke-width="6"/><path d="M1064,230Q1180,262 1300,220M1056,306Q1180,340 1306,296" fill="none" stroke="#e07a3e" stroke-width="18" stroke-linecap="round"/><path d="M1092,214q30,-44 86,-56" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity=".4"/>` +
      `<g transform="rotate(-15 1180 270)"><path d="M940,270A240,52 0 0 0 1420,270" fill="none" stroke="${OL}" stroke-width="30"/><path d="M940,270A240,52 0 0 0 1420,270" fill="none" stroke="#ffd98a" stroke-width="18"/><path d="M970,284A220,42 0 0 0 1390,284" fill="none" stroke="#f0b860" stroke-width="5"/></g>` +
      `<path d="M0,720Q400,640 800,690T1600,660V900H0Z" fill="#a39cd0" stroke="${OL}" stroke-width="6"/>` +
      crater(560, 700, 60, 13, '#8e87b8', '#c3bde6') + crater(1060, 684, 44, 10, '#8e87b8', '#c3bde6') +
      `<g stroke="${OL}" stroke-width="4" stroke-linejoin="round"><path d="M250,712L272,610L300,700Z" fill="#ff8fd0"/><path d="M280,716L318,640L330,712Z" fill="#ffc2e6"/><path d="M1320,690L1344,600L1370,684Z" fill="#7ff3ff"/><path d="M1350,694L1390,630L1398,690Z" fill="#c2fbff"/></g>` +
      `<path d="M0,790Q400,760 800,780T1600,770V900H0Z" fill="#8e87b8"/>` +
      crater(300, 850, 70, 15) + crater(1300, 830, 60, 13) + rock(900, 800, 34, 22, '#7a73a6');
  },
  ruimteschip() {
    const wid = 'wn' + (++uid);
    const btn = (x, y, c, r = 14) => f`<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" stroke="${OL}" stroke-width="4"/><circle cx="${x - r * 0.3}" cy="${y - r * 0.3}" r="${r * 0.3}" fill="#fff" opacity=".7"/>`;
    const dial = (x, y, a) => f`<circle cx="${x}" cy="${y}" r="30" fill="#f3f1ea" stroke="${OL}" stroke-width="4"/><path d="M${x - 20},${y + 8}A22,22 0 0 1 ${x + 20},${y + 8}" fill="none" stroke="#6bdc7a" stroke-width="5"/><path d="M${x},${y + 4}L${x + Math.cos(a) * 22},${y + 4 - Math.sin(a) * 22}" stroke="#e5533f" stroke-width="5" stroke-linecap="round"/><circle cx="${x}" cy="${y + 4}" r="5" fill="${OL}"/>`;
    const cols = ['#ff6b6b', '#ffd23f', '#6bdc7a', '#7ff3ff', '#ff9ec4'];
    let keys = '';
    for (let i = 0; i < 12; i++) keys += f`<rect x="${1170 + (i % 4) * 44}" y="${492 + Math.floor(i / 4) * 30}" width="34" height="20" rx="5" fill="${cols[i % 5]}" stroke="${OL}" stroke-width="3"/>`;
    const r = rng(9); let st = '';
    for (let i = 0; i < 40; i++) st += f`<circle cx="${590 + r() * 420}" cy="${90 + r() * 420}" r="${1 + r() * 2.5}"/>`;
    return `<rect width="1600" height="900" fill="#d6dfec"/>` +
      `<g fill="none" stroke="#c3cee0" stroke-width="8"><path d="M0,560H1600M420,90V560M1180,90V560M0,330H420M1180,330H1600"/></g>` +
      `<g fill="#aebbd0">` + [60, 380, 1220, 1540].map(x => f`<circle cx="${x}" cy="130" r="6"/><circle cx="${x}" cy="520" r="6"/>`).join('') + `</g>` +
      `<path d="M0,0H1600V80Q800,120 0,80Z" fill="#aab7cc" stroke="${OL}" stroke-width="5"/>` +
      [480, 1120].map(x => glow(x, 110, 120, '#fff6c8', 0.7) + f`<rect x="${x - 70}" y="86" width="140" height="18" rx="9" fill="#fff6c8" stroke="${OL}" stroke-width="4"/>`).join('') +
      `<path d="M-10,150H300Q330,150 330,180V330" fill="none" stroke="${OL}" stroke-width="30"/><path d="M-10,150H300Q330,150 330,180V330" fill="none" stroke="#8fa0b8" stroke-width="18"/>` +
      `<path d="M1610,150H1300Q1270,150 1270,180V330" fill="none" stroke="${OL}" stroke-width="30"/><path d="M1610,150H1300Q1270,150 1270,180V330" fill="none" stroke="#e5a04a" stroke-width="18"/>` +
      f`<defs><clipPath id="${wid}"><circle cx="800" cy="300" r="200"/></clipPath></defs>` +
      f`<circle cx="800" cy="300" r="236" fill="#9aa9bf" stroke="${OL}" stroke-width="6"/>` +
      `<g fill="#cfd8e6" stroke="${OL}" stroke-width="3">` + [0, 1, 2, 3, 4, 5, 6, 7].map(i => f`<circle cx="${800 + Math.cos(i * Math.PI / 4) * 218}" cy="${300 + Math.sin(i * Math.PI / 4) * 218}" r="8"/>`).join('') + `</g>` +
      `<g clip-path="url(#${wid})"><rect x="580" y="80" width="440" height="440" fill="#141a45"/>` + glow(700, 250, 200, '#b46bff', 0.35) + `<g fill="#fff">${st}</g>` + sparkle(680, 200, 14) + sparkle(900, 160, 10) +
      f`<circle cx="900" cy="410" r="96" fill="#f79a5a" stroke="${OL}" stroke-width="5"/><path d="M812,392q90,24 176,-10M820,440q80,16 160,-6" fill="none" stroke="#e07a3e" stroke-width="14" stroke-linecap="round"/>` + moon(700, 380, 22, '#d7d3e8', '#b3acd0') + `</g>` +
      f`<circle cx="800" cy="300" r="200" fill="none" stroke="${OL}" stroke-width="6"/><path d="M664,210q40,-66 118,-86" fill="none" stroke="#fff" stroke-width="14" stroke-linecap="round" opacity=".45"/>` +
      // linker console: sterrenkaart + knoppen
      `<rect x="190" y="180" width="250" height="150" rx="18" fill="#22314f" stroke="${OL}" stroke-width="5"/>` +
      `<g fill="#7ff3ff">` + [[230, 290], [280, 230], [340, 270], [400, 210]].map(([x, y]) => f`<circle cx="${x}" cy="${y}" r="5"/>`).join('') + `</g><path d="M230,290L280,230L340,270L400,210" fill="none" stroke="#7ff3ff" stroke-width="3" stroke-dasharray="8 7"/>` + sparkle(400, 210, 16, '#ffd23f') +
      `<path d="M160,600L200,440H470L500,600Z" fill="#b7c4d8" stroke="${OL}" stroke-width="5"/><path d="M200,440H470L476,470H194Z" fill="#8fa0b8" stroke="${OL}" stroke-width="4"/>` +
      btn(250, 510, '#ff6b6b') + btn(305, 510, '#ffd23f') + btn(360, 510, '#6bdc7a') + btn(415, 510, '#7ff3ff') + btn(280, 560, '#ff9ec4', 20) + dial(400, 560, 2.2) +
      // rechter console: meters, hendel, toetsen
      `<rect x="1160" y="180" width="250" height="150" rx="18" fill="#22314f" stroke="${OL}" stroke-width="5"/><path d="M1185,270l30,-30l25,20l30,-40l30,30l30,-20l30,18" fill="none" stroke="#6bdc7a" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>` +
      `<path d="M1100,600L1130,440H1400L1440,600Z" fill="#b7c4d8" stroke="${OL}" stroke-width="5"/><path d="M1130,440H1400L1406,470H1124Z" fill="#8fa0b8" stroke="${OL}" stroke-width="4"/>` +
      keys + dial(1380, 525, 1) + `<path d="M1150,590L1130,506" stroke="${OL}" stroke-width="14" stroke-linecap="round"/><path d="M1150,590L1130,506" stroke="#cfd8e6" stroke-width="6" stroke-linecap="round"/>` + btn(1128, 500, '#ff6b6b', 16) +
      `<rect y="600" width="1600" height="300" fill="#9aa6ba" stroke="${OL}" stroke-width="6"/>` +
      `<g stroke="#8d99ae" stroke-width="5"><path d="M0,720H1600M300,600L180,900M800,600V900M1300,600L1420,900"/></g>` +
      `<rect y="590" width="1600" height="18" fill="#ffd23f" stroke="${OL}" stroke-width="5"/>`;
  },
  kartbaan() {
    const cols = ['#e5533f', '#ffd23f', '#3a86d6', '#5dbb63'];
    const heads = ['#f2b98c', '#f7c9a0', '#c98a5a', '#8a5a3a', '#e8b07a'];
    const hats = ['#e5533f', '#3a86d6', '#ffd23f', '#5dbb63', '#ff9ec4'];
    let crowd = '';
    for (let row = 0; row < 3; row++) for (let i = 0; i < 9; i++) {
      const x = 270 + i * 52 + (row % 2) * 24, y = 440 + row * 50, k = (i * 7 + row * 3) % 5;
      crowd += f`<circle cx="${x}" cy="${y}" r="17" fill="${heads[k]}"/><path d="M${x - 17},${y - 4}Q${x},${y - 26} ${x + 17},${y - 4}Z" fill="${hats[(k + i) % 5]}"/>`;
      if ((i + row) % 4 === 0) crowd += f`<path d="M${x + 14},${y - 6}L${x + 26},${y - 40}" stroke-width="6"/><path d="M${x + 26},${y - 40}l24,6l-20,14Z" fill="${hats[i % 5]}"/>`;
    }
    let check = '';
    for (let y = 0; y < 7; y++) for (let i = 0; i < 2; i++) if ((y + i) % 2) check += f`<rect x="${1070 + i * 30}" y="${642 + y * 20}" width="30" height="20"/>`;
    let beam = '';
    for (let i = 0; i < 12; i++) beam += f`<rect x="${1020 + i * 30}" y="${i % 2 ? 360 : 380}" width="30" height="20"/>`;
    return sky(['#8fd3f4', '#fdf0d2']) + cloud(160, 170, 1) + cloud(820, 110, 0.8) +
      `<path d="M0,520Q300,430 700,480T1600,450V640H0Z" fill="#a5d98a"/>` +
      `<path d="M-20,540Q300,470 640,520T1300,500Q1500,490 1620,470" fill="none" stroke="${OL}" stroke-width="34"/><path d="M-20,540Q300,470 640,520T1300,500Q1500,490 1620,470" fill="none" stroke="#8a8f9a" stroke-width="24"/>` +
      `<g stroke="${OL}" stroke-width="3">` + [[330, 494, '#e5533f'], [420, 486, '#3a86d6'], [940, 506, '#ffd23f']].map(([x, y, c]) => f`<rect x="${x}" y="${y}" width="26" height="14" rx="5" fill="${c}"/>`).join('') + `</g>` +
      // tribune
      `<g stroke="${OL}" stroke-width="5" stroke-linejoin="round"><rect x="230" y="390" width="500" height="220" rx="12" fill="#cfd8e6"/>` +
      `<path d="M230,470H730M230,520H730M230,570H730" stroke="#aab7cc" stroke-width="6"/>` +
      `<g stroke-width="4">${crowd}</g>` +
      `<path d="M200,400L260,320H700L760,400Z" fill="#e5533f"/><path d="M290,320L270,400M380,320L370,400M470,320V400M560,320L570,400M650,320L670,400" stroke="#fff" stroke-width="12"/><path d="M200,400L260,320H700L760,400Z" fill="none"/>` +
      `<rect x="230" y="590" width="500" height="36" fill="#3a86d6"/></g>` +
      `<g fill="#fff">` + [0, 1, 2, 3, 4, 5, 6, 7].map(i => f`<rect x="${240 + i * 60}" y="596" width="30" height="12" rx="4"/>`).join('') + `</g>` +
      garland(-20, 70, 1620, 70, 50, 22, cols) +
      // bandenstapel en pionnen
      `<g stroke="${OL}" stroke-width="5">` + [[810, 600], [870, 600], [840, 562]].map(([x, y]) => f`<ellipse cx="${x}" cy="${y}" rx="30" ry="17" fill="#3a3a44"/><ellipse cx="${x}" cy="${y - 4}" rx="12" ry="6" fill="#6b6f7a"/>`).join('') +
      `<path d="M160,630L176,580L192,630Z" fill="#ff8a3a"/><path d="M168,606H184" stroke="#fff" stroke-width="6"/></g>` +
      // finishtoren met glinster
      glow(1300, 180, 200, '#fff4c2', 0.8) +
      `<g stroke="${OL}" stroke-width="5" stroke-linejoin="round"><rect x="1250" y="200" width="110" height="430" fill="#f3f1ea"/><rect x="1230" y="170" width="150" height="90" rx="12" fill="#ffd23f"/>` +
      `<rect x="1250" y="190" width="110" height="46" rx="8" fill="#9fd8f5"/><path d="M1305,190V236" stroke-width="4"/><path d="M1220,170L1305,120L1390,170Z" fill="#e5533f"/>` +
      `<path d="M1305,120V50"/><path d="M1305,52H1380V96H1305Z" fill="#fff"/></g>` +
      `<g fill="#2b2b33">` + [0, 1, 2, 3, 4].map(i => f`<rect x="${1305 + i * 15}" y="${i % 2 ? 52 : 74}" width="15" height="22"/>`).join('') + `</g>` +
      `<g stroke="${OL}" stroke-width="5"><rect x="1000" y="350" width="360" height="60" rx="8" fill="#fff"/><rect x="1000" y="410" width="18" height="220" fill="#cfd8e6"/></g><g fill="#2b2b33">${beam}</g>` +
      sparkle(1420, 120, 22) + sparkle(1210, 90, 16) + sparkle(1440, 260, 12) + sparkle(1180, 300, 12, '#fff') + sparkle(1330, 30, 10, '#fff') +
      // baan
      `<rect y="620" width="1600" height="180" fill="#6b6f7a"/>` +
      `<path d="M0,631H1600M0,789H1600" stroke="#fff" stroke-width="22"/><path d="M0,631H1600M0,789H1600" stroke="#e5533f" stroke-width="22" stroke-dasharray="40 40"/>` +
      `<path d="M0,710H1600" stroke="#fff" stroke-width="8" stroke-dasharray="60 50" opacity=".8"/>` +
      `<rect x="1070" y="642" width="60" height="136" fill="#fff"/><g fill="#2b2b33">${check}</g>` +
      `<rect x="-10" y="800" width="1620" height="110" fill="#8cc56a" stroke="${OL}" stroke-width="5"/>` + tufts([[200, 870], [700, 880], [1300, 860]]);
  },
  rivier() {
    const id = 'rv' + (++uid);
    const river = 'M980,470Q990,560 820,590Q600,620 300,612Q120,606 -20,620V744Q250,738 560,716Q900,694 1010,612Q1060,540 1040,470Z';
    let far = '';
    for (let x = 620; x < 1450; x += 70) far += pine(x, 470, 150 + (x * 13 % 70), '#9ccfa2', false);
    return sky(['#a9dcf0', '#f2f6dc']) + cloud(300, 120, 0.9) + cloud(1150, 80, 0.7) + rays(-100, -80, 4, 0.16) +
      `<path d="M0,430Q300,330 620,410T1200,380T1600,400V600H0Z" fill="#b9dfb2"/>` + far +
      rock(1010, 480, 150, 120, '#9aa3ae') + rock(900, 480, 70, 60, '#aeb6c0') +
      f`<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fe0f4"/><stop offset="1" stop-color="#4a9fd0"/></linearGradient></defs>` +
      `<path d="M985,372Q1010,366 1035,372V480H985Z" fill="#dff6ff" stroke="${OL}" stroke-width="4"/><path d="M998,380V470M1012,376V472M1024,380V466" stroke="#8fd6ee" stroke-width="4"/>` +
      ground(500, '#9dd07a') +
      pine(240, 560, 330) + pine(420, 540, 250, '#4b9c62') + birch(1250, 570, 380) + pine(1440, 580, 420) + pine(1560, 560, 300, '#4b9c62') +
      `<path d="${river}" fill="url(#${id})" stroke="${OL}" stroke-width="5"/>` +
      blobs([[960, 480, 20], [1000, 486, 24], [1050, 480, 18]], '#fff', false) +
      waterLines([[860, 600, 70], [600, 640, 110], [300, 650, 90], [100, 690, 120], [760, 670, 60]]) +
      `<g stroke="${OL}" stroke-width="4">` + [[520, 668, 34], [620, 650, 28], [710, 640, 30]].map(([x, y, w]) => f`<ellipse cx="${x}" cy="${y}" rx="${w}" ry="${w * 0.45}" fill="#b7bcc6"/>`).join('') + `</g>` +
      f`<path d="M340,660q30,-40 60,0" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/><g transform="rotate(-30 380 646)"><ellipse cx="380" cy="646" rx="20" ry="10" fill="#ff9b6a" stroke="${OL}" stroke-width="4"/><path d="M360,646l-12,-9v18Z" fill="#ff9b6a" stroke="${OL}" stroke-width="4" stroke-linejoin="round"/><circle cx="390" cy="643" r="2.5" fill="${OL}"/></g>` +
      `<g stroke="${OL}" stroke-width="5"><path d="M1080,612H1250V660H1080Q1064,636 1080,612Z" fill="#8a5a33"/><ellipse cx="1250" cy="636" rx="14" ry="24" fill="#d9b27a"/><ellipse cx="1250" cy="636" rx="6" ry="11" fill="none" stroke-width="3"/><path d="M1100,626H1180M1130,646H1220" stroke="#6d4424" stroke-width="4"/></g>` + fern(1120, 616, 0.55) +
      `<path d="M-20,760Q400,720 800,740T1620,730V900H-20Z" fill="#8cc56a" stroke="${OL}" stroke-width="5"/>` +
      [30, 60, 95, 1500, 1540, 1580].map(x => { const h = 170 + (x % 5) * 18; return f`<path d="M${x},780Q${x + 8},${780 - h / 2} ${x - 6},${780 - h}" fill="none" stroke="#6a9a3a" stroke-width="7" stroke-linecap="round"/><rect x="${x - 15}" y="${790 - h}" width="18" height="52" rx="9" fill="#8a5a2b" stroke="${OL}" stroke-width="4"/>`; }).join('') +
      tufts([[300, 820], [640, 860], [1100, 830], [1380, 870]]) + mushroom(1300, 820, 0.7) +
      flowers([[420, 830, '#fff'], [460, 850, '#ff9ec4'], [1180, 850, '#ffb14a']]);
  },
  strand() {
    const umb = [0, 1, 2, 3, 4, 5].map(i => { const a0 = Math.PI + i * Math.PI / 6, a1 = a0 + Math.PI / 6; return f`<path d="M1250,560L${1250 + Math.cos(a0) * 150},${560 + Math.sin(a0) * 80}Q${1250 + Math.cos((a0 + a1) / 2) * 160},${560 + Math.sin((a0 + a1) / 2) * 96} ${1250 + Math.cos(a1) * 150},${560 + Math.sin(a1) * 80}Z" fill="${i % 2 ? '#fff' : '#e5533f'}"/>`; }).join('');
    const tower = (x, w, h) => f`<rect x="${x - w / 2}" y="${720 - h}" width="${w}" height="${h}" fill="#e8c77e"/><path d="M${x - w / 2},${720 - h}v-12h${w / 4}v12h${w / 4}v-12h${w / 4}v12h${w / 4}v-12" fill="#e8c77e"/>`;
    return sky(['#86d0f2', '#d8f2fa', '#fff0cf']) + glow(1280, 150, 230, '#fff4c2', 0.9) +
      f`<circle cx="1280" cy="150" r="66" fill="#ffe27a" stroke="${OL}" stroke-width="5"/>` + cloud(260, 120, 1) + cloud(800, 170, 0.7) + gull(620, 200) + gull(700, 240, 0.7) +
      `<rect y="440" width="1600" height="240" fill="#48acdd"/><path d="M0,440H1600" stroke="${OL}" stroke-width="4"/>` +
      waveBand(520, 10, 110, '#3f9ed6', 20) + waterLines([[380, 480, 90], [880, 470, 120], [1350, 490, 80]]) +
      `<g stroke="${OL}" stroke-width="4" stroke-linejoin="round"><path d="M860,460H930L920,474H870Z" fill="#e5533f"/><path d="M895,458V404L924,452Z" fill="#fff"/></g>` +
      `<path d="M0,600Q400,570 800,590T1600,580V900H0Z" fill="#e6c98a"/>` +
      `<path d="M-10,598Q200,585 400,596Q600,606 800,590Q1000,574 1200,586T1610,578" fill="none" stroke="#fff" stroke-width="14" stroke-linecap="round" opacity=".9"/>` +
      `<path d="M0,630Q400,600 800,620T1600,610V900H0Z" fill="#f5dea4" stroke="${OL}" stroke-width="5"/>` +
      `<path d="M-20,640Q80,480 260,500Q360,520 420,640Z" fill="#efd28e" stroke="${OL}" stroke-width="5"/>` + tufts([[120, 540], [220, 520], [320, 560], [60, 600]], '#8fb85a') +
      // zandkasteel met emmer en schep
      `<g stroke="${OL}" stroke-width="5" stroke-linejoin="round">` + tower(440, 60, 110) + tower(560, 60, 110) + f`<rect x="460" y="650" width="80" height="70" fill="#f0d08c"/><path d="M460,650v-10h16v10h16v-10h16v10h16v-10h16v10" fill="#f0d08c"/>` + tower(500, 50, 150) +
      `<path d="M488,720V690Q500,676 512,690V720Z" fill="#b8905a"/><path d="M500,570V530"/><path d="M500,532L530,542L500,552Z" fill="#e5533f"/>` +
      `<path d="M620,690L632,728H676L688,690Z" fill="#3a86d6"/><path d="M622,690Q654,650 686,690" fill="none" stroke-width="4"/>` +
      `<path d="M710,730L740,660" stroke-width="8"/><path d="M732,664l20,-34l14,8l-14,34Z" fill="#ffd23f"/></g>` +
      // parasol en handdoek
      `<path d="M1150,700L1380,700L1420,760L1110,760Z" fill="#6bc0ff" stroke="${OL}" stroke-width="5"/><path d="M1146,712H1386M1140,730H1398M1130,748H1410" stroke="#fff" stroke-width="7"/>` +
      `<path d="M1250,560L1262,720" stroke="${OL}" stroke-width="14" stroke-linecap="round"/><path d="M1250,560L1262,720" stroke="#f3f1ea" stroke-width="6"/>` +
      `<g stroke="${OL}" stroke-width="5" stroke-linejoin="round">${umb}</g><path d="M1100,560Q1250,440 1400,560" fill="none"/><circle cx="1250" cy="478" r="9" fill="#ffd23f" stroke="${OL}" stroke-width="4"/>` +
      starfish(250, 830) + shell(1380, 860) + shell(330, 870, 0.7, '#fff2c8') + starfish(1460, 820, 0.7, '#ffcf4a');
  },
  planeet() {
    const trk = 'M-20,560C200,540 360,560 500,520C600,490 640,370 560,350C480,330 470,450 570,480C720,520 900,480 1100,440C1250,410 1400,430 1620,390';
    const plant = (x, y, h, c) => f`<path d="M${x},${y}Q${x - 14},${y - h / 2} ${x},${y - h}" fill="none" stroke="${OL}" stroke-width="14" stroke-linecap="round"/><path d="M${x},${y}Q${x - 14},${y - h / 2} ${x},${y - h}" fill="none" stroke="#3fae9a" stroke-width="7" stroke-linecap="round"/>` + glow(x, y - h, 40, c, 0.6) + f`<circle cx="${x}" cy="${y - h}" r="16" fill="${c}" stroke="${OL}" stroke-width="4"/><circle cx="${x - 5}" cy="${y - h - 5}" r="4" fill="#fff" opacity=".8"/>`;
    let pil = '';
    for (const [x, y] of [[120, 548], [330, 540], [760, 505], [980, 462], [1200, 424], [1450, 412]]) pil += f`<path d="M${x},${y}V640"/>`;
    return sky(['#241857', '#5b3a9a', '#d77fb5', '#ffc79e']) + stars(13, 50, 420, 6) +
      moon(1260, 170, 88, '#9ef0d8', '#7fd6bd') + moon(1030, 80, 38, '#ffb3d9', '#f095c2') +
      `<path d="M0,520L120,420L200,470L330,380L430,470L560,430L700,500L860,410L980,470L1120,400L1260,460L1400,390L1600,470V640H0Z" fill="#8a5fbf"/>` +
      `<path d="M0,560Q300,520 600,550T1200,540T1600,540V700H0Z" fill="#a276d0"/>` +
      `<g stroke="#5a3f8f" stroke-width="10">${pil}</g>` +
      `<path d="${trk}" fill="none" stroke="${OL}" stroke-width="32"/><path d="${trk}" fill="none" stroke="#f1ecff" stroke-width="22"/><path d="${trk}" fill="none" stroke="#ff8fd0" stroke-width="4" stroke-dasharray="16 14"/>` +
      `<g stroke="${OL}" stroke-width="3">` + [[250, 540, '#ffd23f'], [880, 474, '#7ff3ff'], [1330, 408, '#ff6b6b']].map(([x, y, c]) => f`<rect x="${x}" y="${y}" width="28" height="15" rx="6" fill="${c}"/>`).join('') + `</g>` +
      sparkle(620, 330, 16) + sparkle(1480, 360, 12) +
      `<path d="M0,650Q400,610 800,640T1600,625V900H0Z" fill="#c79be0" stroke="${OL}" stroke-width="6"/>` +
      crater(700, 670, 50, 11, '#b489d2', '#dcc0f0') + crater(1120, 660, 34, 8, '#b489d2', '#dcc0f0') +
      plant(260, 700, 150, '#7ff3ff') + plant(300, 690, 100, '#ffd23f') + plant(1330, 700, 170, '#ff8fd0') + plant(1380, 700, 110, '#7ff3ff') +
      blobs([[180, 700, 34], [1440, 700, 30]], '#5fc9b5') + `<g fill="#3fae9a"><circle cx="170" cy="690" r="5"/><circle cx="192" cy="705" r="4"/><circle cx="1436" cy="690" r="5"/></g>` +
      `<g stroke="${OL}" stroke-width="4" stroke-linejoin="round"><path d="M950,690L966,630L986,688Z" fill="#7ff3ff"/><path d="M975,692L1000,650L1010,690Z" fill="#c2fbff"/></g>` +
      `<path d="M0,770Q400,740 800,760T1600,750V900H0Z" fill="#b889d6"/>` + crater(320, 840, 60, 13, '#a47bc9', '#d0b2ea') + crater(1330, 830, 50, 11, '#a47bc9', '#d0b2ea');
  },
  feest() {
    const cake = `<g stroke="${OL}" stroke-width="5" stroke-linejoin="round">` +
      `<rect x="970" y="500" width="200" height="70" rx="12" fill="#ff9ec4"/><path d="M970,512Q985,540 1000,512Q1015,540 1030,512Q1045,540 1060,512Q1075,540 1090,512Q1105,540 1120,512Q1135,540 1150,512Q1160,530 1170,512V500H970Z" fill="#fff6e6"/>` +
      `<rect x="995" y="440" width="150" height="62" rx="12" fill="#fff6e6"/><path d="M995,470H1145" stroke="#ff9ec4" stroke-width="10"/>` +
      `<rect x="1020" y="394" width="100" height="48" rx="10" fill="#ff9ec4"/>` +
      [1040, 1070, 1100].map(x => f`<rect x="${x - 5}" y="360" width="10" height="34" rx="3" fill="${x === 1070 ? '#7ff3ff' : '#ffd23f'}"/><path d="M${x},352q-8,-12 0,-24q8,12 0,24Z" fill="#ffb14a"/>`).join('') + `</g>` +
      glow(1070, 340, 70, '#ffd97a', 0.8) +
      `<g fill="#e5533f"><circle cx="1000" cy="462" r="6"/><circle cx="1040" cy="486" r="6"/><circle cx="1100" cy="486" r="6"/><circle cx="1130" cy="460" r="6"/></g>`;
    let trees = '';
    for (let x = -20; x < 1650; x += 115) trees += pine(x, 640, 230 + ((x * 37) % 110), '#34406f', false);
    const r = rng(15); let conf = '';
    for (let i = 0; i < 12; i++) { const x = 300 + r() * 1000, y = 290 + r() * 230; conf += f`<rect x="${x}" y="${y}" width="12" height="7" rx="2" fill="${['#ff6b6b', '#ffd23f', '#6bdc7a', '#7ff3ff', '#ff9ec4'][i % 5]}" transform="rotate(${r() * 180} ${x} ${y})"/>`; }
    const lantern = (x, y, c) => glow(x, y + 30, 80, c, 0.5) + f`<path d="M${x},${y - 30}V${y}" stroke="${OL}" stroke-width="4"/><ellipse cx="${x}" cy="${y + 30}" rx="30" ry="34" fill="${c}" stroke="${OL}" stroke-width="5"/><path d="M${x - 14},${y + 1}Q${x - 26},${y + 30} ${x - 14},${y + 59}M${x + 14},${y + 1}Q${x + 26},${y + 30} ${x + 14},${y + 59}" fill="none" stroke="${OL}" stroke-width="3" opacity=".5"/><rect x="${x - 12}" y="${y - 6}" width="24" height="10" rx="3" fill="#3b2a1a"/>`;
    return sky(['#1f2466', '#4b3a8a', '#c86f86', '#ffb870']) + stars(19, 28, 360, 4) +
      f`<path d="M420,120a46,46 0 1 0 40,70a36,36 0 1 1 -40,-70Z" fill="#fff3b0" stroke="${OL}" stroke-width="4"/>` +
      trees + ground(630, '#4e7f52') +
      // grote bomen als lijst
      `<path d="M120,900Q150,500 130,-20H290Q260,500 300,900Z" fill="#6b4a30" stroke="${OL}" stroke-width="6"/><path d="M1320,900Q1350,500 1320,-20H1480Q1460,500 1500,900Z" fill="#6b4a30" stroke="${OL}" stroke-width="6"/>` +
      blobs([[80, 20, 170], [300, -40, 150], [1300, -40, 150], [1520, 20, 170]], '#3f7a4c') +
      garland(260, 110, 1340, 120, 70, 14, ['#ffd97a', '#ff8a8a', '#8fe8ff', '#b6f58a', '#ffb3e6'], 1) +
      garland(270, 210, 1330, 220, 55, 12, ['#e5533f', '#ffd23f', '#3a86d6', '#5dbb63', '#ff9ec4']) +
      lantern(520, 320, '#ffb14a') + lantern(1180, 330, '#ff8fb8') + conf +
      // tafel met taart
      `<g stroke="${OL}" stroke-width="5" stroke-linejoin="round"><path d="M880,590L900,720M1260,590L1240,720" stroke-width="12"/>` +
      `<path d="M860,570H1280L1290,620Q1270,640 1250,620Q1230,640 1210,620Q1190,640 1170,620Q1150,640 1130,620Q1110,640 1090,620Q1070,640 1050,620Q1030,640 1010,620Q990,640 970,620Q950,640 930,620Q910,640 890,620Q870,640 850,620Z" fill="#fff6e6"/></g>` +
      cake + `<g stroke="${OL}" stroke-width="4"><ellipse cx="910" cy="566" rx="34" ry="9" fill="#fff"/><ellipse cx="1230" cy="566" rx="34" ry="9" fill="#fff"/><path d="M1200,520h26l-4,46h-18Z" fill="#ffe27a"/></g>` +
      `<g stroke="${OL}" stroke-width="5" stroke-linejoin="round"><rect x="700" y="640" width="80" height="64" rx="6" fill="#3a86d6"/><path d="M740,640V704M700,668H780" stroke="#ffd23f" stroke-width="12"/><path d="M740,640q-30,-30 -8,-30q8,0 8,30q0,-30 8,-30q22,0 -8,30Z" fill="#ffd23f"/>` +
      `<rect x="790" y="670" width="54" height="40" rx="5" fill="#ff6b6b"/><path d="M817,670V710" stroke="#fff" stroke-width="10"/></g>` +
      ground(740, '#5a8f58') + tufts([[360, 820], [700, 860], [1180, 830]], '#79ad68') +
      `<g fill="#fff38a">` + [[260, 780], [520, 720], [1080, 760], [1420, 800], [900, 840]].map(([x, y]) => f`<circle cx="${x}" cy="${y}" r="5" opacity=".8"/>`).join('') + `</g>`;
  },
  titel() {
    let trees = '';
    for (let x = -40; x < 1650; x += 110) trees += pine(x, 800, 150 + ((x * 53) % 90), '#2c4a78', false);
    for (let x = 10; x < 1650; x += 95) if (x < 560 || x > 1040) trees += pine(x, 830, 170 + ((x * 31) % 110), '#1c3558', false);
    const r = rng(21); let sp = '';
    for (let i = 0; i < 10; i++) { const a = Math.PI + r() * Math.PI, d = 270 + r() * 140; sp += sparkle(800 + Math.cos(a) * d * 1.5, 340 + Math.sin(a) * d * 0.9, 10 + r() * 16); }
    return sky(['#101a4a', '#3a3f8f', '#8a6fb0', '#f4b58c']) + stars(17, 50, 560, 6) +
      glow(800, 340, 440, '#ffe9a0', 0.55) +
      `<g opacity=".12" fill="#fff6c8">` + [0, 1, 2, 3, 4, 5, 6, 7].map(i => { const a = i * Math.PI / 4 + 0.2; return f`<polygon points="800,340 ${800 + Math.cos(a) * 900},${340 + Math.sin(a) * 900} ${800 + Math.cos(a + 0.16) * 900},${340 + Math.sin(a + 0.16) * 900}"/>`; }).join('') + `</g>` +
      compass(800, 340, 230) + sp +
      trees + ground(790, '#15294a') + ground(850, '#10203c');
  },
};

export const BACKGROUNDS = Object.keys(BG);

export function background(id) {
  try {
    const fn = BG[id] || BG.bos;
    return svg('0 0 1600 900', fn(), 'preserveAspectRatio="xMidYMid slice"');
  } catch (e) {
    return svg('0 0 1600 900', '<rect width="1600" height="900" fill="#bfe6f5"/>', 'preserveAspectRatio="xMidYMid slice"');
  }
}

/* ------------------------------------------------------------------ */
/* Gezichten                                                           */
/* ------------------------------------------------------------------ */
function eyes(lx, rx, y, er, mood, pc = '#2b1d12', lc = OL) {
  if (mood === 'lacht') {
    return f`<g class="blink" fill="none" stroke="${lc}" stroke-width="6" stroke-linecap="round"><path d="M${lx - er},${y + 4}Q${lx},${y - er * 1.2} ${lx + er},${y + 4}"/><path d="M${rx - er},${y + 4}Q${rx},${y - er * 1.2} ${rx + er},${y + 4}"/></g>`;
  }
  const e = mood === 'verbaasd' ? er * 1.2 : er, pr = mood === 'verbaasd' ? e * 0.42 : e * 0.6;
  let dx = er * 0.05, dy = er * 0.12;
  if (mood === 'denkt') { dx = er * 0.3; dy = -er * 0.4; }
  const one = x => f`<ellipse cx="${x}" cy="${y}" rx="${e}" ry="${e * 1.15}" fill="#fff" stroke="${OL}" stroke-width="4"/><circle cx="${x + dx}" cy="${y + dy}" r="${pr}" fill="${pc}" ${N}/><circle cx="${x + dx + pr * 0.35}" cy="${y + dy - pr * 0.4}" r="${pr * 0.38}" fill="#fff" ${N}/>`;
  return `<g class="blink">${one(lx)}${one(rx)}</g>`;
}
function brows(lx, rx, y, er, mood, col = OL, sw = 5) {
  const up = mood === 'verbaasd' ? er * 0.6 : mood === 'lacht' ? er * 0.2 : 0;
  const by = y - er * 1.6 - up, w = er * 0.85;
  let L = f`M${lx - w},${by + 4}Q${lx},${by - 6} ${lx + w},${by + 1}`, R = f`M${rx - w},${by + 1}Q${rx},${by - 6} ${rx + w},${by + 4}`;
  if (mood === 'denkt') { L = f`M${lx - w},${by + 5}L${lx + w},${by + 3}`; R = f`M${rx - w},${by - 6}Q${rx},${by - 16} ${rx + w},${by - 4}`; }
  return `<g fill="none" stroke="${col}" stroke-width="${sw}" stroke-linecap="round"><path d="${L}"/><path d="${R}"/></g>`;
}
function mouth(x, y, w, mood) {
  const red = '#8a2f25';
  if (mood === 'verbaasd') return f`<ellipse cx="${x}" cy="${y + 4}" rx="${w * 0.45}" ry="${w * 0.6}" fill="${red}" stroke="${OL}" stroke-width="4"/>`;
  if (mood === 'denkt') return f`<path d="M${x - w * 0.6},${y + 4}Q${x - w * 0.1},${y + 8} ${x + w * 0.6},${y - 2}" fill="none" stroke="${OL}" stroke-width="5" stroke-linecap="round"/>`;
  if (mood === 'lacht') return f`<path d="M${x - w * 1.1},${y - 4}Q${x},${y - 7} ${x + w * 1.1},${y - 4}Q${x + w},${y + w * 1.3} ${x},${y + w * 1.3}Q${x - w},${y + w * 1.3} ${x - w * 1.1},${y - 4}Z" fill="${red}" stroke="${OL}" stroke-width="4" stroke-linejoin="round"/><path d="M${x - w * 0.55},${y + w * 1.08}Q${x},${y + w * 0.55} ${x + w * 0.55},${y + w * 1.08}Q${x},${y + w * 1.3} ${x - w * 0.55},${y + w * 1.08}Z" fill="#ff8a8a" ${N}/>`;
  return f`<path d="M${x - w},${y - 2}Q${x},${y + w * 1.15} ${x + w},${y - 2}Q${x},${y + w * 0.35} ${x - w},${y - 2}Z" fill="${red}" stroke="${OL}" stroke-width="4" stroke-linejoin="round"/>`;
}
const cheeks = (lx, rx, y, r = 11) => f`<g fill="#ff8f8f" opacity=".45" ${N}><ellipse cx="${lx}" cy="${y}" rx="${r}" ry="${r * 0.7}"/><ellipse cx="${rx}" cy="${y}" rx="${r}" ry="${r * 0.7}"/></g>`;
// ledemaat als dikke lijn met contour
const limb = (d, c, w) => `<path d="${d}" fill="none" stroke="${OL}" stroke-width="${w + 12}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;

/* ------------------------------------------------------------------ */
/* Personages                                                          */
/* ------------------------------------------------------------------ */
const CH = {
  held(m) {
    const P = {
      lacht: ['M112,214Q86,190 80,150', 'M188,214Q214,190 220,150', [80, 140], [220, 140]],
      blij: ['M112,216Q90,246 86,282', 'M188,214Q222,196 228,156', [86, 292], [229, 145]],
      verbaasd: ['M112,216Q80,236 66,262', 'M188,216Q220,236 234,262', [60, 270], [240, 270]],
      denkt: ['M112,216Q90,246 86,282', 'M188,216Q226,256 196,198', [86, 292], [194, 190]],
    }[m];
    const armsL = limb(P[0], '#e0483e', 26) + limb(P[1], '#e0483e', 26);
    const hands = f`<circle cx="${P[2][0]}" cy="${P[2][1]}" r="16" fill="${SKIN}"/><circle cx="${P[3][0]}" cy="${P[3][1]}" r="16" fill="${SKIN}"/>`;
    return limb('M128,300L125,360', SKIN, 24) + limb('M172,300L175,360', SKIN, 24) +
      `<g transform="rotate(-12 176 338)"><rect x="162" y="330" width="28" height="15" rx="5" fill="#f3d3a0" stroke-width="3"/><g fill="#c9a071" ${N}><circle cx="172" cy="337" r="1.8"/><circle cx="180" cy="337" r="1.8"/></g></g>` +
      `<path d="M98,386Q96,360 124,360Q146,360 148,386Z" fill="#3b6fc4"/><path d="M152,386Q154,360 176,360Q204,360 202,386Z" fill="#3b6fc4"/>` +
      `<path d="M100,378H146M154,378H200" stroke="#fff" stroke-width="5"/>` +
      `<path d="M104,280H196L200,322H158L150,304L142,322H100Z" fill="#4a78c2"/>` +
      armsL +
      `<path d="M104,224Q104,190 150,188Q196,190 196,224L198,292Q150,302 102,292Z" fill="#e0483e"/>` +
      `<path d="M104,280Q150,292 196,280" fill="none" stroke="#b8322b" stroke-width="6"/>` +
      sparkle(150, 240, 20, '#ffd54a').replace('/>', ` stroke="${OL}" stroke-width="3"/>`) +
      hands +
      `<circle cx="86" cy="132" r="13" fill="${SKIN}"/><circle cx="214" cy="132" r="13" fill="${SKIN}"/>` +
      `<circle cx="150" cy="128" r="62" fill="${SKIN}"/>` +
      `<path d="M88,128Q86,78 118,66L110,38L140,56L150,24L164,54L192,36L186,66Q216,82 212,128Q206,104 186,96L176,110L164,94L150,108L136,94L124,108L116,96Q94,106 88,128Z" fill="#8a5a2b"/>` +
      eyes(126, 174, 136, 14, m) + brows(126, 174, 136, 14, m, '#6d4424') +
      `<path d="M145,152Q150,158 155,152" fill="none" stroke-width="4"/>` + cheeks(108, 192, 158) +
      `<g fill="#c98a5a" ${N}><circle cx="112" cy="150" r="2.2"/><circle cx="118" cy="156" r="2.2"/><circle cx="188" cy="150" r="2.2"/><circle cx="182" cy="156" r="2.2"/></g>` +
      mouth(150, 168, 16, m);
  },
  florine(m) {
    const hair = '#d9a441', dress = '#ffd54a';
    const leftArm = m === 'lacht' || m === 'verbaasd' ? limb('M124,274Q104,256 96,232', SKIN, 16) : limb('M124,274Q104,298 106,318', SKIN, 16);
    return limb('M137,330L135,364', SKIN, 18) + limb('M163,330L165,364', SKIN, 18) +
      `<path d="M114,384Q112,366 134,366Q150,368 150,384Z" fill="#e5533f"/><path d="M150,384Q150,368 166,366Q188,366 186,384Z" fill="#e5533f"/>` +
      leftArm +
      `<path d="M124,262Q150,254 176,262L206,336Q150,354 94,336Z" fill="${dress}"/>` +
      `<path d="M100,322Q150,338 200,322" fill="none" stroke="#f0b52c" stroke-width="6"/>` +
      `<g fill="#f0b52c" ${N}><circle cx="130" cy="300" r="5"/><circle cx="168" cy="292" r="5"/><circle cx="150" cy="316" r="5"/></g>` +
      `<path d="M130,262Q150,282 170,262Q150,254 130,262Z" fill="#fff" stroke-width="4"/>` +
      // knuffelkonijn
      `<g transform="translate(214 282) rotate(12)"><ellipse cx="-10" cy="-52" rx="9" ry="26" fill="#f4e7f0" transform="rotate(-12 -10 -52)"/><ellipse cx="12" cy="-52" rx="9" ry="26" fill="#f4e7f0" transform="rotate(14 12 -52)"/>` +
      `<ellipse cx="-10" cy="-52" rx="3.5" ry="17" fill="#ffb3cf" ${N} transform="rotate(-12 -10 -52)"/><ellipse cx="12" cy="-52" rx="3.5" ry="17" fill="#ffb3cf" ${N} transform="rotate(14 12 -52)"/>` +
      `<ellipse cx="0" cy="22" rx="24" ry="30" fill="#f4e7f0"/><circle cx="0" cy="-16" r="24" fill="#f4e7f0"/>` +
      `<g fill="${OL}" ${N}><circle cx="-8" cy="-18" r="3.5"/><circle cx="8" cy="-18" r="3.5"/></g><path d="M-3,-9Q0,-6 3,-9" fill="none" stroke-width="3"/></g>` +
      limb('M176,274Q196,290 204,300', SKIN, 16) +
      (m === 'lacht' || m === 'verbaasd' ? `<circle cx="94" cy="226" r="12" fill="${SKIN}"/>` : `<circle cx="106" cy="324" r="12" fill="${SKIN}"/>`) +
      `<circle cx="206" cy="302" r="12" fill="${SKIN}"/>` +
      // staartjes
      `<g fill="${hair}"><path d="M100,196Q62,170 66,214Q70,244 98,226Z"/><path d="M200,196Q238,170 234,214Q230,244 202,226Z"/></g>` +
      `<g fill="#ff7fb0" stroke-width="4"><circle cx="100" cy="204" r="9"/><circle cx="200" cy="204" r="9"/></g>` +
      `<circle cx="150" cy="206" r="54" fill="${SKIN}"/>` +
      `<path d="M98,208Q92,150 150,148Q208,150 202,208Q196,178 172,170Q162,186 136,180Q112,182 98,208Z" fill="${hair}"/>` +
      eyes(130, 170, 214, 12, m) + brows(130, 170, 214, 12, m, '#b07a2a', 4) + cheeks(114, 186, 232, 10) +
      mouth(150, 238, 12, m);
  },
  kwebbel(m) {
    const open = m === 'lacht' || m === 'verbaasd';
    const wingL = m === 'lacht' ? 'rotate(55 100 230)' : m === 'denkt' ? 'rotate(10 100 230)' : 'rotate(12 100 230)';
    const wingR = m === 'lacht' ? 'rotate(-55 200 230)' : m === 'denkt' ? 'rotate(-30 200 230)' : 'rotate(-12 200 230)';
    return `<g transform="rotate(-62 150 318)"><path d="M132,330L110,392L136,392L150,336Z" fill="#3a86d6"/><path d="M168,330L190,392L164,394L152,336Z" fill="#ffd23f"/><path d="M142,334L150,400L160,334Z" fill="#e04848"/></g>` +
      `<g fill="#f0a040"><path d="M112,384Q128,362 144,384Z"/><path d="M156,384Q172,362 188,384Z"/></g>` +
      `<ellipse cx="150" cy="270" rx="72" ry="92" fill="#2fb59a"/>` +
      `<ellipse cx="150" cy="294" rx="44" ry="60" fill="#bdeccb" stroke-width="4"/>` +
      `<path d="M130,280q20,10 40,0M132,305q18,10 36,0M136,330q14,8 28,0" fill="none" stroke="#8fd6ab" stroke-width="4"/>` +
      `<g fill="#3a86d6"><ellipse cx="92" cy="272" rx="28" ry="60" transform="${wingL}"/><ellipse cx="208" cy="272" rx="28" ry="60" transform="${wingR}"/></g>` +
      `<g fill="none" stroke="#2a5fa6" stroke-width="4" stroke-linecap="round"><path d="M86,280q6,14 16,20M86,300q6,10 14,14" transform="${wingL}"/><path d="M214,280q-6,14 -16,20M214,300q-6,10 -14,14" transform="${wingR}"/></g>` +
      `<path d="M150,94Q138,62 150,52Q158,72 162,94Z" fill="#ffd23f"/>` +
      `<circle cx="150" cy="152" r="64" fill="#2fb59a"/>` +
      `<g fill="#e7fbf2" ${N}><ellipse cx="124" cy="150" rx="24" ry="26"/><ellipse cx="176" cy="150" rx="24" ry="26"/></g>` +
      `<path d="M88,140Q90,84 150,82Q210,84 212,140Q180,114 150,116Q120,114 88,140Z" fill="#e04848"/>` +
      `<g fill="#fff" ${N}><circle cx="120" cy="104" r="6"/><circle cx="150" cy="96" r="6"/><circle cx="180" cy="104" r="6"/><circle cx="104" cy="126" r="4.5"/><circle cx="196" cy="126" r="4.5"/></g>` +
      `<g fill="#e04848" stroke-width="5"><path d="M208,122L244,104L236,136Z"/><path d="M208,128L240,152L214,160Z"/><circle cx="210" cy="128" r="9"/></g>` +
      eyes(124, 176, 152, 15, m) +
      (m === 'denkt' ? brows(124, 176, 152, 12, m) : '') +
      (open ? `<ellipse cx="150" cy="196" rx="15" ry="${m === 'lacht' ? 17 : 13}" fill="#8a2f25"/><ellipse cx="150" cy="${m === 'lacht' ? 204 : 202}" rx="8" ry="5" fill="#ff8a8a" ${N}/>` : '') +
      `<path d="M132,172Q150,158 168,172Q170,190 152,${open ? 196 : 202}Q146,188 132,172Z" fill="#f6b53f"/>` +
      `<path d="M140,176q4,-3 8,0M152,176q4,-3 8,0" fill="none" stroke-width="3"/>` +
      cheeks(104, 196, 176, 10);
  },
  brom(m) {
    const skin = '#f2b98c', tunic = '#d8893a', beard = '#c0662e';
    const armL = m === 'lacht' ? 'M64,196Q30,160 40,110' : 'M64,196Q34,244 40,300';
    const armR = m === 'lacht' ? 'M236,196Q270,160 260,110' : m === 'denkt' ? 'M236,196Q270,250 206,176' : 'M236,196Q266,244 260,300';
    const hL = m === 'lacht' ? [40, 98] : [40, 312], hR = m === 'lacht' ? [260, 98] : m === 'denkt' ? [196, 170] : [260, 312];
    return `<path d="M46,392Q42,352 90,350L124,350Q136,372 136,392Z" fill="#7a4a2a"/><path d="M164,392Q164,372 176,350L210,350Q258,352 254,392Z" fill="#7a4a2a"/>` +
      limb('M100,300L100,350', '#5b6e3a', 40) + limb('M200,300L200,350', '#5b6e3a', 40) +
      limb(armL, tunic, 38) + (m === 'denkt' ? '' : limb(armR, tunic, 38)) +
      `<path d="M62,204Q62,160 150,158Q238,160 238,204L246,300Q150,326 54,300Z" fill="${tunic}"/>` +
      `<path d="M56,272Q150,294 244,272L245,294Q150,318 55,294Z" fill="#6b4226"/><rect x="134" y="282" width="32" height="26" rx="5" fill="#ffd23f" stroke-width="5"/>` +
      `<rect x="178" y="206" width="36" height="34" rx="4" fill="#a8c070" stroke-width="4" transform="rotate(8 196 223)"/><path d="M184,212l4,4M204,212l-4,4M184,236l4,-4M206,236l-4,-4" stroke-width="3" transform="rotate(8 196 223)"/>` +
      f`<circle cx="${hL[0]}" cy="${hL[1]}" r="24" fill="${skin}"/>` + (m === 'denkt' ? limb(armR, tunic, 38) : '') + f`<circle cx="${hR[0]}" cy="${hR[1]}" r="24" fill="${skin}"/>` +
      `<circle cx="80" cy="112" r="17" fill="${skin}"/><circle cx="220" cy="112" r="17" fill="${skin}"/>` +
      `<circle cx="150" cy="110" r="70" fill="${skin}"/>` +
      `<path d="M84,100Q86,38 150,36Q214,38 216,100Q206,70 176,70Q162,54 144,68Q120,58 110,74Q92,78 84,100Z" fill="#b5652b"/>` +
      `<path d="M82,116Q84,214 150,230Q216,214 218,116Q210,158 176,156Q150,144 124,156Q90,158 82,116Z" fill="${beard}"/>` +
      `<path d="M112,196q10,8 18,4M170,200q10,4 18,-4M140,214q10,6 20,0" fill="none" stroke="#a0521f" stroke-width="4"/>` +
      mouth(150, 166, 16, m) +
      `<path d="M120,156Q136,140 150,150Q164,140 180,156Q164,166 150,158Q136,166 120,156Z" fill="${beard}"/>` +
      `<ellipse cx="150" cy="132" rx="15" ry="12" fill="#e89a70"/>` +
      eyes(118, 182, 100, 14, m) + brows(118, 182, 100, 14, m, '#8a4520', 8) + cheeks(100, 200, 130, 13);
  },
  rommel(m) {
    const fur = '#a39b94', light = '#efe6da', dark = '#4a3b36';
    const cid = 'rt' + (++uid);
    const tail = 'M190,344Q262,334 266,256Q270,200 246,176Q232,206 238,250Q236,300 186,312Z';
    const armR = m === 'lacht' ? 'M190,250Q214,226 222,196' : m === 'denkt' ? 'M190,250Q220,262 190,210' : 'M190,250Q208,280 200,306';
    const hR = m === 'lacht' ? [222, 190] : m === 'denkt' ? [184, 204] : [200, 312];
    return f`<defs><clipPath id="${cid}"><path d="${tail}"/></clipPath></defs><path d="${tail}" fill="${fur}"/>` +
      `<g clip-path="url(#${cid})" fill="${dark}" ${N}>` + [196, 226, 256, 286].map((y, i) => f`<rect x="170" y="${y}" width="120" height="16" transform="rotate(${-40 + i * 12} 240 ${y})"/>`).join('') + `<rect x="170" y="150" width="120" height="34"/></g>` +
      `<path d="${tail}" fill="none"/>` +
      `<g fill="${dark}"><ellipse cx="124" cy="382" rx="24" ry="12"/><ellipse cx="176" cy="382" rx="24" ry="12"/></g>` +
      `<path d="M98,300Q94,222 150,216Q206,222 202,300Q202,372 150,374Q98,372 98,300Z" fill="${fur}"/>` +
      `<ellipse cx="150" cy="310" rx="36" ry="46" fill="${light}" stroke-width="4"/>` +
      limb('M110,250Q92,280 100,306', dark, 18) + limb(armR, dark, 18) +
      `<path d="M78,126Q64,62 116,86Z" fill="${fur}"/><path d="M222,126Q236,62 184,86Z" fill="${fur}"/>` +
      `<g fill="#f2b5b5" ${N}><path d="M86,114Q80,82 106,92Z"/><path d="M214,114Q220,82 194,92Z"/></g>` +
      `<path d="M68,160Q64,96 150,92Q236,96 232,160Q226,212 150,216Q74,212 68,160Z" fill="${fur}"/>` +
      `<g fill="${light}" ${N}><path d="M68,160Q60,188 84,204Q100,184 98,170Z"/><path d="M232,160Q240,188 216,204Q200,184 202,170Z"/></g>` +
      `<path d="M74,150Q96,110 150,132Q204,110 226,150Q212,186 172,170Q150,162 128,170Q88,186 74,150Z" fill="${dark}" stroke-width="4"/>` +
      `<path d="M140,94Q150,124 160,94Z" fill="${dark}" ${N}/>` +
      `<ellipse cx="150" cy="186" rx="30" ry="24" fill="${light}" stroke-width="4"/>` +
      `<ellipse cx="150" cy="174" rx="11" ry="8" fill="#2b1d12" ${N}/>` +
      eyes(116, 184, 150, 14, m, '#2b1d12', '#fff') + brows(116, 184, 150, 14, m, light, 5) +
      mouth(150, 194, 11, m) + cheeks(96, 204, 190, 9) +
      f`<circle cx="100" cy="312" r="11" fill="${dark}"/><circle cx="${hR[0]}" cy="${hR[1]}" r="11" fill="${dark}"/>`;
  },
  piep(m) {
    const cy = '#7ff3ff';
    const up = m === 'lacht';
    let face;
    if (m === 'lacht') face = `<g class="blink" fill="none" stroke="${cy}" stroke-width="7" stroke-linecap="round"><path d="M108,232Q122,212 136,232"/><path d="M164,232Q178,212 192,232"/></g>`;
    else if (m === 'verbaasd') face = `<g class="blink" fill="${cy}" ${N}><circle cx="122" cy="226" r="16"/><circle cx="178" cy="226" r="16"/></g><g fill="#22314f" ${N}><circle cx="122" cy="226" r="7"/><circle cx="178" cy="226" r="7"/></g>`;
    else if (m === 'denkt') face = `<g class="blink" fill="${cy}" ${N}><ellipse cx="122" cy="224" rx="10" ry="14"/><rect x="164" y="220" width="28" height="7" rx="3.5"/></g>`;
    else face = `<g class="blink" fill="${cy}" ${N}><ellipse cx="122" cy="226" rx="11" ry="15"/><ellipse cx="178" cy="226" rx="11" ry="15"/></g>`;
    const mo = m === 'lacht' ? `<path d="M126,252H174Q170,272 150,272Q130,272 126,252Z" fill="${cy}" ${N}/>`
      : m === 'verbaasd' ? `<circle cx="150" cy="260" r="8" fill="none" stroke="${cy}" stroke-width="5"/>`
        : m === 'denkt' ? `<path d="M132,260q9,-8 18,0t18,0" fill="none" stroke="${cy}" stroke-width="5" stroke-linecap="round"/>`
          : `<path d="M130,254Q150,272 170,254" fill="none" stroke="${cy}" stroke-width="6" stroke-linecap="round"/>`;
    return limb('M126,330L122,368', '#9aa9b8', 16) + limb('M174,330L178,368', '#9aa9b8', 16) +
      `<g fill="#5d6f86"><path d="M98,388Q100,366 124,366Q144,366 144,388Z"/><path d="M156,388Q156,366 176,366Q200,366 202,388Z"/></g>` +
      limb(up ? 'M56,230Q34,200 40,168' : 'M56,250Q32,272 38,302', '#9aa9b8', 14) +
      limb(up ? 'M244,230Q266,200 260,168' : 'M244,250Q268,272 262,302', '#9aa9b8', 14) +
      `<g fill="#ffcf4a">` + (up ? '<circle cx="40" cy="160" r="13"/><circle cx="260" cy="160" r="13"/>' : '<circle cx="38" cy="308" r="13"/><circle cx="262" cy="308" r="13"/>') + `</g>` +
      `<path d="M150,140V100" stroke-width="7"/><circle cx="150" cy="88" r="26" fill="#ff6b6b" opacity=".25" ${N} class="antenna-glow"/><circle class="antenna" cx="150" cy="88" r="14" fill="#ff6b6b"/>` +
      `<circle cx="46" cy="240" r="15" fill="#8fa6bd"/><circle cx="254" cy="240" r="15" fill="#8fa6bd"/>` +
      `<circle cx="150" cy="240" r="104" fill="#bcd6ea"/>` +
      `<ellipse cx="96" cy="176" rx="26" ry="12" fill="#fff" opacity=".7" ${N} transform="rotate(-35 96 176)"/>` +
      `<rect x="84" y="186" width="132" height="98" rx="32" fill="#22314f" stroke-width="5"/>` +
      face + mo + `<g fill="#ff8fb8" opacity=".6" ${N}><ellipse cx="102" cy="254" rx="9" ry="5"/><ellipse cx="198" cy="254" rx="9" ry="5"/></g>` +
      `<g stroke-width="4"><circle cx="126" cy="312" r="8" fill="#ff6b6b"/><circle cx="150" cy="316" r="8" fill="#ffd23f"/><circle cx="174" cy="312" r="8" fill="#6bdc7a"/></g>`;
  },
  racer(m) {
    const suit = '#e5533f', fur = '#a39b94', dark = '#4a3b36';
    const cid = 'rt' + (++uid);
    const tail = 'M190,344Q262,334 266,256Q270,200 246,176Q232,206 238,250Q236,300 186,312Z';
    const armL = m === 'verbaasd' ? 'M110,250Q84,244 70,222' : 'M110,250Q92,280 100,306';
    const armR = m === 'lacht' ? 'M190,250Q214,226 222,190' : m === 'denkt' ? 'M190,250Q222,262 196,222' : m === 'verbaasd' ? 'M190,250Q216,244 230,222' : 'M190,250Q214,262 222,236';
    const hL = m === 'verbaasd' ? [68, 216] : [100, 312];
    const hR = m === 'lacht' ? [222, 184] : m === 'denkt' ? [192, 216] : m === 'verbaasd' ? [232, 216] : [224, 230];
    const tilt = m === 'denkt' ? -7 : m === 'verbaasd' ? 4 : 0;
    return f`<defs><clipPath id="${cid}"><path d="${tail}"/></clipPath></defs><path d="${tail}" fill="${fur}"/>` +
      `<g clip-path="url(#${cid})" fill="${dark}" ${N}>` + [196, 226, 256, 286].map((y, i) => f`<rect x="170" y="${y}" width="120" height="16" transform="rotate(${-40 + i * 12} 240 ${y})"/>`).join('') + `<rect x="170" y="150" width="120" height="34"/></g>` +
      `<path d="${tail}" fill="none"/>` +
      `<g fill="#2b2b33"><path d="M98,388Q98,364 124,364Q146,364 148,388Z"/><path d="M152,388Q154,364 176,364Q202,364 202,388Z"/></g>` +
      `<path d="M98,300Q94,222 150,216Q206,222 202,300Q202,372 150,374Q98,372 98,300Z" fill="${suit}"/>` +
      `<path d="M140,218H160V372H140Z" fill="#fff" stroke-width="4"/><path d="M104,338Q150,352 196,338" fill="none" stroke="#2b2b33" stroke-width="10"/>` +
      starfish(122, 262, 0.75, '#ffd23f') +
      limb(armL, suit, 20) + limb(armR, suit, 20) +
      f`<circle cx="${hL[0]}" cy="${hL[1]}" r="13" fill="#2b2b33"/><circle cx="${hR[0]}" cy="${hR[1]}" r="13" fill="#2b2b33"/>` +
      (m === 'blij' ? `<rect x="216" y="198" width="13" height="26" rx="6.5" fill="#2b2b33" stroke-width="4"/>` : '') +
      f`<g transform="rotate(${tilt} 150 210)"><rect x="118" y="198" width="64" height="26" rx="10" fill="#2b2b33"/>` +
      `<path d="M62,166Q58,80 150,76Q242,80 238,166Q238,222 150,226Q62,222 62,166Z" fill="#fff"/>` +
      `<path d="M128,78Q150,74 172,78L174,124H126Z" fill="${suit}" ${N}/><path d="M62,166Q58,80 150,76Q242,80 238,166Q238,222 150,226Q62,222 62,166Z" fill="none"/>` +
      `<path d="M76,152Q78,120 150,118Q222,120 224,152Q224,200 150,202Q76,200 76,152Z" fill="#2b2f4a"/>` +
      `<path d="M94,150Q98,132 126,128M200,178Q210,170 212,158" fill="none" stroke="#9fd8f5" stroke-width="7" stroke-linecap="round" opacity=".75"/>` +
      `<circle cx="70" cy="170" r="10" fill="#cfd8e6" stroke-width="4"/><circle cx="230" cy="170" r="10" fill="#cfd8e6" stroke-width="4"/>` +
      starfish(150, 98, 0.75, '#ffd23f') + `</g>`;
  },
  boot() {
    return `<path d="M10,374q25,-14 50,0t50,0t50,0t50,0t50,0t50,0V392H10Z" fill="#5cc0e6" stroke-width="4"/>` +
      `<rect x="144" y="60" width="12" height="260" rx="5" fill="#8a5a2b" stroke-width="5"/>` +
      `<path d="M156,60L204,74L156,90Z" fill="#e5533f" stroke-width="5"/>` +
      `<path d="M162,96Q236,186 252,296H162Z" fill="#fff"/><path d="M162,236Q210,232 244,244L250,272Q206,262 162,266Z" fill="#6bc0ff" stroke-width="4"/>` +
      `<path d="M138,120Q92,200 72,296H138Z" fill="#ffd54a"/>` +
      sparkle(206, 190, 22, '#ffd23f').replace('/>', ` stroke="${OL}" stroke-width="4"/>`) +
      `<path d="M26,300H274Q262,374 204,376H98Q40,374 26,300Z" fill="#e5533f"/>` +
      `<path d="M32,326H268" stroke="#fff" stroke-width="10"/><path d="M26,300H274" fill="none"/>` +
      `<g fill="#9fd8f5" stroke-width="4"><circle cx="110" cy="350" r="10"/><circle cx="150" cy="352" r="10"/><circle cx="190" cy="350" r="10"/></g>` +
      `<path d="M4,382q25,-14 50,0t50,0t50,0t50,0t50,0t50,0" fill="none" stroke="#e8f8ff" stroke-width="6" opacity=".8" ${N}/>`;
  },
  raket() {
    return `<g ${N}>` + glow(150, 350, 70, '#ffd97a', 0.8) + `</g>` +
      `<path d="M116,300Q150,410 184,300Z" fill="#ffb14a"/><path d="M132,300Q150,370 168,300Z" fill="#ffe27a" ${N}/>` +
      `<path d="M104,226Q54,250 50,330L108,300Z" fill="#e5533f"/><path d="M196,226Q246,250 250,330L192,300Z" fill="#e5533f"/>` +
      `<path d="M150,30Q226,110 206,296Q150,314 94,296Q74,110 150,30Z" fill="#f3f1ea"/>` +
      `<path d="M150,30Q184,62 200,104Q150,120 100,104Q116,62 150,30Z" fill="#e5533f"/>` +
      `<path d="M97,270Q150,284 203,270L206,296Q150,314 94,296Z" fill="#3a86d6"/>` +
      `<rect x="138" y="262" width="24" height="56" rx="10" fill="#e5533f"/>` +
      `<circle cx="150" cy="176" r="40" fill="#9aa9bf"/><circle cx="150" cy="176" r="28" fill="#7fd0f5" stroke-width="4"/>` +
      `<path d="M132,168Q136,152 152,150" fill="none" stroke="#fff" stroke-width="7" opacity=".8"/>` +
      `<g fill="#cfd8e6" stroke-width="3">` + [0, 1, 2, 3, 4, 5].map(i => f`<circle cx="${150 + Math.cos(i * Math.PI / 3) * 34}" cy="${176 + Math.sin(i * Math.PI / 3) * 34}" r="3.5"/>`).join('') + `</g>` +
      `<g fill="#ffd23f" stroke-width="3">` + [[122, 234], [150, 240], [178, 234]].map(([x, y]) => f`<circle cx="${x}" cy="${y}" r="7"/>`).join('') + `</g>` +
      `<path d="M104,110Q96,170 104,240" fill="none" stroke="#fff" stroke-width="8" opacity=".7" ${N}/>` +
      `<g ${N}>` + sparkle(54, 120, 16, '#ffd23f') + sparkle(250, 170, 12, '#ffd23f') + sparkle(236, 70, 9, '#fff6c8') + '</g>';
  },
  kompas() {
    return `<g ${N}>` + glow(150, 200, 170, '#fff4c2', 0.9) + `</g>` +
      `<path d="M44,372Q34,330 88,320H212Q266,330 256,372Q150,394 44,372Z" fill="#c0392b"/><path d="M60,340Q150,356 240,340" fill="none" stroke="#e5533f" stroke-width="8" opacity=".8" ${N}/>` +
      `<g fill="#ffd23f" stroke-width="4"><circle cx="46" cy="366" r="9"/><circle cx="254" cy="366" r="9"/></g>` +
      `<path d="M150,70m-22,0a22,22 0 1 1 44,0a22,22 0 1 1 -44,0" fill="none" stroke-width="18"/><path d="M150,70m-22,0a22,22 0 1 1 44,0a22,22 0 1 1 -44,0" fill="none" stroke="#f6c34a" stroke-width="8"/>` +
      `<rect x="136" y="86" width="28" height="22" rx="6" fill="#f6c34a" stroke-width="5"/>` +
      `<g ${N}>` + compass(150, 214, 116) + `</g>` +
      `<path d="M72,170Q86,126 128,110" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round" opacity=".55" ${N}/>` +
      `<g ${N}>` + sparkle(56, 100, 18) + sparkle(252, 132, 13) + sparkle(250, 290, 10, '#ffe27a') + sparkle(38, 260, 9, '#ffe27a') + '</g>';
  },
  kist(m) {
    const open = m === 'lacht' || m === 'verbaasd';
    const lid = open
      ? `<g ${N}>` + glow(150, 210, 150, '#fff4c2', 0.9) + `</g><path d="M44,224L66,120Q150,98 234,120L256,224Z" fill="#7a4a22"/><path d="M58,158Q150,140 242,158" fill="none" stroke="#f6c34a" stroke-width="12"/>` +
        `<g fill="#ffd23f" stroke-width="4">` + [70, 106, 142, 178, 214, 124, 160, 196, 96].map((x, i) => f`<circle cx="${x + 8}" cy="${i > 4 ? 206 : 222}" r="16"/>`).join('') + `</g>` + `<g ${N}>` + sparkle(110, 150, 16) + sparkle(200, 130, 12) + '</g>'
      : `<path d="M36,232Q36,128 150,128Q264,128 264,232Z" fill="#b8793f"/><path d="M40,190Q150,176 260,190" fill="none" stroke="#8a5530" stroke-width="5"/>` +
        `<path d="M66,232V148Q79,138 94,134V232ZM206,232V134Q221,138 234,148V232Z" fill="#f6c34a" stroke-width="5"/>`;
    return lid +
      `<rect x="40" y="224" width="220" height="156" rx="14" fill="#a8672f"/><path d="M44,276H256M44,328H256" stroke="#7a4a22" stroke-width="5"/>` +
      `<g fill="#f6c34a" stroke-width="5"><rect x="66" y="224" width="28" height="156"/><rect x="206" y="224" width="28" height="156"/></g>` +
      `<g fill="#a8741e" ${N}>` + [240, 300, 360].map(y => f`<circle cx="80" cy="${y}" r="4"/><circle cx="220" cy="${y}" r="4"/>`).join('') + `</g>` +
      `<rect x="36" y="220" width="228" height="16" rx="6" fill="#f6c34a" stroke-width="5"/>` +
      `<circle cx="150" cy="262" r="34" fill="#f6c34a" stroke-width="5"/>` + starfish(150, 264, 1.15, '#fff1a8') +
      `<g ${N}>` + sparkle(262, 110, 12, '#ffe27a') + sparkle(30, 180, 10, '#ffe27a') + '</g>';
  },
  schoen() {
    return `<path d="M22,334Q16,262 92,250Q142,242 160,196L168,72Q170,48 196,48H262Q284,48 284,72L288,334Z" fill="#9a6233"/>` +
      `<ellipse cx="226" cy="54" rx="56" ry="12" fill="#4a2e18" stroke-width="5"/>` +
      `<path d="M22,334Q20,282 72,262Q98,300 98,334Z" fill="#b57a45"/>` +
      `<path d="M34,318Q40,286 70,274" fill="none" stroke="#f4ead8" stroke-width="4" stroke-dasharray="10 9"/>` +
      `<g stroke="#f4ead8" stroke-width="7" stroke-linecap="round">` + [0, 1, 2, 3].map(i => f`<path d="M${150 - i * 3},${92 + i * 32}L${180 - i * 3},${116 + i * 32}M${180 - i * 3},${92 + i * 32}L${150 - i * 3},${116 + i * 32}"/>`).join('') + `</g>` +
      `<rect x="200" y="200" width="56" height="50" rx="6" fill="#c4914e" stroke-width="5" transform="rotate(-6 228 225)"/><path d="M208,210h40M208,240h40" stroke="#f4ead8" stroke-width="3" stroke-dasharray="6 6" transform="rotate(-6 228 225)"/>` +
      `<path d="M12,334H296V362Q296,380 278,380H32Q12,380 12,360Z" fill="#4a3b2f"/>` +
      `<path d="M40,358H270" stroke="#6b5a4c" stroke-width="5" stroke-dasharray="18 12"/>` +
      `<path d="M180,70Q230,62 276,72" fill="none" stroke="#c4914e" stroke-width="5" stroke-linecap="round"/>`;
  },
};

export const CHARACTERS = Object.keys(CH);

function placeholder(id) {
  const label = String(id || '?').slice(0, 1).toUpperCase().replace(/[<>&"']/g, '?');
  return `<circle cx="150" cy="290" r="90" fill="#e9dcc6"/>` + eyes(122, 178, 290, 14, 'blij') + mouth(150, 326, 14, 'blij') +
    `<text x="150" y="258" font-family="sans-serif" font-size="48" font-weight="700" fill="${OL}" stroke="none" text-anchor="middle">${label}</text>`;
}

export function character(id, mood = 'blij') {
  if (id == null || id === 'verteller') return '';
  const m = MOODS.includes(mood) ? mood : 'blij';
  let body;
  try { body = CH[id] ? CH[id](m) : placeholder(id); } catch (e) { body = placeholder(id); }
  const shadow = `<ellipse cx="150" cy="388" rx="${{ schoen: 130, brom: 130, boot: 125, kist: 125, kompas: 110 }[id] || 85}" ry="10" fill="#000" opacity=".15"/>`;
  return svg('0 0 300 400', shadow +
    `<g class="bob" stroke="${OL}" stroke-width="6" stroke-linejoin="round" stroke-linecap="round">${body}</g>`,
    'preserveAspectRatio="xMidYMax meet"');
}
