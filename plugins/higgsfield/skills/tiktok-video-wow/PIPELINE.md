# Pipeline render penuh — siri TikTok dari satu video ceramah / talking-head

Aliran ini dibina semasa projek *Khidmat Nasihat Rumah Tangga* (Bahagian Pembangunan Keluarga,
Johor): satu video ustazah 4:25 dipecah jadi 3 video TikTok, dirender sepenuhnya dengan
skrip dalam `pipeline/`. Contoh konfigurasi lengkap: `contoh/config_khidmat_nasihat.json`.

## Citarasa Nawal (ikut tanpa perlu ditanya)

| Perkara | Pilihan Nawal |
|---|---|
| Siri | Pecah ikut topik (cth. 3 part). **Jangan tulis "Part 1/2/3" pada skrin**; setiap part ada hook sendiri; label part hanya dalam caption TikTok. |
| Suara penemuramah | Buang. |
| Gagap / "aaa" | Buang **ayat** yang gagap terus (potong di sempadan ayat). Elak potongan kecil di tengah ayat — bunyi "putus". Sahkan dengan transkrip semula. |
| Suara | Gaya **podcast**: tiada gema, jelas, sekata. |
| Pencahayaan | "Ambient soft" premium, hangat — tapi **tidak berkabus**. B-roll tanpa glow. |
| Latar | Kabur (portrait mode); **meja kekal tajam**. |
| Zoom | Perlahan & berterusan (101–108 %, kitaran 16 s). **Bukan** punch-in yang mengejut. |
| Caption | Kecil, kata kunci kuning, ejaan dibetulkan (khidmat nasihat, Pejabat Kadi Daerah, "sepuluh ringgit"). |
| Tajuk | Kekal sepanjang video, jauh dari logo. |
| Logo | Templat PNG Nawal (logo Johor atas + tera air Fared Khalid bawah) pada **setiap frame**, kedudukan sama seperti templat. **Logo/tera air tidak boleh tutup muka.** |
| Nama penceramah | Lower third nama + jawatan dalam **setiap** draf, kali pertama dia muncul. |
| B-roll | Muka real. Wanita gaya ustazah: **tudung bawal labuh, baju longgar, tiada lekuk dada/punggung**. Pasangan **tak berpegang tangan**. Kalau Nawal beri gambar sendiri (cth. dari ChatGPT) — guna terus. Kalau ada rakaman sebenar penceramah, itu pilihan terbaik. |
| Muzik | Tenang, bebas hak cipta, ~11 dB bawah suara. Lagu komersial (cth. Rossa) **tidak boleh** dimasukkan — sediakan versi TanpaMuzik untuk ditambah dalam app TikTok. |
| SFX | Lembut (whoosh, chime, pop), tidak mengganggu vibe tenang. |
| Output | Dua versi setiap draf: `_DenganMuzik` & `_TanpaMuzik`, outro FK di hujung. |
| Label | Ada wajah AI → ingatkan tanda *AI-generated* di TikTok. Muzik CC BY → kredit dalam caption. |

## Susun atur folder projek (di scratchpad, bukan dalam repo)

```
projek/
  config.json            # suntingan (lihat skema di bawah) -> config_resolved.json
  analisis/              # audio.wav, perkataan.txt, suara_podcast.wav
  logo/templat.png       # overlay 9:16 PNG telus dari Nawal (logo atas + tera air bawah)
  klip/                  # B-roll .mp4 (kenburns.py / broll_dengar.py)
  cards/                 # output render_cards.js
  sfx/<draf>.wav         # output sfx.py
  fonts/  model/         # dari sediakan.sh
  akhir/  siap/          # output bina_semua.sh (hantar fail dalam siap/)
```

## Langkah

`SK=<folder skill>/pipeline`, `P=<folder projek>`.

1. **Sediakan alat** — `bash $SK/sediakan.sh $P` (tambah `ai` jika perlu jana/baiki gambar AI).
2. **Analisis** — `scripts/analisis_video.sh`; tonton contact sheet. Ekstrak audio
   `ffmpeg -i video -vn -ac 1 -ar 16000 $P/analisis/audio.wav`.
3. **Transkrip perkataan** — `python3 -I $SK/perkataan.py audio.wav > perkataan.txt`.
   Semak zon kabur dengan `zon.py audio.wav a-b ...` (transkrip semula bahagian kecil).
4. **Rancang siri** — pilih babak (`segments`) setiap draf ikut topik; hook = ayat terkuat
   diletak di depan. Tunjuk pelan kepada Nawal dahulu.
5. **Buang gagap** — `gagap.py` (spektrum) → `calon_potong.py` (+ `POTONG_MANUAL` untuk ulangan /
   mula palsu) → `semak_potong.py` (transkrip semula; perkataan hilang = batalkan potongan).
   Utamakan buang ayat penuh. Jangan sentuh bahagian penceramah mengeja URL. Isi `cuts`.
6. **Suara podcast** — `ffmpeg -i video -vn -ac 1 -ar 48000 analisis/asal_48k.wav` lalu
   `python3 -I $SK/podcast.py analisis/asal_48k.wav analisis/suara_podcast.wav`.
7. **Caption** — tulis sendiri dalam `captions` (masa asal), betulkan ejaan Whisper
   (hikmat→khidmat, dll.), `{Y}…{W}` untuk kata kunci kuning.
8. **Kad grafik & B-roll** — jenis kad dalam `pipeline/cards.html` (ubah teks ikut projek).
   B-roll klip: letak `.mp4` dalam `klip/` dan tetapkan `clip` + `label` pada kad.
   - Gambar → klip: `kenburns.py gambar.png klip/X.mp4 <saat> <pan> [geser] [atas] [lebar]`.
     Jika wajah bertembung logo/tajuk, guna `atas`≈520 (gambar diturunkan, atas kabur gelap).
   - Rakaman sebenar penceramah: `broll_dengar.py video klip/X.mp4 $SK <mula> <saat> [posisi]`
     (close-up; masa sama dengan audio → bibir selari).
   - Gambar AI (jika tiada gambar dari Nawal): `jana_batch.py` (txt2img), `inpaint.py`
     (labuhkan tudung, pisahkan tangan; wajah dikecualikan), `ratakan.py` (buang lekuk badan),
     `besarkan.py` (Real-ESRGAN, wajib — tanpa ini gambar kabur). Tunjuk papan pilihan dahulu.
9. **Selesaikan masa** — `python3 -I $SK/compose.py --resolve config.json config_resolved.json`.
10. **Kad** — `node $SK/render_cards.js config_resolved.json cards`.
11. **SFX** — `python3 -I $SK/sfx.py config_resolved.json <draf> <saat_total+2> sfx/<draf>.wav`.
12. **Render** — `bash $SK/bina_semua.sh $P <video> <outro.mp4> <muzik.mp3>`
    (`DRAF="Draf2"` untuk satu draf; ~15–25 min setiap draf pada CPU, boleh serentak).
13. **Semak sebelum hantar** — frame pada setiap B-roll (logo/tajuk tak tutup muka),
    `transkrip_akhir.py` pada output (tiada perkataan terpotong), ebur128 ≈ -12 hingga -14 LUFS.

Muzik dicadang: *Meditation Impromptu 02* — Kevin MacLeod (incompetech.com), CC BY 4.0
(`ciri_muzik.py` membantu pilih trek paling tenang). Tahap muzik boleh diubah tanpa render
semula gambar: `remix_muzik.sh`.

## Skema `config.json`

```json
{"drafts": {"Draf1_Nama": {
  "segments": [{"a": 227.0, "b": 235.2}],        // babak dari video asal (saat), ikut urutan
  "cuts": [[218.31, 219.37]],                   // potongan dalam babak (gagap, ulangan)
  "title": ["Baris 1", "Baris 2"],               // tajuk kekal
  "music_start": 0,                             // mula trek muzik (saat)
  "captions": [[227.02, 228.95, "teks {Y}kunci{W}"]],
  "cards": [
    {"type": "nama", "nama": "NAMA", "jawatan": "JAWATAN", "at": 227.5, "d": 4.8},
    {"type": "syiqaq", "at": 238.25, "end": 244.12},
    {"type": "silent", "at": 214.6, "d": 4.0, "clip": "D1_taktegur.mp4",
     "label": ["Tajuk B-roll", "sari kata"]},
    {"type": "phone", "at": 136.6, "end": 150.12, "cues": [136.72, 143.42, 145.44, 147.28]}
  ]}}}
```

Masa `at`/`end`/`cues`/`captions` ialah **masa video asal** — `--resolve` menukarnya ke masa
draf selepas potongan, jadi kad tetap jatuh pada ayat yang betul walaupun potongan berubah.
