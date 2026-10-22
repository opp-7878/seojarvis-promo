"""Sound for film v2: bar-accurate music edit + sound effects on the film's cues.
python3 tools/audio.py              -> audio/music_edit.wav, audio/sfx.wav, audio/mix_novo.wav
python3 tools/audio.py --vo vo.wav  -> also audio/mix_vo.wav (music ducked under the voice)
Music: QMIIR & Akhmedov - HUEGO (Super Slowed), 30 s preview (Apple Music), 98.2 BPM, bar = 2.445 s.
"""
import json, subprocess, sys, wave
import numpy as np

SR = 48000
DUR = 30.0
N = int(DUR * SR)
SRC = 'audio/music-huego-super-slowed-preview.m4a'
SFX = 'audio/sfx_candidates/'
B = 2.445          # bar, seconds (measured: drop onset 9.784 s, bars every 2.445 s)
S0 = 0.004         # bar 0 in the preview

def read(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).copy()

def write(path, x):
    with wave.open(path, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(3); w.setframerate(SR)
        y = (np.clip(x, -1, 1) * (2**23 - 1)).astype(np.int32)
        b = y.astype('<i4').tobytes(); w.writeframes(b''.join(b[i:i+3] for i in range(0, len(b), 4)))

def db(x): return 10 ** (x / 20)

# ---------------------------------------------------------------- music edit
song = read(SRC)
# (film start, source start in bars, length in bars)
EDIT = [
    (0 * B, 0, 2),     # intro, bars 1-2
    (2 * B, 0, 2),     # intro again
    (4 * B, 2, 1),     # bass enters
    (5 * B, 3, 1),     # build
    (6 * B, 4, 4),     # DROP -> dashboard
    (10 * B, 11, 1),   # breakdown -> logo
    (11 * B, 2, 1.45), # bass hit again -> end card, tail faded
]
music = np.zeros((N + SR, 2), np.float32)
XF = int(0.012 * SR)
for f0, sb, nb in EDIT:
    sh = min(0.012, S0 + sb * B) if f0 > 0 else 0   # cut just before the downbeat transient
    s0 = int((S0 + sb * B - sh) * SR); n = int(nb * B * SR); d0 = int((f0 - sh) * SR)
    pre = min(XF, s0)                    # start a few ms early for a crossfade
    seg = song[s0 - pre: s0 + n].copy()
    ramp_in = np.ones(len(seg)); ramp_in[:pre] = np.sin(np.linspace(0, np.pi / 2, pre)) ** 2 if pre else 1
    if not pre: ramp_in[:int(.004 * SR)] = np.linspace(0, 1, int(.004 * SR))
    ramp_out = np.ones(len(seg)); ramp_out[-XF:] = np.cos(np.linspace(0, np.pi / 2, XF)) ** 2
    seg *= (ramp_in * ramp_out)[:, None]
    a = d0 - pre; music[max(0, a): a + len(seg)] += seg[max(0, -a):]
music = music[:N]
t = np.arange(N) / SR
fade = np.clip((DUR - .05 - t) / 1.5, 0, 1) ** 1.6       # last bar fades into silence
music *= fade[:, None]

# ---------------------------------------------------------------- sound effects
LIB = {
    'click':       ['click_01_mixkit-mouse-click-close.wav'],
    'key':         ['type_03_fs-khenshom-macbook-key-a.wav', 'type_04_fs-khenshom-macbook-key-b.wav', 'type_05_fs-khenshom-macbook-key-c.wav', 'type_06_fs-khenshom-macbook-key-d.wav', 'type_01_mixkit-laptop-key.wav'],
    'whoosh_soft': ['whoosh_soft_02_mixkit-fast-swoosh.wav', 'whoosh_soft_03_fs-xkeril-light-air.wav'],
    'whoosh_big':  ['whoosh_big_01_fs-audiopapkin-cinematic-010.wav'],
    'tap':         ['tap_soft_01_fs-nenadsimic-button-tick.wav'],
    'tick':        ['tap_soft_03_fs-malle99-click-tick2.wav'],
    'pop':         ['pop_ui_01_fs-robmarion-ui-confirm.wav'],
    'success':     ['success_02_fs-robmarion-chimes-success4.wav'],
    'impact':      ['impact_low_02_fs-harrisonlace-trailer-boom.wav'],
    'riser':       ['riser_01_mixkit-cinematic-trailer-riser.wav'],
}
# peak level of each role, dBFS before mastering (music peaks near -1)
LEVEL = {'click': -13, 'key': -23, 'whoosh_soft': -21, 'whoosh_big': -16, 'tap': -24, 'tick': -30, 'pop': -19, 'success': -17, 'impact': -10, 'riser': -24}
# where the audible hit sits inside a whoosh file (so the swell lands on the motion)
LEAD = {'whoosh_soft': .12, 'whoosh_big': .45, 'riser': 2.5}
smp = {k: [read(SFX + f) for f in v] for k, v in LIB.items()}
cues = json.load(open('audio/cues.json'))
cues.append({'t': 6 * B, 'k': 'riser', 'g': 1})
sfx = np.zeros((N + 6 * SR, 2), np.float32)
count = {}
for c in cues:
    k = c['k']; i = count.get(k, 0); count[k] = i + 1
    x = smp[k][i % len(smp[k])]
    x = x / (np.abs(x).max() + 1e-9) * db(LEVEL[k]) * c.get('g', 1)
    if k == 'key': x = x * (0.8 + 0.4 * ((i * 0.618) % 1))           # human variation
    a = int((c['t'] - LEAD.get(k, 0)) * SR)
    if a < 0: x = x[-a:]; a = 0
    sfx[a:a + len(x)] += x
sfx = sfx[:N] * fade[:, None]

mix = (music + sfx) * db(-6)
write('audio/music_edit.wav', music); write('audio/sfx.wav', sfx); write('audio/mix_novo.wav', mix)
print('peak music %.1f dB, sfx %.1f dB, mix %.1f dB' % tuple(20 * np.log10(np.abs(v).max() + 1e-9) for v in (music, sfx, mix)))

if '--vo' in sys.argv:
    vo = read(sys.argv[sys.argv.index('--vo') + 1])[:N]
    vo = np.pad(vo, ((0, N - len(vo)), (0, 0)))
    e = np.convolve(np.abs(vo).mean(1), np.ones(int(.05 * SR)) / int(.05 * SR), 'same')
    duck = 1 - (1 - db(-9)) * np.clip(e / (e.max() * .08 + 1e-9), 0, 1)
    k = int(.25 * SR); duck = np.convolve(duck, np.ones(k) / k, 'same')
    write('audio/mix_vo.wav', (music * duck[:, None] + sfx + vo) * db(-6))
