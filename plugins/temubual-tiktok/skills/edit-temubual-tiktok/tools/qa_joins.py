"""Re-transcribe across every join of the rendered cut to catch clipped syllables or leftover fillers.
Usage: python3 -I qa_joins.py <audio16k.wav> <edl.json> [--fillers-only]
Prints the words around each join in normal and verbatim (filler-keeping) mode."""
import json, sys, wave, numpy as np
from faster_whisper import WhisperModel
e = json.load(open(sys.argv[2])); wf = wave.open(sys.argv[1]); sr = wf.getframerate()
a = np.frombuffer(wf.readframes(wf.getnframes()), dtype=np.int16).astype(np.float32) / 32768
P = e.get("pieces_v1", e["pieces"])
out = np.concatenate([a[int(p["src_in"] * sr):int(p["src_in"] * sr) + int(round((p["out_out"] - p["out_in"]) * sr))] for p in P])
m = WhisperModel("large-v3", device="cpu", compute_type="int8", cpu_threads=4)
for p in P[1:]:
    if "--fillers-only" in sys.argv and not p.get("filler_join"): continue
    j = p["out_in"]; seg = out[max(0, int((j - 2.2) * sr)):int((j + 2.2) * sr)]
    for prompt in (None, "aaa, emm, err,"):
        segs, _ = m.transcribe(seg, language="ms", beam_size=5, suppress_tokens=[] if prompt else [-1], initial_prompt=prompt)
        print(f"join {j:6.2f} (src {p['src_in']:.2f}) {'verbatim' if prompt else 'normal  '}: " + " ".join(s.text.strip() for s in segs), flush=True)
