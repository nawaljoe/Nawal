# Lawatan Premis Dipersijilkan Halal: Tepak Marketing Sdn. Bhd.

Lawatan YB Exco Hal Ehwal Agama Islam Johor ke Tepak Marketing, Pasir Gudang,
10 November 2026. Video 9:16, 2 min 30 s, untuk TikTok, Facebook Reels dan
Instagram Reels.

Blueprint penuh (EDL bergambar, bunyi, transisi, teks, warna, eksport):
https://claude.ai/artifact/9WwnSE7zZq1e1jahWtU2sW

## Kandungan

| Fail | Guna |
|---|---|
| `timeline.json` | Sumber tunggal suntingan: 47 shot, 17 soundbite, teks, SFX |
| `deliverables/TEPAK_ROUGHCUT_v1.edl` | EDL CMX3600 30 fps untuk Premiere (File → Import, relink ke footage asal) |
| `deliverables/TEPAK_ROUGHCUT_v1.srt` | Subtitle petikan (BM) |
| `deliverables/TEPAK_ROUGHCUT_v1_graphics.ass` | Tajuk, lower third, kapsyen, kad akhir (libass) |
| `analysis/clips.csv` | 85 klip unik: durasi, masa rakaman, folder Drive |
| `analysis/transcript_whisper_raw.json` | Transkrip mesin semua klip (belum disunting) |
| `tools/build_timeline.py` | Edit shot / soundbite / teks di sini, kemudian jana `timeline.json` |
| `tools/render.py` | Render rough cut + EDL + SRT + ASS dengan ffmpeg |
| `blueprint/` | Templat halaman blueprint + skrip bina |

Video rough cut (`TEPAK_ROUGHCUT_v1_1080x1920.mp4`, ~186 MB) tidak disimpan
dalam repo; render semula dengan arahan di bawah.

## Render semula

```bash
python3 tools/build_timeline.py timeline.json
python3 tools/render.py timeline.json <folder_footage> <folder_output> <folder_font> --proxy
```

`<folder_footage>` mengandungi `IMG_xxxx.MOV` asal. `<folder_font>` mengandungi
Montserrat dan Poppins (Google Fonts). Rough cut tiada muzik; SFX disintesis
sementara.

## Perlu disemak sebelum terbit

- Tajuk "Kilang pembuatan teh Lipton": footage dan kata-kata YB menunjukkan
  Lipton **dibungkus** di sini; jenama lain (Bushells, dll.) turut dibungkus.
- Tiada footage penyampaian sijil, cenderahati atau foto berkumpulan.
- Nama & jawatan lower third masih `[NAMA]`.
- Angka dalam soundbite wakil syarikat (uncang seminit, tan setahun) perlu disahkan.
- Gurauan "Tambi" (IMG_1959/1960) tidak dimasukkan; perlu kelulusan pejabat YB.

Skill boleh guna semula: `plugins/higgsfield/skills/johor-corporate-documentary`.
