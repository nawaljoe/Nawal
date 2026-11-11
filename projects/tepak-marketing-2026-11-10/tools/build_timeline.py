#!/usr/bin/env python3
"""Single source of truth for the Tepak Marketing edit.

Shots are laid end to end; dialogue, captions and SFX are anchored to a shot
label (+ offset in seconds) so the timeline stays in sync when a shot changes.
Writes timeline.json for render.py.
"""
import json, sys

FPS = 30
AMB_BROLL = -15     # clean machine ambience under b-roll (ducked under dialogue)
AMB_QUIET = -18
AMB_SPEECH = -24    # b-roll whose ambience contains stray conversation
# shots whose source audio has background talking (found from the transcripts)
SPEECHY = {"h3", "h4", "i4", "b1", "b2", "b3", "p1", "p2", "p3", "f3", "f4", "m1", "m2",
           "k1", "k2", "k7", "l2", "s2", "s3", "s4", "c1"}

# label, clip, in, out, ambient dB (None = mute: sync dialogue carries audio), note
SHOTS = [
    # ---- 1. HOOK -----------------------------------------------------------
    ("h1", "1846", 4.0, 5.0, AMB_BROLL, "CU daun teh dalam uncang terbuka (push-in)"),
    ("h2", "1875", 7.0, 8.0, AMB_BROLL, "Uncang bulat jatuh dari conveyor"),
    ("h3", "1934", 2.8, 3.8, AMB_BROLL, "Conveyor menyusun uncang"),
    ("h4", "1845", 32.0, 33.0, AMB_BROLL, "Hopper mengisi daun teh"),
    ("h5", "1873", 12.6, 14.95, None, "YB CU: 'Perasan tak, ada teh yang bulat?'"),
    ("h6", "1875", 8.0, 9.5, AMB_BROLL, "Jawapan visual: uncang bulat jatuh"),
    ("t1", "1726", 2.0, 5.0, AMB_QUIET, "Logo Tepak (pan) + TAJUK"),
    # ---- 2. PENGENALAN (VO YB 1777) ----------------------------------------
    ("i1", "1777", 0.0, 3.25, None, "YB turun tangga, sapa kamera (sync)"),
    ("i2", "1729", 1.0, 3.8, AMB_QUIET, "Bangunan & papan tanda Tepak"),
    ("i3", "1731", 1.8, 4.2, AMB_QUIET, "Tilt-down ke bendera Malaysia & Johor"),
    ("i4", "1890", 8.4, 11.4, AMB_BROLL, "Pekerja dengan pek Lipton (flash-forward)"),
    ("i5", "1732", 1.9, 4.4, AMB_QUIET, "Ketibaan YB, bersalam"),
    ("i6", "1752", 2.0, 4.9, AMB_QUIET, "CU cawan teh susu di meja taklimat"),
    ("i7", "1777", 22.6, 28.3, None, "YB: 'kita berada di kilang ... Jom!' (sync)"),
    # ---- 3. TAKLIMAT ------------------------------------------------------
    ("b1", "1743", 4.0, 7.0, AMB_QUIET, "Suasana taklimat / sarapan"),
    ("b2", "1768", 0.5, 2.5, AMB_QUIET, "Pengacara: atur cara lawatan"),
    ("b3", "1776", 3.0, 5.5, AMB_QUIET, "YB mendengar taklimat"),
    # ---- 4. PERSIAPAN -----------------------------------------------------
    ("p1", "1805", 1.3, 5.8, AMB_QUIET, "YB memakai coverall"),
    ("p2", "1805", 9.0, 10.5, AMB_QUIET, "Delegasi memakai shoe cover"),
    ("p3", "1817", 0.0, 3.0, AMB_BROLL, "Masuk ke dalam: pallet produk (dolly)"),
    # ---- 5. BLENDING ------------------------------------------------------
    ("f1", "1828", 5.0, 8.5, None, "Wakil syarikat menerangkan proses (sync)"),
    ("f2", "1838", 2.0, 5.5, AMB_BROLL, "Mesin & conveyor ke blending"),
    ("f3", "1970", 0.0, 2.5, AMB_QUIET, "Guni teh 'Produce of Kenya / Indonesia'"),
    ("f4", "1829", 1.0, 3.75, AMB_BROLL, "Wakil syarikat tunjuk mesin (ambien)"),
    # ---- 6. MESIN UNCANG --------------------------------------------------
    ("m1", "1876", 7.0, 10.0, AMB_BROLL, "YB & delegasi di mesin uncang"),
    ("m2", "1873", 0.0, 2.3, AMB_BROLL, "Uncang bulat di conveyor"),
    ("m3", "1934", 3.8, 6.2, AMB_BROLL, "Conveyor penuh uncang"),
    ("m4", "1938", 0.0, 2.0, AMB_BROLL, "Pekerja di mesin pembungkus"),
    # ---- 7. PEMBUNGKUSAN & TIMBANGAN --------------------------------------
    ("k1", "1842", 8.6, 12.9, AMB_BROLL, "Masuk melalui tirai: bilik pembungkusan"),
    ("k2", "1844", 0.0, 3.0, AMB_BROLL, "Pekerja mengisi uncang"),
    ("k3", "1845", 26.0, 29.5, AMB_BROLL, "Pekerja menimbang & menutup"),
    ("k4", "1846", 5.0, 6.5, AMB_BROLL, "CU uncang berisi daun teh"),
    ("k5", "1845", 17.9, 23.2, None, "'Berapa, dik, dia punya berat?' (sync)"),
    ("k6", "1893", 0.0, 3.5, AMB_BROLL, "Pek Lipton di talian pembungkusan"),
    ("k7", "1890", 15.5, 17.0, AMB_BROLL, "Timbang pek Lipton"),
    # ---- 8. MAKMAL -------------------------------------------------------
    ("l1", "1913", 0.0, 4.5, AMB_QUIET, "Papan tanda LAB ROOM (push-in)"),
    ("l2", "1916", 18.0, 23.0, AMB_QUIET, "Sampel teh untuk ujian rasa"),
    ("l3", "1914", 4.0, 7.0, AMB_QUIET, "Pekerja makmal"),
    # ---- 9. KLIMAKS: YB & PRODUK -----------------------------------------
    ("y1", "1901", 0.0, 8.9, None, "YB periksa pek Lipton (sync)"),
    ("y2", "1901", 15.2, 22.5, None, "'Logo halal pun ada' + thumbs up (sync)"),
    # ---- 10. KISAH KEJAYAAN ----------------------------------------------
    ("s1", "1872", 35.6, 38.6, None, "Wakil syarikat kepada YB (sync)"),
    ("s2", "1969", 3.0, 7.0, AMB_QUIET, "Gudang: sweep rak"),
    ("s3", "1976", 0.0, 3.0, AMB_QUIET, "Pallet produk siap"),
    ("s4", "1956", 4.0, 6.5, AMB_QUIET, "YB di gudang"),
    # ---- 11. PENUTUP -----------------------------------------------------
    ("c1", "1971", 1.5, 5.5, AMB_QUIET, "Delegasi berjalan di gudang"),
    ("c2", "1959", 29.3, 35.5, None, "YB ke kamera, thumbs up (muzik sahaja)"),
    ("c3", "1726", 3.0, 7.2, AMB_QUIET, "Logo Tepak + kad akhir"),
]

# clip, in, out, anchor shot, offset, subtitles [(rel_start, rel_end, text)]
DIALOG = [
    ("1873", 12.6, 14.95, "h5", 0.0, [(0.05, 2.35, "Perasan tak,\\Nada teh yang bulat?")]),
    ("1777", 0.0, 3.25, "i1", 0.0, [(0.0, 1.9, "Assalamualaikum."), (2.0, 3.25, "Awak tahu saya dekat mana?")]),
    ("1777", 3.40, 6.20, "i2", 0.05, [(0.05, 2.8, "Saya dekat Tepak Marketing.")]),
    ("1777", 11.55, 17.75, "i3", 0.25, [(0.05, 3.9, "Rupa-rupanya semua\\Nproduk Lipton"), (3.9, 6.2, "dibungkus di sini.")]),
    ("1777", 18.35, 22.6, "i5", 1.1, [(0.05, 4.25, "Siapa peminat teh,\\Npeminat Lipton terutamanya…")]),
    ("1777", 22.6, 28.3, "i7", 0.0, [(0.3, 2.4, "Kita berada di kilang"), (2.4, 4.95, "yang membungkus\\Nteh kegemaran anda."), (4.95, 5.7, "Jom!")]),
    ("1828", 5.0, 15.25, "f1", 0.0, [(0.0, 1.45, "Kita mula dekat sini."), (1.45, 4.6, "Kita punya proses,\\Nbahan mentah"), (4.6, 7.2, "kita masuk daripada sebelah,"), (7.2, 10.25, "dia akan bawa ke sini\\Nuntuk proses blending.")]),
    ("1835", 42.0, 51.25, "m1", 0.3, [(0.0, 2.0, "Kita ada uncang-uncang\\Nbulat tu,"), (2.0, 5.7, "output mesin tu\\Nterlampau laju,"), (5.7, 9.25, "satu minit boleh buat\\N1,000 hingga 1,200 uncang.")]),
    ("1842", 0.6, 12.6, "k1", 0.2, [(0.05, 4.6, "Kita dapat pastikan setiap pek\\Ntimbangannya betul."), (4.7, 7.9, "Kita ikut Akta Makanan,"), (8.0, 12.0, "tak boleh kurang daripada\\Nyang dibenarkan.")]),
    ("1845", 17.9, 23.2, "k5", 0.0, [(0.05, 1.6, "Berapa, dik, dia punya berat?"), (2.9, 5.3, "252 sampai 253, selalu.")]),
    ("1890", 14.45, 18.4, "k6", 0.0, [(0.05, 2.6, "Setiap sejam, kita akan ada\\Nquality control,"), (2.6, 3.95, "cek dari printing.")]),
    ("1916", 6.7, 9.65, "l1", 2.2, [(0.0, 1.3, "Kita akan compare dengan"), (1.3, 2.95, "Master Blend\\Natau Master Sample.")]),
    ("1916", 12.45, 18.55, "l2", 0.8, [(0.03, 1.45, "Dengan production sekarang,"), (1.45, 5.0, "match tak dengan\\NMaster Sample."), (5.0, 6.1, "Hari-hari kena rasa.")]),
    ("1901", 0.0, 8.9, "y1", 0.0, [(0.0, 1.4, "Lipton yang dah dibungkus,"), (1.4, 4.9, "40 uncang sepaket,"), (4.9, 8.9, "siap dengan tarikh\\Nakhir penggunaan.")]),
    ("1901", 15.2, 22.5, "y2", 0.0, [(0.15, 2.6, "Logo halal pun ada."), (3.7, 5.9, "Lipton memang nama\\Nyang terkenal.")]),
    ("1872", 35.6, 44.3, "s1", 0.0, [(0.04, 3.5, "Dia target hanya\\N10 tan setahun."), (3.6, 5.8, "Tapi Alhamdulillah, tahun\\Npertama kita launch,"), (5.8, 7.4, "dapat 30 tan."), (7.4, 8.7, "Maksudnya, 3 kali ganda.")]),
    ("1948", 21.0, 24.3, "s4", 0.0, [(0.1, 3.3, "Alhamdulillah, kita dah\\Nmencapai 1,400 tan setahun.")]),
]

# style, anchor, offset, duration, lines, extra
TEXT = [
    ("title", "t1", 0.15, 3.85, ["LAWATAN PREMIS\\NDIPERSIJILKAN HALAL", "TEPAK MARKETING", "SDN. BHD."], {"y": 860}),
    ("caption", "t1", 1.6, 2.4, ["PASIR GUDANG, JOHOR  ·  10 NOVEMBER 2026"], {"y": 1180}),
    ("lower", "i1", 1.1, 2.2, ["YB [NAMA YB]", "Exco Hal Ehwal Agama Islam Negeri Johor"], {"y": 1150}),
    ("caption", "p1", 0.3, 4.0, ["PAKAIAN PELINDUNG SEBELUM\\NMEMASUKI KAWASAN\\NPEMPROSESAN"], {}),
    ("lower", "f1", 0.3, 3.1, ["[NAMA WAKIL SYARIKAT]", "[Jawatan], Tepak Marketing Sdn. Bhd."], {"y": 1150}),
    ("caption", "f2", 0.2, 2.6, ["PROSES BLENDING"], {}),
    ("caption", "m2", 0.0, 2.2, ["MESIN UNCANG TEH"], {}),
    ("caption", "k2", 0.0, 2.8, ["PEMBUNGKUSAN & TIMBANGAN"], {}),
    ("caption", "l2", 0.2, 3.0, ["KAWALAN KUALITI"], {}),
    ("caption", "y2", 0.3, 2.6, ["LOGO HALAL PADA PEMBUNGKUSAN"], {}),
    ("end", "c3", 0.4, 3.8, ["BERSAMA MEMPERKUKUH\\NINDUSTRI HALAL JOHOR", "TEPAK MARKETING", "SDN. BHD."], {}),
]

SFX = [
    ("hit", "h1", 0.0, -2), ("whoosh", "h2", 0.0, -6), ("whoosh", "h3", 0.0, -8),
    ("whoosh", "h4", 0.0, -8), ("impact", "t1", 0.15, 0), ("riser", "i1", 0.0, -6),
    ("whoosh", "p3", 0.0, -4), ("whoosh", "f2", 0.0, -10), ("riser", "k1", 0.0, -4),
    ("whoosh", "k1", 0.0, -4), ("whoosh", "l1", 0.0, -6), ("hit", "y2", 0.3, 0),
    ("riser", "c1", 0.0, -4), ("impact", "c3", 0.4, -2),
]
FLASH = ["t1", "p3", "k1", "l1", "c1"]


def main(out):
    starts, t = {}, 0
    video = []
    for lab, clip, a, b, amb, note in SHOTS:
        n = int(round((b - a) * FPS))
        starts[lab] = t / FPS
        if amb is not None and lab in SPEECHY:
            amb = AMB_SPEECH
        video.append({"label": lab, "clip": clip, "in": a, "out": b, "amb_db": amb, "note": note})
        t += n
    total = t / FPS
    at = lambda lab, off: round(starts[lab] + off, 3)
    dialog = [{"clip": c, "in": a, "out": b, "at": at(lab, off), "subs": subs}
              for c, a, b, lab, off, subs in DIALOG]
    text = [{"style": st, "start": at(lab, off), "end": at(lab, off) + d, "lines": lines, **ex}
            for st, lab, off, d, lines, ex in TEXT]
    prev = None
    for d in sorted(dialog, key=lambda d: d["at"]):
        if prev and d["at"] < prev["at"] + prev["out"] - prev["in"] - 1e-6:
            raise SystemExit(f"dialog overlap: {prev['clip']}@{prev['at']} and {d['clip']}@{d['at']}")
        prev = d
    sfx = [{"type": ty, "at": at(lab, off), "gain_db": g} for ty, lab, off, g in SFX]
    flash = [at(lab, 0) for lab in FLASH]
    tl = {"name": "TEPAK_ROUGHCUT_v1", "fps": FPS, "video": video, "dialog": dialog,
          "text": text, "sfx": sfx, "flash": flash, "starts": starts, "duration": total}
    json.dump(tl, open(out, "w"), ensure_ascii=False, indent=1)
    print(f"duration {total:.2f}s  shots {len(video)}")
    for lab, s in starts.items():
        print(f"{lab:3s} {int(s//60):02d}:{s%60:05.2f}")


if __name__ == "__main__":
    main(sys.argv[1])
