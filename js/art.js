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
  olivier: '{HELD}', florine: 'Florine', kwebbel: 'Kwebbel', brom: 'Brom',
  rommel: 'Rommel', piep: 'Piep', schoen: 'Reuzenschoen', verteller: 'Verteller',
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
    const trunk = (x, w) => f`<path d="M${x - w / 2},900Q${x - w * 0.4},500 ${x - w * 0.42},0H${x + w * 0.42}Q${x + w * 0.4},500 ${x + w / 2},900Z" fill="#7a5234" stroke="${OL}" stroke-width="6"/><path d="M${x - w * 0.15},860Q${x - w * 0.2},500 ${x - w * 0.1},100M${x + w * 0.18},820Q${x + w * 0.12},400 ${x + w * 0.2},60" fill="none" stroke="#5e3d24" stroke-width="10" stroke-linecap="round"/>`;
    return sky(['#9fd6c8', '#e8f3d0']) + rays(700, -100, 5, 0.22) +
      trunk(380, 120).replace(/#7a5234/, '#a7b98f').replace(/stroke="#3b2a1a" stroke-width="6"/, '') +
      trunk(1180, 140).replace(/#7a5234/, '#a7b98f').replace(/stroke="#3b2a1a" stroke-width="6"/, '') +
      ground(690, '#8fc873') + trunk(150, 300) + trunk(820, 240) + trunk(1460, 320) +
      blobs([[0, 20, 200], [300, -40, 200], [650, 0, 180], [950, -30, 210], [1300, 10, 200], [1600, -20, 200]], '#4f9a5a') +
      mushroom(560, 740, 2.4) + mushroom(1080, 720, 1.6) + pine(1280, 720, 140) +
      ground(760, '#7fbf6a') + tufts([[330, 830], [700, 860], [1260, 840], [980, 880]]) +
      flowers([[430, 820, '#fff'], [1350, 850, '#ff9ec4']]);
  },
  zee() {
    const id = 'z' + (++uid);
    return sky(['#8fd3f4', '#fdf0d2']) + glow(300, 180, 200, '#fff4c2', 0.8) +
      f`<circle cx="300" cy="180" r="70" fill="#ffe27a" stroke="${OL}" stroke-width="5"/>` + cloud(900, 120, 1) + cloud(1300, 200, 0.7) +
      `<g fill="none" stroke="${OL}" stroke-width="5" stroke-linecap="round"><path d="M620,260q15,-15 30,0q15,-15 30,0M760,210q12,-12 24,0q12,-12 24,0"/></g>` +
      f`<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5cc0e6"/><stop offset="1" stop-color="#2a7fc0"/></linearGradient></defs>` +
      `<rect y="470" width="1600" height="430" fill="url(#${id})"/>` +
      `<g stroke="${OL}" stroke-width="4" stroke-linejoin="round"><path d="M1150,470H1250L1235,490H1165Z" fill="#b8793f"/><path d="M1200,468V370L1245,458Z" fill="#fff"/><path d="M1195,380L1160,458H1195Z" fill="#ffd54a"/></g>` +
      waterLines([[100, 530, 120], [400, 580, 90], [800, 540, 140], [1300, 590, 100], [600, 660, 120], [1000, 700, 90], [200, 700, 100]]) +
      `<path d="M0,790Q300,760 600,780T1200,770T1600,780V900H0Z" fill="#f3dca0" stroke="${OL}" stroke-width="5"/>` +
      `<g stroke="${OL}" stroke-width="4"><path d="M300,850l20,-30l20,30Z" fill="#ffb3a0"/><circle cx="1300" cy="850" r="14" fill="#ffd9e6"/></g>`;
  },
  eiland() {
    const palm = (x, y, h, lean) => f`<path d="M${x},${y}Q${x + lean},${y - h / 2} ${x + lean * 1.4},${y - h}" fill="none" stroke="${OL}" stroke-width="30" stroke-linecap="round"/><path d="M${x},${y}Q${x + lean},${y - h / 2} ${x + lean * 1.4},${y - h}" fill="none" stroke="#b8793f" stroke-width="20" stroke-linecap="round"/>` +
      `<g fill="#4fae5a" stroke="${OL}" stroke-width="5" stroke-linejoin="round">` +
      [[-120, 20], [-80, -40], [0, -60], [80, -40], [120, 20]].map(([dx, dy]) => f`<path d="M${x + lean * 1.4},${y - h}Q${x + lean * 1.4 + dx * 0.5},${y - h + dy - 30} ${x + lean * 1.4 + dx},${y - h + dy + 30}Q${x + lean * 1.4 + dx * 0.4},${y - h + dy * 0.3} ${x + lean * 1.4},${y - h}Z"/>`).join('') +
      f`</g><circle cx="${x + lean * 1.4 - 10}" cy="${y - h + 14}" r="12" fill="#8a5a2b" stroke="${OL}" stroke-width="4"/>`;
    return sky(['#8fd3f4', '#fdf0d2']) + cloud(200, 140, 1) + cloud(1200, 100, 0.9) +
      `<rect y="480" width="1600" height="420" fill="#3ea3d8"/>` +
      waterLines([[80, 540, 120], [460, 600, 100], [1350, 560, 120], [150, 680, 90], [1300, 700, 120]]) +
      `<path d="M560,520Q900,380 1240,520Z" fill="#f3dca0" stroke="${OL}" stroke-width="5"/>` +
      palm(820, 470, 230, 30) + palm(1020, 480, 180, -30) +
      `<path d="M0,780Q400,740 800,770T1600,760V900H0Z" fill="#f3dca0" stroke="${OL}" stroke-width="5"/>` +
      `<g stroke="${OL}" stroke-width="4"><path d="M200,850l20,-30l20,30Z" fill="#ffb3a0"/><circle cx="1420" cy="840" r="14" fill="#ffd9e6"/></g>`;
  },
  ruimte() {
    return sky(['#0b0f2e', '#231a55', '#3a2a73']) + stars(5, 70, 760, 10) +
      glow(1200, 260, 260, '#ffb86b', 0.35) +
      f`<ellipse cx="1200" cy="260" rx="230" ry="50" fill="none" stroke="${OL}" stroke-width="30" transform="rotate(-15 1200 260)"/><ellipse cx="1200" cy="260" rx="230" ry="50" fill="none" stroke="#ffd98a" stroke-width="18" transform="rotate(-15 1200 260)"/>` +
      f`<circle cx="1200" cy="260" r="130" fill="#f79a5a" stroke="${OL}" stroke-width="6"/><path d="M1085,220Q1200,250 1315,210M1080,300Q1200,330 1320,290" fill="none" stroke="#e07a3e" stroke-width="16" stroke-linecap="round"/>` +
      f`<circle cx="300" cy="200" r="60" fill="#6fc3ff" stroke="${OL}" stroke-width="5"/><path d="M270,170q20,10 40,-5q10,30 -10,45q-30,5 -30,-40Z" fill="#7ed67a"/>` +
      `<path d="M0,800Q400,700 800,740T1600,720V900H0Z" fill="#8e87b8" stroke="${OL}" stroke-width="6"/>` +
      `<g fill="#7a73a6" stroke="${OL}" stroke-width="4"><ellipse cx="300" cy="830" rx="60" ry="16"/><ellipse cx="1250" cy="800" rx="80" ry="18"/><ellipse cx="800" cy="860" rx="40" ry="10"/></g>`;
  },
  ruimteschip() {
    let panels = '';
    for (const x of [60, 1330]) panels += f`<rect x="${x}" y="200" width="210" height="300" rx="30" fill="#b7c4d8" stroke="${OL}" stroke-width="5"/><rect x="${x + 30}" y="240" width="150" height="90" rx="14" fill="#22314f" stroke="${OL}" stroke-width="4"/><path d="M${x + 45},300l25,-25l25,15l25,-30l30,20" fill="none" stroke="#7ff3ff" stroke-width="5" stroke-linecap="round"/>` +
      [['#ff6b6b', 0], ['#ffd23f', 1], ['#6bdc7a', 2]].map(([c, i]) => f`<circle cx="${x + 55 + i * 50}" cy="400" r="18" fill="${c}" stroke="${OL}" stroke-width="4"/>`).join('');
    const wid = 'wn' + (++uid);
    return `<rect width="1600" height="900" fill="#d6dfec"/>` +
      `<g fill="none" stroke="#bcc8da" stroke-width="10"><path d="M0,120H1600M0,560H1600M400,0V560M1200,0V560"/></g>` +
      `<g fill="#a9b6ca">` + [80, 200, 1400, 1520].map(x => f`<circle cx="${x}" cy="90" r="7"/>`).join('') + `</g>` +
      f`<defs><clipPath id="${wid}"><circle cx="800" cy="300" r="210"/></clipPath></defs>` +
      f`<circle cx="800" cy="300" r="240" fill="#9aa9bf" stroke="${OL}" stroke-width="6"/>` +
      `<g clip-path="url(#${wid})"><rect x="580" y="80" width="440" height="440" fill="#141a45"/>` +
      stars(9, 40, 520, 3).replace(/cx="(\d+\.?\d*)"/g, (m, v) => `cx="${580 + (v % 440)}"`).replace(/M(\d+\.?\d*),/g, (m, v) => `M${580 + (v % 440)},`) +
      f`<circle cx="900" cy="400" r="90" fill="#f79a5a" stroke="${OL}" stroke-width="5"/><path d="M820,380q80,20 160,-10" fill="none" stroke="#e07a3e" stroke-width="14" stroke-linecap="round"/></g>` +
      f`<circle cx="800" cy="300" r="210" fill="none" stroke="${OL}" stroke-width="6"/><path d="M660,200q40,-60 110,-80" fill="none" stroke="#fff" stroke-width="12" stroke-linecap="round" opacity=".5"/>` +
      panels +
      `<rect y="600" width="1600" height="300" fill="#9aa6ba" stroke="${OL}" stroke-width="6"/>` +
      `<g stroke="#8794aa" stroke-width="5"><path d="M0,700H1600M0,800H1600M200,600L100,900M600,600L560,900M1000,600L1040,900M1400,600L1500,900"/></g>` +
      `<rect y="585" width="1600" height="20" fill="#ffd23f" stroke="${OL}" stroke-width="5"/>`;
  },
  kartbaan() {
    const flags = []; for (let x = -20; x < 1640; x += 70) flags.push(x);
    const cols = ['#e5533f', '#ffd23f', '#3a86d6', '#5dbb63'];
    let check = '';
    for (let y = 612; y < 768; y += 26) for (let i = 0; i < 3; i++) if ((y / 26 + i) % 2 < 1) check += f`<rect x="${1180 + i * 26}" y="${y}" width="26" height="26"/>`;
    return sky(['#8fd3f4', '#fdf0d2']) + cloud(300, 170, 1) + cloud(1100, 240, 0.8) +
      `<path d="M0,500Q400,400 800,470T1600,450V620H0Z" fill="#a5d98a"/>` +
      // tribune
      `<g stroke="${OL}" stroke-width="5"><rect x="180" y="380" width="560" height="200" rx="16" fill="#cfd8e6"/><path d="M160,390L460,300L760,390Z" fill="#e5533f"/></g>` +
      blobs([[240, 450, 20], [310, 450, 20], [380, 450, 20], [450, 450, 20], [520, 450, 20], [590, 450, 20], [660, 450, 20], [270, 520, 20], [340, 520, 20], [410, 520, 20], [480, 520, 20], [550, 520, 20], [620, 520, 20]], '#f2b98c').replace(/stroke-width="5"/, 'stroke-width="4"') +
      `<path d="M-20,90Q800,190 1620,90" fill="none" stroke="${OL}" stroke-width="5"/>` +
      flags.map((x, i) => { const y = 90 + 100 * (1 - Math.pow((x - 800) / 820, 2)) ; return f`<path d="M${x},${y}l24,48l24,-46Z" fill="${cols[i % 4]}" stroke="${OL}" stroke-width="4" stroke-linejoin="round"/>`; }).join('') +
      `<rect y="590" width="1600" height="200" fill="#6b6f7a"/>` +
      `<path d="M0,601H1600M0,779H1600" stroke="#fff" stroke-width="22"/><path d="M0,601H1600M0,779H1600" stroke="#e5533f" stroke-width="22" stroke-dasharray="40 40"/>` +
      `<path d="M0,690H1600" stroke="#fff" stroke-width="8" stroke-dasharray="60 50"/>` +
      `<rect x="1180" y="612" width="78" height="156" fill="#fff"/><g fill="#2b2b33">${check}</g>` +
      `<g stroke="${OL}" stroke-width="5"><rect x="1260" y="300" width="16" height="300" fill="#cfd8e6"/><rect x="1560" y="300" width="16" height="300" fill="#cfd8e6"/><rect x="1240" y="300" width="360" height="70" rx="10" fill="#fff"/></g>` +
      `<g fill="#2b2b33">` + [0, 1, 2, 3, 4, 5, 6].map(i => f`<rect x="${1260 + i * 48}" y="${i % 2 ? 310 : 335}" width="24" height="25"/>`).join('') + `</g>` +
      `<rect y="790" width="1600" height="110" fill="#8cc56a" stroke="${OL}" stroke-width="5"/>` + tufts([[200, 860], [700, 880], [1300, 860]]);
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
  olivier(m) {
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
  const shadow = `<ellipse cx="150" cy="388" rx="${id === 'schoen' || id === 'brom' ? 130 : 85}" ry="10" fill="#000" opacity=".15"/>`;
  return svg('0 0 300 400', shadow +
    `<g class="bob" stroke="${OL}" stroke-width="6" stroke-linejoin="round" stroke-linecap="round">${body}</g>`,
    'preserveAspectRatio="xMidYMax meet"');
}
