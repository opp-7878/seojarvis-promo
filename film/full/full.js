// SEO Jarvis — полный ролик 2:07. Каждый кадр — чистая функция времени: seek(t).
// Координаты — в cqw (1cqw = 1% ширины кадра = 19.2px), как на странице раскладок.
'use strict';
const U = 19.2, DUR = 127;
const PEAK = 32.67;                       // удар музыки и вспышка «Продвижение запущено»
const TOUR0 = 41, MOD = 7.5;               // модули: 41 + 7.5·i
const WALL = 116, FIN = 120;

// ---------- математика ----------
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, k) => a + (b - a) * k;
const E = {
  lin: k => k, o2: k => 1 - (1 - k) ** 2, o3: k => 1 - (1 - k) ** 3, o5: k => 1 - (1 - k) ** 5,
  i2: k => k * k, i3: k => k ** 3, io: k => k < .5 ? 4 * k ** 3 : 1 - (-2 * k + 2) ** 3 / 2,
  io2: k => k < .5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2,
};
function stepR(tau, w, z) {
  if (tau <= 0) return 0;
  if (z >= 1) { const x = w * tau; return 1 - Math.exp(-x) * (1 + x); }
  const wd = w * Math.sqrt(1 - z * z);
  return 1 - Math.exp(-z * w * tau) * (Math.cos(wd * tau) + (z * w / wd) * Math.sin(wd * tau));
}
const sp = (t, t0, w = 12, z = .75) => stepR(t - t0, w, z);
const pr = (t, t0, d, e = E.o3) => e(clamp((t - t0) / d));
const bump = (t, t0, d) => { const k = (t - t0) / d; return k <= 0 || k >= 1 ? 0 : Math.sin(Math.PI * k); };
class Track {
  constructor(v0) { this.v0 = v0; this.cur = v0; this.ev = []; }
  to(t, v, w = 9, z = .8) { this.ev.push([t, v - this.cur, w, z]); this.cur = v; return this; }
  at(t) { let v = this.v0; for (const [ti, d, w, z] of this.ev) v += d * stepR(t - ti, w, z); return v; }
}
function kf(t, keys, ease = E.io) {         // keys: [[t, v...]] — значения массивом или числом
  if (t <= keys[0][0]) return keys[0].slice(1);
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) {
      const a = keys[i - 1], b = keys[i], k = ease((t - a[0]) / (b[0] - a[0]));
      return a.slice(1).map((v, j) => lerp(v, b[j + 1], k));
    }
  }
  return keys[keys.length - 1].slice(1);
}

// ---------- стили ----------
const ADD = { x: 1, y: 1, r: 1, rx: 1, ry: 1, bl: 1, hb: 1 }, MUL = { s: 1, sx: 1, sy: 1, op: 1 };
function M(...os) {
  const r = { x: 0, y: 0, r: 0, rx: 0, ry: 0, s: 1, sx: 1, sy: 1, op: 1, bl: 0, hb: 0 };
  for (const o of os) { if (!o) continue; for (const k in o) { const v = o[k]; if (ADD[k]) r[k] += v; else if (MUL[k]) r[k] *= v; else r[k] = v; } }
  return r;
}
function S(el, o) {
  o = M(o);
  let tr = o.per ? `perspective(${o.per}px) ` : '';
  tr += `translate(${o.x.toFixed(2)}px,${o.y.toFixed(2)}px)`;
  if (o.rx) tr += ` rotateX(${o.rx.toFixed(3)}deg)`;
  if (o.ry) tr += ` rotateY(${o.ry.toFixed(3)}deg)`;
  if (o.r) tr += ` rotate(${o.r.toFixed(3)}deg)`;
  const sx = o.s * o.sx, sy = o.s * o.sy;
  if (sx !== 1 || sy !== 1) tr += ` scale(${sx.toFixed(4)},${sy.toFixed(4)})`;
  el.style.transform = tr;
  const op = clamp(o.op);
  el.style.opacity = op.toFixed(4);
  el.style.visibility = op < 0.003 ? 'hidden' : 'visible';
  let f = '';
  if (o.bl > 0.15) f += `blur(${o.bl.toFixed(2)}px) `;
  const hb = Math.round(Math.min(o.hb, 48) / 2);
  if (hb >= 1) f += `url(#hb${hb})`;
  if (o.keepFilter) f = (f + ' ' + o.keepFilter).trim();
  el.style.filter = f || '';
}
// входы и выходы
function fin(t, t0, type = 'pop') {
  if (t0 == null) return {};
  const v = clamp((t - t0) / .16), b = (1 - clamp((t - t0) / .3));
  switch (type) {
    case 'fade': return { op: clamp((t - t0) / .3) };
    case 'swap': return { op: clamp((t - t0) / .15) };
    case 'up': { const p = sp(t, t0, 10, .82); return { y: (1 - p) * 18 * U, op: v, bl: b * 8 }; }
    case 'down': { const p = sp(t, t0, 10, .82); return { y: -(1 - p) * 14 * U, op: v, bl: b * 8 }; }
    case 'left': { const p = sp(t, t0, 11, .8); return { x: -(1 - p) * 30 * U, op: v, hb: Math.abs(1 - p) * 40 * (t > t0) }; }
    case 'right': { const p = sp(t, t0, 11, .8); return { x: (1 - p) * 30 * U, op: v, hb: Math.abs(1 - p) * 40 * (t > t0) }; }
    case 'sw': { const p = sp(t, t0, 15, .72), q = 1 - p; return { x: q * 8 * U, sx: 1 + Math.max(0, q) * .55, op: clamp((t - t0) / .1), hb: Math.abs(q) * 36 * (t > t0) }; }
    case 'big': { const p = sp(t, t0, 12, .62); return { s: .55 + .45 * p, op: v, bl: b * 10 }; }
    default: { const p = sp(t, t0, 13, .72); return { op: v, s: .94 + .06 * p, y: (1 - p) * 1.5 * U, bl: b * 10 }; }
  }
}
function fout(t, t1, type = 'blur') {
  if (t1 == null || t < t1) return {};
  const k = pr(t, t1, .3, E.i2);
  switch (type) {
    case 'up': return { op: 1 - k, y: -k * 6 * U, bl: k * 10 };
    case 'left': return { op: 1 - k, x: -k * 20 * U, hb: k * 30 };
    case 'fast': { const q = pr(t, t1, .15, E.i2); return { op: 1 - q, bl: q * 8 }; }
    default: return { op: 1 - k, bl: k * 12, s: 1 - k * .04 };
  }
}
const vis = (t, a, b, fi = .2, fo = .2) => clamp((t - a) / fi) * (b == null ? 1 : clamp((b - t) / fo));

// ---------- DOM ----------
const $ = s => document.querySelector(s);
function el(tag, cls, parent, style, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (style) e.style.cssText = style;
  if (html != null) e.innerHTML = html;
  if (parent) parent.appendChild(e);
  return e;
}
const NAT = {
  dash_full: [1600, 1000], core: [1400, 262], keys: [1280, 862], share: [1280, 710], audit_head: [1400, 188], audit_todo: [1400, 403],
  links_full: [1600, 1000], geo_head: [1400, 187], geo_cite: [1342, 936], yamaps: [864, 690], yamaps_btn: [394, 92], yamaps_new: [1920, 1440],
  yamaps_new_filled: [1920, 1440], bonus_full: [1600, 1000], learn_video: [1400, 730], demand: [1400, 652], potential: [1400, 569],
  positions_full: [1600, 1000], add_card: [1120, 1088], add_card_menu0: [1120, 1208], congrats: [888, 1066],
  'act/audit_todo2': [2656, 764], 'act/bonus_banner': [2656, 470], 'act/comp_view': [2240, 1380], 'act/dash_modal': [1008, 1044],
  'act/demand0': [1590, 740], 'act/demand_hover': [1590, 740], 'act/geo_panel': [1300, 2000], 'act/learn_modal': [1440, 1032],
  'act/links_off': [2656, 476], 'act/links_on': [2656, 476], 'act/pos_reco': [2656, 1612],
};
const ar = k => NAT[k][1] / NAT[k][0];
const MAS_AR = 505 / 600, MAG_AR = 502 / 600;

// горизонтальный смаз (как в Spotify)
(() => {
  let h = '';
  for (let i = 1; i <= 24; i++) h += `<filter id="hb${i}" x="-60%" y="-10%" width="220%" height="120%"><feGaussianBlur stdDeviation="${i * 2} 0"/></filter>`;
  $('#fdefs').innerHTML = h;
})();

const CUES = { clicks: [], whoosh: [], type: [], ticks: [], pops: [], impacts: [], peak: PEAK, dur: DUR };
const SC = [];
function scene(a, b) { const r = el('div', 'scene', $('#scenes')); const s = { a, b, r, up: () => {}, meas: [] }; SC.push(s); return s; }
function words(parent, text, cls = 'wd') {
  const ws = text.split(' ');
  return ws.map((w, i) => { const s = el('span', cls, parent); s.textContent = w + (i < ws.length - 1 ? ' ' : ''); return s; });
}
function letters(parent, text) { return [...text].map(c => { const s = el('span', 'lt', parent); s.textContent = c; return s; }); }
const typed = (str, t, t0, rate) => str.slice(0, clamp(Math.floor((t - t0) / rate) + 1, 0, str.length) * (t >= t0));
function typeCue(t0, str, rate) { CUES.type.push([t0, str.length, rate]); }
function center(e) { const r = e.getBoundingClientRect(); return [(r.left + r.width / 2) / U, (r.top + r.height / 2) / U, r.width / U, r.height / U]; }

// ---------- курсор ----------
const CUR = { kp: [], shows: [], clicks: [] };
function curPath(show0, show1, kps, clicks = []) {
  CUR.shows.push([show0, show1]);
  for (const k of kps) CUR.kp.push(k);
  for (const c of clicks) { CUR.clicks.push(c); CUES.clicks.push(c); }
}
function curPos(t) {
  const kp = CUR.kp;
  let i = kp.findIndex(k => k[0] > t);
  if (i === -1) return kp[kp.length - 1].slice(1);
  if (i === 0) return kp[0].slice(1);
  const a = kp[i - 1], b = kp[i];
  const s0 = Math.max(a[0], b[0] - (b[3] || .55));
  const k = E.io(clamp((t - s0) / (b[0] - s0)));
  return [lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
}
function curUpdate(t) {
  CUR.kp.sort((a, b) => a[0] - b[0]);
  let v = 0;
  for (const [a, b] of CUR.shows) v = Math.max(v, vis(t, a, b, .18, .2));
  const [x, y] = curPos(t);
  let press = 1, rip = null;
  for (const c of CUR.clicks) {
    const d = t - c;
    if (d > -.1 && d < .16) press = Math.min(press, 1 - .16 * bump(t, c - .1, .26));
    if (d >= 0 && d < .5) rip = [c, d];
  }
  S($('#cursor'), { x: (x - .3) * U, y: (y - .2) * U, s: press, op: v });
  if (rip && v > 0) {
    const [c, d] = rip, [rx, ry] = curPos(c), k = d / .5;
    S($('#ripple'), { x: rx * U, y: ry * U, s: .3 + 1.1 * E.o3(k), op: (1 - k) * .95 });
  } else S($('#ripple'), { op: 0 });
}

// ---------- маскот ----------
function mascotEl(parent, src = 'mascot-wink', w = 22, cls = 'mascot') {
  const e = el('img', cls, parent); e.src = `img/${src}.png`; e.style.width = w + 'cqw'; e._w = w; e._ar = src === 'mascot-wink' ? MAS_AR : MAG_AR;
  e.style.transformOrigin = '50% 50%';
  return e;
}
// по центру (cx, cy) и ширине w; squash — сжатие с сохранением низа
function mascotSet(e, cx, cy, w, o = {}, squash = 0) {
  const h = e._w * e._ar, s = w / e._w;
  const sx = 1 + squash, sy = 1 - squash;
  S(e, M({ x: (cx - e._w / 2) * U, y: (cy - h / 2) * U + (1 - sy) * h * s / 2 * U, s, sx, sy }, o));
}
const wobble = (t, t0, amp = .16, f = 26, dec = 7) => t < t0 ? 0 : amp * Math.exp(-(t - t0) * dec) * Math.cos((t - t0) * f);

// ---------- знак ----------
const PET = ['M25.0111 13.2056C25.2516 16.1344 23.9056 10.7651 18.5327 10.8046C12.8162 10.6513 11.8413 16.2738 12.1908 13.1058C12.5403 9.93777 15.0655 7.13892 18.5298 7.13892C21.9941 7.13892 24.7706 10.2769 25.0111 13.2056Z',
  'M6.98889 18.8921C6.74837 15.9634 8.09435 21.3326 13.4673 21.2931C19.1838 21.4464 20.1588 15.8239 19.8092 18.992C19.4597 22.16 16.9345 24.9588 13.4702 24.9588C10.0059 24.9588 7.2294 21.8209 6.98889 18.8921Z',
  'M18.8222 24.9733C15.8949 25.2139 21.2614 23.8673 21.2219 18.4916C21.3751 12.7721 15.7555 11.7967 18.9219 12.1464C22.0883 12.4961 24.8857 15.0226 24.8857 18.4887C24.8857 21.9548 21.7494 24.7327 18.8222 24.9733Z',
  'M13.3058 7.02663C16.233 6.78599 10.8665 8.13266 10.906 13.5084C10.7528 19.2278 16.3724 20.2032 13.206 19.8535C10.0396 19.5038 7.24219 16.9773 7.24219 13.5113C7.24219 10.0452 10.3785 7.26727 13.3058 7.02663Z'];
let markN = 0;
function makeMark(parent, size, style = '') {
  const id = 'mg' + (markN++);
  const box = el('div', '', parent, `position:relative;width:${size}cqw;height:${size}cqw;flex:none;${style}`);
  box.innerHTML = `<svg viewBox="0 0 32 32" style="width:100%;height:100%;display:block;overflow:visible;filter:drop-shadow(0 0 3cqw rgba(26,105,240,.7))"><defs><linearGradient id="${id}" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse"><stop stop-color="#0B64F4"/><stop offset="1" stop-color="#1AA2E6"/></linearGradient></defs><rect width="32" height="32" rx="8" fill="url(#${id})"/>${PET.map(d => `<path d="${d}" fill="#fff"/>`).join('')}</svg>`;
  const svg = box.firstChild;
  return { box, svg, sq: svg.querySelector('rect'), pet: [...svg.querySelectorAll('path')] };
}
// p — сборка 0..1 для каждого лепестка, q — масштаб квадрата
function markSet(m, pets, q) {
  m.sq.setAttribute('transform', `translate(16 16) scale(${Math.max(0, q).toFixed(4)}) translate(-16 -16)`);
  m.pet.forEach((e, i) => {
    const p = pets[i], k = 1 - p;
    const ang = (i * 90 + 40) * k + 220 * k, dx = [14, -14, -14, 14][i] * k * 1.6, dy = [-12, 12, -12, 12][i] * k * 1.6;
    e.setAttribute('transform', `rotate(${ang.toFixed(2)} 16 16) translate(${dx.toFixed(2)} ${dy.toFixed(2)})`);
    e.setAttribute('opacity', clamp(p * 3).toFixed(3));
  });
}

// =====================================================================
// 01–03. Открытие: фраза и стопка → «О» → логотип → маскот (0–11 с)
// =====================================================================
(() => {
  const s = scene(0, 11.2), R = s.r;
  // стопка окон
  const ST = ['learn_video', 'links_full', 'dash_full'], Wd = 38, Hd = 23.75;
  const wins = ST.map((k, i) => {
    const back = 2 - i;
    const w = el('div', 'win fill', R, `left:${55 + back * 3.2}cqw;top:${20 - back * 3.2}cqw;width:${Wd}cqw;height:${Hd}cqw;z-index:${3 + i}`,
      `<img src="img/${k}.jpg" alt=""><div class="sh"></div>`);
    return { w, sh: w.querySelector('.sh'), land: [0.95, 1.5, 2.05][i] };
  });
  // фраза
  const tx = el('div', 't', R, 'left:6cqw;top:15cqw;font-size:5.4cqw;z-index:10');
  const l1 = el('div', '', tx), l2 = el('div', '', tx), l3 = el('div', '', tx);
  const w1 = [...words(l1, 'Всё для'), ...words(l2, 'продвижения —')];
  const w3 = [el('span', 'wd fillw', l3), el('span', 'wd fillw', l3), el('span', 'wd fillw', l3), el('span', 'wd fillw', l3)];
  ['в ', 'о', 'дном ', 'кабинете'].forEach((x, i) => w3[i].textContent = x);
  const tIn = [.15, .32, .55, .8], t3 = [1.55, 1.68, 1.68, 1.85];
  const FILL0 = 2.05, FILL1 = 2.65;
  const oL = w3[1];
  // кольцо с делениями
  const ring = el('div', '', R, 'position:absolute;left:42cqw;top:20.125cqw;width:16cqw;height:16cqw;z-index:12');
  let tk = '';
  for (let i = 0; i < 30; i++) {
    const a = i / 30 * Math.PI * 2, r1 = 84, r2 = i % 5 === 0 ? 97 : 92;
    tk += `<line x1="${(100 + r1 * Math.sin(a)).toFixed(1)}" y1="${(100 - r1 * Math.cos(a)).toFixed(1)}" x2="${(100 + r2 * Math.sin(a)).toFixed(1)}" y2="${(100 - r2 * Math.cos(a)).toFixed(1)}" stroke="#fff" stroke-width="${i % 5 === 0 ? 3 : 1.8}" stroke-linecap="round"/>`;
  }
  ring.innerHTML = `<svg viewBox="0 0 200 200" style="width:100%;height:100%;overflow:visible;filter:drop-shadow(0 0 2cqw rgba(26,105,240,.8))"><circle cx="100" cy="100" r="72" fill="none" stroke="#1A69F0" stroke-width="7"/>${tk}</svg>`;
  const ticks = [...ring.querySelectorAll('line')];
  const TICK0 = 4.45, TICK1 = 5.0;
  for (let i = 0; i < 30; i += 5) CUES.ticks.push(TICK0 + (i / 30) * (TICK1 - TICK0));
  // логотип
  const logo = el('div', '', R, 'position:absolute;left:0;right:0;top:28.125cqw;height:0;display:flex;align-items:center;justify-content:center;gap:2.4cqw;z-index:12');
  const mk = makeMark(logo, 12);
  const wordB = el('div', 't', logo, 'position:relative;font-size:8cqw;letter-spacing:-.035em');
  const lw = letters(wordB, 'SEO Jarvis');
  // маскот, тексты
  const glow = el('div', 'glow', R, 'left:32cqw;top:-2cqw;width:36cqw;height:36cqw;z-index:2');
  const mas = mascotEl(R, 'mascot-wink', 22); mas.style.zIndex = 14;
  const jv = el('div', 't', R, 'left:0;right:0;top:37cqw;text-align:center;font-size:5.2cqw;z-index:13');
  const jl = letters(jv, 'Jarvis');
  const sub = el('div', 't', R, 'left:0;right:0;top:44.4cqw;text-align:center;font-size:2.6cqw;z-index:13;color:#1A69F0');
  const sw = words(sub, 'SEO на автопилоте');
  const SCAT = [[6, 8, -30], [13, 30, 24], [4, 44, -12], [19, 4, -8], [78, 6, -22], [88, 22, 30], [74, 40, -35], [90, 46, 18], [83, 32, -8]];
  CUES.whoosh.push(.5, 1.1, 1.65, 3.9, 5.05, 6.85, 10.35);
  CUES.impacts.push(7.3);
  CUES.pops.push(5.9, 8.5);
  for (let i = 0; i < 9; i++) CUES.ticks.push(6.0 + i * .06);
  let geo = null;
  s.meas.push(() => {
    geo = {
      o: center(oL), w: [...w1, ...w3].map(center), mark: center(mk.box), let: lw.map(center), jl: jl.map(center), sw: sw.map(center),
    };
  });
  const MAS_C = [50, 6 + 22 * MAS_AR / 2];
  s.up = t => {
    // --- окна стопки
    wins.forEach((o, i) => {
      const st = o.land - .55, p = sp(t, st, 10, .62), q = 1 - p;
      const arc = Math.sin(Math.PI * clamp(p)) * -5;
      const out = t > 3.85 ? pr(t, 3.85 + i * .04, .5, E.i2) : 0;
      S(o.w, M({ per: 2112, ry: -20 - 55 * q, rx: 7 + 10 * q, r: 22 * q, x: q * 42 * U, y: (q * 32 + arc) * U, op: clamp((t - st) / .12) },
        { x: out * 40 * U, y: out * 18 * U, r: out * 14, op: 1 - out, hb: out * 30 }));
      let sh = 0;
      for (let j = i + 1; j < 3; j++) sh += clamp(sp(t, wins[j].land - .55, 10, .62)) * (j === i + 1 ? .55 : .17);
      o.sh.style.opacity = sh.toFixed(3);
    });
    // --- слова
    const all = [...w1, ...w3];
    all.forEach((e, i) => {
      const t0 = i < 4 ? tIn[i] : t3[i - 4];
      if (e === oL && t > 3.85) return;
      let out = null;
      if (t > 3.85 && geo) {
        const k = pr(t, 3.85 + i * .025, .45, E.i2), g = geo.w[i], dx = g[0] - 30, dy = g[1] - 22;
        out = { x: dx * k * 1.4 * U, y: (dy * k * 1.4 - 6 * k) * U, r: (i % 2 ? 1 : -1) * 40 * k, op: 1 - k, bl: k * 10 };
      }
      S(e, M(fin(t, t0, 'sw'), out));
    });
    // синяя заливка «в одном кабинете»
    if (geo) {
      const x0 = geo.w[4][0] - geo.w[4][2] / 2, x1 = geo.w[7][0] + geo.w[7][2] / 2;
      const f = lerp(x0, x1, pr(t, FILL0, FILL1 - FILL0, E.io2));
      w3.forEach((e, i) => {
        const g = geo.w[4 + i], a = g[0] - g[2] / 2, q = clamp((f - a) / g[2]);
        e.style.backgroundPosition = `${((1 - q) * 100).toFixed(2)}% 0`;
      });
    }
    // --- «о» → кольцо
    if (t > 3.85 && geo) {
      const k = pr(t, 3.85, .6, E.io), [ox, oy] = geo.o;
      S(oL, { x: (50 - ox) * k * U, y: (28.125 - oy + .6) * k * U, s: 1 + k * 3.2, op: 1 - pr(t, 4.3, .2) });
    }
    const rIn = pr(t, 4.25, .35, E.o3), rOut = pr(t, 5.0, .35, E.i2);
    S(ring, { s: lerp(.35, 1, rIn) + rOut * .35, r: -90 * (1 - rIn) + 300 * E.i2(clamp((t - 4.8) / .55)), op: rIn * (1 - rOut) });
    ticks.forEach((l, i) => l.setAttribute('opacity', clamp((t - (TICK0 + i / 30 * (TICK1 - TICK0))) / .06).toFixed(2)));
    // --- знак
    const pets = [0, 1, 2, 3].map(i => clamp(sp(t, 5.05 + i * .08, 10, .7), 0, 1.2));
    markSet(mk, pets, sp(t, 5.3, 11, .55));
    let mx = 0;
    if (geo) mx = (50 - geo.mark[0]) * (1 - sp(t, 5.95, 9, .85));
    const hit = pr(t, 7.28, .2, E.i2);
    S(mk.box, { x: mx * U, op: t < 5.0 ? 0 : 1 - hit, s: 1 - hit * .5 });
    // буквы «SEO Jarvis» выходят из знака, потом разлетаются от удара
    lw.forEach((e, i) => {
      if (!geo) return;
      const g = geo.let[i], mc = geo.mark;
      const t0 = 6.0 + i * .06, p = sp(t, t0, 12, .7);
      let o = { x: (mc[0] - g[0]) * (1 - p) * U, y: (mc[1] - g[1]) * (1 - p) * U, s: .3 + .7 * clamp(p, 0, 1.2), op: clamp((t - t0) / .12), bl: (1 - clamp(p)) * 6 };
      if (i === 3) o.op = 0;
      if (t > 7.28) {
        const j = i > 3 ? i - 1 : i, sc = SCAT[j] || [50, 50, 0], k = sp(t, 7.28 + j * .015, 7, .9);
        o = M(o, { x: (sc[0] + 2.5 - g[0]) * k * U, y: (sc[1] + 3 - g[1]) * k * U, r: sc[2] * k, s: 1 - .3 * k, op: 1 - .78 * clamp(k) - .22 * pr(t, 9.9, .5), hb: bump(t, 7.28, .45) * 18 });
      }
      S(e, o);
    });
    // --- маскот
    if (geo) {
      const mc = geo.mark;
      let cx, cy, w, r = 0, o = {}, sq = 0;
      if (t < 7.3) {
        const k = E.i2(clamp((t - 6.85) / .45));
        cx = lerp(84, mc[0], k); cy = lerp(-14, mc[1], k) - Math.sin(Math.PI * k) * 4; w = lerp(18, 16, k); r = -25 * (1 - k);
        o = { op: clamp((t - 6.85) / .08), hb: (1 - k) * 22 * (t > 6.85) };
      } else {
        const k = sp(t, 7.45, 8, .8);
        cx = lerp(mc[0], MAS_C[0], k); cy = lerp(mc[1], MAS_C[1], k); w = lerp(16, 22, k);
        sq = wobble(t, 7.3, .2, 24, 6) + wobble(t, 8.5, .08, 22, 6);
        cy += Math.sin((t - 8) * 2.4) * .35 * clamp(t - 8.2);
        const ex = pr(t, 10.3, .55, E.i2);
        cx = lerp(cx, -14, ex); cy = lerp(cy, 26, ex); w = lerp(w, 12, ex); r = -14 * ex;
        o = { hb: ex * 34 };
      }
      mascotSet(mas, cx, cy, w, M({ r }, o), sq);
    }
    S(glow, { op: pr(t, 7.6, .6) * (1 - pr(t, 10.2, .4)) * .8, s: .8 + .2 * pr(t, 7.6, .6) });
    jl.forEach((e, i) => {
      if (!geo) return;
      const g = geo.jl[i], t0 = 8.5 + i * .055, p = sp(t, t0, 11, .72);
      S(e, M({ x: (50 - g[0]) * (1 - p) * U, y: (MAS_C[1] + 3 - g[1]) * (1 - p) * U, s: .2 + .8 * clamp(p, 0, 1.3), op: clamp((t - t0) / .12), bl: (1 - clamp(p)) * 8 }, fout(t, 10.15 + i * .02, 'left')));
    });
    sw.forEach((e, i) => S(e, M(fin(t, 8.95 + i * .13, 'sw'), fout(t, 10.2 + i * .03, 'left'))));
  };
})();

// =====================================================================
// 04. Регистрация (10.8–18.2)
// =====================================================================
(() => {
  const s = scene(10.8, 18.3), R = s.r;
  const title = el('div', 't', R, 'left:4.5cqw;top:5cqw;font-size:4.2cqw;z-index:10');
  const tw = words(title, 'Регистрация');
  el('span', 'wd', title).textContent = ' ';
  const tb = el('span', 'b', title); const tw2 = words(tb, 'в 1 клик');
  const sub = el('div', 'mono', R, 'position:absolute;left:4.6cqw;top:10.6cqw;font-size:1.3cqw;letter-spacing:.08em;color:rgba(255,255,255,.72);white-space:nowrap;z-index:10', 'ТЕЛЕФОН · ПОЧТА · ЯНДЕКС ID · MAX');
  const PH = '<svg viewBox="0 0 24 24" style="width:1.1cqw" fill="currentColor"><path d="M20 15.5l-3.4-.4a1.6 1.6 0 0 0-1.4.5l-2 2a15 15 0 0 1-6.6-6.6l2-2c.4-.4.6-.9.5-1.4L8.7 4.2A1.6 1.6 0 0 0 7 2.8H4.5C3.6 2.8 2.8 3.6 2.9 4.6 3.5 13 11 20.5 19.4 21.1c1 .1 1.8-.7 1.8-1.6v-2.5c0-.8-.6-1.5-1.2-1.5z"/></svg>';
  const ML = '<svg viewBox="0 0 24 24" style="width:1.1cqw" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>';
  const au = el('div', 'auth', R, 'left:55cqw;top:13cqw;width:34cqw;z-index:8',
    `<h5>Добро пожаловать</h5><div class="s">Войдите или создайте аккаунт</div>
     <div class="tabs"><div class="pillbg"></div><span class="tp">${PH}По телефону</span><span class="te">${ML}По email</span></div>
     <div class="fld"><label>Телефон</label><div class="in"><span class="ic" style="color:#8c96ad;display:flex">${PH}</span><span class="tx"></span><span class="caret"></span><span class="ph" style="color:#9aa3b5"></span></div></div>
     <div class="go">Получить код →</div>
     <div class="or">или продолжить через</div>
     <div class="soc"><span class="ob ya"><img src="img/icons/yandex-id.png" alt="">Яндекс ID<i class="hlr"></i></span><span class="ob ml"><img src="img/icons/mailru.png" alt="">Mail.ru<i class="hlr"></i></span><span class="ob mx"><img src="img/icons/max.png" alt="">MAX<i class="hlr"></i></span></div>`);
  const pill = au.querySelector('.pillbg'), tp = au.querySelector('.tp'), te = au.querySelector('.te');
  const fld = au.querySelector('.fld'), lab = fld.querySelector('label'), ic = fld.querySelector('.ic'), tx = fld.querySelector('.tx'), car = fld.querySelector('.caret'), ph = fld.querySelector('.ph');
  const go = au.querySelector('.go'), obs = [...au.querySelectorAll('.ob')], hls = [...au.querySelectorAll('.hlr')];
  const toast = el('div', 'toast', R, 'left:67cqw;top:50cqw', '<img src="img/icons/ok.png" alt="">Аккаунт создан');
  const mas = mascotEl(R, 'mascot-wink', 14); mas.style.zIndex = 12;
  const PHONE = '+7 900 000-00-00', MAIL = 'name@example.ru';
  const SWITCH = 13.5, PRESS = 15.8, DONE = 16.45;
  typeCue(12.0, PHONE, .06); typeCue(13.75, MAIL, .05);
  CUES.whoosh.push(10.85, 17.75); CUES.pops.push(DONE); CUES.clicks.push(SWITCH);
  let ya = [61, 41.3];
  s.meas.push(() => { const c = center(obs[0]); ya = [c[0] + .4, c[1] + .5]; });
  s.meas.push(() => {
    curPath(14.85, 16.9, [[14.85, 82, 54], [15.6, ya[0], ya[1], .7]], [PRESS]);
  });
  s.up = t => {
    const out = fout(t, 17.7, 'up');
    [...tw, ...tw2].forEach((e, i) => S(e, fin(t, 11.15 + i * .1, 'sw')));
    S(title, out);
    S(sub, M(fin(t, 11.7, 'fade'), out));
    // окно входа
    const p = sp(t, 10.8, 8, .82);
    S(au, M({ per: 2000, x: (1 - p) * 50 * U, ry: -(1 - p) * 30, op: clamp((t - 10.8) / .15), hb: Math.abs(1 - p) * 30 }, out));
    const k = pr(t, SWITCH, .3, E.io);
    pill.style.width = `calc(50% - .55cqw)`;
    pill.style.transform = `translateX(${(k * 100).toFixed(2)}%) translateX(${(k * .4).toFixed(3)}cqw)`;
    tp.style.color = k < .5 ? '#1450c8' : '#8c96ad'; te.style.color = k >= .5 ? '#1450c8' : '#8c96ad';
    const em = t >= SWITCH + .1;
    fld.style.opacity = (1 - bump(t, SWITCH, .22)).toFixed(3);
    lab.textContent = em ? 'Email' : 'Телефон';
    ic.innerHTML = em ? ML : PH;
    const str = em ? typed(MAIL, t, 13.75, .05) : typed(PHONE, t, 12.0, .06);
    tx.textContent = str;
    ph.textContent = str ? '' : (em ? 'name@example.ru' : '+7 (___) ___-__-__');
    car.style.opacity = (Math.floor(t * 2.4) % 2 === 0 || (t > 12 && t < 13.1) || (t > 13.75 && t < 14.6)) ? 1 : 0;
    go.textContent = em ? 'Войти →' : 'Получить код →';
    hls.forEach((h, i) => { h.style.opacity = (i === 1 ? .0 : 1) * pr(t, 14.5 + i * .12, .3) * (i === 0 ? 1 : 1 - pr(t, 15.3, .3)) + ''; });
    const pr0 = bump(t, PRESS - .02, .3);
    obs[0].style.transform = `scale(${(1 - .05 * pr0).toFixed(4)})`;
    obs[0].style.background = pr0 > .05 ? '#eef4ff' : '#fff';
    // всплывашка
    const pt = sp(t, DONE, 14, .6);
    S(toast, M({ s: .6 + .4 * pt, op: clamp((t - DONE) / .1), y: (1 - pt) * 2 * U }, out));
    // маскот
    const k1 = sp(t, 11.0, 7, .85), k2 = sp(t, 14.45, 8, .8);
    let cx = lerp(-12, 37, k1), cy = lerp(36, 30.9, k1) + Math.sin(t * 2.6) * .45, w = 14, r = lerp(-20, -6, k1);
    cx = lerp(cx, 48.5, k2); cy = lerp(cy, 35.6, k2); w = lerp(w, 13, k2); r = lerp(r, 4, k2);
    const jump = bump(t, DONE, .5);
    cy -= jump * 3.5;
    const sq = wobble(t, PRESS, .14, 24, 7) + wobble(t, DONE + .5, .12, 24, 7);
    mascotSet(mas, cx, cy, w, M({ r, hb: Math.abs(1 - k1) * 30 * (t > 11) }, fout(t, 17.75, 'up')), sq);
  };
})();

// =====================================================================
// 05. Адрес сайта и регион (17.9–24.0)
// =====================================================================
(() => {
  const s = scene(17.85, 24.1), R = s.r;
  const NW = 1120;
  const card = el('div', 'abs', R, `width:${NW}px;transform-origin:0 0;z-index:8`);
  const win = el('div', 'win', card, 'position:relative;left:0;top:0;width:100%;border-radius:24px', '<img src="img/add_card.jpg" alt="">');
  const menu = el('img', '', win, 'position:absolute;left:0;top:0;width:100%;'); menu.src = 'img/add_card_menu0.jpg';
  const blurTop = el('img', '', win, 'position:absolute;left:0;top:0;width:100%;filter:blur(9px);clip-path:inset(0 0 69% 0)'); blurTop.src = 'img/add_card.jpg';
  const cover = el('div', '', win, 'position:absolute;left:150px;top:472px;width:330px;height:62px;background:#fff');
  const typ = el('div', '', win, 'position:absolute;left:146px;top:503px;transform:translateY(-50%);font:420 29px/1 var(--sans);color:#0c1220;white-space:nowrap');
  const tTx = el('span', '', typ), tCar = el('span', '', typ, 'display:inline-block;width:2px;height:32px;background:#1A69F0;margin-left:2px;vertical-align:middle');
  const hov = el('div', '', win, 'position:absolute;left:90px;width:940px;height:68px;border-radius:12px;background:rgba(26,105,240,.10)');
  const btnDark = el('div', '', win, 'position:absolute;left:75px;top:834px;width:970px;height:107px;border-radius:22px;background:rgba(0,20,80,.25)');
  const ROWS = [860, 933, 1008, 1080, 1154];
  const CK = [[18.6, 31, 4, 38], [19.0, 31, 4, 38], [19.6, -14, -20, 128], [20.45, -14, -20, 128], [21.0, 15, -22, 70], [22.7, 15, -22, 70], [23.2, 20, -6, 60]];
  const cam = t => kf(t, CK);
  const pt = (c, x, y) => [c[0] + x * c[2] / NW, c[1] + y * c[2] / NW];
  const URL = 'https://example.ru', OPEN = 21.1, CLOSE = 22.65, BTN = 23.4;
  typeCue(19.65, URL, .045);
  CUES.whoosh.push(17.9, 19.05, 20.5, 22.75, 23.65);
  const c1 = cam(21.0), c2 = cam(23.2);
  const rx = 400;
  curPath(20.3, 23.7, [[20.3, 72, 50], [21.05, ...pt(c1, 560, 750), .6], [21.5, ...pt(c1, rx, ROWS[1]), .35], [21.8, ...pt(c1, rx, ROWS[2]), .28], [22.1, ...pt(c1, rx, ROWS[3]), .28],
    [22.5, ...pt(c1, rx, ROWS[0]), .38], [23.3, ...pt(c2, 560, 888), .55]], [21.05, 22.6, BTN]);
  s.up = t => {
    const c = cam(t), sc = c[2] * U / NW;
    const p = sp(t, 17.9, 9, .8);
    const out = pr(t, 23.65, .45, E.i2);
    S(card, M({ x: c[0] * U, y: (c[1] + (1 - p) * 40) * U, s: sc, op: clamp((t - 17.9) / .15) }, { y: -out * 10 * U, s: 1 - out * .2, op: 1 - out, bl: out * 14 }));
    const mo = t >= OPEN && t < CLOSE ? 1 : 0;
    menu.style.opacity = (pr(t, OPEN, .12) * (1 - pr(t, CLOSE, .12))).toFixed(3);
    win.style.height = lerp(1088, 1208, pr(t, OPEN, .18, E.o3) * (1 - pr(t, CLOSE, .18))) + 'px';
    const zoom = clamp((c[2] - 38) / 25);
    blurTop.style.opacity = zoom.toFixed(3);
    const str = typed(URL, t, 19.65, .045);
    tTx.textContent = str;
    tCar.style.opacity = t > 19.5 && t < 21.0 && (Math.floor(t * 2.4) % 2 === 0 || (t > 19.65 && t < 20.5)) ? 1 : 0;
    // подсветка строки под курсором
    if (mo) {
      const [, cyq] = curPos(t), yN = (cyq - c[1]) / (c[2] / NW);
      let best = 0; ROWS.forEach((r, i) => { if (Math.abs(r - yN) < Math.abs(ROWS[best] - yN)) best = i; });
      hov.style.top = (ROWS[best] - 34) + 'px'; hov.style.opacity = best === 0 ? 0 : (t > 21.35 ? 1 : 0);
    } else hov.style.opacity = 0;
    btnDark.style.opacity = bump(t, BTN - .03, .3).toFixed(3);
  };
})();

// =====================================================================
// 06. Анализ (23.7–PEAK)
// =====================================================================
const STEPS = ['Определяем тематику и нишу', 'Собираем семантическое ядро', 'Считаем объём спроса', 'Снимаем стартовые позиции', 'Находим конкурентов'];
(() => {
  const s = scene(23.7, PEAK + .05), R = s.r;
  const layer = el('div', 'abs', R, 'width:100%;height:100%;transform-origin:64cqw 12cqw');
  const title = el('div', 't', layer, 'left:6cqw;top:5cqw;font-size:3.6cqw;z-index:4');
  const tw = words(title, 'Jarvis собирает и готовит данные');
  const bar = el('div', '', layer, 'position:absolute;left:6cqw;top:11.4cqw;width:58cqw;height:1.1cqw;border-radius:1cqw;background:rgba(255,255,255,.12);overflow:hidden');
  const fill = el('div', '', bar, 'height:100%;border-radius:1cqw;background:#1A69F0;box-shadow:0 0 2cqw rgba(26,105,240,.8)');
  const pc = el('div', 'mono', layer, 'position:absolute;left:66cqw;top:10.4cqw;font-size:2.4cqw;font-weight:700;color:#fff');
  const A = [24.75, 26.35, 27.9, 29.25, 30.35], DONEALL = 31.3;
  const rows = STEPS.map((x, i) => {
    const r = el('div', '', layer, `position:absolute;left:6cqw;top:${17.5 + i * 5.2}cqw;display:flex;align-items:center;gap:1.4cqw;white-space:nowrap;font:700 2.3cqw/1.1 var(--sans);letter-spacing:-.025em;transform-origin:0 50%`);
    const ic = el('span', '', r, 'position:relative;flex:none;width:2.4cqw;height:2.4cqw');
    const circ = el('span', '', ic, 'position:absolute;inset:0;border-radius:50%;border:.2cqw solid rgba(255,255,255,.25)');
    const ok = el('img', '', ic, 'position:absolute;inset:0;width:100%;height:100%'); ok.src = 'img/icons/ok.png';
    const tx = el('span', '', r); tx.textContent = x;
    CUES.ticks.push(i < 4 ? A[i + 1] : DONEALL);
    return { r, circ, ok, done: i < 4 ? A[i + 1] : DONEALL, on: A[i] };
  });
  const mas = mascotEl(R, 'mascot-magnifier', 27); mas.style.zIndex = 5;
  CUES.whoosh.push(23.75, PEAK - .5);
  s.up = t => {
    tw.forEach((e, i) => S(e, fin(t, 23.95 + i * .09, 'sw')));
    S(bar, fin(t, 24.3, 'fade'));
    // проценты: по шагам, затем 100
    const keys = [[24.4, 0], [A[1], 20], [A[2], 41], [A[3], 63], [A[4], 82], [DONEALL, 100]];
    const v = kf(t, keys, E.io2)[0];
    fill.style.width = v.toFixed(2) + '%';
    pc.textContent = Math.round(v) + '%';
    S(pc, fin(t, 24.3, 'fade'));
    const flash = bump(t, 31.9, PEAK - 31.9 + .3);
    fill.style.boxShadow = `0 0 ${2 + 6 * flash}cqw rgba(26,105,240,${.8 + .2 * flash})`;
    rows.forEach((o, i) => {
      const on = pr(t, o.on, .3, E.io) * (1 - pr(t, o.done, .3, E.io));
      const done = t >= o.done;
      const col = done ? .78 : lerp(.3, 1, on);
      o.r.style.color = `rgba(255,255,255,${col.toFixed(3)})`;
      S(o.r, M(fin(t, 24.25 + i * .08, 'left'), { s: 1 + on * .3, x: on * .6 * U }));
      o.circ.style.borderColor = on > .3 ? '#1A69F0' : 'rgba(255,255,255,.25)';
      o.circ.style.boxShadow = on > .3 ? `0 0 ${1.6 * on}cqw #1A69F0` : 'none';
      o.circ.style.borderWidth = (on > .3 ? .3 : .2) + 'cqw';
      const pk = sp(t, o.done, 16, .5);
      S(o.ok, { s: clamp(pk, 0, 1.4), op: done ? 1 : 0 });
      S(o.circ, { op: done ? 0 : 1 });
    });
    // маскот с лупой: покачивается, кивает на галочках
    let nod = 0; rows.forEach(o => nod += bump(t, o.done, .35));
    const pm = sp(t, 24.2, 8, .8);
    const z = pr(t, 31.95, PEAK - 31.95, E.i3);
    mascotSet(mas, lerp(100, 77.5, pm) + z * 12, 30.3 + nod * .8 + Math.sin(t * 2.1) * .4, 27, { r: Math.sin(t * 1.7) * 4 + nod * 3, op: clamp((t - 24.2) / .2) * (1 - z), bl: z * 10 });
    // в конце — влёт в свечение шкалы
    S(layer, { s: 1 + z * 2.2, bl: z * 14, op: 1 - z * .6 });
  };
})();

// =====================================================================
// 07. Пик: «Поздравляем!» (PEAK–36.5)
// =====================================================================
(() => {
  const s = scene(PEAK - .05, 36.5), R = s.r;
  const NW = 888, W = 30, L = 35, T = 1.5, sc = W * U / NW;
  const wrap = el('div', 'abs', R, `width:${NW}px;height:1066px;transform-origin:444px 533px;z-index:8`);
  const win = el('div', 'win', wrap, 'left:0;top:0;width:100%;border-radius:36px', '<img src="img/congrats.jpg" alt="">');
  el('div', '', win, 'position:absolute;left:301px;top:62px;width:287px;height:287px;border-radius:50%;background:#dbe9fb');
  const m = el('img', '', wrap, 'position:absolute;left:260px;top:0;width:369px'); m.src = 'img/mascot-wink.png';
  CUES.pops.push(PEAK + .55);
  s.up = t => {
    const p = sp(t, PEAK, 11, .5);
    const out = pr(t, 35.9, .45, E.i2);
    S(wrap, M({ x: L * U - (NW - NW * sc) / 2 * 0 + (444 * sc - 444), y: T * U + (533 * sc - 533), s: sc * (.55 + .45 * p), op: clamp((t - PEAK) / .08), bl: (1 - clamp((t - PEAK) / .25)) * 12 },
      { s: 1 - out * .25, op: 1 - out, bl: out * 10, y: -out * 4 * U }));
    // маскот запрыгивает в круг
    const j = clamp((t - (PEAK + .2)) / .35);
    const y = j < 1 ? -650 * (1 - E.i2(j)) : 0;
    const sq = wobble(t, PEAK + .55, .18, 24, 6);
    m.style.transform = `translateY(${(y + sq * 180).toFixed(1)}px) scale(${(1 + sq).toFixed(3)},${(1 - sq).toFixed(3)})`;
    m.style.transformOrigin = '50% 100%';
    m.style.opacity = t > PEAK + .2 && t < 36.0 ? 1 : 0;
    const fl = clamp(1 - (t - PEAK) / .5);
    S($('#flash'), { op: t >= PEAK - .05 ? fl * .95 : 0, s: 1 + (1 - fl) * .3 });
  };
})();

// =====================================================================
// 08–18. Меню-барабан и 10 модулей (35.9–116.4)
// =====================================================================
const MODS = [
  { t: 'Удобный дашборд',
    els: [{ img: 'dash_full', l: 14, t: 8.5, w: 72, at: .75, shade: 6.05 },
      { ring: [64.2, 30.6, 8.4, 2], at: 5.35, out: 6.05 },
      { img: 'act/dash_modal', l: 39, t: 6, w: 22, at: 6.05, in: 'big' }],
    cam: [[1.4, 1, 50, 28], [4.7, 1.15, 30, 25], [5.2, 1, 50, 28]],
    cur: [[5.15, 82, 52], [5.8, 70.5, 31.6]], clicks: [5.9, 6.65], cur2: [[6.55, 54, 26.6, .5]] },
  { t: 'Позиции и динамика роста сайта',
    els: [{ img: 'core', l: 20, t: 7.5, w: 60, at: .75, in: 'down', out: 6.05 },
      { img: 'keys', l: 27, t: 20.5, w: 46, at: .95, in: 'up', z: 6, out: 6.05, band: [2.4, 1.2, 245, 805] },
      { toast: '+4 позиции', icon: 'up', l: 74.5, t: 31, at: 2.2, out: 6.0 },
      { ring: [46, 22, 15, 2.2], at: 5.35, out: 6.05 },
      { img: 'act/pos_reco', l: 14, t: 7, w: 72, at: 6.05, z: 8 },
      { toast: 'Показаны запросы с растущим трендом', l: 56, t: 47, at: 6.3 }],
    cur: [[5.15, 72, 46], [5.8, 56.5, 23.2]], clicks: [5.9] },
  { t: 'Конкурентная разведка',
    els: [{ img: 'share', l: 40, t: 9, w: 52, at: .75, in: 'tilt', tilt: 1, out: 5.25, wipe: [1.0, .9], hl: [[10, 495, 1260, 86, 2.2]] },
      { html: '<div style="font-size:1.3cqw;color:#8c96ad">Окон в топ-5</div><div class="cnt" style="font:800 4.4cqw/1.1 var(--sans);color:#0c1220">0</div><div style="font-size:1.2cqw;color:#8c96ad;white-space:normal">самые ценные — сюда переходов больше всего</div>',
        l: 6, t: 20, w: 28, h: 13, at: 1.2, in: 'left', out: 5.25, cnt: [0, 6, 1.6, 1.0] },
      { img: 'act/comp_view', l: 12, t: 6, w: 76, at: 5.25 },
      { ring: [13, 18.9, 74, 2.7], at: 5.65 },
      { toast: 'Открываем данные конкурента: leader-site.ru', l: 50, t: 48, at: 6.15 }],
    cur: [[5.3, 60, 46], [5.85, 80.5, 20.4]], clicks: [5.95] },
  { t: 'Аудит на 182 пункта с рекомендациями',
    els: [{ img: 'audit_head', l: 8, t: 9, w: 62, at: .75, in: 'left', out: 5.25 },
      { img: 'audit_todo', l: 36, t: 23, w: 56, at: .95, in: 'up', z: 5, out: 5.25, hl: [[10, 86, 1380, 58, 3.0]] },
      { html: '<span class="cnt" style="font:800 2.6cqw/1 var(--sans);color:#1A69F0">0</span><span style="font:600 1.3cqw/1.2 var(--sans);color:#0c1220;margin-left:.8cqw">пунктов<br>проверено</span>',
        l: 72.5, t: 9.6, w: 17.5, h: 6.5, at: 1.5, in: 'right', out: 5.25, cnt: [0, 182, 1.7, 1.4], flex: 1 },
      { img: 'act/audit_todo2', l: 10, t: 16, w: 80, at: 5.25 },
      { ring: [10.6, 22.2, 78.8, 3], at: 5.85, lift: 1 }],
    cur: [[5.3, 45, 46], [5.85, 30.5, 23.8]], clicks: [] },
  { t: 'Автоматическая закупка внешних ссылок',
    els: [{ img: 'links_full', l: 14, t: 8.5, w: 72, at: .75, out: 5.25 },
      { img: 'act/links_off', l: 8, t: 20, w: 84, at: 5.25, swap: ['act/links_on', 6.0] },
      { toast: 'Закупка включена', l: 66, t: 38, at: 6.25 }],
    cam: [[1.5, 1, 50, 28], [4.6, 1.3, 76, 40], [5.1, 1, 50, 28]],
    cur: [[5.3, 60, 46], [5.8, 90.1, 22.0]], clicks: [5.9] },
  { t: 'Продвижение в 11 нейросетях',
    els: [{ img: 'geo_head', l: 12, t: 7.5, w: 76, at: .75, in: 'flipY', out: 5.25 },
      { img: 'geo_cite', l: 31, t: 21, w: 38, at: 1.25, in: 'flipX', z: 5, wipe: [1.6, .9], mv: [5.3, 4, 7.5, 50], shade: 5.95 },
      { img: 'act/geo_panel', l: 62, t: 4, w: 28, at: 5.95, in: 'right', z: 8 }],
    cur: [[5.3, 50, 50], [5.8, 30, 14]], clicks: [5.85] },
  { t: 'Продвижение Яндекс.Карт',
    els: [{ html: '<div style="display:flex;align-items:center;justify-content:space-between;height:100%;padding:0 2.4cqw;font:800 2.6cqw/1 var(--sans);letter-spacing:-.02em;color:#0c1220">Яндекс.Карты<img src="img/yamaps_btn.jpg" alt="" style="width:24cqw;display:block"></div>',
        l: 18, t: 20, w: 64, h: 10.2, at: .75, out: 2.25 },
      { img: 'yamaps_new', l: 20, t: 4.5, w: 60, at: 2.2, in: 'up', out: 4.35, swap: ['yamaps_new_filled', 3.05] },
      { img: 'yamaps', l: 30, t: 8.5, w: 40, at: 4.3, in: 'big', hl: [[45, 258, 302, 56, 5.0], [358, 258, 335, 56, 5.25], [45, 326, 318, 56, 5.5]] },
      { toast: 'На тесте', l: 63, t: 6, at: 5.95 }],
    cur: [[1.0, 62, 46], [1.65, 71.8, 25.9]], clicks: [1.75, 4.0], cur2: [[3.85, 74.8, 45.3, .7]] },
  { t: 'Партнёрские бонусы',
    els: [{ img: 'bonus_full', l: 14, t: 8.5, w: 72, at: .75, out: 5.25 },
      { img: 'act/bonus_banner', l: 10, t: 18, w: 80, at: 5.25 },
      { toast: 'Открываем партнёра «Bitrix24»', l: 56, t: 36, at: 6.15 }],
    cam: [[1.5, 1, 50, 28], [4.6, 1.4, 55, 21], [5.1, 1, 50, 28]],
    cur: [[5.3, 45, 46], [5.8, 17.5, 30]], clicks: [5.9] },
  { t: 'Обучающие видео',
    els: [{ img: 'learn_video', l: 14, t: 9, w: 72, at: .75, shade: 5.9, pulse: [50, 21, 1.6, 4.6] },
      { img: 'act/learn_modal', l: 27, t: 7, w: 46, at: 5.9, in: 'big' }],
    cam: [[1.5, 1, 50, 28], [4.6, 1.12, 50, 22], [5.1, 1, 50, 28]],
    cur: [[5.0, 70, 46], [5.65, 50.4, 21.6]], clicks: [5.75, 6.5], cur2: [[6.4, 50.3, 20.8, .45]] },
  { t: 'Анализ спроса и потенциала заявок',
    els: [{ img: 'demand', l: 5, t: 9, w: 46, at: .75, in: 'left', out: 5.25, wipe: [1.1, 1.2] },
      { img: 'potential', l: 38, t: 24, w: 56, at: 1.0, in: 'up', z: 5, out: 5.25, wipe: [1.6, 1.2], hl: [[1010, 180, 370, 122, 3.2]] },
      { img: 'act/demand0', l: 20, t: 12, w: 60, at: 5.25, swap: ['act/demand_hover', 5.95] }],
    cur: [[5.3, 50, 46], [5.85, 75.5, 14.2]], clicks: [] },
];
(() => {
  const s = scene(35.9, WALL + .5), R = s.r;
  const MAS0 = [50, 6.75, 12.47], MASD = [21, 23.1, 24];
  const drumL = el('div', 'abs', R, 'width:100%;height:100%;z-index:5;transform-origin:50cqw 28cqw');
  const mas = mascotEl(R, 'mascot-wink', 24); mas.style.zIndex = 6;
  const items = MODS.map((m, i) => {
    const d = el('div', 'drum', drumL);
    const n = el('span', 'num', d); el('em', '', n).textContent = String(i + 1).padStart(2, '0');
    const ok = el('img', 'ok', n); ok.src = 'img/icons/ok.png';
    el('span', 'lab', d).textContent = m.t;
    const gl = el('i', 'gl', d);
    const fn = el('span', 'flynum', R, 'z-index:7'); fn.textContent = String(i + 1).padStart(2, '0');
    return { d, ok, gl, fn, w: 0, h: 0 };
  });
  const T0 = (i) => TOUR0 + i * MOD;
  const idx = new Track(3).to(38.6, 0, 5.5, .9);
  for (let i = 1; i < 10; i++) idx.to(T0(i) - .45, i, 9, .82);
  const DONE = i => T0(i) + 7.2;
  const INTRO = 36.75;
  CUES.whoosh.push(36.0, 38.65);
  for (let i = 0; i < 10; i++) { CUES.ticks.push(INTRO + i * .09 + .35); CUES.pops.push(DONE(i)); }
  // общий заголовок модуля и точки прогресса
  const mh = el('div', 'mhead', R, 'z-index:40'); const mhE = el('em', '', mh); const mhB = el('b', '', mh);
  const dots = el('div', 'dots', R); const dI = MODS.map(() => el('i', '', dots));
  const morph = el('div', 'morph', R, 'z-index:20');
  // модули
  const mods = MODS.map((m, i) => {
    const a = T0(i);
    const C = el('div', 'abs', R, 'width:100%;height:100%;z-index:22');
    const cam = el('div', 'abs', C, 'width:100%;height:100%');
    const parts = m.els.map(spec => buildEl(cam, spec));
    // габариты: в начале (первые окна) и в конце (последний кадр действия)
    const rectOf = (at) => {
      let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
      m.els.forEach(e => {
        if (!e.img && !e.html) return;
        const out = e.out ?? 99; if (!(e.at <= at && at < out)) return;
        let l = e.l, t = e.t, w = e.w;
        if (e.mv && at >= e.mv[0]) [, l, t, w] = e.mv;
        const h = e.h ?? (e.img ? w * ar(e.img) : 10);
        x0 = Math.min(x0, l); y0 = Math.min(y0, t); x1 = Math.max(x1, l + w); y1 = Math.max(y1, t + h);
      });
      return [x0, y0, x1 - x0, y1 - y0];
    };
    const r0 = rectOf(Math.max(...m.els.map(e => e.at ?? 0).filter(v => v < 1.3))), r1 = rectOf(6.8);
    // курсор
    const kps = [...m.cur, ...(m.cur2 || [])].map(k => [a + k[0], k[1], k[2], k[3]]);
    curPath(a + .1, a + .62, [[a + .1, 52, 46], [a + .5, 47.5, 27.3, .4]], [a + .55]);
    if (m.cur.length) curPath(a + m.cur[0][0], a + 6.9, kps, (m.clicks || []).map(c => a + c));
    CUES.whoosh.push(a + .6, a + 6.85);
    m.els.forEach(e => { if (e.toast) CUES.pops.push(a + e.at); if (e.cnt) for (let k = 0; k < 8; k++) CUES.ticks.push(a + e.cnt[2] + e.cnt[3] * k / 8); });
    return { C, cam, parts, a, r0, r1, m };
  });
  s.meas.push(() => items.forEach(o => { o.w = o.d.offsetWidth / U; o.h = o.d.offsetHeight / U; }));
  const plaque = (o) => [46, 26.5 - o.h / 2, o.w, o.h];
  const ky = k => 26.5 + k * 6.6 - Math.sign(k) * k * k * .35;
  const cur = t => clamp(Math.floor((t - TOUR0) / MOD), 0, 9);
  s.up = t => {
    const iv = idx.at(t);
    const mi = cur(t), A = T0(mi), l = t - A;
    const open = t < TOUR0 ? 0 : pr(t, A + .6, .45, E.io) * (1 - pr(t, A + 6.85, .4, E.io));
    const end = pr(t, WALL - .15, .45, E.i2);
    // барабан
    S(drumL, { op: (1 - open) * (1 - end), bl: open * 10 + end * 10, s: 1 - open * .06 + end * .1 });
    items.forEach((o, i) => {
      const k = i - iv, ak = Math.abs(k);
      const t0 = INTRO + i * .09, p = sp(t, t0, 9, .85), land = clamp((t - t0 - .3) / .35);
      const op = (ak < 1 ? lerp(1, .58, ak) : Math.max(0, .75 - ak * .17)) * (ak > 4.6 ? 0 : 1);
      const hideMorph = (t > A + .6 && t < A + 7.25 && i === mi && t >= TOUR0) ? 0 : 1;
      S(o.d, { per: 1152, y: (ky(k) - o.h / 2) * U, rx: -k * 17, s: 1 - ak * .08, op: op * clamp(land * 3) * hideMorph, bl: ak * .06 * U });
      o.d.style.clipPath = land < 1 ? `inset(0 calc(${((1 - E.o3(land)) * 100).toFixed(2)}% - ${((1 - E.o3(land)) * 4.4).toFixed(2)}cqw) 0 0 round 999px)` : 'none';
      o.gl.style.opacity = (clamp(1 - ak * 2) * (t > 39.6 ? 1 : 0) * (t < DONE(i) ? 1 : 0)).toFixed(3);
      const dk = sp(t, DONE(i), 16, .5);
      S(o.ok, { s: clamp(dk, 0, 1.3), op: t > DONE(i) ? 1 : 0 });
      // номер вылетает из маскота
      const mx = MASD[0] + 3, my = MASD[1] - 2;
      const tx = 46 + 1.1, ty = ky(k) - 1.15;
      S(o.fn, { x: lerp(mx, tx, p) * U, y: (lerp(my, ty, p) - Math.sin(Math.PI * clamp(p)) * 5) * U, s: .4 + .6 * clamp(p), op: clamp((t - t0) / .1) * (1 - clamp(land * 3)) * op, hb: (1 - clamp(p)) * 20 * (t > t0) });
    });
    // маскот
    const pm = sp(t, 36.0, 7, .82);
    let cx = lerp(MAS0[0], MASD[0], pm), cy = lerp(MAS0[1], MASD[1], pm), w = lerp(MAS0[2], MASD[2], pm);
    cy += Math.sin(t * 2.2) * .4 * clamp(t - 36.8);
    let r = 6 * pm + Math.sin(t * 1.7) * 2 + (t >= TOUR0 ? 8 * bump(t, A + .1, .7) : 0);
    const sq = t >= TOUR0 ? wobble(t, A + .55, .07, 22, 8) + wobble(t, DONE(mi), .08, 22, 7) : wobble(t, INTRO, .1, 22, 6);
    mascotSet(mas, cx, cy, w, { r, op: (t < 36.0 ? 0 : 1) * (1 - open) * (1 - end), bl: open * 8 + end * 10, x: -end * 10 * U }, sq);
    // модули
    mods.forEach((o, i) => {
      const on = t >= o.a + .5 && t < o.a + 7.4;
      o.C.style.display = on ? 'block' : 'none';
      if (!on) return;
      const lt = t - o.a;
      o.parts.forEach(p => p(lt));
      if (o.m.cam) { const [s0, cx0, cy0] = kf(lt, o.m.cam); o.cam.style.transformOrigin = `${cx0}cqw ${cy0}cqw`; o.cam.style.transform = `scale(${s0.toFixed(4)})`; }
      const pl = plaque(items[i]);
      const c = pr(t, o.a + 6.85, .3, E.i2);
      const pc = [pl[0] + pl[2] / 2, pl[1] + pl[3] / 2], rc = [o.r1[0] + o.r1[2] / 2, o.r1[1] + o.r1[3] / 2];
      S(o.C, { op: (1 - c) * clamp((lt - .68) / .2), s: 1 - c * .5, x: (pc[0] - rc[0]) * c * .6 * U, y: (pc[1] - rc[1]) * c * .6 * U, bl: c * 8 });
    });
    // переход «плашка ↔ окно»
    if (t >= TOUR0 - .1) {
      const o = mods[mi], pl = plaque(items[mi]);
      let rr = null, op = 0, rad = 0;
      if (l >= .55 && l < 1.25) {
        const k = sp(l, .58, 11, .9);
        rr = pl.map((v, j) => lerp(v, o.r0[j], clamp(k))); op = 1 - clamp((l - .78) / .22); rad = lerp(pl[3] / 2, 1.1, clamp(k * 1.5));
      } else if (l >= 6.85 && l < 7.3) {
        const k = E.io(clamp((l - 6.85) / .4));
        rr = o.r1.map((v, j) => lerp(v, pl[j], k)); op = clamp((l - 6.85) / .12) * (1 - clamp((l - 7.18) / .1)); rad = lerp(1.1, pl[3] / 2, k);
      }
      if (rr) {
        morph.style.left = rr[0] + 'cqw'; morph.style.top = rr[1] + 'cqw'; morph.style.width = rr[2] + 'cqw'; morph.style.height = rr[3] + 'cqw';
        morph.style.borderRadius = rad + 'cqw'; S(morph, { op });
      } else S(morph, { op: 0 });
    } else S(morph, { op: 0 });
    // шапка модуля
    if (t >= TOUR0) {
      mhE.textContent = String(mi + 1).padStart(2, '0'); mhB.textContent = MODS[mi].t;
      const q = pr(t, A + .9, .5, E.o3);
      mhB.style.clipPath = `inset(0 ${((1 - q) * 100).toFixed(2)}% 0 0)`;
      S(mhB, { x: -(1 - q) * 3 * U, hb: (1 - q) * 14 });
      S(mh, { op: open, s: .9 + .1 * open });
      dI.forEach((d, j) => d.className = j < mi || (j === mi && t > DONE(j)) ? 'done' : j === mi ? 'on' : '');
      S(dots, { op: open });
    } else { S(mh, { op: 0 }); S(dots, { op: 0 }); }
  };
})();

// элемент модуля: окно-картинка, всплывашка, рамка, HTML-карточка
function buildEl(parent, e) {
  if (e.img) {
    const w = el('div', 'win', parent, `left:${e.l}cqw;top:${e.t}cqw;width:${e.w}cqw;z-index:${e.z || 3}`);
    const im = el('img', '', w); im.src = `img/${e.img}.jpg`;
    const [nw, nh] = NAT[e.img];
    let im2 = null;
    if (e.swap) { im2 = el('img', '', w, 'position:absolute;left:0;top:0;width:100%'); im2.src = `img/${e.swap[0]}.jpg`; }
    const hls = (e.hl || []).map(h => el('div', 'ring', w, `left:${h[0] / nw * 100}%;top:${h[1] / nh * 100}%;width:${h[2] / nw * 100}%;height:${h[3] / nh * 100}%;border-radius:.5cqw`));
    const band = e.band ? el('div', '', w, `position:absolute;left:0;right:0;height:${70 / nh * 100}%;background:linear-gradient(180deg,transparent,rgba(26,105,240,.18),transparent)`) : null;
    const pulse = e.pulse ? el('div', '', parent, `position:absolute;left:${e.pulse[0] - 4}cqw;top:${e.pulse[1] - 4}cqw;width:8cqw;height:8cqw;border-radius:50%;border:.3cqw solid rgba(255,255,255,.9);z-index:${(e.z || 3) + 1}`) : null;
    const sh = el('div', 'sh', w);
    if (e.tilt || e.in === 'flipY') w.style.transformOrigin = e.in === 'flipY' ? '0 50%' : '50% 50%';
    if (e.in === 'flipX') w.style.transformOrigin = '50% 100%';
    return lt => {
      let o = M(fin(lt, e.at, e.in === 'tilt' || e.in === 'flipY' || e.in === 'flipX' ? 'fade' : (e.in || 'pop')), fout(lt, e.out));
      if (e.tilt) { const p = sp(lt, e.at, 8, .8); o = M(o, { per: 2112, ry: -20 - 50 * (1 - p), rx: 7, x: (1 - p) * 30 * U }); }
      if (e.in === 'flipY') { const p = sp(lt, e.at, 8, .85); o = M(o, { per: 1728, ry: -42 * (1 - p), rx: 16 * (1 - p) }); }
      if (e.in === 'flipX') { const p = sp(lt, e.at, 8, .85); o = M(o, { per: 1728, rx: 70 * (1 - p), y: (1 - p) * 6 * U }); }
      if (e.mv) {
        const k = sp(lt, e.mv[0], 9, .85);
        w.style.left = lerp(e.l, e.mv[1], k) + 'cqw'; w.style.top = lerp(e.t, e.mv[2], k) + 'cqw'; w.style.width = lerp(e.w, e.mv[3], k) + 'cqw';
      }
      S(w, o);
      if (im2) im2.style.opacity = pr(lt, e.swap[1], .15).toFixed(3);
      sh.style.opacity = e.shade != null ? (.6 * pr(lt, e.shade, .25)).toFixed(3) : 0;
      if (e.wipe) { const k = pr(lt, e.wipe[0], e.wipe[1], E.io2); w.style.clipPath = k < 1 ? `inset(-5% ${((1 - k) * 100).toFixed(2)}% -5% -5%)` : 'none'; }
      hls.forEach((h, j) => { const t0 = e.hl[j][4]; h.style.opacity = (pr(lt, t0, .2) * (.75 + .25 * Math.cos((lt - t0) * 6))).toFixed(3); });
      if (band) { const k = pr(lt, e.band[0], e.band[1], E.io2); band.style.top = (lerp(e.band[2], e.band[3], k) / nh * 100) + '%'; band.style.opacity = bump(lt, e.band[0], e.band[1]).toFixed(3); }
      if (pulse) { const ph = ((lt - e.pulse[2]) % 1.1) / 1.1; S(pulse, { s: .5 + ph * .9, op: lt > e.pulse[2] && lt < e.pulse[3] ? (1 - ph) * .9 : 0 }); }
    };
  }
  if (e.toast) {
    const ic = e.icon === 'up' ? '<span style="display:grid;place-items:center;width:2.4cqw;height:2.4cqw;border-radius:50%;background:#1A69F0;color:#fff;font-size:1.4cqw">↑</span>' : '<img src="img/icons/ok.png" alt="">';
    const d = el('div', 'toast', parent, `left:${e.l}cqw;top:${e.t}cqw;font-size:1.4cqw`, ic + e.toast);
    return lt => { const p = sp(lt, e.at, 14, .6); S(d, M({ s: .6 + .4 * p, op: clamp((lt - e.at) / .1), y: (1 - p) * 1.5 * U }, fout(lt, e.out, 'fast'))); };
  }
  if (e.ring) {
    const d = el('div', 'ring', parent, `left:${e.ring[0]}cqw;top:${e.ring[1]}cqw;width:${e.ring[2]}cqw;height:${e.ring[3]}cqw;z-index:25`);
    return lt => { const p = sp(lt, e.at, 14, .6); S(d, M({ op: clamp((lt - e.at) / .12), s: e.lift ? 1 + .012 * clamp(p) : 1.04 - .04 * p }, fout(lt, e.out, 'fast'))); };
  }
  if (e.html) {
    const d = el('div', 'win card6', parent, `left:${e.l}cqw;top:${e.t}cqw;width:${e.w}cqw;height:${e.h}cqw;${e.flex ? 'display:flex;align-items:center;' : ''}${e.html.startsWith('<div style="display:flex') ? 'padding:0' : ''}`, e.html);
    const cnt = d.querySelector('.cnt');
    return lt => {
      S(d, M(fin(lt, e.at, e.in || 'pop'), fout(lt, e.out)));
      if (cnt && e.cnt) cnt.textContent = Math.round(lerp(e.cnt[0], e.cnt[1], pr(lt, e.cnt[2], e.cnt[3], E.o3)));
    };
  }
}

// =====================================================================
// 19. Стена экранов → стопка (115.8–120.4)
// =====================================================================
(() => {
  const s = scene(WALL - .2, FIN + .45), R = s.r;
  const C = el('div', 'abs', R, 'width:100%;height:100%;perspective:1920px;z-index:5');
  const P = el('div', 'abs', C, 'width:100%;height:100%;transform-style:preserve-3d;transform-origin:50cqw 28.125cqw');
  const SH = [['dash_full', 'fill'], ['positions_full', 'fill'], ['share', 'contain'], ['act/audit_todo2', 'contain'], ['links_full', 'fill'],
    ['geo_cite', 'contain'], ['yamaps', 'contain'], ['bonus_full', 'fill'], ['learn_video', 'fill'], ['demand', 'contain']];
  const BACK = { 0: 0, 4: 1, 8: 2 };
  const SW = 40, SHh = 25, gw = 22.72, gh = 14.2, gap = 1.6;
  const tiles = SH.map(([k, f], i) => {
    const w = el('div', 'win ' + f, P, `left:0;top:0;width:${SW}cqw;height:${SHh}cqw;transform-origin:50% 50%`, `<img src="img/${k}.jpg" alt=""><div class="sh"></div>`);
    const ok = el('img', '', w, 'position:absolute;right:1.2cqw;top:1.2cqw;width:4cqw;height:4cqw'); ok.src = 'img/icons/ok.png';
    const c = i % 5, r = Math.floor(i / 5);
    const g = [-10 + c * (gw + gap) + gw / 2, 13.125 + r * (gh + gap) + gh / 2];
    const b = BACK[i] ?? 2;
    const st = [30 + b * 3.2 + SW / 2, 10 - b * 3.2 + SHh / 2];
    const order = ((c + r) % 2) * .22 + c * .06;
    const z = BACK[i] != null ? 10 - b : 1;
    w.style.zIndex = z;
    return { w, ok, sh: w.querySelector('.sh'), g, st, order, b, inStack: BACK[i] != null, i };
  });
  const mk = makeMark(R, 12, 'position:absolute;left:44cqw;top:16.5cqw;z-index:20');
  markSet(mk, [1, 1, 1, 1], 1);
  const tx = el('div', 't', R, 'left:0;right:0;top:44cqw;text-align:center;font-size:4cqw;z-index:20');
  const tw = words(tx, 'Всё это —');
  el('span', 'wd', tx).textContent = ' ';
  const tb = [el('span', 'wd fillw', tx), el('span', 'wd fillw', tx), el('span', 'wd fillw', tx)];
  ['в ', 'одном ', 'кабинете'].forEach((x, i) => tb[i].textContent = x);
  CUES.whoosh.push(WALL, 117.5, 118.9); CUES.impacts.push(118.95); CUES.pops.push(119.05);
  for (let i = 0; i < 10; i++) CUES.ticks.push(WALL + .25 + tiles[i].order);
  let geo = null;
  s.meas.push(() => { geo = tb.map(center); });
  s.up = t => {
    const flat = pr(t, 117.3, .9, E.io);
    const ax = lerp(28, 0, flat) + Math.sin((t - WALL) * .8) * 1.5 * (1 - flat), az = lerp(-14, 0, flat);
    P.style.transform = `rotateX(${ax.toFixed(3)}deg) rotateZ(${az.toFixed(3)}deg)`;
    tiles.forEach(o => {
      const t0 = WALL + o.order, p = sp(t, t0, 8, .85);
      const m0 = 117.55 + (o.inStack ? (2 - o.b) * .35 + .25 : o.order * .5);
      const k = sp(t, m0, 9, .8);
      const sc = lerp(gw / SW, 1, clamp(k, 0, 1.1));
      const x = lerp(o.g[0], o.st[0], k) - SW / 2, y = lerp(o.g[1], o.st[1], k) - SHh / 2;
      const fade = o.inStack ? 1 : 1 - pr(t, m0 + .15, .3);
      const out = pr(t, FIN - .1, .4, E.i2);
      o.w.style.transform = `translate3d(${(x * U).toFixed(2)}px,${(y * U).toFixed(2)}px,${(-(1 - p) * 2600).toFixed(1)}px) scale(${(sc * (1 - out * .3)).toFixed(4)})`;
      o.w.style.opacity = (clamp((t - t0) / .15) * fade * (1 - out)).toFixed(3);
      o.w.style.visibility = o.w.style.opacity < .003 ? 'hidden' : 'visible';
      o.ok.style.opacity = (1 - clamp(k)).toFixed(3);
      o.sh.style.opacity = o.inStack ? ([0, .55, .72][o.b] * clamp(k)).toFixed(3) : 0;
    });
    const mp = sp(t, 118.95, 13, .5);
    const out = pr(t, FIN - .15, .35, E.i2);
    S(mk.box, { s: clamp(mp, 0, 1.3) * (1 + out * .3), op: (t > 118.95 ? 1 : 0) * (1 - pr(t, FIN + .15, .15)) });
    mk.svg.style.filter = `drop-shadow(0 0 ${3 + 4 * out}cqw rgba(26,105,240,${.7 + .3 * out}))`;
    tw.forEach((e, i) => S(e, M(fin(t, 118.75 + i * .1, 'sw'), fout(t, FIN - .2))));
    tb.forEach((e, i) => S(e, M(fin(t, 118.95 + i * .1, 'sw'), fout(t, FIN - .2))));
    if (geo) {
      const x0 = geo[0][0] - geo[0][2] / 2, x1 = geo[2][0] + geo[2][2] / 2, f = lerp(x0, x1, pr(t, 119.3, .55, E.io2));
      tb.forEach((e, i) => { const a = geo[i][0] - geo[i][2] / 2, q = clamp((f - a) / geo[i][2]); e.style.backgroundPosition = `${((1 - q) * 100).toFixed(2)}% 0`; });
    }
  };
})();

// =====================================================================
// 20. Финал (119.9–127)
// =====================================================================
(() => {
  const s = scene(FIN - .1, DUR + .1), R = s.r;
  const glow = el('div', 'glow', R, 'left:38cqw;top:-6cqw;width:24cqw;height:24cqw');
  const mas = mascotEl(R, 'mascot-wink', 15); mas.style.zIndex = 10;
  const tx = el('div', 't', R, 'left:0;right:0;top:24cqw;text-align:center;font-size:5.6cqw;z-index:10');
  const tw = words(tx, 'SEO на');
  el('span', 'wd', tx).textContent = ' ';
  const tb = el('span', 'wd fillw', tx); tb.textContent = 'автопилоте';
  const row = el('div', '', R, 'position:absolute;left:0;right:0;top:34cqw;display:flex;justify-content:center;align-items:center;gap:2cqw;z-index:10');
  const b1 = el('span', 'btnp', row, '', '5 дней бесплатно'); const sheen = el('i', 'sheen', b1);
  const b2 = el('span', 'btng', row, '', 'seojarvis.ru');
  const nc = el('div', '', R, 'position:absolute;left:0;right:0;top:41.5cqw;text-align:center;font:500 1.5cqw/1.3 var(--sans);color:rgba(255,255,255,.6);z-index:10', 'без карты');
  const MC = [50, 3.5 + 15 * MAS_AR / 2];
  CUES.pops.push(FIN + .35, 121.05); CUES.whoosh.push(FIN + .5, 121.0);
  let geo = null;
  s.meas.push(() => { geo = [...tw, tb].map(center); });
  s.up = t => {
    // маскот выпрыгивает из знака
    const j = clamp((t - (FIN + .15)) / .45);
    const cx = 50, cy = lerp(22.5, MC[1], E.o3(j)) - Math.sin(Math.PI * j) * 3;
    const w = lerp(4, 15, E.o3(j));
    const sq = wobble(t, FIN + .62, .16, 22, 6) + wobble(t, 123.5, .05, 18, 5);
    mascotSet(mas, cx, cy + Math.sin((t - 121) * 1.9) * .35 * clamp(t - 121), w, { op: clamp((t - FIN - .15) / .1), r: Math.sin((t - 121) * 1.4) * 2 * clamp(t - 121) }, sq);
    S(glow, { op: pr(t, FIN + .3, .6) * .8 });
    // слова вылетают из маскота
    [...tw, tb].forEach((e, i) => {
      if (!geo) return;
      const g = geo[i], t0 = FIN + .55 + i * .14, p = sp(t, t0, 11, .86);
      S(e, { x: (50 - g[0]) * (1 - p) * U, y: (MC[1] - g[1]) * (1 - p) * U, s: .2 + .8 * clamp(p, 0, 1.2), op: clamp((t - t0) / .12), hb: (1 - clamp(p)) * 26 * (t > t0) });
    });
    tb.style.backgroundPosition = `${((1 - pr(t, 121.15, .5, E.io2)) * 100).toFixed(2)}% 0`;
    S(b1, fin(t, 121.0, 'up')); S(b2, fin(t, 121.12, 'up')); S(nc, fin(t, 121.45, 'fade'));
    const sh = (t - 121.75) % 2.6;
    sheen.style.left = (t > 121.75 ? lerp(-40, 140, clamp(sh / .7)) : -40) + '%';
    S($('#fade'), { op: pr(t, 126.35, .65, E.io2) });
  };
})();

// ---------- фон ----------
function bgUpdate(t) {
  const pk = Math.exp(-Math.max(0, t - PEAK) * 2.2) * (t >= PEAK ? 1 : 0);
  $('#bgPulse').style.opacity = (pk * .9 + .12 * Math.sin(t * .6) ** 2).toFixed(3);
}

// ---------- seek ----------
function seek(t) {
  for (const s of SC) {
    const on = t >= s.a && t < s.b;
    s.r.style.display = on ? 'block' : 'none';
    if (on) s.up(t);
  }
  if (!(t >= PEAK - .05 && t < 36.5)) S($('#flash'), { op: 0 });
  if (t < FIN) S($('#fade'), { op: 0 });
  bgUpdate(t);
  curUpdate(t);
}
window.seek = seek;
window.CUES = CUES;

// ---------- старт: шрифты, картинки, замеры ----------
(async () => {
  await document.fonts.ready;
  await Promise.all([...document.images].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; })));
  for (const s of SC) { s.r.style.display = 'block'; for (const f of s.meas) f(); s.r.style.display = 'none'; }
  CUR.kp.sort((a, b) => a[0] - b[0]);
  for (const k in CUES) if (Array.isArray(CUES[k])) CUES[k].sort((a, b) => (a[0] ?? a) - (b[0] ?? b));
  const q = new URLSearchParams(location.search);
  seek(+(q.get('t') || 0));
  window.READY = true;
})();
