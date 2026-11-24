from pptx import Presentation
from pptx.util import Emu, Pt
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.chart.data import CategoryChartData
from pptx.enum.chart import XL_CHART_TYPE

PX = 9525  # 1920px = 20in at 96dpi
def px(v): return Emu(int(v*PX))
NAVY=RGBColor(0x0B,0x1B,0x3F); ROYAL=RGBColor(0x14,0x3A,0x8C); SOFT=RGBColor(0xC9,0xD8,0xF2)
GOLD=RGBColor(0xC9,0xA2,0x4B); IVORY=RGBColor(0xFA,0xF6,0xEC); WHITE=RGBColor(255,255,255)
MID=RGBColor(0x5B,0x6B,0x8C); PALE=RGBColor(0xE9,0xEF,0xFA)
SANS="Arial"; SERIF="Georgia"

prs=Presentation(); prs.slide_width=Emu(18288000); prs.slide_height=Emu(10287000)
blank=prs.slide_layouts[6]

def shape(s,kind,x,y,w,h,fill=None,line=None,lw=0,name=None):
    sh=s.shapes.add_shape(kind,px(x),px(y),px(w),px(h))
    if fill is None: sh.fill.background()
    else: sh.fill.solid(); sh.fill.fore_color.rgb=fill
    if line is None: sh.line.fill.background()
    else: sh.line.color.rgb=line; sh.line.width=Pt(lw)
    sh.shadow.inherit=False
    if name: sh.name=name
    return sh
def rect(s,*a,**k): return shape(s,MSO_SHAPE.RECTANGLE,*a,**k)
def oval(s,*a,**k): return shape(s,MSO_SHAPE.OVAL,*a,**k)

def text(s,x,y,w,h,runs,size=24,color=NAVY,bold=False,font=SANS,align=PP_ALIGN.LEFT,anchor=MSO_ANCHOR.TOP,ls=1.0,name=None,wrap=True):
    """runs: str or list of paragraphs; each paragraph str or list of (text,{opts})"""
    tb=s.shapes.add_textbox(px(x),px(y),px(w),px(h)); tf=tb.text_frame; tf.word_wrap=wrap
    tf.margin_left=tf.margin_right=tf.margin_top=tf.margin_bottom=0; tf.vertical_anchor=anchor
    if name: tb.name=name
    paras=runs if isinstance(runs,list) else [runs]
    for i,p in enumerate(paras):
        para=tf.paragraphs[0] if i==0 else tf.add_paragraph()
        para.alignment=align; para.line_spacing=ls
        for r in (p if isinstance(p,list) else [(p,{})]):
            t,o=r if isinstance(r,tuple) else (r,{})
            run=para.add_run(); run.text=t; f=run.font
            f.size=Pt(o.get('size',size)*0.75); f.bold=o.get('bold',bold); f.name=o.get('font',font)
            f.color.rgb=o.get('color',color)
    return tb

def bg(s,dark=True):
    rect(s,0,0,1920,1080,fill=NAVY if dark else IVORY,name="Latar")
def gradient_band(s,x,y,w,h,c1,c2,angle=0):
    sh=rect(s,x,y,w,h,fill=c1); sh.fill.gradient(); sh.fill.gradient_angle=angle
    st=sh.fill.gradient_stops; st[0].color.rgb=c1; st[1].color.rgb=c2; return sh
def footer(s,n,dark=False):
    c=SOFT if dark else MID
    rect(s,96,1008,1728,2,fill=GOLD)
    text(s,96,1026,1500,30,"SOALAN A73  ·  MAJLIS AGAMA ISLAM NEGERI JOHOR (MAINJ)  ·  MESYUARAT KEDUA BELANJAWAN 2027  ·  24 NOVEMBER 2026",size=18,color=c,bold=True)
    text(s,1724,1026,100,30,f"{n} / 4",size=18,color=c,bold=True,align=PP_ALIGN.RIGHT)
def tag(s,x,y,t,color=GOLD):
    rect(s,x,y+6,48,4,fill=color)
    text(s,x+64,y-6,900,34,t,size=22,color=color,bold=True)

# ---------------- SLIDE 1 ----------------
s=prs.slides.add_slide(blank); bg(s,True)
gradient_band(s,0,0,1920,1080,NAVY,ROYAL,angle=315).fill.gradient_stops[0].color.rgb=NAVY
rect(s,0,0,16,1080,fill=GOLD)
tag(s,96,56,"SKALA ASET WAKAF JOHOR")
text(s,96,110,1728,360,[
  [("KERAJAAN NEGERI JOHOR",{'color':GOLD,'size':44,'bold':True})],
  [("PERKASA ASET WAKAF MAINJ,",{'color':WHITE,'size':76,'bold':True})],
  [("18,650 EKAR",{'color':GOLD,'size':76,'bold':True}),(" TANAH WAKAF DIOPTIMUMKAN UNTUK MANFAAT RAKYAT",{'color':WHITE,'size':76,'bold':True})],
 ],ls=0.98,name="Headline Utama")
text(s,96,490,900,240,"18,650",size=200,color=GOLD,bold=True,font=SERIF,name="Angka Utama")
text(s,100,720,880,50,"EKAR TANAH WAKAF DIURUSKAN MAINJ",size=34,color=WHITE,bold=True)
text(s,100,790,780,150,"Komitmen Kerajaan Negeri Johor dalam memperkasa pengurusan dan pembangunan aset wakaf demi kepentingan ummah.",size=27,color=SOFT,ls=1.1)
cd=CategoryChartData(); cd.categories=["Telah dibangunkan","Belum dibangunkan"]; cd.add_series("Tapak",(3647,1726))
gf=s.shapes.add_chart(XL_CHART_TYPE.DOUGHNUT,px(960),px(500),px(470),px(470),cd); gf.name="Carta Donat Tapak"
ch=gf.chart; ch.has_legend=False; ch.has_title=False
pl=ch.plots[0]
for i,c in enumerate((GOLD,SOFT)):
    pt=pl.series[0].points[i]; pt.format.fill.solid(); pt.format.fill.fore_color.rgb=c
    pt.format.line.color.rgb=NAVY; pt.format.line.width=Pt(2.5)
from lxml import etree
ns='http://schemas.openxmlformats.org/drawingml/2006/chart'
d=pl._element; hs=d.find('{%s}holeSize'%ns)
if hs is None: hs=etree.SubElement(d,'{%s}holeSize'%ns)
hs.set('val','70')
text(s,960,668,470,80,"5,373",size=64,color=WHITE,bold=True,font=SERIF,align=PP_ALIGN.CENTER)
text(s,960,742,470,60,["TAPAK","KESELURUHAN"],size=21,color=SOFT,bold=True,align=PP_ALIGN.CENTER,ls=0.95)
def stat(s,x,y,col,num,lab):
    rect(s,x,y,8,200,fill=col)
    text(s,x+30,y-8,380,110,num,size=88,color=WHITE,bold=True,font=SERIF)
    text(s,x+30,y+110,370,90,lab,size=26,color=SOFT,bold=True,ls=1.0)
stat(s,1470,510,GOLD,"3,647","TAPAK TELAH DIBANGUNKAN")
stat(s,1470,760,SOFT,"1,726","TAPAK BELUM DIBANGUNKAN")
footer(s,1,True)

# ---------------- SLIDE 2 ----------------
s=prs.slides.add_slide(blank); bg(s,False)
rect(s,0,0,1920,12,fill=ROYAL)
tag(s,96,56,"STRATEGI PENGOPTIMUMAN TANAH WAKAF",ROYAL)
text(s,96,104,1728,80,"TANAH WAKAF DIPERKASA, POTENSI ASET DIBANGUNKAN",size=54,color=NAVY,bold=True)
def icon_house(s,cx,cy,c):
    shape(s,MSO_SHAPE.ISOSCELES_TRIANGLE,cx-34,cy-38,68,30,fill=c); rect(s,cx-26,cy-8,52,38,fill=c); rect(s,cx-7,cy+6,14,24,fill=ROYAL)
def icon_doc(s,cx,cy,c):
    shape(s,MSO_SHAPE.FOLDED_CORNER,cx-28,cy-38,56,72,fill=c)
    for i in range(3): rect(s,cx-16,cy-20+i*14,32,4,fill=ROYAL)
def icon_jv(s,cx,cy,c):
    oval(s,cx-40,cy-26,52,52,line=c,lw=4); oval(s,cx-12,cy-26,52,52,line=GOLD,lw=4)
def icon_sprout(s,cx,cy,c):
    rect(s,cx-3,cy-4,6,36,fill=c)
    shape(s,MSO_SHAPE.TEAR,cx-38,cy-34,36,36,fill=c).rotation=90
    shape(s,MSO_SHAPE.TEAR,cx+2,cy-40,36,36,fill=GOLD)
cards=[("01","SEWAAN","Tanah wakaf yang belum diusahakan diiklankan untuk tujuan sewaan kepada pihak berminat.",icon_house),
       ("02","PAJAKAN","Membuka peluang penggunaan tanah melalui pajakan yang bersesuaian.",icon_doc),
       ("03","KERJASAMA STRATEGIK (JV)","Memperluas kerjasama bersama pihak swasta, pengusaha dan pemaju bagi pembangunan hartanah berpotensi komersial.",icon_jv),
       ("04","PEMBANGUNAN EKONOMI PRODUKTIF","Memanfaatkan tanah terbiar sebagai tapak projek pertanian dan aktiviti ekonomi.",icon_sprout)]
for i,(n,t,dsc,ic) in enumerate(cards):
    x=96+(i%2)*510; y=240+(i//2)*380
    oval(s,x,y,110,110,fill=ROYAL); ic(s,x+55,y+55,WHITE)
    text(s,x+130,y,330,36,n,size=26,color=GOLD,bold=True,font=SERIF)
    text(s,x+130,y+34,340,90,t,size=28,color=NAVY,bold=True,ls=0.95)
    text(s,x,y+140,470,200,dsc,size=27,color=MID,ls=1.08)
gradient_band(s,1130,230,694,740,NAVY,ROYAL,angle=315)
rect(s,1130,230,694,8,fill=GOLD)
text(s,1176,262,610,70,"HASIL SEWAAN DAN PAJAKAN MAINJ BAGI TAHUN 2026",size=23,color=SOFT,bold=True,ls=1.0)
text(s,1176,335,610,170,"RM6.007",size=112,color=GOLD,bold=True,font=SERIF,name="Angka RM6.007",wrap=False)
text(s,1176,500,610,50,"JUTA  ·  RM6,007,475.78",size=32,color=WHITE,bold=True)
items=[("Menara telekomunikasi","RM4,484,653.50",4484653.50),("Tanah","RM884,168.28",884168.28),("Premis perniagaan","RM424,472.00",424472.00),("Kediaman","RM214,182.00",214182.00)]
y=585
for lab,val,v in items:
    text(s,1176,y,330,34,lab,size=24,color=SOFT)
    text(s,1480,y,306,34,val,size=24,color=WHITE,bold=True,align=PP_ALIGN.RIGHT)
    rect(s,1176,y+40,610,10,fill=RGBColor(0x1F,0x3A,0x7A))
    rect(s,1176,y+40,max(610*v/4484653.5,6),10,fill=GOLD)
    y+=72
text(s,1176,y+14,610,40,"JUMLAH: 487 UNIT",size=28,color=GOLD,bold=True)
footer(s,2,False)

# ---------------- SLIDE 3 ----------------
s=prs.slides.add_slide(blank); bg(s,False)
rect(s,0,0,1920,12,fill=ROYAL)
tag(s,96,56,"WAKAF MENJANA EKONOMI UMMAH",ROYAL)
text(s,96,100,1728,130,["TANAH WAKAF BUKAN SEKADAR ASET,","MALAH SUMBER PENDAPATAN ASNAF"],size=48,color=NAVY,bold=True,ls=0.98)
gradient_band(s,96,260,640,720,NAVY,ROYAL,angle=315); rect(s,96,260,640,8,fill=GOLD)
text(s,136,290,570,80,[[("PROJEK HIJRAH ASNAF",{'color':GOLD})],[("TANAMAN FERTIGASI CILI",{'color':WHITE})]],size=28,bold=True,ls=1.0)
text(s,136,375,570,180,"RM3,500",size=104,color=GOLD,bold=True,font=SERIF,name="Angka RM3,500",wrap=False)
text(s,136,545,570,90,[[("UNJURAN",{'bold':True,'color':WHITE}),(" purata pendapatan sebulan selama enam bulan",{'color':SOFT})]],size=27,ls=1.05)
rect(s,136,660,570,2,fill=GOLD)
text(s,136,675,570,70,"RM21,000",font=SERIF,size=56,bold=True,color=GOLD)
text(s,136,745,570,110,"unjuran pendapatan bagi setiap peserta untuk satu pusingan tanaman",size=27,color=SOFT,ls=1.05)
text(s,136,885,570,70,"* Unjuran, bukan pendapatan yang telah direalisasikan.",size=20,color=SOFT,ls=1.05)
text(s,790,260,1034,40,"20,000 POLIBEG  ·  10 PESERTA ASNAF",size=30,color=ROYAL,bold=True)
for i in range(10):
    x=790+i*104
    oval(s,x,310,70,70,fill=ROYAL)
    oval(s,x+26,322,18,18,fill=WHITE); shape(s,MSO_SHAPE.ROUND_2_SAME_RECTANGLE,x+19,343,32,20,fill=WHITE)
    for r in range(2):
        for c in range(4):
            oval(s,x+8+c*14,396+r*14,10,10,fill=GOLD)
text(s,790,432,1034,30,"Visual ilustrasi: setiap peserta mengusahakan sebahagian daripada 20,000 polibeg",size=20,color=MID)
tag(s,790,495,"LOKASI PROJEK",ROYAL)
for i,(a,b) in enumerate([("Bukit Geriba","Batu Pahat"),("Taman Sri Lambak","Kluang")]):
    x=790+i*520
    shape(s,MSO_SHAPE.TEAR,x,545,52,52,fill=GOLD).rotation=135
    oval(s,x+17,562,18,18,fill=NAVY)
    text(s,x+72,538,440,40,a,size=30,color=NAVY,bold=True)
    text(s,x+72,578,440,36,b,size=26,color=MID)
tag(s,790,645,"AKTIVITI EKONOMI LAIN",ROYAL)
text(s,790,688,1034,40,"Tanaman kontan  ·  Cili fertigasi  ·  Penternakan madu kelulut",size=27,color=NAVY,bold=True)
text(s,790,730,1034,40,"Madu kelulut: Kluang · Batu Pahat · Kota Tinggi",size=27,color=MID)
tag(s,790,790,"MANFAAT PELAKSANAAN",ROYAL)
ben=["Mengoptimumkan penggunaan tanah MAINJ","Membuka peluang keusahawanan","Meningkatkan pendapatan asnaf","Mengurangkan kebergantungan kepada bantuan zakat"]
for i,b in enumerate(ben):
    x=790+(i%2)*520; y=840+(i//2)*80
    oval(s,x,y+9,16,16,fill=GOLD)
    text(s,x+32,y,470,70,b,size=27,color=NAVY,ls=0.95)
footer(s,3,False)

# ---------------- SLIDE 4 ----------------
s=prs.slides.add_slide(blank); bg(s,True)
gradient_band(s,0,0,1920,1080,NAVY,ROYAL,angle=315).fill.gradient_stops[0].color.rgb=NAVY
tag(s,96,56,"HALA TUJU WAKAF JOHOR")
text(s,96,100,1300,80,"PELAN KEMAJUAN WAKAF JOHOR",size=60,color=WHITE,bold=True)
text(s,1340,100,484,80,"2027–2030",size=60,color=GOLD,bold=True,font=SERIF,align=PP_ALIGN.RIGHT)
text(s,96,185,1728,40,"Memperkukuh pengurusan, pembangunan dan potensi ekonomi wakaf secara strategik dan mampan.",size=27,color=SOFT)
pillars=[("01","PENGUKUHAN TADBIR URUS WAKAF","Memantapkan dasar, peraturan, audit dan pemantauan aset wakaf."),
 ("02","INOVASI DAN DIGITALISASI WAKAF","Memodenkan pengurusan melalui sistem maklumat, pangkalan data dan pemetaan digital."),
 ("03","KOLABORASI STRATEGIK DAN JARINGAN PINTAR","Memperluas kerjasama dengan agensi kerajaan, pihak berkepentingan dan sektor swasta."),
 ("04","PEMBANGUNAN DAN PEMERKASAAN EKONOMI WAKAF","Mengoptimumkan potensi ekonomi melalui pembangunan hartanah dan projek berdaya maju."),
 ("05","PEMBANGUNAN MODAL INSAN DAN LITERASI WAKAF","Memperkukuh kompetensi pegawai serta meningkatkan kesedaran dan penyertaan masyarakat.")]
W=318; G=34; base=830
for i,(n,t,d) in enumerate(pillars):
    x=96+i*(W+G); h=430+i*36; y=base-h
    r=rect(s,x,y,W,h,fill=RGBColor(0x12,0x2B,0x66)); r.name=f"Teras {n}"
    rect(s,x,y,W,6,fill=GOLD)
    text(s,x+22,y+16,W-40,90,n,size=72,color=GOLD,bold=True,font=SERIF)
    text(s,x+22,y+112,W-40,130,t,size=24,color=WHITE,bold=True,ls=0.98)
    text(s,x+22,y+225,W-40,h-235,d,size=22,color=SOFT,ls=1.05)
rect(s,96,base,1728,10,fill=GOLD)
text(s,96,868,1728,120,"MEMASTIKAN ASET WAKAF TERUS PRODUKTIF, MENJANA EKONOMI DAN MEMBERI MANFAAT JANGKA PANJANG KEPADA UMMAH.",size=34,color=WHITE,bold=True,align=PP_ALIGN.CENTER,ls=1.05,name="Penutup")
footer(s,4,True)

prs.save("/home/user/Nawal/wakaf-a73/Infografik_A73_Wakaf_MAINJ.pptx")
