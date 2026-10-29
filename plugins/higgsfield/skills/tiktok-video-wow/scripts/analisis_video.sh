#!/usr/bin/env bash
# Analisis video mentah untuk pelan suntingan TikTok.
# Guna: analisis_video.sh <video> <folder_output>
set -euo pipefail

if [ $# -lt 2 ]; then
  echo "Guna: $0 <video> <folder_output>" >&2
  exit 1
fi

VIDEO="$1"
OUT="$2"
mkdir -p "$OUT/frames"

# Maklumat asas
{
  echo "Fail: $VIDEO"
  ffprobe -v error -show_entries format=duration,size -of default=noprint_wrappers=1 "$VIDEO"
  ffprobe -v error -select_streams v:0 \
    -show_entries stream=codec_name,width,height,r_frame_rate:stream_side_data=rotation \
    -of default=noprint_wrappers=1 "$VIDEO"
  if ffprobe -v error -select_streams a -show_entries stream=codec_type -of csv=p=0 "$VIDEO" | grep -q audio; then
    echo "audio=ada"
  else
    echo "audio=tiada"
  fi
} > "$OUT/info.txt"

# 1 frame setiap 2 saat (ffmpeg auto-rotate ikut metadata telefon)
ffmpeg -v error -y -i "$VIDEO" -vf "fps=1/2,scale=360:-2" -q:v 4 "$OUT/frames/f_%03d.jpg"

# Contact sheet: grid 5x8 (40 petak); selang dilaraskan supaya seluruh video muat
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$VIDEO")
STEP=$(awk -v d="$DUR" 'BEGIN { s = d / 40; if (s < 2) s = 2; printf "%.2f", s }')
echo "contact_sheet_selang_saat=$STEP" >> "$OUT/info.txt"
ffmpeg -v error -y -i "$VIDEO" \
  -vf "fps=1/$STEP,scale=240:-2,drawtext=text='%{pts\:hms}':x=5:y=5:fontsize=16:fontcolor=yellow:box=1:boxcolor=black@0.6,tile=5x8" \
  -frames:v 1 -q:v 3 "$OUT/contact_sheet.jpg" 2>/dev/null \
  || ffmpeg -v error -y -i "$VIDEO" -vf "fps=1/$STEP,scale=240:-2,tile=5x8" -frames:v 1 -q:v 3 "$OUT/contact_sheet.jpg"

# Pertukaran babak (skor > 0.3)
ffmpeg -v info -i "$VIDEO" -vf "select='gt(scene,0.3)',showinfo" -an -f null - 2>&1 \
  | grep -o 'pts_time:[0-9.]*' | sed 's/pts_time:/babak_pada_saat=/' > "$OUT/scenes.txt" || true

# Audio: kekuatan bunyi & bahagian senyap
if grep -q "audio=ada" "$OUT/info.txt"; then
  {
    ffmpeg -v info -i "$VIDEO" -vn -af "loudnorm=print_format=summary" -f null - 2>&1 \
      | grep -E "Input Integrated|Input True Peak|Input LRA" || true
    ffmpeg -v info -i "$VIDEO" -vn -af "silencedetect=noise=-35dB:d=0.7" -f null - 2>&1 \
      | grep -E "silence_(start|end)" | sed 's/^.*\] //' || true
  } > "$OUT/audio.txt"
else
  echo "Tiada audio." > "$OUT/audio.txt"
fi

echo "Siap. Hasil dalam: $OUT"
ls "$OUT"
