# Infografik Belanjawan Johor 2027 — Pendidikan Islam

4 slide Facebook 1080 × 1080, ikut pola templat rasmi (logo, tajuk dengan bar, footer dua warna) dalam tema biru gelap, putih dan emas.

| Fail | Kegunaan |
| --- | --- |
| `output/Infografik_Belanjawan_Johor_2027.pptx` | Fail boleh diedit: semua teks, kotak, bar dan carta. Boleh dibuka dalam PowerPoint, Google Slides, Keynote, atau di-import ke Canva. |
| `output/slide-1.png` … `slide-4.png` | Siap untuk dimuat naik (2160 × 2160, 2× untuk ketajaman). |

## Kandungan

1. **RM191 juta** · Projek Pembinaan Fasa 7 · 43 sekolah (26 / 11 / 6) · Smart TV, JPID Al-Bayen, internet
2. **333 sekolah** (237 / 88 / 8) · 717 projek · **RM79.076 juta** · peruntukan 2026 · 3 fokus · sistem pengurusan
3. **+RM150 elaun KAFA** · perjawatan · TBBK · 7 jenis elaun · bonus & bantuan khas 2022–2026 · Bantuan Kasih Johor · profesionalisme
4. 5 inisiatif utama · statistik murid/guru/SAKJ · kualiti PdP · modal insan · kepadatan murid · penutup

## Nota edit

- Fon: **Montserrat** (Medium, SemiBold, Bold, ExtraBold, Black). Pasang dari Google Fonts jika belum ada.
- Ikon: Lucide (vektor SVG + sandaran PNG). Dalam PowerPoint 365, klik kanan → *Convert to Shape* untuk tukar warna.
- Logo Johor dan Maju Johor dipotong daripada templat (resolusi rendah). Gantikan dengan fail logo HD rasmi sebelum diterbitkan.
- Carta 333 sekolah ialah carta PowerPoint asli (klik kanan → *Edit Data*).

## Bina semula

```bash
python3 build.py && ./render.sh
```

Perlu `python-pptx`, `cairosvg`, `lxml`, `Pillow`, LibreOffice dan `pdftoppm`.
