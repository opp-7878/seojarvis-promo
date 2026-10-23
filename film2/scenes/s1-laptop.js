// Сцена 1 — MacBook: ввод адреса seojarvis.ru, наезд в экран. dur 5.0
(function () {
  injectCSS(`
  .s1 .cam { position:absolute; left:0; top:0; width:1920px; height:1080px; transform-origin:0 0; }
  .s1 .lap { position:absolute; width:1410px; height:880px; transform-origin:50% 50%; }
  .s1 .shadow { position:absolute; left:-30px; top:826px; width:1470px; height:70px; border-radius:50%;
    background:rgba(0,0,0,0.18); filter:blur(20px); }
  .s1 .shadow2 { position:absolute; left:130px; top:848px; width:1150px; height:26px; border-radius:50%;
    background:rgba(0,0,0,0.16); filter:blur(8px); }
  .s1 .scr { position:absolute; overflow:hidden; background:#E9EDF4; }
  .s1 .scr-in { position:absolute; left:2px; top:2px; width:2320.8px; height:1480px; transform-origin:0 0; transform:scale(0.5); overflow:hidden;
    background:#fff; font-size:26px; color:var(--ink); }
  .s1 .scr-fill { position:absolute; left:0; top:0; width:100%; height:100%; background:#E9EDF4; }
  .s1 .mac { position:absolute; left:0; top:0; width:100%; height:100%; pointer-events:none; }
  .s1 .shot { position:absolute; left:0; top:0; width:1410px; height:880px; display:block; }
  .s1 .abs { position:absolute; }
  .s1 .menubar { position:absolute; left:0; top:0; width:100%; height:48px; background:rgba(246,247,250,0.88);
    border-bottom:1px solid rgba(28,34,51,0.08); z-index:5; }
  .s1 .menubar .it { position:absolute; top:0; height:48px; line-height:48px; font-size:25px; font-weight:500; color:#1C2233; white-space:nowrap; letter-spacing:-0.005em; }
  .s1 .menubar .it.b { font-weight:700; }
  .s1 .menubar svg { position:absolute; }
  .s1 .win { position:absolute; left:0; top:48px; width:100%; height:1432px; background:#fff; }
  .s1 .tabs { position:absolute; left:0; top:0; width:100%; height:84px; background:#DFE3EA; }
  .s1 .light { position:absolute; top:30px; width:24px; height:24px; border-radius:50%; box-shadow:inset 0 0 0 1px rgba(0,0,0,0.12); }
  .s1 .tab { position:absolute; left:196px; top:14px; width:380px; height:70px; background:#F6F7F9; border-radius:16px 16px 0 0;
    line-height:62px; padding-left:30px; font-size:24px; font-weight:500; color:#5A6275; white-space:nowrap; }
  .s1 .tool { position:absolute; left:0; top:84px; width:100%; height:84px; background:#F6F7F9; border-bottom:1px solid #DCE0E8; }
  .s1 .tool svg.ic { position:absolute; top:22px; width:40px; height:40px; }
  .s1 .addr { position:absolute; left:560px; top:14px; width:1200px; height:56px; border-radius:16px; background:#fff;
    border:2px solid #D5DAE3; display:flex; align-items:center; padding-left:20px; font-size:28px; color:var(--ink); white-space:nowrap; }
  .s1 .addr .ph { color:#8B93A5; }
  .s1 .addr svg { flex:none; margin-right:14px; }
  .s1 .addr .caret { height:34px; width:3px; margin-left:1px; border-radius:2px; }
  .s1 .load { position:absolute; left:560px; top:80px; width:1200px; height:5px; z-index:3; }
  .s1 .load i { display:block; height:100%; width:0; background:var(--blue); border-radius:3px; box-shadow:0 0 12px rgba(26,105,240,0.5); }
  .s1 .sug { position:absolute; left:560px; top:80px; width:1200px; background:#fff; border-radius:18px; padding:8px;
    box-shadow:0 0 0 1px rgba(28,34,51,0.08), 0 20px 50px -8px rgba(16,24,40,0.28); z-index:4; }
  .s1 .sug .row { height:64px; border-radius:12px; background:rgba(26,105,240,0.12); display:flex; align-items:center; padding-left:18px; font-size:28px; color:var(--ink); }
  .s1 .sug svg { margin-right:16px; }
  .s1 .page { position:absolute; left:0; top:169px; width:100%; height:1263px; background:#fff; overflow:hidden; }
  .s1 .ntp { position:absolute; left:0; top:0; width:100%; height:100%; background:#F4F6FA; }
  .s1 .sbox { position:absolute; left:660px; top:380px; width:1000px; height:88px; border-radius:44px; background:#fff;
    box-shadow:0 0 0 1px rgba(28,34,51,0.06), 0 14px 40px -8px rgba(16,24,40,0.18); display:flex; align-items:center; padding-left:34px;
    font-size:28px; color:#8B93A5; white-space:nowrap; }
  .s1 .sbox svg { margin-right:18px; }
  .s1 .tile { position:absolute; top:560px; width:128px; height:128px; border-radius:34px; background:linear-gradient(180deg,#E7EBF2,#DDE2EB);
    box-shadow:inset 0 0 0 1px rgba(28,34,51,0.04); }
  `);

  const k = 1340 / 1410;                 // масштаб ноутбука в кадре (ширина 1340)
  const LL = 960 - 704.5 * k;            // левый край PNG в кадре (содержимое PNG центрировано по x=960)
  const LT = 530 - 444 * k;              // верх PNG в кадре
  const S = LAPTOP.screen;
  const SX = S.x - 1, SY = S.y - 1, SW = S.w + 2, SH = S.h + 2;   // запас 1px под рамку, чтобы нигде не просвечивало

  // точка экрана (внутренние 2× координаты ix, iy) -> мир (кадр до камеры)
  const wx = ix => LL + (S.x + ix / 2) * k;
  const wy = iy => LT + (S.y + iy / 2) * k;

  const TYPE = 'seojarvis.ru';
  // детерминированные моменты нажатия клавиш: 1.90 .. 2.75
  const keyT = (() => {
    const r = rng(11); const d = TYPE.split('').map(() => 0.6 + r() * 0.8);
    const sum = d.slice(0, -1).reduce((a, b) => a + b, 0), span = 0.85 - 0.06;
    let c = 0; return d.map((x, i) => { const t = 1.90 + c; c += x / sum * span; return t; });
  })();
  const lastKey = keyT[keyT.length - 1];

  // камера
  const FIELD = { cx: 1160.4, cy: 168 + 0 };   // центр адресной строки во внутренних координатах (48 меню + 84 вкладки + 42)
  const addrW = wx(1160.4), addrH = wy(48 + 84 + 42);
  const camA = { x: 960, y: 540, s: 1 };
  const camB = { x: addrW, y: addrH, s: 2.05 };
  const camC = { x: wx(1160.4), y: wy(740), s: 2.7 };
  function camAt(t) {
    const a = E.inOutCubic(prog(t, 0.6, 1.6));
    const kk = prog(t, 3.4, 4.7);
    const b = 0.5 * E.inExpo(kk) + 0.5 * E.inOutQuart(kk);
    const lg = (p, q, e) => p * Math.pow(q / p, e);
    let x, y, s;
    if (t < 3.4) { x = lerp(camA.x, camB.x, a); y = lerp(camA.y, camB.y, a); s = lg(camA.s, camB.s, a); }
    else { x = lerp(camB.x, camC.x, b); y = lerp(camB.y, camC.y, b); s = lg(camB.s, camC.s, b); }
    return { x, y, s, tx: 960 - s * x, ty: 540 - s * y };
  }

  const mix = (c1, c2, f) => c1.map((v, i) => Math.round(lerp(v, c2[i], f)));
  const ic = (d, w = 2.4, col = '#5A6275') => `fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"`;
  const LOUPE = (sz, col) => `<svg width="${sz}" height="${sz}" viewBox="0 0 24 24" ${ic('', 2.2, col)}><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5 L21 21"/></svg>`;
  const GLOBE = `<svg width="34" height="34" viewBox="0 0 24 24" ${ic('', 1.8, '#1A69F0')}><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12 H21"/></svg>`;
  const WIFI = `<svg style="left:2140px;top:9px" width="32" height="30" viewBox="0 0 32 30" fill="none" stroke="#1C2233" stroke-width="2.8" stroke-linecap="round"><path d="M3 11 Q16 -1 29 11"/><path d="M8 17 Q16 9 24 17"/><path d="M13 23 Q16 20 19 23"/></svg>`;

  let R = {};
  SCENES.add('s1', {
    dur: 5.0,
    build(root) {
      const cam = R.cam = el('div', 'cam', root);
      const lap = R.lap = el('div', 'lap', cam);
      lap.style.left = (LL - 705 * (1 - k)) + 'px'; lap.style.top = (LT - 440 * (1 - k)) + 'px';
      el('div', 'shadow', lap); el('div', 'shadow2', lap);
      const scr = el('div', 'scr', lap);
      scr.style.cssText += `left:${SX}px;top:${SY}px;width:${SW}px;height:${SH}px;border-radius:${S.r + 1}px ${S.r + 1}px 0 0;`;
      const inn = el('div', 'scr-in', scr);
      // чуть шире, чем экран PNG, чтобы запас в 1px был залит
      inn.style.left = '0px'; inn.style.top = '0px'; inn.style.width = (SW * 2) + 'px'; inn.style.height = (SH * 2) + 'px';
      el('div', 'scr-fill', inn);
      const ui = el('div', 'abs', inn); ui.style.cssText = 'left:2px;top:2px;width:2320.8px;height:1480px;';
      // --- меню macOS ---
      const mb = el('div', 'menubar', ui);
      const names = ['Браузер', 'Файл', 'Правка', 'Вид', 'История', 'Окно', 'Справка'];
      let x = 44;
      names.forEach((n, i) => {
        const e = el('div', 'it' + (i === 0 ? ' b' : ''), mb, n); e.style.left = x + 'px';
        x += n.length * 14.4 + 40;
      });
      mb.insertAdjacentHTML('beforeend', WIFI);
      mb.insertAdjacentHTML('beforeend', `<svg style="left:2194px;top:10px" width="28" height="28" viewBox="0 0 24 24" ${ic('', 2.2, '#1C2233')}><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5 L21 21"/></svg>`);
      const tm = el('div', 'it', mb, '9:41'); tm.style.left = '2240px'; tm.style.fontWeight = '600';
      // --- окно браузера ---
      const win = el('div', 'win', ui);
      const tabs = el('div', 'tabs', win);
      ['#FF5F57', '#FEBC2E', '#28C840'].forEach((c, i) => { const l = el('div', 'light', tabs); l.style.left = (40 + i * 40) + 'px'; l.style.background = c; });
      el('div', 'tab', tabs, 'Новая вкладка');
      const tool = el('div', 'tool', win);
      tool.insertAdjacentHTML('beforeend',
        `<svg class="ic" style="left:40px" viewBox="0 0 24 24" ${ic('', 2, '#5A6275')}><path d="M15 5 L8 12 L15 19"/></svg>
         <svg class="ic" style="left:112px" viewBox="0 0 24 24" ${ic('', 2, '#A4ABBA')}><path d="M9 5 L16 12 L9 19"/></svg>
         <svg class="ic" style="left:184px" viewBox="0 0 24 24" ${ic('', 2, '#5A6275')}><path d="M19 12 A7 7 0 1 1 16.6 6.8"/><path d="M19.5 4.5 V8.5 H15.5"/></svg>`);
      const addr = R.addr = el('div', 'addr', tool);
      R.aIcon = el('span', '', addr, LOUPE(30, '#8B93A5')); R.aIcon.style.display = 'flex';
      R.aPh = el('span', 'ph', addr, 'Введите запрос или адрес сайта');
      R.aTxt = el('span', '', addr);
      R.caret = el('span', 'caret', addr);
      R.load = el('div', 'load', tool); R.loadI = el('i', '', R.load);
      R.sug = el('div', 'sug', tool, `<div class="row">${GLOBE}seojarvis.ru</div>`);
      // --- страница ---
      const page = el('div', 'page', win);
      const ntp = R.ntp = el('div', 'ntp', page);
      const sb = el('div', 'sbox', ntp, LOUPE(34, '#8B93A5') + 'Введите запрос или адрес сайта');
      const tw = 6 * 128 + 5 * 40;
      for (let i = 0; i < 6; i++) { const t = el('div', 'tile', ntp); t.style.left = (1160.4 - tw / 2 + i * 168) + 'px'; }
      // --- рамка ноутбука поверх ---
      const img = el('img', 'shot', lap); img.src = LAPTOP.src; img.draggable = false;
      // --- курсор (в кадре, поверх камеры) ---
      R.cursor = makeCursor(root);
    },
    seek(t) {
      const root = R.cam.parentNode;
      // появление ноутбука
      const ap = E.outCubic(prog(t, 0, 0.7));
      const sc = k * lerp(0.94, 1, ap);
      R.lap.style.opacity = ap.toFixed(3);
      R.lap.style.transform = `translateY(${((1 - ap) * 30).toFixed(2)}px) scale(${sc.toFixed(5)})`;
      // lap уже имеет масштаб k: его размер 1410×880 -> в кадре 1340; положение left/top считалось под ЦЕНТР-масштаб, поправим
      // (transform-origin центр: смещение центра учтено ниже в LAPFIX)
      // камера
      const c = camAt(t);
      R.cam.style.transform = `translate(${c.tx.toFixed(3)}px,${c.ty.toFixed(3)}px) scale(${c.s.toFixed(5)})`;
      // адресная строка
      const focus = E.outCubic(prog(t, 1.75, 1.95)) * (1 - E.inOutCubic(prog(t, 2.95, 3.35)));
      const bc = mix([213, 218, 227], [26, 105, 240], focus);
      R.addr.style.borderColor = `rgb(${bc})`;
      R.addr.style.boxShadow = focus > 0 ? `0 0 0 ${(6 * focus).toFixed(2)}px rgba(26,105,240,${(0.16 * focus).toFixed(3)})` : 'none';
      const press = 1 - 0.015 * bump(t, 2.95, 0.15);
      R.addr.style.transform = `scale(${press.toFixed(4)})`;
      const nTyped = keyT.filter(kt => t >= kt).length;
      R.aTxt.textContent = TYPE.slice(0, nTyped);
      const phOp = 1 - prog(t, 1.75, 1.85);
      R.aPh.style.opacity = phOp.toFixed(3);
      R.aPh.style.display = phOp <= 0 ? 'none' : '';
      R.aPh.style.position = t >= 1.75 ? 'absolute' : '';
      R.aIcon.firstChild.style.stroke = nTyped > 0 ? '#5A6275' : '#8B93A5';
      // каретка
      const sinceKey = t - Math.max(lastKey * 0 + (nTyped ? keyT[nTyped - 1] : 1.75), 0);
      const on = sinceKey < 0.25 ? 1 : (Math.floor((sinceKey - 0.25) / 0.5) % 2 === 1 ? 1 : 0);
      R.caret.style.display = (t >= 1.75 && t < 2.95) ? 'inline-block' : 'none';
      R.caret.style.opacity = on;
      // подсказка
      const so = E.outCubic(prog(t, 2.05, 2.3)) * (1 - prog(t, 2.95, 3.05));
      R.sug.style.opacity = so.toFixed(3);
      R.sug.style.transform = `translateY(${((1 - E.outCubic(prog(t, 2.05, 2.3))) * -8).toFixed(2)}px)`;
      R.sug.style.display = so <= 0 ? 'none' : '';
      // загрузка
      const lp = E.inOutCubic(prog(t, 2.95, 3.5));
      R.loadI.style.width = (lp * 100).toFixed(2) + '%';
      R.load.style.opacity = (t < 2.95 ? 0 : 1 - prog(t, 3.5, 3.7)).toFixed(3);
      // страница
      R.ntp.style.opacity = (1 - E.inOutCubic(prog(t, 3.1, 3.4))).toFixed(3);
      // курсор: траектория в кадре под финальную камеру
      const cb = camAt(1.8);
      const tx = cb.tx + cb.s * wx(760), ty = cb.ty + cb.s * addrH;
      const p = path2(t, [[1.45, tx + 560, ty + 520], [1.74, tx, ty, E.outCubic]], E.outCubic);
      const co = prog(t, 1.45, 1.6) * (1 - prog(t, 2.9, 3.2));
      R.cursor.set(p.x, p.y, { press: bump(t, 1.75, 0.18), opacity: co, ring: prog(t, 1.75, 2.1) });
      // сцена целиком
      root.style.opacity = (1 - E.inOutCubic(prog(t, 4.6, 5.0))).toFixed(3);
    },
  });
})();
