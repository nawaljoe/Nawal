# 🍱 BEKAL — Konten Solat Subuh Berjemaah (Remotion)

Video 9:16 (1080×1920, 30fps, 39.5 saat), suara panduan lelaki. Bekal makanan dijadikan metafora: **bekal dunia** untuk perut, **bekal akhirat** untuk "sana" nanti.

## Storyboard

| Saat | Babak | Visual | VO / Teks | Gred & bunyi |
|---|---|---|---|---|
| 0.0–2.2 | 1. Hook | Foto bekal tudung merah (push-in) + kilat putih | "Ini... **bekal**." | 🌅 Sunset · shutter · 🥁 rentak rancak mula |
| 2.2–3.8 | 1b | Tangan pegang beg bekal pink | | 🌅 · whoosh |
| 3.8–5.0 | 2a | Jalan ke pejabat (timelapse 10x) | "Setiap hari," | 🌅 · whoosh |
| 5.0–8.6 | 2b. Meja | Orang pertama letak bungkusan (sebenar) → **tangan-tangan lain yang kabur & pudar** datang letak bekal lain (dari seberang meja) | "kita bawak bekal untuk perut kita." | 🌅 · "pop" setiap bekal mendarat |
| 8.6–10.2 | Detik renung | Bekal sekali lagi → pudar ke hitam | | 🌅 · riser, rentak berhenti 9.0s |
| 10.2–14.2 | 3. Pusingan | Pintu masjid (doa masuk masjid), slow-mo | "Ini pun... **bekal**." | 🌙 Subuh tenang · soft boom, ambience tenang naik |
| 14.2–20.2 | 4 | Dalam masjid → saf, slow-mo | "Bekal utama kita, untuk kat 'sana' nanti." | 🌙 Tenang · crossfade perlahan |
| 20.2–27.8 | 5 | Wudhu (bunyi air asal) → qiyam → sujud | "Jom... kita mulakan pagi kita dengan Solat Subuh berjemaah, sama-sama." | 🌙 Tenang |
| 27.8–34.0 | 6. Banding | Split skrin: atas bekal (sunset) ✓, bawah sujud (subuh) ? | "Bekal dunia siap. Bekal akhirat... macam mana?" | ✓ switch · ? soft boom |
| 34.0–39.5 | 7. CTA | Dalam masjid, slow-mo | **Jom Solat Subuh Berjemaah!** | 🌙 Tenang · ding · fade hitam |

**Dua mood visual** (`src/Bekal/grades.tsx`):
- 🌅 **Sunset** (bekal dunia): sepia + saturasi tinggi, tona oren→magenta, cahaya matahari dari kanan atas, light leak bergerak, vignette hangat.
- 🌙 **Subuh tenang** (bekal akhirat): saturasi rendah, kontras lembut, biru fajar→ungu lembut, kabus cahaya "bernafas", slow-mo 0.55–0.75x, crossfade 0.8 saat, kapsyen italik serif yang pudar masuk perlahan.

**Audio**:
- 🥁 **Bekal dunia (0–9s) — rancak**: rentak perkusi gaya kompang/rebana 150 BPM (tiada melodi), dijana oleh `scripts/bekal-rentak.py`. Setiap potongan klip jatuh tepat atas beat.
- 🌙 **Bekal akhirat (10s→) — tenang**: rentak berhenti, soft boom, kemudian ambience subuh (angin lembut + drone rendah) naik perlahan.
- Bunyi asal klip (beg plastik, air wudhu, suasana masjid) + SFX Remotion (shutter, whoosh, switch/pop, ding) + SFX dijana (riser, soft boom, whoosh lembut).

**Kesan "tangan hantu"** (`src/Bekal/Meja.tsx`, `scripts/bekal-ghost.py`): klip meja kedua (IMG_7902) diasingkan dari meja (difference key) jadi 2 lapisan — makanan (padat) & tangan (pudar 60%, kabur) — dan diputar 180° supaya seolah-olah orang di seberang meja yang meletak bekal.

## Cara guna

```bash
cd remotion-video
npm i
bash scripts/bekal-prep.sh        # muat turun & sediakan footage dari Google Drive (sekali sahaja)
python3 scripts/bekal-ghost.py    # jana lapisan "tangan hantu" (perlu numpy + Pillow)
npm run dev                       # buka Remotion Studio → pilih "Bekal"
npx remotion render Bekal out/Bekal.mp4 --crf=18
```

### Props (boleh tukar dalam Studio)

| Prop | Fungsi |
|---|---|
| `suara` | `"lelaki"` (Osman, lalai), `"perempuan"` (Yasmin) — suara panduan AI — atau `"tiada"`. Timing kapsyen ikut suara lelaki. |
| `voSendiri` | Rakam VO sendiri, letak dalam `public/bekal/vo/`, contoh `"bekal/vo/vo_nawal.mp3"` (set `suara: "tiada"`) |
| `seedanceBekal` | Klip Seedance bekal sunset — ganti foto bekal (hook, detik renung, split) |
| `seedanceMasjid` | Klip Seedance masjid waktu subuh — ganti klip pintu masjid |
| `seedanceMeja` | Klip Seedance meja penuh pelbagai bekal (stop-motion) — ganti babak meja, siap dengan bunyi "pop" |
| `makananTambahan` | Senarai makanan PNG (lut sinar) yang "diletak tangan hantu" atas meja — lihat bahagian **Makanan tambahan** di bawah |

> Kalau rakam VO sendiri, ikut timing baris dalam storyboard (atau rakam satu baris satu fail dan tukar fail `public/bekal/vo/vo1.mp3`…`vo6.mp3` — nama sama, timing automatik).

## 🎬 Prompt Seedance (pilihan — untuk naikkan "wow")

Jana dalam Seedance (Higgsfield / Dreamina / CapCut), nisbah **9:16**, 5 saat, kemudian simpan dalam `public/bekal/seedance/` dan set prop.

**1. `bekal_sunset.mp4` — image-to-video** (muat naik foto bekal tudung merah)
```
Slow dolly in toward the red-lid floral lunch box on a wooden office desk, warm golden-hour sunset light streaming in from a window on the right, long soft shadows stretching across the desk, tiny dust particles floating in the sunbeam, gentle lens flare, shallow depth of field, calm and nostalgic mood, cinematic, photorealistic, smooth motion, 9:16
```

**2. `masjid_subuh.mp4` — text-to-video**
```
Slow crane up revealing a Malaysian mosque with a white dome and a tall minaret at Subuh dawn, deep blue hour sky with a thin soft pink glow on the horizon, warm lights glowing from inside the mosque, a few men in baju melayu and kopiah walking calmly toward the entrance, light morning mist, peaceful and serene, cinematic, photorealistic, smooth motion, 9:16
```

**3. `meja_bekal.mp4` — meja penuh pelbagai bekal (2 langkah)**

Frame rujukan sedia ada dalam `public/bekal/seedance-rujukan/`:
`meja_kosong.jpg` (meja kosong) dan `meja_akhir.jpg` (meja dengan bungkusan makanan sebenar).

*Langkah A — edit gambar* (Nano Banana / Seedream / Higgsfield edit), muat naik `meja_akhir.jpg`:
```
Using this top-down photo of a light wooden office table as the base, add an assortment of homemade Malaysian lunch boxes arranged neatly across the empty areas of the table: a white plastic container with a red lid and a small red floral print, a three-tier stainless steel tiffin carrier, a pastel blue bento box with the lid open showing rice, fried egg and vegetables, a glass container of fried noodles, a small thermos flask, and a folded cloth napkin with a spoon and fork. Keep the existing food packs, the wood grain, the overhead camera angle, framing and lighting exactly the same. Photorealistic, natural soft shadows matching the overhead light. No text, no logos. 9:16.
```

*Langkah B — Seedance first & last frame*: frame pertama `meja_kosong.jpg`, frame terakhir = gambar hasil Langkah A:
```
Static top-down camera, stop-motion style: lunch boxes and food containers appear one by one on the wooden table, each one popping into place with a quick snap and a tiny bounce, until the whole table is filled, consistent overhead lighting, photorealistic, smooth, 9:16
```
Simpan sebagai `public/bekal/seedance/meja_bekal.mp4`, kemudian set `seedanceMeja: "bekal/seedance/meja_bekal.mp4"`.

> Alternatif tanpa AI: susun bekal sebenar (tupperware, mangkuk tingkat, termos) atas meja yang sama, rakam top-down dari sudut sama, kemudian ganti `public/bekal/footage/food2_fast.mp4`.

**4. Makanan tambahan (sandwich, mi goreng, nasi goreng) — gambar PNG**

Jana setiap satu dalam Nano Banana / Seedream / Higgsfield (gambar, 1:1), kemudian buang latar (remove background) dan simpan sebagai PNG lut sinar dalam `public/bekal/makanan/`.
```
A photorealistic top-down overhead photo of a homemade Malaysian bekal: a rectangular plastic lunch box with a red lid placed beside it, filled with nasi goreng kampung topped with a sunny-side-up fried egg, sliced cucumber and a few keropok. Shot straight down from above, soft warm late-afternoon light from the right, natural shadow. Isolated on a plain pure white background. No text, no logos.
```
Tukar bahagian makanan untuk versi lain:
- *mi goreng*: `a round stainless steel food container filled with mi goreng mamak with fried egg, choy sum and a lime wedge`
- *sandwich*: `a pastel blue plastic lunch box with two triangle sandwiches of sardine and cucumber filling, cut neatly`
- *mangkuk tingkat*: `a stainless steel tiffin carrier with the tiers opened side by side showing white rice, ayam masak merah and sayur goreng`

Kemudian set prop (kedudukan dalam piksel bingkai 1080×1920; `at` = saat selepas babak meja mula, 0–3.4):
```json
"makananTambahan": [
  { "src": "bekal/makanan/nasi_goreng.png", "x": 260, "y": 1250, "width": 330, "rotate": -6, "at": 1.0 },
  { "src": "bekal/makanan/mi_goreng.png",   "x": 820, "y": 1230, "width": 300, "rotate": 8,  "at": 1.6 },
  { "src": "bekal/makanan/sandwich.png",    "x": 540, "y": 1000, "width": 280, "rotate": -3, "at": 2.2 }
]
```
Setiap makanan meluncur masuk sebagai bayang kabur, kemudian mendarat padat dengan bunyi "pop".

**5. (Bonus) langit fajar untuk CTA — text-to-video**
```
Static wide shot, time-lapse of the sky over a mosque silhouette changing from deep night blue to soft dawn pink and gold, last stars fading, slow drifting clouds, tranquil, cinematic, photorealistic, 9:16
```

Tips: jangan minta teks/tulisan dalam video AI (huruf selalu rosak) — kapsyen dibuat dalam Remotion.

## Fail

- `src/Bekal/Bekal.tsx` — timeline penuh (babak, kapsyen, audio)
- `src/Bekal/Shot.tsx` — klip dengan gred, zoom perlahan, crossfade, slow-mo
- `src/Bekal/Meja.tsx` — babak meja dengan tangan hantu & makanan tambahan
- `scripts/bekal-rentak.py` — jana rentak rancak; `scripts/bekal-ghost.py` — jana lapisan tangan hantu
- `src/Bekal/Caption.tsx` — kapsyen "warm" (Poppins pop) & "calm" (Lora italik pudar)
- `src/Bekal/grades.tsx` — gred warna sunset & subuh
- `public/bekal/sfx/` — bunyi; `public/bekal/vo/` — suara panduan; `public/bekal/fonts/` — font lokal
- `public/bekal/footage/` — **tidak** disimpan dalam git (besar); jana semula dengan `scripts/bekal-prep.sh`
