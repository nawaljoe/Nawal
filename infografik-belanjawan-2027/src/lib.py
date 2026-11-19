"""Helpers for the infographic deck (python-pptx)."""
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR, MSO_AUTO_SIZE
from PIL import ImageFont
from pptx.enum.shapes import MSO_SHAPE, MSO_CONNECTOR
from pptx.enum.dml import MSO_LINE
from pptx.oxml.ns import qn
from lxml import etree
import os

HERE = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.join(HERE, "assets")

NAVY = "13257B"
NAVY2 = "1D3596"
RED = "D31F2A"
BG = "FDFDFE"
INK = "1E2235"
GRAY = "646A80"
MUTED = "9AA0B4"
LIGHT = "EEF1FA"
LIGHT2 = "F5F6FB"
RULE = "D9DDEB"
BLUE = "6F86DB"
PALE_RED = "FCEBEC"
WHITE = "FFFFFF"

FONT = "Arial"  # universal font: same look in PowerPoint, Google Slides, Keynote, Canva
W, H = 13.333, 7.5
L, R = 0.55, 12.78  # content margins
CW = R - L


_FONTS = {}


def measure(t, size, bold=False, spacing=0):
    """Width in inches of a single line of text (Arial metrics via Liberation Sans)."""
    key = (size, bold)
    if key not in _FONTS:
        f = "/usr/share/fonts/truetype/liberation/LiberationSans-%s.ttf" % ("Bold" if bold else "Regular")
        _FONTS[key] = ImageFont.truetype(f, int(size * 20))
    w = _FONTS[key].getlength(t) / 20 / 72
    return w + spacing / 72 * len(t)


def rgb(h):
    return RGBColor.from_string(h)


def new_deck():
    prs = Presentation()
    prs.slide_width = Inches(W)
    prs.slide_height = Inches(H)
    return prs


def blank(prs, bg=BG):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    f = s.background.fill
    f.solid()
    f.fore_color.rgb = rgb(bg)
    return s


def _nostyle(sh):
    st = sh._element.find(qn("p:style"))
    if st is not None:
        sh._element.remove(st)


def set_alpha(shape, alpha):
    """alpha 0-100 (opacity %) on a solid fill."""
    sf = shape.fill._xPr.find(qn("a:solidFill"))
    clr = sf[0]
    a = etree.SubElement(clr, qn("a:alpha"))
    a.set("val", str(int(alpha * 1000)))


def rect(s, x, y, w, h, fill=None, line=None, lw=0.75, shape=MSO_SHAPE.RECTANGLE, dash=False, radius=None):
    sh = s.shapes.add_shape(shape, Inches(x), Inches(y), Inches(w), Inches(h))
    if fill:
        sh.fill.solid()
        sh.fill.fore_color.rgb = rgb(fill)
    else:
        sh.fill.background()
    if line:
        sh.line.color.rgb = rgb(line)
        sh.line.width = Pt(lw)
        if dash:
            sh.line.dash_style = MSO_LINE.DASH
    else:
        sh.line.fill.background()
    sh.shadow.inherit = False
    _nostyle(sh)
    if radius is not None and shape == MSO_SHAPE.ROUNDED_RECTANGLE:
        sh.adjustments[0] = radius
    sh.text_frame.text = ""
    return sh


def gradient(sh, stops, angle=0):
    """stops: list of (pos 0-100, hex)."""
    sh.fill.gradient()
    sh.fill.gradient_angle = angle
    gs = sh.fill.gradient_stops
    # python-pptx gives 2 stops by default; rebuild list
    gsLst = sh.fill._xPr.find(qn("a:gradFill")).find(qn("a:gsLst"))
    for g in list(gsLst):
        gsLst.remove(g)
    for pos, hx in stops:
        g = etree.SubElement(gsLst, qn("a:gs"))
        g.set("pos", str(int(pos * 1000)))
        c = etree.SubElement(g, qn("a:srgbClr"))
        c.set("val", hx)


def line(s, x1, y1, x2, y2, color=NAVY, w=1.25, dash=False):
    """Drawn as a thin rectangle (imports cleanly into Canva; connectors often don't)."""
    import math
    t = w / 72  # thickness in inches
    dx, dy = x2 - x1, y2 - y1
    if abs(dy) < 1e-6:
        return rect(s, min(x1, x2), y1 - t / 2, abs(dx) + t / 2, t, fill=color)
    if abs(dx) < 1e-6:
        return rect(s, x1 - t / 2, min(y1, y2), t, abs(dy) + t / 2, fill=color)
    length = math.hypot(dx, dy)
    cx, cy = (x1 + x2) / 2, (y1 + y2) / 2
    r = rect(s, cx - length / 2, cy - t / 2, length, t, fill=color)
    r.rotation = math.degrees(math.atan2(dy, dx))
    return r


def text(s, x, y, w, h, paras, size=11, color=INK, bold=False, align="l", anchor="t",
         spacing=None, line_sp=None, font=FONT, inset=0.0, after=0):
    """paras: str | list of paragraphs; paragraph = str | list of runs; run = str | (str, dict)."""
    tb = s.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.auto_size = MSO_AUTO_SIZE.NONE
    for m in ("margin_left", "margin_right", "margin_top", "margin_bottom"):
        setattr(tf, m, Inches(inset))
    tf.vertical_anchor = {"t": MSO_ANCHOR.TOP, "m": MSO_ANCHOR.MIDDLE, "b": MSO_ANCHOR.BOTTOM}[anchor]
    if isinstance(paras, str):
        paras = [paras]
    for i, para in enumerate(paras):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = {"l": PP_ALIGN.LEFT, "c": PP_ALIGN.CENTER, "r": PP_ALIGN.RIGHT}[align]
        if line_sp:
            p.line_spacing = line_sp
        if after:
            p.space_after = Pt(after)
        p.font.size = Pt(size)
        runs = para if isinstance(para, list) else [para]
        for run in runs:
            if isinstance(run, tuple):
                t, st = run
            else:
                t, st = run, {}
            r = p.add_run()
            r.text = t
            f = r.font
            f.name = st.get("font", font)
            f.size = Pt(st.get("size", size))
            f.bold = st.get("bold", bold)
            f.italic = st.get("italic", False)
            f.color.rgb = rgb(st.get("color", color))
            sp = st.get("spacing", spacing)
            if sp is not None:
                r._r.get_or_add_rPr().set("spc", str(int(sp * 100)))
    return tb


def logos(s, right=R, top=0.42, h=0.5):
    """Three logos, right-aligned (same set as reference deck)."""
    items = [("logo_bj2027", 275 / 144), ("logo_johor", 170 / 144), ("logo_majujohor", 118 / 144)]
    gap = 0.16
    total = sum(h * r for _, r in items) + gap * (len(items) - 1)
    x = right - total
    for name, r in items:
        s.shapes.add_picture(os.path.join(ASSETS, name + ".png"), Inches(x), Inches(top), Inches(h * r), Inches(h))
        x += h * r + gap
    return right - total


def header(s, label, accent="", dark=False):
    """Red tick + LABEL accent ——— logos."""
    y = 0.48
    rect(s, L, y + 0.02, 0.075, 0.36, fill=RED)
    lab_col = WHITE if dark else NAVY
    runs = [(label.upper(), {"bold": True, "color": lab_col, "spacing": 1.2})]
    if accent:
        runs.append(("   " + accent, {"bold": True, "color": RED if not dark else "FF8A92"}))
    text(s, L + 0.2, y - 0.02, 7.5, 0.45, [runs], size=15, anchor="m")
    est = measure(label.upper(), 15, True, 1.2) + (measure("   " + accent, 15, True) if accent else 0)
    x0 = L + 0.2 + est + 0.25
    lx = logos(s)
    line(s, x0, y + 0.2, lx - 0.25, y + 0.2, color=WHITE if dark else NAVY, w=2)


def footer(s, n, label="JAWAPAN A201 & A133", dark=False):
    text(s, L, 6.92, 7, 0.3, label, size=9, color=("C9D0F0" if dark else GRAY), bold=True, spacing=1)
    text(s, R - 1, 6.88, 1, 0.3, f"{n:02d}", size=12, color=(WHITE if dark else RED), bold=True, align="r")


def title(s, t, sub=None, y=1.2, size=24, w=CW, color=NAVY, subcolor=GRAY):
    text(s, L, y, w, 0.5, t, size=size, bold=True, color=color)
    if sub:
        text(s, L, y + 0.5, w, 0.4, sub, size=12, color=subcolor)


_PH_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "_placeholders")
_PH_N = [0]


def _ph_png(w, h, label, desc, dark, oval):
    from PIL import Image, ImageDraw
    import math
    os.makedirs(_PH_DIR, exist_ok=True)
    dpi = 150
    W_, H_ = int(w * dpi), int(h * dpi)
    fill = "#2A3C93" if dark else "#EEF1FA"
    ln = "#8496E0" if dark else "#A3AEDD"
    im = Image.new("RGBA", (W_, H_), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    lw = max(2, int(dpi * 1.25 / 72))
    if oval:
        d.ellipse([0, 0, W_ - 1, H_ - 1], fill=fill)
        steps = 48
        for k in range(steps):
            if k % 2:
                continue
            a0, a1 = 360 * k / steps, 360 * (k + 1) / steps
            d.arc([lw // 2, lw // 2, W_ - 1 - lw // 2, H_ - 1 - lw // 2], a0, a1, fill=ln, width=lw)
    else:
        d.rectangle([0, 0, W_ - 1, H_ - 1], fill=fill)
        dash, gap = int(dpi * 0.08), int(dpi * 0.05)
        for (ax, ay, bx, by) in [(0, 0, W_, 0), (0, H_ - lw, W_, H_ - lw), (0, 0, 0, H_), (W_ - lw, 0, W_ - lw, H_)]:
            horiz = ay == by
            n = (bx - ax) if horiz else (by - ay)
            pos = 0
            while pos < n:
                e = min(pos + dash, n)
                if horiz:
                    d.rectangle([ax + pos, ay, ax + e, ay + lw - 1], fill=ln)
                else:
                    d.rectangle([ax, ay + pos, ax + lw - 1, ay + e], fill=ln)
                pos += dash + gap
    fb = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
    fr = "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"
    tiny = w < 1.3
    small = h < 1.3
    lab_pt = 7 if tiny else (9 if small else 10)
    des_pt = 8 if small else 8.5
    fl = ImageFont.truetype(fb, int(lab_pt * dpi / 72))
    fd = ImageFont.truetype(fr, int(des_pt * dpi / 72))
    lab_col = "#D5DCF7" if dark else "#13257B"
    des_col = "#B7C2EE" if dark else "#646A80"
    labs = label.split("\n")
    descs = [x for x in desc.split("\n") if x.strip()]
    if small and len(descs) > 1:
        descs = [" ".join(descs)]
    rows = []
    for lb in labs:
        t = ("+  " if w > 1.5 else "") + lb
        if not tiny:
            t = " ".join(t)  # letter-spaced look
        rows.append((t, fl, lab_col))
    for dl in descs:
        rows.append((dl, fd, des_col))
    lh = [f.getbbox("Ag")[3] + int(dpi * 0.03) for _, f, _ in rows]
    gap_after_label = int(dpi * 0.05) if descs and not small else 0
    total = sum(lh) + gap_after_label
    yy = (H_ - total) / 2
    for i, ((t, f, c), h_) in enumerate(zip(rows, lh)):
        tw = f.getlength(t)
        d.text(((W_ - tw) / 2, yy), t, font=f, fill=c)
        yy += h_ + (gap_after_label if i == len(labs) - 1 else 0)
    _PH_N[0] += 1
    path = os.path.join(_PH_DIR, f"ph_{_PH_N[0]:03d}.png")
    im.save(path)
    return path


def photo(s, x, y, w, h, desc="Foto berkaitan", label="RUANG GAMBAR", dark=False, shape=MSO_SHAPE.RECTANGLE):
    """Placeholder IMAGE (one element). Canva: drag a photo onto it to replace.
    PowerPoint: right-click > Change Picture. Google Slides: right-click > Replace image."""
    oval = shape == MSO_SHAPE.OVAL
    png = _ph_png(w, h, label, desc, dark, oval)
    pic = s.shapes.add_picture(png, Inches(x), Inches(y), Inches(w), Inches(h))
    pic.name = "RUANG GAMBAR"
    if oval:  # keep the circular crop when the picture is replaced
        geom = pic._element.spPr.find(qn("a:prstGeom"))
        geom.set("prst", "ellipse")
    return pic


def card(s, x, y, w, h, top=NAVY, fill=WHITE, border=RULE, topw=0.05):
    rect(s, x, y, w, h, fill=fill, line=border, lw=0.5)
    if top:
        rect(s, x, y, w, topw, fill=top)


def leftbar_card(s, x, y, w, h, bar=NAVY, fill=WHITE):
    rect(s, x, y, w, h, fill=fill, line=RULE, lw=0.5)
    rect(s, x, y, 0.06, h, fill=bar)


def badge(s, x, y, t, fill=NAVY, color=WHITE, w=0.42, h=0.36, size=11):
    rect(s, x, y, w, h, fill=fill)
    text(s, x, y, w, h, t, size=size, bold=True, color=color, align="c", anchor="m")


def chip(s, x, y, t, w, fill=None, line_c="8496E0", color=WHITE, size=9.5, h=0.34):
    rect(s, x, y, w, h, fill=fill, line=line_c, lw=0.75)
    text(s, x, y, w, h, t, size=size, color=color, align="c", anchor="m", bold=True)


def circle(s, cx, cy, d, fill=NAVY, line_c=None, lw=0):
    return rect(s, cx - d / 2, cy - d / 2, d, d, fill=fill, line=line_c, lw=lw or 0.75, shape=MSO_SHAPE.OVAL)


def no_table_style(tbl_shape):
    tbl = tbl_shape._element.graphic.graphicData.tbl
    tblPr = tbl.find(qn("a:tblPr"))
    for k in ("firstRow", "bandRow"):
        tblPr.set(k, "0")
    sid = tblPr.find(qn("a:tableStyleId"))
    if sid is None:
        sid = etree.SubElement(tblPr, qn("a:tableStyleId"))
    sid.text = "{2D5ABB26-0587-4C30-8999-92F81FD0307C}"


def cell_border(cell, sides="B", color=RULE, w=0.75):
    tcPr = cell._tc.get_or_add_tcPr()
    for side in "LRTB":
        tag = qn(f"a:ln{side}")
        old = tcPr.find(tag)
        if old is not None:
            tcPr.remove(old)
    for side in "LRTB":
        ln = etree.SubElement(tcPr, qn(f"a:ln{side}"))
        if side in sides:
            ln.set("w", str(int(Pt(w))))
            sf = etree.SubElement(ln, qn("a:solidFill"))
            c = etree.SubElement(sf, qn("a:srgbClr"))
            c.set("val", color)
        else:
            ln.set("w", "0")
            etree.SubElement(ln, qn("a:noFill"))
    # lnX must come before fill in schema order: move fill elements after borders
    for f in (qn("a:solidFill"), qn("a:noFill")):
        for el in tcPr.findall(f):
            tcPr.remove(el)
            tcPr.append(el)


def set_cell(cell, t, size=9, bold=False, color=INK, fill=None, align="l", margin=0.06, vmargin=0.02):
    cell.text = ""
    tf = cell.text_frame
    tf.word_wrap = True
    paras = t if isinstance(t, list) else [t]
    for i, para in enumerate(paras):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = {"l": PP_ALIGN.LEFT, "c": PP_ALIGN.CENTER, "r": PP_ALIGN.RIGHT}[align]
        p.font.size = Pt(size)
        runs = para if isinstance(para, list) else [para]
        for run in runs:
            tt, st = (run if isinstance(run, tuple) else (run, {}))
            r = p.add_run()
            r.text = tt if tt != "" else "\u00a0"
            r.font.name = FONT
            r.font.size = Pt(st.get("size", size))
            r.font.bold = st.get("bold", bold)
            r.font.color.rgb = rgb(st.get("color", color))
    cell.margin_left = cell.margin_right = Inches(margin)
    cell.margin_top = cell.margin_bottom = Inches(vmargin)
    cell.vertical_anchor = MSO_ANCHOR.MIDDLE
    if fill:
        cell.fill.solid()
        cell.fill.fore_color.rgb = rgb(fill)
    else:
        cell.fill.background()


def table(s, x, y, colw, rowh, nrows):
    shp = s.shapes.add_table(nrows, len(colw), Inches(x), Inches(y), Inches(sum(colw)), Inches(rowh * nrows))
    no_table_style(shp)
    t = shp.table
    for i, cw in enumerate(colw):
        t.columns[i].width = Inches(cw)
    for r in t.rows:
        r.height = Inches(rowh)
    return t


def connect(s, a, b, color=NAVY, w=1.5, dash=False):
    """straight line between two (x,y) points."""
    return line(s, a[0], a[1], b[0], b[1], color=color, w=w, dash=dash)


def elbow(s, a, b, color=NAVY, w=1.5, midx=None):
    """horizontal-vertical-horizontal connector from a to b."""
    mx = midx if midx is not None else (a[0] + b[0]) / 2
    line(s, a[0], a[1], mx, a[1], color=color, w=w)
    line(s, mx, a[1], mx, b[1], color=color, w=w)
    line(s, mx, b[1], b[0], b[1], color=color, w=w)
