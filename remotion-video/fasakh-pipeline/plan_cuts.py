import json, numpy as np
db=np.load("env.npy")          # 10ms frames
FR=0.01
def snap(t,win=0.2):
    a=int((t-win)/FR); b=int((t+win)/FR)
    a=max(a,0); b=min(b,len(db)-1)
    i=a+int(np.argmin(db[a:b])); return i*FR
END=281.45
# (start,end,label) removals in source time — stutters / false starts / repeats
R=[
 (56.88,59.62,"boleh membuat, ataupun"),
 (64.04,66.04,"ulang: Boleh meneruskan perceraian"),
 (72.18,78.38,"salah mula: Dan perceraian ni pula ada dua"),
 (99.05,101.40,"ulang: Dan sekiranya"),
 (11.30,12.10,"eee"),
 (154.63,156.30,"apa tu"),
 (121.10,122.10,"jeda fasakh"),
 (161.00,164.72,"eh, kalau tengok di sini, contoh"),
 (167.38,177.14,"salah mula: Kurungan 1, mana-mana... Baik, Seksyen 53"),
 (186.04,187.96,"yang, maknanya"),
 (211.70,216.22,"isteri telah, ataupun disebut di sini"),
 (245.12,246.14,"apa itu"),
]
rem=[(snap(a),snap(b),l,"stutter") for a,b,l in R]
rem.append((0.0,10.30,"suara penanya (soalan) dibuang","trim"))
rem.append((END,283.56,"tail","trim"))
# pause compression from Silero VAD gaps: gaps > 0.7s shrink to ~0.4s
sp=json.load(open("vad.json"))
for i in range(len(sp)-1):
    s0,e0=sp[i][1],sp[i+1][0]
    if e0-s0>0.7:
        rem.append((s0+0.18,e0-0.22,f"jeda {e0-s0:.2f}s","pause"))
# merge overlaps; stutter label wins
rem.sort()
M=[]
for r in rem:
    if M and r[0]<=M[-1][1]+0.02:
        p=M[-1]; typ="stutter" if "stutter" in (p[3],r[3]) else p[3]
        M[-1]=(p[0],max(p[1],r[1]),p[2]+" + "+r[2],typ)
    else: M.append(r)
keeps=[];t=0.0;prevtype="trim"
for a,b,l,typ in M:
    if a>t+0.05: keeps.append({"src_start":round(t,3),"src_end":round(a,3),"after_cut":prevtype})
    t=b;prevtype=typ
total=sum(k["src_end"]-k["src_start"] for k in keeps)
for k in keeps:
    k["src_start"]=round(round(k["src_start"]*30)/30,4); k["src_end"]=round(round(k["src_end"]*30)/30,4)
HOOK=(248.05,255.80)  # cold open: jawapan ustaz
keeps.insert(0,{"src_start":HOOK[0],"src_end":HOOK[1],"after_cut":"trim","hook":True})
BEEP_LEN=1.0  # colour-bars beep transition after the hook (frame-exact: 63 frames)
keeps.insert(1,{"src_start":-1,"src_end":-1+BEEP_LEN,"after_cut":"trim","beep":True})
for k in keeps:
    k["src_start"]=round(round(k["src_start"]*30)/30,4); k["src_end"]=round(round(k["src_end"]*30)/30,4)
total=sum(k["src_end"]-k["src_start"] for k in keeps)
out=0
for k in keeps:
    k["out_start"]=round(out,3); out+=k["src_end"]-k["src_start"]
json.dump({"keeps":keeps,"removed":[{"a":a,"b":b,"why":l,"type":ty} for a,b,l,ty in M]},open("cuts.json","w"),indent=1,ensure_ascii=False)
print(f"segments {len(keeps)}  output {total:.1f}s  (removed {283.57-total:.1f}s)")
print("stutter cuts:",sum(1 for x in M if x[3]=="stutter"),"pause cuts:",sum(1 for x in M if x[3]=="pause"))
