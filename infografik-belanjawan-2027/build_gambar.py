"""PPTX versi gambar: setiap slide ialah PNG penuh (rupa 100% sama seperti gambar)."""
import os
from pptx import Presentation
from pptx.util import Emu
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "output")
PX = 9525
prs = Presentation()
prs.slide_width = prs.slide_height = Emu(1080 * PX)
for i in range(1, 5):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    s.shapes.add_picture(os.path.join(OUT, f"slide-{i}.png"), 0, 0, Emu(1080 * PX), Emu(1080 * PX))
path = os.path.join(OUT, "Infografik_Belanjawan_Johor_2027_GAMBAR.pptx")
prs.save(path)
print(path)
