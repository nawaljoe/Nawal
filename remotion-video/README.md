# ZAKAT – Jangan Lupa Tanggungjawab Kita

Video TikTok animasi stickman minimalis (9:16, 1080×1920, 30 fps, tepat 60 saat) untuk
kempen zakat MAINJ. Semua visual, animasi, muzik dan SFX dibina secara programmatik
dengan **Remotion** (React) — boleh disunting semula sepenuhnya.

## Arahan

```console
npm i                                   # pasang dependensi
npm run dev                             # Remotion Studio (pratonton & sunting)
npm run render                          # render akhir -> out/zakat-tiktok.mp4
```

Studio memaparkan komposisi `ZakatVideo` (video penuh) dan folder `Scenes/` dengan
setiap babak sebagai komposisi tersendiri (connected compositions).

### Tukar suara latar

1. Ganti `assets/voiceover-original.m4a` dengan rakaman baharu.
2. Kemas kini teks yang dituturkan dalam `SCENES` di `scripts/prepare_vo.py`
   (teks ini juga menjadi sari kata), dan `BOUNDARY_HINTS` (saat akhir setiap babak
   dalam rakaman asal).
3. `npm run audio` — jana semula `public/audio/vo.wav`, `src/timing.json` dan muzik.

Semua animasi dan SFX diikat pada perkataan yang dituturkan melalui `cue(scene, "perkataan")`,
jadi masa visual ikut secara automatik.

## Struktur projek

```
src/
  ZakatVideo.tsx          video penuh: 5 babak + sari kata + VO + muzik (ducking automatik)
  Root.tsx                pendaftaran komposisi
  theme.ts                palet 4 warna, font, safe zone TikTok
  timing.ts / timing.json masa babak & perkataan (dijana oleh prepare_vo.py)
  anim.ts                 pembantu animasi: pop (overshoot), settle, jumpArc, squash
  components/
    Stickman.tsx          watak stickman boleh guna semula: pose, ekspresi, squash & stretch
    track.ts              poseTrack / faceTrack / numTrack (keyframe)
    Icons.tsx             ikon garis dengan "hand-drawn line reveal"
    Typography.tsx        PopWords (kinetic), MaskReveal (animated masking), StrikeText, Pill
    SceneShell.tsx        whip pan + motion blur, zoom-through, Camera (zoom/pan/shake), Stage
    Subtitles.tsx         sari kata perkataan demi perkataan (dalam safe zone)
    Sfx.tsx               <Sfx name="pop" at={frame}/> dengan aras bunyi lalai
    Background.tsx        latar kertas + grid titik parallax
  scenes/                 Scene1Hook … Scene5Cta
scripts/
  prepare_vo.py           bersihkan VO, pendekkan jeda, tempo seragam, masa perkataan
  make_audio.py           sintesis semua SFX + muzik latar (3 bahagian mood)
  transcribe.mjs          transkripsi whisper.cpp (Bahasa Melayu)
  stills.mjs              helaian kawalan kualiti (contact sheet)
public/
  audio/                  vo.wav, music.wav, sfx/*.wav
  fonts/                  Montserrat ExtraBold, Poppins Medium/Bold (+ lesen OFL)
assets/voiceover-original.m4a   rakaman asal
```

## Audio & lesen

| Aset | Sumber | Lesen |
|---|---|---|
| Suara latar | Rakaman asal pemilik projek (`assets/voiceover-original.m4a`), dibersihkan & dipadatkan ke 60 s (tempo ×1.07, pic dikekalkan) | Milik pemilik projek |
| Muzik latar (`music.wav`) | Disintesis dalam kod (`scripts/make_audio.py`): playful → muhasabah → uplifting | Karya asal, tiada lesen pihak ketiga — bebas untuk TikTok / media sosial |
| SFX: whoosh, swipe, pop, cash register, coin, notification, tick, clock, record scratch, impact, cinematic hit, paper flip, shimmer, rise | Disintesis dalam kod (`scripts/make_audio.py`) | Karya asal, tiada lesen pihak ketiga |
| Font Montserrat & Poppins | @fontsource (Google Fonts) | SIL Open Font License 1.1 (`public/fonts/LICENSE-*.txt`) |

Tiada audio pihak ketiga digunakan, jadi tiada isu hak cipta semasa muat naik.

## Nota

- Identiti MAINJ pada end card ialah *wordmark* tipografi (`MainjBadge` dalam
  `scenes/Scene5Cta.tsx`). Untuk logo rasmi, letak fail di `public/brand/mainj-logo.png`
  dan hantar `logo="brand/mainj-logo.png"` kepada `MainjBadge`.
- Skrin pembayaran menunjukkan contoh RM 106.25 (2.5% daripada gaji contoh RM 4,250).
