"""Satu slide: 5 Inisiatif Utama + Kualiti Pengajaran & Pembelajaran (PdP).

    python3 build_slide_pdp.py
    -> output/Slide_5_Inisiatif_PdP.pptx          (boleh diedit)
    -> output/Slide_5_Inisiatif_PdP.png           (2160 px)
    -> output/Slide_5_Inisiatif_PdP_GAMBAR.pptx   (slide = gambar penuh)
"""
import os
import subprocess

from build import M, CW, OUT, frame, card, section_label
from lib import *  # noqa

NAME = "Slide_5_Inisiatif_PdP"


def slide(prs):
    s = blank(prs)
    frame(s, 4, "INISIATIF UTAMA · KUALITI PdP", [
        [("5 INISIATIF UTAMA ", GOLD), ("MEMPERKUKUH", NAVY)],
        [("PENDIDIKAN ISLAM JOHOR", NAVY)],
    ])

    # ---------------- lima inisiatif
    y = 234
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
    g, h = 12, 248
    w = (CW - 4 * g) / 5
    for i, (ic, t, dsc) in enumerate(ini):
        x = M + i * (w + g)
        hl = i == 3
        if hl:
            rect(s, x, y, w, h, fill=NAVY, radius=16, shadow=True)
        else:
            card(s, x, y, w, h)
        text(s, x + 14, y + 14, 80, 40, [[R(f"0{i+1}", 34, "k", GOLD if hl else GOLD_D, -1)]])
        icon(s, ic, x + w - 48, y + 18, 34, GOLD_L if hl else NAVY, 1.9)
        text(s, x + 14, y + 64, w - 24, 84, [[R(t, 14.5, "eb", WHITE if hl else NAVY)]], lh=1.0)
        hline(s, x + 14, y + 152, 40, GOLD if hl else GOLD_L, 3)
        text(s, x + 14, y + 164, w - 24, 80, [[R(dsc, 13, "m", "C9D3E8" if hl else MUTED)]], lh=1.05)

    # ---------------- kualiti PdP
    y = 506
    section_label(s, M, y, "INISIATIF 4  ·  PENINGKATAN KUALITI PENGAJARAN & PEMBELAJARAN (PdP)", size=15)
    pdp = [
        ("users", "PAK-21", "Pembelajaran Abad Ke-21",
         "Pengukuhan kemahiran pedagogi guru melalui kursus & bimbingan Jurulatih Utama Negeri"),
        ("book-open", "PIQJ", "Program Intensif al-Quran & Jawi",
         "Latihan berfokus selama 12 minggu pertama persekolahan kepada murid Darjah Satu"),
        ("monitor-smartphone", "Portal BBM Site SAKJ", "Bahan bantu mengajar",
         "Menghimpunkan rancangan pengajaran tahunan, kitab & modul mengikut darjah serta mata pelajaran"),
        ("book-marked", "Pratahfiz KAFA JAKIM", "Rintis 2026 · menyeluruh 2027",
         "Projek rintis di 5 buah SAKJ mewakili 5 daerah terpilih, pelaksanaan menyeluruh pada 2027"),
        ("layers", "Penyelarasan Kurikulum", "Pendidikan agama",
         "KPA2027:TAJ dan penyediaan KPA2028:SAKJ"),
        ("heart-handshake", "Pendidikan Inklusif MBPK", "Kerjasama UPSI & UTM",
         "Peningkatan kompetensi guru melalui kerjasama UPSI dan UTM"),
    ]
    gx, gy = 14, 12
    cw = (CW - gx) / 2
    ch = (988 - (y + 36) - 2 * gy) / 3
    for i, (ic, t, sub, dsc) in enumerate(pdp):
        cx = M + (i % 2) * (cw + gx)
        cy = y + 36 + (i // 2) * (ch + gy)
        card(s, cx, cy, cw, ch)
        rect(s, cx, cy, 6, ch, fill=GOLD)
        icon_badge(s, ic, cx + 20, cy + 18, 54, NAVY, GOLD_L, 1.9)
        ellipse(s, cx + 56, cy + 14, 24, 24, GOLD)
        text(s, cx + 56, cy + 14, 24, 24, [[R(str(i + 1), 12, "k", NAVY)]], align="c", anchor="m")
        tx = cx + 90
        tw = cw - 90 - 16
        text(s, tx, cy + 14, tw, 26, [[R(t, 19, "k", NAVY)]])
        text(s, tx, cy + 40, tw, 20, [[R(sub.upper(), 11, "eb", GOLD_D, 0.8)]])
        text(s, tx, cy + 62, tw, ch - 66, [[R(dsc, 15, "m", INK)]], lh=1.05)
    return s


def main():
    prs = new_deck()
    slide(prs)
    pptx = os.path.join(OUT, NAME + ".pptx")
    prs.save(pptx)
    subprocess.run(["soffice", "--headless", "--convert-to", "pdf", "--outdir", OUT, pptx],
                   check=True, capture_output=True)
    pdf = os.path.join(OUT, NAME + ".pdf")
    subprocess.run(["pdftoppm", "-png", "-r", "192", "-singlefile", pdf, os.path.join(OUT, NAME)], check=True)
    os.remove(pdf)
    png = os.path.join(OUT, NAME + ".png")
    g = new_deck()
    sl = blank(g)
    sl.shapes.add_picture(png, 0, 0, px(1080), px(1080))
    g.save(os.path.join(OUT, NAME + "_GAMBAR.pptx"))
    print("ok")


if __name__ == "__main__":
    main()
