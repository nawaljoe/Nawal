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
