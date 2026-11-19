import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lib import *
from data import SCHOOLS

OUT = sys.argv[1] if len(sys.argv) > 1 else "deck.pptx"
prs = new_deck()
N = [0]


def nxt():
    N[0] += 1
    return N[0]


# ---------------------------------------------------------------- 1 COVER
def s_cover():
    s = blank(prs, NAVY)
    n = nxt()
    bgr = rect(s, 0, 0, W, H, fill=NAVY)
    gradient(bgr, [(0, NAVY), (55, NAVY2), (100, "2E47B0")], angle=0)
    # photo area on right (full bleed)
    photo(s, 7.75, 0, W - 7.75, H, dark=True,
          desc="Cadangan: Bangunan Dewan Negeri Johor,\nfoto sekolah agama atau masjid negeri\n(landskap, penuh sebelah kanan)")
    rect(s, 7.75, 0, 0.06, H, fill=RED)
    # decorative concentric rings (Islamic-geometric feel)
    for d in (5.6, 4.4, 3.2):
        circle(s, 0.2, 7.3, d, fill=None, line_c="3B54BE", lw=1)
    # red accent strip
    rect(s, 0, 0, 0.14, H, fill=RED)
    # logos on white pill
    rect(s, 0.75, 0.55, 3.3, 0.8, fill=WHITE, shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.5)
    logos(s, right=0.75 + 3.3 - 0.3, top=0.66, h=0.58)
    # label
    rect(s, 0.75, 1.75, 0.075, 0.34, fill=RED)
    text(s, 0.95, 1.72, 6, 0.4, "JAWAPAN SOALAN LISAN", size=13, bold=True, color="FF9AA1", spacing=3, anchor="m")
    text(s, 0.75, 2.25, 6.8, 1.6, ["Mesyuarat Kedua", [("(Belanjawan 2027)", {"color": "FFD4D7"})]],
         size=38, bold=True, color=WHITE, line_sp=0.95)
    text(s, 0.75, 3.85, 6.6, 0.8,
         "Bagi Penggal Persidangan Pertama\nDewan Negeri Johor Ke-16", size=17, color="DDE3FA", line_sp=1.05)
    line(s, 0.78, 4.85, 3.2, 4.85, color=RED, w=3)
    text(s, 0.75, 5.0, 6.6, 0.8, "Pengerusi Jawatankuasa\nHal Ehwal Agama Islam Negeri Johor",
         size=16, bold=True, color=WHITE, line_sp=1.05)
    chip(s, 0.78, 6.15, "20 NOVEMBER 2026 · JUMAAT", 2.75)
    chip(s, 3.65, 6.15, "SOALAN A201 & A133", 2.05, fill=RED, line_c=RED)


# ---------------------------------------------------------------- 2 SOALAN
def s_soalan():
    s = blank(prs)
    n = nxt()
    header(s, "Soalan Lisan", "A201 & A133")
    title(s, "Soalan daripada Ahli Yang Berhormat",
          "Giliran 3 · Kedua-dua soalan dijawab secara bersekali kerana skopnya saling berkaitan")
    qs = [
        ("A201", "Apakah inisiatif penambahbaikan yang sedang dilaksanakan oleh Jabatan Agama Islam Negeri Johor "
                 "bagi meningkatkan kualiti pendidikan Islam khususnya dari aspek kemudahan infrastruktur sekolah agama, "
                 "kebajikan guru, kualiti pengajaran dan pembelajaran serta pembangunan modal insan murid?",
         "YB Tuan Haji Mohd Yusla bin Ismail", "ADUN Senggarang", ["Infrastruktur", "Kebajikan guru", "PdP", "Modal insan"]),
        ("A133", "Berapakah jumlah sekolah agama di negeri Johor yang dikenal pasti memerlukan pembaikan, naik taraf "
                 "atau pembinaan bangunan baharu, dan apakah perancangan serta peruntukan kerajaan bagi memastikan aspek "
                 "keselamatan, keselesaan dan kapasiti bilik darjah dapat memenuhi keperluan murid yang semakin meningkat?",
         "YB Puan Fauziah binti Misri", "ADUN Penawar", ["Bilangan sekolah", "Perancangan", "Peruntukan"]),
    ]
    cw = (CW - 0.35) / 2
    for i, (no, q, who, dun, tags) in enumerate(qs):
        x = L + i * (cw + 0.35)
        y = 2.15
        h = 4.5
        rect(s, x, y, cw, h, fill=WHITE, line=RULE, lw=0.5)
        rect(s, x, y, 0.07, h, fill=RED)
        badge(s, x + 0.35, y + 0.3, no, w=0.75, h=0.36, size=12)
        text(s, x + 0.35, y + 0.85, cw - 0.65, 2.0, q, size=12.5, color=INK, line_sp=1.15)
        # tags
        tx = x + 0.35
        for t in tags:
            tw = 0.12 + 0.085 * len(t)
            rect(s, tx, y + 2.85, tw, 0.3, fill=LIGHT)
            text(s, tx, y + 2.85, tw, 0.3, t, size=8.5, bold=True, color=NAVY, align="c", anchor="m")
            tx += tw + 0.1
        line(s, x + 0.35, y + 3.38, x + cw - 0.3, y + 3.38, color=RULE, w=0.75)
        # portrait placeholder
        photo_d = 0.95
        px, py = x + 0.35, y + 3.48
        circle(s, px + photo_d / 2, py + photo_d / 2, photo_d, fill=LIGHT, line_c="A3AEDD", lw=1.25).line.dash_style = MSO_LINE.DASH
        text(s, px, py + 0.25, photo_d, 0.5, ["GAMBAR", "YB"], size=7.5, bold=True, color=NAVY, align="c", spacing=1)
        text(s, px + 1.15, py + 0.1, cw - 1.6, 0.25, "SOALAN DARIPADA", size=8.5, bold=True, color=RED, spacing=1.5)
        text(s, px + 1.15, py + 0.36, cw - 1.6, 0.3, who, size=13, bold=True, color=NAVY)
        text(s, px + 1.15, py + 0.66, cw - 1.6, 0.3, dun, size=11, color=GRAY)
    footer(s, n)


# ---------------------------------------------------------------- 3 MINDMAP 5 INISIATIF
def s_lima():
    s = blank(prs)
    n = nxt()
    header(s, "Jawapan", "Gambaran Keseluruhan")
    text(s, L, 1.15, CW, 0.5, "Kerajaan Negeri Johor komited memperkasa pendidikan Islam", size=24, bold=True, color=NAVY)
    text(s, L, 1.65, 10.5, 0.6,
         [["Melalui ", ("Jabatan Agama Islam Negeri Johor (JAINJ)", {"bold": True, "color": NAVY}),
           ", khususnya ", ("Bahagian Pendidikan Islam (BPI)", {"bold": True, "color": NAVY}),
           ", menerusi pelaksanaan pelbagai inisiatif penambahbaikan secara berterusan — dirangkum dalam ",
           ("5 inisiatif utama", {"bold": True, "color": RED}), "."]], size=12, color=GRAY, line_sp=1.15)
    cx, cy, d = W / 2, 4.1, 2.05
    nodes = [
        ("01", "Pembangunan & Penambahbaikan Infrastruktur Sekolah Agama", "43 sekolah dikenal pasti · Fasa 7 RM191 juta", L, 2.5, NAVY),
        ("02", "Peruntukan Pembangunan & Penyelenggaraan Sekolah Agama", "333 sekolah perlu baik pulih · RM79.076 juta (2022–2026)", L, 4.3, RED),
        ("03", "Pemerkasaan Kebajikan & Profesionalisme Guru", "≈ RM6 juta setahun · elaun & laluan kerjaya", R - 3.85, 2.5, NAVY),
        ("04", "Peningkatan Kualiti Pengajaran & Pembelajaran (PdP)", "PAK-21 · PIQJ · Pratahfiz · KPA · MBPK", R - 3.85, 4.3, RED),
        ("05", "Pembangunan Modal Insan Murid", "Holistik · sahsiah · Nadi Al Ansor", W / 2 - 1.925, 5.55, NAVY),
    ]
    nw, nh = 3.85, 1.15
    # connectors first
    for no, t, sub, x, y, col in nodes:
        if no == "05":
            connect(s, (cx, cy), (x + nw / 2, y), color=col, w=2)
        elif x < cx:
            elbow(s, (cx, cy), (x + nw, y + nh / 2), color=col, w=2, midx=x + nw + 0.45)
        else:
            elbow(s, (cx, cy), (x, y + nh / 2), color=col, w=2, midx=x - 0.45)
    circle(s, cx, cy, d + 0.3, fill=LIGHT)
    circle(s, cx, cy, d, fill=NAVY)
    text(s, cx - d / 2, cy - 0.72, d, 0.5, "5", size=34, bold=True, color=WHITE, align="c")
    text(s, cx - d / 2 + 0.1, cy - 0.05, d - 0.2, 0.7, ["INISIATIF UTAMA", "Pendidikan Islam Johor"],
         size=10, bold=True, color="DDE3FA", align="c", spacing=0.5)
    for no, t, sub, x, y, col in nodes:
        rect(s, x, y, nw, nh, fill=WHITE, line=RULE, lw=0.75)
        rect(s, x, y, 0.07 if True else 0, nh, fill=col)
        badge(s, x + 0.22, y + 0.2, no, fill=col, w=0.5, h=0.42, size=13)
        text(s, x + 0.85, y + 0.13, nw - 1.0, 0.6, t, size=11.5, bold=True, color=NAVY, line_sp=1.0)
        text(s, x + 0.85, y + 0.75, nw - 1.0, 0.3, sub, size=8.5, color=GRAY)
    footer(s, n)


# ---------------------------------------------------------------- 4 INISIATIF 1
def s_inisiatif1():
    s = blank(prs)
    n = nxt()
    header(s, "Inisiatif 01", "Infrastruktur")
    title(s, "Pembangunan & penambahbaikan infrastruktur", w=7.9)
    text(s, L, 1.75, 7.7, 0.9,
         "Kerajaan Negeri sentiasa memberikan keutamaan terhadap aspek keselamatan, keselesaan dan kapasiti "
         "Sekolah Agama Kerajaan Johor (SAKJ), khususnya dalam menangani peningkatan enrolmen murid serta "
         "perkembangan kawasan perumahan baharu.", size=11.5, color=GRAY, line_sp=1.15)
    # big number box
    bx, by, bw, bh = L, 2.85, 7.7, 1.45
    rect(s, bx, by, bw, bh, fill=NAVY)
    text(s, bx + 0.3, by + 0.12, 1.9, 1.2, "43", size=66, bold=True, color=WHITE, anchor="m")
    text(s, bx + 2.25, by + 0.25, bw - 2.5, 1.0,
         [[("buah sekolah agama", {"bold": True, "color": WHITE, "size": 15})],
          "dikenal pasti memerlukan pembangunan infrastruktur berdasarkan perancangan JAINJ"],
         size=11, color="C9D0F0", line_sp=1.1)
    # 3 categories
    cats = [("26", "Sekolah Baharu", "Pembinaan sekolah baharu di kawasan enrolmen tinggi & perumahan baharu", NAVY),
            ("6", "Bangunan Tambahan", "Pembinaan blok / bilik darjah tambahan di sekolah sedia ada", RED),
            ("11", "Guna Sama SK & SA", "Penggunaan premis secara guna sama antara Sekolah Kebangsaan & Sekolah Agama", BLUE)]
    cw3 = (7.7 - 0.3) / 3
    for i, (num, t, d, col) in enumerate(cats):
        x = L + i * (cw3 + 0.15)
        y = 4.5
        card(s, x, y, cw3, 2.15, top=col, topw=0.07)
        text(s, x + 0.2, y + 0.2, cw3 - 0.3, 0.7, num, size=34, bold=True, color=col)
        text(s, x + 0.2, y + 0.92, cw3 - 0.3, 0.3, t, size=12, bold=True, color=NAVY)
        text(s, x + 0.2, y + 1.25, cw3 - 0.35, 0.85, d, size=9, color=GRAY, line_sp=1.1)
    # proportion bar under title block? -> right side photo
    photo(s, 8.6, 1.2, R - 8.6, 5.45,
          desc="Cadangan: foto tapak / perspektif\nbangunan sekolah agama baharu\n(potret 3:4)")
    footer(s, n)


# ---------------------------------------------------------------- 5 FASA 7
def s_fasa7():
    s = blank(prs)
    n = nxt()
    header(s, "Projek Pembinaan", "Fasa 7")
    text(s, L, 1.2, 3.6, 1.0, "10 sekolah agama di bawah Projek Fasa 7", size=20, bold=True, color=NAVY, line_sp=1.0)
    # RM191j box
    rect(s, L, 2.3, 3.6, 1.75, fill=RED)
    text(s, L + 0.25, 2.4, 3.2, 0.75, "RM191 juta", size=30, bold=True, color=WHITE)
    text(s, L + 0.25, 3.12, 3.2, 0.85,
         "diperuntukkan Kerajaan Negeri melalui Belanjawan Johor 2027 — dibentangkan YAB Menteri Besar pada 19 November 2026",
         size=9.5, color="FFE3E5", line_sp=1.1)
    photo(s, L, 4.25, 3.6, 2.4, desc="Cadangan: foto pembentangan\nBelanjawan Johor 2027 / perspektif projek")
    # stats
    sx = 4.45
    stats = [("10", "projek Fasa 7", NAVY), ("9", "sekolah baharu", NAVY), ("1", "bangunan tambahan", RED),
             ("7", "daerah terlibat", NAVY)]
    sw = (R - sx - 0.45) / 4
    for i, (v, t, col) in enumerate(stats):
        x = sx + i * (sw + 0.15)
        card(s, x, 1.2, sw, 1.0, top=col, fill=LIGHT2, border=LIGHT2)
        text(s, x + 0.2, 1.28, sw - 0.3, 0.5, v, size=24, bold=True, color=col)
        text(s, x + 0.2, 1.78, sw - 0.3, 0.3, t, size=10, color=GRAY)
    # list
    colw = (R - sx - 0.2) / 2
    rh, gap = 0.82, 0.1
    for i, sc in enumerate(SCHOOLS[:10]):
        c, r = divmod(i, 5)
        x = sx + c * (colw + 0.2)
        y = 2.4 + r * (rh + gap)
        is_t = sc[4] == "BANGUNAN TAMBAHAN"
        leftbar_card(s, x, y, colw, rh, bar=RED if is_t else NAVY, fill=LIGHT2)
        text(s, x + 0.15, y, 0.5, rh, f"{i + 1:02d}", size=14, bold=True, color=MUTED, anchor="m")
        text(s, x + 0.7, y + 0.13, colw - 0.8, 0.3, sc[0].title().replace("Sa ", "SA ").replace("Al ", "Al-"), size=11.5, bold=True, color=NAVY)
        text(s, x + 0.7, y + 0.43, colw - 0.8, 0.3,
             [[f"{sc[1].title()} · DUN {sc[2].title()} · ",
               ("Bangunan Tambahan" if is_t else "Sekolah Baharu", {"bold": is_t, "color": RED if is_t else GRAY})]],
             size=9, color=GRAY)
    footer(s, n)


# ---------------------------------------------------------------- 6-7 TABLE 43
def s_table(part):
    s = blank(prs)
    n = nxt()
    header(s, "Senarai Cadangan", f"43 Sekolah Agama ({part}/2)")
    rows = SCHOOLS[:22] if part == 1 else SCHOOLS[22:]
    start = 0 if part == 1 else 22
    text(s, L, 1.12, 7.0, 0.5, "Senarai 43 buah Sekolah Agama Kerajaan Johor", size=20, bold=True, color=NAVY)
    # legend chips on right
    leg = [("26 Sekolah Baharu", NAVY), ("6 Bangunan Tambahan", RED), ("11 Bangunan Guna Sama", BLUE)]
    lx = R
    for t, col in reversed(leg):
        w = 0.3 + 0.075 * len(t)
        lx -= w
        rect(s, lx, 1.2, 0.14, 0.14, fill=col)
        text(s, lx + 0.2, 1.12, w - 0.2, 0.3, t, size=9, bold=True, color=INK, anchor="m")
        lx -= 0.15
    colw = [0.5, 3.75, 1.45, 1.65, 1.7, 1.98, 1.2]
    rowh = 0.215
    t = table(s, L, 1.62, colw, rowh, len(rows) + 1)
    heads = ["BIL", "MAKLUMAT ASAS SEKOLAH", "DAERAH", "DUN", "PARLIMEN", "JENIS CADANGAN", "CATATAN"]
    for j, hd in enumerate(heads):
        c = t.cell(0, j)
        set_cell(c, hd, size=8.5, bold=True, color=WHITE, fill=NAVY, align="c" if j in (0, 6) else "l")
        cell_border(c, "B", NAVY)
    jcol = {"SEKOLAH BARU": NAVY, "BANGUNAN TAMBAHAN": RED, "BANGUNAN GUNASAMA": BLUE}
    for i, sc in enumerate(rows):
        f7 = sc[5] == "FASA 7"
        fill = PALE_RED if f7 else (WHITE if i % 2 == 0 else LIGHT2)
        vals = [str(start + i + 1), sc[0], sc[1], sc[2], sc[3], sc[4], sc[5]]
        for j, v in enumerate(vals):
            c = t.cell(i + 1, j)
            st = dict(size=8.5, color=INK, fill=fill)
            if j == 1:
                st.update(bold=True, color=NAVY)
            if j == 5:
                st.update(bold=True, color=jcol[v])
            if j == 6:
                st.update(bold=True, color=RED)
            if j == 0:
                st.update(color=GRAY)
            set_cell(c, v, align="c" if j in (0, 6) else "l", **st)
            cell_border(c, "B", RULE, 0.5)
    note = ("Baris berlatar merah = projek Fasa 7 (Belanjawan Johor 2027)" if part == 1
            else "Sumber: Perancangan Bahagian Pendidikan Islam, JAINJ")
    text(s, L, 6.62, 9, 0.25, note, size=8.5, color=GRAY)
    footer(s, n)


# ---------------------------------------------------------------- 8 MINDMAP PENAMBAHBAIKAN
def s_penambahbaikan():
    s = blank(prs)
    n = nxt()
    header(s, "Inisiatif 01", "Penambahbaikan Berperingkat")
    title(s, "Inisiatif penambahbaikan dilaksanakan secara berperingkat")
    cx, cy, d = 2.05, 4.3, 2.3
    bx, bw, bh = 4.05, 4.45, 1.3
    ys = [1.95, 3.65, 5.35]
    br = [("i", "Penyelenggaraan & Pembaikan Bangunan",
           "Pembaikan struktur bangunan, pendawaian elektrik, bumbung dan kemudahan asas sekolah.", NAVY),
          ("ii", "Penambahan Blok & Bilik Darjah",
           "Menambah bilik darjah di sekolah yang mengalami peningkatan enrolmen bagi mengatasi kesesakan.", NAVY),
          ("iii", "Naik Taraf Kemudahan Pembelajaran",
           "Peralatan digital & penerapan Pembelajaran Abad Ke-21 (PAK-21) dalam bilik darjah.", RED)]
    for (no, t, dsc, col), y in zip(br, ys):
        elbow(s, (cx, cy), (bx, y + bh / 2), color=col, w=2, midx=bx - 0.4)
    # stats from branch iii
    sx, sw = 9.0, R - 9.0
    stats = [("575", "Smart TV", "sumbangan Perbadanan Islam Johor (PIJ) · RM1,552,500"),
             ("RM3.1j", "JPID Al-Bayen", "peruntukan Majlis Agama Islam Negeri Johor (MAINJ)"),
             ("RM2.08j", "Internet semua SAKJ", "peruntukan MAINJ bagi kemudahan internet")]
    sh_, sg = 0.92, 0.12
    for i, (v, t, dsc) in enumerate(stats):
        y = 1.95 + i * (sh_ + sg)
        elbow(s, (bx + bw, ys[2] + bh / 2), (sx, y + sh_ / 2), color=RED, w=1.25, midx=sx - 0.25)
    circle(s, cx, cy, d + 0.3, fill=LIGHT)
    circle(s, cx, cy, d, fill=NAVY)
    text(s, cx - d / 2 + 0.15, cy - 0.55, d - 0.3, 1.1, ["Penambah-", "baikan", "Infrastruktur"],
         size=14, bold=True, color=WHITE, align="c", anchor="m", line_sp=0.95)
    for (no, t, dsc, col), y in zip(br, ys):
        rect(s, bx, y, bw, bh, fill=WHITE, line=RULE, lw=0.75)
        rect(s, bx, y, 0.07, bh, fill=col)
        badge(s, bx + 0.22, y + 0.2, no, fill=col, w=0.5, h=0.4, size=11)
        text(s, bx + 0.85, y + 0.17, bw - 1.0, 0.35, t, size=12, bold=True, color=NAVY)
        text(s, bx + 0.85, y + 0.53, bw - 1.0, 0.75, dsc, size=9.5, color=GRAY, line_sp=1.1)
    for i, (v, t, dsc) in enumerate(stats):
        y = 1.95 + i * (sh_ + sg)
        rect(s, sx, y, sw, sh_, fill=PALE_RED if i == 0 else LIGHT2, line=None)
        rect(s, sx, y, 0.06, sh_, fill=RED)
        text(s, sx + 0.2, y + 0.08, 1.55, 0.5, v, size=20, bold=True, color=RED)
        text(s, sx + 1.75, y + 0.12, sw - 1.85, 0.3, t, size=10.5, bold=True, color=NAVY)
        text(s, sx + 1.75, y + 0.4, sw - 1.85, 0.5, dsc, size=8, color=GRAY, line_sp=1.05)
    py = 1.95 + 3 * (sh_ + sg) + 0.05
    photo(s, sx, py, sw, 6.65 - py, desc="Cadangan: foto Smart TV / kelas digital PAK-21")
    footer(s, n)


# ---------------------------------------------------------------- 9 INISIATIF 2 - 3 TAHAP
def s_tahap():
    s = blank(prs)
    n = nxt()
    header(s, "Inisiatif 02", "Klasifikasi Kerosakan")
    title(s, "Peruntukan pembangunan & penyelenggaraan sekolah agama",
          "JAINJ melalui BPI mengklasifikasikan tahap kerosakan kepada tiga kategori supaya peruntukan disalurkan mengikut keutamaan.")
    # left column
    rect(s, L, 2.2, 3.55, 2.2, fill=NAVY)
    text(s, L + 0.3, 2.3, 3.0, 1.0, "333", size=60, bold=True, color=WHITE)
    text(s, L + 0.3, 3.35, 3.0, 0.9, "buah sekolah agama masih memerlukan kerja-kerja baik pulih",
         size=11, color="C9D0F0", line_sp=1.1)
    rect(s, L, 4.55, 3.55, 1.0, fill=WHITE, line=RULE, lw=0.75)
    rect(s, L, 4.55, 0.07, 1.0, fill=RED)
    text(s, L + 0.3, 4.6, 3.0, 0.5, "RM30 juta", size=22, bold=True, color=RED)
    text(s, L + 0.3, 5.12, 3.1, 0.35, "anggaran kos keseluruhan", size=9.5, color=GRAY)
    photo(s, L, 5.7, 3.55, 0.95, desc="Foto kerosakan bangunan sekolah", label="RUANG GAMBAR")
    # stacked bar
    x0, bw = 4.4, R - 4.4
    text(s, x0, 2.2, bw, 0.3, "PECAHAN MENGIKUT TAHAP KEROSAKAN", size=9, bold=True, color=RED, spacing=1.5)
    tiers = [(237, "Tahap 1", "Kritikal", RED,
              "Kerosakan serius yang boleh menjejaskan keselamatan warga sekolah dan kelancaran PdP.", "Keutamaan tertinggi"),
             (88, "Tahap 2", "Separa Kritikal", NAVY,
              "Perlu dibaiki bagi mengelakkan keadaan menjadi lebih serius, namun tidak menjejaskan sepenuhnya operasi sekolah.", "Keutamaan sederhana"),
             (8, "Tahap 3", "Tidak Kritikal", BLUE,
              "Kerosakan kecil yang tidak menjejaskan keselamatan & operasi persekolahan; boleh dibaiki berperingkat.", "Dibaiki berperingkat")]
    tot = sum(t[0] for t in tiers)
    xx = x0
    for v, tl, nm, col, *_ in tiers:
        w = bw * v / tot
        rect(s, xx, 2.55, w, 0.5, fill=col)
        if w > 0.6:
            text(s, xx, 2.55, w, 0.5, str(v), size=13, bold=True, color=WHITE, align="c", anchor="m")
        xx += w
    # tier cards
    cw = (bw - 0.3) / 3
    for i, (v, tl, nm, col, dsc, pri) in enumerate(tiers):
        x = x0 + i * (cw + 0.15)
        y = 3.3
        card(s, x, y, cw, 3.35, top=col, topw=0.08)
        text(s, x + 0.25, y + 0.25, cw - 0.4, 0.3, tl.upper(), size=9.5, bold=True, color=col, spacing=1.5)
        text(s, x + 0.25, y + 0.55, cw - 0.4, 0.8,
             [[(str(v), {"size": 36, "bold": True, "color": col}), ("  buah", {"size": 12, "color": GRAY})]])
        text(s, x + 0.25, y + 1.35, cw - 0.4, 0.3, nm, size=13, bold=True, color=NAVY)
        text(s, x + 0.25, y + 1.7, cw - 0.4, 1.0, dsc, size=9, color=GRAY, line_sp=1.1)
        rect(s, x + 0.25, y + 2.8, cw - 0.5, 0.33, fill=LIGHT2)
        text(s, x + 0.25, y + 2.8, cw - 0.5, 0.33, f"{pri} · {v / tot * 100:.1f}%", size=8.5, bold=True,
             color=col, align="c", anchor="m")
    footer(s, n)


# ---------------------------------------------------------------- 10 BAIK PULIH TABLE
def s_baikpulih():
    s = blank(prs)
    n = nxt()
    header(s, "Peruntukan", "Baik Pulih 2022–2026")
    title(s, "Maklumat baik pulih SAKJ (2022–2026)")
    text(s, L, 1.7, 8.6, 0.7,
         [["Bagi tempoh 2022 hingga 2026, Kerajaan Negeri telah memperuntukkan sebanyak ",
           ("RM79.076 juta", {"bold": True, "color": RED}), " bagi kerja-kerja baik pulih sekolah agama yang melibatkan ",
           ("717 kerja pembaikan", {"bold": True, "color": NAVY}), "."]], size=12, color=GRAY, line_sp=1.15)
    # kpi
    k = [("RM79.076j", "jumlah peruntukan", RED), ("717", "kerja pembaikan", NAVY)]
    for i, (v, t, col) in enumerate(k):
        x = 9.4 + i * 1.75
        text(s, x, 1.62, 1.75, 0.45, v, size=19, bold=True, color=col)
        text(s, x, 2.07, 1.75, 0.3, t, size=9, color=GRAY)
    years = ["2022", "2023", "2024", "2025", "2026", "JUMLAH"]
    data = {
        "JAKIM": [(0, "0.000"), (64, "6.502"), (116, "10.108"), (185, "16.386"), (0, "0.000"), (365, "32.996")],
        "KERAJAAN NEGERI": [(46, "4.300"), (66, "6.870"), (92, "11.480"), (58, "7.770"), (90, "15.660"), (352, "46.080")],
        "KESELURUHAN": [(46, "4.300"), (130, "13.372"), (208, "21.588"), (243, "24.156"), (90, "15.660"), (717, "79.076")],
    }
    first = 1.85
    rest = (CW - first) / 12
    colw = [first] + [rest] * 12
    t = table(s, L, 2.6, colw, 0.36, 5)
    # merge year headers
    set_cell(t.cell(0, 0), "SUMBER", size=9, bold=True, color=WHITE, fill=NAVY)
    t.cell(0, 0).merge(t.cell(1, 0))
    for j, yv in enumerate(years):
        c = t.cell(0, 1 + j * 2)
        c.merge(t.cell(0, 2 + j * 2))
        set_cell(c, yv, size=10, bold=True, color=WHITE, fill=RED if yv == "JUMLAH" else NAVY, align="c")
        for k2, lab in enumerate(["PROJEK", "KOS (RM j)"]):
            cc = t.cell(1, 1 + j * 2 + k2)
            set_cell(cc, lab, size=7.5, bold=True, color=NAVY, fill=LIGHT, align="c")
            cell_border(cc, "B", RULE)
    for r, (src, vals) in enumerate(data.items()):
        tot = src == "KESELURUHAN"
        fill = LIGHT2 if not tot else NAVY
        fc = WHITE if tot else INK
        c = t.cell(2 + r, 0)
        set_cell(c, src, size=9, bold=True, color=WHITE if tot else NAVY, fill=fill)
        cell_border(c, "B", RULE)
        for j, (p, k_) in enumerate(vals):
            jl = j == 5
            f2 = (RED if tot else PALE_RED) if jl else fill
            c1, c2 = t.cell(2 + r, 1 + j * 2), t.cell(2 + r, 2 + j * 2)
            set_cell(c1, str(p), size=10, bold=tot or jl, color=WHITE if tot else (RED if jl else fc), fill=f2, align="c")
            set_cell(c2, k_, size=10, bold=tot or jl, color=WHITE if tot else (RED if jl else fc), fill=f2, align="c")
            cell_border(c1, "B", RULE)
            cell_border(c2, "B", RULE)
    # bottom cards
    y = 4.65
    cw = (CW - 0.3) / 3
    cards = [
        ("Penghargaan kepada JAKIM", NAVY,
         [[("365 projek", {"bold": True, "color": NAVY}), " baik pulih (2023–2025) bernilai ",
           ("RM32.996 juta", {"bold": True, "color": NAVY}), "."],
          "Mulai 2026, peruntukan baik pulih JAKIM dialihkan kepada ICU JPM — lawatan tapak bagi sekolah yang dipohon sedang dijalankan."]),
        ("DUN Penawar (2022–2026)", RED,
         [[("[__] projek", {"bold": True, "color": RED}), " kerja baik pulih telah dilaksanakan"],
          [("RM1.16 juta", {"bold": True, "color": RED, "size": 18})], "peruntukan keseluruhan"]),
        ("DUN Senggarang (2022–2026)", RED,
         [[("22 projek", {"bold": True, "color": RED}), " baik pulih di ", ("11 buah", {"bold": True, "color": RED}), " sekolah agama"],
          [("RM1.6 juta", {"bold": True, "color": RED, "size": 18})], "peruntukan keseluruhan"]),
    ]
    for i, (hd, col, body) in enumerate(cards):
        x = L + i * (cw + 0.15)
        card(s, x, y, cw, 2.0, top=col, topw=0.07)
        text(s, x + 0.25, y + 0.22, cw - 0.4, 0.3, hd, size=11.5, bold=True, color=NAVY)
        text(s, x + 0.25, y + 0.6, cw - 0.45, 1.35, body, size=9.5, color=GRAY, line_sp=1.12, after=3)
    footer(s, n)


# ---------------------------------------------------------------- 11 FOKUS UTAMA
def s_fokus():
    s = blank(prs)
    n = nxt()
    header(s, "Inisiatif 02", "Fokus Peruntukan")
    title(s, "Fokus utama penggunaan peruntukan",
          "Bagi memastikan keselamatan, keselesaan dan kapasiti sekolah memenuhi keperluan murid", w=8.0)
    items = [("01", "Penyelenggaraan Berjadual",
              "Membaiki struktur bangunan, bumbung dan pendawaian elektrik secara berperingkat — khususnya ketika cuti persekolahan bagi mengurangkan gangguan PdP."),
             ("02", "Pembinaan Sekolah Baharu & Penambahan Blok",
              "Keutamaan kepada sekolah baharu dan penambahan bilik darjah di sekolah yang mengalami peningkatan enrolmen."),
             ("03", "Kemudahan Pembelajaran Kondusif",
              "Bilik darjah dilengkapi kemudahan asas yang mencukupi seperti kipas, pencahayaan dan perabot yang bersesuaian.")]
    w = 7.95
    for i, (no, t, d) in enumerate(items):
        y = 2.2 + i * 0.98
        rect(s, L, y, w, 0.86, fill=WHITE, line=RULE, lw=0.75)
        badge(s, L + 0.2, y + 0.22, no, fill=NAVY if i != 1 else RED, w=0.5, h=0.42, size=12)
        text(s, L + 0.9, y + 0.1, w - 1.05, 0.3, t, size=12, bold=True, color=NAVY)
        text(s, L + 0.9, y + 0.38, w - 1.05, 0.5, d, size=9.5, color=GRAY, line_sp=1.05)
    # aspiration banner
    y = 5.2
    rect(s, L, y, w, 1.45, fill=NAVY)
    rect(s, L, y, 0.08, 1.45, fill=RED)
    text(s, L + 0.3, y + 0.14, 4.4, 0.3, "HALA TUJU BAHAGIAN PENDIDIKAN ISLAM", size=9, bold=True, color="FF9AA1", spacing=1.5)
    text(s, L + 0.3, y + 0.42, 4.6, 1.0,
         "BPI berhasrat membangunkan satu sistem pengurusan baik pulih sekolah agama yang lebih sistematik dan bersepadu.",
         size=11, bold=True, color=WHITE, line_sp=1.1)
    chips = ["Peruntukan disalurkan secara telus", "Mengelakkan ketirisan", "Pemantauan berkala & berterusan"]
    for i, c in enumerate(chips):
        cy = y + 0.17 + i * 0.4
        rect(s, L + 5.15, cy, 2.6, 0.33, fill=None, line="8496E0", lw=0.75)
        text(s, L + 5.25, cy, 2.45, 0.33, "✓  " + c, size=8.5, bold=True, color=WHITE, anchor="m")
    photo(s, 8.85, 1.2, R - 8.85, 5.45, desc="Cadangan: foto kerja baik pulih /\nbilik darjah selesa\n(potret 3:4)")
    footer(s, n)


# ---------------------------------------------------------------- 12 INISIATIF 3 OVERVIEW MINDMAP
def mindmap5(s, center_lines, nodes, cx=W / 2, cy=3.95, d=2.05, nw=3.85, nh=1.2, center_fill=RED):
    pos = [(L, 2.15), (L, 3.85), (R - nw, 2.15), (R - nw, 3.85), (W / 2 - nw / 2, 5.5)]
    for (x, y), nd in zip(pos, nodes):
        col = nd[3]
        if (x, y) == pos[4]:
            connect(s, (cx, cy), (x + nw / 2, y), color=col, w=2)
        elif x < cx:
            elbow(s, (cx, cy), (x + nw, y + nh / 2), color=col, w=2, midx=x + nw + 0.4)
        else:
            elbow(s, (cx, cy), (x, y + nh / 2), color=col, w=2, midx=x - 0.4)
    circle(s, cx, cy, d + 0.3, fill=LIGHT)
    circle(s, cx, cy, d, fill=center_fill)
    text(s, cx - d / 2 + 0.1, cy - d / 2 + 0.1, d - 0.2, d - 0.2, center_lines, size=12, bold=True, color=WHITE,
         align="c", anchor="m", line_sp=0.95)
    for (x, y), (t, stat, dsc, col) in zip(pos, nodes):
        rect(s, x, y, nw, nh, fill=WHITE, line=RULE, lw=0.75)
        rect(s, x, y, 0.07, nh, fill=col)
        text(s, x + 0.25, y + 0.1, nw - 0.4, 0.3, t, size=11, bold=True, color=NAVY)
        text(s, x + 0.25, y + 0.4, nw - 0.4, 0.4, stat, size=14, bold=True, color=col)
        text(s, x + 0.25, y + 0.8, nw - 0.4, 0.45, dsc, size=8.5, color=GRAY, line_sp=1.05)


def s_guru1():
    s = blank(prs)
    n = nxt()
    header(s, "Inisiatif 03", "Profesionalisme Guru")
    title(s, "Pemerkasaan kebajikan & profesionalisme guru")
    nodes = [
        ("Latihan Peningkatan Kompetensi Guru", "22 siri · 770 guru",
         "Pedagogi moden, penguasaan subjek, kemahiran digital & AI dalam PdP", NAVY),
        ("Pembangunan Profesionalisme Berterusan", "5,200 guru",
         "Seminar, bengkel, amalan terbaik & PLC menerusi Latihan Dalam Perkhidmatan (LDP)", NAVY),
        ("Pemerkasaan Kepimpinan Sekolah", "140 (2025) · 170 (2026)",
         "Guru Besar & Pengetua: kepimpinan instruksional, perancangan strategik & pengurusan perubahan", RED),
        ("Penilaian Keberkesanan Latihan", "Impak kepada kualiti",
         "Maklum balas peserta, pencapaian objektif latihan & perubahan amalan pengajaran", RED),
        ("Bantuan Kasih Johor · Pembantu Guru TAJ", "RM31,500 · 63 orang",
         "RM500 setiap penerima — Tadika Agama Johor (TAJ), tahun 2026", NAVY),
    ]
    text(s, L, 1.68, 9, 0.3,
         [["Peruntukan program pembangunan profesionalisme guru ", ("hampir RM6 juta setahun", {"bold": True, "color": RED})]],
         size=12, color=GRAY)
    mindmap5(s, [[("RM6", {"size": 30})], "juta setahun", [("profesionalisme guru", {"size": 9, "color": "FFE3E5"})]], nodes)
    footer(s, n)


def s_guru2():
    s = blank(prs)
    n = nxt()
    header(s, "Inisiatif 03", "Kebajikan Guru")
    title(s, "Perjawatan, kenaikan pangkat & elaun Darjah Khas")
    cx, cy, d = 2.0, 3.35, 2.2
    bx = 4.3
    bw = R - bx
    blocks = [(1.95, 1.25), (3.35, 2.0), (5.5, 1.15)]
    cols = [NAVY, RED, NAVY]
    for (y, h), col in zip(blocks, cols):
        elbow(s, (cx, cy), (bx, y + h / 2), color=col, w=2, midx=bx - 0.4)
    circle(s, cx, cy, d + 0.3, fill=LIGHT)
    circle(s, cx, cy, d, fill=NAVY)
    text(s, cx - d / 2 + 0.1, cy - 0.5, d - 0.2, 1.0, ["Kebajikan", "Guru SAKJ"], size=15, bold=True, color=WHITE, align="c", anchor="m")
    photo(s, L, 4.85, 2.95, 1.8, desc="Foto guru / majlis\npenyampaian surat lantikan")
    # a) perjawatan
    y, h = blocks[0]
    leftbar_card(s, bx, y, bw, h, bar=NAVY)
    badge(s, bx + 0.2, y + 0.18, "a", w=0.4, h=0.36)
    text(s, bx + 0.75, y + 0.18, 4, 0.35, "Penambahan Perjawatan Guru", size=12.5, bold=True, color=NAVY)
    for i, (v, t) in enumerate([("631", "jawatan guru diwujudkan · 2024"), ("322", "tambahan kekosongan jawatan · 2025")]):
        x = bx + 0.75 + i * 4.1
        text(s, x, y + 0.58, 1.1, 0.5, v, size=24, bold=True, color=NAVY)
        text(s, x + 1.05, y + 0.66, 2.9, 0.4, t, size=9.5, color=GRAY, anchor="m")
    # b) TBBK
    y, h = blocks[1]
    leftbar_card(s, bx, y, bw, h, bar=RED)
    badge(s, bx + 0.2, y + 0.18, "b", fill=RED, w=0.4, h=0.36)
    text(s, bx + 0.75, y + 0.18, 6, 0.35, "Time-Based Berasaskan Kecemerlangan (TBBK)", size=12.5, bold=True, color=NAVY)
    text(s, bx + 0.75, y + 0.52, bw - 1.0, 0.3,
         "Kenaikan pangkat guru SAKJ berdasarkan tempoh perkhidmatan & tahap kecemerlangan prestasi.", size=9.5, color=GRAY)
    # timeline 10 -> 8
    rect(s, bx + 0.75, y + 0.95, 2.6, 0.9, fill=PALE_RED)
    text(s, bx + 0.85, y + 0.98, 2.4, 0.3, "DG29 → DG32", size=10, bold=True, color=RED, align="c")
    text(s, bx + 0.85, y + 1.25, 2.4, 0.5, [[("10", {"size": 20, "bold": True, "color": MUTED}), ("  →  ", {"size": 14}),
                                           ("8 tahun", {"size": 20, "bold": True, "color": RED})]], color=GRAY, align="c")
    sub = [("42", "guru bukan siswazah (DG9–DG12)", "TBBK 1 selepas 8 thn → DG32 · TBBK 2 selepas 13 thn → DG34"),
           ("612", "guru siswazah (DG5–DG7)", "TBBK 1 & TBBK 2 selepas 8 thn → DG44 & DG48")]
    for i, (v, t, dsc) in enumerate(sub):
        x = bx + 3.6 + i * 2.5
        nwid = 0.6 if v == "42" else 0.8
        text(s, x, y + 0.92, nwid, 0.45, v, size=22, bold=True, color=NAVY)
        text(s, x + nwid + 0.05, y + 0.97, 2.3 - nwid, 0.45, t, size=8.5, bold=True, color=NAVY, line_sp=1.0)
        text(s, x, y + 1.42, 2.3, 0.55, dsc, size=8.5, color=GRAY, line_sp=1.05)
    # c) darjah khas
    y, h = blocks[2]
    leftbar_card(s, bx, y, bw, h, bar=NAVY)
    badge(s, bx + 0.2, y + 0.18, "c", w=0.4, h=0.36)
    text(s, bx + 0.75, y + 0.18, 4, 0.35, "Elaun Guru Darjah Khas", size=12.5, bold=True, color=NAVY)
    text(s, bx + 0.75, y + 0.55, 2.3, 0.5, "RM4.725j", size=22, bold=True, color=RED)
    text(s, bx + 3.0, y + 0.6, 2.4, 0.45, "peruntukan elaun", size=9.5, color=GRAY, anchor="m")
    text(s, bx + 4.85, y + 0.55, 1.2, 0.5, "1,123", size=22, bold=True, color=NAVY)
    text(s, bx + 6.05, y + 0.6, 2.3, 0.45, "guru Darjah Khas dimanfaatkan", size=9.5, color=GRAY, anchor="m")
    footer(s, n)


def s_guru3():
    s = blank(prs)
    n = nxt()
    header(s, "Inisiatif 03", "Elaun Kepimpinan")
    title(s, "Elaun kepimpinan sekolah agama")
    # central node
    cw_, ch_ = 3.6, 0.6
    cx = W / 2
    rect(s, cx - cw_ / 2, 1.85, cw_, ch_, fill=NAVY)
    text(s, cx - cw_ / 2, 1.85, cw_, ch_, "ELAUN KEPIMPINAN SEKOLAH", size=11.5, bold=True, color=WHITE, align="c", anchor="m", spacing=1)
    colw = (CW - 0.4) / 3
    y0 = 2.85
    for i in range(3):
        x = L + i * (colw + 0.2)
        elbow_pts = (x + colw / 2, y0)
        line(s, cx, 1.85 + ch_, cx, 2.62, color=NAVY, w=2)
        line(s, L + colw / 2, 2.62, R - colw / 2, 2.62, color=NAVY, w=2)
        line(s, x + colw / 2, 2.62, x + colw / 2, y0, color=NAVY if i != 1 else RED, w=2)
    groups = [
        ("Elaun Guru Besar", "RM150", "sebulan", "583 orang Guru Besar", NAVY,
         [("Gred A", "50"), ("Gred B", "88"), ("Gred C", "445")]),
        ("Elaun Tanggungjawab Duduk Waran Hakiki", "RM150", "sebulan", "208 penerima", RED,
         [("Guru Besar Sekolah Gred A", "50"), ("GPK Sekolah Gred A", "50"), ("Guru Besar Sekolah Gred B", "88"),
          ("Penolong Pegawai PPID", "20")]),
        ("Elaun Sekolah Menengah Agama", "RM120–300", "sebulan", "3 buah SMA", NAVY,
         [("Pengetua · RM300", "3 SMA"), ("Guru Kanan Mata Pelajaran · RM120", "9"),
          ("Ketua Bidang · RM120 (Maahad Johor)", "7"), ("Ketua Bidang · RM120 (SMAKJ)", "8")]),
    ]
    for i, (t, amt, per, who, col, rows) in enumerate(groups):
        x = L + i * (colw + 0.2)
        h = 6.65 - y0
        card(s, x, y0, colw, h, top=col, topw=0.07)
        text(s, x + 0.25, y0 + 0.2, colw - 0.4, 0.55, t, size=11.5, bold=True, color=NAVY, line_sp=1.0)
        text(s, x + 0.25, y0 + 0.75, colw - 0.4, 0.55, [[(amt, {"size": 24, "bold": True, "color": col}), ("  " + per, {"size": 10, "color": GRAY})]])
        text(s, x + 0.25, y0 + 1.3, colw - 0.4, 0.3, who, size=10, bold=True, color=col)
        ry = y0 + 1.7
        for lab, v in rows:
            rect(s, x + 0.25, ry, colw - 0.5, 0.4, fill=LIGHT2)
            text(s, x + 0.38, ry, colw - 1.6, 0.4, lab, size=9, color=INK, anchor="m")
            text(s, x + colw - 1.3, ry, 0.95, 0.4, v, size=11, bold=True, color=col, align="r", anchor="m")
            ry += 0.47
    footer(s, n)


def s_guru4():
    s = blank(prs)
    n = nxt()
    header(s, "Inisiatif 03", "Pedalaman & Laluan Kerjaya")
    title(s, "Elaun guru pedalaman & laluan kemajuan kerjaya")
    # left: pedalaman
    lw_ = 6.9
    text(s, L, 1.75, lw_, 0.3, "ELAUN GURU KAWASAN PEDALAMAN", size=9.5, bold=True, color=RED, spacing=1.5)
    text(s, L, 2.02, lw_, 0.3, "Mengikut tahap pedalaman & lokaliti  (P = Pedalaman)", size=10, color=GRAY)
    tiers = [("P1", "RM500", 1.1, BLUE), ("P2", "RM1,000", 1.75, NAVY2), ("P3", "RM1,500", 2.4, NAVY)]
    base = 5.25
    bw = 1.35
    for i, (p, v, hgt, col) in enumerate(tiers):
        x = L + 0.1 + i * (bw + 0.3)
        rect(s, x, base - hgt, bw, hgt, fill=col)
        text(s, x, base - hgt + 0.12, bw, 0.4, p, size=20, bold=True, color=WHITE, align="c")
        text(s, x, base - 0.5, bw, 0.4, "Pedalaman " + p[1], size=8.5, color="DDE3FA", align="c")
        text(s, x, base - hgt - 0.45, bw, 0.4, v, size=15, bold=True, color=col, align="c")
    line(s, L, base, L + 0.2 + 3 * (bw + 0.3), base, color=RULE, w=1)
    tx = L + 5.1
    for i, (v, t) in enumerate([("RM13,500", "sebulan"), ("RM162,000", "setahun")]):
        y = 2.65 + i * 1.3
        rect(s, tx, y, 1.95, 1.1, fill=LIGHT2)
        rect(s, tx, y, 1.95, 0.05, fill=RED)
        text(s, tx + 0.15, y + 0.18, 1.75, 0.45, v, size=16, bold=True, color=RED)
        text(s, tx + 0.15, y + 0.62, 1.75, 0.3, "jumlah " + t, size=9, color=GRAY)
    photo(s, L, 5.45, lw_ + 0.1, 1.2, desc="Foto sekolah agama kawasan pedalaman (landskap)")
    # right: laluan kerjaya
    rx = 7.85
    rw = R - rx
    rect(s, rx, 1.75, rw, 4.9, fill=NAVY)
    rect(s, rx, 1.75, rw, 0.07, fill=RED)
    text(s, rx + 0.3, 1.98, rw - 0.6, 0.3, "LALUAN KEMAJUAN KERJAYA · DALAM KAJIAN", size=9, bold=True, color="FF9AA1", spacing=1.2)
    # DG flow
    fy = 2.45
    for i, (t, col) in enumerate([("DG5 · DG6 · DG7", "2A3C93"), ("DG9", RED)]):
        x = rx + 0.3 + i * 2.65
        rect(s, x, fy, 2.0 if i == 0 else 1.4, 0.6, fill=col)
        text(s, x, fy, 2.0 if i == 0 else 1.4, 0.6, t, size=13, bold=True, color=WHITE, align="c", anchor="m")
    text(s, rx + 2.35, fy, 0.55, 0.6, "→", size=22, bold=True, color=WHITE, align="c", anchor="m")
    text(s, rx + 0.3, 3.2, rw - 0.6, 0.6,
         "BPI sedang mengkaji laluan kerjaya bagi guru Kumpulan Pelaksana yang memiliki Ijazah Sarjana Muda untuk dipertimbangkan ke Gred DG9.",
         size=10, color="DDE3FA", line_sp=1.1)
    text(s, rx + 0.3, 3.95, 1.6, 0.6, "147", size=34, bold=True, color=WHITE)
    text(s, rx + 1.75, 4.05, rw - 2.0, 0.5, "guru berijazah masih berada dalam Kumpulan Pelaksana", size=10, bold=True, color=WHITE, anchor="m")
    line(s, rx + 0.3, 4.75, R - 0.3, 4.75, color="3B54BE", w=1)
    text(s, rx + 0.3, 4.88, rw - 0.6, 1.7,
         [[("Pelan Kemajuan Pendidikan Islam", {"bold": True, "color": WHITE})],
          "Diusulkan menerusi Konvensyen Pendidikan Islam Negeri Johor sempena Majlis Sambutan Hari Guru Peringkat Negeri (3 Julai 2026) — dirasmikan oleh YAB Menteri Besar Johor."],
         size=9.5, color="C9D0F0", line_sp=1.1, after=3)
    footer(s, n)


def s_kafa():
    s = blank(prs)
    n = nxt()
    header(s, "Inisiatif 03", "Guru KAFA")
    title(s, "Peningkatan elaun, bonus & bantuan khas guru KAFA")
    # left: elaun bar chart
    lx, lw_ = L, 4.6
    card(s, lx, 1.8, lw_, 4.85, top=RED, topw=0.07)
    text(s, lx + 0.25, 1.98, lw_ - 0.4, 0.3, "PENINGKATAN ELAUN GURU KAFA", size=9, bold=True, color=RED, spacing=1.2)
    base, scale = 4.75, 2.25 / 1762
    for i, (v, lab, col) in enumerate([(1612, "SEBELUM", "A9B6EA"), (1762, "SELEPAS", NAVY)]):
        x = lx + 0.55 + i * 1.75
        hh = v * scale
        rect(s, x, base - hh, 1.2, hh, fill=col)
        text(s, x - 0.2, base - hh - 0.38, 1.6, 0.35, f"RM{v:,}", size=13, bold=True, color=NAVY, align="c")
        text(s, x - 0.2, base + 0.05, 1.6, 0.3, lab, size=8.5, bold=True, color=GRAY, align="c", spacing=1)
    # +150 highlight
    hdiff = 150 * scale
    rect(s, lx + 2.3, base - 1762 * scale, 1.2, hdiff, fill=RED)
    text(s, lx + 3.55, base - 1762 * scale - 0.05, 1.0, 0.35, "+RM150", size=12, bold=True, color=RED)
    line(s, lx + 0.3, base, lx + lw_ - 0.3, base, color=RULE, w=1)
    for i, (v, t) in enumerate([("RM5.92j", "peruntukan peningkatan elaun"), ("2,150", "guru KAFA dimanfaatkan")]):
        x = lx + 0.25 + i * 2.15
        text(s, x, 5.45, 2.1, 0.45, v, size=20, bold=True, color=RED if i == 0 else NAVY)
        text(s, x, 5.92, 2.0, 0.5, t, size=9, color=GRAY)
    # right: bonus table
    rx = L + lw_ + 0.3
    rw = R - rx
    text(s, rx, 1.8, rw, 0.3, "BONUS KERAJAAN NEGERI & BANTUAN KHAS KEWANGAN (dipanjangkan kepada Guru KAFA)",
         size=9, bold=True, color=RED, spacing=0.8)
    colw = [2.0] + [(rw - 2.0) / 5] * 5
    t = table(s, rx, 2.2, colw, 0.42, 5)
    hd = ["INISIATIF", "2022", "2023", "2024", "2025", "2026"]
    for j, h_ in enumerate(hd):
        set_cell(t.cell(0, j), h_, size=9.5, bold=True, color=WHITE, fill=NAVY, align="l" if j == 0 else "c")
    rows = [
        ("Bonus Kerajaan Negeri", ["RM833,000", "RM1.8 juta", "RM3.8 juta", "RM7.52 juta", "—"],
         ["1,976", "1,985", "2,006", "2,064", "—"]),
        ("Bantuan Khas Kewangan / Hari Raya", ["RM1.8 juta", "RM597,000", "RM2.54 juta", "RM1.977 juta", "RM1.975 juta"],
         ["1,946", "1,991", "1,700", "1,997", "1,990"]),
    ]
    r = 1
    for name, amts, pen in rows:
        c = t.cell(r, 0)
        c.merge(t.cell(r + 1, 0))
        set_cell(c, name, size=10, bold=True, color=NAVY, fill=LIGHT2)
        cell_border(c, "B", RULE)
        for j in range(5):
            a = t.cell(r, j + 1)
            p = t.cell(r + 1, j + 1)
            set_cell(a, amts[j], size=10, bold=True, color=RED if j == 3 and r == 1 else NAVY, fill=WHITE, align="c")
            set_cell(p, (pen[j] + " penerima") if pen[j] != "—" else "—", size=8, color=GRAY, fill=WHITE, align="c")
            cell_border(p, "B", RULE)
        r += 2
    # insight boxes
    iy = 4.55
    iw = (rw - 0.15) / 2
    rect(s, rx, iy, iw, 2.1, fill=NAVY)
    text(s, rx + 0.25, iy + 0.15, iw - 0.4, 0.7, "9×", size=34, bold=True, color=WHITE)
    text(s, rx + 0.25, iy + 0.9, iw - 0.4, 1.1,
         "peningkatan Bonus Kerajaan Negeri — daripada RM833,000 (2022) kepada RM7.52 juta (2025)",
         size=9.5, color="C9D0F0", line_sp=1.1)
    photo(s, rx + iw + 0.15, iy, iw, 2.1, desc="Foto guru KAFA / majlis\npenyampaian bantuan")
    footer(s, n)


# ---------------------------------------------------------------- INISIATIF 4
def s_pdp():
    s = blank(prs)
    n = nxt()
    header(s, "Inisiatif 04", "Kualiti PdP")
    title(s, "Peningkatan kualiti pengajaran & pembelajaran (PdP)",
          "Bagi memastikan PdP lebih berkesan, interaktif dan memenuhi keperluan pendidikan semasa")
    nodes = [
        ("i", "Pengukuhan Kemahiran Pedagogi", "PAK-21 secara berfasa melalui kursus & bimbingan berkala Jurulatih Utama Negeri.", NAVY),
        ("ii", "Penguasaan al-Quran & Jawi (PIQJ)", "Program intensif murid Darjah Satu — 12 minggu pertama sesi persekolahan.", RED),
        ("iii", "Bahan Bantu Mengajar Digital", "Portal BBM Site SAKJ: RPT, kitab & modul mengikut darjah untuk guru, murid & ibu bapa.", NAVY),
        ("iv", "Program Pratahfiz KAFA JAKIM", "Rintis 2026 di 5 SAKJ (5 daerah) → semua 583 SAKJ pada 2027. Sijil PraTahfiz: hafaz Juzuk 30 akhir Darjah 6.", RED),
        ("v", "Penyelarasan Kurikulum Agama", "KPA2027:TAJ diselaraskan dengan Kurikulum Prasekolah 2026 KPM; KPA2028:SAKJ dalam penyediaan.", NAVY),
        ("vi", "Pendidikan Murid MBPK", "Program Pendidikan Inklusif (PPI) dengan kerjasama UPSI & UTM.", RED),
    ]
    nw, nh, gap = 4.25, 1.4, 0.15
    y0 = 2.2
    cx, cy, d = W / 2, 3.1, 1.75
    for k, nd in enumerate(nodes):
        c, r = divmod(k, 3)
        x = L if c == 0 else R - nw
        y = y0 + r * (nh + gap)
        tx = x + nw if c == 0 else x
        elbow(s, (cx, cy), (tx, y + nh / 2), color=nd[3], w=1.75, midx=(tx + (0.35 if c == 0 else -0.35)))
    circle(s, cx, cy, d + 0.26, fill=LIGHT)
    circle(s, cx, cy, d, fill=NAVY)
    text(s, cx - d / 2 + 0.1, cy - d / 2 + 0.1, d - 0.2, d - 0.2, ["PdP", [("berkesan · interaktif · semasa", {"size": 8.5, "color": "C9D0F0"})]],
         size=24, bold=True, color=WHITE, align="c", anchor="m")
    photo(s, cx - 1.55, 4.3, 3.1, 2.35, desc="Foto PdP di bilik darjah /\nkelas al-Quran & Jawi")
    for k, (no, t, dsc, col) in enumerate(nodes):
        c, r = divmod(k, 3)
        x = L if c == 0 else R - nw
        y = y0 + r * (nh + gap)
        rect(s, x, y, nw, nh, fill=WHITE, line=RULE, lw=0.75)
        rect(s, x, y, 0.07, nh, fill=col)
        badge(s, x + 0.2, y + 0.18, no, fill=col, w=0.48, h=0.38, size=10.5)
        text(s, x + 0.8, y + 0.15, nw - 0.95, 0.4, t, size=11.5, bold=True, color=NAVY)
        text(s, x + 0.8, y + 0.5, nw - 0.95, 0.9, dsc, size=9, color=GRAY, line_sp=1.08)
    footer(s, n)


# ---------------------------------------------------------------- INISIATIF 5
def s_murid():
    s = blank(prs)
    n = nxt()
    header(s, "Inisiatif 05", "Modal Insan Murid")
    title(s, "Pembangunan modal insan murid",
          "Pengukuhan pendidikan agama · pembentukan sahsiah · pengembangan potensi diri", w=8)
    cx, cy, d = 3.95, 4.25, 2.0
    nw, nh = 3.3, 1.2
    pos = [(L, 2.0), (L + 4.4 - 0.0, 2.0), (L, 5.4), (L + 4.4, 5.4)]
    nodes = [("PIQJ", "Program Intensif al-Quran & Jawi", NAVY),
             ("Pratahfiz KAFA JAKIM", "Hafazan al-Quran secara sistematik & berperingkat", RED),
             ("Pendidikan Inklusif MBPK", "Murid berkeperluan pendidikan khas turut terangkum", RED),
             ("Nadi Al Ansor", "Pasukan kokurikulum & kesukarelawanan pelajar SAKJ", NAVY)]
    for (x, y), (t, dsc, col) in zip(pos, nodes):
        ny = y + nh if y < cy else y
        connect(s, (cx, cy), (x + nw / 2, ny), color=col, w=2)
    circle(s, cx, cy, d + 0.3, fill=LIGHT)
    circle(s, cx, cy, d, fill=RED)
    text(s, cx - d / 2 + 0.1, cy - d / 2 + 0.1, d - 0.2, d - 0.2, ["Modal", "Insan", [("murid SAKJ", {"size": 9, "color": "FFE3E5"})]],
         size=17, bold=True, color=WHITE, align="c", anchor="m", line_sp=0.95)
    for (x, y), (t, dsc, col) in zip(pos, nodes):
        rect(s, x, y, nw, nh, fill=WHITE, line=RULE, lw=0.75)
        rect(s, x, y, nw, 0.06, fill=col)
        text(s, x + 0.22, y + 0.2, nw - 0.4, 0.35, t, size=12.5, bold=True, color=NAVY)
        text(s, x + 0.22, y + 0.55, nw - 0.4, 0.6, dsc, size=9.5, color=GRAY, line_sp=1.05)
    # outcomes chips around center (left/right)
    outs_l = ["Jati diri", "Sahsiah", "Potensi optimum"]
    outs_r = ["Berakhlak", "Berdisiplin", "Berjiwa pemimpin"]
    for i, t in enumerate(outs_l):
        y = 3.62 + i * 0.44
        rect(s, L, y, 1.75, 0.34, fill=LIGHT2, line=RULE, lw=0.5)
        text(s, L, y, 1.75, 0.34, t, size=9, bold=True, color=NAVY, align="c", anchor="m")
    for i, t in enumerate(outs_r):
        y = 3.62 + i * 0.44
        rect(s, cx + 1.4, y, 1.85, 0.34, fill=PALE_RED, line=None)
        text(s, cx + 1.4, y, 1.85, 0.34, t, size=9, bold=True, color=RED, align="c", anchor="m")
    photo(s, 8.45, 1.2, R - 8.45, 5.45, desc="Cadangan: foto aktiviti Nadi Al Ansor /\nmurid menghafaz al-Quran\n(potret 3:4)")
    footer(s, n)


s_cover()
s_soalan()
s_lima()
s_inisiatif1()
s_fasa7()
s_table(1)
s_table(2)
s_penambahbaikan()
s_tahap()
s_baikpulih()
s_fokus()
s_guru1()
s_guru2()
s_guru3()
s_guru4()
s_kafa()
s_pdp()
s_murid()
prs.save(OUT)
print("saved", OUT, len(prs.slides), "slides")
