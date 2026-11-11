#!/usr/bin/env bash
# Audio restoration: extract -> AI speech enhancement (DeepFilterNet3) -> podcast EQ/dynamics
# -> cut to the EDL -> two-pass loudness normalisation (-14 LUFS, -1.5 dBTP).
set -euo pipefail
SRC=${1:?source video}; OUT=${2:-assets/voice_master.wav}; WORK=${WORK:-.work}
HERE=$(cd "$(dirname "$0")" && pwd); mkdir -p "$WORK"
ffmpeg -v error -y -i "$SRC" -vn -ac 1 -ar 48000 -c:a pcm_f32le "$WORK/orig_mono48.wav"
python3 -I "$HERE/dfn_enhance.py" "$WORK/orig_mono48.wav" "$WORK/dfn.wav" 0
# Rumble/handling-noise high-pass (24 dB/oct @70 Hz); warmth +3 dB @160 Hz; boxiness -2.5 dB @450 Hz;
# narrow -2 dB @926 Hz (residual PA ring); presence +2.5 dB @3.2 kHz; gentle air shelf;
# soft expander (max -12 dB) so the room never pumps; 3:1 compression; light split de-esser.
CHAIN="highpass=f=70:poles=2,highpass=f=70:poles=2,\
equalizer=f=160:t=q:w=0.9:g=3,equalizer=f=450:t=q:w=1.0:g=-2.5,equalizer=f=926:t=q:w=4:g=-2,\
equalizer=f=3200:t=q:w=1.0:g=2.5,highshelf=f=7000:g=1.5,\
agate=threshold=0.008:ratio=2:range=0.25:attack=5:release=250,\
acompressor=threshold=-26dB:ratio=3:attack=8:release=160:knee=6:makeup=3,\
deesser=i=0.2:m=0.5:f=0.5:s=o"
ffmpeg -v error -y -i "$WORK/dfn.wav" -af "$CHAIN" -c:a pcm_f32le "$WORK/voice_proc.wav"
TAIL=$(python3 "$HERE/edl.py" tail)
FC="[0:a]anull[a];$(python3 "$HERE/edl.py" audio);[ac]apad=pad_dur=$TAIL[out]"
ffmpeg -v error -y -i "$WORK/voice_proc.wav" -filter_complex "$FC" -map "[out]" -c:a pcm_f32le "$WORK/voice_cut.wav"
# Loudness: static gain to -14 LUFS, a look-ahead limiter shaves only the rare plosive peaks
# (no dynamic loudnorm, so nothing pumps), then a final trim measured on the limited signal.
lufs(){ ffmpeg -hide_banner -nostats -i "$1" -af ebur128=peak=true -f null - 2>&1 | awk '/Summary/{f=1} f&&/I:/{print $2; exit}'; }
I0=$(lufs "$WORK/voice_cut.wav"); G=$(python3 -c "print(-14-($I0))")
ffmpeg -v error -y -i "$WORK/voice_cut.wav" -af "volume=${G}dB,alimiter=limit=0.81:attack=4:release=60:level=false:asc=1" -c:a pcm_f32le "$WORK/voice_lim.wav"
I1=$(lufs "$WORK/voice_lim.wav"); G2=$(python3 -c "print(-14-($I1))")
ffmpeg -v error -y -i "$WORK/voice_lim.wav" -af "volume=${G2}dB,alimiter=limit=0.83:attack=4:release=60:level=false,aresample=48000" -c:a pcm_s24le "$OUT"
echo "wrote $OUT (gain ${G} dB + trim ${G2} dB)"
