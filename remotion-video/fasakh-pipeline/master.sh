#!/bin/bash
# Final master: -14 LUFS integrated, -1 dBTP, video stream copied
set -e
IN=$1; OUT=$2
M=$(ffmpeg -hide_banner -i "$IN" -vn -af "loudnorm=I=-14:TP=-1.2:LRA=8:print_format=json" -f null - 2>&1 | sed -n '/{/,/}/p')
g(){ echo "$M" | python3 -c "import sys,json;print(json.load(sys.stdin)['$1'])"; }
ffmpeg -v error -y -i "$IN" -map 0:v -map 0:a -c:v copy -af "loudnorm=I=-14:TP=-1.2:LRA=8:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=true,aresample=48000" -c:a aac -b:a 320k -movflags +faststart "$OUT"
