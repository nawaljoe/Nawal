#!/usr/bin/env bash
# Picture: 30 fps CFR -> EDL cuts -> light denoise -> natural warm grade -> lanczos upscale
# -> 1620x2880 plate (1.5x the 1080x1920 canvas so HyperFrames punch-ins downsample, never blur).
set -euo pipefail
SRC=${1:?source video}; OUT=${2:-assets/plate.mp4}
HERE=$(cd "$(dirname "$0")" && pwd)
GRADE="huesaturation=hue=-8:saturation=-0.4:colors=y+g:strength=5,\
colortemperature=temperature=5900:mix=0.35:pl=0.5,\
curves=master='0/0.015 0.12/0.095 0.5/0.5 0.82/0.855 1/0.985',eq=contrast=1.05:saturation=1.05"
TAIL=$(python3 "$HERE/edl.py" tail)
FC="[0:v]fps=30,setpts=N/30/TB[v];$(python3 "$HERE/edl.py" video);\
[vc]hqdn3d=1.5:1.5:4:4,$GRADE,scale=1620:2905:flags=lanczos+accurate_rnd+full_chroma_int,\
crop=1620:2880:0:12,unsharp=5:5:0.35:5:5:0,tpad=stop_mode=clone:stop_duration=$TAIL,format=yuv420p[out]"
ffmpeg -v error -y -i "$SRC" -filter_complex "$FC" -map "[out]" -an -c:v libx264 -preset slow -crf 14 \
  -g 30 -keyint_min 30 -sc_threshold 0 -pix_fmt yuv420p -movflags +faststart "$OUT"
echo "wrote $OUT"
