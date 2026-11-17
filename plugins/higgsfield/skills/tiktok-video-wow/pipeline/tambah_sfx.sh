#!/usr/bin/env bash
# Campur trek SFX ke dalam video akhir (gambar disalin terus, audio sahaja dibina semula).
# Guna: tambah_sfx.sh <video.mp4> <sfx.wav> <output.mp4>
set -euo pipefail
ffmpeg -v error -y -i "$1" -i "$2" -filter_complex \
  "[1:a]aresample=48000,aformat=channel_layouts=stereo[s];[0:a][s]amix=inputs=2:normalize=0:duration=first,alimiter=limit=0.89[a]" \
  -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -movflags +faststart "$3"
