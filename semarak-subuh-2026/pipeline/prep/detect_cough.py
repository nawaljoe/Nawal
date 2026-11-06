import numpy as np, wave, torch, json, sys
from transformers import ASTFeatureExtractor, ASTForAudioClassification
torch.set_num_threads(4)
name = "MIT/ast-finetuned-audioset-10-10-0.4593"
fe = ASTFeatureExtractor.from_pretrained(name, cache_dir="/home/user/work/models/ast")
m = ASTForAudioClassification.from_pretrained(name, cache_dir="/home/user/work/models/ast").eval()
lab = m.config.id2label; idx = {v: k for k, v in lab.items()}
want = ["Cough", "Throat clearing", "Sneeze", "Speech", "Laughter", "Breathing", "Sniff"]
w = wave.open(sys.argv[1]); a = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
SR = 16000; win = 1.0; hop = 0.25; out = []
starts = np.arange(0, len(a) / SR - win, hop)
B = 16
for i in range(0, len(starts), B):
    chunk = [a[int(t * SR):int((t + win) * SR)] for t in starts[i:i + B]]
    x = fe(chunk, sampling_rate=SR, return_tensors="pt")
    with torch.no_grad(): p = torch.sigmoid(m(**x).logits).numpy()
    for t, row in zip(starts[i:i + B], p):
        out.append({"t": round(float(t), 2), **{k: round(float(row[idx[k]]), 3) for k in want}})
json.dump(out, open(sys.argv[2], "w"))
print("done", len(out))
