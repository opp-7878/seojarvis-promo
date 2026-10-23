#!/usr/bin/env bash
# Черновой рендер всего ролика v2: 4 параллельных куска → склейка.
# tools/render_draft.sh [fps=30] [scale=1] [sub=1] [out=out/draft.mp4]
set -e
cd "$(dirname "$0")/.."
FPS=${1:-30}; SCALE=${2:-1}; SUB=${3:-1}; OUT=${4:-out/draft.mp4}
mkdir -p out
DUR=$(node -e "
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch({executablePath:process.env.CHROME||'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--no-sandbox']});
const p=await b.newPage();await p.goto('http://127.0.0.1:8765/film2/index.html');await p.waitForFunction(()=>window.READY===true);console.log(await p.evaluate(()=>DURATION));await b.close();})()")
N=4; STEP=$(python3 -c "print($DUR/$N)")
for i in $(seq 0 $((N-1))); do
  A=$(python3 -c "print(round($i*$STEP*$FPS)/$FPS)"); B=$(python3 -c "print(round(($i+1)*$STEP*$FPS)/$FPS)")
  node tools/render.mjs --out out/part$i.mp4 --from $A --to $B --fps $FPS --scale $SCALE --sub $SUB &
done
wait
: > out/list.txt; for i in $(seq 0 $((N-1))); do echo "file 'part$i.mp4'" >> out/list.txt; done
ffmpeg -v error -y -f concat -safe 0 -i out/list.txt -c copy "$OUT"
echo "готово: $OUT ($DUR с)"
