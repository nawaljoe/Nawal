# Acoustic filled-pause finder: voiced stretches >= 0.3 s with flat pitch and stable spectrum ("aaa", "eee", "uhh").
import sys, json, numpy as np, librosa
y, sr = librosa.load(sys.argv[1], sr=16000, mono=True)
hop = 160  # 10 ms
f0, vflag, vprob = librosa.pyin(y, fmin=70, fmax=300, sr=sr, frame_length=1024, hop_length=hop)
S = np.abs(librosa.stft(y, n_fft=512, hop_length=hop))[:200]
L = np.log(S + 1e-6)
flux = np.r_[0, np.sqrt(((L[:, 1:] - L[:, :-1]) ** 2).mean(0))]
rms = librosa.feature.rms(y=y, frame_length=512, hop_length=hop)[0]
n = min(len(f0), len(flux), len(rms))
f0, vflag, flux, rms = f0[:n], vflag[:n], flux[:n], rms[:n]
db = 20 * np.log10(rms + 1e-9)
voiced = vflag & (db > np.percentile(db, 35))
semis = 12 * np.log2(np.where(np.isnan(f0), 1, f0) / 100)
W = 25  # 250 ms window
cand = np.zeros(n, bool)
for i in range(0, n - W):
    seg = slice(i, i + W)
    if voiced[seg].mean() > 0.9:
        if np.nanstd(semis[seg]) < 0.55 and np.median(flux[seg]) < np.percentile(flux[voiced], 30):
            cand[seg] = True
out = []; i = 0
while i < n:
    if cand[i]:
        j = i
        while j < n and cand[j]: j += 1
        if (j - i) * 0.01 >= 0.30: out.append([round(i * 0.01, 2), round(j * 0.01, 2)])
        i = j
    else: i += 1
json.dump(out, open(sys.argv[2], "w")); print(len(out), "candidates"); print(out)
