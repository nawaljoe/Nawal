#!/bin/bash
# Voice clean-up + loudness: rumble cut, gentle denoise, de-mud, presence, compression, then -15 LUFS (final master -14 after SFX mix)
set -e
IN=$1; OUT=$2
CHAIN="highpass=f=75,afftdn=nr=10:nf=-48:tn=1,equalizer=f=280:t=q:w=1.1:g=-2.5,equalizer=f=3200:t=q:w=1.2:g=2.5,equalizer=f=9000:t=h:w=0.7:g=1.5,acompressor=threshold=-26dB:ratio=3:attack=8:release=120:makeup=4dB,deesser=i=0.35"
M=$(ffmpeg -hide_banner -i "$IN" -af "$CHAIN,loudnorm=I=-15:TP=-2:LRA=7:print_format=json" -f null - 2>&1 | sed -n '/{/,/}/p')
g(){ echo "$M" | python3 -c "import sys,json;print(json.load(sys.stdin)['$1'])"; }
ffmpeg -v error -y -i "$IN" -af "$CHAIN,loudnorm=I=-15:TP=-2:LRA=7:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=true,aresample=48000" -c:a pcm_s16le "$OUT"
