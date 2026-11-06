#!/bin/bash
# Final audio master: two-pass loudnorm to -14 LUFS / -1 dBTP (TikTok/IG level),
# video stream copied untouched. Usage: scripts/master.sh in.mp4 out.mp4 [seconds=60]
set -euo pipefail
in=$1; out=$2; dur=${3:-60}
stats=$(ffmpeg -hide_banner -i "$in" -af loudnorm=I=-14:TP=-1.0:LRA=9:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
get() { echo "$stats" | python3 -c "import json,sys; print(json.load(sys.stdin)['$1'])"; }
ffmpeg -y -hide_banner -loglevel error -i "$in" -c:v copy -af \
  "loudnorm=I=-14:TP=-1.0:LRA=9:measured_I=$(get input_i):measured_TP=$(get input_tp):measured_LRA=$(get input_lra):measured_thresh=$(get input_thresh):offset=$(get target_offset):linear=true,aresample=48000" \
  -c:a aac -b:a 192k -movflags +faststart -t "$dur" "$out"
echo "mastered -> $out"
