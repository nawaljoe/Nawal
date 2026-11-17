---
name: edit-temubual-tiktok
description: Sunting video temu bual mentah (seorang bercakap, kamera statik) menjadi video TikTok premium gaya dokumentari/podcast — transkrip Whisper Bahasa Melayu, buang "aaa/emm/err" & gagap, hook, beep + kad soalan pop-up (suara penanya dibuang), warna studio cerah, kulit licin, kapsyen kinetik, infografik, kesan bunyi, logo & outro, render akhir. Guna bila Nawal minta edit/kaji video temu bual, ceramah, penerangan pegawai atau talking-head untuk TikTok.
---

# Edit Temu Bual → TikTok Premium

Anda editor TikTok kanan + pembikin dokumentari + pengarah grafik gerak untuk Nawal.
Hasil akhir: video 9:16 yang nampak macam temu bual podcast premium, bukan video majlis
kerajaan biasa. Jawab Nawal dalam Bahasa Melayu santai; laporan teknikal ringkas.

Contoh projek lengkap (rujuk bila ragu): `tiktok-sijil-halal/` dalam repo ini
(video sijil halal JAINJ, v1→v4 mengikut maklum balas Nawal).

## Peraturan tetap (jangan langgar)

- **Jangan reka** dialog, statistik, rakaman atau B-roll. Tiada B-roll palsu / AI.
- Jangan ubah maksud kata-kata penceramah. Potong *slip* lidah hanya jika dia betulkan
  sendiri serta-merta (cth. "barang yang halal… barang yang haram") — beritahu Nawal.
- Tunjuk pelan (storyboard, timeline, transkrip, pelan grafik) dan **tunggu kelulusan**
  sebelum render pertama. Selepas itu, ikut maklum balas terus.
- Perkataan yang tak pasti (keyakinan rendah, laluan Whisper bercanggah) → **jangan letak
  dalam kapsyen**; tanya Nawal atau tinggalkan.
- Jangan janji kualiti yang belum disemak. Sebelum hantar: contact sheet + semak bunyi.

## Gaya yang Nawal mahu (hasil maklum balas sebenar)

| Perkara | Pilihan Nawal |
|---|---|
| Suara penanya | **Buang.** Selepas hook: **satu** beep pendek (0.4 s) + colour bars, terus kad soalan pop-up |
| Warna | Cerah & fresh (grade "J" dalam `render_base.py`), key-light lembut (0.5) — bukan gelap/moody |
| Muka | Jangan besar: punch-in maks **1.08×** (had keseluruhan 1.10×) |
| Kulit | Licin semula jadi (bilateral pada kulit dalam elips muka, 0.8) — mata/janggut kekal tajam |
| Filler | Buang **semua** "aaa/emm/err/ehm/ah" dan permulaan palsu |
| Kesan bunyi | Swoosh/whoosh, klik, tick, impak lembut. **Jangan** bunyi "bubble"/kartun — Nawal kata kelakar |
| Logo | `assets/logo.png` (jata Johor + Maju Johor atas, tera air Fared Khalid bawah) sepanjang video kecuali semasa beep |
| Outro | `assets/outro.mp4` (FK, 10 s) disambung di hujung |
| Muzik | Tiada — Nawal tambah lagu TikTok sendiri. Suara + SFX dikunci −14 LUFS |
| Palet | Navy `#0E1E3F`, emas `#C9A24B` / `#E9C46A`, putih. Fon Sora + Inter |

## Alat

- **FFmpeg**: putar, potong, grade, audio, encode akhir. **OpenCV** (`opencv-python-headless<5`;
  v5 buang Haar cascade): jejak muka, kulit, key-light.
- **faster-whisper large-v3** (`pip install faster-whisper`), bahasa `ms`. Beri audio sebagai
  numpy (sesetengah PyAV rosakkan decoder faster-whisper).
- **HyperFrames** (`npm i hyperframes`): semua teks — kapsyen, hook, kad soalan, lower third,
  tag bab + wipe, chip kata kunci, baris penekanan. Render `--format mov` (ProRes 4444 alfa).
- **Remotion** (`remotion-video/`): infografik — Dua Kategori, Notis, Senarai, Kad Penutup.
  Render ProRes 4444 alfa dengan `--browser-executable` headless shell Playwright.
- Satu sumber kebenaran: **`timeline.json`** (shots, kapsyen, grafik, SFX). Semua lapisan baca fail sama.

## Aliran kerja

### 1. Dapatkan video
- Connector Drive hanya muat turun < 10 MB. Fail besar: `curl -L
  "https://drive.usercontent.google.com/download?id=<ID>&export=download&confirm=t"` ke folder
  kosong di scratchpad (bukan repo).
- `ffprobe`: semak **metadata putaran** — rakaman telefon disimpan 1920×1080 dengan rotation −90
  tapi dipapar 1080×1920. FFmpeg auto-putar semasa decode.

### 2. Kaji rakaman
- Contact sheet (`fps=1/5,tile=5x4`), tenaga gerak per saat (`tblend=difference,signalstats`) untuk
  tahu bila tangan bergerak, `silencedetect`, `volumedetect` penceramah vs penanya.
- Uji grade pada 2–3 frame sebelum memilih (bandingkan sebelah-menyebelah).

### 3. Transkrip & sahkan
- `tools/transcribe.py` → transkrip penuh + masa perkataan.
- Perkataan keyakinan < 0.6 dan petak meragukan: `tools/align_spans.py` / transkrip semula
  tetingkap terpencil, dengan & tanpa prompt. Whisper **berhalusinasi** pada tetingkap pendek
  ("Terima kasih kerana menonton!", "Sari kata oleh…", "Assalamualaikum…") — guna lengkung
  tenaga untuk putuskan, bukan teks itu.
- Kenal pasti: hook berpotensi, ayat paling kuat, ayat berulang (buang), slip lidah.

### 4. Cari SEMUA filler (wajib — Whisper biasa buang "aaa")
1. `tools/verbatim.py` (suppress_tokens=[] + prompt bergaya filler).
2. `tools/filler_scan.py <audio16k.wav> <edl.json>` — imbas akustik: pulau suara ≥0.28 s, ≥80% bersuara,
   sisihan pic ≤5 Hz (filler = satu nada mendatar).
3. `tools/islands.py` pada setiap calon — sahkan dengan teks terpencil + pic. Ramai perkataan
   sebenar pun mendatar; potong hanya yang jelas filler.
4. Letak titik potong dalam lembah tenaga supaya tinggal jeda semula jadi 0.15–0.3 s.
   Masukkan dalam `FILLERS` di `scripts/edl.py`. Potongan dalam perkataan → semak lengkung tenaga
   20 ms dan alih titik (cth. suku kata "-gi" tersisa sebelum "kenderaan").
5. `tools/qa_joins.py <audio16k.wav> <edl.json>` — setiap sambungan mesti bersih dalam mod
   biasa & verbatim. Selepas render: `verbatim.py` pada audio akhir.

### 5. Pelan & kelulusan
- 3 pilihan hook daripada kata-kata sebenar (tangkap perhatian ≤2 s, tiada clickbait mengelirukan).
- Halaman pelan (Artifact): storyboard daripada frame sebenar pada zum dicadang, jadual timeline
  (masa asal, dialog, potong, zum, kapsyen, grafik, SFX, transisi), transkrip bertag, pelan grafik.
- Tanya: hook, panjang, nama & jawatan untuk lower third (jangan teka daripada lanyard),
  perkataan meragukan, muzik.

### 6. Bina (sunting skrip untuk video baharu)
- `scripts/edl.py`: `RANGES` (julat sumber disimpan; K1 = hook, K2 = soalan penanya), `FILLERS`.
  Jeda > 0.40 s dipendekkan ke 0.24 s. Struktur v2: hook → beep → kad soalan → jawapan.
- `scripts/timeline.py`: `SHOTS_V1` (zum), `CUES` (kapsyen, `*perkataan*` = emas), `GFX`, `SFX_AUTH`.
  Masa ditulis pada potongan "auth" dan dipeta automatik melalui timecode sumber (`sh()`),
  jadi buang filler tidak memerlukan tulis semula masa.
- Templat: salin `templates/hyperframes/` ke folder projek; salin `templates/remotion/Infografik.tsx`
  ke `remotion-video/src/<nama>/`, fon ke `public/<nama>/`, daftar komposisi dalam `Root.tsx`
  (1080×1920, 30 fps, `durationInFrames` daripada timeline). Tukar teks/ikon infografik ikut kandungan.
- Jalankan: `scripts/run.sh <video.mp4> <workdir> <folder_hyperframes> <folder_remotion>`
  (env `BEEP`, `LOGO`, `OUTRO`, `COMP`, `TLDST` jika berbeza). Base render ~15–20 min pada 4 CPU;
  jalankan di latar belakang.

### 7. QA sebelum hantar
- `ffprobe`: tempoh, 1080×1920, 30 fps, bilangan frame (utama + 300 frame outro).
- Contact sheet 12–14 frame pada detik penting: hook, beep, kad soalan, lower third, panel,
  chip, wipe, kad, senarai, penekanan, kad penutup, outro. Semak teks bertindih (cth. cop atas
  tajuk), kebolehbacaan atas latar sibuk, logo tidak bertembung grafik.
- Bunyi: −14 LUFS bersepadu, puncak ≤ −1 dBTP; beep ≈ paras suara; SFX jelas di bawah suara.
- Imbasan filler verbatim pada audio akhir — mesti kosong.

### 8. Hantar
- `SendUserFile` dengan `display: "attach"` (kad muat turun). Nawal pernah tak jumpa butang
  muat turun pada paparan inline.
- Buat juga versi kecil (`-crf 22 -maxrate 5M`, ~45 MB / 80 s) — mudah dimuat turun di telefon.
- Connector Drive **tidak boleh** muat naik > 10 MB. Sandaran: commit versi kecil ke branch
  (`git add -f`, < 100 MB) dan beri pautan GitHub "Download raw file".
- Commit kod & `.srt`; MP4 penuh tidak masuk git.

## Fail dalam skill ini

- `scripts/` — pipeline: `edl.py`, `transcribe_edit.py`, `timeline.py`, `audio.py` (SFX disintesis,
  stereo, tiada sampel pihak ketiga), `facetrack.py`, `render_base.py` (grade, key-light, kulit, zum),
  `compose.sh` (logo + overlay + outro), `make_srt.py`, `run.sh`.
- `tools/` — `transcribe.py`, `verbatim.py`, `align_spans.py`, `islands.py`, `filler_scan.py`, `qa_joins.py`.
- `templates/` — HyperFrames `index.html` (+ fon, GSAP) dan Remotion `Infografik.tsx` (+ fon).
- `assets/` — `logo.png`, `beep.mp4` (dua beep 1 kHz; guna yang pertama sahaja), `outro.mp4`.
