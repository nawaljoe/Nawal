#!/usr/bin/env bash
# Final delivery: HyperFrames picture + the mastered voice (not the renderer's mix), TikTok/Reels spec.
# H.264 High@4.2, yuv420p, BT.709, 30 fps CFR, AAC-LC 320 kb/s 48 kHz stereo, faststart.
set -euo pipefail
IN=${1:-renders/hf_render.mp4}; VOICE=${2:-assets/voice_master.wav}; OUT=${3:-renders/tausiah_final_1080x1920.mp4}
ffmpeg -v error -y -i "$IN" -i "$VOICE" -map 0:v:0 -map 1:a:0 \
  -c:v libx264 -profile:v high -level:v 4.2 -preset slow -crf 16 -maxrate 16M -bufsize 32M \
  -pix_fmt yuv420p -r 30 -g 60 -color_primaries bt709 -color_trc bt709 -colorspace bt709 -color_range tv \
  -c:a aac -b:a 320k -ar 48000 -ac 2 -af apad -t 72.1 -movflags +faststart \
  -metadata title="Tazkirah: Langkah ke Masjid" "$OUT"
echo "wrote $OUT"
