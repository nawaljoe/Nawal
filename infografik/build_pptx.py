#!/usr/bin/env python3
"""Bina PPTX boleh sunting daripada layout.json (hasil extract.js)."""
import json, sys, os
from pptx import Presentation
from pptx.util import Emu, Pt
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR, MSO_AUTO_SIZE
from pptx.enum.dml import MSO_LINE
from pptx.oxml.ns import qn
from lxml import etree

SRC, OUTFILE = sys.argv[1], sys.argv[2]
E = 6350  # EMU per px (1920px = 12192000 EMU)
FONT_MAP = {"Caladea": "Georgia", "Liberation Serif": "Georgia"}

def px(v): return Emu(int(round(v * E)))

def set_alpha(color_fmt_parent, a):
    if a >= 0.999: return
    clr = color_fmt_parent.find('.//' + qn('a:srgbClr'))
    if clr is not None:
        al = etree.SubElement(clr, qn('a:alpha')); al.set('val', str(int(a * 100000)))

def rgb(c): return RGBColor(int(round(c['r'])), int(round(c['g'])), int(round(c['b'])))

layout = json.load(open(os.path.join(SRC, 'layout.json')))
prs = Presentation(); prs.slide_width = Emu(12192000); prs.slide_height = Emu(6858000)

for S in layout:
    s = prs.slides.add_slide(prs.slide_layouts[6])
    pic = s.shapes.add_picture(os.path.join(SRC, S['bg']), 0, 0, prs.slide_width, prs.slide_height)
    pic.name = "Latar"
    for it in S['items']:
        t = it['t']
        if t == 'rect':
            w, h = it['w'], it['h']
            if it.get('topRound') is not None:
                shp = s.shapes.add_shape(MSO_SHAPE.ROUND_2_SAME_RECTANGLE, px(it['x']), px(it['y']), px(w), px(h))
                shp.adjustments[0] = min(0.5, it['topRound'] / max(1, min(w, h))); shp.adjustments[1] = 0
            elif it['ell']:
                shp = s.shapes.add_shape(MSO_SHAPE.OVAL, px(it['x']), px(it['y']), px(w), px(h))
            elif it['rad'] > 0:
                shp = s.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, px(it['x']), px(it['y']), px(w), px(h))
                shp.adjustments[0] = min(0.5, it['rad'] / max(1, min(w, h)))
            else:
                shp = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, px(it['x']), px(it['y']), px(w), px(h))
            shp.shadow.inherit = False
            if it['rot']: shp.rotation = it['rot']
            f = it['fill']
            if f:
                shp.fill.solid(); shp.fill.fore_color.rgb = rgb(f); set_alpha(shp._element.spPr.find(qn('a:solidFill')), f['a'])
            else:
                shp.fill.background()
            ln = it['line']
            if ln:
                shp.line.color.rgb = rgb(ln['color']); shp.line.width = Pt(ln['w'] * 0.5)
                set_alpha(shp._element.spPr.find(qn('a:ln')), ln['color']['a'])
                if ln['dash']: shp.line.dash_style = MSO_LINE.DASH
            else:
                shp.line.fill.background()
        elif t == 'text':
            ow = it['w']; T = it['tb']; serif = any(FONT_MAP.get(r['family']) for r in it['paras'][0])
            sl = (1.10 if (serif or it['align'] != 'left') else 1.04) if not it['single'] else 1.0
            nw = T['w'] * sl + (8 if it['single'] else 4)
            if it['align'] == 'right': it['x'] = T['x'] + T['w'] - nw
            elif it['align'] == 'center': it['x'] = T['x'] + T['w'] / 2 - nw / 2
            else: it['x'] = T['x']
            it['w'] = min(nw, ow / (1.05 if serif else 1.03) - 6) if (not it['single'] and it['align'] == 'left') else nw
            if it['align'] == 'left': it['x'] = T['x']
            tb = s.shapes.add_textbox(px(it['x']), px(it['y']), px(it['w']), px(it['h']))
            tf = tb.text_frame
            tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
            tf.word_wrap = not it['single']; tf.auto_size = MSO_AUTO_SIZE.NONE; tf.vertical_anchor = MSO_ANCHOR.TOP
            al = {'left': PP_ALIGN.LEFT, 'center': PP_ALIGN.CENTER, 'right': PP_ALIGN.RIGHT}[it['align']]
            for i, para in enumerate(it['paras']):
                p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
                p.alignment = al; p.line_spacing = Pt(it['lh'] * 0.5); p.space_before = Pt(0); p.space_after = Pt(0)
                for rn in para:
                    if not rn['text']: continue
                    r = p.add_run(); r.text = rn['text']
                    f = r.font; f.size = Pt(rn['size'] * 0.5 * ((0.84 if rn['bold'] else 0.93) if FONT_MAP.get(rn['family']) else 1)); f.bold = rn['bold']; f.italic = rn['italic']
                    f.name = FONT_MAP.get(rn['family'], rn['family'])
                    if rn['color']: f.color.rgb = rgb(rn['color'])
                    if rn['spc']: r._r.get_or_add_rPr().set('spc', str(int(round(rn['spc'] * 50))))
        elif t == 'img':
            s.shapes.add_picture(it['src'], px(it['x']), px(it['y']), px(it['w']), px(it['h']))
        elif t == 'icon':
            s.shapes.add_picture(os.path.join(SRC, it['file']), px(it['x']), px(it['y']), px(it['w']), px(it['h']))
        elif t == 'svgfull':
            s.shapes.add_picture(os.path.join(SRC, it['file']), 0, 0, prs.slide_width, prs.slide_height)
prs.save(OUTFILE)
print("saved", OUTFILE)
