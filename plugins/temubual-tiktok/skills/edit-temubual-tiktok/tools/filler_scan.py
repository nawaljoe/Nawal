"""Acoustic filler scan: speech islands >=0.28 s that are mostly voiced with near-constant pitch."""
import sys, json, wave, numpy as np
wf=wave.open(sys.argv[1]); sr=wf.getframerate(); a=np.frombuffer(wf.readframes(wf.getnframes()),np.int16).astype(np.float32)/32768
e=json.load(open(sys.argv[2])); kept=[(p["src_in"],p["src_out"]) for p in e["pieces_v1"]]
hop=int(0.01*sr)
def db(i): x=a[i:i+2*hop]; return 20*np.log10(np.sqrt(np.mean(x**2))+1e-9)
def f0(x):
    f=x*np.hanning(len(x)); ac=np.correlate(f,f,"full")[len(x)-1:]; lo,hi=int(sr/300),int(sr/70)
    k=lo+np.argmax(ac[lo:hi]); return sr/k if ac[0]>0 and ac[k]/ac[0]>0.5 else None
for s,t in kept:
    i=int(s*sr); end=int(t*sr); on=None
    while i<end:
        sp=db(i)>-36
        if sp and on is None: on=i
        if (not sp or i+hop>=end) and on is not None:
            dur=(i-on)/sr
            if dur>=0.28:
                ps=[f0(a[j:j+640]) for j in range(on,i-640,160)]; v=[p for p in ps if p]
                if len(v)>=0.8*len(ps) and np.std(v)<=5:
                    print(f"{on/sr:.2f}-{i/sr:.2f} dur {dur:.2f} f0 {np.median(v):.0f} sd {np.std(v):.1f}")
            on=None
        i+=hop
