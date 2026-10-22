// Contact sheet: node tools/sheet.mjs <out.jpg> <cols> t1 t2 ...   (renders at half size, labels with time)
import { chromium } from 'playwright';
import { execFileSync } from 'child_process';
import fs from 'fs';
const [out, colsArg, ...ts] = process.argv.slice(2);
const cols = +colsArg || 4, dir = out + '.d'; fs.mkdirSync(dir, { recursive: true });
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox', '--font-render-hinting=none', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: +(process.env.SCALE || .5) });
p.on('pageerror', e => console.error('PAGEERROR', e.message));
await p.goto(process.env.FILM_URL || 'http://127.0.0.1:8766/index.html');
await p.waitForFunction(() => window.READY === true, null, { timeout: 60000 });
const files = [];
for (const t of ts) { await p.evaluate(t => seek(+t), t); const f = `${dir}/t${(+t).toFixed(2).padStart(6, '0')}.png`; await p.screenshot({ path: f }); files.push([f, t]); }
await b.close();
const w = 640, h = 360, args = [];
files.forEach(([f]) => args.push('-i', f));
let fl = files.map(([f, t], i) => `[${i}:v]scale=${w}:${h},drawtext=text='${(+t).toFixed(2)}':x=8:y=8:fontsize=22:fontcolor=yellow:box=1:boxcolor=black@0.6[v${i}]`).join(';');
const layout = files.map((_, i) => `${(i % cols) * w}_${Math.floor(i / cols) * h}`).join('|');
fl += ';' + files.map((_, i) => `[v${i}]`).join('') + `xstack=inputs=${files.length}:layout=${layout}:fill=gray[o]`;
execFileSync('ffmpeg', ['-v', 'error', '-y', ...args, '-filter_complex', fl, '-map', '[o]', '-q:v', '3', out]);
console.log('ok', out);
