#!/bin/bash
# Full film render: N parallel chunks -> concat.  usage: tools/render_full.sh <fps> <scale> <sub> <out.mp4> [chunks]
set -e
FPS=${1:-60}; SCALE=${2:-1}; SUB=${3:-3}; OUT=${4:-out/full_video.mp4}; N=${5:-4}
DUR=127
export FILM_URL=${FILM_URL:-http://127.0.0.1:8765/full/index.html}
mkdir -p out
PRESET=veryfast; CRF=20
if [ "$SCALE" = "1" ]; then PRESET=slow; CRF=16; fi
pids=(); : > out/flist.txt
for i in $(seq 0 $((N-1))); do
  a=$(python3 -c "print(round($i*$DUR/$N*$FPS)/$FPS)"); b=$(python3 -c "print(round(($i+1)*$DUR/$N*$FPS)/$FPS)")
  node tools/render.mjs --out out/fchunk$i.mp4 --from $a --to $b --fps $FPS --scale $SCALE --sub $SUB --preset $PRESET --crf $CRF > out/fchunk$i.log 2>&1 &
  pids+=($!); echo "file 'fchunk$i.mp4'" >> out/flist.txt
done
for p in "${pids[@]}"; do wait $p; done
ffmpeg -v error -y -f concat -safe 0 -i out/flist.txt -c copy "$OUT"
echo RENDER_DONE "$OUT"
