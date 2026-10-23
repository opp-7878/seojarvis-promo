// Сцена 4: «Регистрация в один клик» — форма регистрации, наезд камеры на кнопки соцвходов, клик «Яндекс ID».
(function () {
  injectCSS(`
.s4 { }
.s4 .s4-cam { position: absolute; left: 0; top: 0; width: 1920px; height: 1080px; transform-origin: 0 0; will-change: transform; }
.s4 .s4-title { position: absolute; left: 0; top: 70px; width: 1920px; text-align: center; white-space: nowrap;
  font-weight: 700; font-size: 64px; line-height: 1.1; letter-spacing: -0.03em; color: var(--ink); }
.s4 .s4-title .w { display: inline-block; will-change: transform, filter, opacity; }
.s4 .s4-card { position: absolute; left: 660px; top: 190px; width: 600px; padding: 40px 44px 38px; transform-origin: 50% 50%; }
.s4 .s4-card .app-h1 { font-size: 34px; color: #0E1424; }
.s4 .s4-card .app-sub { font-size: 17px; margin-top: 8px; }
.s4 .blk { will-change: transform, opacity; }
.s4 .tabs { margin-top: 26px; height: 52px; border-radius: 14px; background: #F3F6FB; padding: 4px; display: flex; gap: 4px; }
.s4 .tab { flex: 1; border-radius: 11px; display: flex; align-items: center; justify-content: center; gap: 9px;
  font-size: 16px; font-weight: 600; color: #8B93A5; }
.s4 .tab.on { background: #fff; color: var(--blue); box-shadow: 0 1px 3px rgba(16,24,40,0.10), 0 4px 12px rgba(16,24,40,0.06); }
.s4 .tab svg { width: 18px; height: 18px; }
.s4 .fld { margin-top: 22px; }
.s4 .fld .app-label { font-size: 16px; margin-bottom: 9px; color: #2A3142; }
.s4 .app-field { height: 56px; padding: 0 16px; gap: 13px; font-size: 18px; border-radius: 12px; }
.s4 .app-field svg { width: 21px; height: 21px; flex: none; }
.s4 .app-field .val { flex: 1; color: #12182A; }
.s4 .app-field .dots { flex: 1; color: #12182A; font-size: 18px; letter-spacing: 3px; line-height: 1; }
.s4 .forgot { margin-top: 10px; text-align: right; font-size: 14.5px; font-weight: 500; color: var(--blue); }
.s4 .go { margin-top: 20px; height: 62px; font-size: 19px; border-radius: 13px; }
.s4 .go svg { width: 20px; height: 20px; }
.s4 .or { margin-top: 26px; display: flex; align-items: center; gap: 14px; font-size: 14.5px; color: #8B93A5; }
.s4 .or i { flex: 1; height: 1px; background: #E3E8F0; }
.s4 .row { margin-top: 22px; display: flex; gap: 12px; }
.s4 .row .app-btn-ghost { flex: 1; height: 60px; gap: 10px; font-size: 16px; border-radius: 13px; will-change: transform; }
.s4 .row .ic { width: 22px; height: 22px; flex: none; display: block; }
.s4 .ic-mail { border-radius: 50%; background: #FF9E00; color: #fff; display: flex !important; align-items: center; justify-content: center;
  font-size: 15px; font-weight: 800; line-height: 1; padding-bottom: 1px; }
.s4 .ic-ya { border-radius: 50%; background: #FC3F1D; color: #fff; display: flex !important; align-items: center; justify-content: center;
  font-size: 14px; font-weight: 800; line-height: 1; }
.s4 .login { margin-top: 26px; text-align: center; font-size: 17px; color: var(--ink2); }
.s4 .login b { color: var(--blue); font-weight: 600; }
`);

  const svg = (inner, vb = '0 0 24 24') => `<svg viewBox="${vb}" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
  const ICON = {
    user: svg('<circle cx="12" cy="8" r="3.6"/><path d="M4.8 20c.6-3.7 3.3-5.6 7.2-5.6s6.6 1.9 7.2 5.6"/>'),
    mail: svg('<rect x="3" y="5" width="18" height="14" rx="2.6"/><path d="M3.8 7.2 12 13l8.2-5.8"/>'),
    lock: svg('<rect x="5" y="10.5" width="14" height="9.5" rx="2.4"/><path d="M8.2 10.5V8a3.8 3.8 0 0 1 7.6 0v2.5"/>'),
    eye: svg('<path d="M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="2.8"/>'),
    phone: svg('<path d="M5 4.5h3.4l1.6 4-2 1.3a11 11 0 0 0 5.2 5.2l1.3-2 4 1.6V18a2 2 0 0 1-2.2 2C10.6 19.6 4.4 13.4 4 6.7A2 2 0 0 1 5 4.5Z"/>'),
    arrow: svg('<path d="M4 12h15M13 6l6 6-6 6"/>'),
    max: `<svg class="ic" viewBox="0 0 22 22"><defs><linearGradient id="s4mx" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4A5BFF"/><stop offset="1" stop-color="#8B3DFF"/></linearGradient></defs><rect width="22" height="22" rx="6.5" fill="url(#s4mx)"/><circle cx="11" cy="11" r="5.2" fill="none" stroke="#fff" stroke-width="2.4"/><circle cx="11" cy="11" r="2" fill="#5A52FF"/></svg>`,
  };

  const R = {};
  let cam, camS = 1.7;

  function camXform(t) {
    // камера: фокус (fx,fy) в мировых координатах → центр кадра; масштаб s
    const e1 = E.inOutCubic(prog(t, 1.2, 2.0));
    const e2 = E.inOutCubic(prog(t, 3.3, 4.4));
    const s1 = lerp(1, camS, e1);
    const s = s1 * lerp(1, 1.3, e2);
    // базовый кадр: s=1, без сдвига (tx=ty=0). Фокус смещается от центра кадра к ряду, затем к кнопке «Яндекс ID»
    const fx = lerp(lerp(960, R.row.cx, e1), R.btns[2].cx, e2);
    const fy = lerp(lerp(540, R.row.cy, e1), R.btns[2].cy, e2);
    return { s, tx: 960 - s * fx, ty: 540 - s * fy };
  }
  const toScreen = (c, x, y) => [c.tx + c.s * x, c.ty + c.s * y];

  SCENES.add('s4', {
    dur: 4.4,
    build(root) {
      root.classList.add('s4');
      cam = el('div', 's4-cam', root);
      const title = el('div', 's4-title', cam);
      R.words = splitWords(title, 'Регистрация в один клик');
      const card = el('div', 'app-card s4-card', cam);
      R.card = card;
      const blocks = [];
      const blk = (html, cls = '') => { const b = el('div', 'blk ' + cls, card, html); blocks.push(b); return b; };
      blk(`<div class="app-h1">Создание аккаунта</div><div class="app-sub">Заполните данные — это займёт минуту</div>`);
      blk(`<div class="tab">${ICON.phone}По телефону</div><div class="tab on">${ICON.mail}По email</div>`, 'tabs');
      const fld = (label, icon, val, extra = '') => blk(`<div class="app-label">${label}</div><div class="app-field"><span style="color:#8B93A5;display:flex">${icon}</span>${val}${extra}</div>`, 'fld');
      fld('Имя', ICON.user, '<span class="val">Александр</span>');
      fld('Email или телефон', ICON.mail, '<span class="val">example@mail.ru</span>');
      const pw = fld('Пароль', ICON.lock, '<span class="dots">••••••••</span>', `<span style="color:#8B93A5;display:flex">${ICON.eye}</span>`);
      pw.insertAdjacentHTML('beforeend', '<div class="forgot">Забыли пароль?</div>');
      blk(`Создать аккаунт ${ICON.arrow}`, 'app-btn solid go');
      blk('<i></i><span>или продолжить через</span><i></i>', 'or');
      const row = blk('', 'row');
      R.btns = [];
      [['<span class="ic ic-mail">@</span>', 'Mail.ru'], [ICON.max, 'MAX'], ['<span class="ic ic-ya">Я</span>', 'Яндекс ID']].forEach(([ic, name]) => {
        const b = el('div', 'app-btn-ghost', row, ic + `<span>${name}</span>`);
        R.btns.push(b);
      });
      blk('Уже есть аккаунт? <b>Войти</b>', 'login');
      R.blocks = blocks;
      R.row = rectOf(row);
      R.btnRects = R.btns.map(rectOf);
      R.btns.forEach((b, i) => { Object.assign(R.btns[i], {}); });
      R.btns = R.btns.map((b, i) => Object.assign(R.btnRects[i], { node: b }));
      R.root = root;
      R.cursor = makeCursor(root);
    },
    seek(t) {
      const root = R.root;
      // --- прозрачность и размытие всей сцены ---
      const fade = t < 3.3 ? 1 : 1 - E.inCubic(prog(t, 3.3, 4.3));
      root.style.opacity = t <= 0 ? 0 : fade.toFixed(4);
      const bl = 16 * E.inOutCubic(prog(t, 3.3, 4.4));
      root.style.filter = bl > 0.01 ? `blur(${bl.toFixed(2)}px)` : 'none';

      // --- заголовок ---
      revealWords(R.words, t, { stagger: 0.07 });

      // --- карточка ---
      const ck = prog(t, 0.15, 0.85), ce = E.outCubic(ck);
      R.card.style.opacity = ce.toFixed(3);
      R.card.style.transform = `translateY(${(70 * (1 - ce)).toFixed(2)}px) scale(${(0.97 + 0.03 * ce).toFixed(4)})`;
      R.blocks.forEach((b, i) => {
        const k = E.outCubic(prog(t, 0.3 + i * 0.04, 0.3 + i * 0.04 + 0.3));
        b.style.opacity = k.toFixed(3);
        b.style.transform = k >= 1 ? 'none' : `translateY(${(12 * (1 - k)).toFixed(2)}px)`;
      });

      // --- камера ---
      const c = camXform(t);
      cam.style.transform = `translate(${px(c.tx)},${px(c.ty)}) scale(${c.s.toFixed(5)})`;

      // --- кнопки: hover и клик ---
      const hv = [
        tween(t, [[1.95, 0], [2.07, 1], [2.2, 1], [2.32, 0]], E.linear),
        tween(t, [[2.32, 0], [2.44, 1], [2.62, 1], [2.74, 0]], E.linear),
        tween(t, [[2.80, 0], [2.92, 1]], E.linear),
      ];
      const clickK = bump(t, 3.0, 0.3);               // 0→1→0 нажатие
      const press = t < 3.05 ? 0 : 1 - E.outCubic(prog(t, 3.05, 3.40)) * 0 ;
      R.btns.forEach((b, i) => {
        const n = b.node, h = hv[i];
        n.classList.toggle('hover', h > 0.5);
        n.style.borderColor = `rgba(${lerp(221, 26, h).toFixed(0)},${lerp(226, 105, h).toFixed(0)},${lerp(234, 240, h).toFixed(0)},1)`;
        n.style.boxShadow = h > 0.01 ? `0 0 0 ${(4 * h).toFixed(2)}px rgba(26,105,240,${(0.10 * h).toFixed(3)})` : 'none';
        let sc = 1, bg = '#fff';
        if (i === 2) {
          const dn = tween(t, [[3.05, 0], [3.13, 1, E.outCubic], [3.30, 0, E.inOutCubic]], E.linear);
          sc = 1 - 0.04 * dn;
          const tint = t < 3.05 ? 0 : tween(t, [[3.05, 0], [3.12, 1], [3.55, 0.85], [4.4, 0.85]], E.linear);
          bg = `rgb(${lerp(255, 255, tint).toFixed(0)},${lerp(255, 241, tint).toFixed(0)},${lerp(255, 238, tint).toFixed(0)})`;
          if (t >= 3.05) { n.style.borderColor = `rgb(${lerp(26, 252, tint * 0.5).toFixed(0)},${lerp(105, 120, tint * 0.5).toFixed(0)},${lerp(240, 100, tint * 0.5).toFixed(0)})`; }
        }
        n.style.transform = sc === 1 ? 'none' : `scale(${sc.toFixed(4)})`;
        n.style.background = bg;
      });

      // --- курсор (вне камеры, координаты из мировых) ---
      const B = R.btns, P = (i, dx, dy) => [B[i].cx + dx, B[i].cy + dy];
      const m = P(0, 40, 14), x = P(1, 36, 14), y = P(2, 44, 14);
      // мировая траектория по кнопкам
      const mv = (a, b, t0, t1) => { const k = E.inOutCubic(prog(t, t0, t1)); return [lerp(a[0], b[0], k), lerp(a[1], b[1], k) - 16 * Math.sin(Math.PI * k)]; };
      let w;
      if (t < 2.15) w = m;
      else if (t < 2.5) w = mv(m, x, 2.15, 2.45);
      else if (t < 2.55) w = x;
      else w = mv(x, y, 2.55, 2.95);
      const sw = toScreen(c, w[0], w[1]);
      // вход снизу: экранная позиция смешивается от точки под кадром к цели
      const ek = E.outCubic(prog(t, 1.70, 2.05));
      const start = [sw[0] + 140, 1160];
      const sx = lerp(start[0], sw[0], ek), sy = lerp(start[1], sw[1], ek);
      const op = prog(t, 1.70, 1.82);
      const cp = bump(t, 3.0, 0.18) ;
      R.cursor.set(sx, sy, { press: t >= 3.0 && t <= 3.2 ? cp : 0, opacity: op, ring: t >= 3.05 ? prog(t, 3.05, 3.4) : 0 });
    },
  });
})();
