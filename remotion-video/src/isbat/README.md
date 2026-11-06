# ISBAT — komposisi Remotion

| Komposisi | Data | Tempoh |
|---|---|---|
| `IsbatPart1` | `timeline.json` | 26 s (dengan hook) |
| `IsbatPenuh` | `timeline_penuh.json` | 1:51 (semua isi raw, tanpa hook) |

Kedua-duanya dirender oleh komponen generik `IsbatVideo.tsx`. Komponen ini menerima timeline sebagai prop dan menyokong hook pilihan, tajuk B-roll, kad fakta (`panels`), pendedahan ISBAT dan kad penutup.

| Fail | Peranan |
|---|---|
| `timeline.json` | **Sumber tunggal**: potongan shot, keyframe zoom, teks hook/tajuk/kad, subtitle per perkataan, aras audio dan SFX. Projek `hyperframes-video` juga membaca fail ini. |
| `anim.ts` | Fungsi easing, keyframe, dan transform crop/zoom untuk footage ustaz (membuang bar kabur, fokus pada wajah) dan B-roll. |
| `Text.tsx` | Baris teks bergaya (Inter Display, biru/emas/putih, kotak highlight). |
| `IsbatVideo.tsx` | Semua lapisan: footage → look → hook → tajuk → tag siri → kad fakta → ISBAT → subtitle → kad penutup → audio. |

Aset berada di `public/isbat/`: footage yang sudah dipotong, stem audio, font dan freeze frame.

```bash
cd remotion-video
npx remotion studio                       # pratonton & sunting
npx remotion render IsbatPart1 out/IsbatPart1.mp4 --codec=h264 --crf=16 --audio-bitrate=256k
# dalam sesi cloud: tambah --browser-executable=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell
```

## Stem audio
Ketiga-tiga stem dan SFX, apabila dijumlahkan, menghasilkan mix akhir: −14.2 LUFS, puncak −1.1 dBFS.
- `dialog.wav`: suara ustaz selepas pembersihan filler dan rantaian podcast.
- `music.m4a`: muzik latar dengan ducking sudah dibakar.
- `ambience.m4a`: ambien B-roll dengan J/L-cut.
