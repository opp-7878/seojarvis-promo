// Сцена 6: «Анализируем…» — плашка, 5 строк, кольцо из текста, строки влетают в плашку, галочка, плашка улетает.
(function () {
  injectCSS(`
.s6 .s6-glow { position: absolute; left: 960px; top: 540px; width: 760px; height: 300px; margin: -150px 0 0 -380px; border-radius: 50%;
  background: radial-gradient(closest-side, rgba(26,140,240,0.42) 0%, rgba(26,140,240,0.16) 55%, rgba(26,140,240,0) 100%); opacity: 0; will-change: transform, opacity; }
.s6 .an-pill { will-change: transform, filter; }
.s6 .s6-sp { position: relative; width: 30px; height: 30px; flex: none; }
.s6 .s6-sp svg { position: absolute; left: 0; top: 0; width: 30px; height: 30px; overflow: visible; }
.s6 .s6-tx { position: relative; display: grid; white-space: nowrap; }
.s6 .s6-tx > span { grid-area: 1 / 1; justify-self: start; display: block; will-change: transform, filter, opacity; }
.s6 .s6-line { position: absolute; left: 0; width: 1920px; height: 60px; line-height: 60px; text-align: center; white-space: nowrap;
  font-weight: 600; font-size: 44px; letter-spacing: -0.01em; color: var(--ink); }
.s6 .s6-line .w { display: inline-block; will-change: transform, filter, opacity; }
.s6 .s6-ch { position: absolute; left: 0; top: 0; height: 60px; line-height: 60px; text-align: center; white-space: nowrap;
  font-weight: 600; font-size: 44px; letter-spacing: -0.01em; color: var(--ink); visibility: hidden; will-change: transform, opacity, filter; }
`);

  const TEXTS = ['Определяем тематику и нишу', 'Собираем тематическое ядро', 'Считаем объём спроса', 'Снимаем стартовые позиции', 'Находим конкурентов'];
  const LINE_Y = [470, 546, 622, 698, 774];       // центры строк (шаг 76)
  const PILL_UP = 330;                             // y плашки в фазе «список»
  const T_LINE0 = 0.70, T_LINE_STEP = 0.48;        // появление строк
  const T_ARC0 = 3.30, T_ARC_STEP = 0.18, T_ARC_DUR = 0.55;
  const T_SPIN0 = 4.2, T_SPIN1 = 5.8;
  const S = k => 0.35 * k + 0.65 * (0.5 - 0.5 * Math.cos(Math.PI * k));   // мягкий разгон кольца
  const T_FLY0 = 5.3, T_FLY_STEP = 0.15, T_FLY_DUR = 0.40;
  const T_OK = 6.30;
  const RING_R = 345, GAP = 46, CX = 960, CY = 540;
  const TAU = Math.PI * 2;
  const C = TAU * 12;                              // длина окружности спиннера

  let R = {};
  SCENES.add('s6', {
    dur: 7.6,
    build(root) {
      root.classList.add('s6');
      R.glow = el('div', 's6-glow', root);
      R.lines = TEXTS.map((txt, i) => {
        const d = el('div', 's6-line', root); d.style.top = (LINE_Y[i] - 30) + 'px';
        return { node: d, words: splitWords(d, txt) };
      });
      R.chLayer = el('div', '', root); R.chLayer.style.cssText = 'position:absolute;inset:0;';

      // плашка
      const pill = R.pill = el('div', 'an-pill', root);
      const sp = R.sp = el('div', 's6-sp', pill);
      const NS = 'http://www.w3.org/2000/svg';
      sp.innerHTML = `<svg class="ring" viewBox="0 0 30 30" fill="none"><circle cx="15" cy="15" r="12" stroke="rgba(255,255,255,0.3)" stroke-width="3.2"/>
        <circle class="arc" cx="15" cy="15" r="12" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-dasharray="${C / 4} ${C}"/></svg>
        <svg class="ck" viewBox="0 0 30 30" fill="none"><path d="M9.6 15.6 L13.4 19.4 L20.8 11.2" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="17 17" stroke-dashoffset="17"/></svg>`;
      R.ring = sp.querySelector('.ring'); R.arc = sp.querySelector('.arc'); R.ck = sp.querySelector('.ck path');
      const tx = R.tx = el('div', 's6-tx', pill);
      R.tOld = el('span', '', tx, 'Анализируем<i style="font-style:normal">.</i><i style="font-style:normal">.</i><i style="font-style:normal">.</i>');
      R.dots = [...R.tOld.querySelectorAll('i')];
      R.tNew = el('span', '', tx, 'Анализ готов');
      R.wOld = R.tOld.getBoundingClientRect().width;
      R.wNew = R.tNew.getBoundingClientRect().width;
      tx.style.width = R.wOld + 'px';

      // измеряем символы каждой строки в прямом виде
      const info = R.info = [];
      const rg = document.createRange();
      R.lines.forEach((ln, li) => {
        const chars = [];
        ln.words.forEach((w, wi) => {
          const tn = w.firstChild, s = w.textContent;
          for (let c = 0; c < s.length; c++) {
            rg.setStart(tn, c); rg.setEnd(tn, c + 1);
            const r = rg.getBoundingClientRect();
            chars.push({ ch: s[c], x: r.left + r.width / 2, w: r.width });
          }
        });
        const left = chars[0].x - chars[0].w / 2, right = chars[chars.length - 1].x + chars[chars.length - 1].w / 2;
        info.push({ chars, left, len: right - left });
      });
      const sum = info.reduce((a, b) => a + b.len, 0);
      R.f = Math.min(34 / 44, (TAU * RING_R - TEXTS.length * GAP) / sum);
      let th = Math.PI;                                    // старт — «9 часов»
      info.forEach((inf, li) => {
        inf.th0 = th;
        th += (inf.len * R.f + GAP) / RING_R;
        inf.els = inf.chars.map(c => {
          const e = el('span', 's6-ch', R.chLayer, c.ch === ' ' ? '' : c.ch);
          e.style.width = c.w + 'px'; e.style.marginLeft = (-c.w / 2) + 'px'; e.style.marginTop = '0px';
          return e;
        });
        inf.cs = inf.chars.map(c => ((c.x - inf.left) * R.f) / RING_R);       // угол символа внутри строки
        inf.y = LINE_Y[li];
        inf.midA = inf.th0 + (inf.len * R.f / RING_R) / 2;
      });
      // кольцо — конвейер: строки по очереди выезжают снизу (6 часов) и едут по часовой; первой идёт нижняя
            R.phiOf = tt => TAU * S(prog(tt, T_SPIN0, T_SPIN1));       // один полный оборот по часовой
      info.forEach((inf, i) => { inf.tb = 3.95 + 0.16 * i; });
      R.hits = info.map((_, i) => T_FLY0 + i * T_FLY_STEP + T_FLY_DUR);
    },

    seek(t) {
      // ---------- плашка: позиция ----------
      const py = tween(t, [[0.30, CY], [0.75, PILL_UP], [3.30, PILL_UP], [3.75, CY]]);
      let ox = 0, oy = 0, sc = 1, flash = 0;
      R.hits.forEach((h, i) => {
        const b = bump(t, h - 0.08, 0.2);
        sc += 0.07 * b; flash += bump(t, h - 0.08, 0.3);
        const a = R.info[i].midA + 1.4;
        ox -= 3.5 * b * Math.cos(a); oy -= 3.5 * b * Math.sin(a);
      });
      // отлёт
      let fx = 0, blur = 0, stretch = 1;
      if (t >= 6.75) {
        fx = tween(t, [[6.75, 0], [6.9, -20, E.outCubic], [7.25, 1500, E.inCubic]]);
        const k = prog(t, 6.9, 7.25), k2 = k * k;
        blur = 18 * k2; stretch = 1 + 0.3 * k2;
      }
      const gone = t >= 7.25;
      // ширина под текст
      const okK = E.inOutCubic(prog(t, 6.30, 6.65));
      const pw = lerp(400, 400 - (R.wOld - R.wNew), okK);
      const tw = lerp(R.wOld, R.wNew, okK);
      R.pill.style.width = pw.toFixed(2) + 'px'; R.pill.style.marginLeft = (-pw / 2).toFixed(2) + 'px';
      R.tx.style.width = tw.toFixed(2) + 'px';
      R.pill.style.display = gone ? 'none' : 'flex';
      R.pill.style.transform = `translate(${px(ox + fx)},${px(py - CY + oy)}) scale(${(sc * stretch).toFixed(4)},${sc.toFixed(4)})`;
      R.pill.style.filter = blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : 'none';

      // свечение: дышит (период 1.4 с), вспышки при ударах
      const pulse = 0.5 - 0.5 * Math.cos(TAU * t / 1.4);
      const gin = prog(t, 0, 0.5);
      const g = gin * (0.55 + 0.35 * pulse) + 0.5 * flash;
      R.glow.style.display = gone ? 'none' : 'block';
      R.glow.style.opacity = clamp(g, 0, 1).toFixed(3);
      R.glow.style.transform = `translate(${px(ox + fx)},${px(py - CY + oy)}) scale(${(1 + 0.1 * pulse + 0.12 * flash + 0.0).toFixed(3)}, ${(1 + 0.14 * pulse + 0.12 * flash).toFixed(3)})`;
      R.glow.style.filter = blur > 0.05 ? `blur(${(blur * 0.6).toFixed(2)}px)` : 'none';

      // ---------- содержимое плашки ----------
      const inK = prog(t, 0, 0.45), inE = E.outCubic(inK);
      R.sp.style.opacity = inE.toFixed(3);
      R.sp.style.transform = `scale(${lerp(0.6, 1, inE).toFixed(3)})`;
      R.ring.style.transform = `rotate(${(t * 360 * 1.1).toFixed(2)}deg)`;
      const arcLen = lerp(C / 4, C, E.outCubic(prog(t, 6.30, 6.48)));
      R.arc.setAttribute('stroke-dasharray', `${arcLen.toFixed(2)} ${C.toFixed(2)}`);
      R.ck.setAttribute('stroke-dashoffset', (17 * (1 - E.outCubic(prog(t, 6.42, 6.65)))).toFixed(2));
      // текст
      const oldOut = E.inCubic(prog(t, 6.30, 6.60));
      const newIn = E.outCubic(prog(t, 6.35, 6.65));
      R.tOld.style.opacity = (inE * (1 - oldOut)).toFixed(3);
      R.tOld.style.transform = `translateY(${(-16 * oldOut).toFixed(2)}px)`;
      R.tOld.style.filter = (1 - inE) > 0.01 || oldOut > 0.01 ? `blur(${(8 * (1 - inE) + 8 * oldOut).toFixed(2)}px)` : 'none';
      R.tNew.style.opacity = newIn.toFixed(3);
      R.tNew.style.transform = `translateY(${(16 * (1 - newIn)).toFixed(2)}px)`;
      R.tNew.style.filter = newIn < 1 ? `blur(${(8 * (1 - newIn)).toFixed(2)}px)` : 'none';
      const phase = ((t % 1.2) / 1.2);
      R.dots.forEach((d, j) => d.style.opacity = (clamp((phase * 4 - j) * 2.5) * (1 - prog(phase, 0.9, 1))).toFixed(3));

      // ---------- строки ----------
      R.lines.forEach((ln, i) => {
        const ts = T_LINE0 + i * T_LINE_STEP;
        const inArc = t >= 3.30;
        ln.node.style.display = inArc ? 'none' : 'block';
        revealWords(ln.words, t - ts, { stagger: 0.06, dur: 0.5 });
        if (t < ts) ln.words.forEach(w => w.style.opacity = 0);
      });

      // ---------- символы: колонка → вниз за кадр → выезд снизу в кольцо (конвейер) → оборот → в плашку ----------
      const off = tween(t, [[3.30, 0], [3.75, 210, E.inOutCubic], [3.95, 650, E.inCubic]]);
      const phi = R.phiOf(t);
      const ccy = py;
      R.info.forEach((inf, i) => {
        const tsF = T_FLY0 + i * T_FLY_STEP;
        const n = inf.els.length;
        const shown = t >= 3.30 && t < tsF + T_FLY_DUR + 0.09;
                inf.els.forEach((e, c) => {
          if (!shown) { e.style.visibility = 'hidden'; return; }
          let x, y, rot, s, op = 1, bl = 0;
          if (t < tsF) {
            const kb = E.outCubic(prog(t, inf.tb, inf.tb + 0.6));
            if (t < inf.tb) {                                   // ждёт за кадром: прямая строка уехала вниз
              const sy = inf.y + off;
              if (sy - 30 > 1085) { e.style.visibility = 'hidden'; return; }
              x = inf.chars[c].x; y = sy; rot = 0; s = 1;
            } else {
              const th = inf.th0 + inf.cs[c] + phi;
              const rr = RING_R * (1 + 1.1 * (1 - kb));
              x = CX + rr * Math.cos(th); y = ccy + rr * Math.sin(th);
              rot = (th + Math.PI / 2) * 180 / Math.PI; s = R.f;
              op = prog(kb, 0, 0.35); bl = 6 * (1 - prog(kb, 0, 0.7));
            }
          } else {
            const th = inf.th0 + inf.cs[c] + phi;
            const st = 0.08 * c / n;
            const k = prog(t, tsF + st, tsF + st + 0.32);
            const rad = RING_R * (1 - Math.pow(k, 2.2));
            const a = th - 1.8 * k * k * k;                    // уходим назад (против часовой): там строки уже улетели
            x = CX + rad * Math.cos(a); y = CY + rad * Math.sin(a);
            rot = (a + Math.PI / 2) * 180 / Math.PI; s = R.f * lerp(1, 0.25, k);
            op = 1 - prog(k, 0.6, 1); bl = 5 * prog(k, 0.45, 1);
          }
          e.style.visibility = op <= 0.003 ? 'hidden' : 'visible';
          e.style.opacity = op.toFixed(3);
          e.style.filter = bl > 0.05 ? `blur(${bl.toFixed(2)}px)` : 'none';
          e.style.transform = `translate(${x.toFixed(2)}px,${(y - 30).toFixed(2)}px) rotate(${rot.toFixed(2)}deg) scale(${s.toFixed(4)})`;
        });
      });
    },
  });
})();
