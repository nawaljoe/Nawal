"""Versi PPTX khas untuk di-import ke Canva (4 slide, semua teks & bentuk boleh diedit).

Beza dengan versi PowerPoint: Canva tidak import carta PowerPoint sebagai carta,
jadi cincin donut 333 sekolah dilukis sebagai gambar PNG lutsinar
(angka & label di atasnya kekal teks yang boleh diedit).

    python3 build_canva.py -> output/Infografik_Belanjawan_Johor_2027_CANVA.pptx
"""
import math
import os

from PIL import Image, ImageDraw

import build
from lib import px, RED, GOLD, SLATE

DONUT_PNG = os.path.join(build.OUT, "_donut_333.png")


def make_donut_png(values, colors, size=1200, hole=0.60, gap_deg=0.9):
    ss = 2  # supersample untuk tepi licin
    S = size * ss
    im = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    tot = sum(values)
    a = -90.0  # mula di atas, ikut jam (sama seperti carta asal)
    for v, c in zip(values, colors):
        sweep = 360 * v / tot
        rgb = tuple(int(c[i:i + 2], 16) for i in (0, 2, 4))
        d.pieslice([0, 0, S - 1, S - 1], a + gap_deg / 2, a + sweep - gap_deg / 2, fill=rgb + (255,))
        a += sweep
    r = S * hole / 2
    d.ellipse([S / 2 - r, S / 2 - r, S / 2 + r, S / 2 + r], fill=(0, 0, 0, 0))
    im = im.resize((size, size), Image.LANCZOS)
    im.save(DONUT_PNG)


def donut_as_picture(slide, x, y, d, values, colors, hole=60):
    make_donut_png(values, colors, hole=hole / 100)
    pic = slide.shapes.add_picture(DONUT_PNG, px(x), px(y), px(d), px(d))
    pic.name = "Carta 333 sekolah (gambar)"
    return pic


def main():
    build.donut = donut_as_picture
    prs = build.new_deck()
    from build_slide_pdp import slide as slide4_pdp
    for f in (build.slide1, build.slide2, build.slide3, slide4_pdp):
        f(prs)
    path = os.path.join(build.OUT, "Infografik_Belanjawan_Johor_2027_CANVA.pptx")
    prs.save(path)
    os.remove(DONUT_PNG)
    print(path)


if __name__ == "__main__":
    main()
