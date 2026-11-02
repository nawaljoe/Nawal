#!/usr/bin/env bash
# Muat turun footage "Bekal" dari Google Drive & sediakan untuk Remotion.
# - Tukar HDR (HLG iPhone) -> SDR, 1080x1920, 30fps
# - Klip panjang dipercepat jadi timelapse
# Guna: bash scripts/bekal-prep.sh   (dari folder remotion-video)
set -euo pipefail
cd "$(dirname "$0")/.."
SRC=${SRC:-/tmp/bekal-src}
OUT=public/bekal/footage
mkdir -p "$SRC" "$OUT"

dl() { [ -s "$SRC/$2" ] || curl -sSL --retry 4 -o "$SRC/$2" "https://drive.usercontent.google.com/download?id=$1&export=download&confirm=t"; }
dl 1AtM0shpkEJRnQLfzFPbio9KB25AbsgAl IMG_7909.MOV   # tangan pegang beg bekal
dl 1ZPzaQexOHXbhUyVs159cyCNiCYNDaxEw IMG_7905.MOV   # POV jalan ke pejabat
dl 1iHe7iwzbSN4EaU6ux-oZcKGPNpLndBqo IMG_7897.MOV   # bungkusan makanan (top-down) 1
dl 1Gd_LslHkrhDbPafXuG_h4GRk8zyuMkD4 IMG_7902.MOV   # bungkusan makanan (top-down) 2
dl 1sc7_xFMT1vySnXAvlfKRrNdkKrCVZOcm IMG_0876.mov   # ambil wudhu
dl 1PiRxtOk5vSJI8P5lT2C4gc3nWOcn5e6E IMG_0904.MOV   # jemaah wanita sujud
dl 1Fg2aISwbbse9ZAU7GuYYtA0xnMhJeFv5 ed54.mp4       # pintu masjid
dl 1kzW0JcvZd7SgIBSuCSxv96cr65SDz_5a 410c.mp4       # dalam masjid
dl 1Ia-JOq-RTcZhFeGhK3B14pAlahhFc950 322c.mp4       # saf
dl 1C1edc3Wt3mRpfKHxRoMtrSKWru7uQDQO 81fd.mp4       # qiyam

TM="zscale=t=linear:npl=203,format=gbrpf32le,zscale=p=bt709,tonemap=tonemap=mobius:desat=0,zscale=t=bt709:m=bt709:r=tv,format=yuv420p,scale=1080:1920:flags=lanczos"
E="-c:v libx264 -crf 20 -preset fast -pix_fmt yuv420p -movflags +faststart"
ff() { ffmpeg -nostdin -v error -y "$@"; }

ff -ss 1 -t 8 -i "$SRC/IMG_7909.MOV" -vf "fps=30,$TM" $E -c:a aac -b:a 128k $OUT/bag.mp4 &
ff -t 78 -i "$SRC/IMG_7905.MOV" -vf "setpts=PTS/10,fps=30,$TM" -an $E $OUT/walk_fast.mp4 &
ff -ss 8 -t 56 -i "$SRC/IMG_7897.MOV" -vf "setpts=PTS/12,fps=30,$TM" -an $E $OUT/food1_fast.mp4 &
ff -t 30 -i "$SRC/IMG_7902.MOV" -vf "setpts=PTS/8,fps=30,$TM" -an $E $OUT/food2_fast.mp4 &
wait
ff -i "$SRC/IMG_0876.mov" -vf "fps=30,$TM" $E -c:a aac -b:a 128k $OUT/wudhu.mp4
ff -i "$SRC/IMG_0904.MOV" -vf "fps=30,$TM" $E -c:a aac -b:a 128k $OUT/sujud.mp4
for p in ed54:masjid_pintu 410c:masjid_dalam 322c:masjid_saf 81fd:masjid_qiyam; do
  ff -i "$SRC/${p%%:*}.mp4" -vf "scale=1080:1920:flags=lanczos,fps=30" $E -c:a aac -b:a 128k "$OUT/${p##*:}.mp4"
done
ls -la $OUT

# latar POV tanpa bahagian dalam lif
ffmpeg -nostdin -v error -y -i $OUT/walk_fast.mp4 -vf "select='between(t,0,2.3)+between(t,4.7,7.8)',setpts=N/30/TB" -an $E $OUT/walk_nolift.mp4
echo "Seterusnya: python3 scripts/bekal-ghost.py && python3 scripts/bekal-bagkey.py"
