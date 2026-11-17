import subprocess, sys
import numpy as np
for f in sys.argv[1:]:
    raw = subprocess.run(["ffmpeg","-v","error","-t","120","-i",f,"-ac","1","-ar","22050","-f","s16le","-"],capture_output=True).stdout
    x = np.frombuffer(raw,np.int16).astype(np.float32)/32768
    hop=2048; frames=x[:len(x)//hop*hop].reshape(-1,hop)
    spec=np.abs(np.fft.rfft(frames*np.hanning(hop),axis=1))
    freqs=np.fft.rfftfreq(hop,1/22050)
    cent=(spec*freqs).sum(1)/(spec.sum(1)+1e-9)
    flux=np.maximum(np.diff(spec,axis=0),0).sum(1)/(spec[1:].sum(1)+1e-9)
    rms=np.sqrt((frames**2).mean(1))
    print(f"{f.split('/')[-1]:28s} centroid={np.median(cent):6.0f}Hz flux={np.mean(flux):.3f} rms_db={20*np.log10(np.median(rms)+1e-9):6.1f} quiet_start={np.argmax(rms>0.01)*hop/22050:.1f}s")
