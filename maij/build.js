const pptxgen = require("pptxgenjs");
const React = require("react");
const RDS = require("react-dom/server");
const sharp = require("sharp");
const fi = require("react-icons/fi");
const { applyTheme } = require("/root/.claude/skills/synced/73dd325d-3fe3-41c9-87ef-cd0391b3832b_637d1d23-f6c4-4283-91fb-5ad29edf9c34/pptx/scripts/apply_theme.js");

const NAVY="15365B", ROYAL="102B4E", GOLD="C5A15A", SOFT="E3C98D", WHITE="FFFFFF", GREY="F3F5F7", CHAR="303A46", MUTE="8A94A0", MUTEBG="E4E7EB";
const F="Calibri";
const THEME={name:"Maju Johor Premium",headFontFace:F,bodyFontFace:F,colors:{dk1:CHAR,lt1:WHITE,dk2:ROYAL,lt2:GREY,accent1:NAVY,accent2:GOLD,accent3:SOFT,accent4:ROYAL,accent5:MUTE,accent6:CHAR,hlink:NAVY,folHlink:CHAR}};

async function icon(name,color){
  const svg=RDS.renderToStaticMarkup(React.createElement(fi[name],{color:"#"+color,size:256,strokeWidth:1.8}));
  const b=await sharp(Buffer.from(svg)).resize(256,256).png().toBuffer();
  return "image/png;base64,"+b.toString("base64");
}

(async()=>{
const pres=new pptxgen(); pres.layout="LAYOUT_WIDE"; pres.theme={headFontFace:F,bodyFontFace:F};
pres.title="Carta Alir Permohonan Bantuan Online MAIJ";
pres.defineSlideMaster({title:"MAIJ_CONTENT",background:{color:WHITE},
 objects:[{text:{text:"Carta Alir Permohonan Bantuan Online  |  Majlis Agama Islam Negeri Johor",options:{x:0.6,y:7.0,w:9,h:0.3,fontFace:F,fontSize:12,color:MUTE,margin:0}}}],
 slideNumber:{x:12.1,y:7.0,w:0.6,h:0.3,fontFace:F,fontSize:12,color:MUTE,align:"right"},
 placeholders:[{placeholder:{options:{name:"title",type:"title",x:0.6,y:0.62,w:12.1,h:0.7,fontFace:F,fontSize:32,bold:true,color:NAVY,align:"left",valign:"middle",margin:0},text:""}}]});

const arrowH=(s,x1,x2,y,c=GOLD)=>s.addShape(pres.shapes.LINE,{x:x1,y,w:x2-x1,h:0,line:{color:c,width:2.5,endArrowType:"triangle"}});
const arrowV=(s,x,y1,y2,c=GOLD)=>s.addShape(pres.shapes.LINE,{x,y:y1,w:0,h:y2-y1,line:{color:c,width:2.5,endArrowType:"triangle"}});
const lineH=(s,x1,x2,y,c=GOLD)=>s.addShape(pres.shapes.LINE,{x:x1,y,w:x2-x1,h:0,line:{color:c,width:2.5}});
const lineV=(s,x,y1,y2,c=GOLD)=>s.addShape(pres.shapes.LINE,{x,y:y1,w:0,h:y2-y1,line:{color:c,width:2.5}});
const T=(s,t,o)=>s.addText(t,Object.assign({isTextBox:true,fontFace:F,margin:0,valign:"top"},o));
const eyebrow=(s,t)=>T(s,t,{x:0.6,y:0.3,w:9,h:0.3,fontSize:16,bold:true,color:GOLD,charSpacing:3});
const chipFull=(s,t,x,y,w,fill,col,name)=>{s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x,y,w,h:0.38,rectRadius:0.19,fill:{color:fill},objectName:name||"Label chip"});T(s,t,{x,y,w,h:0.38,fontSize:16,bold:true,color:col,align:"center",valign:"middle",charSpacing:1,objectName:(name||"Label")+" text"});};

// ---------- SLIDE 1
{
 const s=pres.addSlide({masterName:"MAIJ_CONTENT"});
 eyebrow(s,"OVERVIEW PROSES");
 s.addText("CARTA ALIR PERMOHONAN BANTUAN ONLINE MAIJ",{placeholder:"title",x:0.6,y:0.62,w:12.1,h:0.7,fontSize:32,bold:true,color:NAVY,fontFace:F,align:"left",valign:"middle",margin:0});
 const steps=[
  ["Pendaftaran Pengguna","Daftar pengguna","FiUserPlus"],
  ["Login Sistem","Masuk ke sistem","FiLogIn"],
  ["Maklumat Asas Pengguna","Pengguna sistem","FiUser"],
  ["Pilih Jenis Bantuan","Jenis dimohon","FiGrid"],
  ["Isi Maklumat Keperluan","Keperluan bantuan","FiEdit3"],
  ["Muat Naik Dokumen Sokongan","Sokong permohonan","FiUploadCloud"],
  ["Perakuan Permohonan","Sebelum hantar","FiCheckSquare"],
  ["Hantar Permohonan","Ke MAIJ","FiSend"]];
 const cw=2.725,gap=0.4,xs=i=>0.6+i*(cw+gap);
 chipFull(s,"FASA 1  |  AKAUN PENGGUNA",xs(0),1.5,cw*3+gap*2,NAVY,WHITE,"Fasa 1");
 chipFull(s,"FASA 2  |  PERMOHONAN",xs(3),1.5,cw,GOLD,ROYAL,"Fasa 2");
 for(let i=0;i<8;i++){
  const r=Math.floor(i/4),c=i%4,x=xs(c),y=r===0?2.05:4.65,h=2.1,last=i===7;
  const fill=last?NAVY:GREY, tcol=last?WHITE:NAVY, dcol=last?SOFT:CHAR;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x,y,w:cw,h,rectRadius:0.08,fill:{color:fill},objectName:"Kad "+(i+1)});
  T(s,String(i+1).padStart(2,"0"),{x:x+0.25,y:y+0.12,w:1.2,h:0.65,fontSize:40,bold:true,color:last?SOFT:GOLD,objectName:"No "+(i+1)});
  s.addShape(pres.shapes.OVAL,{x:x+cw-0.85,y:y+0.17,w:0.6,h:0.6,fill:{color:last?GOLD:NAVY},objectName:"Bulatan ikon "+(i+1)});
  s.addImage({data:await icon(steps[i][2],last?ROYAL:SOFT),x:x+cw-0.85+0.14,y:y+0.17+0.14,w:0.32,h:0.32,altText:steps[i][0]});
  T(s,steps[i][0],{x:x+0.25,y:y+0.78,w:cw-0.5,h:0.95,fontSize:20,bold:true,color:tcol,objectName:"Tajuk "+(i+1)});
  T(s,steps[i][1],{x:x+0.25,y:y+1.8,w:cw-0.5,h:0.28,fontSize:16,color:dcol,objectName:"Penerangan "+(i+1)});
  if(c<3) arrowH(s,x+cw+0.04,x+cw+gap-0.04,y+h/2);
 }
 // wrap connector row1 -> row2
 const a=xs(3)+cw/2,b=xs(0)+cw/2;
 lineV(s,a,4.15,4.4); lineH(s,b,a,4.4); arrowV(s,b,4.4,4.62);
 s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:8.7,y:0.28,w:4.0,h:0.42,rectRadius:0.21,fill:{color:GOLD},objectName:"URL pill"});
 T(s,"https://epayment.maij.gov.my",{x:8.7,y:0.28,w:4.0,h:0.42,fontSize:16,bold:true,color:ROYAL,align:"center",valign:"middle",objectName:"URL text",hyperlink:{url:"https://epayment.maij.gov.my"}});
 s.addNotes("Aliran 8 peringkat daripada pendaftaran hingga hantar permohonan. Alamat sistem: https://epayment.maij.gov.my");
}

// ---------- SLIDE 2
{
 const s=pres.addSlide({masterName:"MAIJ_CONTENT"});
 eyebrow(s,"PERANAN PEMOHON & PEGAWAI MAIJ");
 s.addText("PROSES SEMAKAN, PENGESAHAN DAN PENILAIAN",{placeholder:"title",x:0.6,y:0.62,w:12.1,h:0.7,fontSize:32,bold:true,color:NAVY,fontFace:F,align:"left",valign:"middle",margin:0});
 chipFull(s,"PEMOHON",0.6,1.55,2.0,GOLD,ROYAL,"Lorong pemohon");
 s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:0.85,y:2.05,w:2.7,h:0.8,rectRadius:0.08,fill:{color:WHITE},line:{color:NAVY,width:2},objectName:"Kad Hantar Permohonan"});
 T(s,"Hantar Permohonan",{x:0.85,y:2.05,w:2.7,h:0.8,fontSize:20,bold:true,color:NAVY,align:"center",valign:"middle",objectName:"Teks Hantar Permohonan"});
 arrowV(s,3.0,2.85,3.78);
 s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:0.6,y:3.2,w:12.1,h:3.55,rectRadius:0.1,fill:{color:GREY},objectName:"Jalur pegawai MAIJ"});
 chipFull(s,"PEGAWAI MAIJ",0.85,3.3,2.0,NAVY,WHITE,"Lorong pegawai");
 const cards=[["1","Permohonan diterima oleh MAIJ"],["2","Semakan oleh Staff MAIJ Daerah/HQ"],["3","Senarai Bantuan Daerah"]];
 cards.forEach((c,i)=>{
  const x=0.85+i*2.8,y=3.8;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x,y,w:2.45,h:2.5,rectRadius:0.08,fill:{color:NAVY},objectName:"Kad "+c[0]});
  T(s,c[0].padStart(2,"0"),{x:x+0.25,y:y+0.15,w:1.2,h:0.65,fontSize:40,bold:true,color:GOLD,objectName:"No "+c[0]});
  T(s,c[1],{x:x+0.25,y:y+0.95,w:1.95,h:1.4,fontSize:20,bold:true,color:WHITE,objectName:"Tajuk "+c[0]});
  arrowH(s,x+2.49,x+2.76,y+1.25);
 });
 s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:9.3,y:3.65,w:3.15,h:2.95,rectRadius:0.08,fill:{color:GOLD},objectName:"Panel penilaian"});
 T(s,"PENILAIAN & KEPUTUSAN",{x:9.5,y:3.8,w:2.8,h:0.35,fontSize:16,bold:true,color:ROYAL,charSpacing:1,objectName:"Tajuk panel"});
 ["Pengesahan","Siasatan","Penilaian","Keputusan Mesyuarat"].forEach((t,i)=>{
  const y=4.25+i*0.58;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:9.5,y,w:2.75,h:0.48,rectRadius:0.08,fill:{color:WHITE},objectName:"Cip "+t});
  T(s,t,{x:9.5,y,w:2.75,h:0.48,fontSize:18,bold:true,color:ROYAL,align:"center",valign:"middle",objectName:"Teks "+t});
 });
 s.addNotes("Dalam carta asal, Pengesahan/Siasatan/Penilaian/Keputusan Mesyuarat ialah satu peringkat bergabung; urutan dalaman tidak dinyatakan. Dipaparkan sebagai satu panel tanpa anak panah dalaman. Perlu pengesahan jika urutan dalaman diperlukan.");
}

// ---------- SLIDE 3
{
 const s=pres.addSlide({masterName:"MAIJ_CONTENT"});
 eyebrow(s,"CABANG KEPUTUSAN");
 s.addText("KEPUTUSAN PERMOHONAN BANTUAN",{placeholder:"title",x:0.6,y:0.62,w:12.1,h:0.7,fontSize:32,bold:true,color:NAVY,fontFace:F,align:"left",valign:"middle",margin:0});
 s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:0.6,y:2.9,w:3.7,h:2.5,rectRadius:0.1,fill:{color:NAVY},objectName:"Nod keputusan"});
 T(s,"PERINGKAT KEPUTUSAN",{x:0.85,y:3.05,w:3.2,h:0.3,fontSize:16,bold:true,color:GOLD,charSpacing:1,objectName:"Label nod"});
 T(s,"Proses Pengesahan / Siasatan / Penilaian / Keputusan Mesyuarat",{x:0.85,y:3.5,w:3.2,h:1.8,fontSize:22,bold:true,color:WHITE,objectName:"Teks nod"});
 // connectors
 lineH(s,4.3,4.65,4.15); lineV(s,4.65,2.95,5.55);
 arrowH(s,4.65,5.0,2.95); arrowH(s,4.65,5.0,5.55,MUTE);
 // LULUS
 s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:5.0,y:1.6,w:7.7,h:2.7,rectRadius:0.1,fill:{color:GREY},objectName:"Panel lulus"});
 chipFull(s,"LULUS",5.25,1.75,1.6,GOLD,ROYAL,"Label lulus");
 [["Permohonan Lulus",5.25,"FiCheckCircle"],["Senarai Penerima Bantuan",9.05,"FiUsers"]].forEach(([t,x,ic],i)=>{
  s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x,y:2.3,w:3.4,h:1.85,rectRadius:0.08,fill:{color:NAVY},objectName:"Kad "+t});
 });
 const lul=[["Permohonan Lulus",5.25],["Senarai Penerima Bantuan",9.05]];
 for(const [i,[t,x]] of lul.entries()){
  s.addShape(pres.shapes.OVAL,{x:x+0.25,y:2.45,w:0.6,h:0.6,fill:{color:GOLD},objectName:"Bulatan "+t});
  s.addImage({data:await icon(i?"FiUsers":"FiCheck",ROYAL),x:x+0.39,y:2.59,w:0.32,h:0.32,altText:t});
  T(s,t,{x:x+0.25,y:3.2,w:2.9,h:0.8,fontSize:22,bold:true,color:WHITE,objectName:"Teks "+t});
 }
 arrowH(s,8.69,9.01,3.2);
 // TIDAK LULUS
 s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:5.0,y:4.7,w:7.7,h:1.9,rectRadius:0.1,fill:{color:MUTEBG},objectName:"Panel tidak lulus"});
 chipFull(s,"TIDAK LULUS",5.25,4.85,2.2,CHAR,WHITE,"Label tidak lulus");
 s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:5.25,y:5.35,w:7.2,h:1.0,rectRadius:0.08,fill:{color:WHITE},line:{color:MUTE,width:1.5},objectName:"Kad gagal"});
 s.addShape(pres.shapes.OVAL,{x:5.5,y:5.55,w:0.6,h:0.6,fill:{color:CHAR},objectName:"Bulatan gagal"});
 s.addImage({data:await icon("FiX",WHITE),x:5.64,y:5.69,w:0.32,h:0.32,altText:"Tidak lulus"});
 T(s,"Senarai Penerima Bantuan Gagal",{x:6.35,y:5.35,w:6.0,h:1.0,fontSize:22,bold:true,color:CHAR,valign:"middle",objectName:"Teks gagal"});
 s.addNotes("Laluan lulus dan gagal dikekalkan seperti carta asal halaman 2.");
}

// ---------- SLIDE 4
{
 const s=pres.addSlide({masterName:"MAIJ_CONTENT"});
 eyebrow(s,"DARI KELULUSAN KE ASNAF");
 s.addText("PROSES KELULUSAN DAN PENYALURAN BANTUAN",{placeholder:"title",x:0.6,y:0.62,w:12.1,h:0.7,fontSize:32,bold:true,color:NAVY,fontFace:F,align:"left",valign:"middle",margin:0});
 const top=[["1","Staff HQ","FiUsers"],["2","Proses Pengesahan / Siasatan / Penilaian / Keputusan Mesyuarat","FiSearch"],["3","Kelulusan MAIJ (Jawatankuasa)","FiCheckCircle"]];
 const w=3.5,g=0.8;
 for(const [i,[n,t,ic]] of top.entries()){
  const x=0.6+i*(w+g),y=1.6;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x,y,w,h:1.9,rectRadius:0.08,fill:{color:i===2?NAVY:GREY},objectName:"Kad "+n});
  T(s,n.padStart(2,"0"),{x:x+0.25,y:y+0.12,w:1.2,h:0.65,fontSize:40,bold:true,color:GOLD,objectName:"No "+n});
  s.addShape(pres.shapes.OVAL,{x:x+w-0.85,y:y+0.17,w:0.6,h:0.6,fill:{color:i===2?GOLD:NAVY},objectName:"Bulatan "+n});
  s.addImage({data:await icon(ic,i===2?ROYAL:SOFT),x:x+w-0.71,y:y+0.31,w:0.32,h:0.32,altText:t});
  T(s,t,{x:x+0.25,y:y+0.85,w:w-0.5,h:1.0,fontSize:i===1?18:22,bold:true,color:i===2?WHITE:NAVY,objectName:"Tajuk "+n});
  if(i<2) arrowH(s,x+w+0.05,x+w+g-0.05,y+0.95);
 }
 // muted failure branch from stage 2
 const x2=0.6+1*(w+g)+w/2;
 lineV(s,x2,3.5,3.7,MUTE);
 s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:x2-1.4,y:3.7,w:2.8,h:0.5,rectRadius:0.25,fill:{color:MUTEBG},objectName:"Cip gagal kelulusan"});
 T(s,"Gagal Kelulusan",{x:x2-1.4,y:3.7,w:2.8,h:0.5,fontSize:16,bold:true,color:CHAR,align:"center",valign:"middle",objectName:"Teks gagal kelulusan"});
 // down connector from stage 3
 const x3=0.6+2*(w+g)+w/2;
 arrowV(s,x3,3.5,4.6);
 // closing banner
 s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:0.6,y:4.6,w:12.1,h:2.15,rectRadius:0.12,fill:{color:ROYAL},objectName:"Banner penyaluran"});
 T(s,"PENYALURAN BANTUAN",{x:0.95,y:4.75,w:5,h:0.3,fontSize:16,bold:true,color:GOLD,charSpacing:3,objectName:"Label banner"});
 s.addShape(pres.shapes.OVAL,{x:0.95,y:5.3,w:0.8,h:0.8,fill:{color:GOLD},objectName:"Bulatan bayaran"});
 s.addImage({data:await icon("FiUpload",ROYAL),x:1.15,y:5.5,w:0.4,h:0.4,altText:"Bayaran"});
 T(s,"Bayaran Bantuan Di Daerah",{x:1.95,y:5.3,w:3.9,h:0.8,fontSize:24,bold:true,color:WHITE,valign:"middle",objectName:"Teks bayaran"});
 arrowH(s,6.1,7.0,5.7);
 s.addShape(pres.shapes.OVAL,{x:7.15,y:5.3,w:0.8,h:0.8,fill:{color:GOLD},objectName:"Bulatan asnaf"});
 s.addImage({data:await icon("FiUser",ROYAL),x:7.35,y:5.5,w:0.4,h:0.4,altText:"Asnaf"});
 T(s,"Asnaf",{x:8.15,y:5.3,w:1.6,h:0.8,fontSize:28,bold:true,color:SOFT,valign:"middle",objectName:"Teks asnaf"});
 [["Akaun Bank",10.0],["Kaunter",11.4]].forEach(([t,x])=>{
  s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x,y:5.5,w:t==="Kaunter"?1.0:1.3,h:0.4,rectRadius:0.2,fill:{color:WHITE},objectName:"Cip "+t});
  T(s,t,{x,y:5.5,w:t==="Kaunter"?1.0:1.3,h:0.4,fontSize:16,bold:true,color:ROYAL,align:"center",valign:"middle",objectName:"Teks "+t});
 });
 T(s,"Kaedah penerimaan",{x:10.0,y:5.1,w:2.5,h:0.3,fontSize:16,color:SOFT,objectName:"Label kaedah"});
 s.addNotes("Mengikut carta asal halaman 3. Cabang 'Gagal Kelulusan' dikekalkan sebagai laluan senyap.");
}

await pres.writeFile({fileName:"Carta_Alir_MAIJ_Premium.pptx"});
await applyTheme("Carta_Alir_MAIJ_Premium.pptx",THEME);
})();
