// Stills at given times + a contact sheet.  node tools/snap.mjs <outdir> <scale> t1 t2 ...
import { chromium } from 'playwright';
import { execFileSync } from 'child_process';
import fs from 'fs';
const [out, scaleArg, ...ts] = process.argv.slice(2);
const scale = +scaleArg || 0.5;
fs.mkdirSync(out, { recursive: true });
const exe = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const b = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--font-render-hinting=none'] });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: scale });
p.on('pageerror', e => console.error('PAGEERROR', e.message));
p.on('console', m => { if (m.type() === 'error') console.error('CONSOLE', m.text()); });
await p.goto(process.env.FILM_URL || 'http://127.0.0.1:8765/index.html');
await p.waitForFunction(() => window.READY === true, null, { timeout: 30000 });
const files = [];
for (const t of ts) {
  await p.evaluate(t => { seek(+t); return new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); }, t);
  const f = `${out}/t${(+t).toFixed(2).padStart(6, '0')}.png`;
  await p.screenshot({ path: f });
  files.push([f, t]);
}
await b.close();
// contact sheet with labels
const cols = Math.min(4, files.length);
const args = [];
files.forEach(([f]) => args.push('-i', f));
const w = 480, h = 270;
let filter = files.map(([f, t], i) => `[${i}:v]scale=${w}:${h},drawtext=text='${(+t).toFixed(2)}s':x=8:y=8:fontsize=22:fontcolor=yellow:box=1:boxcolor=black@0.6[v${i}]`).join(';');
const rows = Math.ceil(files.length / cols);
const layout = files.map((_, i) => `${(i % cols) * w}_${Math.floor(i / cols) * h}`).join('|');
filter += ';' + files.map((_, i) => `[v${i}]`).join('') + `xstack=inputs=${files.length}:layout=${layout}:fill=gray[o]`;
if (files.length > 1) execFileSync('ffmpeg', ['-v', 'error', '-y', ...args, '-filter_complex', filter, '-map', '[o]', `${out}/sheet.png`]);
console.log('ok', files.length);
process.exit(0);
