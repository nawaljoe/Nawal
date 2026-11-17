# Sijil Halal Ditarik — TikTok edit

Edit of `video_20260814_093020.mp4` (interview with Ustaz Mohamad Yusof bin Mahmod,
Auditor Syariah, Bahagian Pengurusan Halal JAINJ) into a vertical TikTok: ~76 s main cut plus the 10 s FK outro.

- `plan/index.html` — the approved plan: hooks, storyboard, timeline, transcript, motion-graphics plan.
- `pipeline/` — reproducible build (`./run.sh <source.mp4> <workdir> <beep.mp4> <logo.png> <outro.mp4>`).
- `hyperframes/` — typography layer (captions, hook, question pop-up, lower third, chapter tags and wipe, chips, emphasis).
- `../remotion-video/src/sijil-halal/` — infographic layer (Dua Kategori, Notis Syarikat, Senarai Premis, end card).

## Tool split

| Tool | Job |
| --- | --- |
| FFmpeg | decode and rotate, colour grade, cuts, audio clean-up and mix (−14 LUFS), final H.264 encode |
| OpenCV | face tracking so punch-ins stay centred (max 1.30×) |
| Whisper large-v3 | Malay transcript, cut-point verification, word timing on the finished edit |
| HyperFrames | all text on screen, rendered as transparent ProRes 4444 |
| Remotion | four infographic components, rendered as transparent ProRes 4444 |

All three visual layers read one file, `timeline.json`, built by `pipeline/timeline.py`.

## Editorial notes

- Hook A: the cold open uses "Syarikat dah tutup, tak bagitahu…" (55.6 s in the source); the line returns at 0:49 as the payoff.
- The question card leaves out the interviewer's "on the spot", because the Ustaz does not confirm on-the-spot revocation.
- At 84.6 s the Ustaz says "barang yang halal" and immediately corrects himself to "barang yang haram, barang yang tidak halal". The slip is cut so the line keeps his intended meaning.
- Removed as repetition: "Itu antara punca-punca…" (59.6–66.7 s), "macam apa lagi", the second "Itu bila bawa masuk".
- No music: the creator adds a TikTok library sound at upload. Voice and SFX are mixed to −14 LUFS.

## v2 changes (creator feedback)

- Interviewer's voice removed. After the hook: one short 1 kHz beep (0.4 s) over the colour-bar clip, then a pop-up question card ("Kesalahan apa yang boleh buat sijil halal ditarik?") over the Ustaz listening, with room tone only.
- Podcast-studio look: cooler shadows, warm skin, rolled-off highlights, and a soft key-light falloff centred on the face so the office walls and table fall into shadow.
- Punch-ins capped at 1.08× (was 1.30×) so the face is never too large.
- Creator logo overlay (Johor crest, Maju Johor, Fared Khalid watermark) on the whole main cut except the beep; FK outro appended at the end.
- End card shortened to 2.5 s because the outro follows.
