#!/usr/bin/env bash
# Render PPTX -> PDF -> PNG 2160x2160 (2x untuk Facebook, ketajaman tinggi)
set -euo pipefail
cd "$(dirname "$0")/output"
F=Infografik_Belanjawan_Johor_2027
soffice --headless --convert-to pdf "$F.pptx" >/dev/null 2>&1
pdftoppm -png -r 192 "$F.pdf" slide
for f in slide-0*.png; do [ -e "$f" ] || continue; n=${f#slide-}; n=${n%.png}; mv "$f" "slide-$((10#$n)).png"; done
ls -la
