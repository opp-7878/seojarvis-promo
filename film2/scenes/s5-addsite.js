// Сцена 5 — «Добавьте сайт»: карточка онбординга, ввод адреса, выбор региона, кнопка → плашка загрузки (стык со сценой 6).
(function () {
  injectCSS(`
  .s5 .cam { position:absolute; left:0; top:0; width:1920px; height:1080px; transform-origin:0 0; }
  .s5 .card { position:absolute; left:575px; top:166px; width:770px; padding:50px 49px 50px; border-radius:24px;
    transform-origin:50% 50%; will-change:transform, filter, opacity; }
  .s5 .it { will-change:transform, opacity; }
  .s5 h1 { font-weight:700; font-size:44px; line-height:51px; letter-spacing:-0.022em; color:#0E1322; }
  .s5 .sub { margin-top:16px; font-size:22.5px; line-height:33.5px; color:#6B7385; }
  .s5 .lab { margin-top:35px; font-size:21px; line-height:26px; font-weight:500; color:#4A5163; }
  .s5 .lab.l2 { margin-top:30px; }
  .s5 .fld { margin-top:9px; height:67px; border:1.5px solid #D9DEE7; border-radius:15px; background:#fff; position:relative;
    display:flex; align-items:center; padding:0 20px; font-size:23px; color:#12182A; white-space:nowrap; }
  .s5 .fld svg.ic { width:26px; height:26px; flex:none; margin-right:17px; }
  .s5 .fld .ph { color:#9AA1AF; position:absolute; left:63px; }
  .s5 .fld .tx { position:relative; }
  .s5 .fld .caret { width:2.5px; height:31px; margin-left:1px; background:var(--blue); flex:none; }
  .s5 .fld .chev { margin-left:auto; width:24px; height:24px; margin-right:-2px; transform-origin:50% 50%; }
  .s5 .hint { margin-top:14px; font-size:17.5px; line-height:22px; color:#9AA1AF; }
  .s5 .g2 { position:relative; z-index:5; }
  .s5 .menu { position:absolute; left:0; right:0; top:84px; padding:6px; background:#fff; border-radius:17px; z-index:20;
    box-shadow:0 0 0 1px rgba(16,24,40,0.07), 0 4px 10px rgba(16,24,40,0.06), 0 22px 48px -8px rgba(16,24,40,0.22);
    transform-origin:50% 0; will-change:transform, opacity; }
  .s5 .mi { height:50px; border-radius:11px; display:flex; align-items:center; padding:0 18px; font-size:22px; color:#1C2233; }
  .s5 .btn { margin-top:26px; height:74px; border-radius:15px; font-size:23px; font-weight:600; position:relative; }
  .s5 .btn svg, .s5 .mlab svg { width:1.05em; height:1.05em; flex:none; }
  .s5 .trial { margin-top:23px; display:flex; align-items:center; justify-content:center; gap:10px; font-size:19.5px; line-height:24px; color:#98A0AE; }
  .s5 .trial svg { width:21px; height:21px; }
  .s5 .morph { position:absolute; left:0; top:0; z-index:50; display:none; will-change:left,top,width,height; }
  .s5 .morph .clip { position:absolute; inset:0; border-radius:inherit; overflow:hidden; }
  .s5 .morph .la, .s5 .morph .lb { position:absolute; inset:0; }
  .s5 .morph .la { background:linear-gradient(90deg, #7DB3F7 0%, #4A8DF2 45%, #1A69F0 100%); }
  .s5 .morph .lb { background:linear-gradient(180deg, #3A86F7 0%, #1A69F0 100%); }
  .s5 .mlab { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; gap:0.43em; color:#fff; font-weight:600; white-space:nowrap; }
  `);

  const ADDR = 'https://example.ru';
  const REGION = 'Санкт-Петербург и ЛО';
  const ITEMS = ['Москва и МО', 'Санкт-Петербург и ЛО', 'Екатеринбург', 'Новосибирск', 'Казань'];
  const stroke = 'fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"';
  const ICON = {
    globe: `<svg class="ic" viewBox="0 0 24 24" ${stroke} style="color:#8E96A8"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3c2.6 2.5 4 5.6 4 9s-1.4 6.5-4 9c-2.6-2.5-4-5.6-4-9s1.4-6.5 4-9z"/></svg>`,
    pin: `<svg class="ic" viewBox="0 0 24 24" ${stroke} style="color:#9AA1B2"><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/></svg>`,
    chev: `<svg class="chev" viewBox="0 0 24 24" ${stroke} style="color:#8E96A8"><path d="M6 9.5l6 6 6-6"/></svg>`,
    clock: `<svg viewBox="0 0 24 24" ${stroke}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>`,
    arrow: `<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`,
  };
  const BTN_TXT = 'Начать продвижение';

  // моменты набора адреса: детерминированно, чуть неравномерно, 1.45 → 2.15
  const TYPE_T = (() => {
    const r = rng(5), n = ADDR.length, w = [];
    for (let i = 0; i < n; i++) w.push(1 + (r() - 0.5) * 0.7 + (i === 5 || i === 6 ? 0.4 : 0));
    const sum = w.reduce((a, b) => a + b, 0), out = []; let acc = 0;
    // символ i появляется в конце своего интервала → к 2.15 напечатан полностью
    for (let i = 0; i < n; i++) { acc += w[i]; out.push(1.45 + 0.70 * (acc - w[i] * 0.6) / sum); }
    return out;
  })();

  const mix = (a, b, k) => a.map((v, i) => Math.round(lerp(v, b[i], k)));
  function setFocus(f, e) {
    e.style.borderColor = `rgb(${mix([217, 222, 231], [26, 105, 240], f).join(',')})`;
    e.style.boxShadow = f > 0.001 ? `0 0 0 ${(5 * f).toFixed(2)}px rgba(26,105,240,${(0.14 * f).toFixed(3)})` : 'none';
  }

  let R = {};
  SCENES.add('s5', {
    dur: 6.0,
    build(root) {
      root.classList.add('s5');
      R.cam = el('div', 'cam', root);
      const card = R.card = el('div', 'card app-card', R.cam);
      R.its = [];
      const it = (tag, cls, parent, html) => { const e = el(tag, 'it ' + (cls || ''), parent, html); R.its.push(e); return e; };
      it('h1', '', card, 'Добавьте сайт для начала<br>тестового периода');
      it('div', 'sub', card, 'Мы самостоятельно соберём все необходимые данные в фоновом режиме и запустим продвижение');
      it('div', 'lab', card, 'Адрес сайта');
      R.fa = it('div', 'fld', card, `${ICON.globe}<span class="ph">https://example.ru</span><span class="tx"></span><span class="caret"></span>`);
      R.faPh = R.fa.querySelector('.ph'); R.faTx = R.fa.querySelector('.tx'); R.caret = R.fa.querySelector('.caret');
      it('div', 'hint', card, 'Введите полный адрес: https://example.ru');
      const g2 = el('div', 'g2', card);
      it('div', 'lab l2', g2, 'Регион продвижения');
      R.fr = it('div', 'fld', g2, `${ICON.pin}<span class="ph">Выберите регион</span><span class="tx"></span>${ICON.chev}`);
      R.frPh = R.fr.querySelector('.ph'); R.frTx = R.fr.querySelector('.tx'); R.chev = R.fr.querySelector('.chev');
      R.menu = el('div', 'menu', g2);
      R.mi = ITEMS.map(s => el('div', 'mi', R.menu, s));
      R.menu.style.top = px(rectOf(R.fr).y + rectOf(R.fr).h - rectOf(g2).y + 10);
      R.btn = it('div', 'btn app-btn', card, `<span>${BTN_TXT}</span>${ICON.arrow}`);
      it('div', 'trial', card, `${ICON.clock}<span>Тестовый период 5 дней</span>`);

      // замеры (до любых transform)
      R.rBtn = rectOf(R.btn);
      R.rFa = rectOf(R.fa); R.rFr = rectOf(R.fr);
      R.rMi = R.mi.map(rectOf);

      R.morph = el('div', 'morph', root);
      const clip = el('div', 'clip', R.morph);
      R.la = el('div', 'la', clip); R.lb = el('div', 'lb', clip);
      R.mlab = el('div', 'mlab', clip, `<span>${BTN_TXT}</span>${ICON.arrow}`);
      R.cur = makeCursor(root);
    },

    seek(t) {
      // ---------- камера ----------
      const Ya = R.rFa.cy, Yr = R.rFr.cy, Yb = R.rBtn.cy;
      const Fy = tween(t, [[0.75, 540], [1.25, Ya], [2.25, Ya], [2.75, Yr], [3.70, Yr], [4.20, Yb], [4.60, Yb], [5.60, 540]]);
      const S = tween(t, [[0.75, 1], [1.25, 1.6], [2.25, 1.6], [2.75, 1.6], [3.70, 1.6], [4.20, 1.35], [4.60, 1.35], [5.60, 1]]);
      const cam = (tt) => {
        const f = tween(tt, [[0.75, 540], [1.25, Ya], [2.25, Ya], [2.75, Yr], [3.70, Yr], [4.20, Yb], [4.60, Yb], [5.60, 540]]);
        const s = tween(tt, [[0.75, 1], [1.25, 1.6], [2.25, 1.6], [2.75, 1.6], [3.70, 1.6], [4.20, 1.35], [4.60, 1.35], [5.60, 1]]);
        return { s, tx: 960 - s * 960, ty: 540 - s * f };
      };
      const sc = (tt, x, y) => { const c = cam(tt); return { x: c.tx + c.s * x, y: c.ty + c.s * y }; };
      const cm = cam(t);
      R.cam.style.transform = `translate(${px(cm.tx)},${px(cm.ty)}) scale(${cm.s.toFixed(5)})`;

      // ---------- карточка: появление и уход ----------
      const kIn = prog(t, 0, 0.6);
      const sIn = lerp(0.86, 1, E.springSoft(kIn));
      const oIn = E.outCubic(prog(t, 0, 0.35));
      const kOut = E.inCubic(prog(t, 4.6, 5.1));
      const blur = 8 * (1 - E.outCubic(kIn)) + 10 * kOut;
      R.card.style.transform = `scale(${sIn.toFixed(4)})`;
      R.card.style.opacity = (oIn * (1 - kOut)).toFixed(3);
      R.card.style.filter = blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : 'none';
      // каскад содержимого
      R.its.forEach((e, i) => {
        const k = E.outCubic(prog(t, 0.08 + i * 0.04, 0.08 + i * 0.04 + 0.36));
        e.style.opacity = k.toFixed(3);
        e.style.transform = k >= 1 ? 'none' : `translateY(${(14 * (1 - k)).toFixed(2)}px)`;
      });

      // ---------- поле адреса ----------
      const nCh = TYPE_T.filter(x => t >= x).length;
      R.faTx.textContent = ADDR.slice(0, nCh);
      R.faPh.style.opacity = (1 - prog(t, 1.32, 1.40)).toFixed(3);
      const fA = prog(t, 1.32, 1.44) * (1 - prog(t, 2.30, 2.44));
      setFocus(fA, R.fa);
      const typing = t > 1.32 && t < 2.2;
      const blinkOn = ((t - 1.32) * 1.9) % 1 < 0.55;
      R.caret.style.opacity = fA > 0.5 ? ((t < 2.2 && t > 1.45) || blinkOn ? 1 : 0) : 0;

      // ---------- поле региона и меню ----------
      const fR = prog(t, 3.0, 3.12) * (1 - prog(t, 3.60, 3.75));
      setFocus(fR, R.fr);
      const open = E.outCubic(prog(t, 3.0, 3.2)), close = prog(t, 3.55, 3.63);
      const menuOp = open * (1 - E.outExpo(prog(t, 3.55, 3.60)));
      R.menu.style.opacity = menuOp.toFixed(3);
      R.menu.style.transform = `scaleY(${(lerp(0.92, 1, open) * lerp(1, 0.9, E.inCubic(close))).toFixed(4)})`;
      R.menu.style.visibility = menuOp > 0.001 ? 'visible' : 'hidden';
      const rot = E.outCubic(prog(t, 3.0, 3.22)) * (1 - E.outCubic(prog(t, 3.55, 3.75)));
      R.chev.style.transform = `rotate(${(180 * rot).toFixed(1)}deg)`;
      const sel = t >= 3.55;
      R.frPh.style.opacity = sel ? 0 : 1;
      R.frTx.textContent = sel ? REGION : '';
      R.frTx.style.opacity = sel ? E.outCubic(prog(t, 3.55, 3.68)).toFixed(3) : 0;

      // ---------- курсор ----------
      const A = sc(1.3, R.rFa.cx + 120, R.rFa.cy);
      const Rg = sc(2.9, R.rFr.cx + 120, R.rFr.cy);
      const I1 = sc(3.4, R.rMi[1].cx + 60, R.rMi[1].cy);
      const B = sc(4.3, R.rBtn.cx + 250, R.rBtn.cy - 16);
      const cp = path2(t, [
        [1.05, A.x + 260, A.y + 170], [1.30, A.x, A.y],
        [1.55, A.x, A.y], [2.05, A.x + 130, A.y + 90],
        [2.70, A.x + 130, A.y + 90], [2.95, Rg.x, Rg.y],
        [3.15, Rg.x, Rg.y], [3.45, I1.x, I1.y],
        [4.05, I1.x, I1.y], [4.40, B.x, B.y],
      ]);
      const clicks = [1.32, 3.00, 3.55, 4.45];
      let press = 0, ring = 0;
      clicks.forEach(c => { press = Math.max(press, bump(t, c - 0.09, 0.18)); if (t >= c && t < c + 0.35) ring = (t - c) / 0.35; });
      const cOp = prog(t, 0.85, 1.05) * (1 - prog(t, 4.6, 4.9));
      R.cur.set(cp.x, cp.y, { press, ring, opacity: cOp });

      // подсветка пункта меню под курсором
      R.mi.forEach((m, i) => {
        const a = sc(t, R.rMi[i].x, R.rMi[i].y), b = sc(t, R.rMi[i].x + R.rMi[i].w, R.rMi[i].y + R.rMi[i].h);
        const hov = menuOp > 0.5 && cp.x >= a.x && cp.x <= b.x && cp.y >= a.y && cp.y <= b.y;
        m.style.background = hov ? '#EEF4FF' : 'transparent';
        m.style.color = hov ? '#1A69F0' : '#1C2233';
      });

      // ---------- кнопка ----------
      const hovK = E.outCubic(prog(t, 4.2, 4.4));
      const bright = 1 + 0.06 * hovK;
      const bs = 1 - 0.03 * bump(t, 4.36, 0.18);
      const morphOn = t >= 4.6;
      R.btn.style.filter = `brightness(${bright.toFixed(4)})`;
      R.btn.style.transform = `scale(${bs.toFixed(4)})`;
      R.btn.style.visibility = morphOn ? 'hidden' : 'visible';

      // морф: кнопка → плашка .an-pill (центр 960,540, 400×84, радиус 42)
      if (morphOn) {
        const e = E.inOutCubic(prog(t, 4.7, 5.8));
        const c = cam(t);
        const p0 = sc(t, R.rBtn.x, R.rBtn.y);
        const w0 = R.rBtn.w * c.s, h0 = R.rBtn.h * c.s, r0 = 15 * c.s;
        const w = lerp(w0, 400, e), h = lerp(h0, 84, e);
        const cx = lerp(p0.x + w0 / 2, 960, e), cy = lerp(p0.y + h0 / 2, 540, e);
        const m = R.morph.style;
        m.display = 'block';
        m.left = px(cx - w / 2); m.top = px(cy - h / 2); m.width = px(w); m.height = px(h);
        m.borderRadius = px(lerp(r0, 42, e));
        m.boxShadow = e > 0.001
          ? `0 0 0 1px rgba(255,255,255,${(0.25 * e).toFixed(3)}) inset, 0 18px 50px -10px rgba(26,105,240,${(0.55 * e).toFixed(3)}), 0 0 90px 10px rgba(26,140,240,${(0.22 * e).toFixed(3)})`
          : 'none';
        R.la.style.opacity = (1 - e).toFixed(4);
        R.la.style.filter = `brightness(${bright.toFixed(4)})`;
        R.lb.style.opacity = e.toFixed(4);
        const kt = prog(t, 4.62, 5.2);
        R.mlab.style.fontSize = px(23 * c.s);
        R.mlab.style.opacity = (1 - E.inCubic(kt)).toFixed(3);
        R.mlab.style.filter = kt > 0 ? `blur(${(8 * kt).toFixed(2)}px)` : 'none';
        R.mlab.style.display = kt >= 1 ? 'none' : 'flex';
      } else {
        R.morph.style.display = 'none';
      }
    },
  });
})();
