# Rebuild base video + voice for the current cuts.json from the b1 masters (blurred base / voice before filler cuts).
# b1 = timeline of cuts_v5_prefill.json (hook + 1 s beep + body, no filler cuts).
import json, sys, subprocess, numpy as np, wave
old=json.load(open("cuts_v5_prefill.json"))["keeps"]; new=json.load(open("cuts.json"))["keeps"]
def s2o_old(t):
    for k in old:
        if k.get("hook") or k.get("beep"): continue
        if k["src_start"]-1e-4<=t<=k["src_end"]+1e-4: return k["out_start"]+t-k["src_start"]
    raise ValueError(t)
pre=round((old[1]["out_start"]+old[1]["src_end"]-old[1]["src_start"])*30)   # hook + beep frames
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
total=round((new[-1]["out_start"]+new[-1]["src_end"]-new[-1]["src_start"])*30)
assert N-len(drop)==total, (N-len(drop),total)
expr="+".join(f"between(n\\,{a}\\,{b-1})" for a,b in runs)
subprocess.run(["ffmpeg","-v","error","-y","-i","base_video_blur_b1.mp4","-vf",f"select='not({expr})',setpts=N/30/TB","-r","30",
    "-c:v","libx264","-preset","medium","-crf","14","-pix_fmt","yuv420p",sys.argv[1]],check=True)
w=wave.open("voice_b1.wav"); sr=w.getframerate(); ch=w.getnchannels()
x=np.frombuffer(w.readframes(w.getnframes()),np.int16).reshape(-1,ch).astype(np.float32)
f=int(0.006*sr); keep=np.ones(len(x),bool); g=np.ones(len(x),np.float32)
for a,b in runs:
    s_,e_=round(a/30*sr),round(b/30*sr); keep[s_:e_]=False
    g[s_-f:s_]*=np.linspace(1,0,f); g[e_:e_+f]*=np.linspace(0,1,f)
y=(x*g[:,None])[keep]
o=wave.open(sys.argv[2],"wb"); o.setnchannels(ch); o.setsampwidth(2); o.setframerate(sr); o.writeframes(np.clip(y,-32768,32767).astype(np.int16).tobytes()); o.close()
print("frames",total,"runs",len(runs),"voice",round(len(y)/sr,3))
