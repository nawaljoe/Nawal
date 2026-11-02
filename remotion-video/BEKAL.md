# 🍱 BEKAL — Konten Solat Subuh Berjemaah (Remotion)

Video 9:16 (1080×1920, 30fps, ±40 saat). Bekal makanan dijadikan metafora: **bekal dunia** untuk perut, **bekal akhirat** untuk "sana" nanti.

## Storyboard

| Saat | Babak | Visual | VO / Teks | Gred & bunyi |
|---|---|---|---|---|
| 0.0–2.2 | 1. Hook | Foto bekal tudung merah (push-in) + kilat putih | "Ini... **bekal**." | 🌅 Sunset · shutter |
| 2.2–3.8 | 1b | Tangan pegang beg bekal pink | | 🌅 Sunset · whoosh, bunyi plastik asal |
| 3.8–8.8 | 2. B-roll | Jalan ke pejabat (timelapse 10x) → bungkusan makanan diletak (12x, 8x) | "Setiap hari, kita bawak bekal untuk perut kita." | 🌅 Sunset · whoosh setiap potongan |
| 8.8–10.2 | Detik renung | Bekal sekali lagi → pudar ke hitam | | 🌅 Sunset · riser |
| 10.2–14.0 | 3. Pusingan | Pintu masjid (doa masuk masjid), slow-mo | "Ini pun... **bekal**." | 🌙 Subuh tenang · soft boom, ambience naik |
| 14.0–20.0 | 4 | Dalam masjid → saf, slow-mo | "Bekal utama kita, untuk kat 'sana' nanti." | 🌙 Tenang · crossfade perlahan |
| 20.0–27.8 | 5 | Wudhu (bunyi air asal) → qiyam → sujud | "Jom... mulakan pagi kita dengan Solat Subuh berjemaah, sama-sama." | 🌙 Tenang |
| 27.8–34.6 | 6. Banding | Split skrin: atas bekal (sunset) ✓, bawah sujud (subuh) ? | "Bekal dunia siap. Bekal akhirat... macam mana?" | ✓ switch · ? soft boom |
| 34.6–40.5 | 7. CTA | Dalam masjid, slow-mo | **Jom Solat Subuh Berjemaah!** | 🌙 Tenang · ding · fade hitam |

**Dua mood visual** (`src/Bekal/grades.tsx`):
- 🌅 **Sunset** (bekal dunia): sepia + saturasi tinggi, tona oren→magenta, cahaya matahari dari kanan atas, light leak bergerak, vignette hangat.
- 🌙 **Subuh tenang** (bekal akhirat): saturasi rendah, kontras lembut, biru fajar→ungu lembut, kabus cahaya "bernafas", slow-mo 0.55–0.75x, crossfade 0.8 saat, kapsyen italik serif yang pudar masuk perlahan.

**Audio**: tiada muzik berlagu — hanya ambience subuh (angin lembut + drone rendah, dijana sendiri), bunyi asal klip (beg plastik, air wudhu, suasana masjid) dan SFX Remotion (shutter, whoosh, switch, ding) + SFX dijana (riser, soft boom, whoosh lembut).

## Cara guna

```bash
cd remotion-video
npm i
bash scripts/bekal-prep.sh        # muat turun & sediakan footage dari Google Drive (sekali sahaja)
npm run dev                       # buka Remotion Studio → pilih "Bekal"
npx remotion render Bekal out/Bekal.mp4 --crf=18
```

### Props (boleh tukar dalam Studio)

| Prop | Fungsi |
|---|---|
| `suara` | `"perempuan"` (Yasmin), `"lelaki"` (Osman) — suara panduan AI — atau `"tiada"` |
| `voSendiri` | Rakam VO sendiri, letak dalam `public/bekal/vo/`, contoh `"bekal/vo/vo_nawal.mp3"` (set `suara: "tiada"`) |
| `seedanceBekal` | Klip Seedance bekal sunset — ganti foto bekal (hook, detik renung, split) |
| `seedanceMasjid` | Klip Seedance masjid waktu subuh — ganti klip pintu masjid |
| `seedanceMeja` | Klip Seedance meja penuh pelbagai bekal (stop-motion) — ganti 2 klip bungkusan makanan, siap dengan bunyi "pop" |

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

**4. (Bonus) langit fajar untuk CTA — text-to-video**
```
Static wide shot, time-lapse of the sky over a mosque silhouette changing from deep night blue to soft dawn pink and gold, last stars fading, slow drifting clouds, tranquil, cinematic, photorealistic, 9:16
```

Tips: jangan minta teks/tulisan dalam video AI (huruf selalu rosak) — kapsyen dibuat dalam Remotion.

## Fail

- `src/Bekal/Bekal.tsx` — timeline penuh (babak, kapsyen, audio)
- `src/Bekal/Shot.tsx` — klip dengan gred, zoom perlahan, crossfade, slow-mo
- `src/Bekal/Caption.tsx` — kapsyen "warm" (Poppins pop) & "calm" (Lora italik pudar)
- `src/Bekal/grades.tsx` — gred warna sunset & subuh
- `public/bekal/sfx/` — bunyi; `public/bekal/vo/` — suara panduan; `public/bekal/fonts/` — font lokal
- `public/bekal/footage/` — **tidak** disimpan dalam git (besar); jana semula dengan `scripts/bekal-prep.sh`
