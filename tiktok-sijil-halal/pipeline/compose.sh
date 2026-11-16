#!/usr/bin/env bash
# Final FFmpeg pass: base picture -> Remotion infographics -> HyperFrames typography, plus the mixed audio.
#   ./compose.sh base.mp4 rem.mov hf.mov mix.wav final.mp4
set -euo pipefail
ffmpeg -nostdin -v error -stats -y -i "$1" -i "$2" -i "$3" -i "$4" -filter_complex \
  "[0:v][1:v]overlay=format=auto:eof_action=pass[v1];[v1][2:v]overlay=format=auto:eof_action=pass,format=yuv420p[v]" \
  -map "[v]" -map 3:a -r 30 -c:v libx264 -preset slow -crf 17 -profile:v high -level 4.2 -g 60 \
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 \
  -c:a aac -b:a 192k -ar 48000 -movflags +faststart -shortest "$5"
