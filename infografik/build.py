#!/usr/bin/env python3
"""Menjana 5 slide infografik (HTML 1920x1080) -> src/slide-N.html"""
import os, math

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "src")
os.makedirs(OUT, exist_ok=True)

ICONS = {
 "book": '<path d="M2 4h7a3 3 0 0 1 3 3v14a2 2 0 0 0-2-2H2z"/><path d="M22 4h-7a3 3 0 0 0-3 3v14a2 2 0 0 1 2-2h8z"/>',
 "rings": '<circle cx="8.5" cy="15" r="5"/><circle cx="15.5" cy="15" r="5"/><path d="M9.5 5l2.5-3 2.5 3-2.5 2.5z"/>',
 "clipboard": '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1"/><path d="M9 13l2 2 4-4"/>',
 "users": '<circle cx="9" cy="8" r="3.2"/><path d="M2.5 20c0-3.5 3-6 6.5-6s6.5 2.5 6.5 6"/><circle cx="17.5" cy="9" r="2.5"/><path d="M17 14.2c2.8.2 4.8 2.2 4.8 5"/>',
 "chat": '<path d="M4 4h12a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-6l-4 3.5V15H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/><path d="M21 9.5a2 2 0 0 1 1 1.7V18l-3-2.5h-5"/>',
 "wallet": '<path d="M3 7a2 2 0 0 1 2-2h13v4"/><rect x="3" y="7" width="18" height="13" rx="2"/><circle cx="16.5" cy="13.5" r="1.3"/>',
 "heartpulse": '<path d="M12 20.5s-8.5-5-8.5-11A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 8.5 2.5c0 6-8.5 11-8.5 11z"/><path d="M6 12h3l1.5-3 3 6 1.5-3h3"/>',
 "bolt": '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
 "unlink": '<path d="M10 14a4 4 0 0 1 0-5.6l2-2a4 4 0 0 1 5.6 0"/><path d="M14 10a4 4 0 0 1 0 5.6l-2 2a4 4 0 0 1-5.6 0"/><path d="M3 3l18 18"/>',
 "smile": '<circle cx="12" cy="12" r="9"/><path d="M8 14s1.5 2.5 4 2.5S16 14 16 14"/><path d="M9 9.5h.01M15 9.5h.01"/>',
 "family": '<circle cx="8" cy="6" r="2.6"/><circle cx="17" cy="9.5" r="2"/><path d="M3 20v-5a5 5 0 0 1 10 0v5"/><path d="M14.5 20v-3a3 3 0 0 1 5.5 0v3"/>',
 "dome": '<path d="M12 2v2.5"/><path d="M5 14a7 7 0 0 1 14 0"/><path d="M3 14h18v7H3z"/><path d="M9.5 21v-3.5a2.5 2.5 0 0 1 5 0V21"/>',
 "mic": '<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v4M8 22h8"/>',
 "chart": '<rect x="4" y="12" width="4" height="8"/><rect x="10" y="7" width="4" height="13"/><rect x="16" y="3" width="4" height="17"/>',
 "network": '<circle cx="12" cy="5" r="2.5"/><circle cx="5" cy="19" r="2.5"/><circle cx="19" cy="19" r="2.5"/><path d="M12 7.5v4M12 11.5L6.5 17M12 11.5l5.5 5.5"/>',
 "home": '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M12 17s-2.5-1.5-2.5-3.2a1.5 1.5 0 0 1 2.5-1 1.5 1.5 0 0 1 2.5 1C14.5 15.5 12 17 12 17z"/>',
 "scale": '<path d="M12 3v18M7 21h10M5 7h14"/><path d="M5 7l-3 7a3 3 0 0 0 6 0z"/><path d="M19 7l-3 7a3 3 0 0 0 6 0z"/>',
 "grad": '<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11.5V16c0 1.5 3 3 6 3s6-1.5 6-3v-4.5"/>',
 "coins": '<ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v6c0 1.7 3 3 7 3s7-1.3 7-3V6"/><path d="M5 12v6c0 1.7 3 3 7 3s7-1.3 7-3v-6"/>',
 "shield": '<path d="M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5z"/><path d="M9 12l2 2 4-4"/>',
 "calc": '<rect x="5" y="2" width="14" height="20" rx="2"/><rect x="8" y="5" width="8" height="4"/><path d="M8 13h.01M12 13h.01M16 13h.01M8 17h.01M12 17h.01M16 17h.01"/>',
 "camera": '<path d="M3 8h4l2-3h6l2 3h4v12H3z"/><circle cx="12" cy="13" r="4"/>',
 "building": '<path d="M4 21V5l8-3 8 3v16"/><path d="M2 21h20"/><path d="M9 9h.01M15 9h.01M9 13h.01M15 13h.01"/><path d="M10 21v-4h4v4"/>',
}

def ic(name, size=40, sw=1.6):
    return (f'<svg class="ic" width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" '
            f'stroke="currentColor" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round">{ICONS[name]}</svg>')

CSS = """
:root{--navy:#0A1B3D;--navy2:#12295A;--navy3:#07122B;--gold:#D9B45F;--goldd:#9C7424;--ivory:#F5F0E4;--white:#fff}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:1920px;height:1080px;overflow:hidden}
body{font-family:'Inter','Liberation Sans',sans-serif;position:relative;color:#fff;-webkit-font-smoothing:antialiased}
.slide{position:absolute;inset:0;width:1920px;height:1080px;overflow:hidden}
.dark{background:radial-gradient(1400px 900px at 78% 20%,#16346F 0%,var(--navy) 55%,var(--navy3) 100%)}
.light{background:var(--ivory);color:var(--navy)}
.pattern{position:absolute;inset:0;pointer-events:none;
 background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'><g fill='none' stroke='%23D9B45F' stroke-opacity='.10' stroke-width='1.2'><rect x='35' y='35' width='70' height='70'/><rect x='35' y='35' width='70' height='70' transform='rotate(45 70 70)'/><circle cx='70' cy='70' r='49'/></g></svg>");
 -webkit-mask-image:linear-gradient(115deg,transparent 35%,#000 100%);mask-image:linear-gradient(115deg,transparent 35%,#000 100%)}
.pattern.l{background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'><g fill='none' stroke='%230A1B3D' stroke-opacity='.06' stroke-width='1.2'><rect x='35' y='35' width='70' height='70'/><rect x='35' y='35' width='70' height='70' transform='rotate(45 70 70)'/><circle cx='70' cy='70' r='49'/></g></svg>")}
.serif{font-family:'Caladea','Liberation Serif',serif}
.gold{color:var(--gold)} .goldd{color:var(--goldd)}
.abs{position:absolute}
.eyebrow{font-size:21px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;color:var(--gold);display:flex;align-items:center;gap:16px}
.eyebrow:before{content:"";width:48px;height:3px;background:var(--gold)}
.light .eyebrow{color:var(--goldd)} .light .eyebrow:before{background:var(--goldd)}
h1{font-weight:800;letter-spacing:-.015em;line-height:1.06;text-transform:uppercase}
.ic{display:block;flex:none}
.ph{position:absolute;border:2.5px dashed var(--gold);border-radius:10px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;text-align:center;padding:20px;
 background:repeating-linear-gradient(135deg,rgba(217,180,95,.07) 0 14px,rgba(217,180,95,.02) 14px 28px);color:var(--gold)}
.ph b{font-size:22px;font-weight:700;letter-spacing:.04em;line-height:1.3;display:block}
.ph small{font-size:17px;font-weight:500;opacity:.85;line-height:1.35;color:#fff;display:block;margin-top:6px}
.light .ph{border-color:var(--goldd);color:var(--goldd);background:repeating-linear-gradient(135deg,rgba(10,27,61,.05) 0 14px,rgba(10,27,61,.02) 14px 28px)}
.light .ph small{color:var(--navy)}
.ph.sm{flex-direction:row;gap:16px;padding:12px 18px;text-align:left}
.ph.sm b{font-size:18px} .ph.sm small{font-size:15px}
.foot{position:absolute;left:0;right:0;bottom:0;height:46px;display:flex;align-items:center;justify-content:space-between;padding:0 56px;
 font-size:16px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;background:var(--navy3);color:rgba(255,255,255,.72);border-top:2px solid var(--gold)}
.foot b{color:var(--gold);font-weight:800}
.foot .pg{font-family:'Caladea',serif;font-size:22px;letter-spacing:.05em;color:var(--gold)}
"""

def page(n, theme, body, extra_css=""):
    return f"""<!doctype html><html lang="ms"><head><meta charset="utf-8">
<title>Slide {n}</title><style>{CSS}{extra_css}</style></head>
<body><div class="slide {theme}"><div class="pattern {'l' if theme=='light' else ''}"></div>{body}</div></body></html>"""

def ph(style, label, sub="", cls=""):
    return (f'<div class="ph {cls}" style="{style}">{ic("camera", 38 if "sm" in cls else 44)}'
            f'<div><b>[{label}]</b>{"<small>"+sub+"</small>" if sub else ""}</div></div>')

def footer(n, small=False):
    st = ' style="height:36px;font-size:14px"' if small else ''
    pg = ' style="font-size:19px"' if small else ''
    return (f'<div class="foot"{st}><span>Soalan Lisan A182 &nbsp;|&nbsp; Mesyuarat Kedua Belanjawan 2027 &nbsp;|&nbsp; DUN Johor Ke-16</span>'
            f'<span><b>YB Fared Khalid</b>{"" if small else " &nbsp;·&nbsp; Pengerusi Jawatankuasa Hal Ehwal Agama Islam Negeri Johor"}</span>'
            f'<span class="pg"{pg}>0{n} / 05</span></div>')

# ------------------------------------------------------------------ SLIDE 1
s1_css = """
.s1-title{position:absolute;left:96px;top:128px;width:1000px;font-size:92px;line-height:1.04}
.s1-title em{font-style:normal;color:var(--gold);display:block}
.s1-sub{position:absolute;left:96px;top:528px;width:900px;font-size:32px;line-height:1.35;font-weight:500;color:#E8ECF5;padding-left:26px;border-left:5px solid var(--gold)}
.s1-sub b{color:var(--gold);font-weight:700}
.info{position:absolute;left:96px;top:664px;width:900px;display:flex;flex-direction:column;gap:18px}
.info div{display:flex;gap:22px;align-items:flex-start;font-size:26px;line-height:1.4;font-weight:500;color:#DDE3F0}
.info i{flex:none;font-style:normal;font-family:'Caladea',serif;font-size:36px;line-height:1;color:var(--gold);width:48px;margin-top:2px}
.info b{color:#fff;font-weight:700}
.badge{position:absolute;left:1040px;top:738px;width:212px;height:212px;border-radius:50%;background:var(--gold);color:var(--navy);display:flex;flex-direction:column;align-items:center;justify-content:center;border:8px solid var(--navy);box-shadow:0 0 0 3px var(--gold)}
.badge small{font-size:20px;font-weight:800;letter-spacing:.22em}
.badge strong{font-family:'Caladea',serif;font-size:100px;line-height:.95;font-weight:700}
.label{position:absolute;left:0;right:0;bottom:0;height:112px;background:var(--gold);color:var(--navy);display:flex;align-items:center;justify-content:space-between;padding:0 96px}
.label .a{font-size:38px;font-weight:800;letter-spacing:.06em;text-transform:uppercase}
.label .b{font-size:22px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;text-align:right;line-height:1.45}
.frame{position:absolute;left:1118px;top:70px;width:742px;height:820px;border:3px solid var(--gold);border-radius:6px}
"""
s1 = f"""
<div class="abs eyebrow" style="left:96px;top:70px">Jawapan Soalan Lisan A182 &nbsp;·&nbsp; DUN Johor</div>
<h1 class="s1-title">Modul Kursus<br>Pra Perkahwinan<br>Islam Johor<em>Diperkasa</em></h1>
<div class="s1-sub">Penambahbaikan <b>Modul Bersepadu Kursus Pra Perkahwinan Islam (MBKPPI) Versi 5.</b></div>
<div class="info">
 <div><i>01</i><span><b>Dilancarkan pada 22 Oktober 2026</b></span></div>
 <div><i>02</i><span>Oleh <b>YB Pengerusi Jawatankuasa Hal Ehwal Agama Islam Negeri Johor</b></span></div>
 <div><i>03</i><span>Memastikan bakal pasangan bukan sahaja memahami hukum-hakam perkahwinan, malah mempunyai <b>ilmu, kemahiran dan persediaan praktikal</b> dalam mengurus kehidupan berkeluarga.</span></div>
</div>
<div class="frame"></div>
{ph("left:1146px;top:98px;width:742px;height:820px;border-radius:6px","LETAKKAN GAMBAR YB FARED DI SINI","Ketika menjawab soalan di Dewan Negeri Johor<br>Disyorkan potret 742 × 820 px")}
<div class="badge"><small>VERSI</small><strong>5</strong></div>
<div class="label"><div class="a">Mesyuarat Kedua &nbsp;<span style="opacity:.55">|</span>&nbsp; Belanjawan Johor 2027</div>
<div class="b">Penggal Persidangan Pertama<br>Dewan Negeri Johor Ke-16 &nbsp;·&nbsp; 23 November 2026</div></div>
"""

# ------------------------------------------------------------------ SLIDE 2
comps = [("Tasawwur Islam","book"),("Perkahwinan dan Majlis Akad Nikah","rings"),("Prosedur Perkahwinan","clipboard"),
 ("Tanggungjawab Suami Isteri","users"),("Komunikasi Suami Isteri","chat"),("Pengurusan Kewangan","wallet"),
 ("Pengurusan Kesihatan","heartpulse"),("Pengurusan Stres dan Konflik","bolt"),("Pembubaran Perkahwinan","unlink")]
cards2 = ""
for i,(t,icn) in enumerate(comps):
    r,c = divmod(i,3)
    cards2 += f"""<div class="c2" style="left:{70+c*430}px;top:{268+r*204}px">
 <div class="n serif">0{i+1}</div><div class="ib">{ic(icn,38)}</div><div class="t">{t}</div></div>"""
s2_css = """
.s2-title{position:absolute;left:70px;top:112px;width:1250px;font-size:56px;color:var(--navy)}
.s2-title em{font-style:normal;color:var(--goldd)}
.c2{position:absolute;width:400px;height:184px;background:#fff;border-radius:8px;box-shadow:0 10px 28px rgba(10,27,61,.10);border-top:5px solid var(--navy);padding:16px 24px 18px}
.c2 .n{font-size:66px;line-height:1;color:var(--goldd);font-weight:700}
.c2 .ib{position:absolute;right:22px;top:20px;width:64px;height:64px;border-radius:50%;background:var(--navy);color:var(--gold);display:flex;align-items:center;justify-content:center}
.c2 .t{position:absolute;left:24px;right:20px;bottom:16px;font-size:28px;line-height:1.18;font-weight:700;color:var(--navy)}
.quote{position:absolute;left:0;right:0;top:896px;height:138px;background:var(--navy);display:flex;align-items:center;padding:0 70px;gap:34px}
.quote .q{font-family:'Caladea',serif;font-size:140px;line-height:.7;color:var(--gold);height:60px}
.quote p{font-family:'Caladea',serif;font-style:italic;font-size:38px;line-height:1.28;color:#fff;width:1500px}
.quote p b{color:var(--gold);font-weight:700}
"""
s2 = f"""
<div class="abs eyebrow" style="left:70px;top:58px">Kandungan Modul MBKPPI Versi 5</div>
<h1 class="s2-title">9 Komponen Utama Membentuk <em>Keluarga Sejahtera</em></h1>
{cards2}
{ph("left:1400px;top:62px;width:450px;height:790px;border-radius:8px","LETAKKAN GAMBAR SUASANA PESERTA KURSUS DI SINI","Peserta mengikuti Kursus Pra Perkahwinan Islam<br>Disyorkan potret 450 × 790 px")}
<div class="quote"><div class="q">“</div><p>Persediaan menyeluruh untuk membina kehidupan berkeluarga yang lebih <b>berilmu, matang dan bertanggungjawab.</b></p></div>
{footer(2)}
"""

# ------------------------------------------------------------------ SLIDE 3
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
CARD_H = 270; PITCH = 281; TOP0 = 180
cards3 = ""
for i,(n,icn,t,kw) in enumerate(branches):
    col, row = divmod(i,3)
    x = 40 if col==0 else 1270
    y = TOP0 + row*PITCH
    lis = "".join(f"<li>{k}</li>" for k in kw)
    cards3 += f"""<div class="c3" style="left:{x}px;top:{y}px">
 <div class="hd"><span class="num serif">{n}</span><span class="ib">{ic(icn,30)}</span><span class="tt">{t}</span></div>
 <ul>{lis}</ul></div>"""
CX, CY, R = 960, 596, 188
def cy_of(row): return TOP0 + row*PITCH + CARD_H/2
paths = ""
for side in (0,1):
    sgn = -1 if side==0 else 1
    ex = 650 if side==0 else 1270
    for row in range(3):
        y = cy_of(row)
        if row==1:
            sx, sy = CX+sgn*R, CY
            d = f"M{sx} {sy} L{ex} {y}"
        else:
            ang = math.radians(35 if row==0 else -35)
            sx = CX + sgn*R*math.cos(ang)
            sy = CY - R*math.sin(ang)
            mx = (sx+ex)/2
            d = f"M{sx:.1f} {sy:.1f} C{mx:.1f} {sy:.1f} {mx:.1f} {y:.1f} {ex} {y:.1f}"
        paths += f'<path d="{d}" fill="none" stroke="#D9B45F" stroke-width="3" stroke-linecap="round"/>'
        paths += f'<circle cx="{ex}" cy="{y:.1f}" r="7" fill="#D9B45F"/><circle cx="{sx:.1f}" cy="{sy:.1f}" r="7" fill="#D9B45F"/>'
s3_css = """
.s3-title{position:absolute;left:40px;top:62px;font-size:56px}
.s3-title em{font-style:normal;color:var(--gold)}
.c3{position:absolute;width:610px;height:270px;background:linear-gradient(160deg,#142E63,#0E2150);border:1.5px solid rgba(217,180,95,.55);border-radius:12px;padding:16px 22px 14px}
.c3 .hd{display:flex;align-items:center;gap:14px;padding-bottom:10px;border-bottom:1.5px solid rgba(217,180,95,.45);margin-bottom:10px}
.c3 .num{font-size:42px;line-height:1;color:var(--gold);font-weight:700}
.c3 .ib{width:48px;height:48px;border-radius:50%;border:2px solid var(--gold);color:var(--gold);display:flex;align-items:center;justify-content:center;flex:none}
.c3 .tt{font-size:24px;line-height:1.15;font-weight:800;text-transform:uppercase;letter-spacing:.01em;color:#fff}
.c3 ul{list-style:none;display:flex;flex-direction:column;gap:2px}
.c3 li{font-size:21.5px;line-height:1.24;font-weight:500;color:#E6EBF6;padding-left:22px;position:relative}
.c3 li:before{content:"";position:absolute;left:2px;top:.52em;width:9px;height:9px;background:var(--gold);transform:rotate(45deg)}
.core{position:absolute;left:772px;top:408px;width:376px;height:376px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#1B3F86,#0B1F48 70%);border:4px solid var(--gold);box-shadow:0 0 0 12px rgba(217,180,95,.14),0 0 0 14px rgba(217,180,95,.5);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}
.core small{font-size:19px;font-weight:800;letter-spacing:.24em;color:var(--gold)}
.core h2{font-size:56px;line-height:1.0;font-weight:800;letter-spacing:-.01em;margin:10px 0 14px}
.core h2 span{color:var(--gold);display:block}
.core p{font-size:19px;line-height:1.3;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#E6EBF6;width:270px}
"""
s3 = f"""
<svg class="abs" style="left:0;top:0" width="1920" height="1080" viewBox="0 0 1920 1080">{paths}</svg>
<div class="abs eyebrow" style="left:40px;top:28px">Versi 5 &nbsp;·&nbsp; Penambahbaikan Modul</div>
<h1 class="s3-title">6 Penambahbaikan Utama <em>Modul Versi 5</em></h1>
{ph("left:1500px;top:30px;width:380px;height:128px;border-radius:8px","GAMBAR PENCERAMAH / PESERTA","Ruang gambar kecil","sm")}
{cards3}
<div class="core"><small>MBKPPI</small><h2>VERSI<span>5</span></h2><p>Persediaan menyeluruh bakal pasangan</p></div>
{footer(3, True)}
"""

# ------------------------------------------------------------------ SLIDE 4
s4_css = """
.s4-title{position:absolute;left:70px;top:112px;width:1260px;font-size:56px;color:var(--navy)}
.s4-title em{font-style:normal;color:var(--goldd);display:block}
.pil{position:absolute;top:268px;height:736px;background:linear-gradient(170deg,#142E63,var(--navy));border-radius:12px;padding:30px 34px 28px;border-top:10px solid var(--gold);box-shadow:0 18px 40px rgba(10,27,61,.22);color:#fff}
.pil .top{display:flex;align-items:center;justify-content:space-between}
.pil .no{font-family:'Caladea',serif;font-size:76px;line-height:.9;font-weight:700;color:var(--gold)}
.pil .ib{width:72px;height:72px;border-radius:50%;border:2.5px solid var(--gold);color:var(--gold);display:flex;align-items:center;justify-content:center}
.pil h3{margin-top:14px;font-size:29px;line-height:1.2;font-weight:800;text-transform:uppercase;letter-spacing:.005em}
.pil .rule{height:3px;width:90px;background:var(--gold);margin:14px 0 14px}
.pil ul{list-style:none;display:flex;flex-direction:column;gap:8px}
.pil li{font-size:23.5px;line-height:1.28;font-weight:500;color:#E6EBF6;padding-left:30px;position:relative}
.pil li:before{content:"";position:absolute;left:3px;top:.5em;width:11px;height:11px;background:var(--gold);transform:rotate(45deg)}
.ind{margin-top:16px;padding:14px 16px 16px;border:2px solid var(--gold);border-radius:10px;background:rgba(217,180,95,.08)}
.ind .lb{font-size:19px;font-weight:800;letter-spacing:.18em;text-transform:uppercase;color:var(--gold);margin-bottom:10px}
.ind .g{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.ind .m{display:flex;align-items:center;gap:12px;background:var(--navy3);border-radius:8px;padding:8px 12px;font-size:21px;line-height:1.15;font-weight:700;color:#fff}
.ind .m i{flex:none;width:38px;height:38px;border-radius:50%;background:var(--gold);color:var(--navy);display:flex;align-items:center;justify-content:center;font-style:normal;font-family:'Caladea',serif;font-size:24px;font-weight:700}
"""
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
p4 = ""
for x,w,no,icn,t,items,extra in pills:
    lis = "".join(f"<li>{k}</li>" for k in items)
    p4 += f"""<div class="pil" style="left:{x}px;width:{w}px"><div class="top"><div class="no">{no}</div><div class="ib">{ic(icn,44)}</div></div>
<h3>{t}</h3><div class="rule"></div><ul>{lis}</ul>{extra}</div>"""
s4 = f"""
<div class="abs eyebrow" style="left:70px;top:58px">3 Pendekatan Keberkesanan Kursus</div>
<h1 class="s4-title">Bukan sekadar modul, <em>penyampaian turut diperkasa</em></h1>
{ph("left:1390px;top:46px;width:460px;height:196px;border-radius:8px","LETAKKAN GAMBAR PENCERAMAH / SESI LATIHAN DI SINI","Penceramah sedang menyampaikan kursus")}
{p4}
{footer(4, True)}
"""

# ------------------------------------------------------------------ SLIDE 5
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
A_W, A_GAP, A_H = 445, 20, 258
R1, R2 = 182, 548
HUB_TOP = R1 + A_H + 22
HUB_H = (R2 - 22) - HUB_TOP
ac = ""; stubs = ""
for i,(icn,name,fn) in enumerate(agencies):
    r,c = divmod(i,4)
    x = 40 + c*(A_W+A_GAP); y = R1 if r==0 else R2
    lis = "".join(f"<li>{f}</li>" for f in fn)
    ac += f"""<div class="ag" style="left:{x}px;top:{y}px"><div class="top"><span class="n serif">0{i+1}</span><span class="ib">{ic(icn,32)}</span></div>
<h4>{name}</h4><ul>{lis}</ul></div>"""
    cx = x + A_W/2
    sy1, sy2 = (R1+A_H, R1+A_H+22) if r==0 else (R2-22, R2)
    stubs += f'<line x1="{cx}" y1="{sy1}" x2="{cx}" y2="{sy2}" stroke="#D9B45F" stroke-width="3"/>'
s5_css = """
.s5-title{position:absolute;left:40px;top:50px;font-size:58px;line-height:1.0}
.s5-title span{display:block;font-size:34px;color:var(--gold);margin-top:10px;letter-spacing:.01em}
.note{position:absolute;right:40px;top:52px;width:560px;text-align:right;font-size:23px;line-height:1.35;font-weight:500;color:#DDE3F0;border-right:5px solid var(--gold);padding-right:20px}
.note b{color:var(--gold);font-weight:700}
.ag{position:absolute;width:445px;height:258px;background:linear-gradient(160deg,#142E63,#0E2150);border:1.5px solid rgba(217,180,95,.55);border-radius:12px;padding:16px 22px 14px}
.ag .top{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}
.ag .n{font-size:38px;line-height:1;font-weight:700;color:var(--gold)}
.ag .ib{width:46px;height:46px;border-radius:50%;border:2px solid var(--gold);color:var(--gold);display:flex;align-items:center;justify-content:center}
.ag h4{font-size:22px;line-height:1.16;font-weight:800;text-transform:uppercase;color:var(--gold);padding-bottom:10px;border-bottom:1.5px solid rgba(217,180,95,.4);margin-bottom:10px}
.ag ul{list-style:none;display:flex;flex-direction:column;gap:3px}
.ag li{font-size:21px;line-height:1.24;font-weight:500;color:#fff;padding-left:22px;position:relative}
.ag li:before{content:"";position:absolute;left:2px;top:.52em;width:9px;height:9px;background:var(--gold);transform:rotate(45deg)}
.hub{position:absolute;left:40px;top:HUBTOPpx;width:1840px;height:HUBHpx;background:var(--gold);color:var(--navy);border-radius:10px;display:flex;align-items:center;justify-content:center;gap:26px}
.hub .t{font-size:28px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;line-height:1.1}
.hub .s{font-size:19px;font-weight:600;letter-spacing:.02em;margin-top:3px}
.end{position:absolute;left:40px;top:830px;width:1840px;height:160px;border:2px solid var(--gold);border-radius:12px;background:rgba(7,18,43,.55);display:flex;align-items:center;gap:30px;padding:0 24px}
.end p{font-family:'Caladea',serif;font-size:27px;line-height:1.32;color:#fff;font-style:italic}
.end p b{color:var(--gold);font-weight:700}
""".replace("HUBTOP", str(HUB_TOP)).replace("HUBH", str(HUB_H))
s5 = f"""
<svg class="abs" style="left:0;top:0" width="1920" height="1080">{stubs}</svg>
<div class="abs eyebrow" style="left:40px;top:20px;font-size:19px">Mekanisme Rujukan &amp; Kerjasama Strategik</div>
<h1 class="s5-title">8 Agensi, Satu Matlamat<span>– Memperkukuh Institusi Kekeluargaan</span></h1>
<div class="note">Agensi yang <b>boleh dilibatkan</b> mengikut keperluan pasangan — sebelum dan selepas mendirikan rumah tangga.</div>
{ac}
<div class="hub"><div>{ic("building",46,1.8)}</div><div><div class="t">JAINJ — Pusat Penyelarasan Mekanisme Rujukan</div><div class="s">Memperkukuh rujukan dan kerjasama strategik antara agensi berkaitan</div></div></div>
<div class="end">
 {ph("position:relative;flex:none;width:300px;height:118px;border-radius:8px","GAMBAR YB FARED / AKTIVITI KURSUS","Ruang gambar","sm")}
 <p>“Kerajaan Negeri Johor melalui JAINJ komited untuk terus menambah baik pelaksanaan Kursus Pra Perkahwinan Islam sebagai medium persediaan menyeluruh bagi melahirkan pasangan yang <b>lebih berilmu, matang, bertanggungjawab dan berkemahiran</b> dalam menghadapi cabaran rumah tangga ke arah pembentukan keluarga <b>sakinah, mawaddah wa rahmah.</b>”</p>
</div>
{footer(5, True)}
"""

slides = [(1,"dark",s1,s1_css),(2,"light",s2,s2_css),(3,"dark",s3,s3_css),(4,"light",s4,s4_css),(5,"dark",s5,s5_css)]
for n,theme,body,css in slides:
    with open(os.path.join(OUT,f"slide-{n}.html"),"w",encoding="utf-8") as f:
        f.write(page(n,theme,body,css))
print("ok")
