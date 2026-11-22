#!/usr/bin/env python3
"""Infografik MBKPPI Versi 5 - TEMA CERAH (rujukan Canva: biru #13257B + merah #D31F2A, jalur logo).
Menjana 8 slide HTML 1920x1080 -> src/slide-N.html"""
import os, math, re

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "src")
os.makedirs(OUT, exist_ok=True)
TOTAL = 8

# ikon garis daripada versi terdahulu (sumber tunggal)
_src = open(os.path.join(HERE, "build_dark.py"), encoding="utf-8").read()
_m = re.search(r"ICONS = \{.*?\n\}\n", _src, re.S)
ns = {}
exec(_m.group(0), ns)
ICONS = ns["ICONS"]

def ic(name, size=40, sw=1.6):
    return (f'<svg class="ic" width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" '
            f'stroke="currentColor" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round">{ICONS[name]}</svg>')

CSS = """
:root{--blue:#13257B;--blue2:#2A3F9E;--red:#D31F2A;--tint:#EEF1FA;--line:#D5DBEE;--ink:#13257B;--muted:#46548A}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:1920px;height:1080px;overflow:hidden}
body{font-family:'Inter','Liberation Sans',sans-serif;position:relative;color:var(--ink);-webkit-font-smoothing:antialiased}
.slide{position:absolute;inset:0;width:1920px;height:1080px;overflow:hidden;background:linear-gradient(180deg,#FFFFFF 0%,#F4F6FC 100%)}
.pattern{position:absolute;inset:0;pointer-events:none;
 background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'><g fill='none' stroke='%2313257B' stroke-opacity='.055' stroke-width='1.3'><rect x='35' y='35' width='70' height='70'/><rect x='35' y='35' width='70' height='70' transform='rotate(45 70 70)'/><circle cx='70' cy='70' r='49'/></g></svg>");
 -webkit-mask-image:linear-gradient(115deg,transparent 40%,#000 100%);mask-image:linear-gradient(115deg,transparent 40%,#000 100%)}
.serif{font-family:'Caladea','Liberation Serif',serif}
.abs{position:absolute}
.red{color:var(--red)}
.eyebrow{font-size:21px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:var(--blue);display:flex;align-items:center;gap:16px}
.eyebrow:before{content:"";width:52px;height:6px;background:linear-gradient(90deg,var(--red) 0 50%,var(--blue) 50% 100%)}
h1{font-weight:800;letter-spacing:-.015em;line-height:1.06;text-transform:uppercase;color:var(--blue)}
h1 em{font-style:normal;color:var(--red)}
.ic{display:block;flex:none}
.logos{position:absolute;height:78px;width:auto}
.ph{position:absolute;border:2.5px dashed var(--blue2);border-radius:10px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;text-align:center;padding:20px;
 background:repeating-linear-gradient(135deg,rgba(19,37,123,.06) 0 14px,rgba(19,37,123,.02) 14px 28px);color:var(--blue2)}
.ph b{font-size:22px;font-weight:700;letter-spacing:.04em;line-height:1.3;display:block}
.ph small{font-size:17px;font-weight:500;line-height:1.35;color:var(--muted);display:block;margin-top:6px}
.ph.sm{flex-direction:row;gap:16px;padding:12px 18px;text-align:left}
.ph.sm b{font-size:18px} .ph.sm small{font-size:15px}
.foot{position:absolute;left:0;right:0;bottom:0;height:46px;display:flex;align-items:center;justify-content:space-between;padding:0 56px;
 font-size:16px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;background:#fff;color:var(--muted);border-top:3px solid var(--blue)}
.foot b{color:var(--red);font-weight:800}
.foot .pg{font-family:'Caladea',serif;font-size:22px;letter-spacing:.05em;color:var(--blue);font-weight:700}
/* komponen kongsi */
.ib{display:flex;align-items:center;justify-content:center;flex:none;border-radius:50%;background:var(--blue);color:#fff}
.card{background:#fff;border:1.5px solid var(--line);border-top:8px solid var(--blue);border-radius:12px;box-shadow:0 10px 26px rgba(19,37,123,.10)}
li.b{list-style:none;position:relative}
"""

def page(n, body, extra_css=""):
    return f"""<!doctype html><html lang="ms"><head><meta charset="utf-8">
<title>Slide {n}</title><style>{CSS}{extra_css}</style></head>
<body><div class="slide"><div class="pattern"></div>{body}</div></body></html>"""

def ph(style, label, sub="", cls=""):
    return (f'<div class="ph {cls}" style="{style}">{ic("camera", 38 if "sm" in cls else 44)}'
            f'<div><b>[{label}]</b>{"<small>"+sub+"</small>" if sub else ""}</div></div>')

def logos(style):
    return f'<img class="logos" style="{style}" src="../logos/logo-strip.png" alt="Belanjawan Johor 2027 | Jata Johor | Maju Johor">'

def footer(n, small=True):
    st = ' style="height:36px;font-size:14px"' if small else ''
    pg = ' style="font-size:19px"' if small else ''
    return (f'<div class="foot"{st}><span>Soalan Lisan A182 &nbsp;|&nbsp; Mesyuarat Kedua Belanjawan 2027 &nbsp;|&nbsp; DUN Johor Ke-16</span>'
            f'<span><b>YB Fared Khalid</b></span><span class="pg"{pg}>{n:02d} / {TOTAL:02d}</span></div>')

BUL = "li{list-style:none}"
def bullets_css(sel, size, gap, pad=30, color="var(--ink)", bw=500):
    return (f"{sel} ul{{list-style:none;display:flex;flex-direction:column;gap:{gap}px}}"
            f"{sel} li{{font-size:{size}px;line-height:1.26;font-weight:{bw};color:{color};padding-left:{pad}px;position:relative}}"
            f"{sel} li:before{{content:'';position:absolute;left:3px;top:.5em;width:11px;height:11px;background:var(--red);transform:rotate(45deg)}}")

# ================================================================ SLIDE 1
s1_css = """
.s1-title{position:absolute;left:96px;top:128px;width:1000px;font-size:92px;line-height:1.04}
.s1-title em{display:block}
.s1-sub{position:absolute;left:96px;top:528px;width:900px;font-size:32px;line-height:1.35;font-weight:500;color:var(--muted);padding-left:26px;border-left:6px solid var(--red)}
.s1-sub b{color:var(--blue);font-weight:800}
.info{position:absolute;left:96px;top:664px;width:770px;display:flex;flex-direction:column;gap:18px}
.info div{display:flex;gap:22px;align-items:flex-start;font-size:26px;line-height:1.4;font-weight:500;color:var(--muted)}
.info i{flex:none;font-style:normal;font-family:'Caladea',serif;font-size:36px;line-height:1;color:var(--red);width:48px;margin-top:2px;font-weight:700}
.info b{color:var(--blue);font-weight:800}
.badge{position:absolute;left:890px;top:744px;width:212px;height:212px;border-radius:50%;background:var(--red);color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;border:8px solid #fff;box-shadow:0 0 0 3px var(--red),0 12px 28px rgba(211,31,42,.25)}
.badge small{font-size:20px;font-weight:800;letter-spacing:.22em}
.badge strong{font-family:'Caladea',serif;font-size:100px;line-height:.95;font-weight:700}
.label{position:absolute;left:0;right:0;bottom:0;height:112px;background:var(--blue);border-top:6px solid var(--red);color:#fff;display:flex;align-items:center;justify-content:space-between;padding:0 96px}
.label .a{font-size:38px;font-weight:800;letter-spacing:.06em;text-transform:uppercase}
.label .b{font-size:22px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;text-align:right;line-height:1.45;color:#DCE2F5}
.frame{position:absolute;left:1118px;top:150px;width:742px;height:740px;border:3px solid var(--red);border-radius:6px}
"""
s1 = f"""
{logos("right:60px;top:34px")}
<div class="abs eyebrow" style="left:96px;top:70px">Jawapan Soalan Lisan A182 &nbsp;·&nbsp; DUN Johor</div>
<h1 class="s1-title">Modul Kursus<br>Pra Perkahwinan<br>Islam Johor<em>Diperkasa</em></h1>
<div class="s1-sub">Penambahbaikan <b>Modul Bersepadu Kursus Pra Perkahwinan Islam (MBKPPI) Versi 5.</b></div>
<div class="info">
 <div><i>01</i><span><b>Dilancarkan pada 22 Oktober 2026</b></span></div>
 <div><i>02</i><span>Oleh <b>YB Pengerusi Jawatankuasa Hal Ehwal Agama Islam Negeri Johor</b></span></div>
 <div><i>03</i><span>Memastikan bakal pasangan bukan sahaja memahami hukum-hakam perkahwinan, malah mempunyai <b>ilmu, kemahiran dan persediaan praktikal</b> dalam mengurus kehidupan berkeluarga.</span></div>
</div>
<div class="frame"></div>
{ph("left:1146px;top:178px;width:742px;height:740px;border-radius:6px","LETAKKAN GAMBAR YB FARED DI SINI","Ketika menjawab soalan di Dewan Negeri Johor<br>Disyorkan potret 742 × 740 px")}
<div class="badge"><small>VERSI</small><strong>5</strong></div>
<div class="label"><div class="a">Mesyuarat Kedua &nbsp;<span style="opacity:.5">|</span>&nbsp; Belanjawan Johor 2027</div>
<div class="b">Penggal Persidangan Pertama<br>Dewan Negeri Johor Ke-16 &nbsp;·&nbsp; 23 November 2026</div></div>
"""

# ================================================================ SLIDE 2
comps = [("Tasawwur Islam","book"),("Perkahwinan dan Majlis Akad Nikah","rings"),("Prosedur Perkahwinan","clipboard"),
 ("Tanggungjawab Suami Isteri","users"),("Komunikasi Suami Isteri","chat"),("Pengurusan Kewangan","wallet"),
 ("Pengurusan Kesihatan","heartpulse"),("Pengurusan Stres dan Konflik","bolt"),("Pembubaran Perkahwinan","unlink")]
cards2 = ""
for i,(t,icn) in enumerate(comps):
    r,c = divmod(i,3)
    cards2 += f"""<div class="c2 card" style="left:{70+c*430}px;top:{268+r*204}px">
 <div class="n serif">0{i+1}</div><div class="ib">{ic(icn,38)}</div><div class="t">{t}</div></div>"""
s2_css = """
.s2-title{position:absolute;left:70px;top:112px;width:1250px;font-size:56px}
.c2{position:absolute;width:400px;height:184px;padding:14px 24px 18px}
.c2 .n{font-size:66px;line-height:1;color:var(--red);font-weight:700}
.c2 .ib{position:absolute;right:22px;top:18px;width:64px;height:64px}
.c2 .t{position:absolute;left:24px;right:20px;bottom:16px;font-size:28px;line-height:1.18;font-weight:700;color:var(--blue)}
.quote{position:absolute;left:0;right:0;top:896px;height:138px;background:var(--blue);display:flex;align-items:center;padding:0 70px;gap:34px;border-top:6px solid var(--red)}
.quote .q{font-family:'Caladea',serif;font-size:90px;line-height:1;color:#FF8F97;padding-top:26px}
.quote p{font-family:'Caladea',serif;font-style:italic;font-size:38px;line-height:1.28;color:#fff;width:1500px}
.quote p b{color:#FFB3B8;font-weight:700}
"""
s2 = f"""
{logos("right:70px;top:34px")}
<div class="abs eyebrow" style="left:70px;top:58px">Kandungan Modul MBKPPI Versi 5</div>
<h1 class="s2-title">9 Komponen Utama Membentuk <em>Keluarga Sejahtera</em></h1>
{cards2}
{ph("left:1400px;top:150px;width:450px;height:700px;border-radius:8px","LETAKKAN GAMBAR SUASANA PESERTA KURSUS DI SINI","Peserta mengikuti Kursus Pra Perkahwinan Islam<br>Disyorkan potret 450 × 700 px")}
<div class="quote"><div class="q">“</div><p>Persediaan menyeluruh untuk membina kehidupan berkeluarga yang lebih <b>berilmu, matang dan bertanggungjawab.</b></p></div>
{footer(2, False)}
"""

# ================================================================ SLIDE 3 (mind map ringkasan)
branches = [
 ("01","wallet","Pengurusan Kewangan &amp; Tanggungjawab Nafkah",
  ["Perancangan perbelanjaan","Amalan menabung","Pengurusan hutang","Tanggungjawab nafkah","Hak dan tanggungjawab suami isteri"]),
 ("02","chat","Komunikasi Suami Isteri",
  ["Komunikasi berkesan","Komunikasi era digital","Penggunaan media sosial secara beretika","Penjagaan privasi","Pembinaan kepercayaan dan saling memahami"]),
 ("03","smile","Pengurusan Kesihatan Mental",
  ["Kesedaran kesihatan mental","Mengenal pasti stres, keresahan dan kemurungan","Pengurusan emosi","Sokongan pasangan","Mendapatkan bantuan profesional"]),
 ("04","bolt","Pengurusan Konflik &amp; Tekanan Rumah Tangga",
  ["Pengawalan emosi","Komunikasi berkesan","Penyelesaian perselisihan secara matang","Pengurusan stres dan konflik"]),
 ("05","family","Kemahiran Keibubapaan",
  ["Pendidikan agama","Pembentukan akhlak anak-anak","Tanggungjawab bersama ibu bapa","Pembinaan keluarga sejahtera"]),
 ("06","dome","Pemantapan Akidah &amp; Tanggungjawab Suami Isteri",
  ["Pegangan Ahli Sunnah Wal Jamaah","Aliran Al-Asya'irah dan Al-Maturidiyyah","Konsep lelaki sebagai qawwam","Tanggungjawab memimpin, memberikan nafkah, melindungi dan membimbing keluarga","Memahami hak serta peranan masing-masing"]),
]
OV_H=230; OV_PITCH=290; OV_TOP=190
OV_CY = OV_TOP + (2*OV_PITCH+OV_H)/2
R = 188; CX = 960
def mm_paths():
    out=""
    for side in (0,1):
        sgn = -1 if side==0 else 1
        ex = 650 if side==0 else 1270
        for row in range(3):
            y = OV_TOP + row*OV_PITCH + OV_H/2
            if row==1:
                sx, sy = CX+sgn*R, OV_CY
                d = f"M{sx} {sy} L{ex} {y}"
            else:
                ang = math.radians(35 if row==0 else -35)
                sx = CX + sgn*R*math.cos(ang); sy = OV_CY - R*math.sin(ang)
                mx = (sx+ex)/2
                d = f"M{sx:.1f} {sy:.1f} C{mx:.1f} {sy:.1f} {mx:.1f} {y:.1f} {ex} {y:.1f}"
            out += f'<path d="{d}" fill="none" stroke="#13257B" stroke-width="3.5" stroke-linecap="round"/>'
            out += f'<circle cx="{ex}" cy="{y:.1f}" r="8" fill="#D31F2A"/><circle cx="{sx:.1f}" cy="{sy:.1f}" r="8" fill="#D31F2A"/>'
    return out
ov=""
for i,(n,icn,t,kw) in enumerate(branches):
    col,row = divmod(i,3)
    x = 40 if col==0 else 1270
    ov += f"""<div class="ov card" style="left:{x}px;top:{OV_TOP+row*OV_PITCH}px"><span class="num serif">{n}</span><span class="ib">{ic(icn,40)}</span><span class="tt">{t}</span></div>"""
s3_css = f"""
.s3-title{{position:absolute;left:40px;top:62px;font-size:56px}}
.ov{{position:absolute;width:610px;height:230px;padding:0 28px;display:flex;align-items:center;gap:22px}}
.ov .num{{font-size:72px;line-height:1;color:var(--red);font-weight:700}}
.ov .ib{{width:76px;height:76px}}
.ov .tt{{font-size:31px;line-height:1.16;font-weight:800;text-transform:uppercase;color:var(--blue)}}
.core{{position:absolute;left:{CX-R}px;top:{OV_CY-R}px;width:{2*R}px;height:{2*R}px;border-radius:50%;background:#fff;border:8px solid var(--blue);box-shadow:0 0 0 10px rgba(211,31,42,.16),0 14px 34px rgba(19,37,123,.18);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}}
.core small{{font-size:19px;font-weight:800;letter-spacing:.24em;color:var(--red)}}
.core h2{{font-size:56px;line-height:1.0;font-weight:800;letter-spacing:-.01em;margin:10px 0 14px;color:var(--blue)}}
.core h2 span{{color:var(--red);display:block}}
.core p{{font-size:19px;line-height:1.3;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--blue);width:270px}}
"""
s3 = f"""
<svg class="abs" style="left:0;top:0" width="1920" height="1080" viewBox="0 0 1920 1080">{mm_paths()}</svg>
{logos("right:40px;top:26px")}
<div class="abs eyebrow" style="left:40px;top:28px">Ringkasan &nbsp;·&nbsp; Butiran di slide 4 &amp; 5</div>
<h1 class="s3-title">6 Penambahbaikan Utama <em>Modul Versi 5</em></h1>
{ov}
<div class="core"><small>MBKPPI</small><h2>VERSI<span>5</span></h2><p>Persediaan menyeluruh bakal pasangan</p></div>
{ph("left:790px;top:858px;width:340px;height:132px;border-radius:8px","GAMBAR KURSUS","Ruang gambar kecil","sm")}
{footer(3)}
"""

# ================================================================ SLIDE 4 & 5 (butiran mind map)
dc_css = """
.dt{position:absolute;left:70px;top:112px;width:1260px;font-size:52px;line-height:1.06}
.dt em{font-style:normal;color:var(--red);display:block}
.dc{position:absolute;top:276px;width:573px;height:716px;padding:28px 32px}
.dc .top{display:flex;align-items:center;justify-content:space-between}
.dc .no{font-family:'Caladea',serif;font-size:80px;line-height:.9;font-weight:700;color:var(--red)}
.dc .ib{width:76px;height:76px}
.dc h3{margin-top:16px;font-size:31px;line-height:1.16;font-weight:800;text-transform:uppercase;color:var(--blue)}
.dc .rule{height:4px;width:90px;background:var(--red);margin:16px 0 22px}
""" + bullets_css(".dc", 27.5, 14, 34)
def detail(idx, eyebrow, line1, line2, n):
    cards=""
    for j,k in enumerate(idx):
        num,icn,t,kw = branches[k]
        lis = "".join(f"<li>{x}</li>" for x in kw)
        cards += f"""<div class="dc card" style="left:{70+j*603}px"><div class="top"><div class="no">{num}</div><div class="ib">{ic(icn,40)}</div></div>
<h3>{t}</h3><div class="rule"></div><ul>{lis}</ul></div>"""
    return f"""
{logos("right:70px;top:26px")}
<div class="abs eyebrow" style="left:70px;top:58px">{eyebrow}</div>
<h1 class="dt">{line1}<em>{line2}</em></h1>
{ph("left:1390px;top:132px;width:460px;height:112px;border-radius:8px","GAMBAR PENCERAMAH / PESERTA","Ruang gambar","sm")}
{cards}
{footer(n)}
"""
s4d = detail([0,1,2],"Penambahbaikan Modul Versi 5 &nbsp;·&nbsp; 01 – 03","Kewangan, komunikasi","&amp; kesihatan mental",4)
s5d = detail([3,4,5],"Penambahbaikan Modul Versi 5 &nbsp;·&nbsp; 04 – 06","Konflik, keibubapaan","&amp; pemantapan akidah",5)

# ================================================================ SLIDE 6 (tiga tiang)
s6_css = """
.s6-title{position:absolute;left:70px;top:112px;width:1260px;font-size:56px}
.s6-title em{font-style:normal;color:var(--red);display:block}
.pil{position:absolute;top:268px;height:728px;padding:28px 34px 24px}
.pil .top{display:flex;align-items:center;justify-content:space-between}
.pil .no{font-family:'Caladea',serif;font-size:76px;line-height:.9;font-weight:700;color:var(--red)}
.pil .ib{width:72px;height:72px}
.pil h3{margin-top:14px;font-size:29px;line-height:1.2;font-weight:800;text-transform:uppercase;color:var(--blue)}
.pil .rule{height:4px;width:90px;background:var(--red);margin:14px 0 14px}
.ind{margin-top:16px;padding:14px 16px 16px;border:2px solid var(--blue);border-radius:10px;background:var(--tint)}
.ind .lb{font-size:19px;font-weight:800;letter-spacing:.18em;text-transform:uppercase;color:var(--red);margin-bottom:10px}
.ind .g{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.ind .m{display:flex;align-items:center;gap:12px;background:var(--blue);border-radius:8px;padding:8px 12px;font-size:21px;line-height:1.15;font-weight:700;color:#fff}
.ind .m i{flex:none;width:38px;height:38px;border-radius:50%;background:var(--red);color:#fff;display:flex;align-items:center;justify-content:center;font-style:normal;font-family:'Caladea',serif;font-size:24px;font-weight:700}
""" + bullets_css(".pil", 23.5, 8, 30)
pills = [
 (70,540,"01","mic","Pemantapan Kompetensi Penceramah dan Kaedah Penyampaian",
  ["Latihan dan penyelarasan penyampaian modul","Pendekatan praktikal dan interaktif","Perbincangan dan kajian kes","Simulasi dan perkongsian pengalaman"],""),
 (640,640,"02","chart","Penambahbaikan Kaedah Penilaian dan Pemantauan Peserta",
  ["Penggunaan Sistem Pengurusan Perkahwinan Islam (SPPIM)","Pengurusan rekod penyertaan dan kehadiran","Ujian penilaian bagi setiap tajuk","Maklum balas peserta","Pemantauan dan penambahbaikan berterusan"],
  """<div class="ind"><div class="lb">4 Indikator Pemantauan</div><div class="g">
  <div class="m"><i>1</i>Kadar penyertaan</div><div class="m"><i>2</i>Pencapaian penilaian</div>
  <div class="m"><i>3</i>Tahap kefahaman</div><div class="m"><i>4</i>Kepuasan peserta</div></div></div>"""),
 (1310,540,"03","network","Pengukuhan Mekanisme Rujukan dan Kerjasama Antara Agensi",
  ["Mekanisme rujukan lebih tersusun","Kerjasama strategik dengan agensi berkaitan","Bimbingan dan sokongan selepas mengikuti kursus","Sokongan selepas mendirikan rumah tangga","Rujukan mengikut keperluan pasangan"],""),
]
p6 = ""
for x,w,no,icn,t,items,extra in pills:
    lis = "".join(f"<li>{k}</li>" for k in items)
    p6 += f"""<div class="pil card" style="left:{x}px;width:{w}px"><div class="top"><div class="no">{no}</div><div class="ib">{ic(icn,44)}</div></div>
<h3>{t}</h3><div class="rule"></div><ul>{lis}</ul>{extra}</div>"""
s6 = f"""
{logos("right:70px;top:26px")}
<div class="abs eyebrow" style="left:70px;top:58px">3 Pendekatan Keberkesanan Kursus</div>
<h1 class="s6-title">Bukan sekadar modul, <em>penyampaian turut diperkasa</em></h1>
{ph("left:1390px;top:132px;width:460px;height:112px;border-radius:8px","GAMBAR PENCERAMAH / SESI LATIHAN","Ruang gambar","sm")}
{p6}
{footer(6)}
"""

# ================================================================ SLIDE 7 & 8 (agensi)
agencies = [
 ("home","Bahagian Pembangunan Keluarga JAINJ",["Program pasca perkahwinan","Pengukuhan hubungan suami isteri","Khidmat nasihat berkaitan masalah rumah tangga"]),
 ("family","Yayasan Pembangunan Keluarga Darul Ta'zim (YPKDT)",["Bimbingan dan pembangunan institusi keluarga"]),
 ("scale","Jabatan Kehakiman Syariah Negeri Johor (JKSNJ)",["Khidmat berkaitan undang-undang keluarga Islam","Penyelesaian konflik rumah tangga"]),
 ("grad","Lembaga Penduduk dan Pembangunan Keluarga Negara (LPPKN)",["Khidmat runding cara","Pendidikan kekeluargaan"]),
 ("heartpulse","Jabatan Kesihatan Negeri Johor",["Rujukan berkaitan kesihatan mental","Bantuan profesional"]),
 ("coins","Majlis Agama Islam Negeri Johor (MAINJ)",["Bantuan kewangan","Bantuan kebajikan kepada pasangan yang memenuhi syarat kelayakan"]),
 ("shield","Jabatan Kebajikan Masyarakat (JKM)",["Bantuan kebajikan","Perlindungan sosial"]),
 ("calc","Agensi Kaunseling dan Pengurusan Kredit (AKPK)",["Pendidikan kewangan","Khidmat nasihat pengurusan hutang"]),
]
ag2_css = """
.s5-title{position:absolute;left:40px;top:50px;font-size:58px;line-height:1.0}
.s5-title span{display:block;font-size:34px;color:var(--red);margin-top:10px;letter-spacing:.01em}
.note{position:absolute;right:40px;top:112px;width:760px;text-align:right;font-size:23px;line-height:1.35;font-weight:500;color:var(--muted);border-right:6px solid var(--red);padding-right:20px}
.note b{color:var(--blue);font-weight:800}
.ag2{position:absolute;width:905px;padding:20px 30px 18px}
.ag2 .top{display:flex;align-items:center;gap:20px;padding-bottom:14px;border-bottom:2px solid var(--line);margin-bottom:14px}
.ag2 .n{font-family:'Caladea',serif;font-size:58px;line-height:1;font-weight:700;color:var(--red)}
.ag2 h4{flex:1;font-size:29px;line-height:1.15;font-weight:800;text-transform:uppercase;color:var(--blue)}
.ag2 .ib{width:68px;height:68px}
.hub2{position:absolute;left:40px;top:196px;width:1840px;height:76px;background:var(--blue);color:#fff;border-radius:10px;border-bottom:5px solid var(--red);display:flex;align-items:center;justify-content:center;gap:24px}
.hub2 .t{font-size:28px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;line-height:1.1}
.hub2 .s{font-size:19px;font-weight:600;margin-top:2px;color:#DCE2F5}
.end2{position:absolute;left:40px;top:748px;width:1840px;height:252px;border:2px solid var(--blue);border-left:10px solid var(--red);border-radius:12px;background:var(--tint);display:flex;align-items:center;gap:32px;padding:0 28px}
.end2 p{font-family:'Caladea',serif;font-size:32px;line-height:1.3;color:var(--blue);font-style:italic}
.end2 p b{color:var(--red);font-weight:700}
""" + bullets_css(".ag2", 27, 8, 32)
def ag_cards(ids, tops, h):
    out=""
    for k,i in enumerate(ids):
        icn,name,fn = agencies[i]
        r,c = divmod(k,2)
        lis = "".join(f"<li>{f}</li>" for f in fn)
        out += f"""<div class="ag2 card" style="left:{40+c*935}px;top:{tops[r]}px;height:{h}px"><div class="top"><span class="n">0{i+1}</span><h4>{name}</h4><span class="ib">{ic(icn,36)}</span></div><ul>{lis}</ul></div>"""
    return out
title5 = '<h1 class="s5-title">8 Agensi, Satu Matlamat<span>– Memperkukuh Institusi Kekeluargaan</span></h1>'
t7=(304,664); h7=330
st7=""
for cx in (40+452.5, 975+452.5):
    st7 += f'<line x1="{cx}" y1="272" x2="{cx}" y2="304" stroke="#D31F2A" stroke-width="4"/><line x1="{cx}" y1="634" x2="{cx}" y2="664" stroke="#D31F2A" stroke-width="4"/>'
s7 = f"""
<svg class="abs" style="left:0;top:0" width="1920" height="1080">{st7}</svg>
{logos("right:40px;top:34px")}
<div class="abs eyebrow" style="left:40px;top:20px;font-size:19px">Agensi Sokongan Strategik &nbsp;·&nbsp; 01 – 04</div>
{title5}
{ph("left:900px;top:34px;width:520px;height:130px;border-radius:8px","GAMBAR YB FARED / AKTIVITI","Ruang gambar","sm")}
<div class="hub2"><div>{ic("building",46,1.8)}</div><div><div class="t">JAINJ — Pusat Penyelarasan Mekanisme Rujukan</div><div class="s">Agensi di bawah boleh dilibatkan mengikut keperluan pasangan</div></div></div>
{ag_cards([0,1,2,3], t7, h7)}
{footer(7)}
"""
t8=(190,468); h8=262
s8 = f"""
{logos("right:40px;top:22px;height:74px")}
<div class="abs eyebrow" style="left:40px;top:20px;font-size:19px">Agensi Sokongan Strategik &nbsp;·&nbsp; 05 – 08</div>
{title5}
<div class="note">Agensi yang <b>boleh dilibatkan</b> mengikut keperluan pasangan — sebelum dan selepas mendirikan rumah tangga.</div>
{ag_cards([4,5,6,7], t8, h8)}
<div class="end2">
 {ph("position:relative;flex:none;width:340px;height:176px;border-radius:8px","GAMBAR YB FARED / AKTIVITI KURSUS","Ruang gambar")}
 <p>“Kerajaan Negeri Johor melalui JAINJ komited untuk terus menambah baik pelaksanaan Kursus Pra Perkahwinan Islam sebagai medium persediaan menyeluruh bagi melahirkan pasangan yang <b>lebih berilmu, matang, bertanggungjawab dan berkemahiran</b> dalam menghadapi cabaran rumah tangga ke arah pembentukan keluarga <b>sakinah, mawaddah wa rahmah.</b>”</p>
</div>
{footer(8)}
"""

slides = [(1,s1,s1_css),(2,s2,s2_css),(3,s3,s3_css),(4,s4d,dc_css),(5,s5d,dc_css),(6,s6,s6_css),(7,s7,ag2_css),(8,s8,ag2_css)]
for n,body,css in slides:
    with open(os.path.join(OUT,f"slide-{n}.html"),"w",encoding="utf-8") as f:
        f.write(page(n,body,css))
print("ok")
