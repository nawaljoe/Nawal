import json, sys, wave, numpy as np
from faster_whisper import WhisperModel
SR = 16000
w = wave.open(sys.argv[1]); a = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
hop = 160
r = np.sqrt(np.convolve(a ** 2, np.ones(hop * 3) / (hop * 3), 'same')[::hop]); d = 20 * np.log10(r + 1e-9)  # 10ms frames
sil = d < -45
regs = []; s = None
for i, v in enumerate(sil):
    if not v and s is None: s = i
    if v and s is not None: regs.append([s, i]); s = None
if s is not None: regs.append([s, len(sil)])
m = []
for r0 in regs:
    if m and r0[0] - m[-1][1] < 25: m[-1][1] = r0[1]
    else: m.append(r0)
m = [x for x in m if x[1] - x[0] >= 15]
chunks = []; cur = None
for x in m:
    if cur and x[1] - cur[0] <= 1200 and x[0] - cur[1] < 60: cur[1] = x[1]
    else:
        if cur: chunks.append(cur)
        cur = list(x)
chunks.append(cur)
print("chunks", len(chunks), flush=True)
model = WhisperModel("/home/user/work/models/ms-turbo", device="cpu", compute_type="float32", cpu_threads=4)
P = "Ceramah agama tentang hadis qudsi dan puasa. Setiap amalan anak Adam adalah untuknya kecuali puasa, puasa itu untuk-Ku dan Akulah yang akan membalasnya."
out = []
for c0, c1 in chunks:
    s0 = max(0, c0 * hop - SR * 0.15); s1 = min(len(a), c1 * hop + SR * 0.15); off = s0 / SR
    segs, _ = model.transcribe(a[int(s0):int(s1)], language="ms", beam_size=5, initial_prompt=P, condition_on_previous_text=False,
                               temperature=[0, 0.2, 0.4, 0.6], word_timestamps=True, compression_ratio_threshold=2.0,
                               repetition_penalty=1.15, no_repeat_ngram_size=3)
    for sg in segs:
        ws = [{"w": x.word, "s": x.start + off, "e": x.end + off, "p": x.probability} for x in sg.words]
        out.append({"start": sg.start + off, "end": sg.end + off, "text": sg.text.strip(), "words": ws, "lp": sg.avg_logprob})
        print(f"[{sg.start+off:7.2f}-{sg.end+off:7.2f}] ({sg.avg_logprob:.2f}) {sg.text.strip()}", flush=True)
    json.dump(out, open(sys.argv[2], "w"), ensure_ascii=False, indent=1)
print("done")
