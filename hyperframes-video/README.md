# ISBAT Part 1 — versi HyperFrames

Ini video TikTok **ISBAT – Elaun Galakan Menghafaz al-Quran (Part 1)** yang dibina semula sebagai komposisi [HyperFrames](https://hyperframes.heygen.com): HTML, CSS dan GSAP yang dirender menjadi MP4.

## Cara ia disusun
- `scripts/build.mjs` menjana `index.html` daripada **`../remotion-video/src/isbat/timeline.json`**. Fail data yang sama digunakan oleh versi Remotion.
- **Jangan sunting `index.html` secara terus.** Sunting `timeline.json`, kemudian jalankan semula `node scripts/build.mjs`.
- `assets/` ialah symlink ke `../remotion-video/public/isbat` (footage, stem audio, font), supaya fail besar tidak disimpan dua kali.
  - Di Windows tanpa sokongan symlink, salin folder itu ke `assets/`.

## Arahan
```bash
node scripts/build.mjs                       # jana index.html daripada timeline.json
npx --yes hyperframes@0.9.19 check           # lint + layout + motion + contrast
npx --yes hyperframes@0.9.19 snapshot --at 1,8,16,24
npx --yes hyperframes@0.9.19 preview --background   # Studio
npx --yes hyperframes@0.9.19 render -o renders/IsbatPart1_hyperframes.mp4 --quality high
```

## Lapisan dalam `index.html`
| Lorong (track) | Isi |
|---|---|
| 1 | Shot footage: ustaz, B-roll, freeze frame, latar kad penutup. Zoom/crop dianimasi GSAP (x/y/scale) dan disampel setiap 2 frame, jadi lengkungnya sama dengan Remotion. |
| 2 | Vignette dan gradien biru tua |
| 3–4 | Hook, overlay B-roll dan tajuk "ELAUN GALAKAN MENGHAFAZ AL-QURAN" |
| 5 | Tag siri "ELAUN ISBAT · PART 1" |
| 6–7 | Pendedahan "ISBAT" dan kad penerangan |
| 8 | Subtitle: satu klip setiap ayat. Highlight perkataan ditukar oleh GSAP `set` pada pemboleh ubah CSS `--on`. |
| 9–10 | Kad penutup "SIAPA YANG LAYAK MENERIMA ELAUN ISBAT?" dan teaser Part 2 |
| 20–31 | Audio: dialog ustaz (gaya podcast), muzik (ducking sudah dibakar), ambien B-roll dan 9 SFX |

## Status `check`
0 ralat. Kontras 21/21 lulus WCAG AA. Motion dan Craft 0 amaran. Baki amaran hanyalah cadangan struktur, iaitu memecahkan komposisi kepada sub-komposisi (`nested_structure_needs_subcomposition`, `timeline_track_too_dense`). Ia tidak menjejaskan hasil render.
