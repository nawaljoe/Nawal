---
name: efek-video
description: Katalog 20 efek video TikTok/Reels — orbit, chat take over, frame escape, snap zoom, checklist pop, headline storm, zoom portal, growth curve, studio reveal, b-roll overlay, paper cutout, dolly zoom, magazine cover, liquid glass, zoom through cut, green screen, frame break, digital zoom, phone mockup, checklist. Untuk setiap efek: bila guna, langkah CapCut, prompt Higgsfield (jika perlu AI) dan resipi ffmpeg. Guna bila Nawal sebut nama efek ini, minta cadangan efek, atau nak tahu cara buat efek tertentu.
---

# Efek Video

Anda pembantu efek video untuk Nawal. Bila Nawal sebut satu atau lebih efek di
bawah, terangkan cara buat langkah demi langkah dalam **CapCut** (utama), beri
**prompt Higgsfield** jika efek itu lebih cantik dijana AI, dan resipi **ffmpeg**
jika ada. Jawab dalam Bahasa Melayu santai; prompt Higgsfield dalam Bahasa Inggeris.

Nama menu CapCut dan preset Higgsfield berubah-ubah ikut versi — sebut sebagai
contoh dan minta Nawal semak nama terkini dalam app. Jika Higgsfield disambung,
guna skill `higgsfield` untuk jana (semak kredit & minta kelulusan dahulu).

## Pilih efek ikut tujuan

| Tujuan | Efek |
|---|---|
| Hook 3 saat pertama | Headline Storm, Chat Take Over, Zoom Portal, Frame Break, Snap Zoom |
| Penekanan perkataan / beat | Snap Zoom, Digital Zoom |
| Transisi antara babak | Zoom Through Cut, Zoom Portal |
| Hero shot orang / produk | Orbit, Dolly Zoom, Studio Reveal, Magazine Cover |
| Subjek "keluar" dari video | Frame Escape, Frame Break |
| Tips / tutorial / senarai | Checklist Pop, Checklist, Liquid Glass |
| Hasil, angka, before–after | Growth Curve |
| Talking head supaya tak bosan | B-roll Overlay, Digital Zoom, Snap Zoom |
| Demo app / skrin / chat | Phone Mockup, Chat Take Over |
| Tukar latar / letak diri dalam babak lain | Green Screen |
| Gaya kreatif / aesthetic | Paper Cutout, Liquid Glass, Magazine Cover |

Jangan sumbat terlalu banyak efek: 1 efek "besar" untuk hook, 1 untuk klimaks,
dan efek kecil (snap/digital zoom, b-roll) sebagai pattern interrupt setiap 5–7 saat.

---

## 1. Orbit
Kamera berpusing mengelilingi subjek (arc atau 360°) — rasa "hero shot".
- **Bila**: perkenalan watak/produk, klimaks, outfit/OOTD.
- **Higgsfield (terbaik)**: image-to-video, preset *360 Orbit* / *Arc Left/Right*.
  ```
  Smooth 360 orbit around [subject] standing still, background parallax,
  soft rim light, cinematic, shallow depth of field, stable subject, 9:16 vertical
  ```
- **CapCut (tiruan)**: rakam sendiri sambil berjalan mengelilingi subjek (telefon
  pada paras dada, gimbal jika ada). Tambah Stabilize, lalu Speed → Curve *Montage*.
- **Tips**: subjek berdiri diam; latar ada banyak butiran supaya pusingan nampak jelas.

## 2. Chat Take Over
Gelembung chat/DM/notifikasi muncul bertubi-tubi sehingga memenuhi skrin.
- **Bila**: hook cerita drama/gosip/"storytime", reaksi komen, testimoni pelanggan.
- **CapCut**:
  1. Screenshot chat (sembunyikan nama/nombor orang lain), potong setiap gelembung
     (*Remove background* atau crop) → masukkan sebagai Overlay.
  2. Setiap gelembung muncul selang 0.2–0.4 saat; Animation → In *Pop* / *Slide up*.
  3. Kedudukan sedikit rawak, makin lama makin menutup muka — gelembung terakhir
     paling besar di tengah (punchline).
  4. SFX notifikasi/"ding" pada setiap gelembung; tambah sedikit *Shake* di hujung.
- **Tips**: guna chat sebenar dengan izin, atau buat semula (mockup) — jangan
  dedahkan maklumat peribadi.

## 3. Frame Escape
Video seolah-olah dalam bingkai/kad, kemudian subjek melangkah atau terkeluar
melepasi sempadan bingkai (pop-out 3D).
- **Bila**: hook, intro channel, saat subjek melompat/menghulur tangan.
- **CapCut**:
  1. Klip utama → Scale ~80%, tambah border (Canvas warna atau sticker bingkai).
  2. Duplicate klip ke Overlay → *Remove background* (Auto cutout), scale sama.
  3. Layer cutout (atas) hanya kelihatan bila subjek melepasi bingkai — guna
     Mask pada layer bawah supaya bingkai "memotong" latar sahaja.
  4. Sedikit drop shadow pada cutout; SFX whoosh.
- **Higgsfield**:
  ```
  [subject] steps out of a framed photo on the wall into the real room,
  frame edges stay sharp, smooth motion, cinematic lighting, 9:16 vertical
  ```
- **Tips**: pilih klip dengan gerakan ke arah kamera atau ke tepi.

## 4. Snap Zoom
Zoom masuk sangat pantas (2–4 frame) lalu kekal, pada beat atau perkataan kunci.
- **Bila**: penekanan punchline, beat drop, reaksi terkejut.
- **CapCut**: split klip pada saat kunci → keyframe Scale 100% → 130% dalam
  0.1 saat (atau Effects → *Zoom* / *Camera shake* ringan). SFX snap/whoosh pendek.
- **ffmpeg** (zoom 1.3× pada saat 2, siap 0.1 saat):
  ```bash
  Z="(1+0.3*clip((t-2)/0.1,0,1))"
  ffmpeg -i in.mp4 -vf "scale=w='trunc(1080*$Z/2)*2':h='trunc(1920*$Z/2)*2':eval=frame,crop=1080:1920,setsar=1" -c:a copy snap.mp4
  ```
- **Tips**: jangan lebih 1 snap setiap 3 saat — penat mata.

## 5. Checklist Pop
Item senarai muncul satu-satu, setiap satu "pop" dengan tanda ✓ dan bunyi.
- **Bila**: tips, "3 benda wajib…", barang dalam beg, langkah tutorial.
- **CapCut**:
  1. Text satu item satu layer, tetapan sama (font tebal, kotak latar separa telus).
  2. Muncul ikut sebutan dalam voiceover: Animation In *Pop* / *Bounce*.
  3. Tanda ✓ (sticker/emoji ✅) muncul 0.2 saat selepas teks, Animation *Zoom in*.
  4. SFX "pop" / "ding" setiap item; item lama boleh dimalapkan 60% opacity.
- **Tips**: maksimum 5 item, 2–5 perkataan setiap item.

## 6. Headline Storm
Tajuk berita / teks besar bertubi-tubi muncul bertindih dengan pantas.
- **Bila**: hook isu viral, "semua orang cakap pasal…", topik kontroversi.
- **CapCut**:
  1. 6–10 layer teks atau screenshot headline, setiap satu 0.2–0.4 saat,
     bertindih; kedudukan & putaran sedikit rawak (−8° hingga 8°).
  2. Animation In *Pop* / *Slam*; Effects *Shake* atau *Glitch* ringan.
  3. SFX typewriter / kamera shutter / "whoosh" pantas; berhenti tiba-tiba pada
     headline terakhir yang paling besar → masuk muka Nawal.
- **Tips**: jika guna screenshot berita sebenar, pastikan tepat & tidak mengelirukan;
  kaburkan logo jika tidak pasti.

## 7. Zoom Portal
Kamera zoom masuk ke dalam sesuatu (mata, skrin telefon, pintu, cermin, cawan)
dan keluar di babak/lokasi baharu.
- **Bila**: transisi "masuk dunia lain", before → after, tukar lokasi.
- **CapCut**:
  1. Klip A: keyframe Scale ke objek "portal" sehingga ia penuh skrin (0.4–0.6 s).
  2. Klip B: letak sebagai Overlay di dalam portal guna Mask (bulat/rectangle)
     yang membesar sehingga penuh skrin; atau transisi *Zoom In* + *Blur*.
  3. SFX whoosh / "warp".
- **Higgsfield**: guna mod start frame + end frame (jika ada) atau:
  ```
  Fast crash zoom into [the eye / the phone screen / the doorway], camera flies
  through it and emerges into [new scene], seamless transition, motion blur,
  cinematic, 9:16 vertical
  ```

## 8. Growth Curve
Graf garisan naik dilukis secara animasi di atas video, dengan nombor berlari.
- **Bila**: hasil (followers, jualan, berat badan), before–after, data.
- **CapCut**:
  1. Buat graf PNG lutsinar (Canva / Google Sheets → eksport) — garis tebal,
     warna terang, titik hujung bulat.
  2. Overlay graf → Mask *Linear* (menegak), keyframe dari kiri → kanan (1–2 s).
  3. Teks nombor dengan keyframe atau template "counter"; sticker anak panah ↗ di hujung.
  4. SFX "rising" + "ding" bila sampai puncak.
- **Tips**: angka mesti benar; nyatakan tempoh (contoh "dalam 30 hari").

## 9. Studio Reveal
Mula rapat pada subjek, kamera tarik ke belakang mendedahkan set studio /
lampu / kru (behind the scenes).
- **Bila**: penutup, BTS, "macam mana video ni dibuat".
- **Higgsfield**: preset *Dolly Out* / *Crane Up*.
  ```
  Slow dolly out from a close-up of [subject] revealing a full video studio set,
  softbox lights, camera on tripod, crew silhouettes, cinematic, 9:16 vertical
  ```
- **CapCut**: rakam wide shot sebenar (4K jika boleh) → keyframe Scale 180% → 100%
  dalam 1–2 saat, ease out. Atau rakam sendiri sambil berjalan ke belakang.

## 10. B-roll Overlay
Klip sokongan menutup talking head seketika sementara suara terus berjalan.
- **Bila**: setiap kali sebut benda yang boleh ditunjuk (produk, tempat, makanan).
- **CapCut**: B-roll di track Overlay, potong tepat pada perkataan, 1–3 saat;
  mute audio B-roll; tambah zoom perlahan (Ken Burns) jika B-roll gambar statik.
- **ffmpeg** (b-roll dari saat 2 hingga 4):
  ```bash
  ffmpeg -i talking.mp4 -i broll.mp4 -filter_complex \
  "[1:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setpts=PTS-STARTPTS+2/TB[b];\
  [0:v][b]overlay=enable='between(t,2,4)':eof_action=pass" -c:a copy out.mp4
  ```
- **Tips**: B-roll ≥ 30% masa dalam video talking head = tontonan lebih lama.

## 11. Paper Cutout
Subjek dipotong dengan outline putih tebal seperti sticker kertas, tekstur
kertas, gerak tersekat-sekat ala stop-motion / scrapbook.
- **Bila**: aesthetic, vlog, kraf, kandungan kanak-kanak, explainer santai.
- **CapCut**:
  1. Overlay klip → *Remove background* → Stroke putih tebal (8–15) + shadow.
  2. Latar: gambar tekstur kertas/kraf.
  3. Effects *Stop motion* atau tukar frame rate ke 12 fps (Speed tetap 1×).
  4. Sedikit putaran rawak setiap beberapa frame; SFX kertas.
- **Higgsfield**:
  ```
  Paper cutout stop-motion animation of [subject], white paper border, visible
  paper texture, handmade scrapbook style, slightly jittery motion, 9:16 vertical
  ```

## 12. Dolly Zoom (Vertigo)
Subjek kekal saiz sama, latar seolah-olah memanjang/mengecut — rasa terkejut
atau "realisasi".
- **Bila**: momen terkejut, plot twist, reaksi "tak sangka".
- **Higgsfield (terbaik)**: preset *Dolly Zoom*.
  ```
  Dolly zoom vertigo effect on [subject], subject stays the same size while the
  background stretches away, dramatic tension, cinematic, 9:16 vertical
  ```
- **CapCut (tiruan)**: duplicate klip → layer atas *Remove background* (subjek
  kekal 100%); layer bawah (latar) keyframe Scale 100% → 140% dalam 1–2 saat.
  Tambah sedikit blur pada latar.

## 13. Magazine Cover
Freeze frame dijadikan muka depan majalah: nama majalah besar, tajuk, isu, barcode.
- **Bila**: penutup, outfit, "glow up", pengumuman, hari jadi.
- **CapCut**:
  1. Freeze pada pose terbaik (1.5–3 s) → Remove background jika mahu nama
     majalah berada **di belakang** kepala (layer cutout di atas teks).
  2. Masthead serif tebal di atas, 3–4 tajuk kecil di tepi, isu/bulan, sticker barcode.
  3. SFX kamera shutter + flash putih 2 frame sebelum freeze.
- **Tips**: guna nama majalah rekaan (contoh "NAWAL") — jangan tiru logo majalah
  sebenar.

## 14. Liquid Glass
Panel/kad kaca lutsinar kabur (glassmorphism) di atas video untuk teks, tajuk
atau UI.
- **Bila**: tajuk, quote, info produk, gaya iOS / tech aesthetic.
- **CapCut**:
  1. Duplicate klip ke Overlay → Effects *Blur* (kuat) → Mask *Rectangle* dengan
     sudut bulat (round corners) → itu panel kaca.
  2. Di atasnya: shape/text box putih opacity 10–15%, stroke putih nipis 40%.
  3. Teks putih di atas panel; Animation In *Fade + Scale up* sedikit.
- **ffmpeg** (panel 900×500 di bahagian bawah):
  ```bash
  ffmpeg -i in.mp4 -filter_complex \
  "[0:v]split[a][b];[b]crop=900:500:90:1200,boxblur=25,eq=brightness=0.06:saturation=1.2,\
  drawbox=x=0:y=0:w=iw:h=ih:color=white@0.12:t=fill,drawbox=x=0:y=0:w=iw:h=ih:color=white@0.5:t=3[g];\
  [a][g]overlay=90:1200" -c:a copy glass.mp4
  ```

## 15. Zoom Through Cut
Transisi: klip A zoom masuk laju, klip B mula dengan zoom keluar — momentum bersambung.
- **Bila**: tukar lokasi/babak dengan tenaga tinggi, montaj travel.
- **CapCut**: Transitions → *Zoom In* / *Pull In* / *Zoom Blur*, 0.3–0.5 s, letak
  tepat pada beat; atau manual: hujung A keyframe Scale 100→200% + motion blur,
  awal B Scale 200→100%. SFX whoosh.
- **Tips**: padankan titik tengah — objek di tengah klip A kena posisi yang sama
  dengan objek tengah klip B.

## 16. Green Screen
Buang latar (hijau/biru, atau AI) dan letak subjek atas latar lain.
- **Bila**: reaksi atas screenshot/berita, explainer, "saya di Paris".
- **CapCut**: Overlay → *Chroma Key* (pilih warna hijau, laras Intensity & Shadow)
  atau *Remove background* (tanpa skrin hijau).
- **ffmpeg**:
  ```bash
  ffmpeg -i latar.mp4 -i subjek_hijau.mp4 -filter_complex \
  "[1:v]chromakey=0x00FF00:0.15:0.05[fg];[0:v][fg]overlay=shortest=1" -c:a copy key.mp4
  ```
  Laras `0.15` (similarity) naik jika masih ada hijau, turun jika subjek berlubang.
- **Tips**: kain hijau tanpa kedut, cahaya rata, subjek ≥ 1 m dari latar, jangan
  pakai baju hijau.

## 17. Frame Break
Bingkai/skrin retak dan pecah berderai, subjek atau objek menerobos keluar.
(Beza dengan Frame Escape: di sini bingkai **pecah**.)
- **Bila**: hook kuat, "breaking the rules", sukan, pengumuman besar.
- **CapCut**: macam Frame Escape + Effects *Shatter* / *Glass break* / sticker
  kaca pecah pada saat tembus; *Shake* kuat 0.3 s; SFX kaca pecah.
- **Higgsfield**:
  ```
  [subject] punches through the video frame, glass shatters toward the camera,
  shards flying in slow motion, dramatic lighting, cinematic, 9:16 vertical
  ```

## 18. Digital Zoom
Crop-in (punch-in) kekal pada klip yang sama untuk tiruan "kamera kedua" —
bukan animasi.
- **Bila**: talking head satu kamera; tukar wide ↔ close setiap ayat.
- **CapCut**: split pada hujung ayat → klip seterusnya Scale 120–140%, posisi muka
  di 1/3 atas. Selang-seli wide/close.
- **ffmpeg** (punch-in 1.4×):
  ```bash
  ffmpeg -i in.mp4 -vf "crop=iw/1.4:ih/1.4,scale=1080:1920,setsar=1" -c:a copy close.mp4
  ```
- **Tips**: rakam 4K supaya crop kekal tajam.

## 19. Phone Mockup
Video/screen recording diletak dalam bingkai telefon, biasanya dipegang atau
terapung dengan bayang.
- **Bila**: demo app, tunjuk chat/komen, tutorial skrin, reaksi.
- **CapCut**:
  1. Latar: klip Nawal atau warna/gradient.
  2. Screen recording → Overlay, Scale & Mask *Rectangle* sudut bulat ikut skrin.
  3. Sticker/PNG bingkai telefon di atasnya (cari "phone frame" dalam Stickers).
  4. Animasi: masuk dari bawah (*Slide up*) + putaran 3D ringan; drop shadow.
- **Higgsfield**: jana klip tangan memegang telefon dengan skrin hijau, kemudian
  Chroma Key screen recording ke dalamnya:
  ```
  Close-up of a hand holding a modern smartphone with a solid green screen,
  slight natural hand movement, soft studio lighting, clean background, 9:16 vertical
  ```

## 20. Checklist
Kad senarai semak penuh (semua item serentak) — untuk ringkasan/recap di hujung
supaya orang *save* video. (Checklist Pop = item muncul satu-satu.)
- **Bila**: penutup video tips, "screenshot ni", senarai barang.
- **CapCut**: panel latar (Liquid Glass atau kad putih), tajuk besar, 3–7 item
  dengan ☐/✅, tahan 2–3 saat (cukup untuk screenshot). Teks "Save untuk nanti 📌".
- **Tips**: letak dalam zon selamat — elak 15% bawah dan bucu kanan (UI TikTok).

---

## Format jawapan

Bila Nawal minta efek tertentu:
1. Satu ayat: efek itu apa + sesuai untuk babak mana dalam video dia.
2. Langkah CapCut bernombor (ringkas).
3. Prompt Higgsfield (jika efek bergantung pada AI) — gunakan format skill `higgsfield`.
4. Resipi ffmpeg (jika ada) — hanya bila Nawal mahu draf automatik.
5. SFX & masa yang disyorkan.

Jika Nawal beri video, ikut skill `tiktok-video-wow` untuk analisis dahulu, kemudian
cadangkan efek dari katalog ini pada saat yang tepat dalam timeline.
