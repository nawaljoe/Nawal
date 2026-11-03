# Remove steady fan noise: learn its spectrum from the quietest stretches (pauses), then spectral-gate it out.
import sys, numpy as np, wave, noisereduce as nr, librosa
src, dst = sys.argv[1], sys.argv[2]
w=wave.open(src); sr=w.getframerate(); ch=w.getnchannels()
x=np.frombuffer(w.readframes(w.getnframes()),np.int16).reshape(-1,ch).astype(np.float32)/32768
mono=x.mean(1)
hop=int(0.02*sr); n=len(mono)//hop
rms=np.sqrt((mono[:n*hop].reshape(n,hop)**2).mean(1)); db=20*np.log10(rms+1e-9)
quiet=db<np.percentile(db[int(9/0.02):],10)          # pauses in the talk (skip hook/beep)
quiet[:int(9/0.02)]=False
noise=np.concatenate([mono[i*hop:(i+1)*hop] for i in np.where(quiet)[0]])
print("noise profile seconds:", round(len(noise)/sr,1))
out=np.stack([nr.reduce_noise(y=x[:,c], sr=sr, y_noise=noise, stationary=True, prop_decrease=0.9,
                              n_std_thresh_stationary=1.3, n_fft=2048, time_mask_smooth_ms=60, freq_mask_smooth_hz=200)
              for c in range(ch)],1)
o=wave.open(dst,"wb"); o.setnchannels(ch); o.setsampwidth(2); o.setframerate(sr)
o.writeframes((np.clip(out,-1,1)*32767).astype(np.int16).tobytes()); o.close()
def floor(a):
    m=a.mean(1); r=np.sqrt((m[:n*hop].reshape(n,hop)**2).mean(1)); d=20*np.log10(r+1e-9); return np.percentile(d[quiet],50), np.percentile(d,95)
print("noise floor / speech p95  before: %.1f / %.1f   after: %.1f / %.1f" % (*floor(x), *floor(out)))
