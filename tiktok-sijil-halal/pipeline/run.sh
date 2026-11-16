#!/usr/bin/env bash
# End-to-end build of the halal-certificate TikTok cut.
#
#   ./run.sh <source.mp4> <workdir>
#
# Tools, one job each:
#   FFmpeg      decode, grade, cuts, audio processing, final encode   (audio.py, render_base.py, compose step)
#   HyperFrames typography: captions, hook, SOALAN, lower third, chapter tags/wipe, chips, emphasis
#   Remotion    infographics: DuaKategori, NotisSyarikat, SenaraiPremis, KadPenutup
# Needs: python3 with faster-whisper, numpy, opencv-python-headless<5; node 22; npx hyperframes; ../remotion-video deps.
set -euo pipefail
SRC=$(realpath "$1"); WD=$(realpath -m "$2"); mkdir -p "$WD"
HERE=$(cd "$(dirname "$0")" && pwd); ROOT=$(cd "$HERE/../.." && pwd)
CHROME=${CHROME:-/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell}

ffmpeg -nostdin -v error -y -i "$SRC" -ac 1 -ar 16000 "$WD/audio16k.wav"
python3 -I "$HERE/edl.py" "$WD/audio16k.wav" "$WD/edl.json"
python3 -I "$HERE/transcribe_edit.py" "$WD/audio16k.wav" "$WD/edl.json" "$WD/out_words.json"
python3 -I "$HERE/timeline.py" "$WD/edl.json" "$WD/out_words.json" "$WD/timeline.json"
python3 -I "$HERE/audio.py" "$SRC" "$WD/edl.json" "$WD"
python3 -I "$HERE/facetrack.py" "$SRC" "$WD/face.json"
python3 -I "$HERE/render_base.py" "$SRC" "$WD/edl.json" "$WD/timeline.json" "$WD/face.json" "$WD/base.mp4"

# Typography (HyperFrames) and infographics (Remotion) read the same timeline.
HF="$ROOT/tiktok-sijil-halal/hyperframes"
{ printf 'window.TL = '; cat "$WD/timeline.json"; printf ';\n'; } > "$HF/timeline.js"
cp "$WD/timeline.json" "$ROOT/remotion-video/src/sijil-halal/timeline.json"
(cd "$HF" && npx hyperframes render --format mov -w 3 --quiet -o "$WD/hf.mov")
(cd "$ROOT/remotion-video" && npx remotion render src/index.ts SijilHalalInfografik "$WD/rem.mov" \
   --codec=prores --prores-profile=4444 --pixel-format=yuva444p10le --image-format=png \
   --concurrency=3 --browser-executable="$CHROME" --log=error)

"$HERE/compose.sh" "$WD/base.mp4" "$WD/rem.mov" "$WD/hf.mov" "$WD/mix.wav" "$WD/final.mp4"
python3 -I "$HERE/make_srt.py" "$WD/timeline.json" "$WD/final.srt"
