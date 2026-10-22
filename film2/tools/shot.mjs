// node tools/shot.mjs <page> <outprefix> t1 t2 ...   (full-res PNGs)
import { chromium } from 'playwright';
const [page, out, ...ts] = process.argv.slice(2);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox', '--font-render-hinting=none', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
p.on('pageerror', e => console.error('PAGEERROR', e.message)); p.on('console', m => console.error('CONSOLE', m.text()));
await p.goto('http://127.0.0.1:8766/' + page);
await p.waitForFunction(() => window.READY === true, null, { timeout: 30000 });
for (const t of ts) { const t0=Date.now(); await p.evaluate(t => seek(+t), t); await p.screenshot({ path: `${out}_${t}.png` }); console.error(t, Date.now()-t0, 'ms'); }
await b.close();
