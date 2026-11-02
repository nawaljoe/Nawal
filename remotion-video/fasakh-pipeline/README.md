# Pipeline video Fasakh

Langkah (jalankan dari folder kerja yang ada `src/video.mp4`):

1. `transcribe.py` / `transcribe_verbatim.py` — Whisper large-v3-turbo, timestamp perkataan (verbatim tangkap "eee", ulangan).
2. `plan_cuts.py` — senarai potongan gagap/salah mula + mampatan jeda (Silero VAD) → `cuts.json`.
3. `make_mask.py` + `render_base.py` — gred warna premium + relight, potong & sambung → `base_video.mp4`, `voice_raw.wav`.
4. `voice.sh` — bersihkan suara (highpass, denoise, EQ, kompresor) ke -15 LUFS → `voice.wav`.
5. `captions.py` — kapsyen dengan ejaan dibetulkan → `src/fasakh/captions.json`.
6. `sfx.py` (atau `sfx_elevenlabs.py` jika ada `ELEVENLABS_API_KEY`) — kesan bunyi lembut.
7. `hyperframes-hook/` — tajuk intro; `npx hyperframes render --format mov -q delivery -o hook.mov`.
8. Salin `base_video.mp4`, `voice.wav`, `hook.mov`, `sfx/*.wav` ke `public/fasakh/`, kemudian `npx remotion render Fasakh out.mp4`.
9. `master.sh` — master akhir -14 LUFS.

Media besar (`public/fasakh/`) tidak disimpan dalam git.

## Hook, beep, logo & outro

- Hook (cold open) dan beep bar warna dimasukkan dalam `cuts.json` (`hook: true`, `beep: true`).
- Segmen beep: `beep.mp4` → skala/crop 1080x1920, dipad ke 63 bingkai; audio beep → `sfx/beep_bars.wav` (-19 LUFS).
- `public/fasakh/logos.png` (overlay penuh 1080x1920) dipapar dari mula isi hingga outro.
- `public/fasakh/outro.mp4` (outro FK, 10 s) disambung selepas kad penutup.

## Gaya podcast: popup bila ustaz tunduk, soundtrack, nama

- `lookdown.py` — MediaPipe Face Landmarker (blendshape `eyeLookDown`) pada `base_video.mp4`; selang
  > 0.6 selama ≥ 2 s dijadikan popup (`POPUPS` dalam `Fasakh.tsx`), bacaan Seksyen 53 → senarai semak mod fokus.
- `music.py` — soundtrack calm disintesis (pad + piano lembut + sub, reverb), kemudian ducking:
  `sidechaincompress` dengan `voice.wav`, senyap semasa beep, -28 LUFS → `public/fasakh/music_bed.wav`.
- Lower-third nama ustaz dipapar semasa hook.

## Latar kabur (mod potret)

- `bg_blur.py base_video.mp4 selfie_multiclass_256x256.tflite base_video_blur.mp4` — segmentasi orang
  MediaPipe; ustaz dan meja (bawah y≈1312) kekal tajam, latar dikaburkan (normalised-convolution supaya
  tiada halo). Frame beep (232–295) tidak disentuh. Hasil disalin sebagai `public/fasakh/base_video.mp4`.
