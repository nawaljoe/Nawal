#!/usr/bin/env bash
# Sediakan aset video "Amanah Seorang Pemimpin":
#  - public/broll/*.mp4      : rakaman lapangan dari TikTok (perlu: pip install yt-dlp)
#  - public/audio/amanah-ambient.wav : muzik latar dijana (scripts/gen_music.py)
set -euo pipefail
cd "$(dirname "$0")/.."
TMP=$(mktemp -d)
mkdir -p public/broll

declare -A CLIPS=(
  [A]=https://vt.tiktok.com/ZSgwP6S2V/  [B]=https://vt.tiktok.com/ZSgwPMTKn/
  [C]=https://vt.tiktok.com/ZSgwP6d35/  [D]=https://vt.tiktok.com/ZSgwPmTM3/
  [E]=https://vt.tiktok.com/ZSgwP7CNQ/  [F]=https://vt.tiktok.com/ZSgwP68sG/
  [G]=https://vt.tiktok.com/ZSgw5JY4S/  [H]=https://vt.tiktok.com/ZSgwPxRpd/
)
# Gred warna sinematik (gelap, hangat, kurang tepu — rujukan gaya studio podcast)
GRADE="huesaturation=colors=c+b:saturation=-0.5:strength=1,huesaturation=colors=g:saturation=-0.4:strength=1,eq=saturation=0.74,curves=all='0/0.055 0.2/0.15 0.5/0.37 0.8/0.66 1/0.85',colorbalance=rs=0.01:bs=-0.01:rm=0.07:gm=0.01:bm=-0.07:rh=0.04:gh=0.0:bh=-0.06:pl=1"
for k in "${!CLIPS[@]}"; do
  [ -f "public/broll/$k.mp4" ] && continue
  yt-dlp -q -o "$TMP/$k.%(ext)s" "${CLIPS[$k]}"
  ffmpeg -v error -y -i "$TMP/$k".* -an \
    -vf "scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280,fps=30,$GRADE" \
    -c:v libx264 -preset veryfast -crf 20 -pix_fmt yuv420p "public/broll/$k.mp4"
done


[ -f public/audio/amanah-ambient.wav ] || python3 scripts/gen_music.py
rm -rf "$TMP"
echo "Aset siap."
