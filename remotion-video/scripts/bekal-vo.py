"""Jana suara panduan lelaki (Osman) yang lebih semula jadi:
frasa demi frasa, jeda macam orang bercakap, kemudian proses audio supaya bunyi macam dirakam guna mikrofon.
Perlu: pip install edge-tts. Guna: python3 scripts/bekal-vo.py public/bekal/vo/lelaki
Cetak timing setiap frasa (untuk kapsyen).
"""
import asyncio, os, subprocess, sys, tempfile, json
import edge_tts

VOICE = "ms-MY-OsmanNeural"
PITCH = "-3Hz"
# (teks, kelajuan, jeda selepas frasa dalam saat)
LINES = [
    [("Ini...", "-12%", 0.38), ("bekal.", "-14%", 0)],
    [("Setiap hari,", "-6%", 0.18), ("kita bawak bekal", "-6%", 0.12), ("untuk perut kita.", "-8%", 0)],
    [("Ini pun...", "-14%", 0.5), ("bekal.", "-16%", 0)],
    [("Bekal utama kita,", "-12%", 0.32), ("untuk kat sana,", "-12%", 0.2), ("nanti.", "-14%", 0)],
    [("Jom...", "-10%", 0.4), ("kita mulakan pagi kita,", "-10%", 0.18), ("dengan Solat Subuh berjemaah,", "-10%", 0.28), ("sama-sama.", "-12%", 0)],
    [("Bekal dunia,", "-8%", 0.14), ("siap.", "-10%", 0.95), ("Bekal akhirat...", "-12%", 0.3), ("macam mana?", "-12%", 1.0), ("Jom,", "-6%", 0.18), ("Solat Subuh Berjemaah!", "-6%", 0)],
]
SR = 48000
# rantaian "mikrofon": buang dengung rendah, hangatkan, kurangkan tajam, compressor lembut, gema bilik kecil
POST = ("highpass=f=75,equalizer=f=180:t=q:w=1:g=2.5,equalizer=f=3200:t=q:w=1.5:g=1.5,"
        "equalizer=f=7000:t=q:w=2:g=-3,acompressor=threshold=-20dB:ratio=2.5:attack=8:release=120:makeup=2,"
        "aecho=0.85:0.6:28|47:0.12|0.07,loudnorm=I=-16:TP=-1.5:LRA=7")

async def tts(text, rate, out):
    await edge_tts.Communicate(text, VOICE, rate=rate, pitch=PITCH, proxy=os.environ.get("HTTPS_PROXY")).save(out)

def trim(inp, out):
    # buang senyap awal & akhir frasa
    af = "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.02,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,areverse"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", inp, "-af", af, "-ar", str(SR), "-ac", "1", out], check=True)

def dur(f):
    return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f], capture_output=True, text=True).stdout)

def main(outdir):
    os.makedirs(outdir, exist_ok=True)
    timings = {}
    with tempfile.TemporaryDirectory() as tmp:
        for li, line in enumerate(LINES, 1):
            parts, t, lead = [], 0.15, 0.15
            phr = []
            sil0 = f"{tmp}/sil_lead.wav"
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-i", f"anullsrc=r={SR}:cl=mono", "-t", str(lead), sil0], check=True)
            parts.append(sil0)
            for pi, (text, rate, pause) in enumerate(line):
                raw, cut = f"{tmp}/r{li}_{pi}.mp3", f"{tmp}/c{li}_{pi}.wav"
                asyncio.run(tts(text, rate, raw)); trim(raw, cut)
                d = dur(cut); phr.append([text, round(t, 2), round(t + d, 2)]); t += d
                parts.append(cut)
                if pause:
                    sil = f"{tmp}/s{li}_{pi}.wav"
                    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-i", f"anullsrc=r={SR}:cl=mono", "-t", str(pause), sil], check=True)
                    parts.append(sil); t += pause
            lst = f"{tmp}/l{li}.txt"
            open(lst, "w").write("".join(f"file '{p}'\n" for p in parts))
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", lst, "-af", POST + ",apad=pad_dur=0.4",
                            "-ar", str(SR), "-ac", "2", "-b:a", "192k", f"{outdir}/vo{li}.mp3"], check=True)
            timings[f"vo{li}"] = phr
    print(json.dumps(timings, ensure_ascii=False, indent=1))

if __name__ == "__main__":
    main(sys.argv[1])
