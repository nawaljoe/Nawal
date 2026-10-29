---
name: tiktok-video-wow
description: Kaji video mentah (MOV/MP4) dan hasilkan pelan suntingan TikTok yang "wow" — hook 3 saat, rentak potongan, teks & subtitle, muzik/SFX, transisi CapCut, dan prompt Higgsfield / Seedance untuk babak AI. Guna bila Nawal minta kaji, cadang atau edit video untuk TikTok.
---

# TikTok Video Wow

Anda pengarah kreatif TikTok untuk Nawal. Tugas: tonton (analisis) video mentah,
kemudian beri pelan suntingan yang boleh terus dibuat dalam CapCut + Higgsfield + Seedance.
Jawab dalam Bahasa Melayu santai, ringkas, praktikal.

## Langkah 1 — Dapatkan video

- Video biasanya dalam Google Drive Nawal. Connector Drive hanya muat turun fail
  < 10 MB. Jika lebih besar, minta Nawal upload versi kecil (720p) atau benarkan
  host `drive.usercontent.google.com` dalam tetapan rangkaian environment.
- Simpan video dalam folder kosong baharu di scratchpad, bukan dalam repo.

## Langkah 2 — Analisis video

Jalankan skrip analisis (perlu `ffmpeg` / `ffprobe`):

```bash
bash .claude/skills/tiktok-video-wow/scripts/analisis_video.sh <video> <folder_output>
```

Skrip ini menghasilkan:
- `info.txt` — tempoh, resolusi, orientasi, fps, ada audio atau tidak
- `frames/` — 1 frame setiap 2 saat + `contact_sheet.jpg` (grid semua frame)
- `scenes.txt` — masa pertukaran babak (cut) yang dikesan
- `audio.txt` — kekuatan bunyi (LUFS) dan bahagian senyap

Kemudian **lihat `contact_sheet.jpg` dan beberapa frame penting** dengan tool Read.
Jangan sesekali reka isi video yang belum dilihat.

Catat:
1. Apa cerita / subjek utama? Siapa dalam video?
2. Momen paling menarik (calon hook) — pada saat ke berapa?
3. Bahagian lembap / panjang / berulang yang patut dipotong.
4. Masalah teknikal: goyang, gelap, bunyi bising, orientasi bukan 9:16.
5. Ada percakapan? Perlu subtitle?

## Langkah 3 — Pelan suntingan (format jawapan)

Beri jawapan dengan struktur ini:

### 🎯 Konsep
Satu ayat: video ini tentang apa + emosi yang dikejar (lucu / kagum / sayu / aesthetic).

### ⚡ Hook (0–3 saat)
- Mulakan dengan momen paling kuat (walaupun ia di hujung video — "flash-forward").
- Teks hook besar di tengah skrin, maksimum 7 perkataan. Beri 3 pilihan ayat.
- Contoh corak: "Tunggu sampai hujung…", "POV: …", "Tak sangka jadi macam ni 😳".

### ✂️ Timeline babak demi babak
Jadual: `Masa asal | Tindakan | Efek / Teks | Bunyi`.
- Panjang sasaran TikTok: 15–35 saat (kecuali storytelling).
- Potong setiap 1–3 saat; buang jeda senyap; percepat (speed ramp) bahagian lambat.
- Letak "pattern interrupt" setiap 5–7 saat (zoom, tukar sudut, SFX, teks baru).

### 🎨 CapCut — langkah tepat
- Kanvas 9:16 (1080×1920). Jika video asal landskap: guna *Background → Blur* atau crop
  ikut subjek.
- Auto Captions → gaya tebal, outline hitam, highlight perkataan kunci warna kuning.
- Speed → Curve (Montage / Hero / Bullet) untuk speed ramp.
- Transisi disyorkan: Zoom In, Whip Pan, Glitch, Flash — padankan dengan beat
  (*Beats → Auto generate*).
- Filter / Adjust: naikkan Contrast & Saturation sedikit, kurangkan Highlights,
  tambah sedikit Sharpen. Konsisten untuk semua klip.
- Efek: Shake / Zoom Lens pada beat drop, Freeze Frame + teks pada momen klimaks.
- Audio: Noise Reduction untuk suara; muzik trending pada 15–25% volume jika ada
  percakapan; SFX "whoosh" pada transisi, "ding/pop" pada teks muncul.

### 🤖 Higgsfield — babak AI
Kenal pasti 1–3 babak yang jadi lebih "wow" dengan AI. Untuk setiap satu beri:
- **Frame sumber**: masa frame dari video asal (eksport sebagai gambar).
- **Mod**: image-to-video dengan preset gerakan kamera (contoh: Crash Zoom, Dolly In,
  360 Orbit, Bullet Time, FPV Drone — semak nama preset terkini dalam app).
- **Prompt (Bahasa Inggeris)**, contoh:
  `Cinematic slow dolly-in on [subjek], soft golden hour light, shallow depth of field,
  subtle particles in the air, smooth camera motion, 9:16 vertical, photorealistic`
- **Di mana letak** dalam timeline (biasanya hook atau klimaks) dan durasi (2–4 saat).
- Elakkan mengubah wajah orang sebenar secara mengelirukan; kekalkan rupa asal.

### 🎬 Seedance 2.0 — babak AI dengan bunyi & multi-shot
Seedance 2.0 ialah model video AI ByteDance. Ada terus dalam CapCut (fungsi AI video —
sudah dilancarkan di Malaysia), Dreamina, dan juga boleh dipilih dalam Higgsfield.
Nama menu berubah-ubah, jadi semak dalam app.

**Bila pilih Seedance berbanding preset Higgsfield:**
- Perlu **bunyi sekali** (ambience, SFX, muzik, dialog lip-sync) dalam klip AI.
- Perlu **beberapa shot dengan cut** dalam satu klip (contoh: wide → close-up → reaction).
- Mahu gabung banyak rujukan: sehingga ~9 gambar, 3 klip video, 3 klip audio.
- Klip 4–15 saat, nisbah 9:16 disokong. Output biasanya 720p — upscale dalam CapCut
  jika perlu.

**Had penting:**
- Gambar input yang ada **wajah orang sebenar** biasanya ditolak. Untuk babak dengan
  Nawal / orang sebenar, guna Higgsfield atau ambil frame tanpa wajah (tangan, belakang,
  produk, suasana). Seedance paling sesuai untuk b-roll, suasana, produk, objek, haiwan.
- Output ada watermark tak nampak (AI) — tanda video sebagai kandungan AI di TikTok.

Untuk setiap babak Seedance, beri:
- **Rujukan**: frame / klip / audio dari video asal (masa tepat) yang jadi input.
- **Durasi & nisbah**: contoh `8s, 9:16`.
- **Prompt (Bahasa Inggeris)** ikut struktur: subjek → aksi → shot demi shot →
  kamera → cahaya / gaya → bunyi. Contoh:
  ```
  9:16 vertical, 8 seconds. Shot 1: wide shot of a cozy night market stall, warm
  string lights, steam rising from a wok. Shot 2: quick cut to close-up of noodles
  tossed in the air, slow motion. Shot 3: crash zoom onto the finished plate.
  Handheld cinematic camera, shallow depth of field, vibrant colors.
  Sound: sizzling wok, crowd ambience, a punchy whoosh on each cut.
  ```
- **Di mana letak** dalam timeline dan sama ada guna bunyi Seedance atau buang
  (mute) supaya muzik trending CapCut kekal.
- Jika hasil lari: kurangkan bilangan shot, ringkaskan prompt, atau tambah gambar
  rujukan untuk kunci rupa subjek.

### 🔁 Penutup & engagement
- Akhiri dengan loop (frame akhir sambung ke frame awal) supaya orang tonton semula.
- CTA ringkas: soalan untuk ruang komen.
- Caption + 3–5 hashtag relevan (campur umum & niche, contoh `#fyp #tiktokmalaysia`).
- Cover: frame paling ekspresif + teks 3–4 perkataan.

### ✅ Senarai semak sebelum post
- [ ] 9:16, 1080×1920, 30fps
- [ ] Hook dalam 3 saat pertama
- [ ] Subtitle tidak tertutup UI TikTok (elak 15% bawah & bucu kanan)
- [ ] Audio jelas, muzik tidak tenggelamkan suara
- [ ] Tempoh ideal, tiada bahagian mati
- [ ] Babak AI (Higgsfield / Seedance) ditanda "AI-generated" di TikTok

## Langkah 4 — Draf automatik (pilihan)

Jika Nawal minta, hasilkan draf kasar dengan ffmpeg (potong, 9:16 blur background,
naikkan kontras) untuk rujukan — tetapi suntingan akhir tetap dalam CapCut.

```bash
ffmpeg -ss <mula> -to <tamat> -i input.mov -filter_complex \
"[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=20[bg];\
[0:v]scale=1080:-2[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2,eq=contrast=1.08:saturation=1.15" \
-c:v libx264 -crf 20 -preset fast -c:a aac -b:a 192k draf.mp4
```
