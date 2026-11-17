#!/usr/bin/env bash
# Versi tanpa muzik latar: gambar dari main.mp4 + suara sahaja + outro (SFX ditambah selepas ini).
# Guna: tanpa_muzik.sh <folder_tmp_draf> <outro.mp4> <output.mp4>
set -euo pipefail
ffmpeg -v error -y -i "$1/main.mp4" -i "$1/voice.wav" -i "$2" -filter_complex \
  "[2:v]scale=1080:1920,fps=30,format=yuv420p,setsar=1[ov];[2:a]loudnorm=I=-14:TP=-1.5,aresample=48000,aformat=channel_layouts=stereo[oa];\
[0:v]setsar=1[mv];[1:a]aresample=48000,aformat=channel_layouts=stereo[va];\
[mv][va][ov][oa]concat=n=2:v=1:a=1[v][a]" \
  -map "[v]" -map "[a]" -c:v libx264 -crf 19 -preset medium -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart "$3"
