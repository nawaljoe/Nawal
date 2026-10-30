# Jana suara latar (lelaki, Bahasa Melayu) + data gerak mulut untuk video "Hindari Kata-Kata Kotor".
# Guna: python3 scripts/jana-suara.py   (perlu: pip install edge-tts, ffmpeg)
import asyncio, json, os, ssl, subprocess, sys
import edge_tts, edge_tts.communicate as comm

CA = "/root/.ccr/ca-bundle.crt"
if os.path.exists(CA):
    comm._SSL_CTX = ssl.create_default_context(cafile=CA)

VOICE, RATE, FPS, GAP = "ms-MY-OsmanNeural", "-6%", 30, 0.45
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public", "lidah")
SEGMENTS = [
    ("tajuk", "Assalamualaikum. Mari kita renungkan bersama. Hindari kata-kata kotor."),
    ("amanah", "Lidah adalah amanah. Islam mengajar kita supaya menjaga tutur kata, kerana setiap perkataan yang keluar daripada mulut, akan dipertanggungjawabkan."),
    ("ayat", "Allah Subhanahu wa Ta'ala berfirman, dalam Surah Qaf, ayat lapan belas. Tidak ada sesuatu perkataan yang dilafazkannya, melainkan ada di sisinya malaikat pengawas, yang sentiasa bersedia mencatat."),
    ("hadis", "Rasulullah sallallahu alaihi wasallam juga bersabda. Sesiapa yang beriman kepada Allah dan hari akhirat, hendaklah dia berkata yang baik, atau diam. Riwayat al-Bukhari dan Muslim."),
    ("kotor", "Kata-kata kotor, makian, penghinaan, dan ucapan yang menyakitkan hati, bukan tanda keberanian atau kekuatan. Sebaliknya, orang yang mampu mengawal lisannya, menunjukkan kematangan dan akhlak yang baik."),
    ("tanya0", "Sebelum berkata-kata, tanyakan kepada diri."),
    ("tanya1", "Adakah kata-kata ini benar?"),
    ("tanya2", "Adakah ia bermanfaat?"),
    ("tanya3", "Adakah ia menyakiti orang lain?"),
    ("tanya4", "Adakah aku sanggup, jika perkataan ini didengari oleh ibu bapa, dan orang yang aku hormati?"),
    ("tanya5", "Adakah aku sanggup mempertanggungjawabkannya, di hadapan Allah?"),
    ("jaga", "Jaga lidah, sebelum lidah menjadi sebab penyesalan."),
    ("penutup", "Berkata baik adalah sedekah. Diam daripada keburukan adalah ibadah. Menjaga lisan, adalah tanda ketakwaan."),
]

def pcm(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", "24000", "-f", "s16le", "-"],
                         capture_output=True, check=True).stdout
    import array
    a = array.array("h"); a.frombytes(raw); return a

async def main():
    os.makedirs(OUT, exist_ok=True)
    timeline, mouth, all_pcm, t = [], [], [], 0.6
    import array
    silence = lambda s: array.array("h", [0] * int(s * 24000))
    all_pcm.append(silence(t))
    for sid, text in SEGMENTS:
        mp3 = os.path.join(OUT, f"{sid}.mp3")
        words = []
        with open(mp3, "wb") as f:
            async for ch in edge_tts.Communicate(text, VOICE, rate=RATE, boundary="WordBoundary").stream():
                if ch["type"] == "audio":
                    f.write(ch["data"])
                elif ch["type"] == "WordBoundary":
                    words.append({"w": ch["text"], "f": round((t + ch["offset"] / 1e7) * FPS)})
        a = pcm(mp3)
        dur = len(a) / 24000
        timeline.append({"id": sid, "text": text, "start": round(t * FPS), "frames": round(dur * FPS), "words": words})
        all_pcm.append(a); all_pcm.append(silence(GAP)); t += dur + GAP
        print(f"{sid:8s} {dur:5.2f}s", file=sys.stderr)
    full = array.array("h"); [full.extend(x) for x in all_pcm]
    full.extend(silence(1.5))
    spf = 24000 // FPS
    peak = 1
    env = []
    for i in range(0, len(full), spf):
        chunk = full[i:i + spf]
        rms = (sum(x * x for x in chunk) / max(1, len(chunk))) ** 0.5
        env.append(rms); peak = max(peak, rms)
    mouth = [round(min(1, (e / peak) * 1.6), 2) for e in env]
    with open(os.path.join(OUT, "suara.raw"), "wb") as f: f.write(full.tobytes())
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "s16le", "-ar", "24000", "-ac", "1", "-i", os.path.join(OUT, "suara.raw"),
                    "-af", "loudnorm=I=-16:TP=-1.5", "-ar", "48000", os.path.join(OUT, "suara.wav")], check=True)
    os.remove(os.path.join(OUT, "suara.raw"))
    for sid, _ in SEGMENTS: os.remove(os.path.join(OUT, f"{sid}.mp3"))
    data = {"fps": FPS, "totalFrames": len(mouth), "segments": timeline, "mouth": mouth}
    with open(os.path.join(ROOT, "src", "lidah", "timeline.json"), "w") as f: json.dump(data, f)
    print(f"jumlah {len(mouth)/FPS:.1f}s", file=sys.stderr)

asyncio.run(main())
