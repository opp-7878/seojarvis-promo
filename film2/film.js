// SEO Jarvis — film v2. Every frame is a pure function of time: seek(t).
// Music grid: 98.18 BPM, one bar = 2.4446 s. The edit puts the drop at bar 6 (14.668 s).
import { makeBackground } from './bg.js';

const RC = { cx: 600, r: 330, sw: 24 };            // analysis ring
const G = {};                                        // measured layout
const BAR = 2.445, bar = k => k * BAR, beat = k => k * BAR / 4;
const DUR = 30.0;
const S = document.getElementById('stage');
const CUES = []; window.CUES = CUES;                 // sound cues, read by tools/cues.mjs
const cue = (t, k, g = 1) => CUES.push({ t: +t.toFixed(4), k, g });

// ---------------------------------------------------------------- math
const clamp = (x, a = 0, b = 1) => x < a ? a : x > b ? b : x;
const lerp = (a, b, u) => a + (b - a) * u;
const pr = (t, a, b) => clamp((t - a) / (b - a));
const inC = u => u * u * u, outC = u => 1 - (1 - u) ** 3;
const ioC = u => u < .5 ? 4 * u * u * u : 1 - (-2 * u + 2) ** 3 / 2;
const ioS = u => u * u * (3 - 2 * u);
const hash = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
// spring step response, damping 0.8 -> ~1.5% overshoot, settles in d seconds
function spr(t, t0, d = .6, z = .8) {
  if (t <= t0) return 0; const tau = (t - t0) / d; if (tau >= 1.6) return 1;
  const w = 7.2, wd = w * Math.sqrt(1 - z * z);
  return 1 - Math.exp(-z * w * tau) * (Math.cos(wd * tau) + (z * w / wd) * Math.sin(wd * tau));
}
// exit: accelerates, half the entry time
const ex = (t, t0, d = .3) => inC(pr(t, t0, t0 + d));
// a short press: 0 -> 1 -> 0
const bump = (t, t0, d = .22) => { const u = pr(t, t0, t0 + d); return u <= 0 || u >= 1 ? 0 : Math.sin(Math.PI * u) ** 2; };
// sum of springs through a list of states [{t, d, v:{...}}]
function chain(t, keys) {
  const out = { ...keys[0].v };
  for (let i = 1; i < keys.length; i++) {
    const k = keys[i], u = k.e ? k.e(pr(t, k.t, k.t + k.d)) : spr(t, k.t, k.d);
    if (u === 0) continue;
    for (const p in k.v) out[p] += (k.v[p] - keys[i - 1].v[p]) * u;
  }
  return out;
}

// ---------------------------------------------------------------- dom
function h(tag, cls, css, parent, html) {
  const e = document.createElement(tag); if (cls) e.className = cls; if (css) e.style.cssText = css;
  if (html != null) e.innerHTML = html; (parent || S).appendChild(e); return e;
}
function tf(e, o) {
  let s = o.p ? `perspective(${o.p}px) ` : '';
  s += `translate3d(${(o.x || 0).toFixed(2)}px,${(o.y || 0).toFixed(2)}px,${(o.z || 0).toFixed(1)}px)`;
  if (o.rx) s += ` rotateX(${o.rx.toFixed(3)}deg)`; if (o.ry) s += ` rotateY(${o.ry.toFixed(3)}deg)`; if (o.rz) s += ` rotateZ(${o.rz.toFixed(3)}deg)`;
  const sx = (o.s ?? 1) * (o.sx ?? 1), sy = (o.s ?? 1) * (o.sy ?? 1);
  if (sx !== 1 || sy !== 1) s += ` scale(${sx.toFixed(4)},${sy.toFixed(4)})`;
  e.style.transform = s;
  if (o.o !== undefined) { const v = clamp(o.o); e.style.opacity = v.toFixed(3); e.style.visibility = v < .002 ? 'hidden' : 'visible'; }
  if (o.b !== undefined) e.style.filter = o.b > .08 ? `blur(${o.b.toFixed(2)}px)` : 'none';
}
const show = (e, v) => { const o = clamp(v); e.style.opacity = o.toFixed(3); e.style.visibility = o < .002 ? 'hidden' : 'visible'; };
function rect(e, r) {
  e.style.left = r.x.toFixed(2) + 'px'; e.style.top = r.y.toFixed(2) + 'px';
  e.style.width = Math.max(0, r.w).toFixed(2) + 'px'; e.style.height = Math.max(0, r.h).toFixed(2) + 'px';
  if (r.r !== undefined) e.style.borderRadius = r.r.toFixed(2) + 'px';
}
const ICON = {};
const icon = (n, size, color = 'currentColor', sw = 1.75) =>
  `<span class="ico" style="width:${size}px;height:${size}px;color:${color}">${ICON[n].replace('stroke-width="2"', `stroke-width="${sw}"`)}</span>`;

// words with a mask; optional per-letter spans
function words(parent, text, { letters = false } = {}) {
  const out = [];
  text.split(' ').forEach((wtxt, i) => {
    if (i) parent.appendChild(document.createTextNode(' '));
    const o = h('span', 'w', '', parent), inner = h('span', 'wi', 'transform-origin:0 100%', o);
    const ls = [];
    if (letters) for (const ch of wtxt) ls.push(h('span', 'l', '', inner, ch === ' ' ? '&nbsp;' : ch));
    else inner.textContent = wtxt;
    out.push({ o, i: inner, ls });
  });
  return out;
}
// mask-rise with a slight tilt; exit lifts out of the mask, twice as fast
function reveal(ws, t, t0, { st = .09, d = .62, dy = 1.04, rot = 5, blur = 10, out = null, outD = .26, outDy = -1.0 } = {}) {
  ws.forEach((w, i) => {
    const j = (hash(i + t0 * 7) - .5) * .018;            // never the same delay twice
    const u = spr(t, t0 + i * st + j, d);
    let y = (1 - u) * dy * 100, r = (1 - u) * rot, b = (1 - clamp(u * 1.3)) * blur, o = clamp(u * 2.4);
    if (out !== null) { const v = ex(t, out + i * st * .45, outD); y += v * outDy * 100; b += v * blur; o *= 1 - v; }
    w.i.style.transform = `translateY(${y.toFixed(2)}%) rotate(${r.toFixed(3)}deg)`;
    w.i.style.filter = b > .08 ? `blur(${b.toFixed(2)}px)` : 'none';
    w.i.style.opacity = o.toFixed(3);
  });
}

// odometer: columns of digits that roll like a mechanical counter
function odometer(parent, { digits, dec = 0, suffix = '', prefix = '', css = '' }) {
  const box = h('span', 'odo', css, parent);
  if (prefix) h('span', '', '', box, prefix);
  const cols = [];
  for (let k = digits - 1; k >= 0; k--) {
    if (dec && k === dec - 1) h('span', '', '', box, '.');
    const c = h('span', 'col', '', box), s = h('span', 'strip', '', c);
    for (let d = 0; d <= 10; d++) h('span', '', '', s, String(d % 10));
    cols.push({ k, c, s });
  }
  if (suffix) h('span', '', '', box, suffix);
  return {
    box, set(v, minDigits = 1) {
      const V = Math.max(0, v * 10 ** dec);
      for (const { k, c, s } of cols) {
        const q = V / 10 ** k; let d;
        if (k === 0) d = V % 10;
        else { const low = V % 10 ** k, top = 10 ** k - 1; d = (Math.floor(q) % 10) + clamp(low - top); }
        s.style.transform = `translateY(${(-d).toFixed(4)}em)`;
        const need = k < Math.max(minDigits, dec + 1) || V >= 10 ** k;
        c.style.opacity = need ? 1 : clamp(V - (10 ** k - 1));
        c.style.display = (!need && V <= 10 ** k - 1) ? 'none' : 'inline-block';
      }
    }
  };
}
// keystroke times with a human rhythm
function keys(t0, n, avg, seed) { const ts = []; let x = t0; for (let i = 0; i < n; i++) { ts.push(x); x += avg * (.7 + .6 * hash(seed + i * 3.1)); } return ts; }
const typed = (t, ts) => { let n = 0; for (const k of ts) if (t >= k) n++; return n; };
const blink = (t, t0) => (t < t0 ? 1 : (Math.floor((t - t0) / .53) % 2 === 0 ? 1 : 0));

// ---------------------------------------------------------------- build
async function build() {
  const names = ['file-text', 'user', 'mail', 'lock', 'eye', 'arrow-right', 'check', 'globe', 'target', 'key-round', 'arrow-up-narrow-wide',
    'chart-line', 'trending-up', 'shield-check', 'file-check', 'layout-grid', 'folder', 'map', 'gift', 'credit-card', 'handshake', 'life-buoy',
    'graduation-cap', 'sun', 'bell', 'download', 'arrow-left', 'lightbulb'];
  await Promise.all(names.map(async n => { ICON[n] = (await (await fetch(`assets/icons/${n}.svg`)).text()).replace(/<!--.*?-->/s, ''); }));
  const logoTxt = await (await fetch('assets/logo.svg')).text();
  const petals = [...logoTxt.matchAll(/<path d="([^"]+)" fill="white"\/>/g)].map(m => m[1]);
  const E = {};
  E.petalsSvg = petals.map(d => `<path d="${d}" fill="#fff"/>`).join('');

  // ---- scene 1: report card + headline
  E.pdf = h('div', 'abs glass', 'left:1190px;top:190px;width:560px;height:700px;padding:48px', S);
  E.pdf.innerHTML = `
    <div style="display:flex;gap:24px;align-items:center">
      <div class="pdfbadge">${icon('file-text', 46, '#FF8A8A')}</div>
      <div><div style="font-size:36px;font-weight:600;letter-spacing:-.02em">Отчёт_SEO.pdf</div>
      <div class="muted" style="font-size:30px;margin-top:4px">от агентства</div></div></div>
    <div class="muted" style="font-size:34px;margin-top:64px">Видимость сайта</div>
    <div class="hd" style="font-size:150px;color:#C8D5EE;margin-top:14px">±0%</div>
    <svg width="464" height="150" style="margin-top:34px;overflow:visible">
      <line x1="0" y1="118" x2="464" y2="118" stroke="rgba(255,255,255,.12)" stroke-width="2" stroke-dasharray="2 10" stroke-linecap="round"/>
      <path d="M0 92 C 50 84, 80 100, 120 94 S 200 80, 240 92 S 320 102, 360 90 S 430 86, 464 92" fill="none" stroke="rgba(200,214,240,.75)" stroke-width="5" stroke-linecap="round"/>
      <circle cx="464" cy="92" r="9" fill="#C8D5EE"/></svg>`;
  E.hook = h('div', 'abs hd', 'left:150px;top:318px;font-size:150px', S);
  const l1 = h('div', '', '', E.hook), l2 = h('div', '', 'margin-top:14px', E.hook);
  E.hw = [...words(l1, 'Отчёт', { letters: true }), ...words(l2, 'раз в месяц?', { letters: true })];
  E.hookLetters = E.hw.flatMap(w => w.ls);
  E.O = E.hw[0].ls[0];

  // ---- svg layer: rings, ticks, arcs
  const NS = 'http://www.w3.org/2000/svg';
  E.svg = document.createElementNS(NS, 'svg'); E.svg.setAttribute('class', 'layer'); E.svg.setAttribute('viewBox', '0 0 1920 1080'); S.appendChild(E.svg);
  const sv = (tag, attrs, parent = E.svg) => { const e = document.createElementNS(NS, tag); for (const a in attrs) e.setAttribute(a, attrs[a]); parent.appendChild(e); return e; };
  E.ticks = sv('g', {}); E.tick = [];
  for (let k = 0; k < 30; k++) E.tick.push(sv('line', { 'stroke-linecap': 'round', 'stroke-width': 5 }, E.ticks));
  E.ring1 = sv('circle', { fill: 'none', stroke: '#fff' });
  E.arc1 = sv('circle', { fill: 'none', stroke: '#fff', 'stroke-linecap': 'round' });
  E.ring2 = sv('circle', { fill: 'none' });
  E.arc2 = sv('circle', { fill: 'none', stroke: '#fff', 'stroke-linecap': 'round' });

  // day counter inside ring 1
  E.days = h('div', 'abs', 'width:700px;left:610px;top:388px;text-align:center', S);
  E.daysOdo = odometer(h('div', 'hd', 'font-size:236px;display:flex;justify-content:center', E.days), { digits: 2 });
  E.daysCap = h('div', 'cap muted', 'margin-top:2px;font-size:52px', E.days, 'дней');

  // ---- the one shape: logo square -> CTA -> registration card -> address field
  E.shape = h('div', 'abs', 'overflow:hidden', S);
  E.shGlass = h('div', 'glass', 'position:absolute;inset:0;border-radius:inherit', E.shape);
  E.shBlue = h('div', 'blue', 'position:absolute;inset:0;border-radius:inherit', E.shape);
  E.shLogo = h('div', '', 'position:absolute;inset:0;border-radius:inherit;background:linear-gradient(101deg,#0B64F4,#1AA2E6);box-shadow:inset 0 1px 0 rgba(255,255,255,.28),0 30px 70px -20px rgba(0,8,40,.85)', E.shape);
  E.petals = h('div', 'abs', 'width:280px;height:280px', S,
    `<svg viewBox="0 0 32 32" width="100%" height="100%">${petals.map(d => `<path d="${d}" fill="#fff"/>`).join('')}</svg>`);

  // wordmark
  E.wm = h('div', 'abs hd', 'left:900px;top:0;font-size:206px', S);
  E.wmw = words(E.wm, 'Jarvis', { letters: true });

  // CTA
  E.eyebrow = h('div', 'abs', 'left:0;width:1920px;top:404px;text-align:center;font-size:40px;font-weight:600;letter-spacing:.2em;color:#9CC0FF;white-space:nowrap', S);
  E.eyw = words(E.eyebrow, 'ПЛАТФОРМА ВМЕСТО АГЕНТСТВА');
  E.cta = h('div', 'abs btn', 'left:0;width:1920px;top:535px;height:110px;font-size:78px', S);
  const ctaT = h('span', '', 'white-space:nowrap', E.cta); E.ctw = words(ctaT, 'Попробовать бесплатно');
  E.ctaArrow = h('span', '', '', E.cta, icon('arrow-right', 72, '#fff', 2.3));

  // registration content (card rect 510,120,900,840)
  E.reg = h('div', 'layer', '', S);
  E.regTitle = h('div', 'abs hd', 'left:574px;top:178px;font-size:58px;letter-spacing:-.035em', E.reg);
  E.rtw = words(E.regTitle, 'Создание аккаунта');
  const fdefs = [['Имя', 'user', 'Александр'], ['Email', 'mail', 'alex@example.ru'], ['Пароль', 'lock', '••••••••••']];
  E.fields = fdefs.map(([lab, ic, val], i) => {
    const g = h('div', 'abs', `left:574px;top:${288 + i * 158}px;width:772px`, E.reg);
    h('div', 'lbl', 'font-size:32px', g, lab);
    const f = h('div', 'fld', 'margin-top:12px', g); f.innerHTML = icon(ic, 36, '#8EA6D4');
    const tx = h('span', '', 'white-space:pre', f); const cr = h('span', 'caret', 'height:44px', f);
    if (ic === 'lock') { tx.style.letterSpacing = '.08em'; }
    return { g, f, tx, cr, val };
  });
  E.regBtn = h('div', 'abs btn blue', 'left:574px;top:776px;width:772px;height:104px;border-radius:24px;font-size:40px', E.reg);
  E.regBtnLab = h('span', 'btn', 'gap:14px', E.regBtn, `Создать аккаунт ${icon('arrow-right', 38, '#fff', 2.2)}`);
  E.regSpin = h('div', 'abs', 'left:356px;top:22px;width:60px;height:60px', E.regBtn,
    `<svg viewBox="0 0 60 60" width="60" height="60"><circle cx="30" cy="30" r="24" fill="none" stroke="rgba(255,255,255,.28)" stroke-width="6"/><circle class="sa" cx="30" cy="30" r="24" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-dasharray="40 200"/></svg>`);
  E.regCheck = h('div', 'abs', 'left:356px;top:22px;width:60px;height:60px', E.regBtn, icon('check', 60, '#fff', 3));

  // address field content (field rect 140,425,1640,230)
  E.url = h('div', 'layer', '', S);
  E.urlLab = h('div', 'abs', 'left:150px;top:338px;font-size:46px;font-weight:600;letter-spacing:-.02em;color:#B8CAEE', E.url);
  E.ulw = words(E.urlLab, 'Адрес сайта');
  E.globe = h('div', 'abs', 'left:206px;top:496px;width:88px;height:88px', E.url, icon('globe', 88, '#9DB3DC', 1.6));
  E.urlTxt = h('div', 'abs hd', 'left:330px;top:478px;font-size:116px;letter-spacing:-.04em;display:flex;align-items:center', E.url);
  E.urlPre = h('span', '', 'color:#7F95C2;white-space:pre', E.urlTxt); E.urlMain = h('span', '', 'white-space:pre', E.urlTxt);
  E.urlCaret = h('span', 'caret', 'height:112px;width:6px;margin-left:8px', E.urlTxt);
  E.go = h('div', 'abs blue btn', 'font-size:52px;overflow:hidden', S);
  E.goLab = h('span', 'btn', 'gap:16px', E.go); E.gow = words(E.goLab, 'Начать продвижение'); h('span', '', '', E.goLab, icon('arrow-right', 50, '#fff', 2.2));

  // analysis
  E.pct = h('div', 'abs', 'left:320px;top:432px;width:560px;text-align:center', S);
  E.pctOdo = odometer(h('div', 'hd', 'font-size:156px;display:flex;justify-content:center;letter-spacing:-.05em', E.pct), { digits: 3, suffix: '%' });
  E.pctCap = h('div', 'cap muted', 'margin-top:8px;font-size:38px', E.pct, 'Jarvis работает');
  const steps = [['Ниша', 'target'], ['Семантическое ядро', 'key-round'], ['Приоритизация', 'arrow-up-narrow-wide'],
    ['Ежедневный съём позиций', 'chart-line'], ['Технический аудит', 'shield-check'], ['Рекомендации и отчёт', 'file-check']];
  E.steps = steps.map(([txt, ic]) => {
    const r = h('div', 'abs', 'left:1060px;top:0;height:120px;display:flex;align-items:center;gap:34px;transform-origin:0 50%', S);
    const sq = h('div', 'inner', 'width:110px;height:110px;border-radius:30px;display:flex;align-items:center;justify-content:center;position:relative;flex:none', r);
    const i1 = h('div', '', 'position:absolute', sq, icon(ic, 54, '#CFE0FF', 1.8));
    const i2 = h('div', '', 'position:absolute', sq, icon('check', 56, '#46D388', 2.4));
    const tx = h('div', 'hd', 'font-size:64px;letter-spacing:-.035em', r, txt);
    return { r, sq, i1, i2, tx };
  });

  // ---- dashboard
  E.dashLayer = h('div', 'layer', '', S);
  E.dash = h('div', 'abs', 'left:80px;top:40px;width:1760px;height:1000px', E.dashLayer);
  E.dash.id = 'dash';
  buildDash(E);

  // hero card (zoom on visibility, flip to key queries)
  E.hero = h('div', 'abs glass', 'left:260px;top:240px;width:1400px;height:600px;border-radius:40px;overflow:hidden', S);
  E.hf = h('div', 'face', '', E.hero); E.hb = h('div', 'face', '', E.hero);
  h('div', 'abs muted', 'left:72px;top:66px;font-size:46px;font-weight:500', E.hf, 'Видимость сайта');
  E.heroVal = h('div', 'abs hd', 'left:62px;top:138px;font-size:290px;letter-spacing:-.055em;color:#fff', E.hf);
  E.heroOdo = odometer(E.heroVal, { digits: 2, dec: 1, suffix: '%' });
  E.heroDelta = h('div', 'abs', 'left:76px;top:470px;font-size:50px;font-weight:600;color:#46D388;display:flex;align-items:center;gap:14px', E.hf,
    `${icon('trending-up', 50, '#46D388', 2.2)}`);
  E.deltaOdo = odometer(E.heroDelta, { digits: 2, dec: 1, prefix: '+', suffix: '% за месяц' });
  E.chart = h('div', 'abs', 'left:790px;top:150px;width:690px;height:400px;transform:scale(.8);transform-origin:0 0', E.hf);
  {
    const pts = [[0, 300], [60, 286], [120, 292], [180, 262], [240, 268], [300, 236], [360, 226], [420, 238], [480, 196], [540, 176], [600, 150], [660, 112]];
    const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0] + ' ' + p[1]).join(' ');
    E.chart.innerHTML = `<svg width="690" height="400" viewBox="-10 0 690 400" style="overflow:visible">
      <defs><linearGradient id="cf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1A69F0" stop-opacity=".38"/><stop offset="1" stop-color="#1A69F0" stop-opacity="0"/></linearGradient>
      <clipPath id="cc"><rect id="ccr" x="-20" y="0" width="0" height="420"/></clipPath></defs>
      ${[100, 200, 300].map(y => `<line x1="0" x2="680" y1="${y}" y2="${y}" stroke="rgba(255,255,255,.07)" stroke-width="2"/>`).join('')}
      <g clip-path="url(#cc)"><path d="${d} L660 400 L0 400 Z" fill="url(#cf)"/>
      <path d="${d}" fill="none" stroke="#5B9BFF" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"/></g>
      <circle id="cdot" r="13" fill="#fff" stroke="#1A69F0" stroke-width="6"/></svg>`;
    E.chartPts = pts;
  }
  h('div', 'abs hd', 'left:72px;top:64px;font-size:56px;letter-spacing:-.03em', E.hb, 'Ключевые запросы');
  const rows = [['стоматология москва', 7, 3, '+4'], ['лечение зубов недорого', 8, 6, '+2'], ['удаление зуба цена', 11, 10, '+1']];
  E.qrows = rows.map(([q, a, b, d], i) => {
    const r = h('div', 'abs', `left:72px;top:${170 + i * 148}px;width:1256px;height:128px;display:flex;align-items:center;border-radius:28px;padding:0 34px`, E.hb);
    const bgc = h('div', 'inner', 'position:absolute;inset:0;border-radius:28px', r);
    h('div', '', 'flex:1;font-size:54px;font-weight:600;letter-spacing:-.02em;position:relative', r, q);
    const pill = h('div', 'pill', 'position:relative;height:92px;min-width:130px;padding:0 24px;font-size:62px;border-radius:22px;background:rgba(255,255,255,.08);margin-right:60px', r);
    const odo = odometer(h('span', 'hd', 'letter-spacing:-.03em', pill), { digits: 2 });
    const dl = h('div', 'hd', 'position:relative;width:120px;font-size:58px;color:#46D388;text-align:right', r, d);
    return { r, pill, odo, dl, a, b };
  });

  // caption next to the angled dashboard
  E.cap9 = h('div', 'abs hd', 'left:120px;top:376px;font-size:108px;letter-spacing:-.045em', S);
  const c1 = h('div', '', '', E.cap9), c2 = h('div', '', 'margin-top:12px', E.cap9);
  E.c9w = [...words(c1, 'Всё для роста'), ...words(c2, 'в одном кабинете')];

  // end card
  E.tag = h('div', 'abs hd', 'left:610px;top:362px;font-size:140px', S);
  E.tagw = words(E.tag, 'SEO на автопилоте');
  E.endBtn = h('div', 'abs blue btn', 'left:616px;top:568px;height:128px;border-radius:32px;padding:0 50px;font-size:56px;overflow:hidden', S);
  E.endBtnLab = h('span', '', '', E.endBtn); E.ebw = words(E.endBtnLab, '5 дней бесплатно');
  E.sheen = h('div', 'abs', 'top:0;left:0;width:180px;height:128px;background:linear-gradient(100deg,rgba(255,255,255,0),rgba(255,255,255,.28),rgba(255,255,255,0))', E.endBtn);
  E.site = h('div', 'abs', 'left:0;top:600px;font-size:56px;font-weight:600;letter-spacing:-.02em;color:#D9E4FA', S);
  E.sitew = words(E.site, 'seojarvis.ru');

  E.cursor = h('div', '', '', S, `<svg viewBox="0 0 28 28" width="46" height="46"><path d="M6 3.5 L6 22.5 L10.6 18.3 L13.6 25 L17 23.5 L14.1 17 L20.4 16.6 Z" fill="#fff" stroke="#0B1222" stroke-width="1.4" stroke-linejoin="round"/></svg>`);
  E.cursor.id = 'cursor';
  return E;
}

function buildDash(E) {
  const D = E.dash;
  const side = h('div', 'side', '', D);
  h('div', 'abs', 'left:36px;top:38px;display:flex;align-items:center;gap:16px;font-size:28px;font-weight:700;color:#fff;white-space:nowrap', side,
    `<span style="width:46px;height:46px;border-radius:12px;background:linear-gradient(101deg,#0B64F4,#1AA2E6);display:flex;align-items:center;justify-content:center"><svg viewBox="7 7 18 18" width="30" height="30">${E.petalsSvg || ''}</svg></span>SEO Jarvis`);
  const menu = [['Дашборд', 'layout-grid'], ['Проекты', 'folder'], ['Яндекс.Карты', 'map'], ['Бонусы', 'gift'], ['Оплата', 'credit-card'], ['Партнёрам', 'handshake'], ['Поддержка', 'life-buoy'], ['Обучение', 'graduation-cap']];
  menu.forEach(([n, ic], i) => h('div', 'mi' + (i === 1 ? ' on' : ''), `top:${128 + i * 64}px`, side, `${icon(ic, 26)}<span>${n}</span>`));
  // header
  h('div', 'abs', 'left:344px;top:34px;display:flex;align-items:center;gap:18px;white-space:nowrap', D,
    `${icon('arrow-left', 26, '#8FA3C8')}<span style="font-size:23px;color:#8FA3C8">Дашборд</span><span style="font-size:36px;font-weight:700;letter-spacing:-.02em;margin-left:6px">example.ru</span>
     <span style="display:inline-flex;align-items:center;gap:10px;height:42px;padding:0 18px;border-radius:21px;background:rgba(70,211,136,.12);color:#46D388;font-size:20px;font-weight:600"><span class="dot" style="background:#46D388"></span>Активно</span>`);
  h('div', 'abs', 'right:44px;top:30px;display:flex;align-items:center;gap:14px', D,
    `<span class="btn blue" style="height:56px;padding:0 24px;border-radius:14px;font-size:21px;gap:12px">${icon('download', 24, '#fff', 2)}Скачать аудит</span>
     <span class="inner" style="width:56px;height:56px;border-radius:14px;display:flex;align-items:center;justify-content:center">${icon('sun', 26, '#F5C451')}</span>
     <span class="inner" style="width:56px;height:56px;border-radius:14px;display:flex;align-items:center;justify-content:center">${icon('bell', 26, '#8FA3C8')}</span>`);
  // tabs
  let tx = 344;
  ['Обзор', 'Отчёт по позициям', 'Конкуренты', 'Ссылки', 'Анализ SEO трафика'].forEach((n, i) => {
    const e = h('div', 'tab' + (i === 0 ? ' on' : ''), `left:${tx}px;top:124px`, D, n); tx += [110, 236, 170, 120, 240][i] + 12;
  });
  // KPI cards
  const kp = [['Позиций в Топ-3', 8, 0, '#6FA3FF', '+3 за месяц', '#46D388'], ['Позиций в Топ-10', 24, 0, '#46D388', '+6 за месяц', '#46D388'],
    ['Видимость сайта', 7.4, 1, '#6FA3FF', '+1.2% за месяц', '#46D388'], ['Доля в нише', 2.1, 1, '#F5B83D', 'цель: 8%', '#F5B83D']];
  E.kpi = kp.map(([lab, v, dec, col, dl, dcol], i) => {
    const c = h('div', 'dc', `left:${344 + i * 349}px;top:212px;width:325px;height:170px`, D);
    h('div', 'abs dcl', 'left:28px;top:26px', c, lab);
    const vv = h('div', 'abs dcv', `left:24px;top:64px;color:${col}`, c);
    const odo = odometer(vv, { digits: dec ? 2 : 2, dec, suffix: dec ? '%' : '' });
    h('div', 'abs dcd', 'left:28px;top:134px', c, `<span class="dot" style="background:${dcol}"></span>${dl}`);
    return { c, odo, v };
  });
  // health index
  const hc = h('div', 'dc', 'left:344px;top:406px;width:706px;height:388px', D);
  h('div', 'abs', 'left:30px;top:28px;font-size:28px;font-weight:700;letter-spacing:-.02em', hc, 'Индекс здоровья сайта');
  h('div', 'abs dcl', 'left:30px;top:70px;font-size:20px', hc, 'Складывается из 4 технических показателей');
  hc.insertAdjacentHTML('beforeend', `<svg class="abs" style="left:40px;top:136px" width="260" height="170" viewBox="0 0 260 170">
    <path d="M24 150 A106 106 0 0 1 236 150" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="22" stroke-linecap="round"/>
    <path id="gauge" d="M24 150 A106 106 0 0 1 236 150" fill="none" stroke="#F5B83D" stroke-width="22" stroke-linecap="round" stroke-dasharray="0 400"/></svg>`);
  E.gaugeOdo = odometer(h('div', 'abs dcv', 'left:118px;top:226px;font-size:66px;color:#F5B83D', hc), { digits: 2 });
  h('div', 'abs dcl', 'left:84px;top:310px;font-size:18px', hc, 'из 100 · ниже среднего');
  const hl = [['#46D388', 'Страницы не спорят за одни запросы'], ['#FF6B6B', 'Страница похожа на статью и услугу'], ['#46D388', 'Каждая страница раскрывает тему'], ['#FF6B6B', '709 запросов ведут не тех посетителей']];
  hl.forEach(([c, s], i) => h('div', 'abs', `left:332px;top:${128 + i * 62}px;width:350px;display:flex;gap:14px;font-size:19px;line-height:1.3;color:#DCE5F5`, hc,
    `<span style="width:4px;border-radius:2px;background:${c};flex:none;align-self:stretch"></span><span>${s}</span>`));
  // key queries
  const qc = h('div', 'dc tbl', 'left:1074px;top:406px;width:642px;height:388px', D);
  h('div', 'abs', 'left:26px;top:28px;font-size:28px;font-weight:700;letter-spacing:-.02em', qc, 'Ключевые запросы');
  h('div', 'tr', 'top:80px;color:#8FA3C8;font-size:17px', qc, '<span class="q" style="color:#8FA3C8;font-weight:500">Запрос</span><span class="p">Позиция</span><span class="d" style="color:#8FA3C8;font-weight:500">Динамика</span><span class="f">Частота</span>');
  const tr = [['стоматология москва', 3, '+4', '8 200', 'rgba(26,105,240,.35)'], ['лечение зубов недорого', 6, '+2', '4 100', 'rgba(70,211,136,.22)'], ['удаление зуба цена', 10, '+1', '3 600', 'rgba(70,211,136,.22)'],
    ['стоматология рядом', 20, '0', '2 900', ''], ['имплантация зубов москва', 19, '+3', '2 400', ''], ['детская стоматология', 16, '−1', '1 800', '']];
  E.trows = tr.map(([q, p, d, f, bgc], i) => h('div', 'tr', `top:${132 + i * 42}px;height:42px`, qc,
    `<span class="q">${q}</span><span class="p"><span class="pill pos" style="${bgc ? 'background:' + bgc : ''}">${p}</span></span><span class="d" style="${d === '0' ? 'color:#8FA3C8' : d.startsWith('−') ? 'color:#FF6B6B' : ''}">${d}</span><span class="f">${f}</span>`));
  // bottom row, partly below the fold
  const ch = h('div', 'dc', 'left:344px;top:818px;width:706px;height:300px', D);
  h('div', 'abs', 'left:30px;top:28px;font-size:28px;font-weight:700;letter-spacing:-.02em', ch, 'Динамика спроса по проекту');
  ch.insertAdjacentHTML('beforeend', `<svg class="abs" style="left:30px;top:84px" width="646" height="110"><path d="M0 92 C40 60 70 40 100 70 S150 104 190 80 S240 30 290 36 S340 80 380 60 S430 26 470 44 S530 84 560 40 S610 20 646 10" fill="none" stroke="#5B9BFF" stroke-width="4"/></svg>`);
  const ms = h('div', 'dc', 'left:1074px;top:818px;width:642px;height:300px', D);
  h('div', 'abs', 'left:26px;top:28px;font-size:28px;font-weight:700;letter-spacing:-.02em', ms, 'Доля рынка');
  [['competitor1.ru', 31], ['leader-site.ru', 19], ['best-niche.ru', 12]].forEach(([n, v], i) =>
    h('div', 'abs', `left:26px;top:${86 + i * 40}px;width:590px;display:flex;align-items:center;gap:20px;font-size:19px;color:#DCE5F5`, ms,
      `<span style="width:170px">${n}</span><span style="flex:1;height:10px;border-radius:5px;background:rgba(255,255,255,.07)"><span style="display:block;height:10px;border-radius:5px;width:${v / 31 * 100}%;background:#5B9BFF"></span></span><span style="width:50px;text-align:right">${v}%</span>`));
}

// ---------------------------------------------------------------- timeline
const T = {
  // scene 1
  pdfOut: 1.95, lettersOut: 1.97, ringSwap: 2.14, ringMove: 2.19, ticksIn: 2.45, count0: 2.62, count1: 3.40, countOut: 4.02,
  split: 4.04, spin0: 4.00, spin1: 5.00, squareIn: 4.40, petalsIn: 4.46,
  // scene 2
  logoLeft: 4.80, wmIn: 4.90, wmOut: 5.62, toBtn: 5.84, eyebrowIn: 5.96, ctaIn: 5.93, click1: beat(11), toCard: 7.12,
  // scene 3
  regIn: 7.36, click2: beat(15), regOut: 9.62,
  // scene 4
  toField: 9.70, urlIn: 9.92, type0: 10.02, goIn: 11.00, click3: beat(19), urlOut: 11.62, toRing: 11.70, ringOpen: 12.05,
  // scene 5
  steps0: 12.25, done: 14.42, antic: 14.45,
  // scene 6..9
  drop: bar(6), kpi: 14.95, straighten: 16.50, push: bar(7), heroIn: 17.47, count: 17.72, flip: bar(8) - .05, rows: 19.95,
  pull: bar(9), capIn: 22.45, collapse: bar(10), tagIn: 25.05, cta: bar(11),
};
const STEPD = [.46, .42, .38, .34, .32, .30];
const STEPT = STEPD.reduce((a, d, i) => (a.push(i ? a[i - 1] + STEPD[i - 1] : T.steps0), a), []);

let E, BG, O0, OF;
window.seek = function seek(t) {
  bgFrame(t);
  const cam = 1 + .03 * ioS(pr(t, bar(10) + .6, DUR));          // slow push on the end card
  S.style.transform = cam > 1.0001 ? `scale(${cam.toFixed(5)})` : 'none';
  scene1(t); shapeAndLogo(t); scene2(t); scene3(t); scene4(t); scene5(t); dashboard(t); heroCard(t); endCard(t); cursor(t);
};

function bgFrame(t) {
  let e = .18;
  e = lerp(e, .32, spr(t, bar(4) - .05, .5));
  e = lerp(e, .85, ioS(pr(t, bar(5), bar(6))));
  e = lerp(e, 1.0, spr(t, bar(6), .3));
  e = lerp(e, .62, pr(t, bar(6) + .4, bar(7)));
  e = lerp(e, .35, pr(t, bar(10), bar(10) + 1));
  e = lerp(e, .62, spr(t, bar(11), .35));
  e = lerp(e, .48, pr(t, bar(11) + .5, DUR));
  // keep the light masses away from the text side in text-led shots
  const dx = lerp(-.28, 0, pr(t, 2.3, 3.2)) + lerp(0, -.30, ioS(pr(t, 21.9, 22.8))) + lerp(0, .30, ioS(pr(t, 24.4, 25.4)));
  BG.draw(t, { energy: e, focus: .35, fx: .5, fy: .5, dx, size: 1 + .12 * spr(t, bar(6), .8) - .12 * pr(t, bar(7), bar(10)) });
}

// ---- scene 1: headline + report, the O becomes a month dial, then the logo
function scene1(t) {
  // report card drifts, then swings away
  const po = ex(t, T.pdfOut, .32);
  tf(E.pdf, { p: 1800, x: -10 * t + po * 260, y: -6 * t + po * 40, ry: -15 + 1.6 * t - po * 52, rx: 5 - .6 * t, s: 1 - po * .12, o: 1 - po });
  // headline words; the first word is already there on frame 0 (cover)
  reveal(E.hw, t, -1, { st: 0 }); reveal(E.hw.slice(1), t, .10);
  E.hookLetters.forEach((l, i) => {
    if (l === E.O) { l.style.opacity = t < T.ringSwap ? 1 : 0; return; }
    const n = E.hookLetters.length, k = n - 1 - i, v = ex(t, T.lettersOut + k * .01, .22);
    l.style.transform = `translateY(${(-v * 120).toFixed(1)}%)`; l.style.opacity = (1 - v).toFixed(3);
    l.style.filter = v > .01 ? `blur(${(v * 14).toFixed(1)}px)` : 'none';
  });
  // ring geometry (circle stroke matched to the O glyph)
  const m = spr(t, T.ringMove, .95);
  const cx = lerp(O0.cx, 960, m), cy = lerp(O0.cy, 540, m);
  const split = spr(t, T.split, .7);
  let r = lerp(O0.r, 330, m), sw = lerp(O0.sw, 18, m);
  r = lerp(r, 112, split); sw = lerp(sw, 44, split);
  const vis = t >= T.ringSwap && t < T.petalsIn + .14 ? 1 : 0;
  const fadeToPetals = 1 - pr(t, T.petalsIn, T.petalsIn + .12);
  const prog = ioC(pr(t, T.count0, T.count1));
  const full = prog >= 1;
  // track: white glyph -> dim track -> full white when the month completes
  const trackA = lerp(1, .16, pr(t, T.ringMove + .1, T.ringMove + .55)) * (1 - pr(t, T.count1 - .03, T.count1 + .05)) + pr(t, T.count1 - .03, T.count1 + .05);
  const A = 630 * ioC(pr(t, T.spin0, T.spin1));
  const C = 2 * Math.PI * r, g = .55 * split;
  for (const [el, a] of [[E.ring1, trackA], [E.arc1, full ? 0 : 1]]) {
    el.setAttribute('cx', cx); el.setAttribute('cy', cy); el.setAttribute('r', r); el.setAttribute('stroke-width', sw);
  }
  E.ring1.setAttribute('stroke-opacity', (trackA * vis * fadeToPetals).toFixed(3));
  E.ring1.setAttribute('stroke-dasharray', split > .001 ? `${(C / 4 * (1 - g)).toFixed(2)} ${(C / 4 * g).toFixed(2)}` : 'none');
  E.ring1.setAttribute('transform', `rotate(${(A - 90).toFixed(2)} ${cx} ${cy})`);
  E.arc1.setAttribute('stroke-dasharray', `${(prog * C).toFixed(2)} ${C.toFixed(2)}`);
  E.arc1.setAttribute('transform', `rotate(-90 ${cx} ${cy})`);
  E.arc1.setAttribute('stroke-opacity', (t > T.count0 && !full ? 1 : 0) * vis);
  // 30 days around the dial
  E.tick.forEach((ln, k) => {
    const a = (k / 30) * Math.PI * 2 - Math.PI / 2, u = spr(t, T.ticksIn + k * .011, .5), o = ex(t, T.countOut + k * .004, .3);
    const r0 = 372 + o * 180, r1 = 398 + o * 240;
    ln.setAttribute('x1', (960 + Math.cos(a) * r0).toFixed(2)); ln.setAttribute('y1', (540 + Math.sin(a) * r0).toFixed(2));
    ln.setAttribute('x2', (960 + Math.cos(a) * r1).toFixed(2)); ln.setAttribute('y2', (540 + Math.sin(a) * r1).toFixed(2));
    const lit = prog * 30 > k + .5;
    ln.setAttribute('stroke', lit ? '#fff' : 'rgba(255,255,255,.26)');
    ln.setAttribute('stroke-opacity', (clamp(u * 1.5) * (1 - o)).toFixed(3));
  });
  // day counter
  const dIn = spr(t, T.ticksIn + .1, .6), dOut = ex(t, T.countOut, .2);
  tf(E.days, { y: (1 - dIn) * 50 - dOut * 30, s: 1 - dOut * .08, o: clamp(dIn * 2) * (1 - dOut), b: (1 - clamp(dIn * 1.4)) * 10 + dOut * 12 });
  E.daysOdo.set(30 * prog);
}

// ---- the one shape + logo petals
function shapeAndLogo(t) {
  const c = (cx, cy, w, h, r) => ({ x: cx - w / 2, y: cy - h / 2, w, h, r });
  const K = [
    { t: 0, v: c(960, 540, 400, 400, 100) },
    { t: T.logoLeft, d: .7, v: c(G.logoCx, 540, 340, 340, 85) },
    { t: T.toBtn, d: .72, v: c(960, 590, 1240, 220, 56) },
    { t: T.toCard, d: .78, v: { x: 465, y: 78, w: 990, h: 924, r: 48 } },
    { t: T.toField, d: .62, v: { x: 140, y: 425, w: 1640, h: 230, r: 58 } },
  ];
  const R = chain(t, K);
  rect(E.shape, R);
  const sIn = spr(t, T.squareIn, .75);
  const press = bump(t, T.click1, .24) * .035 + bump(t, T.click3 - 99, .24) * 0;
  const out = ex(t, T.urlOut, .2);
  tf(E.shape, { s: (t < T.logoLeft ? sIn : 1) * (1 - press) * (1 - out * .04), o: (t < T.squareIn ? 0 : 1) * (1 - out), b: out * 8 });
  // skins: logo gradient -> CTA blue -> glass
  const toBlue = pr(t, T.toBtn, T.toBtn + .35), toGlass = pr(t, T.toCard - .02, T.toCard + .22);
  show(E.shLogo, 1 - toBlue); show(E.shBlue, 1 - toGlass); show(E.shGlass, toGlass);
  // petals: spin down into place, ride with the square, then shrink away into the CTA
  const pc = { cx: R.x + R.w / 2, cy: R.y + R.h / 2 };
  const size = Math.min(R.w, R.h) * sIn;
  const A = 630 * ioC(pr(t, T.spin0, T.spin1));
  const pOut = ex(t, T.toBtn - .06, .22);
  E.petals.style.width = E.petals.style.height = size.toFixed(2) + 'px';
  tf(E.petals, { x: pc.cx - size / 2, y: pc.cy - size / 2, rz: A, s: 1 - pOut * .6, o: pr(t, T.petalsIn, T.petalsIn + .12) * (1 - pOut) });
}

// ---- scene 2: wordmark, CTA
function scene2(t) {
  // wordmark letters slide out from behind the logo
  E.wm.style.top = (540 - 206 * .60).toFixed(1) + 'px';
  E.wm.style.left = G.wmLeft + 'px';
  E.wmw[0].ls.forEach((l, i) => {
    const u = spr(t, T.wmIn + i * .055, .62), v = ex(t, T.wmOut + i * .012, .18);
    l.style.transform = `translate(${((1 - u) * -70).toFixed(1)}px,${(-v * 110).toFixed(1)}px)`;
    l.style.opacity = (clamp(u * 2) * (1 - v)).toFixed(3);
    l.style.filter = (1 - u) + v > .02 ? `blur(${((1 - clamp(u * 1.3)) * 12 + v * 14).toFixed(1)}px)` : 'none';
  });
  reveal(E.eyw, t, T.eyebrowIn, { st: .09, blur: 8, out: T.click1 + .1, outD: .16 });
  reveal(E.ctw, t, T.ctaIn, { st: .09, out: T.toCard - .06, outD: .14 });
  const a = spr(t, T.ctaIn + .2, .6), ao = ex(t, T.toCard - .06, .14);
  tf(E.ctaArrow, { x: (1 - a) * -20 + bump(t, T.click1, .3) * 10, o: a * (1 - ao) });
  const press = bump(t, T.click1, .24) * .035;
  tf(E.cta, { s: 1 - press });
}

// ---- scene 3: registration
function scene3(t) {
  const out = ex(t, T.regOut, .2);
  tf(E.reg, { s: 1.1 * (1 - out * .04), o: (t > T.toCard ? 1 : 0) * (1 - out), b: out * 10 });
  reveal(E.rtw, t, T.regIn, { st: .09 });
  const ks = [keys(7.66, 9, .040, 1), keys(8.08, 15, .032, 7), keys(8.62, 10, .026, 19)];
  const focus = [[7.58, 8.05], [8.05, 8.60], [8.60, 8.94]];
  E.fields.forEach((f, i) => {
    const u = spr(t, T.regIn + .1 + i * .2, .55);
    tf(f.g, { y: (1 - u) * 34, o: clamp(u * 2), b: (1 - clamp(u * 1.4)) * 8 });
    const n = typed(t, ks[i]); f.tx.textContent = f.val.slice(0, n);
    const on = t >= focus[i][0] && t < focus[i][1];
    f.f.style.boxShadow = on ? 'inset 0 0 0 2.5px #1A69F0, 0 0 0 6px rgba(26,105,240,.16)' : 'inset 0 0 0 1.5px rgba(255,255,255,.13)';
    f.cr.style.opacity = on ? blink(t, ks[i][ks[i].length - 1] + .1) : 0;
  });
  const b = spr(t, T.regIn + .6, .55);
  const press = bump(t, T.click2, .24) * .03;
  tf(E.regBtn, { y: (1 - b) * 34, s: 1 - press, o: clamp(b * 2) });
  const sp = pr(t, T.click2 + .04, T.click2 + .1) * (1 - pr(t, 9.42, 9.48));
  show(E.regBtnLab, 1 - pr(t, T.click2 + .02, T.click2 + .1));
  show(E.regSpin, sp); E.regSpin.style.transform = `rotate(${(t * 560).toFixed(1)}deg)`;
  const ck = spr(t, 9.45, .45);
  tf(E.regCheck, { s: .4 + .6 * ck, o: clamp(ck * 2) });
}

// ---- scene 4: one field, the address
function scene4(t) {
  const out = ex(t, T.urlOut, .2);
  tf(E.url, { y: -out * 40, o: (t > T.toField ? 1 : 0) * (1 - out), b: out * 12 });
  reveal(E.ulw, t, T.urlIn, { st: .09 });
  const gi = spr(t, T.urlIn + .05, .6);
  tf(E.globe, { s: .7 + .3 * gi, rz: (1 - gi) * -40, o: clamp(gi * 2) });
  const full = 'https://example.ru', ts = keys(T.type0, full.length, .046, 31);
  const n = typed(t, ts);
  E.urlPre.textContent = full.slice(0, Math.min(n, 8)); E.urlMain.textContent = n > 8 ? full.slice(8, n) : '';
  E.urlCaret.style.opacity = t > T.urlIn + .05 ? blink(t, ts[ts.length - 1] + .12) : 0;
  // start button slides out of the field; after the click it becomes the loader dot
  const gin = spr(t, T.goIn, .55);
  const K = [
    { t: 0, v: { x: 530, y: 722, w: 860, h: 136, r: 38 } },
    { t: T.toRing, d: .5, v: { x: RC.cx - 100, y: 440, w: 200, h: 200, r: 100 } },
  ];
  const R = chain(t, K); rect(E.go, R);
  const press = bump(t, T.click3, .24) * .035;
  tf(E.go, { y: (1 - gin) * 60, s: 1 - press, o: (t > T.goIn ? clamp(gin * 2) : 0) * (1 - pr(t, T.ringOpen, T.ringOpen + .1)) });
  E.goLab.style.opacity = (1 - pr(t, T.toRing, T.toRing + .1)).toFixed(3);
  reveal(E.gow, t, T.goIn + .08, { st: .09 });
}

// ---- scene 5: analysis ring + six steps on a wheel
function scene5(t) {
  // ring opens from the dot
  const o = spr(t, T.ringOpen, .62);
  const antic = inC(pr(t, T.antic, T.drop)) * .07;
  const through = pr(t, T.drop, T.drop + .62);
  const th = outC(through);
  let cx = RC.cx, cy = 540, r = lerp(50, RC.r, o) * (1 - antic), sw = lerp(100, RC.sw, o) * (1 - antic);
  cx = lerp(cx, 960, th); r = lerp(r, 2300, th ** 1.15); sw = lerp(sw, 300, th);
  const vis = t >= T.ringOpen && through < 1 ? 1 : 0;
  const col = pr(t, T.ringOpen, T.ringOpen + .35);
  for (const el of [E.ring2, E.arc2]) { el.setAttribute('cx', cx); el.setAttribute('cy', cy); el.setAttribute('r', r); el.setAttribute('stroke-width', sw); }
  E.ring2.setAttribute('stroke', col < 1 ? `rgba(${lerp(26, 255, col) | 0},${lerp(105, 255, col) | 0},${lerp(240, 255, col) | 0},${lerp(1, .14, col).toFixed(3)})` : 'rgba(255,255,255,.14)');
  E.ring2.setAttribute('stroke-opacity', vis);
  // progress
  let p = 0; STEPT.forEach((s, i) => { p += ioC(pr(t, s, s + STEPD[i])) / 6; });
  const C = 2 * Math.PI * r;
  E.arc2.setAttribute('stroke-dasharray', `${(p * C).toFixed(2)} ${C.toFixed(2)}`);
  E.arc2.setAttribute('transform', `rotate(-90 ${cx} ${cy})`);
  E.arc2.setAttribute('stroke-opacity', (t > T.steps0 ? 1 : 0) * vis);
  // percent
  const pin = spr(t, T.steps0 - .05, .55), pout = ex(t, T.antic, .18);
  tf(E.pct, { y: (1 - pin) * 30, s: 1 - pout * .1, o: clamp(pin * 2) * (1 - pout), b: (1 - clamp(pin * 1.4)) * 10 + pout * 10 });
  E.pctOdo.set(Math.min(100, p * 100));
  // the wheel: continuous index, each step a spring
  let c = 0; for (let i = 1; i < 6; i++) c += spr(t, STEPT[i], .42);
  const lin = spr(t, T.steps0 - .1, .6), lout = ex(t, T.antic, .2);
  E.steps.forEach((s, i) => {
    const k = i - c, a = Math.abs(k);
    const done = t >= STEPT[i] + STEPD[i] - .04;
    const y = 540 - 60 + k * 140 + (1 - lin) * 80 - lout * 60;
    tf(s.r, { p: 1400, y, x: a * 18, rx: -k * 24, s: 1 - Math.min(a, 2.5) * .17, o: clamp(1 - a * .5) * clamp(lin * 2) * (1 - lout) * (t > T.toRing ? 1 : 0), b: a * 2.4 + lout * 8 });
    show(s.i1, done ? 0 : 1); show(s.i2, done ? spr(t, STEPT[i] + STEPD[i] - .04, .3) : 0);
    s.i2.style.transform = `scale(${(.5 + .5 * spr(t, STEPT[i] + STEPD[i] - .04, .35)).toFixed(3)})`;
  });
}

// ---- dashboard: through the ring, odometers, push-in, pull-out, collapse into the logo
function dashboard(t) {
  const th = outC(pr(t, T.drop, T.drop + .62));
  const r = lerp(RC.r * .93, 2300, th ** 1.15), sw = lerp(RC.sw * .93, 300, th), cx = lerp(RC.cx, 960, th);
  const inner = Math.max(0, r - sw / 2);
  E.dashLayer.style.clipPath = t < T.drop + .7 ? `circle(${inner.toFixed(1)}px at ${cx.toFixed(1)}px 540px)` : 'none';
  // pose
  const settle = spr(t, T.drop, 1.35), str = spr(t, T.straighten, .7);
  let s = lerp(1.5, .86, settle), rx = lerp(26, 9, settle), ry = lerp(-20, -8, settle), rz = lerp(4, 1.2, settle);
  rx = lerp(rx, 0, str); ry = lerp(ry, 0, str); rz = lerp(rz, 0, str); s = lerp(s, .9, str);
  let x = 0, y = 0;
  // push into the visibility card (local centre 1204.5, 297)
  const pu = ioC(pr(t, T.push, T.push + .45));
  const P = { x: lerp(880, 1204.5, pu), y: lerp(500, 297, pu) };
  s = lerp(s, 2.6, pu);
  x = (960 - (P.x - 880) * s) - 960; y = (540 - (P.y - 500) * s) - 540;
  // pull out to the angled pose beside the caption
  const pl = spr(t, T.pull, 1.0);
  const drift = pr(t, T.pull, T.collapse);
  s = lerp(s, .74, pl); x = lerp(x, 730 - 40 * drift, pl); y = lerp(y, 90 - 20 * drift, pl);
  rx = lerp(rx, 16, pl); ry = lerp(ry, -30 + 5 * drift, pl); rz = lerp(rz, -3, pl);
  // collapse into the logo square
  const co = ioC(pr(t, T.collapse, T.collapse + .55));
  s = lerp(s, .1, co); x = lerp(x, G.endCx - 960, co); y = lerp(y, 0, co); rx = lerp(rx, 0, co); ry = lerp(ry, 0, co); rz = lerp(rz, 0, co);
  const hidden = (t > T.heroIn + .25 && t < T.pull) ? 0 : 1;
  const back = t >= T.pull ? pr(t, T.pull + .08, T.pull + .34) : 1;
  tf(E.dash, { p: 2600, x, y, rx, ry, rz, s, o: (t >= T.drop ? 1 : 0) * (t < T.heroIn + .25 ? 1 : back) * (1 - pr(t, T.collapse + .32, T.collapse + .48)) * (hidden || t >= T.pull ? 1 : 0),
    b: t > T.push && t < T.pull ? pr(t, T.push + .2, T.heroIn + .2) * 6 : 0 });
  E.dash.style.borderRadius = lerp(34, 160, co).toFixed(1) + 'px';
  // numbers
  E.kpi.forEach((k, i) => k.odo.set(k.v * ioC(pr(t, T.kpi + i * .2, T.kpi + i * .2 + .9)), 1));
  const gu = ioC(pr(t, T.kpi + .3, T.kpi + 1.3));
  E.gaugeOdo.set(53 * gu, 1);
  const g = document.getElementById('gauge'); g.setAttribute('stroke-dasharray', `${(333 * .53 * gu).toFixed(1)} 400`);
  E.trows.forEach((rw, i) => { const u = spr(t, T.kpi + .2 + i * .12, .5); tf(rw, { y: (1 - u) * 16, o: t < T.drop ? 0 : clamp(u * 2) }); });
  // caption
  reveal(E.c9w, t, T.capIn, { st: .09, out: T.collapse - .2, outD: .18 });
}

function heroCard(t) {
  // take over from the pushed-in KPI card, grow to the hero frame
  const s0 = 2.6, w0 = 325 * s0, h0 = 170 * s0;
  const g = spr(t, T.heroIn, .75);
  const R = { x: lerp(960 - w0 / 2, 260, g), y: lerp(540 - h0 / 2, 240, g), w: lerp(w0, 1400, g), h: lerp(h0, 600, g) };
  E.heroVal.style.fontSize = lerp(64 * s0, 290, g).toFixed(1) + 'px';
  E.heroVal.style.top = lerp(62 * s0, 128, g).toFixed(1) + 'px';
  E.heroVal.style.left = lerp(24 * s0, 62, g).toFixed(1) + 'px';
  E.heroVal.style.color = g < .5 ? '#6FA3FF' : '#fff';
  E.heroVal.style.color = `rgb(${lerp(111, 255, g) | 0},${lerp(163, 255, g) | 0},255)`;
  // pull back into the dashboard
  const back = ex(t, T.pull, .24);
  rect(E.hero, R);
  const f = spr(t, T.flip, .85);
  const ang = 180 * f;
  const front = ang < 90;
  E.hf.style.display = front ? 'block' : 'none'; E.hb.style.display = front ? 'none' : 'block';
  tf(E.hero, { p: 2400, ry: front ? ang : ang - 180, s: (1 - bump(t, T.flip, .85) * .06) * (1 - back * .35), x: back * 260, o: (t >= T.heroIn ? 1 : 0) * (1 - back), b: back * 14 });
  // front: number and the line it draws
  const cu = ioC(pr(t, T.count, T.count + .9));
  E.heroOdo.set(7.4);
  E.deltaOdo.set(1.2 * ioC(pr(t, T.count + .55, T.count + 1.25)), 1);
  const pts = E.chartPts, L = pts.length - 1, fx = cu * L, i0 = Math.min(L - 1, Math.floor(fx)), fr = fx - i0;
  const dx = lerp(pts[i0][0], pts[i0 + 1][0], fr), dy = lerp(pts[i0][1], pts[i0 + 1][1], fr);
  document.getElementById('ccr').setAttribute('width', (dx + 20).toFixed(1));
  const dot = document.getElementById('cdot'); dot.setAttribute('cx', dx.toFixed(1)); dot.setAttribute('cy', dy.toFixed(1));
  dot.setAttribute('opacity', cu > 0 ? 1 : 0);
  const di = spr(t, T.count + .45, .55);
  tf(E.heroDelta, { y: (1 - di) * 26, o: clamp(di * 2), b: (1 - clamp(di * 1.4)) * 8 });
  // back: three queries climbing
  E.qrows.forEach((q, i) => {
    const u = spr(t, T.rows + i * .2, .55);
    tf(q.r, { y: (1 - u) * 40, o: clamp(u * 2), b: (1 - clamp(u * 1.4)) * 8 });
    const pu = ioC(pr(t, T.rows + .4 + i * .2, T.rows + 1.1 + i * .2));
    q.odo.set(lerp(q.a, q.b, pu), 1);
    const dl = spr(t, T.rows + 1.0 + i * .14, .45);
    tf(q.dl, { x: (1 - dl) * -20, o: clamp(dl * 2) });
    q.pill.style.background = i === 0 && pu > .98 ? '#1A69F0' : 'rgba(255,255,255,.08)';
  });
}

function endCard(t) {
  // logo square comes back out of the collapsing dashboard
  const L = { cx: G.endCx, cy: 540, s: 320 };
  const a = pr(t, T.collapse + .3, T.collapse + .46);
  const g = spr(t, T.collapse + .3, .7);
  const size = lerp(200, L.s, g);
  if (t >= T.collapse + .3) {
    rect(E.shape, { x: L.cx - size / 2, y: L.cy - size / 2, w: size, h: size, r: size * .25 });
    tf(E.shape, { s: 1, o: a, b: 0 });
    show(E.shLogo, 1); show(E.shBlue, 0); show(E.shGlass, 0);
    E.petals.style.width = E.petals.style.height = size.toFixed(2) + 'px';
    const A = -270 * (1 - ioC(pr(t, T.collapse + .3, T.collapse + 1.2)));
    tf(E.petals, { x: L.cx - size / 2, y: L.cy - size / 2, rz: A, s: .4 + .6 * spr(t, T.collapse + .36, .7), o: pr(t, T.collapse + .36, T.collapse + .5) });
  }
  reveal(E.tagw, t, T.tagIn, { st: .09 });
  const b = spr(t, T.cta, .6);
  tf(E.endBtn, { y: (1 - b) * 40, s: .94 + .06 * b, o: t < T.cta ? 0 : clamp(b * 2) });
  reveal(E.ebw, t, T.cta + .06, { st: .09 });
  E.site.style.left = (G.textX + E.endBtn.offsetWidth + 44) + 'px';
  reveal(E.sitew, t, T.cta + .32, { st: .09 });
  const sh = pr(t, T.cta + .95, T.cta + 1.55);
  tf(E.sheen, { x: lerp(-200, E.endBtn.offsetWidth + 40, ioC(sh)), o: sh > 0 && sh < 1 ? 1 : 0 });
}

// ---- cursor: arrives on a spring, presses, leaves fast
function cursor(t) {
  const P = [
    { t: 0, v: { x: 1500, y: 1120 } },
    { t: 6.12, d: .55, v: { x: 1300, y: 620 } },
    { t: 7.10, d: .5, v: { x: 1500, y: 1140 } },
    { t: 8.70, d: .5, v: { x: 1090, y: 862 } },
    { t: 9.58, d: .45, v: { x: 1540, y: 1140 } },
    { t: 11.10, d: .5, v: { x: 1270, y: 800 } },
    { t: 11.72, d: .45, v: { x: 1580, y: 1150 } },
  ];
  const p = chain(t, P);
  const press = bump(t, T.click1, .2) + bump(t, T.click2, .2) + bump(t, T.click3, .2);
  tf(E.cursor, { x: p.x, y: p.y, s: 1 - press * .14, o: t > 6 && t < 12 ? 1 : 0 });
}

// ---------------------------------------------------------------- cues for sound
function buildCues() {
  cue(T.lettersOut - .02, 'whoosh_soft', .7);
  for (let k = 0; k < 30; k += 3) cue(T.count0 + (T.count1 - T.count0) * (k / 30) ** .8, 'tick', .35);
  cue(T.spin0, 'whoosh_soft', .9);
  cue(T.squareIn + .2, 'pop', .6);
  cue(T.toBtn, 'whoosh_soft', .5);
  cue(T.click1, 'click', 1);
  cue(T.toCard, 'whoosh_soft', .6);
  keys(7.66, 9, .040, 1).forEach((k, i) => cue(k, 'key', .55));
  keys(8.08, 15, .032, 7).forEach((k, i) => cue(k, 'key', .55));
  keys(8.62, 10, .026, 19).forEach((k, i) => cue(k, 'key', .45));
  cue(T.click2, 'click', 1); cue(9.45, 'pop', .8);
  cue(T.toField - .04, 'whoosh_big', .8);
  keys(T.type0, 18, .046, 31).forEach(k => cue(k, 'key', .6));
  cue(T.goIn, 'whoosh_soft', .35);
  cue(T.click3, 'click', 1);
  cue(T.toRing, 'whoosh_soft', .5);
  STEPT.forEach((s, i) => cue(s + STEPD[i] - .04, 'tap', .5 + i * .06));
  cue(T.done, 'success', .9);
  cue(T.drop - .02, 'impact', 1);
  cue(T.drop, 'whoosh_big', .9);
  [0, 1, 2, 3].forEach(i => cue(T.kpi + i * .2 + .85, 'tap', .35));
  cue(T.push, 'whoosh_soft', .7);
  cue(T.flip, 'whoosh_soft', .6);
  [0, 1, 2].forEach(i => cue(T.rows + .4 + i * .2 + .7, 'tap', .45));
  cue(T.pull, 'whoosh_big', .6);
  cue(T.collapse, 'whoosh_soft', .7);
  cue(T.collapse + .4, 'pop', .6);
  cue(T.cta, 'pop', .8);
}

// ---------------------------------------------------------------- start
(async () => {
  await document.fonts.load('700 100px GS'); await document.fonts.load('500 100px GS'); await document.fonts.ready;
  E = await build();
  window.E = E;
  BG = makeBackground(document.getElementById('bg'), document.getElementById('grain'));
  // the O glyph: geometry from the font (Google Sans Bold, O outer 748 units, inner ~485, centre 358 above baseline)
  // lockups: logo + wordmark (scene 2), logo + text block (end card)
  const wmW = E.wm.offsetWidth; const lw = 340 + 64 + wmW;
  G.logoCx = 960 - lw / 2 + 170; G.wmLeft = Math.round(G.logoCx + 170 + 64);
  const tw = Math.max(E.tag.offsetWidth, E.endBtn.offsetWidth + 44 + E.site.offsetWidth); const ew = 320 + 72 + tw;
  G.endCx = 960 - ew / 2 + 160; G.textX = Math.round(G.endCx + 160 + 72);
  E.tag.style.left = G.textX + 'px'; E.endBtn.style.left = G.textX + 'px';
  O0 = { cx: 0, cy: 0, r: 1, sw: 1 }; seek(0.0001);
  const ob = E.O.getBoundingClientRect(), fs = 150;
  const base = ob.top + .84 * fs;   // inline-block, line-height 1: baseline = top + (966 - 126) / 1000 em
  O0 = { cx: ob.left + .419 * fs, cy: base - .358 * fs, r: .307 * fs, sw: .134 * fs };
  buildCues();
  seek(0);
  window.READY = true;
})();
