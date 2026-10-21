#!/bin/bash
# Master the mix to -14 LUFS / -1 dBTP and mux with out/video.mp4 -> deliver/<name>.mp4
# usage: tools/master.sh audio/mix_novo.wav deliver/seojarvis-preview-v1-novo.mp4
set -e
IN=$1; OUT=$2
mkdir -p "$(dirname "$OUT")"
J=$(ffmpeg -v info -i "$IN" -af loudnorm=I=-14:TP=-1:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
g(){ echo "$J" | python3 -c "import sys,json;print(json.load(sys.stdin)['$1'])"; }
ffmpeg -v error -y -i "$IN" -af "loudnorm=I=-14:TP=-1:LRA=11:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=true,aresample=48000" -c:a pcm_s16le out/master.wav
ffmpeg -v error -y -i out/video.mp4 -i out/master.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -movflags +faststart -shortest "$OUT"
ffmpeg -v info -i "$OUT" -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I:|Peak:)"
