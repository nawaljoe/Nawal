#!/usr/bin/env bash
# Final master: two-pass loudness to -14 LUFS / -1.5 dBTP (social) + delivery video:
# H.264 High, yuv420p TV range BT.709 (Remotion writes full-range yuvj420p from JPEG frames), CRF 17, faststart.
set -euo pipefail
cd "$(dirname "$0")/.."
IN=out/raw.mp4; OUT=out/SemarakSubuh2026_9x16.mp4
J=$(ffmpeg -hide_banner -i "$IN" -af loudnorm=I=-14:TP=-1.5:LRA=9:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
m(){ echo "$J" | python3 -c "import json,sys;print(json.load(sys.stdin)['$1'])"; }
ffmpeg -v error -y -i "$IN" -vf "scale=in_range=pc:out_range=tv,format=yuv420p" -c:v libx264 -preset slow -crf 17 -profile:v high -color_range tv -colorspace bt709 -color_primaries bt709 -color_trc bt709 -af "loudnorm=I=-14:TP=-1.5:LRA=9:measured_I=$(m input_i):measured_TP=$(m input_tp):measured_LRA=$(m input_lra):measured_thresh=$(m input_thresh):offset=$(m target_offset):linear=true" -c:a aac -b:a 320k -ar 48000 -movflags +faststart "$OUT"
echo "wrote $OUT"
