// Таймлайн ролика v2. Порядок и длительности сцен — здесь. Сцена получает локальное время t (0..dur).
// index.html?scene=s4 — показать только одну сцену (время от 0), удобно для отладки.
(function () {
  const ORDER = ['s1', 's2', 's3', 's4', 's5', 's6'];
  // сетка из точек: прозрачность по общему времени (ключи [t, opacity]); подставляется после сборки таймлайна
  const DOTS = id => ({ s3: 1, s6: 1 })[id] || 0;

  const only = new URLSearchParams(location.search).get('scene');
  let TL = [];

  async function boot() {
    await document.fonts.ready;
    await Promise.all([...document.images].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; })));
    const stage = document.getElementById('stage');
    let t0 = 0;
    for (const id of (only ? [only] : ORDER)) {
      const s = SCENES.get(id);
      if (!s) { console.error('нет сцены', id); continue; }
      const root = el('div', 'scene ' + id, stage);
      root.id = 'scene-' + id;
      root.style.display = 'block';           // build видит реальную вёрстку
      await s.build(root);
      root.style.display = 'none';
      TL.push({ id, s, root, start: t0, end: t0 + s.dur });
      t0 += s.dur;
    }
    window.DURATION = t0;
    window.TIMELINE = TL.map(x => ({ id: x.id, start: +x.start.toFixed(3), end: +x.end.toFixed(3) }));
    seek(0);
    window.READY = true;
  }

  const dots = document.getElementById('bg-dots');
  window.seek = function (t) {
    let dotOp = 0;
    TL.forEach((x, i) => {
      const last = i === TL.length - 1;
      const on = t >= x.start && (t < x.end || (last && t <= x.end + 1));
      x.root.style.display = on ? 'block' : 'none';
      if (on) {
        const lt = Math.min(t - x.start, x.s.dur);
        x.s.seek(lt);
        // точки плавно входят/выходят по 0.6 с на краях сцены
        const d = DOTS(x.id);
        if (d) dotOp = d * Math.min(prog(lt, 0, 0.6), 1 - prog(lt, x.s.dur - 0.6, x.s.dur));
        if (x.s.dots != null) dotOp = typeof x.s.dots === 'function' ? x.s.dots(lt) : x.s.dots;
      }
    });
    dots.style.opacity = (0.55 * dotOp).toFixed(3);
    window.T_NOW = t;
  };

  window.addEventListener('load', boot);
})();
