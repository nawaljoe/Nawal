#!/usr/bin/env bash
# Sahkan struktur PPTX dan render setiap slaid ke JPG untuk semakan visual.
# Guna:  qa_render.sh fail.pptx [dpi=100] [folder_keluar]
# Perlu laluan skill pptx (anthropic-skills:pptx) dalam PPTX_SKILL, cth.
#   PPTX_SKILL=/root/.claude/skills/synced/<id>/pptx
set -euo pipefail
F="$1"; DPI="${2:-100}"; OUT="${3:-$(mktemp -d)}"
: "${PPTX_SKILL:?set PPTX_SKILL ke folder skill pptx}"
python3 "$PPTX_SKILL/scripts/office/validate.py" "$F" | tail -1
mkdir -p "$OUT" && cp "$F" "$OUT/d.pptx" && cd "$OUT"
python3 "$PPTX_SKILL/scripts/office/soffice.py" --headless --convert-to pdf d.pptx >/dev/null 2>&1
rm -f s-*.jpg && pdftoppm -jpeg -r "$DPI" d.pdf s
ls -1 "$PWD"/s-*.jpg
# Semakan XML 'selamat Canva' (patut semua 0 kecuali pics):
python3 - "$F" <<'PY'
import sys, zipfile, re
z = zipfile.ZipFile(sys.argv[1])
for n in sorted(x for x in z.namelist() if re.match(r'ppt/slides/slide\d+\.xml$', x)):
    d = z.read(n).decode()
    print(n, '| placeholder:', len(re.findall(r'<p:ph', d)), '| jadual:', d.count('<a:tbl>'), '| carta:', d.count('chart'),
          '| kecerunan:', d.count('gradFill'), '| alpha:', d.count('<a:alpha'), '| gambar:', d.count('<p:pic>'),
          '| fon:', sorted(set(re.findall(r'typeface="([^"]+)"', d))))
PY
