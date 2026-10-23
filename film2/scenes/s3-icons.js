// Сцена 3: иконки разделов вылетают, влетают в заголовок, камера пролетает в букву «о».
(function () {
  injectCSS(`
    .s3 .ic { position:absolute; left:0; top:0; width:0; height:0; opacity:0; }
    .s3 .ic .st { position:absolute; left:0; top:0; width:0; height:0; }
    .s3 .ic .tile { position:absolute; left:-64px; top:-64px; width:128px; height:128px; border-radius:34px; }
    .s3 .ic .tile::after { content:""; position:absolute; inset:0; border-radius:34px; pointer-events:none;
      background:linear-gradient(180deg, rgba(255,255,255,0.26) 0%, rgba(255,255,255,0) 46%);
      box-shadow: inset 0 1.5px 0 rgba(255,255,255,0.55), inset 0 0 0 1px rgba(255,255,255,0.10); }
    .s3 .ic svg { position:absolute; left:34px; top:34px; width:60px; height:60px; fill:none; stroke:#fff; stroke-width:2.3;
      stroke-linecap:round; stroke-linejoin:round; }
    .s3 .headline .w { will-change:auto; }
  `);

  const G = {
    dash: '<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>',
    trend: '<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
    pin: '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
    spark: '<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/>',
    gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/>',
    cap: '<path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>',
  };
  // x,y — центр; rot — конечный угол; sc — размер; ent — направление входа (из-за какого края/угла); sh — тень
  const ICONS = [
    { g: 'dash',  c: ['#1A69F0', '#3B8BFF'], x: 262, y: 202, rot: -5, sc: 1.06, ent: [-1, -0.8], ph: 0.0 },
    { g: 'trend', c: ['#12B76A', '#32D583'], x: 1658, y: 202, rot: 5, sc: 1.06, ent: [1, -0.8], ph: 1.1 },
    { g: 'users', c: ['#7A5AF8', '#9E77ED'], x: 262, y: 878, rot: 5, sc: 1.06, ent: [-1, 0.8], ph: 2.2 },
    { g: 'shield', c: ['#0BA5EC', '#36BFFA'], x: 1658, y: 878, rot: -5, sc: 1.06, ent: [1, 0.8], ph: 3.3 },
    { g: 'link',  c: ['#F79009', '#FDB022'], x: 640, y: 140, rot: 4, sc: 0.9, ent: [-0.2, -1], ph: 4.4 },
    { g: 'pin',   c: ['#F04438', '#F97066'], x: 1280, y: 140, rot: -4, sc: 0.9, ent: [0.2, -1], ph: 5.5 },
    { g: 'spark', c: ['#6172F3', '#EE46BC'], x: 168, y: 540, rot: -6, sc: 0.94, ent: [-1, 0], ph: 0.7 },
    { g: 'gift',  c: ['#EE46BC', '#F670C7'], x: 1752, y: 540, rot: 6, sc: 0.94, ent: [1, 0], ph: 1.8 },
    { g: 'cap',   c: ['#2E5BFF', '#5B7CFF'], x: 960, y: 906, rot: 3, sc: 0.92, ent: [0, 1], ph: 2.9 },
  ];
  const A0 = 0.15, A_STEP = 0.2, A_DUR = 0.6;       // фаза A
  const B0 = 2.45, B_STEP = 0.115, B_DUR = 0.35;    // фаза B
  const B_ORDER = [0, 4, 5, 1, 7, 3, 8, 2, 6];      // по кругу по часовой
  const C0 = 3.72, C1 = 4.75, S_END = 90;
  const GROW = 0.45 / 9, STEP_T = 0.12;

  let R = {};
  const hexA = (h, a) => { const n = parseInt(h.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };
  const sstep = k => k * k * (3 - 2 * k);

  SCENES.add('s3', {
    dur: 5.0,
    build(root) {
      R.root = root;
      R.h = makeHeadline(root);
      R.h.node.style.transformOrigin = '0 0';
      // центр буквы «о» (первая «о» в «продвижения»)
      const wd = R.h.words.find(w => w.textContent === 'продвижения');
      const tn = wd.firstChild, rg = document.createRange();
      rg.setStart(tn, 2); rg.setEnd(tn, 3);
      const r = rg.getBoundingClientRect();
      const fs = 104, base = r.top + 0.969 * fs;            // базовая линия Inter
      R.o = { x: r.left + (r.width + 0.035 * fs) / 2, y: base - 0.546 * fs / 2 - 2.1 };
      R.hr = rectOf(R.h.node);
      R.ic = ICONS.map((d, i) => {
        const e = el('div', 'ic', root);
        const st = el('div', 'st', e);
        const tile = el('div', 'tile', st,
          `<svg viewBox="0 0 24 24">${G[d.g]}</svg>`);
        tile.style.background = `linear-gradient(135deg, ${d.c[0]} 0%, ${d.c[1]} 100%)`;
        tile.style.boxShadow = `0 18px 40px -12px ${hexA(d.c[0], 0.45)}`;
        const rnd = rng(31 + i * 17);
        const len = Math.hypot(d.ent[0], d.ent[1]), dir = [d.ent[0] / len, d.ent[1] / len];
        // точка старта: дальше от кадра на 500–700 px
        let L = 0; const m = 500 + rnd() * 200;
        while (true) {
          const x = d.x + dir[0] * L, y = d.y + dir[1] * L;
          if (x < -m || x > W + m || y < -m || y > H + m) break;
          L += 10;
        }
        const aT = A0 + i * A_STEP;
        const bi = B_ORDER.indexOf(i);
        return { d, e, st, tile, dir, start: [d.x + dir[0] * L, d.y + dir[1] * L],
          bowA: (i % 2 ? 1 : -1) * (80 + rnd() * 50), rot0: d.rot + (i % 2 ? 1 : -1) * (28 + rnd() * 14),
          aT, bT: B0 + bi * B_STEP, hit: B0 + bi * B_STEP + B_DUR, bi,
          bowB: (i % 2 ? -1 : 1) * (110 + rnd() * 60),
          tgt: [(rnd() - 0.5) * 520, (rnd() - 0.5) * 110] };
      });
    },

    seek(t) {
      // ----- масштаб заголовка: ступени + пролёт -----
      let s = 1;
      R.ic.forEach(o => { s += GROW * sstep(prog(t, o.hit, o.hit + STEP_T)); });
      s += (S_END - 1.45) * E.inExpo(prog(t, C0, C1));
      let pulse = 0;
      R.ic.forEach(o => { pulse += bump(t, o.hit, 0.18); });
      s *= 1 + 0.02 * Math.min(1, pulse);
      const w = E.inOutCubic(prog(t, 3.6, 4.55));
      const Cx = 960, Cy = 540;
      const qbx = Cx + s * (R.o.x - Cx), qby = Cy + s * (R.o.y - Cy);
      const qx = lerp(qbx, 960, w), qy = lerp(qby, 540, w);
      const top = R.hr.y, tx = qx - s * R.o.x, ty = (qy - top) - s * (R.o.y - top);
      R.h.node.style.transform = (s === 1 && w === 0) ? 'none' : `translate(${tx.toFixed(3)}px,${ty.toFixed(3)}px) scale(${s.toFixed(5)})`;
      const sOf = tt => { // масштаб-только-ступени (для «живой» цели иконок)
        let v = 1; R.ic.forEach(o => { v += GROW * sstep(prog(tt, o.hit, o.hit + STEP_T)); }); return v; };

      // ----- иконки -----
      R.ic.forEach(o => {
        const d = o.d;
        const hover = tt => {
          const a = E.outCubic(prog(tt, o.aT + A_DUR, o.aT + A_DUR + 0.4));
          return [3 * a * Math.sin(tt * 1.9 + d.ph), 3 * a * Math.sin(tt * 1.5 + d.ph * 1.7 + 1)];
        };
        const A = (tt) => { // позиция/угол/масштаб/скорость в фазе A
          const k = prog(tt, o.aT, o.aT + A_DUR), e = E.springSoft(k);
          const bow = Math.sin(Math.PI * Math.min(1, k)) * (1 - 0.0) * o.bowA * (1 - E.outCubic(k) * 0.0);
          const px_ = -o.dir[1], py_ = o.dir[0];
          const x = lerp(o.start[0], d.x, e) + px_ * bow * (1 - e) , y = lerp(o.start[1], d.y, e) + py_ * bow * (1 - e);
          return { x, y, rot: lerp(o.rot0, d.rot, e), sc: d.sc * lerp(0.82, 1, Math.min(1, e)), op: 1 };
        };
        const Bp = (tt) => { // позиция в фазе B
          const hv = hover(o.bT);
          const sx = d.x + hv[0], sy = d.y + hv[1];
          const k = prog(tt, o.bT, o.bT + B_DUR), e = E.inCubic(k);
          const sc = sOf(tt);
          const ex = 960 + (sc) * o.tgt[0], ey = 540 + sc * o.tgt[1];
          const dx = ex - sx, dy = ey - sy, L = Math.hypot(dx, dy) || 1;
          const bow = Math.sin(Math.PI * k) * o.bowB;
          const pre = E.outCubic(prog(tt, o.bT - 0.14, o.bT));  // «замах»
          return { x: lerp(sx, ex, e) - dy / L * bow, y: lerp(sy, ey, e) + dx / L * bow,
            rot: lerp(d.rot, d.rot + (o.bi % 2 ? 70 : -70), e), sc: d.sc * (1 + 0.08 * pre * (1 - k)) * lerp(1, 0.15, e),
            op: 1 - E.inQuad(prog(k, 0.75, 1)) };
        };
        const at = tt => {
          if (tt < o.bT) { const a = A(tt), h = tt > o.aT ? hover(tt) : [0, 0]; a.x += h[0]; a.y += h[1]; return a; }
          return Bp(tt);
        };
        const p = at(t);
        const visible = t >= o.aT - 0.001 && t < o.hit;
        o.e.style.opacity = visible ? p.op.toFixed(3) : 0;
        if (!visible) return;
        const dt = 0.008, p0 = at(t - dt), p1 = at(t + dt);
        const vx = (p1.x - p0.x) / (2 * dt), vy = (p1.y - p0.y) / (2 * dt), v = Math.hypot(vx, vy);
        const blur = Math.min(14, v / 650), str = 1 + 0.25 * Math.min(1, v / 5500);
        const ang = Math.atan2(vy, vx) * 180 / Math.PI;
        o.e.style.transform = `translate(${p.x.toFixed(2)}px,${p.y.toFixed(2)}px)`;
        o.st.style.transform = blur > 0.3 ? `rotate(${ang.toFixed(2)}deg) scale(${str.toFixed(3)},${(1 / Math.sqrt(str)).toFixed(3)}) rotate(${(-ang).toFixed(2)}deg)` : 'none';
        o.tile.style.transform = `rotate(${p.rot.toFixed(2)}deg) scale(${p.sc.toFixed(4)})`;
        o.tile.style.filter = blur > 0.3 ? `blur(${blur.toFixed(2)}px)` : 'none';
      });

      R.root.style.opacity = (1 - E.inOutCubic(prog(t, 4.7, 5.0))).toFixed(3);
    },
  });
})();
