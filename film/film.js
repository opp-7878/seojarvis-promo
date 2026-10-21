// SEO Jarvis — preview film. Every frame is a pure function of time: seek(t).
// Timing lives in T (seconds). Re-time here once the real voice-over arrives.
'use strict';

const DUR = 30.0;
const T = {
  // S0 hook
  hookIn: 0.15, hookOut: 2.05, toLogo: 2.15,
  // S1 hero + CTA
  toCta: 2.85, heroIn: 3.0, curIn: 3.7, ctaClick: 4.75, heroOut: 4.9,
  // S2 registration
  toReg: 4.95, typeName: 5.55, typeMail: 6.2, typePass: 7.1, regClick: 7.85,
  // S3 email
  toMail: 8.35, mailClick: 9.5,
  // S4 quiz
  toQuiz: 10.05, q1: 11.0, q2: 11.55, q3: 12.1, q4: 12.65, quizClick: 13.2,
  // S5 add site
  toSite: 13.45, typeUrl: 14.0, siteClick: 15.6,
  // S6 Jarvis works
  toSteps: 15.85, step0: 16.35, stepGap: 0.6,
  // S7 dashboard (peak)
  toDash: 20.15, kpiPush: 21.2, tablePush: 22.45, rowsRoll: 22.65, pullBack: 23.75, curIn2: 23.55, themeClick: 24.4,
  // S8 outro
  toEnd: 25.45, lockup: 26.0, outroIn: 26.35, subIn: 27.45,
};

// ---------- math ----------
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, k) => a + (b - a) * k;
const outQuint = k => 1 - Math.pow(1 - k, 5);
const outCubic = k => 1 - Math.pow(1 - k, 3);
const inOut = k => k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
function stepR(tau, sp) {
  if (tau <= 0) return 0;
  const { w, z } = sp;
  if (z >= 1) { const x = w * tau; return 1 - Math.exp(-x) * (1 + x); }
  const wd = w * Math.sqrt(1 - z * z);
  return 1 - Math.exp(-z * w * tau) * (Math.cos(wd * tau) + (z * w / wd) * Math.sin(wd * tau));
}
class Track {
  constructor(v0) { this.v0 = v0; this.cur = v0; this.ev = []; }
  to(t, v, sp = SP.morph) { if (v !== this.cur) { this.ev.push([t, v - this.cur, sp]); this.cur = v; } return this; }
  at(t) { let v = this.v0; for (const [ti, d, sp] of this.ev) v += d * stepR(t - ti, sp); return v; }
}
const SP = {
  morph: { w: 11, z: 0.84 }, snap: { w: 18, z: 0.9 }, cam: { w: 6.5, z: 1 }, camSlow: { w: 2.2, z: 1 },
  drift: { w: 0.9, z: 1 }, cur: { w: 9, z: 1 }, text: { w: 20, z: 1 }, pop: { w: 26, z: 0.78 },
};
function vis(t, tin, tout, dOut = 0.14) {
  const e = stepR(t - tin, { w: 24, z: 1 });
  const x = tout == null ? 0 : clamp((t - tout) / dOut), xo = x * x;
  return { o: e * (1 - xo), b: (1 - e) * 10 + xo * 12, dy: (1 - e) * 18 - xo * 12, e, x };
}
function applyVis(el, v, extra = '') {
  el.style.opacity = v.o.toFixed(4);
  el.style.filter = v.b > 0.05 ? `blur(${v.b.toFixed(2)}px)` : 'none';
  el.style.transform = `translateY(${v.dy.toFixed(2)}px) ${extra}`;
  el.style.visibility = v.o < 0.002 ? 'hidden' : 'visible';
}
const hex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const mixC = (a, b, k) => { const A = hex(a), B = hex(b); return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], k))).join(',')})`; };

// ---------- dom ----------
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const world = $('#world'), shape = $('#shape'), shapeBlue = $('#shapeBlue');
const cursor = $('#cursor'), ripple = $('#ripple');

const ICON = {
  user: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#98A2B3" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>',
  mail: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#98A2B3" stroke-width="1.8" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M4 7l8 6 8-6"/></svg>',
  lock: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#98A2B3" stroke-width="1.8"><rect x="4.5" y="10.5" width="15" height="10" rx="2.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/></svg>',
  arrow: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  globe: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#98A2B3" stroke-width="1.7"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 3.8 5.5 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.5-3.8-9S9.5 5.5 12 3z"/></svg>',
  pin: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#98A2B3" stroke-width="1.8"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>',
  chev: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#98A2B3" stroke-width="2" stroke-linecap="round"><path d="M6 9l6 6 6-6"/></svg>',
  send: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"><path d="M21 3L3 10.5l7 2.5 2.5 7L21 3z"/><path d="M10 13l5-5"/></svg>',
};
$$('[data-icon]').forEach(e => e.innerHTML = ICON[e.dataset.icon]);
$$('[data-clone="mark"]').forEach(e => e.innerHTML = $('#pMark svg').innerHTML);

// ---------- dashboard markup ----------
const KW = [
  ['стоматология москва', '8 200', 7, 3],
  ['лечение зубов недорого', '4 100', 8, 6],
  ['удаление зуба цена', '3 600', 11, 10],
  ['имплантация зубов москва', '2 400', 22, 19],
  ['отбеливание зубов', '1 500', 27, 25],
];
const SI = {
  grid: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/></svg>',
  folder: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="4" y="7" width="16" height="13" rx="2"/><path d="M7 4h10"/></svg>',
  card: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="M3 10h18"/></svg>',
  chat: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 11.5a8 8 0 0 1-11.8 7L4 20l1.4-4A8 8 0 1 1 20 11.5z"/></svg>',
  moon: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z"/></svg>',
  sun: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
  bell: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20a2 2 0 0 0 4 0"/></svg>',
  rocket: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linejoin="round"><path d="M14 4c3 0 6 0 6 0s0 3 0 6l-7 7-6-6 7-7z"/><path d="M7 11l-3 1 0 0 3 3M13 17l-1 3-3-3"/><circle cx="15.5" cy="8.5" r="1.3"/></svg>',
  bulb: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1A69F0" stroke-width="1.8"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z"/></svg>',
};
function dashHTML(theme) {
  const rows = KW.map((r, i) => `<div class="trow" data-row="${i}"><div class="sweep" style="position:absolute; left:0; top:0; bottom:0; width:100%; pointer-events:none;"></div><div class="qq">${r[0]}</div><div class="fr">${r[1]}</div><div><span class="pos" style="opacity:.55">${r[2]}</span></div><div><span class="pos cur" data-from="${r[2]}" data-to="${r[3]}"><span class="odo"></span></span></div><div class="dyn" data-d="${r[2] - r[3]}">+${r[2] - r[3]}</div></div>`).join('');
  return `<div class="dsk ${theme}">
  <div class="side">
    <div class="brand"><div style="width:42px;height:42px;border-radius:11px;background:linear-gradient(118deg,#0B64F4,#1AA2E6);padding:8px;"><svg viewBox="6 6 20 20" style="width:100%;height:100%">${$('#pMark svg').innerHTML}</svg></div>SEO Jarvis</div>
    <div class="mi on">${SI.grid}Дашборд</div><div class="mi">${SI.folder}Проекты</div><div class="mi">${SI.card}Оплата</div><div class="mi">${SI.chat}Поддержка</div>
    <div class="idea"><div style="width:44px;height:44px;border-radius:11px;background:#fff;display:flex;align-items:center;justify-content:center;">${SI.bulb}</div><b>Есть идеи для развития сайта?</b><p>Предложите идею — мы её рассмотрим</p><div class="ib">Написать</div></div>
  </div>
  <div class="main">
    <div class="top">
      <div class="pill">${ICON.globe.replace('28', '22').replace('28', '22')}example.ru</div>
      <div class="pill">+ Поддомен/Регион</div>
      <div class="pill ok">● Активен</div>
      <div style="margin-left:auto"></div>
      <div class="pill pri">+ Добавить проект</div>
      <div class="iconbtn" data-k="${theme === 'light' ? 'moon' : 'moonD'}">${theme === 'light' ? SI.moon : SI.sun}</div>
      <div class="iconbtn">${SI.bell}</div>
      <div class="av">А</div>
    </div>
    <div class="banner"><div class="bi">${SI.rocket}</div><div><b>Тестовый период · осталось 5 дней</b><p>Продвижение уже идёт. Jarvis обновляет данные каждый день.</p></div></div>
    <div class="card kpi">
      <div style="width:470px;">
        <div class="ttl">Позиции растут</div>
        <div class="cap">Видимость сайта</div>
        <div class="vis" data-k="${theme === 'light' ? 'kpi' : 'kpiD'}"><span class="odo" data-kpi></span>%</div>
        <div class="delta">↗ +1.2% за месяц</div>
      </div>
      <div style="position:relative; width:200px; height:200px; flex:none;">
        <svg width="200" height="200" viewBox="0 0 200 200" style="position:absolute;left:0;top:0;transform:rotate(-90deg)"><circle cx="100" cy="100" r="82" fill="none" stroke="var(--dline)" stroke-width="18"/><circle class="ring" cx="100" cy="100" r="82" fill="none" stroke="#1A69F0" stroke-width="18" stroke-linecap="round" stroke-dasharray="515.2" stroke-dashoffset="515.2"/></svg>
        <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;"><div style="font-size:46px;font-weight:720;letter-spacing:-.02em;"><span class="odo" data-ring></span></div><div style="font-size:16px;color:var(--dink2)">запросов</div></div>
      </div>
      <div class="legend" style="width:290px;">
        <div><i style="background:#0B3FA8"></i>Топ-3<em data-leg="8"></em></div>
        <div><i style="background:#1A69F0"></i>4–10<em data-leg="16"></em></div>
        <div><i style="background:#5A9BF8"></i>11–50<em data-leg="94"></em></div>
        <div><i style="background:#A9C8FB"></i>51–100<em data-leg="121"></em></div>
        <div><i style="background:#8D98B3"></i>Не в топ-100<em data-leg="73"></em></div>
      </div>
      <div style="margin-left:auto; text-align:right;"><div class="cap" style="margin:0 0 8px">Средняя позиция</div><div style="font-size:64px;font-weight:720;letter-spacing:-.03em;">14.2</div><div class="delta">↗ +3.1</div></div>
    </div>
    <div class="card tbl" data-k="${theme === 'light' ? 'table' : 'tableD'}">
      <div class="tabs"><div class="tab on">В продвижении 50</div><div class="tab">Общая семантика 1 248</div><div class="tab">Рекомендуем 12</div></div>
      <div class="thead"><div>Запрос</div><div>Частота</div><div>Начальная</div><div>Текущая</div><div>Динамика</div></div>
      ${rows}
    </div>
  </div></div>`;
}
$('#dash').innerHTML = dashHTML('light') + dashHTML('dark');
const dskL = $('.dsk.light'), dskD = $('.dsk.dark');

// ---------- odometer ----------
function buildOdo(el, str) {
  el.innerHTML = '';
  el._slots = [];
  const digits = str.replace(/\D/g, '').length;
  let p = digits - 1;
  for (const ch of str) {
    if (/\d/.test(ch)) {
      const s = document.createElement('span'); s.className = 'slot';
      const st = document.createElement('span'); st.className = 'strip';
      st.innerHTML = '01234567890'.split('').map(d => `<span>${d}</span>`).join('');
      s.appendChild(st); el.appendChild(s); el._slots.push({ st, s, p: p-- });
    } else { const f = document.createElement('span'); f.className = 'fix'; f.textContent = ch; el.appendChild(f); }
  }
}
function setOdo(el, N, hideLeading = true) {
  for (const { st, s, p } of el._slots) {
    const b = Math.pow(10, p);
    const d = Math.floor(N / b) % 10, r = N % b, carry = Math.max(0, r - (b - 1));
    st.style.transform = `translateY(${(-(d + carry)).toFixed(4)}em)`;
    if (hideLeading && p > 0) {
      const op = clamp((N - b * 0.6) / (b * 0.4));
      if (s._w == null) s._w = s.offsetWidth || 0;
      s.style.opacity = op.toFixed(3);
      if (s._w) s.style.width = (s._w * op).toFixed(2) + 'px';
    }
  }
}
const ODO = {};
$$('#pSteps .odo').forEach((e, i) => { buildOdo(e, e.dataset.odo === '1248' ? '1 248' : '53'); ODO['s' + i] = e; });
for (const d of [dskL, dskD]) {
  d._kpi = d.querySelector('[data-kpi]'); buildOdo(d._kpi, '7.4');
  d._ring = d.querySelector('[data-ring]'); buildOdo(d._ring, '312');
  d._ringC = d.querySelector('.ring');
  d._leg = [...d.querySelectorAll('[data-leg]')];
  d._rows = [...d.querySelectorAll('.trow')].map(r => {
    const c = r.querySelector('.pos.cur'), o = c.querySelector('.odo');
    buildOdo(o, String(c.dataset.from).padStart(2, '0'));
    return { r, o, c, from: +c.dataset.from, to: +c.dataset.to, sweep: r.querySelector('.sweep'), dyn: r.querySelector('.dyn') };
  });
}

// ---------- shape states (world px) ----------
const ST = {
  pdf:  { x: 610, y: 540, w: 440, h: 580, r: 24, blue: 0 },
  logo: { x: 960, y: 540, w: 168, h: 168, r: 40, blue: 1 },
  cta:  { x: 960, y: 730, w: 450, h: 94, r: 18, blue: 1 },
  reg:  { x: 960, y: 540, w: 640, h: 760, r: 28, blue: 0 },
  mail: { x: 960, y: 540, w: 760, h: 560, r: 28, blue: 0 },
  quiz: { x: 960, y: 560, w: 780, h: 1160, r: 28, blue: 0 },
  site: { x: 960, y: 540, w: 780, h: 660, r: 28, blue: 0 },
  steps:{ x: 960, y: 540, w: 900, h: 800, r: 28, blue: 0 },
  dash: { x: 960, y: 540, w: 1800, h: 1000, r: 26, blue: 0 },
  end:  { x: 960, y: 430, w: 176, h: 176, r: 42, blue: 1 },
  endL: { x: 790, y: 420, w: 150, h: 150, r: 36, blue: 1 },
};
const SH = { x: new Track(ST.pdf.x), y: new Track(ST.pdf.y), w: new Track(ST.pdf.w), h: new Track(ST.pdf.h), r: new Track(ST.pdf.r), blue: new Track(0) };
function shapeTo(t, s, sp = SP.morph, blueDelay = 0) {
  const S = ST[s];
  for (const k of ['x', 'y', 'w', 'h', 'r']) SH[k].to(t, S[k], sp);
  SH.blue.to(t + blueDelay, S.blue, { w: 16, z: 1 });
}
shapeTo(T.toLogo, 'logo', { w: 10, z: 0.84 }, 0.16);
shapeTo(T.toCta, 'cta', { w: 10, z: 0.8 });
shapeTo(T.toReg, 'reg');
shapeTo(T.toMail, 'mail');
shapeTo(T.toQuiz, 'quiz');
shapeTo(T.toSite, 'site');
shapeTo(T.toSteps, 'steps');
shapeTo(T.toDash, 'dash', { w: 9, z: 0.86 });
shapeTo(T.toEnd, 'end', { w: 9, z: 0.88 }, 0.2);
shapeTo(T.lockup, 'endL', { w: 9, z: 0.9 });

// panels: [element, state, tin, tout]
const PANELS = [
  ['#pPdf', 'pdf', -1, T.toLogo + 0.2, true],
  ['#ctaLabel', 'cta', T.toCta + 0.3, T.ctaClick + 0.12],
  ['#pReg', 'reg', T.toReg + 0.22, T.toMail + 0.03],
  ['#pMail', 'mail', T.toMail + 0.06, T.toQuiz + 0.03],
  ['#pQuiz', 'quiz', T.toQuiz + 0.06, T.toSite + 0.02],
  ['#pSite', 'site', T.toSite + 0.04, T.toSteps + 0.03],
  ['#pSteps', 'steps', T.toSteps + 0.06, T.toDash + 0.02],
  ['#dash', 'dash', T.toDash + 0.08, T.toEnd + 0.22, true],
].map(([s, st, a, b, sc]) => ({ el: $(s), st, tin: a, tout: b, sc: !!sc }));
$('#ctaLabel').style.width = ST.cta.w + 'px'; $('#ctaLabel').style.height = ST.cta.h + 'px';

// ---------- measure click targets in world coords ----------
const P = {};
(function measure() {
  world.style.transform = 'none';
  for (const pn of PANELS) {
    const S = ST[pn.st];
    Object.assign(shape.style, { left: S.x - S.w / 2 + 'px', top: S.y - S.h / 2 + 'px', width: S.w + 'px', height: S.h + 'px' });
    pn.el.style.visibility = 'visible'; pn.el.style.transform = 'none'; pn.el.style.left = '0px'; pn.el.style.top = '0px';
    const pr = pn.el.getBoundingClientRect();
    pn.el.querySelectorAll('[data-k]').forEach(e => {
      const r = e.getBoundingClientRect();
      P[e.dataset.k] = { x: S.x - S.w / 2 + (r.left - pr.left) + r.width / 2, y: S.y - S.h / 2 + (r.top - pr.top) + r.height / 2, w: r.width, h: r.height };
    });
    pn.el.style.visibility = 'hidden';
  }
  P.cta = { x: ST.cta.x, y: ST.cta.y, w: ST.cta.w, h: ST.cta.h };
})();

// ---------- camera ----------
const CAM = { x: new Track(960), y: new Track(540), lz: new Track(0) };
function cam(t, x, y, z, sp = SP.cam) { CAM.x.to(t, x, sp); CAM.y.to(t, y, sp); CAM.lz.to(t, Math.log(z), sp); }
CAM.x.v0 = CAM.x.cur = 1010; CAM.lz.v0 = CAM.lz.cur = Math.log(1.06);
cam(0, 1000, 540, 1.1, SP.drift);                          // S0 slow push
cam(T.toLogo, 960, 540, 1.55, { w: 5, z: 1 });
cam(T.toCta, 960, 530, 1.0, { w: 5.5, z: 1 });            // pull back reveals the hero
cam(T.toCta + 0.6, 960, 520, 1.05, SP.drift);
cam(T.toReg, 960, 540, 1.0, SP.cam);
cam(T.typeName - 0.35, 960, P.regName.y + 40, 1.3);
cam(T.typeMail - 0.3, 960, P.regMail.y + 20, 1.3);
cam(T.typePass - 0.3, 960, P.regPass.y + 20, 1.3);
cam(T.regClick - 0.6, 960, P.regBtn.y - 80, 1.18);
cam(T.toMail, 960, 540, 1.16);
cam(T.toQuiz, 960, 560, 0.9);
cam(T.q1 - 0.45, 960, P.q1.y + 20, 1.22);
cam(T.q2 - 0.4, 960, P.q2.y + 20, 1.22);
cam(T.q3 - 0.4, 960, P.q3.y + 20, 1.22);
cam(T.q4 - 0.4, 960, P.q4.y + 30, 1.22);
cam(T.quizClick - 0.35, 960, P.quizBtn.y - 120, 1.12);
cam(T.toSite + 0.05, P.siteUrl.x, P.siteUrl.y - 10, 1.85, { w: 7, z: 1 });       // extreme close-up
cam(T.typeUrl + 1.05, 960, 560, 1.18, { w: 6, z: 1 });
cam(T.toSteps, 960, 540, 1.14);
cam(T.toSteps + 0.4, 960, 540, 1.06, SP.camSlow);
cam(T.toDash, 960, 540, 1.0, { w: 8, z: 1 });
cam(T.kpiPush - 0.2, P.kpi.x + 120, P.kpi.y + 10, 1.75, { w: 6, z: 1 });
cam(T.tablePush - 0.25, 1100, (ST.dash.y + ST.dash.h / 2 + 12) - 540 / 1.25, 1.25, { w: 6, z: 1 });
cam(T.pullBack, 960, 540, 1.0, { w: 6, z: 1 });
cam(T.toEnd, 960, 540, 1.0);
cam(T.toEnd + 0.3, 960, 560, 1.14, { w: 4, z: 1 });
cam(T.toEnd + 1.4, 960, 560, 1.19, SP.drift);

// ---------- cursor ----------
const CUR = { x: new Track(1760), y: new Track(1180) };
function curTo(t, k, dx = 0, dy = 0, sp = SP.cur) { const p = typeof k === 'string' ? P[k] : k; CUR.x.to(t, p.x + dx, sp); CUR.y.to(t, p.y + dy, sp); }
const CLICKS = [
  [T.ctaClick, 'cta'], [T.regClick, 'regBtn'], [T.mailClick, 'mailBtn'],
  [T.q1, 'q1'], [T.q2, 'q2'], [T.q3, 'q3'], [T.q4, 'q4'], [T.quizClick, 'quizBtn'],
  [T.siteClick, 'siteBtn'], [T.themeClick, 'moon'],
];
curTo(T.curIn, 'cta', 30, 12);
curTo(T.toReg + 0.2, { x: 1380, y: 700 });
curTo(T.regClick - 0.6, 'regBtn', 40, 8);
curTo(T.toMail + 0.35, 'mailBtn', -40, 8);
curTo(T.toQuiz + 0.4, 'q1', 30, 6);
curTo(T.q2 - 0.42, 'q2', 20, 6); curTo(T.q3 - 0.42, 'q3', 30, 6); curTo(T.q4 - 0.42, 'q4', 10, 6);
curTo(T.quizClick - 0.45, 'quizBtn', 60, 8);
curTo(T.toSite + 0.4, { x: 1300, y: 760 });
curTo(T.siteClick - 0.55, 'siteBtn', 50, 8);
curTo(T.toSteps + 0.2, { x: 1500, y: 980 });
curTo(T.curIn2 - 0.4, { x: 1500, y: 700 }, 0, 0, { w: 50, z: 1 });
curTo(T.curIn2, 'moon', 4, 6, { w: 7.5, z: 1 });
const CUR_ON = [[T.curIn - 0.05, T.toSteps + 0.25], [T.curIn2 - 0.05, T.toEnd]];

// ---------- helpers ----------
function wordsAt(container, t, t0, step, tout, sp = { w: 17, z: 1 }) {
  const ws = container._w || (container._w = [...container.querySelectorAll('.w > span')]);
  ws.forEach((s, i) => {
    const e = stepR(t - (t0 + i * step), sp);
    const x = tout == null ? 0 : clamp((t - tout - i * 0.025) / 0.22), xo = x * x;
    s.style.transform = `translateY(${((1 - e) * 108 - xo * 30).toFixed(2)}%) rotate(${((1 - e) * 6).toFixed(2)}deg)`;
    s.style.opacity = (Math.min(1, e * 1.6) * (1 - xo)).toFixed(3);
    s.style.filter = xo > 0.01 ? `blur(${(xo * 14).toFixed(1)}px)` : 'none';
  });
}
function typeInto(el, str, t0, rate, focusUntil, t) {
  const n = clamp(Math.floor((t - t0) / rate) + 1, 0, str.length);
  const v = el.querySelector('.val');
  const focused = t >= t0 - 0.2 && t < focusUntil;
  const blink = (t > t0 + str.length * rate + 0.05) ? (Math.floor(t * 2.6) % 2 === 0) : true;
  v.innerHTML = (t < t0 ? '' : str.slice(0, n)) + (focused && blink ? '<span class="caret"></span>' : '');
  el.classList.toggle('focus', focused);
}
function press(t, tc) { return 1 - 0.06 * Math.exp(-Math.pow((t - tc - 0.03) / 0.07, 2)); }
function chipState(el, t, tc) {
  const e = stepR(t - tc, { w: 30, z: 1 });
  el.style.background = mixC('#ffffff', '#EAF1FF', e);
  el.style.borderColor = mixC('#E3E8F1', '#1A69F0', e);
  el.style.color = mixC('#3A4458', '#1A69F0', e);
  el.style.transform = `scale(${press(t, tc).toFixed(4)})`;
}

// grain
const g = $('#grain');
{
  const tile = document.createElement('canvas'); tile.width = tile.height = 256;
  const tx = tile.getContext('2d'), gi = tx.createImageData(256, 256);
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < gi.data.length; i += 4) { const v = rnd() * 255; gi.data[i] = gi.data[i + 1] = gi.data[i + 2] = v; gi.data[i + 3] = 255; }
  tx.putImageData(gi, 0, 0);
  g.width = 2176; g.height = 1336; g.style.width = '2176px'; g.style.height = '1336px';
  const gctx = g.getContext('2d'); gctx.fillStyle = gctx.createPattern(tile, 'repeat'); gctx.fillRect(0, 0, 2176, 1336);
}

// ---------- seek ----------
const hook = $('#hook'), hero = $('#hero'), eyebrow = $('#eyebrow'), outro = $('#outro'), outroSub = $('#outroSub'), wordmark = $('#wordmark');
const pMark = $('#pMark');
const stepsEls = $$('#steps .step');
const STEP_TXT = ['Определяем нишу', 'Собираем семантику', 'Расставляем приоритеты', 'Снимаем позиции', 'Технический аудит', 'Рекомендации'];
const CHECK = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';

window.seek = function seek(t) {
  // background drift
  $('#bloom').style.transform = `translate(${(Math.sin(t * 0.21) * 40).toFixed(1)}px, ${(Math.cos(t * 0.17) * 26).toFixed(1)}px) scale(${(1 + 0.04 * Math.sin(t * 0.3)).toFixed(4)})`;
  $('#bloom2').style.transform = `translate(${(Math.cos(t * 0.19) * -60).toFixed(1)}px, ${(Math.sin(t * 0.23) * 30).toFixed(1)}px)`;
  $('#lines').style.transform = `translateX(${(-t * 6).toFixed(1)}px)`;
  const f = Math.floor(t * 60); g.style.transform = `translate(${-((f * 73) % 128)}px, ${-((f * 151) % 128)}px)`;

  // camera
  const cz = Math.exp(CAM.lz.at(t)), cx = CAM.x.at(t), cy = CAM.y.at(t);
  world.style.transform = `translate(960px,540px) scale(${cz.toFixed(5)}) translate(${(-cx).toFixed(2)}px,${(-cy).toFixed(2)}px)`;

  // S0 hook text
  wordsAt(hook, t, T.hookIn, 0.09, T.hookOut);
  hook.querySelectorAll('.w > span')[3].style.color = '#6EA1FF';
  hook.style.visibility = t > T.hookOut + 0.5 ? 'hidden' : 'visible';

  // S1 hero
  const ev = vis(t, T.heroIn - 0.05, T.heroOut, 0.18); applyVis(eyebrow, ev);
  wordsAt(hero, t, T.heroIn, 0.09, T.heroOut);
  hero.style.visibility = (t < T.heroIn - 0.1 || t > T.heroOut + 0.5) ? 'hidden' : 'visible';

  // S8 outro
  const wm = vis(t, T.lockup + 0.12, null);
  applyVis(wordmark, wm, `translateX(${((1 - wm.e) * -40).toFixed(1)}px)`);
  wordmark.style.left = (ST.endL.x + ST.endL.w / 2 + 34) + 'px';
  wordsAt(outro, t, T.outroIn, 0.12);
  outro.style.visibility = t < T.outroIn - 0.1 ? 'hidden' : 'visible';
  wordsAt(outroSub, t, T.subIn, 0.14);
  outroSub.style.visibility = t < T.subIn - 0.1 ? 'hidden' : 'visible';

  // the shape
  let w = SH.w.at(t), h = SH.h.at(t), x = SH.x.at(t), y = SH.y.at(t);
  const pressS = press(t, T.ctaClick);
  if (t > T.ctaClick - 0.2 && t < T.ctaClick + 0.3) { w *= pressS; h *= pressS; }
  Object.assign(shape.style, { left: (x - w / 2).toFixed(2) + 'px', top: (y - h / 2).toFixed(2) + 'px', width: w.toFixed(2) + 'px', height: h.toFixed(2) + 'px', borderRadius: SH.r.at(t).toFixed(2) + 'px' });
  shapeBlue.style.opacity = clamp(SH.blue.at(t)).toFixed(4);
  shape.style.background = t > T.toDash ? '#F5F7FB' : '#fff';

  // panels (centered in the shape, swap with blur)
  for (const pn of PANELS) {
    const v = vis(t, pn.tin, pn.tout);
    const pw = pn.el.offsetWidth, ph = pn.el.offsetHeight;
    pn.el.style.left = ((w - pw) / 2).toFixed(2) + 'px'; pn.el.style.top = ((h - ph) / 2).toFixed(2) + 'px';
    const k = pn.sc ? Math.min(1, w / pw, h / ph) : 1;   // shrink content together with the shape
    applyVis(pn.el, v, k < 0.999 ? `scale(${k.toFixed(4)})` : '');
  }
  // logo mark
  const mv1 = vis(t, T.toLogo + 0.12, T.toCta + 0.05), mv2 = vis(t, T.toEnd + 0.22, null);
  const mv = mv1.o > mv2.o ? mv1 : mv2;
  const ms = Math.min(w, h) * 0.66;
  Object.assign(pMark.style, { width: ms + 'px', height: ms + 'px', left: (w - ms) / 2 + 'px', top: (h - ms) / 2 + 'px' });
  applyVis(pMark, mv, `rotate(${((1 - mv.e) * -40).toFixed(1)}deg) scale(${(0.6 + 0.4 * mv.e).toFixed(3)})`);

  // S2 registration
  typeInto($('[data-k=regName]'), 'Александр', T.typeName, 0.055, T.typeMail - 0.05, t);
  typeInto($('[data-k=regMail]'), 'alex@example.ru', T.typeMail, 0.05, T.typePass - 0.05, t);
  typeInto($('[data-k=regPass]'), '••••••••', T.typePass, 0.04, T.regClick - 0.1, t);
  btnState($('[data-k=regBtn]'), t, T.regClick, 'Создать аккаунт', 'Аккаунт создан');

  // S3 mail
  btnState($('[data-k=mailBtn]'), t, T.mailClick, 'Подтвердить email', 'Email подтверждён', true);

  // S4 quiz
  ['q1', 'q2', 'q3', 'q4'].forEach(k => chipState($(`[data-k=${k}]`), t, T[k]));
  $('[data-k=quizBtn]').style.transform = `scale(${press(t, T.quizClick).toFixed(4)})`;

  // S5 site
  typeInto($('[data-k=siteUrl]'), 'https://example.ru', T.typeUrl, 0.05, T.siteClick - 0.05, t);
  $('[data-k=siteBtn]').style.transform = `scale(${press(t, T.siteClick).toFixed(4)})`;

  // S6 steps
  let done = 0;
  stepsEls.forEach((el, i) => {
    const ts = T.step0 + i * T.stepGap, td = ts + 0.5;
    const ic = el.querySelector('.sicon'), ti = el.querySelector('.stitle'), sv = el.querySelector('.sval');
    if (t < ts) { ic.innerHTML = ''; ic.style.background = 'transparent'; ic.style.borderColor = '#D9E1EE'; ti.style.color = '#9AA4B5'; ti.style.background = 'none'; }
    else if (t < td) {
      ic.style.background = 'transparent'; ic.style.borderColor = '#D9E1EE';
      ic.innerHTML = `<svg width="46" height="46" viewBox="0 0 46 46" style="position:absolute;left:-2.5px;top:-2.5px;transform:rotate(${(t * 520) % 360}deg)"><circle cx="23" cy="23" r="20.5" fill="none" stroke="#1A69F0" stroke-width="3" stroke-linecap="round" stroke-dasharray="34 200"/></svg>`;
      const sh = ((t - ts) / 0.5) * 260 - 80;   // shimmer sweep across the active title
      ti.style.background = `linear-gradient(100deg, #0E1525 ${sh - 30}%, #7FB0FF ${sh}%, #0E1525 ${sh + 30}%)`;
      ti.style.webkitBackgroundClip = 'text'; ti.style.color = 'transparent';
    } else {
      const e = stepR(t - td, SP.pop);
      ic.style.background = '#1A69F0'; ic.style.borderColor = '#1A69F0';
      ic.innerHTML = `<div style="transform:scale(${(0.4 + 0.6 * e).toFixed(3)})">${CHECK}</div>`;
      ti.style.background = 'none'; ti.style.color = '#0E1525'; done++;
    }
    const v = vis(t, ts + 0.15, null); applyVis(sv, v);
  });
  const prog = clamp((t - T.step0) / (T.stepGap * 5 + 0.5));
  $('#bar').style.width = (inOut(prog) * 100).toFixed(2) + '%';
  $('#pct').textContent = Math.round(inOut(prog) * 100) + '%';
  setOdo(ODO.s0, 1248 * outQuint(clamp((t - (T.step0 + T.stepGap + 0.1)) / 1.1)));
  setOdo(ODO.s1, 53 * outQuint(clamp((t - (T.step0 + T.stepGap * 4 + 0.1)) / 0.9)));

  // S7 dashboard
  const kp = outQuint(clamp((t - (T.toDash + 0.45)) / 1.6));
  const rp = outCubic(clamp((t - (T.toDash + 0.35)) / 1.4));
  for (const d of [dskL, dskD]) {
    setOdo(d._kpi, 74 * kp, false);
    setOdo(d._ring, 312 * rp);
    d._ringC.setAttribute('stroke-dashoffset', (515.2 * (1 - 0.77 * rp)).toFixed(2));
    d._leg.forEach((e, i) => { const k = outCubic(clamp((t - (T.toDash + 0.5 + i * 0.08)) / 0.9)); e.textContent = Math.round(+e.dataset.leg * k); });
    d._rows.forEach((R, i) => {
      const t0 = T.rowsRoll + i * 0.13;
      const k = outCubic(clamp((t - t0) / 0.7));
      setOdo(R.o, lerp(R.from, R.to, k), true);
      R.c.classList.toggle('top', k > 0.5 && R.to <= 10);
      const sw = clamp((t - t0) / 0.9);
      R.sweep.style.background = sw > 0 && sw < 1 ? `linear-gradient(90deg, transparent ${sw * 140 - 40}%, rgba(26,105,240,.16) ${sw * 140 - 20}%, transparent ${sw * 140}%)` : 'none';
      const dv = vis(t, t0 + 0.45, null); R.dyn.style.opacity = dv.o.toFixed(3); R.dyn.style.transform = `translateX(${((1 - dv.e) * -14).toFixed(1)}px)`;
    });
  }
  // theme flood from the moon button
  const mx = P.moon.x - (ST.dash.x - ST.dash.w / 2), my = P.moon.y - (ST.dash.y - ST.dash.h / 2);
  const fr = stepR(t - (T.themeClick + 0.04), { w: 5.5, z: 1 }) * 2150;
  dskD.style.clipPath = `circle(${fr.toFixed(1)}px at ${mx.toFixed(1)}px ${my.toFixed(1)}px)`;
  dskD.style.visibility = fr < 1 ? 'hidden' : 'visible';
  const mb = dskL.querySelector('[data-k=moon]'); mb.style.transform = `scale(${press(t, T.themeClick).toFixed(4)})`;

  // cursor (screen space)
  const on = CUR_ON.reduce((a, [a0, a1]) => Math.max(a, stepR(t - a0, { w: 18, z: 1 }) * (1 - clamp((t - a1) / 0.18))), 0);
  const wx = CUR.x.at(t), wy = CUR.y.at(t);
  const sx = (wx - cx) * cz + 960, sy = (wy - cy) * cz + 540;
  const vx = (CUR.x.at(t + 1 / 120) - CUR.x.at(t - 1 / 120)) * 60;
  let ps = 1; for (const [tc] of CLICKS) ps *= 1 - 0.18 * Math.exp(-Math.pow((t - tc) / 0.05, 2));
  cursor.style.transform = `translate(${(sx - 6).toFixed(2)}px, ${(sy - 4).toFixed(2)}px) rotate(${clamp(-vx * 0.004, -12, 12).toFixed(2)}deg) scale(${(ps * 1.05).toFixed(4)})`;
  cursor.style.opacity = on.toFixed(3);
  // ripple
  let rp2 = null; for (const [tc] of CLICKS) if (t >= tc && t < tc + 0.45) rp2 = (t - tc) / 0.45;
  if (rp2 != null && on > 0.5) {
    ripple.style.opacity = ((1 - rp2) * 0.8).toFixed(3);
    ripple.style.transform = `translate(${sx.toFixed(1)}px, ${sy.toFixed(1)}px) scale(${(0.25 + outCubic(rp2) * 0.9).toFixed(3)})`;
  } else ripple.style.opacity = 0;

  // fade in from first frame? No: frame 0 is a full composition (cover). Gentle fade-out at the very end is not used either.
};

function btnState(el, t, tc, a, b, green = false) {
  el.style.transform = `scale(${press(t, tc).toFixed(4)})`;
  const k = clamp((t - tc - 0.12) / 0.001);
  const label = el.querySelector('.bl');
  if (t < tc + 0.1) { label.textContent = a; el.style.background = ''; }
  else if (t < tc + 0.45 && !green) {
    label.innerHTML = `<svg width="30" height="30" viewBox="0 0 30 30" style="transform:rotate(${(t * 540) % 360}deg)"><circle cx="15" cy="15" r="12" fill="none" stroke="rgba(255,255,255,.95)" stroke-width="3.2" stroke-linecap="round" stroke-dasharray="26 100"/></svg>`;
  } else {
    label.innerHTML = `<span style="display:inline-flex;align-items:center;gap:10px">${CHECK}${b}</span>`;
    if (green) el.style.background = 'linear-gradient(90deg,#22C55E,#16A34A)';
  }
  const arrow = el.querySelector('[data-icon=arrow]'); if (arrow) arrow.style.display = t < tc + 0.1 ? '' : 'none';
}

// export cues for the sound pass
window.CUES = {
  clicks: CLICKS.map(c => c[0]),
  whoosh: [T.toLogo, T.toCta, T.toReg, T.toMail, T.toQuiz, T.toSite, T.toSteps, T.toEnd],
  peak: T.toDash,
  type: [[T.typeName, 9, 0.055], [T.typeMail, 15, 0.05], [T.typePass, 8, 0.04], [T.typeUrl, 18, 0.05]],
  ticks: [0, 1, 2, 3, 4, 5].map(i => T.step0 + i * T.stepGap + 0.5),
  theme: T.themeClick,
  dur: DUR,
};
window.DUR = DUR;
document.fonts.ready.then(() => { seek(0); window.READY = true; });
