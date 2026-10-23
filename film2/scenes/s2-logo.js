// Сцена 2: вспышка → знак → слово «SEO Jarvis» по буквам → клик → знак уходит → заголовок.
(function () {
  injectCSS(`
.s2 .grp { position: absolute; inset: 0; transform-origin: 960px 540px; }
.s2 .mark { position: absolute; left: 0; top: 0; width: 116px; height: 116px; will-change: transform, filter, opacity; opacity: 0; }
.s2 .mark svg { width: 116px; height: 116px; display: block; }
.s2 .word { position: absolute; top: 0; left: 0; height: 92px; line-height: 92px; font-size: 92px; font-weight: 700;
  letter-spacing: -0.03em; color: var(--ink); white-space: pre; }
.s2 .word .l { display: inline-block; will-change: transform, filter, opacity; opacity: 0; }
.s2 .strip { position: absolute; left: 610px; top: 538px; width: 700px; height: 4px; border-radius: 2px; opacity: 0;
  background: linear-gradient(90deg, rgba(90,180,255,0) 0%, #5AB4FF 28%, #1A69F0 50%, #5AB4FF 72%, rgba(90,180,255,0) 100%);
  box-shadow: 0 0 18px 4px rgba(46,140,255,0.45), 0 0 60px 10px rgba(46,140,255,0.22); }
.s2 .glow { position: absolute; left: 460px; top: 80px; width: 1000px; height: 920px; border-radius: 50%; opacity: 0;
  background: radial-gradient(closest-side, rgba(70,170,255,0.30), rgba(70,170,255,0.10) 55%, rgba(70,170,255,0) 100%); }
.s2 .dots { position: absolute; left: 410px; top: 30px; width: 1100px; height: 1020px; opacity: 0;
  background-image: radial-gradient(circle, rgba(26,140,240,0.95) 1.5px, rgba(26,140,240,0) 2.2px); background-size: 11px 11px;
  -webkit-mask-image: radial-gradient(closest-side, #000 0%, rgba(0,0,0,0.55) 50%, transparent 100%);
          mask-image: radial-gradient(closest-side, #000 0%, rgba(0,0,0,0.55) 50%, transparent 100%); }
`);
  const R = {};
  const MARK = 116, GAP = 28, WORD = 'SEO Jarvis';
  const T0 = 0.85, STEP = 0.05, LDUR = 0.3;   // появление букв
  const F0 = 2.20, FSTEP = 0.02, FDUR = 0.17; // исчезновение букв

  // индекс «момента» для каждой буквы: пробел идёт вместе со следующей буквой (без задержки)
  function slotOf(i) { let s = 0; for (let k = 0; k < i; k++) if (WORD[k] !== ' ') s++; return s; }

  // ширина видимой части слова в момент t (плавная, по прогрессу букв)
  function visW(t) {
    let w = 0;
    R.letters.forEach((l, i) => {
      const k = E.outCubic(prog(t, T0 + l.slot * STEP, T0 + l.slot * STEP + LDUR));
      if (k > 0) w = Math.max(w, l.x + l.w * k);
    });
    return w;
  }

  // обмер букв (offset* не зависят от transform); повторяем, пока шрифт не загрузился
  function measure() {
    R.letters.forEach(l => { l.x = l.el.offsetLeft; l.w = l.el.offsetWidth; });
    R.wordW = R.word.offsetWidth;
    if (document.fonts && document.fonts.status === 'loaded') R.measured = true;
  }

  SCENES.add('s2', {
    dur: 3.6,
    build(root) {
      R.root = root;
      R.dots = el('div', 'dots', root);
      R.glow = el('div', 'glow', root);
      R.strip = el('div', 'strip', root);
      R.grp = el('div', 'grp', root);
      R.mark = el('div', 'mark', R.grp, logoSVG());
      R.word = el('div', 'word', R.grp);
      R.letters = [];
      for (let i = 0; i < WORD.length; i++) {
        const s = el('span', 'l', R.word); s.textContent = WORD[i];
        R.letters.push({ el: s, slot: slotOf(i), space: WORD[i] === ' ' });
      }
      R.word.style.left = '0px'; R.word.style.top = '494px';
      // измерение без transform: позиции букв внутри слова
      measure();
      R.head = makeHeadline(root);
      R.cur = makeCursor(root);
    },
    seek(t) {
      if (!R.measured) measure();
      // ---------- вспышка и ореол ----------
      const sk = prog(t, 0.08, 0.55);
      R.strip.style.opacity = (sk <= 0 || sk >= 1) ? 0 : (E.outQuad(Math.min(1, sk * 4)) * (1 - E.inCubic(prog(sk, 0.45, 1)))).toFixed(3);
      R.strip.style.transform = `scaleX(${(0.02 + 0.98 * E.outExpo(sk)).toFixed(4)}) scaleY(${(1 - 0.5 * prog(sk, 0.5, 1)).toFixed(3)})`;
      const hk = prog(t, 0.10, 0.90);
      const hop = hk <= 0 || hk >= 1 ? 0 : E.outQuad(Math.min(1, hk * 5)) * (1 - E.inOutCubic(prog(hk, 0.15, 1)));
      const hs = 0.35 + 0.85 * E.outCubic(hk);
      R.dots.style.opacity = (hop * 0.85).toFixed(3);
      R.dots.style.transform = `scale(${hs.toFixed(4)})`;
      R.glow.style.opacity = (hop * 0.9).toFixed(3);
      R.glow.style.transform = `scale(${(hs * 0.9).toFixed(4)})`;

      // ---------- раскладка группы ----------
      const w = visW(t);
      const gap = GAP * E.outCubic(prog(t, 0.85, 1.05));
      const G = MARK + gap + w;
      const gl = 960 - G / 2;                       // левый край группы
      const wordLeft = gl + MARK + GAP;             // слово: левый край (gap уже полный к моменту, когда видны буквы)
      const wl = gl + MARK + gap;
      void wordLeft;
      // позиция знака: до 2.25 — в составе группы, потом переезд в центр
      const full = visW(1.7);
      const gFull = MARK + GAP + full;
      const mxGroup = (t < 1.7 ? gl : 960 - gFull / 2);
      const mx = lerp(mxGroup, 960 - MARK / 2, E.inOutCubic(prog(t, 2.25, 2.65)));

      // знак: появление, переезд, уход
      const mi = prog(t, 0.30, 0.85);
      const mscale = 0.3 + 0.7 * E.springSoft(mi);
      const mrot = -25 * (1 - E.outCubic(mi));
      const mblur = 10 * (1 - E.outCubic(mi));
      const mop = E.outQuad(prog(t, 0.30, 0.55));
      const vk = prog(t, 2.62, 2.95), vs = 1 - E.inCubic(vk);
      const sc = mscale * vs;
      const my = 40 * E.inCubic(vk);
      const blur = mblur + 7 * E.inCubic(vk);
      R.mark.style.display = (t >= 2.95 || t <= 0.30) ? 'none' : 'block';
      R.mark.style.opacity = mop.toFixed(3);
      R.mark.style.left = px(mx);
      R.mark.style.top = px(540 - MARK / 2 + my);
      R.mark.style.transform = `rotate(${mrot.toFixed(2)}deg) scale(${Math.max(sc, 0).toFixed(4)})`;
      R.mark.style.filter = blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : 'none';

      // слово: буквы
      R.word.style.left = px(t < 1.7 ? wl : 960 - gFull / 2 + MARK + GAP);
      R.letters.forEach(l => {
        const a = T0 + l.slot * STEP;
        const k = prog(t, a, a + LDUR), e = E.outCubic(k);
        const f = E.inCubic(prog(t, F0 + l.slot * FSTEP, F0 + l.slot * FSTEP + FDUR));
        const op = E.outQuad(prog(t, a, a + LDUR * 0.75)) * (1 - f);
        l.el.style.opacity = op.toFixed(3);
        const b = 9 * (1 - e) + 6 * f;
        l.el.style.filter = b > 0.05 ? `blur(${b.toFixed(2)}px)` : 'none';
        const dx = 0.25 * (1 - e) - 0.08 * f;
        l.el.style.transform = (Math.abs(dx) > 1e-4) ? `translateX(${dx.toFixed(3)}em)` : 'none';
      });

      // группа: дыхание + реакция на клик
      let gs = 1 + 0.01 * bump(t, 1.55, 0.35);
      gs *= tween(t, [[2.10, 1], [2.18, 0.96, E.outCubic], [2.32, 1.03, E.inOutCubic], [2.46, 1, E.outCubic]]);
      R.grp.style.transform = Math.abs(gs - 1) > 1e-5 ? `scale(${gs.toFixed(4)})` : 'none';

      // ---------- курсор ----------
      const tx = 960 - gFull / 2 + MARK + GAP + full * 0.5, ty = 556;
      let cp = path2(t, [[1.60, 1560, 960], [2.05, tx, ty]], E.outCubic);
      if (t > 2.30) { const k = E.inOutCubic(prog(t, 2.30, 2.60)); cp = { x: tx + 110 * k, y: ty + 150 * k }; }
      const press = bump(t, 2.10, 0.18);
      const cop = E.outQuad(prog(t, 1.60, 1.78)) * (1 - E.inQuad(prog(t, 2.30, 2.60)));
      R.cur.set(cp.x, cp.y, { press, opacity: cop, ring: prog(t, 2.10, 2.45) });
      R.cur.el.style.display = cop > 0 ? 'block' : 'none';

      // ---------- заголовок ----------
      const h = R.head;
      revealWords(h.words, t - 2.88, { stagger: 0.055, dur: 0.5 });
      const hsc = t >= 3.5 ? 1 : tween(t, [[2.85, 0.82], [3.25, 1.035, E.outCubic], [3.5, 1, E.inOutCubic]]);
      h.node.style.transform = hsc === 1 ? 'none' : `scale(${hsc.toFixed(4)})`;
    },
  });
})();
