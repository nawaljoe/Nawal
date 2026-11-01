#!/usr/bin/env bash
# Sediakan aset video "Amanah Seorang Pemimpin":
#  - public/broll/*.mp4      : rakaman lapangan dari TikTok (perlu: pip install yt-dlp)
#  - public/nature/sunset.mp4: latar alam (CC0, archive.org "Timelapse of pasture at sunset" oleh Lars),
#                              dipotong menegak 9:16 & diperlahankan ~5.85x dengan interpolasi gerakan.
set -euo pipefail
cd "$(dirname "$0")/.."
TMP=$(mktemp -d)
mkdir -p public/broll public/nature

declare -A CLIPS=(
  [A]=https://vt.tiktok.com/ZSgwP6S2V/  [B]=https://vt.tiktok.com/ZSgwPMTKn/
  [C]=https://vt.tiktok.com/ZSgwP6d35/  [D]=https://vt.tiktok.com/ZSgwPmTM3/
  [E]=https://vt.tiktok.com/ZSgwP7CNQ/  [F]=https://vt.tiktok.com/ZSgwP68sG/
  [G]=https://vt.tiktok.com/ZSgw5JY4S/  [H]=https://vt.tiktok.com/ZSgwPxRpd/
)
for k in "${!CLIPS[@]}"; do
  [ -f "public/broll/$k.mp4" ] && continue
  yt-dlp -q -o "$TMP/$k.%(ext)s" "${CLIPS[$k]}"
  ffmpeg -v error -y -i "$TMP/$k".* -an \
    -vf "scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280,fps=30" \
    -c:v libx264 -preset veryfast -crf 20 -pix_fmt yuv420p "public/broll/$k.mp4"
done

if [ ! -f public/nature/sunset.mp4 ]; then
  curl -sSL -o "$TMP/pasture.mp4" "https://archive.org/download/TimelapseOfPastureAtSunset/Sunset%20-%2010737.mp4"
  # 4 bahagian selari (minterpolate lambat), kemudian cantum
  i=0
  for r in "0 86" "86 172" "172 257" "257 341"; do
    set -- $r
    ffmpeg -v error -y -i "$TMP/pasture.mp4" -vf "trim=start_frame=$1:end_frame=$(($2+1)),setpts=PTS-STARTPTS,crop=902:1604:2007:650,scale=1080:1920:flags=lanczos,setpts=5.85*PTS,minterpolate=fps=30:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1" \
      -an -c:v libx264 -crf 15 -preset medium -pix_fmt yuv420p "$TMP/chunk$i.mp4" &
    i=$((i+1))
  done
  wait
  # buang frame pertama bahagian 1-3 (bertindih dengan frame akhir bahagian sebelumnya)
  ffmpeg -v error -y -i "$TMP/chunk0.mp4" -i "$TMP/chunk1.mp4" -i "$TMP/chunk2.mp4" -i "$TMP/chunk3.mp4" \
    -filter_complex "[1]trim=start_frame=1,setpts=PTS-STARTPTS[b];[2]trim=start_frame=1,setpts=PTS-STARTPTS[c];[3]trim=start_frame=1,setpts=PTS-STARTPTS[d];[0][b][c][d]concat=n=4:v=1[v]" \
    -map "[v]" -c:v libx264 -crf 17 -preset medium -pix_fmt yuv420p -movflags +faststart public/nature/sunset.mp4
fi

[ -f public/audio/amanah-ambient.wav ] || python3 scripts/gen_music.py
rm -rf "$TMP"
echo "Aset siap."
