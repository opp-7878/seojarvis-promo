"""Sound pass: music bed + synthesized UI sounds placed on the film's cues.
python3 tools/audio.py            -> audio/sfx.wav, audio/music.wav, audio/mix_novo.wav
python3 tools/audio.py --vo vo.wav -> also audio/mix_vo.wav (music ducked under the voice)
"""
import json, subprocess, sys, wave
import numpy as np

SR = 48000
DUR = 30.0
MUSIC_SRC = 'audio/music-mixkit-720-opalescent.mp3'
DROP_IN_SONG = 22.909          # measured kick onset in the track
cues = json.load(open('audio/cues.json'))
SONG_OFF = DROP_IN_SONG - cues['peak']   # song time at film t=0
rng = np.random.default_rng(3)
N = int(DUR * SR)

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

sfx = np.zeros((N + SR, 2), np.float32)

def put(sig, t, gain=1.0, pan=0.0):
    """Place a sound so that its own peak lands on time t."""
    pk = int(np.argmax(np.abs(sig)))
    i0 = int(t * SR) - pk
    if i0 < 0: sig = sig[-i0:]; i0 = 0
    seg = sig[: len(sfx) - i0] * gain
    sfx[i0:i0 + len(seg), 0] += seg * (1 - max(0, pan))
    sfx[i0:i0 + len(seg), 1] += seg * (1 + min(0, pan))

for t in cues['clicks']: put(click(), t, 0.55)
for t in cues['whoosh']: put(whoosh(), t + 0.12, 0.8)
for t0, n, rate in cues['type']:
    for i in range(n): put(key(), t0 + i * rate, 0.5 * (0.8 + 0.4 * rng.random()), pan=rng.uniform(-.2, .2))
penta = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5]   # C major pentatonic, rising
for i, t in enumerate(cues['ticks']): put(blip(penta[i]), t, 0.9)
put(riser(1.7), cues['peak'] - 0.05, 1.0)
put(thump(), cues['peak'], 0.9)
put(whoosh(0.6), cues['theme'] + 0.15, 0.7)
sfx = sfx[:N]

music = read_audio(MUSIC_SRC, SONG_OFF, DUR)[:N]
if len(music) < N: music = np.pad(music, ((0, N - len(music)), (0, 0)))
t = np.arange(N) / SR
fade = np.minimum(1, t / 0.25) * np.clip((DUR - t) / 1.8, 0, 1) ** 1.5
music *= fade[:, None]

write('audio/sfx.wav', sfx)
write('audio/music.wav', music)

def mix(m_gain_curve, vo=None):
    x = music * m_gain_curve[:, None] + sfx * 0.55
    if vo is not None: x = x + vo
    return x

write('audio/mix_novo.wav', mix(np.full(N, 1.0)))

if '--vo' in sys.argv:
    vo = read_audio(sys.argv[sys.argv.index('--vo') + 1], 0, DUR)[:N]
    vo = np.pad(vo, ((0, N - len(vo)), (0, 0)))
    # duck the music ~9 dB while the voice is speaking (smoothed envelope)
    e = np.abs(vo).mean(1); k = int(0.25 * SR)
    e = np.convolve(e, np.ones(k) / k, 'same'); speaking = (e > 0.01).astype(float)
    sm = np.convolve(speaking, np.ones(int(0.2 * SR)) / int(0.2 * SR), 'same')
    duck = 1 - sm * (1 - 10 ** (-9 / 20))
    write('audio/mix_vo.wav', mix(duck, vo * 1.0))
print('song offset', round(SONG_OFF, 3))
