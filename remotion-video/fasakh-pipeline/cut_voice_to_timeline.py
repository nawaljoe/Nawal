# Cut a b2.1-timeline audio file (hook + 2.1 s beep + body, e.g. voice_raw.wav) to the current cuts.json timeline.
import json, sys, numpy as np, wave
src, dst = sys.argv[1], sys.argv[2]
old=json.load(open("cuts_v5_prefill.json"))["keeps"]; new=json.load(open("cuts.json"))["keeps"]
def s2o_old(t):
    for k in old:
        if k.get("hook") or k.get("beep"): continue
        if k["src_start"]-1e-4<=t<=k["src_end"]+1e-4: return k["out_start"]+t-k["src_start"]
    raise ValueError(t)
pre=round((old[1]["out_start"]+old[1]["src_end"]-old[1]["src_start"])*30)
keepf=set(range(pre))
for k in new:
    if k.get("hook") or k.get("beep"): continue
    keepf.update(range(round(s2o_old(k["src_start"])*30), round(s2o_old(k["src_end"])*30)))
N=7086; drop=[f for f in range(N) if f not in keepf]
runs=[];i=0
while i<len(drop):
    j=i
    while j+1<len(drop) and drop[j+1]==drop[j]+1: j+=1
    runs.append((drop[i],drop[j]+1)); i=j+1
w=wave.open(src); sr=w.getframerate(); ch=w.getnchannels()
x=np.frombuffer(w.readframes(w.getnframes()),np.int16).reshape(-1,ch).astype(np.float32)
# step 1: 2.1 s beep → 1.0 s (drop frames 262..294 of the 2.1-beep timeline)
x=np.concatenate([x[:round(262/30*sr)], x[round(295/30*sr):]])
# step 2: filler/stutter runs on the b1 timeline, 6 ms micro-fades, exact length
f=int(0.006*sr); keep=np.ones(len(x),bool); g=np.ones(len(x),np.float32)
for a,b in runs:
    s_,e_=round(a/30*sr),round(b/30*sr); keep[s_:e_]=False
    g[s_-f:s_]*=np.linspace(1,0,f); g[e_:e_+f]*=np.linspace(0,1,f)
y=(x*g[:,None])[keep]
o=wave.open(dst,"wb"); o.setnchannels(ch); o.setsampwidth(2); o.setframerate(sr); o.writeframes(np.clip(y,-32768,32767).astype(np.int16).tobytes()); o.close()
print("out", round(len(y)/sr,3), "s")
