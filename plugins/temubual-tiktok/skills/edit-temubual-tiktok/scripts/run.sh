#!/usr/bin/env bash
# End-to-end build of an interview TikTok edit.
#   ./run.sh <source.mp4> <workdir> <hyperframes_project_dir> <remotion_project_dir>
# Before running: edit RANGES/FILLERS in edl.py and SHOTS/CUES/GFX/SFX_AUTH in timeline.py for this video.
# The HyperFrames dir is a copy of templates/hyperframes; the Remotion project has templates/remotion
# copied to src/<name>/ (Infografik.tsx) and public/<name>/ (fonts), with the composition registered in Root.tsx.
# Env: BEEP, LOGO, OUTRO (default: this skill's assets/), CHROME (headless shell for Remotion).
set -euo pipefail
HERE=$(cd "$(dirname "$0")" && pwd); SK=$(cd "$HERE/.." && pwd)
SRC=$(realpath "$1"); WD=$(realpath -m "$2"); HF=$(realpath "$3"); RM=$(realpath "$4"); mkdir -p "$WD"
BEEP=${BEEP:-$SK/assets/beep.mp4}; LOGO=${LOGO:-$SK/assets/logo.png}; OUTRO=${OUTRO:-$SK/assets/outro.mp4}
CHROME=${CHROME:-/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell}
COMP=${COMP:-SijilHalalInfografik}; TLDST=${TLDST:-$RM/src/sijil-halal/timeline.json}

ffmpeg -nostdin -v error -y -i "$SRC" -ac 1 -ar 16000 "$WD/audio16k.wav"
python3 -I "$HERE/edl.py" "$WD/audio16k.wav" "$WD/edl.json"
python3 -I "$HERE/transcribe_edit.py" "$WD/audio16k.wav" "$WD/edl.json" "$WD/out_words.json" > /dev/null
python3 -I "$HERE/timeline.py" "$WD/edl.json" "$WD/out_words.json" "$WD/timeline.json"
python3 -I "$HERE/audio.py" "$SRC" "$WD/edl.json" "$WD/timeline.json" "$WD" "$BEEP" "$OUTRO"
python3 -I "$HERE/facetrack.py" "$SRC" "$WD/face.json"
python3 -I "$HERE/render_base.py" "$SRC" "$WD/edl.json" "$WD/timeline.json" "$WD/face.json" "$WD/base.mp4" "$BEEP"

DUR=$(python3 -c "import json,sys;print(json.load(open(sys.argv[1]))['duration'])" "$WD/timeline.json")
{ printf 'window.TL = '; cat "$WD/timeline.json"; printf ';\n'; } > "$HF/timeline.js"
sed -i -E "s|data-duration=\"[0-9.]+\"|data-duration=\"$DUR\"|" "$HF/index.html"
cp "$WD/timeline.json" "$TLDST"
(cd "$HF" && npx hyperframes render --format mov -w 2 --quiet -o "$WD/hf.mov")
(cd "$RM" && npx remotion render src/index.ts "$COMP" "$WD/rem.mov" --codec=prores --prores-profile=4444 \
   --pixel-format=yuva444p10le --image-format=png --concurrency=2 --browser-executable="$CHROME" --log=error)

"$HERE/compose.sh" "$WD/base.mp4" "$WD/rem.mov" "$WD/hf.mov" "$WD/mix.wav" "$LOGO" "$OUTRO" "$WD/edl.json" "$WD/final.mp4"
python3 -I "$HERE/make_srt.py" "$WD/timeline.json" "$WD/final.srt"
echo "done: $WD/final.mp4"
