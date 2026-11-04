# Video Kuliah — "Amalan yang Ganjarannya Tiada Batas"

Video sinematik 9:16 (1080×1920, 30fps, ~4 min 28 s) daripada rakaman kuliah di
Masjid Jamek Batu 10, Skudai. Suasana tenang: gred warna lembut, dissolve perlahan,
zoom perlahan, butiran filem, dan latar ambien yang jauh di bawah suara ustaz.

## Struktur

| Bahagian | Alat | Fail |
| --- | --- | --- |
| Intro & outro (tajuk, basmalah, penutup) | HyperFrames | `../hyperframes-kuliah/compositions/{intro,outro}.html` |
| Suntingan utama, B-roll, kad bab, petikan hadis/ayat, kapsyen | Remotion | `src/kuliah/` (komposisi `Kuliah`) |
| Jernihkan suara & transkrip | ElevenLabs (Voice Isolator + Scribe) | `../voiceover/jernihkan_suara.py`, `../voiceover/transkrip_scribe.py` |
| Muat turun, gred, audio, render intro/outro | ffmpeg | `scripts/siapkan_media.sh` |

Susunan klip (`src/kuliah/timeline.json`):

1. Intro (HyperFrames)
2. m1 — pembukaan *Innal hamdalillah*
3. m2 — amalan yang ganjarannya tidak disebut
4. m4 — bandingan: pahala membaca al-Quran disebut
5. m7 — **Amalan Pertama: Puasa** (hadis qudsi)
6. m5, m3 — **Amalan Kedua: Sabar** (musibah, syukur & sabar)
7. m6 — **Amalan Ketiga: Memaafkan** (asy-Syura: 40)
8. Outro (HyperFrames)

Semua masa (klip, B-roll, kad bab, petikan) diubah dalam `timeline.json` sahaja.

## Cara jana semula

```bash
cd remotion-video
export ELEVENLABS_API_KEY=...        # pilihan, tapi disyorkan
bash scripts/siapkan_media.sh        # muat turun dari Drive, gred, audio, intro/outro
npx remotion studio                  # pratonton
npx remotion render Kuliah out/kuliah.mp4 --crf=18
```

Dengan `ELEVENLABS_API_KEY`, skrip menggunakan **Voice Isolator** untuk suara ustaz
dan **Scribe** untuk transkrip, lalu `scripts/bina_kapsyen.py` menulis
`src/kuliah/captions.json` — kapsyen perkataan demi perkataan muncul sendiri.
Tanpa kunci, suara dijernihkan dengan penapis ffmpeg dan kapsyen dibiarkan kosong.
