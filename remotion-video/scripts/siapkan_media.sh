#!/usr/bin/env bash
# Muat turun klip kuliah dari Google Drive, betulkan putaran, gred warna,
# jernihkan suara ustaz dan simpan ke public/ untuk komposisi "Kuliah".
#
# Pakai:  bash scripts/siapkan_media.sh
# Jika ELEVENLABS_API_KEY ada, suara dijernihkan dengan ElevenLabs Voice Isolator
# dan ditranskrip dengan ElevenLabs Scribe (kapsyen). Jika tiada, guna penapis ffmpeg.
set -euo pipefail
cd "$(dirname "$0")/.."
ROOT=$(pwd)
WORK=${WORK:-$ROOT/.kerja}
mkdir -p "$WORK/src" "$WORK/clean" "$WORK/transkrip" public/media public/audio

dl() { curl -sSL -o "$1" "https://drive.usercontent.google.com/download?id=$2&export=download&confirm=t"; }

# Klip utama (m*) dan B-roll (b*) dari folder Drive "Main" dan "B-roll"
declare -A MAIN=(
  [m1]=13EGrwvDSoZ8TQdtukHsOZ_m0t3kVEpf3 [m2]=1MDddUDwE9KlICVlREQ3f65tKfzQk7u6z
  [m3]=1J0aLO1NOYldOL9yeE0ZnKXr86tEjiLnr [m4]=1xPAluMgpVIyaltlDefK3PeRCNwD0s8p1
  [m5]=1t3a-fubN5Gu2zcaCF3rIgvlgqszxPwK1 [m6]=1drP5iOJtpi-cXQjnwcTudn_YKKWOoTtt
  [m7]=14JUbtRoQDMKHnckvQBHSJGZTU6HQ5dP3
)
declare -A BROLL=(
  [b1]=1LUBlK7lnDtwmt1aZDOIp7nW-gWHdDYiC [b2]=1kuUvl3lEib4Ymj17FhWJJOdWc7Tjbyn9
  [b3]=1CxkKOdwRF7Ok8GEmwWVAieosh_C1oeHN [b4]=1iq0jNwcilvUwLkes0NdkOmOkfCYLAZ23
  [b5]=1Bv08oZtfnkgFebRhjjcduHVIvZee4QmW [b6]=1pBWxJIguMkcDURurEIHwMWNVgBhqvduP
  [b7]=1riXeUlysBEk-DrSP9RpAFkBL8K4gZahf [b8]=1yt7skYdc0wjbUt2YrzpIbyT94tQhCthq
  [b9]=13Zqz2XigrNILRe5l7Y7Lb_zaAapFnIf_ [b10]=187aQR3nA_tAfiUOV9LWHCE3mkzK_2nMy
)
for k in "${!MAIN[@]}"; do [ -s "$WORK/src/$k.mp4" ] || dl "$WORK/src/$k.mp4" "${MAIN[$k]}"; done
for k in "${!BROLL[@]}"; do [ -s "$WORK/src/$k.mp4" ] || dl "$WORK/src/$k.mp4" "${BROLL[$k]}"; done

# Gred "tenang": kontras lembut, kurang tepu, highlight hangat, bayang sedikit biru
GRADE="eq=contrast=1.04:saturation=0.84:gamma=1.02,colorbalance=rs=-0.02:bs=0.03:rm=0.01:bm=-0.01:rh=0.04:gh=0.015:bh=-0.03,curves=all='0/0.03 0.5/0.5 1/0.975'"
# Tajam & jelas: buang bising mampatan, besarkan dengan spline, tajamkan secara adaptif (CAS)
SHARP="hqdn3d=1.2:1.0:4:3,scale=1080:1920:flags=spline+accurate_rnd+full_chroma_int,setsar=1,cas=strength=0.85,unsharp=5:5:0.55:3:3:0"
video() { # $1 masuk, $2 penapis putaran, $3 keluar
  ffmpeg -v error -y -i "$1" -an -vf "$2,$SHARP,$GRADE,fps=30,format=yuv420p" \
    -c:v libx264 -preset medium -crf 15 -tune film -g 30 "$3"
}
# m1, m3, m5, m6 dirakam menegak tapi tersimpan mengiring: putar 90° lawan jam
for k in m1 m3 m5 m6; do video "$WORK/src/$k.mp4" "transpose=2" "public/media/$k.mp4"; done
for k in m2 m4 m7 b1 b2 b3 b4 b5 b6 b7 b8 b9 b10; do video "$WORK/src/$k.mp4" "null" "public/media/$k.mp4"; done

# Suara ustaz: ElevenLabs Voice Isolator jika ada kunci, jika tidak DeepFilterNet3 (lokal).
# Kemudian EQ (kurangkan "berdengung", tambah kejelasan), de-esser, kompresor, -14 LUFS.
POST="highpass=f=75,equalizer=f=220:t=q:w=1.0:g=-2.5,equalizer=f=3200:t=q:w=1.4:g=2.5,highshelf=f=8000:g=1.5,deesser=i=0.35,acompressor=threshold=-22dB:ratio=2.5:attack=8:release=180:makeup=3,loudnorm=I=-14:TP=-1.2:LRA=8,alimiter=limit=0.93"
DFN_MODEL="$WORK/DeepFilterNet3"
if [ -z "${ELEVENLABS_API_KEY:-}" ] && [ ! -s "$DFN_MODEL/model.safetensors" ]; then
  mkdir -p "$DFN_MODEL"
  for f in config.ini model.safetensors; do
    curl -sSL -o "$DFN_MODEL/$f" "https://huggingface.co/fal/DeepFilterNet3/resolve/main/$f"
  done
fi
for k in m1 m2 m3 m4 m5 m6 m7; do
  ffmpeg -v error -y -i "$WORK/src/$k.mp4" -vn -ac 1 -ar 48000 "$WORK/clean/${k}_in.wav"
  if [ -n "${ELEVENLABS_API_KEY:-}" ]; then
    python3 ../voiceover/jernihkan_suara.py "$WORK/clean/${k}_in.wav" "$WORK/clean/$k.mp3"
    ffmpeg -v error -y -i "$WORK/clean/$k.mp3" -ar 48000 "$WORK/clean/${k}_bersih.wav"
    python3 ../voiceover/transkrip_scribe.py "$WORK/clean/$k.mp3" "$WORK/transkrip/$k.json"
  else
    python3 ../voiceover/jernihkan_dfn.py "$WORK/clean/${k}_in.wav" "$WORK/clean/${k}_bersih.wav" 35 "$DFN_MODEL"
  fi
  ffmpeg -v error -y -i "$WORK/clean/${k}_bersih.wav" -af "$POST" -ar 48000 -ac 2 -c:a aac -b:a 256k "public/audio/$k.m4a"
done
if [ -n "${ELEVENLABS_API_KEY:-}" ]; then
  python3 scripts/bina_kapsyen.py "$WORK/transkrip"
fi

# Latar ambien lembut (drone D major, tiada rentak), jauh di bawah suara
ffmpeg -v error -y -f lavfi -i "aevalsrc='0.10*sin(2*PI*73.42*t)*(0.6+0.4*sin(2*PI*t/23))+0.07*sin(2*PI*110*t)*(0.6+0.4*sin(2*PI*t/17+1))+0.05*sin(2*PI*146.83*t)*(0.5+0.5*sin(2*PI*t/29+2))+0.035*sin(2*PI*220.0*t)*(0.5+0.5*sin(2*PI*t/19+3))+0.025*sin(2*PI*277.18*t)*(0.5+0.5*sin(2*PI*t/31+4))+0.02*sin(2*PI*369.99*t)*(0.5+0.5*sin(2*PI*t/37+5))|0.10*sin(2*PI*73.6*t)*(0.6+0.4*sin(2*PI*t/21))+0.07*sin(2*PI*110.3*t)*(0.6+0.4*sin(2*PI*t/18+1))+0.05*sin(2*PI*147.1*t)*(0.5+0.5*sin(2*PI*t/27+2))+0.035*sin(2*PI*220.4*t)*(0.5+0.5*sin(2*PI*t/23+3))+0.025*sin(2*PI*277.5*t)*(0.5+0.5*sin(2*PI*t/33+4))+0.02*sin(2*PI*370.4*t)*(0.5+0.5*sin(2*PI*t/41+5))':s=48000:d=300" \
  -af "lowpass=f=900,aecho=0.8:0.85:120|240:0.35|0.25,loudnorm=I=-30:TP=-6" -c:a aac -b:a 160k public/audio/ambient.m4a

# Intro & outro dari HyperFrames
cp public/media/b8.mp4 ../hyperframes-kuliah/assets/bg-intro.mp4
cp public/media/b1.mp4 ../hyperframes-kuliah/assets/bg-outro.mp4
(cd ../hyperframes-kuliah &&
  npx --yes hyperframes@0.9.9 render -c compositions/intro.html -q delivery -o "$ROOT/public/media/intro.mp4" &&
  npx --yes hyperframes@0.9.9 render -c compositions/outro.html -q delivery -o "$ROOT/public/media/outro.mp4")

echo "Siap. Render:  npx remotion render Kuliah out/kuliah.mp4 --crf=18"
