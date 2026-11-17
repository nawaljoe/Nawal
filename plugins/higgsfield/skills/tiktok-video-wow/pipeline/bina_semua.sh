#!/usr/bin/env bash
# Bina semua draf serentak: render utama (compose.py) -> versi DenganMuzik (+SFX) & TanpaMuzik (+SFX).
# Guna: bina_semua.sh <folder_projek> <video_asal> <outro.mp4> <muzik.mp3>   [DRAF="Draf1 Draf3" untuk pilih]
# Folder projek mesti ada: config_resolved.json, cards/, sfx/<draf>.wav, logo/templat.png, klip/ (jika ada B-roll klip),
# fonts/ (Poppins) dan pilihan analisis/suara_podcast.wav (suara gaya podcast).
set -uo pipefail
P=$(cd "$1" && pwd); VIDEO=$(realpath "$2"); OUTRO=$(realpath "$3"); MUZIK=$(realpath "$4")
SK=$(cd "$(dirname "$0")" && pwd)
cd "$P"
mkdir -p akhir siap
bina() {
  n=$1
  mkdir -p "akhir/tmp_$n"
  [ -f analisis/suara_podcast.wav ] && cp analisis/suara_podcast.wav "akhir/tmp_$n/src.wav"   # suara gaya podcast
  KELUAR_TERUS=1 python3 -I "$SK/compose.py" config_resolved.json "$VIDEO" cards "$OUTRO" fonts "$MUZIK" akhir "$n" \
      > "akhir/$n.log" 2>&1 \
  && bash "$SK/tambah_sfx.sh" "akhir/$n.mp4" "sfx/$n.wav" "siap/${n}_DenganMuzik.mp4" \
  && bash "$SK/tanpa_muzik.sh" "akhir/tmp_$n" "$OUTRO" "akhir/${n}_suara.mp4" \
  && bash "$SK/tambah_sfx.sh" "akhir/${n}_suara.mp4" "sfx/$n.wav" "siap/${n}_TanpaMuzik.mp4" \
  && echo "$n SIAP" || echo "$n GAGAL (lihat akhir/$n.log)"
}
SEMUA=$(python3 -I -c "import json; print(' '.join(json.load(open('config_resolved.json'))['drafts']))")
for n in ${DRAF:-$SEMUA}; do bina "$n" & done
wait
