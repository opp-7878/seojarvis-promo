// Render frames [from, to) seconds to an MP4 segment.
// node tools/render.mjs --out out/seg.mp4 --from 0 --to 30 --fps 30 --scale 0.5 --sub 1
import { chromium } from 'playwright';
import { spawn } from 'child_process';
const A = Object.fromEntries(process.argv.slice(2).reduce((a, v, i, arr) => (v.startsWith('--') && a.push([v.slice(2), arr[i + 1]]), a), []));
const fps = +(A.fps || 30), scale = +(A.scale || 0.5), sub = +(A.sub || 1), from = +(A.from || 0), to = +(A.to || 30);
const W = Math.round(1920 * scale), H = Math.round(1080 * scale);
const exe = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const b = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--font-render-hinting=none'] });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: scale });
p.on('pageerror', e => console.error('PAGEERROR', e.message));
await p.goto(process.env.FILM_URL || 'http://127.0.0.1:8765/index.html');
await p.waitForFunction(() => window.READY === true, null, { timeout: 30000 });
const vf = sub > 1
  ? `tmix=frames=${sub}:weights='${Array(sub).fill(1).join(' ')}',select='eq(mod(n\\,${sub})\\,${sub - 1})',setpts=N/(${fps}*TB),format=yuv420p`
  : 'format=yuv420p';
const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(fps * sub), '-c:v', 'png', '-i', '-',
  '-vf', vf, '-r', String(fps), '-c:v', 'libx264', '-preset', A.preset || 'veryfast', '-crf', A.crf || '18',
  '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709', A.out], { stdio: ['pipe', 'inherit', 'inherit'] });
const n0 = Math.round(from * fps), n1 = Math.round(to * fps);
const t0 = Date.now();
for (let n = n0; n < n1; n++) {
  for (let s = 0; s < sub; s++) {
    // subframes spread over a 180° shutter centred on the frame time
    const t = n / fps + (sub > 1 ? ((s + 0.5) / sub - 0.5) * (0.5 / fps) : 0);
    await p.evaluate(t => seek(t), t);
    const buf = await p.screenshot({ type: 'png' });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
  }
  if ((n - n0) % (fps * 2) === 0) console.error(`${A.out}: ${(n / fps).toFixed(1)}s  ${((Date.now() - t0) / 1000).toFixed(0)}s elapsed`);
}
ff.stdin.end();
await new Promise(r => ff.on('close', r));
await b.close();
console.error('done', A.out, ((Date.now() - t0) / 1000).toFixed(0) + 's');
process.exit(0);
