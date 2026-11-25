from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.dml import MSO_LINE
from pptx.chart.data import CategoryChartData
from pptx.enum.chart import XL_CHART_TYPE, XL_LABEL_POSITION
import os

HERE = os.path.dirname(os.path.abspath(__file__))
A = os.path.join(HERE, "assets")

NAVY = RGBColor(0x1E, 0x2A, 0x7B)
DEEP = RGBColor(0x0E, 0x17, 0x4D)
RED = RGBColor(0xD0, 0x20, 0x2F)
GOLD = RGBColor(0xC2, 0x9A, 0x3F)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
CHAR = RGBColor(0x22, 0x25, 0x2E)
GREY = RGBColor(0xEE, 0xF0, 0xF6)
MID = RGBColor(0x6B, 0x72, 0x8C)
FONT = "Arial"

prs = Presentation()
prs.slide_width = Inches(13.333)
prs.slide_height = Inches(7.5)
BLANK = prs.slide_layouts[6]
TOTAL = 7


def rect(s, x, y, w, h, fill=None, line=None, lw=1, shape=MSO_SHAPE.RECTANGLE, dash=False):
    sh = s.shapes.add_shape(shape, Inches(x), Inches(y), Inches(w), Inches(h))
    sh.shadow.inherit = False
    if fill is None:
        sh.fill.background()
    else:
        sh.fill.solid()
        sh.fill.fore_color.rgb = fill
    if line is None:
        sh.line.fill.background()
    else:
        sh.line.color.rgb = line
        sh.line.width = Pt(lw)
        if dash:
            sh.line.dash_style = MSO_LINE.DASH
    return sh


def text(s, x, y, w, h, runs, size=18, color=CHAR, bold=False, align=PP_ALIGN.LEFT,
         anchor=MSO_ANCHOR.TOP, italic=False, shape=None, spacing=None):
    """runs: str, or list of paragraphs; each paragraph str or list of (text, dict) runs"""
    sh = shape if shape is not None else s.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf = sh.text_frame
    tf.word_wrap = True
    tf.vertical_anchor = anchor
    tf.margin_left = tf.margin_right = Inches(0.05)
    tf.margin_top = tf.margin_bottom = Inches(0.03)
    paras = runs if isinstance(runs, list) else [runs]
    for i, p in enumerate(paras):
        para = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        para.alignment = align
        if spacing:
            para.space_after = Pt(spacing)
        parts = p if isinstance(p, list) else [(p, {})]
        for t, o in parts:
            r = para.add_run()
            r.text = t
            f = r.font
            f.name = FONT
            f.size = Pt(o.get("size", size))
            f.bold = o.get("bold", bold)
            f.italic = o.get("italic", italic)
            f.color.rgb = o.get("color", color)
    return sh


def placeholder(s, x, y, w, h, label, sub="Ruang gambar sebenar (boleh diganti)"):
    sh = rect(s, x, y, w, h, fill=GREY, line=NAVY, lw=1.5, dash=True)
    text(s, x, y, w, h, [[(label, {"bold": True, "size": 15, "color": NAVY})],
                         [(sub, {"size": 12, "color": MID})]],
         align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE, shape=sh)
    sh.name = "PLACEHOLDER GAMBAR"
    return sh


def bars(s, x, y, w=1.6, h=0.06):
    rect(s, x, y, w / 2, h, fill=RED)
    rect(s, x + w / 2, y, w / 2, h, fill=NAVY)


def logos(s, x_right, y, h):
    """3 logos right-aligned at x_right, height h"""
    items = [("belanjawan", 199 / 100), ("jata", 158 / 125), ("majujohor", 106 / 122)]
    gap = 0.25
    widths = [h * r for _, r in items]
    total = sum(widths) + gap * 2
    x = x_right - total
    for (n, _), wd in zip(items, widths):
        s.shapes.add_picture(os.path.join(A, n + ".png"), Inches(x), Inches(y), Inches(wd), Inches(h))
        x += wd + gap


def base(title, kicker, n, notes):
    s = prs.slides.add_slide(BLANK)
    s.background.fill.solid()
    s.background.fill.fore_color.rgb = WHITE
    rect(s, 0, 0, 13.333, 0.12, fill=NAVY)
    rect(s, 0, 0, 4.4, 0.12, fill=RED)
    text(s, 0.6, 0.3, 7.5, 0.4, kicker, size=14, color=RED, bold=True)
    logos(s, 12.73, 0.22, 0.62)
    text(s, 0.6, 0.85, 12.1, 1.05, title, size=28, color=NAVY, bold=True, anchor=MSO_ANCHOR.MIDDLE)
    bars(s, 0.65, 1.98, 1.8, 0.07)
    # footer
    rect(s, 0.6, 7.12, 12.13, 0.015, fill=GOLD)
    text(s, 0.6, 7.14, 9, 0.3, "Jawapan Soalan Lisan A93  |  Belanjawan Johor 2027  |  26 November 2026",
         size=11, color=MID)
    text(s, 11.7, 7.14, 1.03, 0.3, f"{n} / {TOTAL}", size=11, color=MID, align=PP_ALIGN.RIGHT)
    s.notes_slide.notes_text_frame.text = notes
    return s


def kpi(s, x, y, w, h, num, label, fill=NAVY, numc=WHITE, labc=WHITE, nsize=40, lsize=15, accent=GOLD):
    rect(s, x, y, w, h, fill=fill)
    rect(s, x, y, 0.08, h, fill=accent)
    text(s, x + 0.2, y + 0.05, w - 0.3, h * 0.55, num, size=nsize, color=numc, bold=True, anchor=MSO_ANCHOR.BOTTOM)
    text(s, x + 0.2, y + h * 0.58, w - 0.3, h * 0.4, label, size=lsize, color=labc, anchor=MSO_ANCHOR.TOP)


# ---------------------------------------------------------------- SLIDE 1
s = prs.slides.add_slide(BLANK)
s.background.fill.solid()
s.background.fill.fore_color.rgb = WHITE
rect(s, 8.7, 0, 4.633, 7.5, fill=NAVY)
rect(s, 8.7, 0, 0.1, 7.5, fill=GOLD)
rect(s, 0, 0, 8.7, 0.12, fill=RED)
rect(s, 0, 0, 4.4, 0.12, fill=RED)
logos(s, 8.1, 0.5, 0.85)
bars(s, 0.65, 1.8, 2.2, 0.08)
text(s, 0.6, 2.0, 7.9, 2.9, "PEMBANGUNAN INDUSTRI HALAL JOHOR DIPERKASA MELALUI PKHNJ 2030",
     size=38, color=NAVY, bold=True, anchor=MSO_ANCHOR.MIDDLE)
bars(s, 0.65, 5.0, 2.2, 0.08)
text(s, 0.6, 5.2, 7.9, 0.5, "Jawapan Soalan Lisan A93  |  Belanjawan Johor 2027", size=22, color=RED, bold=True)
text(s, 0.6, 5.75, 7.9, 0.45, [[("Soalan daripada: ", {"color": MID}), ("YB Tuan Ng Yak Howe (Bentayan)", {"bold": True, "color": CHAR})]], size=18)
text(s, 0.6, 6.2, 7.9, 0.4, "Pengerusi Jawatankuasa Hal Ehwal Agama Islam Negeri Johor", size=16, color=NAVY)
text(s, 0.6, 6.6, 7.9, 0.4, "Dewan Negeri Johor  |  26 November 2026 (Khamis)", size=14, color=MID)
placeholder(s, 9.25, 0.9, 3.55, 5.7, "LETAKKAN GAMBAR RASMI YB EXCO DI SINI", "Potret 3:4 – gambar sebenar sahaja")
text(s, 9.0, 6.75, 4.1, 0.4, "Mesyuarat Kedua (Belanjawan 2027) – DUN Johor ke-16", size=11, color=WHITE, align=PP_ALIGN.CENTER)
s.notes_slide.notes_text_frame.text = ("Sumber: Jawapan Soalan Lisan Mesyuarat Kedua (Belanjawan 2027), 26 November 2026, soalan A93 "
                                       "daripada YB Tuan Ng Yak Howe (Bentayan). [SEMAK: nama YB Pengerusi tidak dinyatakan dalam dokumen jawapan.]")

# ---------------------------------------------------------------- SLIDE 2
s = base("PKHNJ 2030: HALA TUJU STRATEGIK MEMBANGUNKAN EKOSISTEM HALAL JOHOR",
         "HALA TUJU", 2,
         "Pelan Kemajuan Halal Negeri Johor 2030 (PKHNJ 2030). Majlis pra-pelancaran 7 Disember 2025, disempurnakan oleh "
         "YAB Dato' Onn Hafiz Ghazi, Menteri Besar Johor. Semua sasaran adalah untuk tahun 2030.")
text(s, 0.6, 2.2, 8.3, 0.35, "SASARAN 2030 – PENSIJILAN DAN TENAGA KERJA", size=14, color=GOLD, bold=True)
kpi(s, 0.6, 2.6, 2.7, 1.45, "5,000", "pensijilan halal", nsize=44)
kpi(s, 3.45, 2.6, 2.7, 1.45, "20", "syarikat Halal Champion", nsize=44)
kpi(s, 6.3, 2.6, 2.6, 1.45, "4,000", "tenaga kerja mahir halal", nsize=44)
text(s, 0.6, 4.2, 8.3, 0.35, "SASARAN 2030 – EKONOMI", size=14, color=GOLD, bold=True)
kpi(s, 0.6, 4.6, 3.7, 2.35, "RM62 bilion", "jumlah keluaran industri halal", fill=RED, nsize=40, lsize=18, accent=GOLD)
rows = [("RM24 bilion", "sumbangan kepada KDNK sektor halal negeri"),
        ("RM18 bilion", "nilai eksport halal"),
        ("RM5 bilion", "pelaburan terkumpul")]
for i, (n, l) in enumerate(rows):
    yy = 4.6 + i * 0.8
    rect(s, 4.45, yy, 4.45, 0.75, fill=GREY)
    rect(s, 4.45, yy, 0.08, 0.75, fill=NAVY)
    text(s, 4.6, yy, 1.95, 0.75, n, size=22, color=NAVY, bold=True, anchor=MSO_ANCHOR.MIDDLE)
    text(s, 6.5, yy, 2.4, 0.75, l, size=13, color=CHAR, anchor=MSO_ANCHOR.MIDDLE)
placeholder(s, 9.2, 2.2, 3.53, 3.3, "GAMBAR INDUSTRI HALAL / MAJLIS PELANCARAN PKHNJ 2030")
rect(s, 9.2, 5.65, 3.53, 1.3, fill=NAVY)
rect(s, 9.2, 5.65, 3.53, 0.07, fill=GOLD)
text(s, 9.3, 5.75, 3.35, 1.2, [[("PRA-PELANCARAN", {"size": 12, "color": GOLD, "bold": True})],
                               [("7 Disember 2025", {"size": 24, "color": WHITE, "bold": True})],
                               [("oleh YAB Dato' Onn Hafiz Ghazi, Menteri Besar Johor", {"size": 12, "color": WHITE})]],
     anchor=MSO_ANCHOR.MIDDLE)

# ---------------------------------------------------------------- SLIDE 3
s = base("1,765 USAHAWAN BERJAYA MEMPEROLEH PENSIJILAN HALAL", "PENCAPAIAN PENSIJILAN", 3,
         "1,765 usahawan sejak PKHNJ 2030 diperkenalkan (463 Bumiputera + 1,262 Bukan Bumiputera + 40 milikan asing). "
         "737 kelulusan baharu SPHM sehingga Oktober 2026 berbanding 133 pada 2024. 4,510 sijil halal aktif sehingga September 2026 "
         "(+863 berbanding 2025). 93.08% permohonan SPHM diluluskan dalam tempoh 30 hari bekerja.")
text(s, 0.6, 2.1, 4.7, 1.45, "1,765", size=96, color=RED, bold=True, anchor=MSO_ANCHOR.MIDDLE)
text(s, 0.6, 3.5, 4.7, 0.7, "usahawan memperoleh pensijilan halal sejak PKHNJ 2030 diperkenalkan",
     size=15, color=CHAR)
cd = CategoryChartData()
cd.categories = ["Bumiputera", "Bukan Bumiputera", "Milikan asing"]
cd.add_series("Usahawan", (463, 1262, 40))
gf = s.shapes.add_chart(XL_CHART_TYPE.DOUGHNUT, Inches(0.5), Inches(4.3), Inches(2.7), Inches(2.7), cd)
ch = gf.chart
ch.has_legend = False
ch.has_title = False
cols = [GOLD, NAVY, RED]
for i, c in enumerate(cols):
    pt = ch.plots[0].series[0].points[i]
    pt.format.fill.solid()
    pt.format.fill.fore_color.rgb = c
    pt.format.line.color.rgb = WHITE
leg = [("463", "usahawan Bumiputera", GOLD), ("1,262", "usahawan Bukan Bumiputera", NAVY), ("40", "usahawan milikan asing", RED)]
for i, (n, l, c) in enumerate(leg):
    yy = 4.4 + i * 0.85
    rect(s, 3.3, yy + 0.1, 0.2, 0.55, fill=c)
    text(s, 3.58, yy, 1.9, 0.8, [[(n, {"size": 24, "bold": True, "color": c if c != GOLD else CHAR})],
                                 [(l, {"size": 12, "color": CHAR})]], anchor=MSO_ANCHOR.MIDDLE)
# comparison chart
rect(s, 5.6, 2.2, 3.2, 4.75, fill=GREY)
text(s, 5.7, 2.25, 3.0, 0.7, "KELULUSAN BAHARU SPHM", size=14, color=NAVY, bold=True)
cd2 = CategoryChartData()
cd2.categories = ["2024", "Sehingga Okt 2026"]
cd2.add_series("Kelulusan baharu SPHM", (133, 737))
gf2 = s.shapes.add_chart(XL_CHART_TYPE.COLUMN_CLUSTERED, Inches(5.7), Inches(2.9), Inches(3.0), Inches(3.95), cd2)
c2 = gf2.chart
c2.has_legend = False
c2.has_title = False
c2.value_axis.visible = False
c2.value_axis.has_major_gridlines = False
c2.value_axis.maximum_scale = 900
c2.category_axis.tick_labels.font.size = Pt(12)
c2.category_axis.tick_labels.font.name = FONT
c2.category_axis.format.line.color.rgb = MID
pl = c2.plots[0]
pl.gap_width = 45
pl.has_data_labels = True
dl = pl.data_labels
dl.font.size = Pt(26)
dl.font.bold = True
dl.font.name = FONT
dl.position = XL_LABEL_POSITION.OUTSIDE_END
for i, c in enumerate([NAVY, RED]):
    p = pl.series[0].points[i]
    p.format.fill.solid()
    p.format.fill.fore_color.rgb = c
# KPI cards
kpi(s, 9.1, 2.2, 3.63, 1.3, "4,510", "sijil halal aktif sehingga September 2026 (+863 berbanding 2025)", nsize=36, lsize=12)
kpi(s, 9.1, 3.65, 3.63, 1.3, "93.08%", "permohonan SPHM diluluskan dalam tempoh 30 hari bekerja", fill=RED, nsize=36, lsize=12)
placeholder(s, 9.1, 5.1, 3.63, 1.85, "GAMBAR USAHAWAN / PREMIS BERSIJIL HALAL")

# ---------------------------------------------------------------- SLIDE 4
s = base("MEMPERKUKUH PENSIJILAN, MELAHIRKAN TENAGA KERJA MAHIR HALAL", "INISIATIF STRATEGIK", 4,
         "A) Kerjasama JAINJ dan JHDC; Halal Green Lane secara rintis – lapan permohonan diluluskan dalam 15 hari bekerja, termasuk PRefChem di Pengerang. "
         "B) 779 peserta dilatih sepanjang 2025; 206 sehingga April 2026; TVET Halal Johor; PIJ RM200,000 untuk Kursus Profesional Halal dan Auditor Halal (100 peserta).")
# left
chip = rect(s, 0.6, 2.2, 5.9, 0.5, fill=NAVY)
text(s, 0.6, 2.2, 5.9, 0.5, "A.  PEMERKASAAN PENSIJILAN HALAL", size=16, color=WHITE, bold=True, anchor=MSO_ANCHOR.MIDDLE, shape=chip)
text(s, 0.6, 2.8, 5.9, 0.9, "Kerjasama JAINJ dan Johor Halal Development Corporation (JHDC): bimbingan, khidmat nasihat dan pemudahcaraan permohonan.",
     size=15, color=CHAR)
steps = [("BIMBINGAN", "JAINJ + JHDC"), ("GREEN LANE", "Halal Green Lane (rintis)"), ("8 PERMOHONAN", "diluluskan dalam 15 hari bekerja")]
for i, (a, b) in enumerate(steps):
    xx = 0.6 + i * 1.98
    col = [NAVY, GOLD, RED][i]
    sh = rect(s, xx, 3.8, 2.05, 1.25, fill=col, shape=MSO_SHAPE.PENTAGON)
    text(s, xx + 0.05, 3.8, 1.6, 1.25, [[(a, {"size": 14, "bold": True, "color": WHITE if col != GOLD else CHAR})],
                                                      [(b, {"size": 11, "color": WHITE if col != GOLD else CHAR})]],
         align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
text(s, 0.6, 5.1, 5.9, 0.4, "Termasuk syarikat petrokimia PRefChem di Pengerang.", size=14, color=NAVY, bold=True)
placeholder(s, 0.6, 5.55, 5.9, 1.4, "GAMBAR LATIHAN TVET / KURSUS / AUDIT HALAL")
# right
rect(s, 6.83, 2.2, 5.9, 0.5, fill=RED)
text(s, 6.83, 2.2, 5.9, 0.5, "B.  PEMBANGUNAN BAKAT HALAL", size=16, color=WHITE, bold=True, anchor=MSO_ANCHOR.MIDDLE,
     shape=s.shapes[-1])
rect(s, 6.83, 2.85, 2.85, 1.8, fill=GREY)
text(s, 6.83, 2.85, 2.85, 1.15, "779", size=60, color=NAVY, bold=True, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
text(s, 6.9, 3.95, 2.7, 0.7, "peserta dilatih sepanjang tahun 2025", size=14, color=CHAR, align=PP_ALIGN.CENTER)
rect(s, 9.88, 2.85, 2.85, 1.8, fill=GREY)
text(s, 9.88, 2.85, 2.85, 1.15, "206", size=60, color=RED, bold=True, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
text(s, 9.95, 3.95, 2.7, 0.7, "peserta dilatih sehingga April 2026", size=14, color=CHAR, align=PP_ALIGN.CENTER)
text(s, 6.83, 4.85, 5.9, 1.0, [[("TVET Halal Johor: ", {"bold": True, "color": NAVY}),
                                 ("kohort awal berjaya menamatkan latihan dan sebahagiannya telah memasuki sektor pekerjaan berkaitan industri halal.", {})]],
     size=15, color=CHAR)
rect(s, 6.83, 5.95, 5.9, 1.0, fill=NAVY)
rect(s, 6.83, 5.95, 0.08, 1.0, fill=GOLD)
text(s, 7.05, 5.95, 5.6, 1.0, [[("RM200,000", {"size": 26, "bold": True, "color": GOLD})],
                               [("PIJ – Kursus Profesional Halal dan Auditor Halal (100 peserta)", {"size": 13, "color": WHITE})]],
     anchor=MSO_ANCHOR.MIDDLE)

# ---------------------------------------------------------------- SLIDE 5
s = base("HALAL CHAMPION: MEMBIMBING USAHAWAN KE ARAH PERTUMBUHAN LEBIH KOMPETITIF", "PEMBANGUNAN USAHAWAN HALAL", 5,
         "Halal Champion: 32 dicalonkan, 20 menyatakan komitmen, 16 menyertai kohort perintis Halal Champion Sandbox Johor. "
         "Melibatkan penyelarasan 18 agensi. Halal Sukses Johor dengan kerjasama KUSKOP. "
         "[SEMAK: dokumen sumber mengandungi petak '[SENARAI HALAL CHAMPION]' yang belum diisi – senarai nama TIDAK dimasukkan.]")
fun = [(32, "usahawan dicalonkan", 4.0, NAVY), (20, "usahawan menyatakan komitmen", 3.1, NAVY),
       (16, "menyertai kohort perintis Halal Champion Sandbox Johor", 2.2, RED)]
for i, (n, l, w, c) in enumerate(fun):
    yy = 2.2 + i * 1.07
    xx = 0.6 + (4.0 - w) / 2
    rect(s, xx, yy, w, 0.95, fill=c)
    text(s, xx, yy, w, 0.95, str(n), size=44, color=WHITE, bold=True, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
    text(s, 4.75, yy, 2.1, 0.95, l, size=14, color=CHAR, anchor=MSO_ANCHOR.MIDDLE)
    if i < 2:
        a = rect(s, 2.4, yy + 0.93, 0.4, 0.15, fill=GOLD, shape=MSO_SHAPE.DOWN_ARROW)
rect(s, 0.6, 5.55, 6.25, 1.4, fill=NAVY)
rect(s, 0.6, 5.55, 6.25, 0.07, fill=GOLD)
text(s, 0.8, 5.65, 5.9, 1.3, [[("HALAL SUKSES JOHOR", {"size": 20, "bold": True, "color": GOLD})],
                              [("Dengan kerjasama Kementerian Pembangunan Usahawan dan Koperasi (KUSKOP) sebagai platform bimbingan dan pembangunan usahawan.",
                                {"size": 14, "color": WHITE})]], anchor=MSO_ANCHOR.MIDDLE)
# right
rect(s, 7.2, 2.2, 5.53, 0.85, fill=GREY)
rect(s, 7.2, 2.2, 0.08, 0.85, fill=RED)
text(s, 7.35, 2.2, 1.5, 0.85, "18", size=44, color=RED, bold=True, anchor=MSO_ANCHOR.MIDDLE)
text(s, 8.8, 2.2, 3.9, 0.85, "agensi teknikal, pembiayaan dan pembangunan usahawan diselaraskan", size=14, color=CHAR, anchor=MSO_ANCHOR.MIDDLE)
sup = ["Pensijilan halal", "Pembiayaan", "Penjenamaan dan pembungkusan", "Pemasaran", "Pengembangan operasi", "Akses pasaran eksport"]
for i, t in enumerate(sup):
    cx = 7.2 + (i % 2) * 2.8
    cy = 3.2 + (i // 2) * 0.58
    rect(s, cx, cy, 2.73, 0.5, fill=WHITE, line=NAVY, lw=1.25)
    o = rect(s, cx + 0.08, cy + 0.08, 0.34, 0.34, fill=GOLD, shape=MSO_SHAPE.OVAL)
    text(s, 0, 0, 0, 0, str(i + 1), size=12, color=CHAR, bold=True, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE, shape=o)
    text(s, cx + 0.45, cy, 2.25, 0.5, t, size=13, color=NAVY, bold=True, anchor=MSO_ANCHOR.MIDDLE)
placeholder(s, 7.2, 5.0, 5.53, 1.95, "GAMBAR USAHAWAN HALAL CHAMPION / PRODUK HALAL TEMPATAN")

# ---------------------------------------------------------------- SLIDE 6
s = base("SOKONGAN KEWANGAN DAN AKSES PASARAN DIPERLUAS KEPADA USAHAWAN", "INSENTIF DAN AKSES PASARAN", 6,
         "MAINJ RM500,000 (usahawan kecil, pensijilan halal). PIJ RM459,000 untuk 153 kantin SAKJ dipersijilkan halal pada 2026 melalui Belanjawan Johor 2025. "
         "PIJ RM200,000 untuk 40 usahawan medan selera pada 2027 melalui Belanjawan Johor 2027. Johor Halal Journey di 10 daerah. "
         "[SEMAK: dokumen tidak menamakan 10 daerah – peta Johor dimasukkan sebagai ruang untuk gambar/peta rasmi.]")
text(s, 0.6, 2.15, 6.0, 0.35, "INSENTIF DAN SOKONGAN", size=14, color=GOLD, bold=True)
cards = [("RM500,000", "MAINJ", "membantu usahawan kecil mendapatkan pensijilan halal", NAVY),
         ("RM459,000", "PIJ", "kepada 153 kantin SAKJ yang dipersijilkan halal pada tahun 2026 (Belanjawan Johor 2025)", NAVY),
         ("RM200,000", "PIJ", "untuk manfaat 40 usahawan medan selera di Negeri Johor pada tahun 2027 (Belanjawan Johor 2027)", RED)]
for i, (n, who, l, c) in enumerate(cards):
    yy = 2.55 + i * 1.5
    rect(s, 0.6, yy, 6.0, 1.4, fill=c)
    rect(s, 0.6, yy, 0.08, 1.4, fill=GOLD)
    text(s, 0.85, yy + 0.05, 2.7, 0.75, n, size=34, color=WHITE, bold=True, anchor=MSO_ANCHOR.MIDDLE)
    t = rect(s, 0.9, yy + 0.85, 0.8, 0.38, fill=GOLD)
    text(s, 0, 0, 0, 0, who, size=13, color=CHAR, bold=True, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE, shape=t)
    text(s, 3.5, yy, 3.0, 1.4, l, size=13, color=WHITE, anchor=MSO_ANCHOR.MIDDLE)
# right
rect(s, 6.95, 2.15, 5.78, 2.35, fill=NAVY)
rect(s, 6.95, 2.15, 5.78, 0.07, fill=GOLD)
text(s, 7.1, 2.25, 5.5, 0.4, "JOHOR HALAL JOURNEY", size=16, color=GOLD, bold=True)
text(s, 7.1, 2.65, 2.2, 1.2, "10", size=84, color=WHITE, bold=True, anchor=MSO_ANCHOR.MIDDLE)
text(s, 7.1, 3.8, 2.4, 0.6, "daerah di Negeri Johor", size=15, color=WHITE)
for i in range(10):
    cx = 9.6 + (i % 5) * 0.6
    cy = 2.95 + (i // 5) * 0.72
    o = rect(s, cx, cy, 0.5, 0.5, fill=RED, line=WHITE, lw=1.5, shape=MSO_SHAPE.OVAL)
    text(s, 0, 0, 0, 0, str(i + 1), size=14, color=WHITE, bold=True, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE, shape=o)
text(s, 6.95, 4.65, 3.1, 2.3, [[("•  Mendekati usahawan secara langsung", {})],
                               [("•  Memperluas akses bimbingan dan sokongan industri halal", {})],
                               [("•  Memperkukuh pemasaran; peluang pasaran domestik dan antarabangsa", {})]],
     size=14, color=CHAR, spacing=6)
placeholder(s, 10.15, 4.65, 2.58, 2.3, "GAMBAR PROGRAM / JOHOR HALAL JOURNEY")

# ---------------------------------------------------------------- SLIDE 7
s = base("MEMPERKUKUH EKOSISTEM HALAL JOHOR MENUJU SASARAN 2030", "KOMITMEN KERAJAAN NEGERI JOHOR", 7,
         "33 agensi menganggotai Pasukan Petugas (Task Force) PKHNJ 2030; JAINJ sebagai urus setia. Ayat penutup dipetik daripada dokumen jawapan.")
text(s, 0.6, 2.05, 3.7, 1.9, "33", size=120, color=RED, bold=True, anchor=MSO_ANCHOR.MIDDLE)
text(s, 4.2, 2.3, 4.0, 0.9, "agensi menganggotai Pasukan Petugas (Task Force) PKHNJ 2030", size=17, color=CHAR, bold=True, anchor=MSO_ANCHOR.MIDDLE)
rect(s, 4.2, 3.3, 4.0, 0.55, fill=NAVY)
text(s, 4.2, 3.3, 4.0, 0.55, "JAINJ sebagai urus setia", size=16, color=WHITE, bold=True, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE,
     shape=s.shapes[-1])
pill = ["Kerjasama strategik antara agensi", "Pembangunan keupayaan usahawan", "Pemudahcaraan industri",
        "Ekosistem halal menyeluruh, mampan dan berdaya saing"]
for i, t in enumerate(pill):
    cx = 0.6 + (i % 2) * 3.9
    cy = 4.1 + (i // 2) * 0.68
    rect(s, cx, cy, 3.8, 0.6, fill=GREY)
    rect(s, cx, cy, 0.08, 0.6, fill=GOLD)
    text(s, cx + 0.15, cy, 3.6, 0.6, t, size=13, color=NAVY, bold=True, anchor=MSO_ANCHOR.MIDDLE)
placeholder(s, 8.6, 2.2, 4.13, 3.55, "GAMBAR YB EXCO BERSAMA AGENSI / AKTIVITI BERKAITAN")
rect(s, 0.6, 5.55, 7.8, 1.45, fill=DEEP)
rect(s, 0.6, 5.55, 0.1, 1.45, fill=RED)
text(s, 0.85, 5.55, 7.45, 1.45,
     "“Kerajaan Negeri akan terus memperkukuh pelaksanaan PKHNJ 2030 bagi memastikan ekosistem halal Johor berkembang secara lebih menyeluruh, mampan dan berdaya saing, seterusnya mencapai sasaran yang ditetapkan menjelang tahun 2030.”",
     size=14, color=WHITE, italic=True, anchor=MSO_ANCHOR.MIDDLE)
rect(s, 8.6, 5.9, 4.13, 1.1, fill=NAVY)
rect(s, 8.6, 5.9, 4.13, 0.07, fill=GOLD)
text(s, 8.6, 5.97, 4.13, 1.03, [[("MAJU JOHOR", {"size": 24, "bold": True, "color": WHITE})],
                                [("PKHNJ 2030  |  Belanjawan Johor 2027", {"size": 13, "color": GOLD})]],
     align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)

out = os.path.join(HERE, "Slaid_A93_PKHNJ2030.pptx")
prs.save(out)
print(out)
