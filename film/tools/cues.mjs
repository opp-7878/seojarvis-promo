// Dump the film's sound cues (window.CUES) to audio/cues.json
import { chromium } from 'playwright';
import fs from 'fs';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
const p = await b.newPage();
await p.goto(process.env.FILM_URL || 'http://127.0.0.1:8765/index.html');
await p.waitForFunction(() => window.READY === true);
fs.writeFileSync('audio/cues.json', JSON.stringify(await p.evaluate(() => window.CUES), null, 1));
await b.close(); process.exit(0);
