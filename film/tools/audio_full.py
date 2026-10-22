"""Звук полного ролика: музыка Mixkit, растянутая до 2:07 повтором тактов, + синтезированные звуки по меткам анимации.
node tools/cues.mjs (FILM_URL=.../full/index.html) -> audio/cues_full.json;  python3 tools/audio_full.py -> audio/full_mix_novo.wav
"""
import json, subprocess, sys, wave
import numpy as np
SR = 48000
MUSIC_SRC = 'audio/music-mixkit-720-opalescent.mp3'
DROP = 22.909                 # удар в треке
BAR = 4 * 60 / 123            # 1.9512 с
cues = json.load(open('audio/cues_full.json'))
DUR = cues['dur']
rng = np.random.default_rng(3)
N = int(DUR * SR)

sfx = np.zeros((N + SR, 2), np.float32)
def read_audio(path, start=0.0, dur=None):
    cmd = ['ffmpeg', '-v', 'error', '-ss', str(start), '-i', path]
    if dur: cmd += ['-t', str(dur)]
    cmd += ['-ac', '2', '-ar', str(SR), '-f', 's16le', '-']
    raw = subprocess.run(cmd, capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.int16).astype(np.float32).reshape(-1, 2) / 32768

def write(path, x):
    x = np.clip(x, -1, 1)
    with wave.open(path, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((x * 32767).astype(np.int16).tobytes())

def env(n, a=0.002, d=0.08):
    t = np.arange(n) / SR
    return np.minimum(1, t / a) * np.exp(-t / d)

def lp(x, fc):            # one-pole low-pass
    a = np.exp(-2 * np.pi * fc / SR); y = np.empty_like(x); s = 0.0
    for i, v in enumerate(x): s = (1 - a) * v + a * s; y[i] = s
    return y

def hp(x, fc): return x - lp(x, fc)

def click():
    n = int(0.05 * SR); t = np.arange(n) / SR
    body = np.sin(2 * np.pi * 1850 * t) * env(n, 0.0005, 0.006)
    tick = hp(rng.standard_normal(n), 2500) * env(n, 0.0003, 0.003) * 0.6
    low = np.sin(2 * np.pi * 180 * t) * env(n, 0.001, 0.012) * 0.5
    return (body * 0.5 + tick + low) * 0.9

def key():
    n = int(0.03 * SR)
    return hp(rng.standard_normal(n), 1800) * env(n, 0.0004, 0.004) * 0.35

def whoosh(d=0.42):
    n = int(d * SR); t = np.arange(n) / SR
    noise = rng.standard_normal(n)
    sweep = np.zeros(n); fc0, fc1 = 300, 2600
    # time-varying lowpass by blending two filtered copies
    a = lp(noise, fc0); b = lp(noise, fc1); k = np.sin(np.pi * t / d) ** 2
    shape = np.sin(np.pi * np.clip(t / d, 0, 1)) ** 1.5
    return (a * (1 - k) + b * k) * shape * 0.22

def blip(freq):
    n = int(0.22 * SR); t = np.arange(n) / SR
    s = np.sin(2 * np.pi * freq * t) + 0.25 * np.sin(2 * np.pi * freq * 2 * t)
    return s * env(n, 0.002, 0.07) * 0.16

def thump():
    n = int(0.9 * SR); t = np.arange(n) / SR
    f = 48 + 60 * np.exp(-t / 0.05)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.002, 0.28)
    air = lp(rng.standard_normal(n), 900) * env(n, 0.004, 0.12) * 0.3
    return (s + air) * 0.55

def riser(d=1.6):
    n = int(d * SR); t = np.arange(n) / SR
    noise = hp(rng.standard_normal(n), 600)
    k = (t / d) ** 2.2
    return lp(noise, 4000) * k * 0.08

def put(sig, t, gain=1.0, pan=0.0):
    """Place a sound so that its own peak lands on time t."""
    pk = int(np.argmax(np.abs(sig)))
    i0 = int(t * SR) - pk
    if i0 < 0: sig = sig[-i0:]; i0 = 0
    seg = sig[: len(sfx) - i0] * gain
    sfx[i0:i0 + len(seg), 0] += seg * (1 - max(0, pan))
    sfx[i0:i0 + len(seg), 1] += seg * (1 + min(0, pan))


song = read_audio(MUSIC_SRC)
def seg(a, b): return song[int(a * SR):int(b * SR)]
# 1) до удара: 0..19.006, затем повтор с 9.25 (5 тактов) — удар попадает на cues['peak']
J1 = DROP - 2 * BAR; B1 = J1 - 5 * BAR
# 2) после удара: до Y, затем назад на 14 тактов и до конца трека
Y = DROP + 20 * BAR; B2 = Y - 14 * BAR
parts = [seg(0, J1), seg(B1, Y), seg(B2, len(song) / SR)]
XF = int(0.03 * SR)
music = parts[0]
for p in parts[1:]:
    w = np.linspace(0, 1, XF)[:, None]
    music = np.concatenate([music[:-XF], music[-XF:] * (1 - w) + p[:XF] * w, p[XF:]])
lead = cues['peak'] - (J1 + (DROP - B1))
print('drop lands at', round(J1 + DROP - B1, 3), 'peak', cues['peak'])
if lead > 0: music = np.concatenate([np.zeros((int(lead * SR), 2), np.float32), music])
else: music = music[int(-lead * SR):]
music = music[:N]
if len(music) < N: music = np.pad(music, ((0, N - len(music)), (0, 0)))
t = np.arange(N) / SR
music *= (np.minimum(1, t / 0.2) * np.clip((DUR - t) / 1.5, 0, 1) ** 1.5)[:, None]

for t0 in cues['clicks']: put(click(), t0, 0.5)
for t0 in cues['whoosh']: put(whoosh(), t0 + 0.12, 0.6)
for t0, n, rate in cues['type']:
    for i in range(n): put(key(), t0 + i * rate, 0.45 * (0.8 + 0.4 * rng.random()), pan=rng.uniform(-.2, .2))
penta = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5]
for i, t0 in enumerate(cues['ticks']): put(blip(penta[i % 6]), t0, 0.45)
for t0 in cues['pops']: put(blip(1046.5) + np.pad(blip(1568.0), (int(.05 * SR), 0))[:len(blip(1046.5))], t0, 0.5)
for t0 in cues['impacts']: put(thump(), t0, 0.45)
put(riser(1.7), cues['peak'] - 0.05, 1.0)
put(thump(), cues['peak'], 0.9)
sfx = sfx[:N]

def write(path, x):
    x = np.clip(x, -1, 1)
    with wave.open(path, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((x * 32767).astype(np.int16).tobytes())
write('audio/full_music.wav', music)
write('audio/full_sfx.wav', sfx)
write('audio/full_mix_novo.wav', music + sfx * 0.55)
