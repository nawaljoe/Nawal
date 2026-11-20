"""Bina 4 slide infografik Belanjawan Johor 2027 (1080 x 1080, boleh diedit).

    python3 build.py           -> output/Infografik_Belanjawan_Johor_2027.pptx
    ./render.sh                -> output/slide-1.png ... slide-4.png (2160 px)
"""
import os

from lib import *  # noqa

OUT = os.path.join(HERE, "output")
os.makedirs(OUT, exist_ok=True)

M = 44          # margin sisi
CW = 1080 - 2 * M


# ================================================================ rangka
def frame(slide, no, kicker, title_lines, title_size=40):
    # latar putih + jalur pepenjuru lembut (ala templat)
    rect(slide, 0, 0, 1080, 1080, fill=WHITE, name="Latar")
    poly(slide, [(640, 0), (1080, 0), (1080, 250), (900, 0)], SOFT, name="Hiasan latar 1")
    poly(slide, [(760, 0), (1080, 0), (1080, 120)], "EEF1F7", name="Hiasan latar 2")
    poly(slide, [(0, 880), (0, 1004), (200, 1004)], SOFT, name="Hiasan latar 3")

    # logo
    picture(slide, os.path.join(ASSETS, "logo_johor.png"), M, 30, h=78, name="Logo Johor")
    picture(slide, os.path.join(ASSETS, "logo_majujohor.png"), M + 108, 30, h=78, name="Logo Maju Johor")

    # kicker kanan atas
    rect(slide, 1080 - M - 300, 50, 300, 38, fill=NAVY, radius=19, name="Label inisiatif")
    text(slide, 1080 - M - 300, 50, 300, 38,
         [[R(kicker, 14 if len(kicker) <= 28 else 12.5, "eb", GOLD_L, 1.2 if len(kicker) <= 28 else 0.6)]], align="c", anchor="m")
    text(slide, 1080 - M - 300, 92, 300, 18,
         [[R("BELANJAWAN JOHOR 2027  ·  ", 11.5, "sb", MUTED, 1), R(f"{no:02d}/04", 11.5, "eb", NAVY, 1)]],
         align="c")

    # tajuk dengan bar emas (pola templat)
    th = len(title_lines) * title_size * 1.05
    rect(slide, M, 128, 9, th - 4, fill=GOLD, name="Bar tajuk")
    paras = []
    for ln in title_lines:
        runs = [R(t, title_size, "k", c) for t, c in ln]
        paras.append({"runs": runs, "lh": 0.92})
    text(slide, M + 24, 124, CW - 24, th + 8, paras, name="Tajuk")

    # footer dua warna
    rect(slide, 0, 1000, 1080, 4, fill=GOLD, name="Garis footer")
    rect(slide, 0, 1004, 690, 76, fill=NAVY, name="Footer kiri")
    rect(slide, 690, 1004, 390, 76, fill=GOLD, name="Footer kanan")
    poly(slide, [(690, 1004), (730, 1004), (690, 1080)], NAVY, name="Footer sudut")
    text(slide, M, 1004, 640, 76, [
        [R("JAWAPAN SOALAN LISAN  ·  BELANJAWAN JOHOR 2027", 15, "eb", WHITE, 0.6)],
        [R("SEKTOR PENDIDIKAN ISLAM  ·  DEWAN NEGERI JOHOR", 12.5, "m", "C9D3E8", 0.6)],
    ], anchor="m", lh=1.15, name="Teks footer")
    picture(slide, os.path.join(ASSETS, "social_navy.png"), 760, 1018, h=30, name="Ikon media sosial")
    text(slide, 750, 1050, 300, 22, [[R("Mohd Fared Mohd Khalid", 13, "sb", NAVY)]], name="Nama media sosial")


def section_label(slide, x, y, label, w=None, color=NAVY, dot=GOLD, size=15):
    rect(slide, x, y + 4, 6, size + 2, fill=dot)
    text(slide, x + 16, y, w or 700, size + 10, [[R(label, size, "eb", color, 1.0)]])


def card(slide, x, y, w, h, fill=WHITE, line=LINE, radius=16, shadow=True):
    return rect(slide, x, y, w, h, fill=fill, line=line if fill == WHITE else None, lw=1,
                radius=radius, shadow=shadow)


# ================================================================ SLIDE 1
def slide1(prs):
    s = blank(prs)
    frame(s, 1, "INISIATIF 1 · INFRASTRUKTUR", [
        [("RM191 JUTA! ", GOLD), ("PEMBANGUNAN", NAVY)],
        [("SEKOLAH AGAMA JOHOR DIPERKASA", NAVY)],
    ])

    # --- A. hero RM191 juta
    y0 = 236
    rect(s, M, y0, 640, 300, fill=NAVY, radius=22, shadow=True, name="Kad RM191 juta")
    poly(s, [(M + 430, y0), (M + 618, y0), (M + 640, y0 + 22), (M + 640, y0 + 180)], NAVY2)
    text(s, M + 30, y0 + 24, 580, 22,
         [[R("BELANJAWAN JOHOR 2027  ·  PROJEK PEMBINAAN FASA 7", 13.5, "eb", GOLD_L, 1.2)]])
    text(s, M + 26, y0 + 44, 600, 130, [[R("RM191", 118, "k", WHITE, -2), R(" JUTA", 50, "k", GOLD, 0)]],
         lh=0.9)
    text(s, M + 30, y0 + 170, 580, 24,
         [[R("Peruntukan Kerajaan Negeri  ·  ", 16, "m", "C9D3E8"), R("10 projek", 16, "eb", WHITE)]])
    # piktogram 10 projek
    py = y0 + 210
    for i in range(10):
        gold = i == 9
        bx = M + 30 + i * 58
        rect(s, bx, py, 50, 50, fill=GOLD if gold else NAVY2, radius=10,
             line=None)
        icon(s, "building-2" if gold else "school", bx + 11, py + 11, 28, NAVY if gold else WHITE, 1.9)
    text(s, M + 30, py + 56, 520, 22, [[R("9", 15, "k", WHITE), R("  sekolah agama baharu", 14, "m", "C9D3E8")]])
    text(s, M + 400, py + 56, 220, 22,
         [[R("1", 15, "k", GOLD_L), R("  bangunan tambahan", 14, "m", "C9D3E8")]], align="r")

    # --- foto YB (pola templat: foto + kapsyen nama)
    fx, fw = M + 660, CW - 660
    picture_cover(s, os.path.join(ASSETS, "yb_baju.jpg"), fx, y0, fw, 206, focus=(0.5, 0.18), name="Foto YB")
    rect(s, fx, y0 + 206, fw, 94, fill=GOLD_P, name="Kapsyen foto")
    rect(s, fx, y0 + 206, fw, 4, fill=GOLD)
    text(s, fx + 12, y0 + 218, fw - 24, 80, [
        {"runs": [R("YB TUAN HAJI MOHD FARED BIN HAJI MOHD KHALID", 12.5, "eb", NAVY)], "lh": 1.0, "after": 4},
        {"runs": [R("Pengerusi Jawatankuasa Hal Ehwal Agama Islam Negeri Johor", 11, "m", MUTED)], "lh": 1.0},
    ], align="c")

    # --- B. 33 buah sekolah
    y1 = 560
    section_label(s, M, y1, "PERANCANGAN PEMBANGUNAN SEKOLAH AGAMA")
    text(s, M, y1 + 30, 230, 150, [[R("33", 150, "k", NAVY, -4)]], lh=0.85)
    text(s, M + 2, y1 + 168, 230, 70, [
        {"runs": [R("BUAH SAKJ", 20, "k", GOLD_D, 1)], "after": 2},
        {"runs": [R("dikenal pasti JAINJ memerlukan pembangunan infrastruktur", 13, "m", MUTED)], "lh": 1.05},
    ])
    # bar bertindan 26/11/6
    bx, bw = M + 250, CW - 250
    parts = [(17, NAVY, "Sekolah baharu"), (11, GOLD, "Bangunan tambahan"), (5, ROYAL, "Bangunan gunasama")]
    cx = bx
    for n, col, _ in parts:
        w = bw * n / 33
        rect(s, cx, y1 + 44, w - 3, 26, fill=col)
        cx += w
    text(s, bx, y1 + 76, bw, 18, [[R("0", 11, "sb", SLATE)]])
    text(s, bx, y1 + 76, bw, 18, [[R("33 sekolah", 11, "sb", SLATE)]], align="r")
    # tiga kotak statistik
    gw = (bw - 2 * 14) / 3
    for i, (n, col, lab) in enumerate(parts):
        x = bx + i * (gw + 14)
        card(s, x, y1 + 104, gw, 128)
        rect(s, x, y1 + 104, gw, 6, fill=col)
        text(s, x + 18, y1 + 116, gw - 30, 66, [[R(str(n), 58, "k", col if col != GOLD else GOLD_D, -1)]])
        text(s, x + 18, y1 + 182, gw - 30, 44, [[R(lab, 15, "eb", INK)]], lh=1.0)
        icon(s, ["school", "building-2", "handshake"][i], x + gw - 52, y1 + 124, 34,
             col if col != GOLD else GOLD_D, 1.8)
    text(s, bx, y1 + 238, bw, 20, [[R("Gunasama: ", 12.5, "eb", ROYAL),
                                     R("cadangan penggunaan premis antara Sekolah Kebangsaan & Sekolah Agama", 12.5, "m", MUTED)]])

    # --- C. kemudahan pembelajaran
    y2 = 836
    section_label(s, M, y2, "KEMUDAHAN PEMBELAJARAN DITAMBAH BAIK")
    items = [
        ("tv", "575 unit", "Smart TV", "Sumbangan PIJ · bernilai RM1,552,500"),
        ("monitor-smartphone", "RM3.1 juta", "JPID Al-Bayen", "Peruntukan pembelian"),
        ("wifi", "RM2.08 juta", "Internet", "Kemudahan internet di semua SAKJ"),
    ]
    iw = (CW - 2 * 14) / 3
    for i, (ic, big, lab, sub) in enumerate(items):
        x = M + i * (iw + 14)
        card(s, x, y2 + 32, iw, 122, fill=SOFT, shadow=False)
        icon_badge(s, ic, x + 16, y2 + 50, 50, NAVY, GOLD_L, 2)
        text(s, x + 78, y2 + 46, iw - 90, 34, [[R(big, 27, "k", NAVY, -0.5)]])
        text(s, x + 78, y2 + 80, iw - 90, 22, [[R(lab, 15, "eb", GOLD_D)]])
        text(s, x + 16, y2 + 112, iw - 28, 40, [[R(sub, 12.5, "m", MUTED)]], lh=1.0)
    return s


# ================================================================ SLIDE 2
def donut(slide, x, y, d, values, colors, hole=60):
    from pptx.chart.data import CategoryChartData
    from pptx.enum.chart import XL_CHART_TYPE
    cd = CategoryChartData()
    cd.categories = ["Tahap 1", "Tahap 2", "Tahap 3"]
    cd.add_series("Bilangan sekolah", values)
    gf = slide.shapes.add_chart(XL_CHART_TYPE.DOUGHNUT, px(x), px(y), px(d), px(d), cd)
    gf.name = "Carta 333 sekolah"
    ch = gf.chart
    ch.has_legend = False
    ch.has_title = False
    ser = ch.plots[0].series[0]
    for i, c in enumerate(colors):
        p = ser.points[i]
        p.format.fill.solid()
        p.format.fill.fore_color.rgb = rgb(c)
        p.format.line.color.rgb = rgb(WHITE)
        p.format.line.width = px(3)
    el = ch._chartSpace.find(".//" + qn("c:holeSize"))
    if el is not None:
        el.set("val", str(hole))
    fa = ch._chartSpace.find(".//" + qn("c:firstSliceAng"))
    if fa is not None:
        fa.set("val", "0")
    return gf


def slide2(prs):
    s = blank(prs)
    frame(s, 2, "INISIATIF 2 · BAIK PULIH", [
        [("333 SEKOLAH AGAMA ", GOLD), ("DIBERI PERHATIAN,", NAVY)],
        [("BAIK PULIH SECARA BERFASA", NAVY)],
    ], title_size=37)

    # --- A. tahap kerosakan
    y0 = 236
    section_label(s, M, y0, "TAHAP KEROSAKAN SEKOLAH AGAMA")
    cols = [RED, GOLD, SLATE]
    d = 300
    donut(s, M + 4, y0 + 34, d, (237, 88, 8), cols)
    text(s, M + 4, y0 + 34 + d / 2 - 52, d, 70, [[R("333", 66, "k", NAVY, -2)]], align="c", lh=0.9)
    text(s, M + 4, y0 + 34 + d / 2 + 14, d, 40, [
        [R("SEKOLAH", 15, "eb", GOLD_D, 2)],
        [R("perlu baik pulih", 12, "m", MUTED)],
    ], align="c", lh=1.05)

    rows = [
        (237, RED, "TAHAP 1", "KRITIKAL",
         "Kerosakan serius yang boleh menjejaskan keselamatan warga sekolah & kelancaran PdP"),
        (88, GOLD, "TAHAP 2", "SEPARA KRITIKAL",
         "Perlu pembaikan bagi mengelakkan keadaan menjadi lebih serius"),
        (8, SLATE, "TAHAP 3", "TIDAK KRITIKAL",
         "Kerosakan kecil yang boleh dibaiki secara berperingkat"),
    ]
    rx, rw = M + 330, CW - 330
    for i, (n, c, t, lab, desc) in enumerate(rows):
        y = y0 + 36 + i * 102
        card(s, rx, y, rw, 92)
        rect(s, rx, y, 8, 92, fill=c)
        numc = GOLD_D if c == GOLD else c
        text(s, rx + 22, y, 130, 92, [[R(str(n), 54, "k", numc, -1)]], anchor="m")
        rect(s, rx + 150, y + 16, 92, 24, fill=c, radius=12)
        text(s, rx + 150, y + 16, 92, 24, [[R(t, 11.5, "eb", WHITE, 1)]], align="c", anchor="m")
        text(s, rx + 252, y + 16, rw - 270, 24, [[R(lab, 15, "k", INK, 0.5)]], anchor="m")
        text(s, rx + 150, y + 46, rw - 170, 44, [[R(desc, 13, "m", MUTED)]], lh=1.0)
        text(s, rx + rw - 120, y + 16, 104, 24, [[R("buah sekolah", 11, "sb", SLATE)]], align="r", anchor="m")

    # --- B. pencapaian 2022–2026
    y1 = 574
    rect(s, M, y1, CW, 172, fill=NAVY, radius=22, shadow=True, name="Kad pencapaian")
    poly(s, [(M + 520, y1), (M + 700, y1), (M + 560, y1 + 172), (M + 380, y1 + 172)], NAVY2)
    text(s, M + 30, y1 + 20, 600, 22, [[R("PENCAPAIAN BAIK PULIH  ·  2022–2026", 13.5, "eb", GOLD_L, 1.2)]])
    text(s, M + 28, y1 + 42, 220, 84, [[R("717", 82, "k", WHITE, -2)]], lh=0.9)
    text(s, M + 30, y1 + 126, 220, 24, [[R("PROJEK BAIK PULIH", 14, "eb", "C9D3E8", 0.8)]])
    vline(s, M + 238, y1 + 52, 92, "2C4682", 2)
    text(s, M + 262, y1 + 46, 500, 84, [[R("RM79.076", 66, "k", GOLD, -2), R(" JUTA", 28, "k", GOLD_L)]], lh=0.9)
    text(s, M + 264, y1 + 126, 400, 24, [[R("JUMLAH PERUNTUKAN", 14, "eb", "C9D3E8", 0.8)]])
    bx = M + CW - 252
    rect(s, bx, y1 + 22, 228, 128, fill=GOLD_P, radius=14)
    text(s, bx + 18, y1 + 36, 200, 20, [[R("PERUNTUKAN 2026", 12.5, "eb", GOLD_D, 1)]])
    text(s, bx + 18, y1 + 56, 200, 44, [[R("RM15.66", 34, "k", NAVY, -0.5), R(" juta", 16, "eb", NAVY)]])
    text(s, bx + 18, y1 + 104, 200, 40, [[R("90", 16, "k", NAVY), R(" projek baik pulih", 13, "m", MUTED)],
                                          [R("sekolah agama", 13, "m", MUTED)]], lh=1.0)

    # --- C. tiga fokus
    y2 = 764
    section_label(s, M, y2, "3 FOKUS UTAMA PENYELENGGARAAN")
    foc = [
        ("hammer", "Penyelenggaraan bangunan", "Pembaikan struktur, bumbung & pendawaian elektrik"),
        ("house-plus", "Sekolah baharu & penambahan blok", "Menangani peningkatan enrolmen murid"),
        ("lightbulb", "Kemudahan pembelajaran kondusif", "Bilik darjah dengan kipas, pencahayaan & perabot mencukupi"),
    ]
    fw = (CW - 2 * 14) / 3
    for i, (ic, t, dsc) in enumerate(foc):
        x = M + i * (fw + 14)
        card(s, x, y2 + 32, fw, 132)
        icon_badge(s, ic, x + 18, y2 + 48, 46, GOLD_P, GOLD_D, 2)
        text(s, x + fw - 70, y2 + 44, 54, 40, [[R(f"0{i+1}", 30, "k", LINE)]], align="r")
        text(s, x + 18, y2 + 102, fw - 34, 22, [[R(t, 14.5, "eb", NAVY)]], lh=1.0)
        text(s, x + 18, y2 + 124, fw - 34, 38, [[R(dsc, 12.5, "m", MUTED)]], lh=1.0)

    # --- D. sistem pengurusan
    y3 = 940
    rect(s, M, y3, CW, 50, fill=GOLD_P, radius=12, name="Jalur sistem pengurusan")
    rect(s, M, y3, 8, 50, fill=GOLD)
    icon(s, "shield-check", M + 22, y3 + 11, 28, GOLD_D, 2)
    text(s, M + 62, y3, CW - 80, 50, [[
        R("SISTEM PENGURUSAN BAIK PULIH BERSEPADU  ", 13, "k", NAVY, 0.5),
        R("Peruntukan disalurkan secara telus · elak ketirisan · pemantauan diperkukuh", 12.5, "m", INK)]],
        anchor="m")
    return s


# ================================================================ SLIDE 3
def slide3(prs):
    s = blank(prs)
    frame(s, 3, "INISIATIF 3 · KEBAJIKAN GURU", [
        [("KEBAJIKAN GURU TERUS DIBELA,", NAVY)],
        [("ELAUN & PELUANG KERJAYA ", NAVY), ("DIPERTINGKATKAN", GOLD)],
    ], title_size=34)

    LW = 430
    RX = M + LW + 16
    RW = 1080 - M - RX

    # ---- L1 KAFA hero
    y = 218
    rect(s, M, y, LW, 270, fill=NAVY, radius=20, shadow=True, name="Kad elaun KAFA")
    poly(s, [(M + 250, y), (M + 410, y), (M + LW, y + 20), (M + LW, y + 150)], NAVY2)
    text(s, M + 24, y + 20, LW - 48, 20, [[R("PENINGKATAN ELAUN BULANAN GURU KAFA", 12.5, "eb", GOLD_L, 1)]])
    text(s, M + 20, y + 40, LW - 40, 96, [[R("+RM150", 90, "k", GOLD, -2)]], lh=0.9)
    text(s, M + 24, y + 134, LW - 48, 22, [[R("sebulan bagi setiap guru", 15, "m", "C9D3E8")]])
    bw = 160
    rect(s, M + 24, y + 166, bw, 54, fill=NAVY2, radius=10)
    text(s, M + 24, y + 170, bw, 48, [[R("SEBELUM", 10.5, "eb", "9FB0D3", 1)], [R("RM1,612", 22, "k", WHITE)]],
         align="c", lh=1.0)
    icon(s, "arrow-right", M + 24 + bw + 12, y + 180, 28, GOLD, 2.4)
    rect(s, M + LW - 24 - bw, y + 166, bw, 54, fill=GOLD, radius=10)
    text(s, M + LW - 24 - bw, y + 170, bw, 48, [[R("SELEPAS", 10.5, "eb", NAVY, 1)], [R("RM1,762", 22, "k", NAVY)]],
         align="c", lh=1.0)
    icon(s, "users", M + 24, y + 234, 20, GOLD_L, 2)
    text(s, M + 50, y + 232, 190, 24, [[R("2,150", 15, "k", WHITE), R(" guru KAFA", 13, "m", "C9D3E8")]])
    icon(s, "banknote", M + 206, y + 234, 20, GOLD_L, 2)
    text(s, M + 232, y + 232, 190, 24, [[R("RM5.92 juta", 15, "k", WHITE), R(" peruntukan", 12.5, "m", "C9D3E8")]])

    # ---- L2 perjawatan & TBBK
    y = 500
    card(s, M, y, LW, 212)
    text(s, M + 20, y + 16, LW - 40, 20, [[R("PENAMBAHAN PERJAWATAN GURU", 12.5, "eb", GOLD_D, 1)]])
    text(s, M + 20, y + 36, 150, 50, [[R("631", 42, "k", NAVY, -1)]])
    text(s, M + 20, y + 84, 190, 20, [[R("jawatan diwujudkan · 2024", 12, "m", MUTED)]])
    text(s, M + 220, y + 36, 150, 50, [[R("+322", 42, "k", NAVY, -1)]])
    text(s, M + 220, y + 84, 200, 20, [[R("kekosongan tambahan · 2025", 12, "m", MUTED)]])
    hline(s, M + 20, y + 112, LW - 40)
    text(s, M + 20, y + 122, LW - 40, 20, [[R("KENAIKAN PANGKAT TBBK  ", 12.5, "eb", GOLD_D, 1),
                                            R("DG29 → DG32", 12.5, "k", NAVY)]])
    text(s, M + 20, y + 142, 200, 30, [[R("10", 24, "k", SLATE), R(" thn  →  ", 14, "sb", SLATE),
                                        R("8", 24, "k", NAVY), R(" thn", 14, "eb", NAVY)]])
    text(s, M + 210, y + 140, LW - 230, 50, [
        [R("42", 14, "k", NAVY), R(" guru bukan siswazah", 12, "m", MUTED)],
        [R("612", 14, "k", NAVY), R(" guru siswazah", 12, "m", MUTED)],
    ], lh=1.1)
    text(s, M + 20, y + 184, LW - 40, 20, [[R("Time-Based Berasaskan Kecemerlangan (TBBK)", 11, "m", SLATE)]])

    # ---- L3 profesionalisme
    y = 724
    card(s, M, y, LW, 264)
    text(s, M + 20, y + 16, LW - 40, 20, [[R("PEMBANGUNAN PROFESIONALISME GURU", 12.5, "eb", GOLD_D, 1)]])
    text(s, M + 20, y + 36, LW - 40, 36, [[R("≈RM6 juta", 28, "k", NAVY, -0.5), R("  setahun", 14, "sb", MUTED)]])
    pro = [
        ("22 siri", "latihan & kursus · 770 guru"),
        ("5,200 guru", "Latihan Dalam Perkhidmatan (LDP)"),
        ("140 Guru Besar", "latihan kepimpinan · 2025"),
        ("170 GB & Pengetua", "menerima latihan · 2026"),
    ]
    for i, (a, b) in enumerate(pro):
        yy = y + 80 + i * 36
        ellipse(s, M + 22, yy + 7, 9, 9, GOLD)
        text(s, M + 40, yy, LW - 60, 24, [[R(a, 14, "k", NAVY), R("  " + b, 12.5, "m", INK)]])
        if i < 3:
            hline(s, M + 40, yy + 28, LW - 60, SOFT)
    tags = ["Pedagogi moden", "Kemahiran digital", "AI dalam PdP"]
    tx = M + 20
    for t in tags:
        w = 18 + len(t) * 7.6
        rect(s, tx, y + 230, w, 28, fill=NAVY, radius=14)
        text(s, tx, y + 230, w, 28, [[R(t, 11.5, "eb", WHITE)]], align="c", anchor="m")
        tx += w + 8

    # ---- R1 jadual elaun
    y = 218
    card(s, RX, y, RW, 410)
    text(s, RX + 20, y + 16, RW - 40, 20, [[R("PELBAGAI ELAUN GURU", 12.5, "eb", GOLD_D, 1)]])
    c1, c2, c3 = RX + 20, RX + 264, RX + RW - 20 - 96
    hy = y + 42
    rect(s, RX + 12, hy, RW - 24, 24, fill=SOFT, radius=6)
    for xx, ww, t, al in ((c1 + 6, 230, "JENIS ELAUN", "l"), (c2, 150, "KADAR", "l"), (c3, 96, "PENERIMA", "r")):
        text(s, xx, hy, ww, 24, [[R(t, 10.5, "eb", MUTED, 1)]], anchor="m", align=al)
    rows = [
        ("Guru Darjah Khas", "RM4.725 juta", "1,123 guru", None),
        ("Guru Besar", "RM150 / bulan", "583", "Gred A: 50  ·  Gred B: 88  ·  Gred C: 445"),
        ("Tanggungjawab Duduk Waran Hakiki", "RM150 / bulan", "208",
         "Guru Besar Gred A: 50  ·  Guru Penolong Kanan Gred A: 50  ·  Guru Besar Gred B: 88  ·  Penolong Pegawai PPID: 20"),
        ("Pengetua SMA", "RM300 / bulan", "3", None),
        ("Guru Kanan Mata Pelajaran", "RM120 / bulan", "9", None),
        ("Ketua Bidang", "RM120 / bulan", "15", None),
        ("Guru kawasan pedalaman", "RM500 – RM1,500", "ikut kategori",
         "P1: RM500  ·  P2: RM1,000  ·  P3: RM1,500\nJumlah peruntukan RM13,500 sebulan / RM162,000 setahun"),
    ]
    yy = hy + 30
    for i, (nm, kd, pn, sub) in enumerate(rows):
        two = len(nm) > 28
        h = 26 + (16 if two else 0)
        text(s, c1 + 6, yy, 236, h, [[R(nm, 13.5, "sb", INK)]], lh=1.0, anchor="t")
        text(s, c2, yy, 160, 22, [[R(kd, 13.5, "k", NAVY)]])
        text(s, c3, yy, 96, 22, [[R(pn, 13.5, "k", GOLD_D)]], align="r")
        if sub:
            sh = 17 if len(sub) < 60 else 31
            text(s, c1 + 6, yy + h - 4, RW - 52, sh, [[R(sub, 11, "m", MUTED)]], lh=1.0)
            h += sh
        yy += h + 3
        if i < len(rows) - 1:
            hline(s, c1, yy - 2, RW - 40, SOFT)
            yy += 4

    # ---- R2 bonus & bantuan khas KAFA
    y = 638
    card(s, RX, y, RW, 222)
    text(s, RX + 20, y + 14, RW - 40, 20, [[R("BONUS & BANTUAN KHAS GURU KAFA", 12.5, "eb", GOLD_D, 1)]])
    rect(s, RX + 20, y + 40, 12, 12, fill=GOLD, radius=3)
    text(s, RX + 38, y + 37, 200, 18, [[R("Bonus Kerajaan Negeri", 11, "sb", INK)]])
    rect(s, RX + 210, y + 40, 12, 12, fill=NAVY, radius=3)
    text(s, RX + 228, y + 37, 300, 18, [[R("Bantuan Khas Kewangan / Hari Raya", 11, "sb", INK)]])
    data = [
        ("2022", 0.833, "RM833,000", "1,976", 1.8, "RM1.8 juta", "1,946"),
        ("2023", 1.8, "RM1.8 juta", "1,985", 0.597, "RM597,000", "1,991"),
        ("2024", 3.8, "RM3.8 juta", "2,006", 2.54, "RM2.54 juta", "1,700"),
        ("2025", 7.52, "RM7.52 juta", "2,064", 1.977, "RM1.977 juta", "1,997"),
        ("2026", None, "—", None, 1.975, "RM1.975 juta", "1,990"),
    ]
    gw = (RW - 30) / 5
    base = y + 128
    maxv, bh = 7.52, 66
    for i, (yr, b, bl, bp, k, kl, kp) in enumerate(data):
        gx = RX + 15 + i * gw
        cx = gx + gw / 2
        if b:
            h = max(3, bh * b / maxv)
            rect(s, cx - 25, base - h, 22, h, fill=GOLD)
        h = max(3, bh * k / maxv)
        rect(s, cx + 3, base - h, 22, h, fill=NAVY)
        text(s, gx, base + 4, gw, 18, [[R(yr, 13, "k", INK)]], align="c")
        text(s, gx, base + 24, gw, 34, [[R(bl, 11, "k", GOLD_D)],
                                        [R(f"{bp} org" if bp else "", 10, "m", MUTED)]], align="c", lh=1.0)
        text(s, gx, base + 58, gw, 34, [[R(kl, 11, "k", NAVY)], [R(f"{kp} org", 10, "m", MUTED)]],
             align="c", lh=1.0)
    hline(s, RX + 15, base, RW - 30, LINE, 1.5)

    # ---- R3 Bantuan Kasih Johor
    y = 870
    rect(s, RX, y, RW, 118, fill=GOLD_P, radius=16, name="Kad Bantuan Kasih Johor")
    rect(s, RX, y, 8, 118, fill=GOLD)
    icon_badge(s, "hand-heart", RX + 22, y + 16, 50, GOLD, NAVY, 2)
    text(s, RX + 86, y + 14, RW - 100, 20, [[R("BANTUAN KASIH JOHOR  ·  2026", 12.5, "eb", GOLD_D, 1)]])
    text(s, RX + 86, y + 32, 220, 44, [[R("RM31,500", 34, "k", NAVY, -0.5)]])
    text(s, RX + 300, y + 38, RW - 316, 44, [[R("RM500", 18, "k", NAVY), R(" setiap penerima", 12, "m", MUTED)]])
    text(s, RX + 22, y + 82, RW - 40, 30, [
        [R("63", 15, "k", NAVY), R(" pembantu guru Tadika Agama Johor (TAJ) menerima manfaat", 12.5, "m", INK)]],
        lh=1.0)
    return s


# ================================================================ SLIDE 4
def slide4(prs):
    s = blank(prs)
    frame(s, 4, "INISIATIF 4 & 5 · PdP & MURID", [
        [("5 INISIATIF UTAMA ", GOLD), ("MEMPERKUKUH", NAVY)],
        [("PENDIDIKAN ISLAM JOHOR", NAVY)],
    ])

    # --- lima inisiatif
    y = 232
    ini = [
        ("school", "Pembangunan & Penambahbaikan Infrastruktur Sekolah",
         "Sekolah baharu, bangunan tambahan, penyelenggaraan & kemudahan digital"),
        ("wrench", "Peruntukan Pembangunan & Penyelenggaraan Sekolah",
         "Baik pulih, penyelenggaraan berjadual & pemantauan lebih sistematik"),
        ("award", "Pemerkasaan Kebajikan & Profesionalisme Guru",
         "Jawatan, kenaikan pangkat, elaun, bonus, bantuan & latihan"),
        ("book-open-text", "Peningkatan Kualiti Pengajaran & Pembelajaran (PdP)",
         "Pedagogi, al-Quran & Jawi, BBM digital & pendidikan inklusif"),
        ("sprout", "Pembangunan Modal Insan Murid",
         "Sahsiah, kepimpinan, kesukarelawanan & potensi holistik"),
    ]
    g = 12
    w = (CW - 4 * g) / 5
    for i, (ic, t, dsc) in enumerate(ini):
        x = M + i * (w + g)
        hl = i >= 3
        if hl:
            rect(s, x, y, w, 196, fill=NAVY, radius=16, shadow=True)
        else:
            card(s, x, y, w, 196)
        text(s, x + 14, y + 12, 80, 36, [[R(f"0{i+1}", 30, "k", GOLD if hl else GOLD_D, -1)]])
        icon(s, ic, x + w - 44, y + 16, 30, GOLD_L if hl else NAVY, 1.9)
        text(s, x + 14, y + 54, w - 26, 66, [[R(t, 13, "eb", WHITE if hl else NAVY)]], lh=1.0)
        text(s, x + 14, y + 122, w - 24, 70, [[R(dsc, 11.5, "m", "C9D3E8" if hl else MUTED)]], lh=1.02)

    # --- statistik
    y = 442
    rect(s, M, y, CW, 104, fill=GOLD_P, radius=18, name="Jalur statistik")
    stats = [("202,431", "MURID"), ("5,034", "GURU"), ("583", "BUAH SAKJ")]
    sx = M + 24
    for i, (n, lab) in enumerate(stats):
        text(s, sx, y + 14, 210, 52, [[R(n, 40, "k", NAVY, -1)]])
        text(s, sx + 2, y + 66, 200, 22, [[R(lab, 13, "eb", GOLD_D, 1.5)]])
        sx += [228, 172, 150][i]
        vline(s, sx - 22, y + 22, 60, "E6D6A6", 2)
    rx = sx
    text(s, rx, y + 16, M + CW - rx - 20, 20, [[R("NISBAH PURATA GURU : MURID", 11.5, "eb", GOLD_D, 1)]])
    for j, (t, r) in enumerate((("Tahap 1", "1:21"), ("Tahap 2", "1:19"))):
        xx = rx + j * 150
        text(s, xx, y + 38, 150, 40, [[R(r, 32, "k", NAVY, -0.5)]])
        text(s, xx, y + 74, 150, 20, [[R(t, 12.5, "sb", MUTED)]])

    # --- kualiti PdP (kiri)
    y = 562
    LW = 524
    section_label(s, M, y, "KUALITI PENGAJARAN & PEMBELAJARAN (PdP)", size=14)
    pdp = [
        ("PAK-21", "Pembelajaran Abad Ke-21: kemahiran pedagogi guru melalui kursus & bimbingan Jurulatih Utama Negeri"),
        ("PIQJ", "Program Intensif al-Quran & Jawi: latihan berfokus 12 minggu pertama persekolahan, murid Darjah Satu"),
        ("Portal BBM Site SAKJ", "Rancangan pengajaran tahunan, kitab & modul mengikut darjah serta mata pelajaran"),
        ("Pratahfiz KAFA JAKIM", "Rintis 2026 di 5 SAKJ mewakili 5 daerah terpilih; pelaksanaan menyeluruh 2027"),
        ("Penyelarasan kurikulum", "KPA2027:TAJ & penyediaan KPA2028:SAKJ"),
        ("Pendidikan inklusif MBPK", "Peningkatan kompetensi guru melalui kerjasama UPSI & UTM"),
    ]
    yy = y + 32
    for i, (t, dsc) in enumerate(pdp):
        ellipse(s, M, yy + 2, 26, 26, NAVY)
        text(s, M, yy + 2, 26, 26, [[R(str(i + 1), 12.5, "k", GOLD_L)]], align="c", anchor="m")
        text(s, M + 38, yy, LW - 40, 56, [
            {"runs": [R(t, 13.5, "k", NAVY)], "after": 1},
            {"runs": [R(dsc, 11.5, "m", MUTED)]},
        ], lh=1.0)
        yy += 56

    # --- modal insan & kepadatan (kanan)
    RX = M + LW + 20
    RW = 1080 - M - RX
    y = 562
    rect(s, RX, y, RW, 150, fill=NAVY, radius=16, shadow=True, name="Kad modal insan")
    text(s, RX + 18, y + 14, RW - 36, 20, [[R("PEMBANGUNAN MODAL INSAN MURID", 12.5, "eb", GOLD_L, 1)]])
    mi = [
        "Pengukuhan pendidikan agama & penguasaan ilmu",
        "Pembentukan sahsiah, akhlak & jati diri",
        "Pengembangan potensi & kemahiran kepimpinan",
    ]
    for i, t in enumerate(mi):
        icon(s, "circle-check", RX + 18, y + 42 + i * 22, 15, GOLD, 2.2)
        text(s, RX + 40, y + 40 + i * 22, RW - 56, 20, [[R(t, 12, "sb", WHITE)]])
    rect(s, RX + 18, y + 108, RW - 36, 32, fill=NAVY2, radius=8)
    text(s, RX + 28, y + 108, RW - 52, 32, [[R("Nadi Al Ansor", 12, "k", GOLD_L),
                                            R("  pasukan kokurikulum & kesukarelawanan pelajar SAKJ", 10.5, "m", WHITE)]],
         anchor="m", lh=1.0)

    y = 724
    card(s, RX, y, RW, 212)
    text(s, RX + 18, y + 14, RW - 36, 20, [[R("TANGANI KEPADATAN MURID & KEKURANGAN GURU", 11.5, "eb", GOLD_D, 0.6)]])
    lk = [
        "Selaras semula sistem zon & pendaftaran murid ikut kapasiti sekolah",
        "Kongsi fasiliti & bilik darjah: konsep sekolah gunasama dengan SK",
        "Tambah & optimumkan penempatan guru, khususnya sekolah nisbah melebihi 1:35",
    ]
    yy = y + 38
    for i, t in enumerate(lk):
        text(s, RX + 18, yy, 20, 30, [[R(str(i + 1), 13, "k", GOLD_D)]])
        text(s, RX + 36, yy, RW - 52, 32, [[R(t, 11.5, "m", INK)]], lh=1.0)
        yy += 32 if len(t) > 65 else 22
    hline(s, RX + 18, y + 136, RW - 36, LINE)
    text(s, RX + 18, y + 142, RW - 36, 16, [[R("CONTOH SEKOLAH PADAT", 10, "eb", MUTED, 1)]])
    ex = [("SA Taman Kota Masai", "1:36", "1:32"), ("SA Taman Daya", "1:38", "1:31")]
    for i, (nm, t1, t2) in enumerate(ex):
        yy = y + 160 + i * 23
        text(s, RX + 18, yy, 200, 20, [[R(nm, 12, "eb", NAVY)]])
        text(s, RX + RW - 218, yy, 200, 20, [[R("T1 ", 10.5, "sb", MUTED), R(t1, 12.5, "k", RED),
                                              R("   T2 ", 10.5, "sb", MUTED), R(t2, 12.5, "k", NAVY)]], align="r")

    # --- penutup
    y = 946
    rect(s, M, y, CW, 46, fill=NAVY, radius=23, name="Penutup")
    icon(s, "sparkles", M + 18, y + 11, 24, GOLD, 2)
    text(s, M + 52, y, CW - 70, 46, [[
        R("Memperkukuh ekosistem pendidikan Islam demi melahirkan generasi Bangsa Johor yang ", 11.5, "sb", WHITE),
        R("berilmu, berakhlak & mempunyai sahsiah unggul.", 11.5, "k", GOLD_L)]], anchor="m", lh=1.0)
    return s


def build():
    prs = new_deck()
    slide1(prs)
    slide2(prs)
    slide3(prs)
    from build_slide_pdp import slide as slide4_pdp  # slide 4: 5 inisiatif + PdP sahaja
    slide4_pdp(prs)
    path = os.path.join(OUT, "Infografik_Belanjawan_Johor_2027.pptx")
    prs.save(path)
    print("saved", path)


if __name__ == "__main__":
    build()
