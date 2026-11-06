# Program Semarak Subuh Johor 2026 — *3 Amalan Yang Tidak Terhitung Banyaknya*

Video 9:16 (1080×1920, 30 fps, H.264, ~62 s) untuk TikTok / Instagram Reels / Facebook Reels.
Dibina semula sepenuhnya dengan **Remotion** (penyuntingan, peralihan, kapsyen, campuran audio) dan
**HyperFrames** (semua grafik gerak: kenyataan pembuka, tajuk, pendedahan kata kunci, popup hadis, penutup).

## Struktur cerita

| # | Babak | Visual | Suara / bunyi | Grafik (HyperFrames) | Peralihan masuk |
|---|---|---|---|---|---|
| 1 | Pembukaan (0–5 s) | Foto udara masjid waktu fajar, push-in | Ustaz: "…yang tidak terhitung" + impak rendah | `opening.html` — "Ada amalan yang ganjarannya **tidak terhitung**…" (perkataan emas mendarat pada suara ustaz) | — |
| 2 | Pengenalan | Jemaah (slow-mo 0.75×) | Muzik naik, impak pada "3 AMALAN" | `title.html` — bintang khatam dilukis, PROGRAM SEMARAK SUBUH JOHOR 2026, **3 AMALAN** | light leak (fajar → jemaah) |
| 3 | Amalan pertama: PUASA | Ustaz + B-roll | Ustaz | `keyword.html` (mood `puasa`, wipe bertepi emas) + `ayat.html` (hadis qudsi, rasm Uthmani) | fade |
| 4 | Amalan kedua: SABAR | Close-up ustaz, foto jamuan & doa | Ustaz; muzik bertukar (satu-satunya perubahan muzik) | `keyword.html` (mood `sabar`, buka perlahan dari tengah) | linear blur |
| 5 | Amalan ketiga: MEMAAFKAN | Foto bersalam, video berjabat tangan (slow-mo) | Ustaz | `keyword.html` (mood `maaf`, huruf demi huruf) | fade |
| 6 | Penutup | Papan tanda masjid, ustaz, jemaah | Ustaz: "…untuk terus melakukan kebaikan itu." | — | blur slide |
| 6b | Rumusan | Foto seluruh jemaah | Riser → impak (sekali sahaja) | `closing.html` — PUASA \| SABAR \| MEMAAFKAN + "Teruskan melakukan kebaikan." | fade |
| 7 | Outro | Outro asal Fared Khalid (tidak diubah) | Bunyi outro asal | — | fade |

## Struktur projek

```
semarak-subuh-2026/
├─ src/                         Remotion
│  ├─ SemarakSubuh.tsx          komposisi utama (TransitionSeries 8 babak, logo, muzik, SFX)
│  ├─ Root.tsx, index.ts
│  ├─ theme.ts, types.ts        palet (hitam, charcoal, emas antik, putih hangat) & jenis data
│  ├─ components/               komponen boleh guna semula
│  │  ├─ KeywordCaptions.tsx    kapsyen Melayu 2 baris, kata kunci emas, dalam zon selamat 9:16
│  │  ├─ PunchFootage.tsx       klip ustaz dengan punch-in setiap potongan + push perlahan
│  │  ├─ Broll.tsx              BrollItem (dissolve zoom-blur, slow-mo) & KenBurnsPhoto (foto 3:2 → 9:16)
│  │  ├─ HFOverlay.tsx          memainkan plat HyperFrames lutsinar (VP9 + alpha)
│  │  ├─ LightLeakOverlay.tsx   light leak @remotion/effects (hangat, sekali)
│  │  ├─ Sound.tsx              MusicBed (envelope ducking) & SfxTrack
│  │  └─ Logo.tsx               plat jenama asal (tidak diubah)
│  └─ data/                     timeline.json & scenes.json (dijana oleh pipeline)
├─ hyperframes/                 HyperFrames (HTML + GSAP → video lutsinar)
│  ├─ opening.html  title.html  keyword.html  ayat.html  closing.html
│  ├─ common.css                token reka bentuk bersama
│  └─ assets/                   fon (Cinzel, Cormorant, Montserrat, Amiri Quran) & SFX
├─ pipeline/
│  ├─ story.json                potongan sumber bagi setiap babak (masa dalam saat)
│  ├─ captions.json             kapsyen (hanya ayat yang disahkan konsensus ASR)
│  ├─ assemble_scenes.py        potong master + suara kepada klip setiap babak
│  ├─ build_timeline.py         timeline.json + render overlay HyperFrames dengan masa tepat
│  ├─ master.sh                 loudness akhir −14 LUFS / −1.5 dBTP
│  └─ prep/                     penyediaan sumber: grade, stabilize, audio studio, transkripsi,
│                               pengesan batuk (AST), undian ASR, MusicGen
└─ public/                      media (tidak di-commit — lihat "Media")
```

## Media (tidak di-commit)

Footage asal ada dalam folder Google Drive program (Main/`1104.mp4`, B-roll) dan album Google Photos.
Fail dalam `public/` dijana oleh `pipeline/prep/` (grade G3, stabilize vidstab, audio studio) dan
`pipeline/assemble_scenes.py`. `public/logo.png` ialah plat jenama asal.

## Preview

```bash
npm install
npm run studio            # Remotion Studio: preview penuh dengan scrub
npm run still             # satu frame ke out/still.png
# HyperFrames: render satu plat untuk lihat
cd hyperframes && npx hyperframes render -c keyword.html --format webm \
  --variables '{"num":"02","label":"AMALAN KEDUA","word":"SABAR","mood":"sabar","tWord":0.5,"dur":3}'
```

## Render semula

```bash
npm run scenes            # (jika potongan dalam pipeline/story.json berubah)
npm run timeline          # timeline + plat HyperFrames (cache ikut pemboleh ubah)
npm run render            # out/raw.mp4
npm run master            # out/SemarakSubuh2026_9x16.mp4  (−14 LUFS, video disalin)
```

Untuk tukar teks: `pipeline/captions.json` (kapsyen), pemboleh ubah dalam `pipeline/build_timeline.py`
(kenyataan pembuka, kata kunci, renungan penutup), kemudian `npm run timeline && npm run render`.

## Ketepatan kandungan

- Kapsyen hanya untuk ayat yang dipersetujui berbilang model ASR (Whisper large-v3 & model Whisper Bahasa Melayu,
  audio asal & audio dibersihkan). Bahagian yang tidak pasti dipotong, bukan direka.
- Teks Arab: hadis qudsi *كُلُّ عَمَلِ ٱبۡنِ ءَادَمَ لَهُۥ إِلَّا ٱلصِّيَامَ فَإِنَّهُۥ لِى وَأَنَا۠ أَجۡزِى بِهِۦ*
  (Riwayat al-Bukhari & Muslim), rasm Uthmani dengan hamzah wasal — **sila sahkan dengan ustaz sebelum terbit**.
- Muzik: dijana secara tempatan dengan MusicGen (tiada perkusi) kerana katalog muzik HeyGen memerlukan log masuk;
  untuk guna katalog: `npx hyperframes auth login`, kemudian ganti `public/music/bed.wav`.
- SFX: pustaka HyperFrames (`hyperframes/assets/sfx/CREDITS-bundled.md`).
