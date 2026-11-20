"""Helper kecil untuk membina slide 1080x1080 dengan python-pptx.

Semua koordinat dalam piksel (1080 x 1080). Semua teks dan bentuk
adalah objek PowerPoint asli supaya boleh diedit.
"""
import io
import os
import copy

import cairosvg
from lxml import etree
from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.opc.constants import RELATIONSHIP_TYPE as RT
from pptx.opc.package import Part
from pptx.opc.packuri import PackURI
from pptx.oxml.ns import qn
from pptx.util import Emu, Pt

HERE = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.join(HERE, "assets")
ICONS = os.path.join(ASSETS, "icons")

PX = 9525  # EMU per piksel (96 dpi)


def px(v):
    return Emu(int(round(v * PX)))


# ---------------------------------------------------------------- palet
NAVY = "0B1F4D"
NAVY2 = "14306E"
ROYAL = "1F4C9C"
GOLD = "C9A13B"
GOLD_D = "A88227"
GOLD_L = "E7C766"
GOLD_P = "FBF5E3"
INK = "0E1A33"
MUTED = "5A6680"
LINE = "DCE2EC"
SOFT = "F3F5FA"
WHITE = "FFFFFF"
RED = "B71C2B"
SLATE = "8A97B1"

FONT = {
    "r": ("Montserrat", False),
    "m": ("Montserrat Medium", False),
    "sb": ("Montserrat SemiBold", False),
    "b": ("Montserrat", True),
    "eb": ("Montserrat ExtraBold", False),
    "k": ("Montserrat Black", False),
}


def rgb(h):
    return RGBColor.from_string(h)


# ---------------------------------------------------------------- deck
def new_deck():
    prs = Presentation()
    prs.slide_width = px(1080)
    prs.slide_height = px(1080)
    return prs


def blank(prs):
    return prs.slides.add_slide(prs.slide_layouts[6])


# ---------------------------------------------------------------- bentuk
def _no_shadow(shape):
    shape.shadow.inherit = False


def soft_shadow(shape, alpha=14, blur=18, dist=4):
    spPr = shape._element.spPr
    for el in spPr.findall(qn("a:effectLst")):
        spPr.remove(el)
    eff = etree.SubElement(spPr, qn("a:effectLst"))
    sh = etree.SubElement(eff, qn("a:outerShdw"), blurRad=str(blur * PX), dist=str(dist * PX),
                          dir="5400000", algn="t", rotWithShape="0")
    c = etree.SubElement(sh, qn("a:srgbClr"), val=NAVY)
    etree.SubElement(c, qn("a:alpha"), val=str(alpha * 1000))


def rect(slide, x, y, w, h, fill=None, line=None, lw=1, radius=0, name=None, shadow=False,
         shape=None):
    kind = shape or (MSO_SHAPE.ROUNDED_RECTANGLE if radius else MSO_SHAPE.RECTANGLE)
    s = slide.shapes.add_shape(kind, px(x), px(y), px(w), px(h))
    if radius and kind == MSO_SHAPE.ROUNDED_RECTANGLE:
        s.adjustments[0] = min(0.5, radius / min(w, h))
    if fill:
        s.fill.solid()
        s.fill.fore_color.rgb = rgb(fill)
    else:
        s.fill.background()
    if line:
        s.line.color.rgb = rgb(line)
        s.line.width = px(lw)
    else:
        s.line.fill.background()
    _no_shadow(s)
    if shadow:
        soft_shadow(s)
    if name:
        s.name = name
    s.text_frame.text = ""
    return s


def ellipse(slide, x, y, w, h, fill, line=None, lw=1):
    return rect(slide, x, y, w, h, fill=fill, line=line, lw=lw, shape=MSO_SHAPE.OVAL)


def poly(slide, pts, fill, name=None):
    fb = slide.shapes.build_freeform(px(pts[0][0]), px(pts[0][1]), scale=1.0)
    fb.add_line_segments([(px(a), px(b)) for a, b in pts[1:]], close=True)
    s = fb.convert_to_shape()
    s.fill.solid()
    s.fill.fore_color.rgb = rgb(fill)
    s.line.fill.background()
    _no_shadow(s)
    if name:
        s.name = name
    return s


def hline(slide, x, y, w, color=LINE, t=1.5):
    return rect(slide, x, y, w, t, fill=color)


def vline(slide, x, y, h, color=LINE, t=1.5):
    return rect(slide, x, y, t, h, fill=color)


# ---------------------------------------------------------------- teks
def _apply_run(run, size, weight, color, spacing=None, italic=False):
    fam, bold = FONT[weight]
    f = run.font
    f.name = fam
    f.size = Pt(size * 0.75)
    f.bold = bold
    f.italic = italic
    f.color.rgb = rgb(color)
    rPr = run._r.get_or_add_rPr()
    # pastikan font yang sama untuk semua skrip
    for tag in ("a:ea", "a:cs"):
        el = rPr.find(qn(tag))
        if el is None:
            el = etree.SubElement(rPr, qn(tag))
        el.set("typeface", fam)
    if spacing:
        rPr.set("spc", str(int(spacing * 75)))  # px -> 1/100 pt


def text(slide, x, y, w, h, paras, size=20, weight="sb", color=INK, align="l",
         anchor="t", lh=1.0, after=0, spacing=None, name=None):
    """paras: str | list[para]; para: str | list[run] | dict(runs=..., align=.., after=..)
    run: str | (text, dict(size=, weight=, color=, spacing=))"""
    tb = slide.shapes.add_textbox(px(x), px(y), px(w), px(h))
    if name:
        tb.name = name
    tf = tb.text_frame
    tf.word_wrap = True
    tf.auto_size = None
    for m in ("margin_left", "margin_right", "margin_top", "margin_bottom"):
        setattr(tf, m, 0)
    tf.vertical_anchor = {"t": MSO_ANCHOR.TOP, "m": MSO_ANCHOR.MIDDLE, "b": MSO_ANCHOR.BOTTOM}[anchor]
    if isinstance(paras, str):
        paras = [paras]
    for i, p in enumerate(paras):
        para = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        opts = {}
        if isinstance(p, dict):
            opts = p
            p = p["runs"]
        if isinstance(p, (str, tuple)):
            p = [p]
        para.alignment = {"l": PP_ALIGN.LEFT, "c": PP_ALIGN.CENTER, "r": PP_ALIGN.RIGHT}[opts.get("align", align)]
        para.line_spacing = opts.get("lh", lh)
        sa = opts.get("after", after)
        if sa:
            para.space_after = Pt(sa * 0.75)
        sb = opts.get("before", 0)
        if sb:
            para.space_before = Pt(sb * 0.75)
        for r in p:
            if isinstance(r, str):
                r = (r, {})
            t, o = r
            run = para.add_run()
            run.text = t
            _apply_run(run, o.get("size", opts.get("size", size)), o.get("weight", opts.get("weight", weight)),
                       o.get("color", opts.get("color", color)), o.get("spacing", opts.get("spacing", spacing)))
    return tb


def R(t, size=None, weight=None, color=None, spacing=None):
    o = {}
    if size is not None:
        o["size"] = size
    if weight is not None:
        o["weight"] = weight
    if color is not None:
        o["color"] = color
    if spacing is not None:
        o["spacing"] = spacing
    return (t, o)


# ---------------------------------------------------------------- imej / ikon
def picture(slide, path, x, y, w=None, h=None, name=None):
    pic = slide.shapes.add_picture(path, px(x), px(y), px(w) if w else None, px(h) if h else None)
    if name:
        pic.name = name
    return pic


def picture_cover(slide, path, x, y, w, h, focus=(0.5, 0.35), name=None):
    """Letak foto dan crop supaya penuh kotak (seperti object-fit: cover)."""
    from PIL import Image
    iw, ih = Image.open(path).size
    pic = slide.shapes.add_picture(path, px(x), px(y), px(w), px(h))
    tr, ir = w / h, iw / ih
    if ir > tr:  # gambar lebih lebar -> crop kiri/kanan
        keep = tr / ir
        extra = 1 - keep
        l = extra * focus[0]
        pic.crop_left, pic.crop_right = l, extra - l
    else:
        keep = ir / tr
        extra = 1 - keep
        t = extra * focus[1]
        pic.crop_top, pic.crop_bottom = t, extra - t
    if name:
        pic.name = name
    return pic


_icon_cache = {}


def icon(slide, name, x, y, size, color=NAVY, stroke=2.0):
    """Ikon vektor Lucide: PNG resolusi tinggi + SVG asli (boleh diwarna semula
    dalam PowerPoint 365 melalui 'Convert to Shape')."""
    key = (name, color, stroke)
    if key not in _icon_cache:
        svg = open(os.path.join(ICONS, name + ".svg"), encoding="utf-8").read()
        svg = svg.replace('stroke="currentColor"', f'stroke="#{color}"')
        svg = svg.replace('stroke-width="2"', f'stroke-width="{stroke}"')
        # buang komen lesen supaya fail kecil
        png = cairosvg.svg2png(bytestring=svg.encode(), output_width=256, output_height=256)
        _icon_cache[key] = (svg.encode(), png)
    svg_b, png_b = _icon_cache[key]
    pic = slide.shapes.add_picture(io.BytesIO(png_b), px(x), px(y), px(size), px(size))
    pic.name = f"Ikon {name}"
    # tambah SVG sebagai imej utama (PowerPoint 2016+), PNG kekal sebagai sandaran
    pkg = slide.part.package
    n = len([p for p in pkg.iter_parts() if str(p.partname).endswith(".svg")]) + 1
    part = Part(PackURI(f"/ppt/media/icon_svg{n}.svg"), "image/svg+xml", pkg, svg_b)
    rid = slide.part.relate_to(part, RT.IMAGE)
    blip = pic._element.find(".//" + qn("a:blip"))
    ext_lst = etree.SubElement(blip, qn("a:extLst"))
    ext = etree.SubElement(ext_lst, qn("a:ext"), uri="{96DAC541-7B7A-43D3-8B79-37D633B846F1}")
    ns = "http://schemas.microsoft.com/office/drawing/2016/SVG/main"
    svgb = etree.SubElement(ext, "{%s}svgBlip" % ns, nsmap={"asvg": ns})
    svgb.set(qn("r:embed"), rid)
    return pic


def icon_badge(slide, name, x, y, d, bg=NAVY, fg=WHITE, stroke=2.0, ratio=0.52):
    ellipse(slide, x, y, d, d, bg)
    s = d * ratio
    icon(slide, name, x + (d - s) / 2, y + (d - s) / 2, s, fg, stroke)
