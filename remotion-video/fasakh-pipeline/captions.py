import json, re
T=json.load(open("transcript_verbatim.json")); C=json.load(open("cuts.json"))
K=C["keeps"]
def map_t(t):
    for k in K:
        if k["src_start"]-0.03<=t<=k["src_end"]+0.03:
            return k["out_start"]+min(max(t-k["src_start"],0),k["src_end"]-k["src_start"])
    return None
FIX={"fasa":"fasakh","fasah":"fasakh","tutup":"tuntut","peceraian":"perceraian","persetaman":"persefahaman",
 "perbualan":"pembubaran","pembaharan":"pembubaran","pembumbaran":"pembubaran","enamment":"Enakmen","pertabiran":"Pentadbiran",
 "kurangan":"kurungan","kemudatan":"kemudaratan","isi":"isteri","pembunuhan":"permohonan","carai":"cerai","dihidup":"dia hidup",
 "peruntukkan":"peruntukan","ini":"ni"}
DROP={"eh"}
words=[]
for s in T:
    for w in s["words"]:
        raw=w["w"].strip()
        core=re.sub(r"[^\w\-]","",raw); low=core.lower()
        if not core or low in DROP: continue
        mid=(w["s"]+w["e"])/2
        a=map_t(mid)
        if a is None: continue
        # clamp word start/end into output
        st=map_t(max(w["s"],mid-0.6)) or a; en=map_t(min(w["e"],mid+0.6)) or a
        txt=FIX.get(low,core)
        if low=="fasa" or low=="fasah": txt="fasakh"
        if core[:1].isupper() and txt[:1].islower() and low not in FIX: pass
        punct=re.sub(r"[\w\-]","",raw)
        words.append({"t":txt,"s":round(st,3),"e":round(en,3),"p":punct})
# context fixes
for i,w in enumerate(words):
    prev=words[i-1]["t"].lower() if i else ""
    if w["t"].lower()=="syarat" and prev in ("oleh","hukum"): w["t"]="syarak"
    if w["t"].lower()=="lebih" and prev=="atau": w["t"]="lalai"
    if w["t"].lower()=="di" and i+1<len(words) and words[i+1]["t"].lower()=="johor": w["t"]="Negeri"
    if w["t"]=="-tahun" or w["t"].startswith("-"):
        pass
# merge hyphen continuations ("bertahun" + "-tahun")
M=[]
for w in words:
    if w["t"].startswith("-") and M:
        M[-1]["t"]+=w["t"]; M[-1]["e"]=w["e"]; M[-1]["p"]=w["p"]
    else: M.append(dict(w))
words=M
# lowercase normalisation except proper nouns
PROPER={"islam","allah","swt","seksyen","enakmen","pentadbiran","agama","negeri","johor","mahkamah","syariah"}
for w in words:
    lw=w["t"].lower()
    w["t"]=w["t"].upper() if lw=="swt" else (w["t"][0].upper()+w["t"][1:].lower() if lw in PROPER else lw)
    if lw=="mahkamah" or lw=="syariah": w["t"]=w["t"]
# group into caption pages
pages=[];cur=[]
def flush():
    global cur
    if cur: pages.append({"s":cur[0]["s"],"e":cur[-1]["e"],"words":cur}); cur=[]
for i,w in enumerate(words):
    if cur:
        gap=w["s"]-cur[-1]["e"]; chars=sum(len(x["t"])+1 for x in cur)+len(w["t"])
        starter=w["t"].lower() in ("maka","maknanya","namun","jadi","ataupun","tetapi","tapi","walaupun","contoh","apa","kalau","sedangkan","iaitu","bahawa","dan")
        if (starter and len(cur)>=2) or gap>0.45 or chars>24 or len(cur)>=5 or (cur[-1]["p"] and cur[-1]["p"] in ",.?" and len(cur)>=2):
            flush()
    cur.append(w)
flush()
for p in pages:
    for w in p["words"]: w.pop("p",None)
json.dump(pages,open("captions.json","w"),ensure_ascii=False)
print(len(words),"words",len(pages),"pages")
for p in pages[:12]+pages[40:52]: print(f'{p["s"]:6.2f} '+" ".join(w["t"] for w in p["words"]))
