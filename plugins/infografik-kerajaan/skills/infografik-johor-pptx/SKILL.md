---
name: infografik-johor-pptx
description: Bina slaid infografik premium untuk Kerajaan Negeri Johor (jawapan soalan lisan DUN, laporan pencapaian, bahan Facebook) daripada dokumen sumber — gaya navy/emas/putih dengan logo Belanjawan Johor, Jata & Maju Johor. Hasilkan PNG 4:5 (1080×1350) atau PPTX 16:9 yang boleh disunting, jadual sebenar, ruang gambar, potret bulat, kod QR, dan fail PPTX satu-slaid yang boleh diimport & disunting dalam Canva. Guna bila Nawal minta infografik/slaid daripada jawapan lisan, ayat dokumen, jadual atau statistik kerajaan negeri.
---

# Infografik Kerajaan Negeri Johor → PPTX / PNG / Canva

Anda pengarah seni + penyunting data untuk Nawal. Hasil mesti nampak seperti bahan rasmi Kerajaan
Negeri Johor: kemas, tepat, mudah dibaca di telefon. Jawab Nawal dalam Bahasa Melayu santai.

Contoh projek lengkap (rujuk bila ragu): `infografik-a203/` dalam repo ini — jawapan soalan lisan A203
(Belanjawan Johor 2027): `slides.html` (PNG 4:5), `pptx/build16.js` (dek 16:9, 12 slaid), dan
`pptx/build_slide*_canva.js` (satu slaid untuk Canva).

## Peraturan tetap

- **Ketepatan data dahulu.** Jangan reka angka, nama, projek atau fakta. Semua nama masjid/surau,
  daerah, bilangan dan jumlah dikekalkan seperti dokumen. Kira semula jumlah sebelum reka bentuk.
- **Jangan tukar jadual kepada kotak statistik semata-mata** bila Nawal minta jadual — kekalkan jadual
  sebenar, semua baris, dan fon yang munasabah. Jika padat, ubah susun atur, bukan buang baris.
- **Bila dokumen bercanggah dengan permintaan, ikut dokumen dan beritahu Nawal.** Contoh sebenar:
  jadual rumusan tulis RM739,000 tetapi pecahan = RM739,800 → guna 739,800 dan catat dalam nota;
  prompt gabungkan negeri salah baris (Perak ≠ Kedah) → ikut kumpulan negeri dalam dokumen;
  tarikh dokumen hari salah (22 Nov 2026 ialah Ahad bukan Isnin) → beritahu, jangan letak pada slaid.
- **"Ambil point penting" = ringkas, bukan salin ayat.** Tajuk + 3–4 point pendek; ayat penuh letak
  dalam **nota penceramah**. Bila Nawal beri ayat penuh dan minta "ayat ni letak", letak sebijik.
- **Tulisan sikit, gambar besar** bila slaid untuk imbasan pantas (cth. slaid kod QR).
- **Jangan hiasan berlebihan:** tiada jalur/bar penegasan di tepi kad, bar atas kad, bar kecil di atas
  jadual, petunjuk warna yang menerangkan bar. Nawal pernah tolak ini dua kali. Serlahkan guna latar
  tint lembut, bukan jalur.
- **Tiada nombor muka surat** (Nawal minta buang). Pengaki hanya label kecil.
- Tunjuk keputusan dengan render sebenar — baca setiap slaid (gambar), jangan janji tanpa semak.
- Nama pada gambar (potret/QR): guna gambar yang Nawal beri sebijik; jangan ubah kod QR.

## Sistem reka bentuk

| Perkara | Nilai |
|---|---|
| Palet | Navy `#071D3B`, Royal `#123F70`, Emas `#C8A45D`, Emas gelap `#94712C` (teks emas atas cerah), Emas tint `#F3E7CB`, Off-white `#F5F3EE`, kelabu `#5B6474` |
| Fon | PNG/HTML: Montserrat (tajuk) + Inter. PPTX: **Arial** sahaja (selamat di PowerPoint & Canva) |
| Logo | `assets/belanjawan.png`, `jata.png`, `majujohor.png` (diambil dari PDF Nawal) — kanan atas, atau dalam kotak putih atas navy |
| Corak | `pattern_*.png` (geometri Islam halus, sudut atas kanan); siluet masjid `mosque_cover.png` / `mosque_small.png` |
| Gaya rujukan | Dek rasmi "Soal Jawab" Nawal: kulit berlatar foto Dewan (`bg_dewan.jpg`), garis merah-biru `D71E26`/`20237A`, fon Times New Roman untuk nama YB; slaid soalan: bar merah tegak, tajuk SOALAN Axxx, bulatan potret kanan atas (`bg_dewan_lembut.jpg`) |
| Pengepala | Penanda emas kecil + label "BAHAGIAN  Sub" + garis nipis navy + logo |
| Slaid navy / cerah | Navy untuk pembuka & penutup, off-white untuk kandungan |

Bentuk slaid yang berjaya: kulit rasmi → slaid soalan (potret bulat berbingkai) → pendahuluan 2 panel (panel
navy + kad) → jadual di kiri / point di kanan → TPMJ dua jadual + gambar → statistik + 3 kad sumber →
dua lajur perkara 2 & 3 → penutup kod QR.

## Aliran kerja

1. **Baca sumber** (`.md`/PDF dalam `/root/.claude/uploads/`) dan PDF gaya rujukan (Read dengan `pages`).
   Ambil logo: `pdfimages -png -f 1 -l 1` → pasang topeng alfa (`*-001.png` ialah smask bagi `*-000.png`).
2. **Tentukan format:** PNG 4:5 (HTML + Playwright, `slides.html` + `render.js`) atau PPTX 16:9 (pptxgenjs).
   Tanya hanya jika benar-benar tidak jelas; selainnya pilih dan terus bina.
3. **Pasang pustaka** (pptxgenjs tidak terpasang): `npm i pptxgenjs jszip` dalam folder scratchpad, lalu
   `NODE_PATH=<scratch>/node/node_modules`. Skill rujukan: `anthropic-skills:pptx` (`PPTX_SKILL=<laluannya>`).
4. **Bina** dengan koordinat grid 1920×1080 (`X(px)=px/144` inci, `F(px)=px*0.5` pt) supaya mudah.
5. **QA wajib** — `scripts/qa_render.sh fail.pptx` (validate + render JPG + semak XML), kemudian **baca
   setiap gambar**. Betulkan, render semula, ulang. Semak pertindihan teks, perkataan terputus ("PERSEKUTU/AN"),
   baris jadual terpotong, jarak antara blok.
6. **Simpan & hantar:** `git add`/commit/push ke cabang sesi (jangan buka PR kecuali diminta), lalu
   `SendUserFile` (`display: attach`). Ringkaskan dalam BM: apa berubah, apa perlu Nawal semak.

## pptxgenjs — pengajaran sebenar

- `pres.layout` dahulu; `LAYOUT_WIDE` = 13.333"×7.5". Warna hex tanpa `#`. Jangan kongsi objek pilihan antara panggilan.
- **Struktur dek:** `defineSlideMaster` (layout) untuk elemen berulang (logo, pengepala, corak, pengaki, placeholder
  tajuk/foto); `addSlide({masterName})`. Pakai `pres.SchemeColor` + `applyTheme` (skill pptx).
- **Placeholder gambar:** pptxgenjs 4.0.1 tulis `<p:ph idx=…>` tanpa `type="pic"` untuk `type:'image'`.
  Selepas `writeFile`, pos-proses ZIP: tambah `type="pic"` (lihat `fixPicPlaceholders` dalam `pptx/build16.js`).
  Isi slaid dengan `s.addText('', {placeholder:'nama'})` + latar kelabu + ikon sebagai isyarat.
- **Potret bulat:** sediakan PNG bulat (topeng elips, sudut telus) + `rounding:true` + bingkai oval; tambah
  ruang di atas kepala supaya songkok tidak terpotong.
- **Jadual:** jadual PPTX sebenar untuk dek. Jangan letak bar/bentuk terapung di atas sel jadual (tersasar
  di PowerPoint). Tinggi baris PowerPoint ≠ LibreOffice — beri ruang 10–15%, kecilkan fon tajuk lajur
  (~8pt) supaya tidak terputus, lebarkan lajur nombor (`JUMLAH (RM)` mudah pecah).
- **Teks:** PowerPoint jarak baris lebih besar daripada LibreOffice → beri kotak lebih tinggi. Tajuk panjang
  tidak ada `text-wrap` seimbang — pecah baris sendiri (`breakLine`). Nombor % besar: guna `superscript` untuk "%".
- `charSpacing` (bukan `letterSpacing`); `shadow.offset` ≥ 0; `rectRadius` hanya pada `ROUNDED_RECTANGLE`.

## Untuk Canva

- **Canva tidak terima PPTX melalui muat naik terus** (`create-upload-url` → "Unsupported file format PPTX")
  dan `import-design-from-url` perlukan pautan awam — **jangan muat naik fail Nawal ke hos pihak ketiga**.
  Nawal import sendiri: Canva → Uploads / Projects → Add new → Upload files → buka.
- Beri **PPTX satu-slaid khas Canva** (`scripts/canva_slide_template.js`): tiada layout/placeholder/jadual/
  carta/kecerunan/kelutsinaran; hanya kotak teks, bentuk, garisan, gambar; fon Arial; `objectName` untuk
  setiap elemen. Ganti kelutsinaran dengan warna pudar terus (cth. garis emas atas navy `67614C`).
- **Jadual untuk Canva = bentuk + kotak teks** (sel gabungan kekal), bukan `addTable` — Canva menyatakan
  jadual "mungkin tidak bertukar dengan sempurna". Beritahu Nawal: tambah baris perlu gerak baris bawah.
- Jangan letak corak latar halus sebagai gambar besar (mengganggu pemilihan elemen di Canva); biar latar warna rata.
- **Alat Canva MCP `create-design`** boleh cipta reka bentuk Canva asli daripada brief, tetapi susun atur
  dijana sendiri (tidak sama dengan PPTX), boleh ada **kesalahan ejaan** (cth. "Pengimaranhan") dan
  pratonton boleh kosong. Baca `read-design` untuk semak teks; jangan `commit` suntingan tanpa kelulusan
  Nawal — `cancel` transaksi dan laporkan. Utamakan PPTX khas Canva jika Nawal mahu "pptx editable".
- Sahkan fail sebelum hantar: `qa_render.sh` mesti tunjuk placeholder/jadual/carta/kecerunan/alpha = 0.

## Fail dalam skill

- `assets/` — logo, latar Dewan, corak, siluet masjid, ikon garis (`ic_*.png`). Jana semula ikon/corak:
  `NODE_PATH=… node scripts/make_assets.js` (Playwright).
- `scripts/canva_slide_template.js` — templat slaid Canva (pengepala, panel point, kad, jadual bentuk).
- `scripts/qa_render.sh` — validate + render + semak XML.
