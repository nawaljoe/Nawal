"""Overlap / overflow checker for the generated deck.

Estimates where each text actually lands (Arial metrics, word wrap, line spacing)
and reports (1) text that overflows its own box and (2) text that collides with
other text on the same slide.
Usage: python3 check.py deck.pptx
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pptx import Presentation
from pptx.util import Emu
from pptx.enum.text import MSO_ANCHOR, PP_ALIGN
from lib import measure

EMU = 914400


def para_lines(p, width):
    """Return list of (line_width, line_height) for paragraph p wrapped at width."""
    runs = [(r.text, (r.font.size.pt if r.font.size else 18), bool(r.font.bold),
             int(r._r.get_or_add_rPr().get("spc", "0")) / 100) for r in p.runs]
    if not runs:
        sz = p.font.size.pt if p.font.size else 18
        return [(0, sz)]
    maxsz = max(r[1] for r in runs)
    # tokenise into words carrying style
    words = []
    for t, sz, b, sp in runs:
        parts = t.replace("\n", " \n ").split(" ")
        for i, w in enumerate(parts):
            words.append((w, sz, b, sp, i < len(parts) - 1))
    lines, cur, trail = [], 0.0, 0.0
    for w, sz, b, sp, space_after in words:
        if w == "\n":
            lines.append(cur - trail); cur = trail = 0.0; continue
        ww = measure(w, sz, b, sp)
        spw = measure(" ", sz, b) if space_after else 0
        if cur > 0 and cur - trail + (trail if cur else 0) + ww > width + 0.01:
            lines.append(cur - trail); cur, trail = ww + spw, spw
        else:
            cur += ww + spw; trail = spw
    lines.append(cur - trail)
    ls = p.line_spacing if isinstance(p.line_spacing, float) else 1.0
    lh = maxsz * 1.17 * ls / 72
    after = (p.space_after.pt / 72) if p.space_after is not None else 0
    out = [(lw, lh) for lw in lines]
    if after:
        out[-1] = (out[-1][0], out[-1][1] + after)
    return out


def text_extent(sh):
    tf = sh.text_frame
    x, y, w, h = (sh.left / EMU, sh.top / EMU, sh.width / EMU, sh.height / EMU)
    ml, mr = tf.margin_left / EMU, tf.margin_right / EMU
    mt, mb = tf.margin_top / EMU, tf.margin_bottom / EMU
    iw = w - ml - mr
    total_h, maxw = 0, 0
    for p in tf.paragraphs:
        for lw, lh in para_lines(p, iw):
            total_h += lh
            maxw = max(maxw, lw)
    anchor = tf.vertical_anchor
    ih = h - mt - mb
    if anchor == MSO_ANCHOR.MIDDLE:
        ty = y + mt + (ih - total_h) / 2
    elif anchor == MSO_ANCHOR.BOTTOM:
        ty = y + h - mb - total_h
    else:
        ty = y + mt
    al = tf.paragraphs[0].alignment
    if al == PP_ALIGN.CENTER:
        tx = x + ml + (iw - maxw) / 2
    elif al == PP_ALIGN.RIGHT:
        tx = x + w - mr - maxw
    else:
        tx = x + ml
    return (tx, ty, min(maxw, iw) if maxw <= iw + 0.01 else maxw, total_h), (x, y, w, h), maxw > iw + 0.02


def inter(a, b, pad=0.0):
    return not (a[0] + a[2] <= b[0] + pad or b[0] + b[2] <= a[0] + pad or
                a[1] + a[3] <= b[1] + pad or b[1] + b[3] <= a[1] + pad)


def main(path):
    prs = Presentation(path)
    problems = 0
    for si, slide in enumerate(prs.slides, 1):
        items = []
        photos = [(sh.left / EMU, sh.top / EMU, sh.width / EMU, sh.height / EMU) for sh in slide.shapes
                  if sh.name == "RUANG GAMBAR"]
        pics = [(sh.left / EMU, sh.top / EMU, sh.width / EMU, sh.height / EMU) for sh in slide.shapes
                if sh.shape_type == 13 and sh.name != "RUANG GAMBAR"]
        for pb in photos:
            for pc in pics:
                if inter(pb, pc):
                    print(f"S{si:02d} LOGO-ON-PHOTO"); problems += 1
        for i, a in enumerate(photos):
            for b in photos[i + 1:]:
                if inter(a, b):
                    print(f"S{si:02d} PHOTO-ON-PHOTO"); problems += 1
        for sh in slide.shapes:
            if not sh.has_text_frame or not sh.text_frame.text.strip():
                continue
            ext, box, too_wide = text_extent(sh)
            txt = sh.text_frame.text.strip().replace("\n", " / ")[:50]
            if too_wide:
                print(f"S{si:02d} WIDE     '{txt}'"); problems += 1
            if ext[3] > box[3] + 0.04:
                print(f"S{si:02d} OVERFLOW '{txt}' need {ext[3]:.2f}in, box {box[3]:.2f}in"); problems += 1
            if sh.name != "RUANG GAMBAR":
                for pb in photos:
                    if inter(ext, pb):
                        print(f"S{si:02d} TEXT-ON-PHOTO '{txt}'"); problems += 1
                for pc in pics:
                    if inter(ext, pc):
                        print(f"S{si:02d} TEXT-ON-LOGO '{txt}'"); problems += 1
            items.append((ext, txt))
        for i in range(len(items)):
            for j in range(i + 1, len(items)):
                if inter(items[i][0], items[j][0], pad=0.005):
                    print(f"S{si:02d} COLLIDE  '{items[i][1]}'  <->  '{items[j][1]}'"); problems += 1
    print("problems:", problems)


if __name__ == "__main__":
    main(sys.argv[1])
