# Video Kuliah — "Amalan yang Ganjarannya Tiada Batas"

Video sinematik 9:16 (1080×1920, 30fps, ~4 min 52 s) daripada rakaman kuliah
Program Semarak Subuh 2026 di Masjid Batu 10, Skudai. Suasana tenang: gred warna lembut, dissolve perlahan,
zoom perlahan, butiran filem, dan latar ambien yang jauh di bawah suara ustaz.

## Struktur

| Bahagian | Alat | Fail |
| --- | --- | --- |
| Intro & outro (tajuk, basmalah, penutup) | HyperFrames | `../hyperframes-kuliah/compositions/{intro,outro}.html` |
| Suntingan utama, B-roll, kad bab, petikan hadis/ayat, kapsyen | Remotion | `src/kuliah/` (komposisi `Kuliah`) |
| Jernihkan suara & transkrip | ElevenLabs (Voice Isolator + Scribe) | `../voiceover/jernihkan_suara.py`, `../voiceover/transkrip_scribe.py` |
| Muat turun, gred, audio, render intro/outro | ffmpeg | `scripts/siapkan_media.sh` |

Susunan klip (`src/kuliah/timeline.json`):

1. **Hook** — m7 26.75–35.72 s: ustaz membaca hadis qudsi *"…dan Akulah yang
   membalasnya"*, dengan teks "Ada amalan yang pahalanya tidak disebut… kerana
   Allah sendiri yang membalasnya."
2. Peralihan glitch (`public/brand/glitch-asal.mp4`)
3. Intro (HyperFrames)
4. m1 — pembukaan *Innal hamdalillah*
5. m2 — amalan yang ganjarannya tidak disebut
6. m4 — bandingan: pahala membaca al-Quran disebut
7. m7 — **Amalan Pertama: Puasa** (hadis qudsi)
8. m5, m3 — **Amalan Kedua: Sabar** (musibah, syukur & sabar)
9. m6 — **Amalan Ketiga: Memaafkan** (asy-Syura: 40)
10. Kad penutup "Semoga Bermanfaat" (HyperFrames)
11. Outro FK (`public/brand/FK_OUTRO.mp4`)

Logo (jata Johor, Maju Johor, tera air FK) dipapar sepanjang video kecuali
semasa glitch dan outro FK. Semua teks diletak di atas tera air FK (y 1510–1559).

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
Tanpa kunci, suara dijernihkan secara lokal dengan DeepFilterNet3
(`../voiceover/jernihkan_dfn.py`) dan kapsyen dibiarkan kosong.

Peralihan: **glow** (cahaya hangat) masuk bab baharu, **blur** (fokus lembut)
dalam bab yang sama, **dip** (gelap) ke penutup. Klip disambung tanpa tindih
supaya suara ustaz tidak bertindih.
