# Tazkirah: Langkah ke Masjid — edit plan & QC record

Source: 83.4 s vertical phone video, 474×850 H.264 @ 59.94 fps, AAC 62 kb/s stereo (recorded off the mosque PA).
Delivery: 72.1 s, 1080×1920, 30 fps, H.264 High, AAC 320 kb/s, −14 LUFS.

## 1. What the inspection found

| | Finding |
|---|---|
| Audio noise | Constant floor at −34 dB under every pause; **50 Hz mains hum** with harmonics 100/150/200 Hz (Malaysia's grid); faint PA ring near 926 Hz |
| Audio tone | Thin body (90–250 Hz ~17 dB under the 250–500 Hz band), dull top (speech rolls off ~3.5 kHz, lossy 62 kb/s AAC) |
| Audio level | −16.4 LUFS, LRA 7.4 LU, peaks −0.6 dBFS |
| Dead air | 25.5 s below speech level in total; long gaps at 0–3.2, 8.7–12.3 and 47.5–51.3 s |
| Picture | One handheld static shot, no scene cuts; face drifts x 0.44–0.58; lime-green wall cast, white robe reads pink, low saturation (13.6) |
| Content | Hook question → which needs treating, legs or heart → lecture theme → Surah At-Taubah 9:18 recited → its Malay meaning |

## 2. Audio processing chain (`pipeline/build_audio.sh`)

1. Extract mono 48 kHz float.
2. **DeepFilterNet3** AI speech enhancement (removes hum, PA noise, hiss; floor −34 → −67 dB).
3. 24 dB/oct high-pass 70 Hz (rumble, mic bumps).
4. EQ: +3 dB @160 Hz (warmth), −2.5 dB @450 Hz (boxiness), −2 dB narrow @926 Hz (PA ring), +2.5 dB @3.2 kHz (presence), +1.5 dB shelf @7 kHz.
5. Soft expander (max −12 dB), 3:1 compression (−26 dB threshold), light split-band de-esser.
6. Cut to the EDL with 12 ms ramps (every cut sits in a pause).
7. Static gain to −14 LUFS + look-ahead limiter on rare plosive peaks (no dynamic loudnorm, so no pumping). No reverb, no music.

| Measure | Original | Master |
|---|---|---|
| DNSMOS SIG (voice quality, 1–5) | 1.33 | 2.58 |
| DNSMOS BAK (background, 1–5) | 1.29 | 3.09 |
| DNSMOS OVRL | 1.16 | 2.08 |
| Integrated loudness | −16.4 LUFS | −14.0 LUFS |
| Loudness range | 7.4 LU | 3.9 LU |

Music: none. The voice and a Quran recitation carry the piece; music would compete with both.

## 3. Editing timeline (`pipeline/edl.json`, `pipeline/camera.py`)

| Out (s) | Source (s) | Speech | Framing |
|---|---|---|---|
| 0.0–5.9 | 3.07–8.97 | "Yang sakit… kaki ke hati?" (hook, title card) | Medium-close 1.40→1.46, slow push |
| 5.9–13.6 | 12.10–19.80 | "Yang apa nama… mana?" | Wide 1.00→1.06 (context) |
| 13.6–20.9 | 19.80–27.07 | "Kaki kah… ataupun hati…" | Medium 1.30→1.36 |
| 20.9–26.8 | 28.00–33.90 | "Justeru pada pagi ini…" | Gentle pull-back 1.10→1.02 |
| 26.8–34.3 | 33.90–41.40 | Lecture theme + "Allah SWT memberikan jawapan…" | Slow push-in 1.22→1.40 |
| 34.3–39.6 | 42.40–47.73 | "Dalam surah At-Taubah, ayat 18." | Ease back 1.30→1.22 |
| 39.6–57.05 | 50.97–68.42 | Recitation of 9:18 (Arabic verse card) | Wide 1.00→1.10, very slow |
| 57.05–59.1 | 68.42–70.47 | "Itu maksudnya." | Medium 1.32→1.36 |
| 59.1–62.2 | 71.20–74.33 | "Sesungguhnya, orang yang memakmurkan masjid," | Close 1.40→1.45 |
| 62.2–70.5 | 75.10–83.37 | "…beriman kepada Allah dan hari akhir." | 1.12→1.30 slow push |
| 70.5–72.1 | (hold) | — | Fade to black, gold star |

Removed: 12.9 s of silence only (opening 3 s, two ~3.5 s gaps, four 0.75–1 s gaps). Speech order unchanged; no word cut.
Every time cut coincides with a framing change, so jump cuts read as camera changes. Framings are anchored to the tracked face per shot.

Grade (ffmpeg): yellow/green hue −8° and −40 % sat (wall), 5900 K warm mix, gentle S-curve, +5 % contrast and saturation. Light hqdn3d + lanczos ×3.4 upscale to a 1620×2880 plate so punch-ins downsample.

## 4. Motion graphics (HyperFrames + GSAP)

- Opening: "TAZKIRAH" kicker in gold + "Langkah ke Masjid" (Cormorant Garamond), already on frame 0 for the thumbnail; leaves at 5 s.
- Subtitles: Plus Jakarta Sans 700, white, selected words soft gold `#EBCB86`, translucent dark box, max 2 lines, bottom of the TikTok safe band (above y = 1330), one group at a time, 0.24 s fade.
- Verse card: Amiri, all five lines faint from the start; each lights gold as recited, then settles to warm white; "Surah At-Taubah · Ayat 18".
- Ending: 1.4 s ease to black with a small gold eight-point star.

## 5. Transcript: points for a human to confirm

Words were checked by forced decoding against OpenAI Whisper and the Mesolitica Malaysian Whisper model. Please listen to these:

1. 30.0 s: "sebab dia sebut tadi" is the best-scoring reading, but this phrase is partly unclear.
2. 31.2–33.7 s: "kuliah saya, kuliah saya…" is followed by one unclear word, which is left out rather than guessed.
3. 36.0 s: spoken as colloquial "ubat be' hati yang malas", written here as "ubat bagi hati yang malas".
4. 69.4 s: a short unclear fragment after "Itu maksudnya." is left out.
5. 82.0 s: both models hear "hari akhir" (not "akhirat"), so the subtitle follows the audio.

Edit `pipeline/transcript_ms.json`, then run `python3 pipeline/build_compositions.py` and re-render.

## Rebuild

```bash
./pipeline/build_audio.sh <source.mov>      # assets/voice_master.wav
./pipeline/build_plate.sh <source.mov>      # assets/plate.mp4
python3 pipeline/camera.py && python3 pipeline/build_compositions.py
npx hyperframes check && npx hyperframes render --quality delivery -o renders/hf_render.mp4
./pipeline/export_final.sh                  # renders/tausiah_final_1080x1920.mp4
```
