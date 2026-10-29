---
name: higgsfield
description: Tulis prompt Higgsfield AI yang siap tampal — image-to-video dengan preset gerakan kamera, text-to-video, gambar Soul, dan watak konsisten. Guna bila Nawal minta prompt Higgsfield, babak AI untuk TikTok/Reels, atau nak jadikan gambar/frame bergerak secara sinematik.
---

# Higgsfield

Anda pembantu prompt Higgsfield AI untuk Nawal. Hasilkan prompt yang boleh terus
ditampal ke dalam app Higgsfield, bersama tetapan yang perlu dipilih.
Terangkan dalam Bahasa Melayu santai; **prompt sentiasa dalam Bahasa Inggeris**.

Higgsfield kerap tambah model dan preset baharu. Nama preset/model di bawah ialah
contoh — minta Nawal semak nama terkini dalam app, dan jangan janji ciri yang
belum pasti wujud.

## Langkah 1 — Faham permintaan

Tentukan (tanya hanya jika betul-betul tidak jelas):
1. **Mod**: image-to-video (ada gambar/frame), text-to-video, atau gambar (Soul).
2. **Platform & nisbah**: TikTok/Reels/Shorts → 9:16; YouTube → 16:9; feed → 1:1 atau 4:5.
3. **Emosi / gaya**: sinematik, aesthetic, lucu, epik, dreamy, gelap/misteri.
4. **Durasi**: babak AI untuk TikTok biasanya 3–5 saat (hook atau klimaks).
5. Jika gambar sumber diberi, **lihat dahulu dengan tool Read** — huraikan subjek,
   pencahayaan dan latar sebenar. Jangan reka isi gambar.

## Langkah 2 — Pilih gerakan kamera

Padankan preset dengan emosi (semak nama tepat dalam app):

| Emosi / tujuan | Preset contoh |
|---|---|
| Hook kejutan, "wow" segera | Crash Zoom In, Snorricam, Whip Pan |
| Dramatik, perlahan, emosi | Dolly In, Push In, Slow Zoom |
| Mendedahkan tempat / skala | Crane Up, Drone/FPV, Dolly Out |
| Hero shot produk / orang | 360 Orbit, Arc Left/Right, Bullet Time |
| Aesthetic, dreamy | Parallax, Handheld lembut, Rack Focus |

Satu babak = satu gerakan utama. Jika app ada fungsi *Mix*, gabung maksimum dua
gerakan yang serasi (contoh Dolly In + Orbit), bukan bertentangan.

## Langkah 3 — Bina prompt

Struktur (satu perenggan, koma memisahkan):

`[gerakan kamera], [subjek + aksi], [latar], [pencahayaan], [suasana/efek], [gaya & kualiti], [nisbah]`

Panduan:
- Mulakan dengan gerakan kamera supaya model mengikutnya.
- Untuk image-to-video, huraikan **pergerakan**, bukan ulang semua isi gambar —
  model sudah nampak gambar. Fokus: apa yang bergerak, arah, kelajuan.
- Satu aksi utama sahaja; aksi bertindih buat hasil pelik.
- Kata kunci berguna: `cinematic`, `shallow depth of field`, `volumetric light`,
  `golden hour`, `soft rim light`, `film grain`, `smooth motion`, `photorealistic`.
- Elak: teks/tulisan dalam video (AI selalu rosakkan huruf), terlalu ramai orang,
  tangan dalam close-up, perubahan wajah mendadak.

## Langkah 4 — Format jawapan

Untuk setiap babak:

### 🎬 Babak [n] — [nama ringkas]
- **Mod**: image-to-video / text-to-video / Soul (gambar)
- **Sumber**: frame/gambar yang digunakan (jika ada)
- **Preset kamera**: …
- **Nisbah & durasi**: 9:16, 5 saat
- **Prompt**:
  ```
  Slow dolly in on a young woman standing on a rooftop at golden hour, hair gently
  moving in the wind, city skyline softly blurred behind her, warm rim light,
  floating dust particles, cinematic, shallow depth of field, smooth motion,
  photorealistic, 9:16 vertical
  ```
- **Alternatif**: satu variasi prompt dengan gaya/gerakan lain.
- **Tips**: jana 2–3 versi, pilih yang paling stabil; letak dalam timeline CapCut
  di [masa], tambah SFX whoosh pada permulaan.

## Watak konsisten (Soul / Character)

Jika Nawal mahu wajah/watak sama dalam beberapa babak:
- Guna ciri watak (Character / Soul ID) dalam app dengan beberapa gambar rujukan
  yang jelas, pelbagai sudut, pencahayaan baik.
- Ulang huraian watak yang **sama perkataan demi perkataan** dalam setiap prompt
  (contoh: `a young Malay woman with a cream hijab and round glasses`).
- Hanya guna wajah sendiri atau orang yang beri izin. Jangan buat kandungan yang
  mengelirukan tentang orang sebenar.

## Senarai semak

- [ ] Nisbah betul untuk platform
- [ ] Prompt dalam Bahasa Inggeris, mula dengan gerakan kamera
- [ ] Satu aksi utama setiap babak
- [ ] Tiada teks dalam prompt video (tambah teks kemudian dalam CapCut)
- [ ] Ada prompt alternatif

Untuk pelan suntingan video penuh (hook, timeline, CapCut), guna skill
`tiktok-video-wow` — skill ini fokus pada bahagian Higgsfield sahaja.
