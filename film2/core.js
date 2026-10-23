// Ядро ролика v2: время, сглаживание, общие компоненты. Каждая сцена — scenes/sN-*.js, регистрируется через SCENES.add().
// Правило: состояние кадра зависит ТОЛЬКО от t (никаких setTimeout, CSS-transition/animation, Math.random без seed).
(function () {
  const W = 1920, H = 1080;

  // ---------- математика ----------
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const lerp = (a, b, k) => a + (b - a) * k;
  // прогресс 0..1 от a до b
  const prog = (t, a, b) => clamp((t - a) / (b - a));
  const E = {
    linear: k => k,
    inQuad: k => k * k,
    outQuad: k => 1 - (1 - k) * (1 - k),
    inCubic: k => k * k * k,
    outCubic: k => 1 - Math.pow(1 - k, 3),
    inOutCubic: k => k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2,
    outQuart: k => 1 - Math.pow(1 - k, 4),
    inOutQuart: k => k < 0.5 ? 8 * k ** 4 : 1 - Math.pow(-2 * k + 2, 4) / 2,
    outExpo: k => k >= 1 ? 1 : 1 - Math.pow(2, -10 * k),
    inExpo: k => k <= 0 ? 0 : Math.pow(2, 10 * k - 10),
    inOutExpo: k => k <= 0 ? 0 : k >= 1 ? 1 : k < 0.5 ? Math.pow(2, 20 * k - 10) / 2 : (2 - Math.pow(2, -20 * k + 10)) / 2,
    outBack: (k, s = 1.70158) => 1 + (s + 1) * Math.pow(k - 1, 3) + s * Math.pow(k - 1, 2),
  };
  // плавная пружина без «дёргания» на конце: 0→1 с перелётом ~6%
  E.springSoft = k => { if (k <= 0) return 0; if (k >= 1) return 1; return 1 - Math.exp(-7 * k) * Math.cos(9 * k); };
  // сглаженная функция между ключами: tween(t, [[t0,v0],[t1,v1],...], ease)
  function tween(t, keys, ease = E.inOutCubic) {
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) {
      const [t1, v1, e] = keys[i];
      const [t0, v0] = keys[i - 1];
      if (t <= t1) return lerp(v0, v1, (e || ease)(prog(t, t0, t1)));
    }
    return keys[keys.length - 1][1];
  }
  // «удар»: 0 → 1 → 0 за время d начиная с a (синус), для пульсов при клике
  const bump = (t, a, d) => { const k = prog(t, a, a + d); return k <= 0 || k >= 1 ? 0 : Math.sin(Math.PI * k); };
  // детерминированный random
  function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

  // ---------- DOM ----------
  function el(tag, cls, parent, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    if (parent) parent.appendChild(e);
    return e;
  }
  function injectCSS(css) { const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s); }
  // позиция элемента в координатах кадра 1920×1080 (без учёта текущих transform родителей — вызывать в build, до анимаций)
  function rectOf(node) { const r = node.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height, cx: r.left + r.width / 2, cy: r.top + r.height / 2 }; }
  const px = v => v.toFixed(2) + 'px';

  const LOGO_SVG = `<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="LG__ID__" x1="6.44" y1="-33.1" x2="43.28" y2="-25.93" gradientUnits="userSpaceOnUse"><stop stop-color="#0B64F4"/><stop offset="1" stop-color="#1AA2E6"/></linearGradient></defs>
<path d="M24 0H8C3.58 0 0 3.58 0 8V24C0 28.42 3.58 32 8 32H24C28.42 32 32 28.42 32 24V8C32 3.58 28.42 0 24 0Z" fill="url(#LG__ID__)"/>
<path d="M25.0111 13.2056C25.2516 16.1344 23.9056 10.7651 18.5327 10.8046C12.8162 10.6513 11.8413 16.2738 12.1908 13.1058C12.5403 9.93777 15.0655 7.13892 18.5298 7.13892C21.9941 7.13892 24.7706 10.2769 25.0111 13.2056Z" fill="white"/>
<path d="M6.98889 18.8921C6.74837 15.9634 8.09435 21.3326 13.4673 21.2931C19.1838 21.4464 20.1588 15.8239 19.8092 18.992C19.4597 22.16 16.9345 24.9588 13.4702 24.9588C10.0059 24.9588 7.2294 21.8209 6.98889 18.8921Z" fill="white"/>
<path d="M18.8222 24.9733C15.8949 25.2139 21.2614 23.8673 21.2219 18.4916C21.3751 12.7721 15.7555 11.7967 18.9219 12.1464C22.0883 12.4961 24.8857 15.0226 24.8857 18.4887C24.8857 21.9548 21.7494 24.7327 18.8222 24.9733Z" fill="white"/>
<path d="M13.3058 7.02663C16.233 6.78599 10.8665 8.13266 10.906 13.5084C10.7528 19.2278 16.3724 20.2032 13.206 19.8535C10.0396 19.5038 7.24219 16.9773 7.24219 13.5113C7.24219 10.0452 10.3785 7.26727 13.3058 7.02663Z" fill="white"/></svg>`;
  let logoN = 0;
  // логотип-знак SVG (уникальный id градиента на каждый экземпляр)
  const logoSVG = () => LOGO_SVG.replace(/__ID__/g, '_' + (++logoN));

  // ---------- курсор macOS ----------
  // const c = makeCursor(root); c.set(x, y, {press:0..1, opacity:0..1, scale:1})
  // (x,y) — кончик стрелки в координатах кадра.
  function makeCursor(parent) {
    const ring = el('div', 'cursor-ring', parent);
    const e = el('div', 'cursor', parent, `<svg viewBox="0 0 28 28"><path d="M6 3.2 L6 22.6 L10.7 18.3 L13.7 25.1 L17.1 23.6 L14.2 17 L20.6 17 Z" fill="#111" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>`);
    return {
      el: e,
      set(x, y, o = {}) {
        const press = o.press || 0, op = o.opacity == null ? 1 : o.opacity, sc = (o.scale || 1) * (1 - 0.14 * press);
        e.style.opacity = op;
        e.style.transform = `translate(${px(x - 6 * 40 / 28)},${px(y - 3.2 * 40 / 28)}) scale(${sc.toFixed(4)})`;
        // кольцо-отклик клика: o.ring 0..1 (растёт и гаснет)
        const r = o.ring || 0;
        ring.style.opacity = r > 0 && r < 1 ? (1 - r) * op : 0;
        ring.style.transform = `translate(${px(x)},${px(y)}) scale(${(0.4 + r * 1.1).toFixed(3)})`;
      },
    };
  }
  // траектория курсора по ключам [[t,x,y],...] с плавной дугой. Возвращает {x,y}
  function path2(t, keys, ease = E.inOutCubic) {
    return { x: tween(t, keys.map(k => [k[0], k[1]]), ease), y: tween(t, keys.map(k => [k[0], k[2]]), ease) };
  }

  // ---------- эффект появления слов (как в ролике Spotify, «Collect what you love») ----------
  // Каждое слово по очереди слева направо: из прозрачности + размытия, со сдвигом вправо и лёгким наклоном курсивом,
  // встаёт на место. Использование:
  //   const words = splitWords(node, 'Текст строки');   // в build
  //   revealWords(words, t - start, {stagger:0.07, dur:0.5}); // в seek
  function splitWords(node, text) {
    node.innerHTML = '';
    const parts = text.split(' ');
    return parts.map((w, i) => {
      const s = el('span', 'w', node); s.textContent = w;
      if (i < parts.length - 1) node.appendChild(document.createTextNode(' '));
      return s;
    });
  }
  function revealWords(words, t, o = {}) {
    const st = o.stagger ?? 0.07, d = o.dur ?? 0.55, dx = o.dx ?? 0.45, blur = o.blur ?? 14, skew = o.skew ?? -10;
    words.forEach((w, i) => {
      const k = prog(t, i * st, i * st + d);
      const e = E.outCubic(k), eo = E.outQuad(prog(t, i * st, i * st + d * 0.7));
      w.style.opacity = eo.toFixed(3);
      w.style.filter = k >= 1 ? 'none' : `blur(${(blur * (1 - e)).toFixed(2)}px)`;
      w.style.transform = k >= 1 ? 'none' : `translateX(${(dx * (1 - e)).toFixed(3)}em) skewX(${(skew * (1 - e)).toFixed(2)}deg)`;
    });
  }
  // обратный эффект (уход): слова гаснут в размытие с уходом влево
  function hideWords(words, t, o = {}) {
    const st = o.stagger ?? 0.04, d = o.dur ?? 0.35;
    words.forEach((w, i) => {
      const k = E.inCubic(prog(t, i * st, i * st + d));
      if (k <= 0) return;
      w.style.opacity = (1 - k).toFixed(3);
      w.style.filter = `blur(${(12 * k).toFixed(2)}px)`;
      w.style.transform = `translateX(${(-0.3 * k).toFixed(3)}em)`;
    });
  }

  // набор текста: сколько символов видно к моменту t (cps — символов в секунду)
  const typed = (str, t, start, cps = 18) => str.slice(0, Math.max(0, Math.floor((t - start) * cps)));


  // ---------- главный заголовок «Всё для продвижения / в одном кабинете» ----------
  // Одинаковый в сценах 2 и 3 (стык без склейки). Блок из двух строк центрирован в кадре (центр по y = 540).
  const HEADLINE = ['Всё для продвижения', 'в одном кабинете'];
  function makeHeadline(parent) {
    const node = el('div', 'headline', parent);
    const lineEls = [], lines = [];
    HEADLINE.forEach(txt => { const l = el('div', 'line', node); lineEls.push(l); lines.push(splitWords(l, txt)); });
    const lh = 104 * 1.08;
    node.style.top = px(540 - lh);           // две строки: верх блока = 540 − одна строка
    node.style.transformOrigin = '960px ' + px(lh) + ' ';
    return { node, lineEls, lines, words: lines.flat() };
  }

  // ---------- макет MacBook (assets/macbook.png, вырезан из фото заказчика) ----------
  // PNG 1410×880, экран внутри PNG — прозрачный: контент экрана кладётся ПОД картинку.
  // screen: x,y,w,h в пикселях PNG; r — радиус верхних углов экрана; notch — вырез камеры (в нём ничего важного).
  const LAPTOP = { src: 'assets/macbook.png', w: 1410, h: 880,
    screen: { x: 129.6, y: 31.0, w: 1160.4, h: 740.0, r: 6.5 },
    notch: { x0: 653.1, x1: 762.6, bottom: 50.4 } };

  // ---------- реестр сцен ----------
  const list = [];
  const SCENES = {
    list,
    add(id, def) { list.push(Object.assign({ id }, def)); },
    get(id) { return list.find(s => s.id === id); },
  };

  Object.assign(window, { W, H, clamp, lerp, prog, E, tween, bump, rng, el, injectCSS, rectOf, px, logoSVG, makeCursor, path2,
    splitWords, revealWords, hideWords, typed, SCENES, HEADLINE, makeHeadline, LAPTOP });
})();
