#!/usr/bin/env bash
# Final FFmpeg pass.
#   ./compose.sh base.mp4 rem.mov hf.mov mix.wav logo.png outro.mp4 edl.json final.mp4
# Main cut: base picture -> creator logo overlay (hidden during the colour-bar beep)
#           -> Remotion infographics -> HyperFrames typography.
# Then the creator's outro is appended. mix.wav already holds main audio + outro audio.
set -euo pipefail
BASE=$1 REM=$2 HF=$3 MIX=$4 LOGO=$5 OUTRO=$6 EDL=$7 OUT=$8
read DUR B0 B1 < <(python3 -I -c "
import json,sys; e=json.load(open(sys.argv[1])); b=next(p for p in e['pieces'] if p.get('kind')=='beep')
print(e['duration'], b['out_in'], b['out_out'])" "$EDL")
ffmpeg -nostdin -v error -y -i "$BASE" -i "$REM" -i "$HF" -loop 1 -framerate 30 -t "$DUR" -i "$LOGO" -i "$OUTRO" -i "$MIX" \
  -filter_complex "\
[3:v]scale=1080:1920:flags=lanczos,format=rgba[logo];\
[0:v][logo]overlay=format=auto:enable='not(between(t,$B0,$B1))'[v0];\
[v0][1:v]overlay=format=auto:eof_action=pass[v1];\
[v1][2:v]overlay=format=auto:eof_action=pass,trim=duration=$DUR,setpts=PTS-STARTPTS,format=yuv420p,setsar=1[main];\
[4:v]scale=1080:1920,fps=30,format=yuv420p,setsar=1[outro];\
[main][outro]concat=n=2:v=1:a=0[v]" \
  -map "[v]" -map 5:a -r 30 -c:v libx264 -preset slow -crf 17 -profile:v high -level 4.2 -g 60 \
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 \
  -c:a aac -b:a 192k -ar 48000 -movflags +faststart -shortest "$OUT"
