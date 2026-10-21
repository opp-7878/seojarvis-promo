#!/bin/bash
# Final render: 4 parallel chunks -> concat -> mux audio.  usage: tools/render_all.sh [sub]
set -e
SUB=${1:-3}
mkdir -p out
pids=()
for i in 0 1 2 3; do
  a=$(python3 -c "print($i*7.5)"); b=$(python3 -c "print(($i+1)*7.5)")
  node tools/render.mjs --out out/chunk$i.mp4 --from $a --to $b --fps 60 --scale 1 --sub $SUB --preset slow --crf 16 > out/chunk$i.log 2>&1 &
  pids+=($!)
done
for p in "${pids[@]}"; do wait $p; done
printf "file 'chunk0.mp4'\nfile 'chunk1.mp4'\nfile 'chunk2.mp4'\nfile 'chunk3.mp4'\n" > out/list.txt
ffmpeg -v error -y -f concat -safe 0 -i out/list.txt -c copy out/video.mp4
echo RENDER_DONE
