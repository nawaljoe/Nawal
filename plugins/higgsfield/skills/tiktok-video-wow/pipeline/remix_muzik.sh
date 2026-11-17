#!/usr/bin/env bash
# Campur semula muzik latar (tahap baru) tanpa render semula gambar.
# Guna: remix_muzik.sh <folder_tmp_draf> <muzik> <mula_saat> <outro.mp4> <sfx.wav> <output.mp4>
set -euo pipefail
T="$1"; TOTAL=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$T/voice.wav")
FO=$(awk -v t="$TOTAL" 'BEGIN{printf "%.3f", t-1.8}')
ffmpeg -v error -y -i "$T/voice.wav" -ss "$3" -t "$(awk -v t="$TOTAL" 'BEGIN{print t+0.5}')" -i "$2" -filter_complex \
  "[1:a]aresample=48000,aformat=channel_layouts=stereo,loudnorm=I=-22:TP=-5,aresample=48000,afade=t=in:d=1.2,afade=t=out:st=$FO:d=1.8[m];\
[0:a]asplit[v1][v2];[m][v1]sidechaincompress=threshold=0.1:ratio=2:attack=80:release=900[md];\
[v2][md]amix=inputs=2:normalize=0:duration=first,alimiter=limit=0.89,aresample=48000[a]" \
  -map "[a]" -t "$TOTAL" "$T/mix2.wav"
ffmpeg -v error -y -i "$T/main.mp4" -i "$T/mix2.wav" -i "$4" -filter_complex \
  "[2:v]scale=1080:1920,fps=30,format=yuv420p,setsar=1[ov];[2:a]loudnorm=I=-14:TP=-1.5,aresample=48000,aformat=channel_layouts=stereo[oa];\
[0:v]setsar=1[mv];[1:a]aresample=48000,aformat=channel_layouts=stereo[ma];[mv][ma][ov][oa]concat=n=2:v=1:a=1[v][a]" \
  -map "[v]" -map "[a]" -c:v libx264 -crf 19 -preset medium -pix_fmt yuv420p -c:a aac -b:a 192k "$T/muzik2.mp4"
bash "$(dirname "$0")/tambah_sfx.sh" "$T/muzik2.mp4" "$5" "$6"
