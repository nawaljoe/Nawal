const pptxgen = require('pptxgenjs');
const p = new pptxgen(); p.layout='LAYOUT_WIDE'; // 13.33x7.5
p.title='Soal Jawab A93 - PKHNJ 2030';
const NAVY='0B1F44', RED='C8102E', GOLD='C9A227', INK='222222', GREY='5B6577', LIGHT='F3F5F9', W='FFFFFF', F='Arial';
const FOOT='Jawapan Soalan Lisan A93  |  Belanjawan Johor 2027  |  DUN Johor, 26 November 2026';

const logos=(s,x,y,sz=0.55,dark=false)=>['JAINJ','MAINJ','PIJ'].forEach((n,i)=>{
  s.addShape('roundRect',{x:x+i*(sz+0.12),y,w:sz,h:sz,rectRadius:0.06,fill:{color:dark?'16305F':'EEF1F6'},line:{color:GOLD,width:1,dashType:'dash'}});
  s.addText('LOGO\n'+n,{x:x+i*(sz+0.12),y,w:sz,h:sz,fontFace:F,fontSize:7,bold:true,color:dark?'C9D3E8':GREY,align:'center',valign:'middle',margin:0});
});
const photo=(s,x,y,w,h,label,dark=false)=>{
  s.addShape('rect',{x,y,w,h,fill:{color:dark?'16305F':'E9EDF4'},line:{color:GOLD,width:1.5,dashType:'dash'}});
  s.addText(label,{x:x+0.1,y,w:w-0.2,h,fontFace:F,fontSize:14,bold:true,color:dark?'C9D3E8':GREY,align:'center',valign:'middle'});
};
const head=(s,title,n)=>{
  s.background={color:W};
  s.addShape('rect',{x:0,y:0,w:13.33,h:1.45,fill:{color:NAVY}});
  s.addShape('rect',{x:0,y:1.45,w:13.33,h:0.06,fill:{color:GOLD}});
  s.addText(title,{x:0.5,y:0.12,w:9.6,h:1.2,fontFace:F,fontSize:26,bold:true,color:W,valign:'middle',margin:0});
  logos(s,10.2,0.45,0.78,true);
  s.addShape('line',{x:0.5,y:7.0,w:12.33,h:0,line:{color:GOLD,width:1}});
  s.addText(FOOT,{x:0.5,y:7.05,w:10,h:0.35,fontFace:F,fontSize:11,color:GREY,margin:0});
  s.addText(String(n)+' / 7',{x:11.8,y:7.05,w:1.03,h:0.35,fontFace:F,fontSize:11,color:GREY,align:'right',margin:0});
};
const card=(s,x,y,w,h,big,label,o={})=>{
  s.addShape('rect',{x,y,w,h,fill:{color:o.fill||LIGHT},line:{color:o.fill||'DDE2EC',width:0.75}});
  s.addShape('rect',{x,y,w:0.08,h,fill:{color:o.bar||RED}});
  s.addText(big,{x:x+0.2,y:y+0.05,w:w-0.3,h:h*0.55,fontFace:F,fontSize:o.bs||36,bold:true,color:o.bc||RED,valign:'bottom',margin:0,fit:'shrink'});
  s.addText(label,{x:x+0.2,y:y+h*0.58,w:w-0.3,h:h*0.4,fontFace:F,fontSize:o.ls||14,color:o.lc||INK,valign:'top',margin:0});
};

// 1 COVER
let s=p.addSlide(); s.background={color:NAVY};
s.addShape('rect',{x:0,y:0,w:0.25,h:7.5,fill:{color:RED}});
logos(s,0.8,0.5,0.7,true);
s.addText('SOAL JAWAB YB PENGERUSI JAWATANKUASA HAL EHWAL AGAMA ISLAM NEGERI JOHOR',{x:0.8,y:1.5,w:7,h:0.6,fontFace:F,fontSize:14,bold:true,color:GOLD,charSpacing:2,margin:0});
s.addShape('rect',{x:0.8,y:2.15,w:1.4,h:0.06,fill:{color:GOLD}});
s.addText('PEMBANGUNAN INDUSTRI HALAL JOHOR DIPERKASA MELALUI PKHNJ 2030',{x:0.8,y:2.4,w:7.2,h:2.5,fontFace:F,fontSize:38,bold:true,color:W,valign:'top',margin:0});
s.addText('Jawapan Soalan Lisan A93  |  Belanjawan Johor 2027',{x:0.8,y:5.0,w:7.2,h:0.5,fontFace:F,fontSize:20,color:'E6EAF3',margin:0});
s.addText([{text:'YB Tuan Ng Yak Howe (Bentayan)',options:{bold:true,color:GOLD,breakLine:true}},{text:'Mesyuarat Kedua, Penggal Persidangan Pertama DUN Johor ke-16  |  26 November 2026',options:{color:'C9D3E8',fontSize:14}}],{x:0.8,y:5.7,w:7.4,h:0.9,fontFace:F,fontSize:18,margin:0});
photo(s,8.6,0.5,4.25,6.5,'LETAKKAN GAMBAR RASMI\nYB EXCO DI SINI\n(nisbah potret 2:3)',true);

// 2 HALA TUJU
s=p.addSlide(); head(s,'PKHNJ 2030: HALA TUJU STRATEGIK MEMBANGUNKAN EKOSISTEM HALAL JOHOR',2);
s.addText([{text:'PRA-PELANCARAN  ',options:{bold:true,color:RED}},{text:'7 Disember 2025, disempurnakan oleh YAB Dato\' Onn Hafiz Ghazi, Menteri Besar Johor',options:{color:INK}}],{x:0.5,y:1.7,w:12.3,h:0.4,fontFace:F,fontSize:15,margin:0});
photo(s,0.5,2.25,3.7,4.55,'RUANG GAMBAR\nINDUSTRI HALAL / MAJLIS\nPRA-PELANCARAN PKHNJ 2030');
s.addText('SASARAN UTAMA MENJELANG 2030',{x:4.5,y:2.2,w:8.3,h:0.3,fontFace:F,fontSize:13,bold:true,color:GOLD,charSpacing:2,margin:0});
s.addText('PENSIJILAN & TENAGA KERJA',{x:4.5,y:2.55,w:8.3,h:0.3,fontFace:F,fontSize:12,bold:true,color:GREY,margin:0});
card(s,4.5,2.9,4.1,1.45,'5,000','pensijilan halal',{bs:48});
card(s,8.75,2.9,2.0,1.45,'20','syarikat Halal Champion',{bs:36,ls:12,bar:NAVY,bc:NAVY});
card(s,10.9,2.9,1.93,1.45,'4,000','tenaga kerja mahir halal',{bs:30,ls:12,bar:NAVY,bc:NAVY});
s.addText('EKONOMI',{x:4.5,y:4.5,w:8.3,h:0.3,fontFace:F,fontSize:12,bold:true,color:GREY,margin:0});
card(s,4.5,4.85,4.1,1.95,'RM62 bilion','jumlah keluaran industri halal',{bs:40,fill:NAVY,bar:GOLD,bc:W,lc:'E6EAF3',ls:15});

card(s,8.75,4.85,2.0,1.95,'RM24 bilion','sumbangan KDNK sektor halal negeri',{bs:18,ls:12,bar:NAVY,bc:NAVY});
card(s,10.9,4.85,1.93,0.93,'RM18 bilion','nilai eksport halal',{bs:20,ls:11,bar:NAVY,bc:NAVY});
card(s,10.9,5.87,1.93,0.93,'RM5 bilion','pelaburan terkumpul',{bs:20,ls:11,bar:NAVY,bc:NAVY});

// 3 PENSIJILAN
s=p.addSlide(); head(s,'1,765 USAHAWAN BERJAYA MEMPEROLEH PENSIJILAN HALAL',3);
s.addShape('rect',{x:0.5,y:1.75,w:4.4,h:2.3,fill:{color:NAVY}});
s.addShape('rect',{x:0.5,y:1.75,w:4.4,h:0.07,fill:{color:GOLD}});
s.addText('1,765',{x:0.5,y:1.9,w:4.4,h:1.4,fontFace:F,fontSize:80,bold:true,color:W,align:'center',valign:'middle',margin:0});
s.addText('usahawan memperoleh pensijilan halal sejak PKHNJ 2030 diperkenalkan',{x:0.7,y:3.3,w:4.0,h:0.7,fontFace:F,fontSize:14,color:'E6EAF3',align:'center',margin:0});
s.addChart(p.charts.DOUGHNUT,[{name:'Usahawan',labels:['Bumiputera','Bukan Bumiputera','Milikan asing'],values:[463,1262,40]}],
 {x:0.4,y:4.15,w:4.6,h:2.75,holeSize:58,chartColors:[RED,NAVY,GOLD],showLegend:true,legendPos:'r',legendFontSize:12,legendFontFace:F,showPercent:false,showValue:true,dataLabelColor:W,dataLabelFontSize:11,dataLabelFontBold:true,dataBorder:{pt:1,color:W}});
// 133 vs 737
s.addShape('rect',{x:5.15,y:1.75,w:4.2,h:2.3,fill:{color:LIGHT},line:{color:'DDE2EC',width:0.75}});
s.addText('KELULUSAN BAHARU SPHM',{x:5.3,y:1.82,w:3.9,h:0.3,fontFace:F,fontSize:12,bold:true,color:GOLD,margin:0});
const bw=v=>3.6*v/737;
s.addText('Tahun 2024',{x:5.3,y:2.2,w:3.9,h:0.25,fontFace:F,fontSize:12,color:GREY,margin:0});
s.addShape('rect',{x:5.3,y:2.45,w:bw(133),h:0.4,fill:{color:NAVY}});
s.addText('133',{x:5.3+bw(133)+0.1,y:2.4,w:1.2,h:0.5,fontFace:F,fontSize:22,bold:true,color:NAVY,margin:0});
s.addText('Sehingga Oktober 2026',{x:5.3,y:2.95,w:3.9,h:0.25,fontFace:F,fontSize:12,color:GREY,margin:0});
s.addShape('rect',{x:5.3,y:3.2,w:bw(737),h:0.4,fill:{color:RED}});
s.addText('737',{x:5.4,y:3.2,w:1.2,h:0.4,fontFace:F,fontSize:22,bold:true,color:W,valign:'middle',margin:0});
s.addText('Peningkatan lebih lima kali ganda',{x:5.3,y:3.65,w:3.9,h:0.3,fontFace:F,fontSize:12,bold:true,color:RED,margin:0});
card(s,5.15,4.2,2.0,2.6,'4,510','sijil halal aktif di Johor sehingga September 2026; +863 berbanding 2025',{bs:30,ls:12,bar:NAVY,bc:NAVY});
card(s,7.3,4.2,2.05,2.6,'93.08%','permohonan SPHM diluluskan dalam tempoh 30 hari bekerja',{bs:30,ls:12});
photo(s,9.6,1.75,3.23,5.05,'RUANG GAMBAR\nPROSES PENSIJILAN /\nUSAHAWAN BERSIJIL HALAL');

// 4 PENSIJILAN & BAKAT
s=p.addSlide(); head(s,'MEMPERKUKUH PENSIJILAN, MELAHIRKAN TENAGA KERJA MAHIR HALAL',4);
const colHead=(x,t)=>{s.addShape('rect',{x,y:1.75,w:4.55,h:0.45,fill:{color:RED}});s.addText(t,{x:x+0.15,y:1.75,w:4.3,h:0.45,fontFace:F,fontSize:15,bold:true,color:W,valign:'middle',margin:0});};
colHead(0.5,'A. PEMERKASAAN PENSIJILAN HALAL');
s.addText([
 {text:'Kerjasama JAINJ dan JHDC',options:{bullet:true,breakLine:true}},
 {text:'Bimbingan, khidmat nasihat dan pemudahcaraan permohonan',options:{bullet:true}}],
 {x:0.5,y:2.3,w:4.55,h:1.3,fontFace:F,fontSize:15,color:INK,paraSpaceAfter:6,margin:0,valign:'top'});
s.addText('HALAL GREEN LANE (RINTIS)',{x:0.5,y:3.65,w:4.55,h:0.3,fontFace:F,fontSize:12,bold:true,color:GOLD,margin:0});
s.addShape('rect',{x:0.5,y:4.0,w:2.2,h:2.8,fill:{color:NAVY}});
s.addText('8',{x:0.5,y:4.05,w:2.2,h:1.3,fontFace:F,fontSize:72,bold:true,color:W,align:'center',valign:'middle',margin:0});
s.addText('permohonan diluluskan',{x:0.6,y:5.35,w:2.0,h:0.6,fontFace:F,fontSize:14,color:'E6EAF3',align:'center',margin:0});
s.addText('dalam 15 hari bekerja',{x:0.6,y:5.95,w:2.0,h:0.6,fontFace:F,fontSize:14,bold:true,color:GOLD,align:'center',margin:0});
s.addShape('rightArrow',{x:2.75,y:5.1,w:0.35,h:0.4,fill:{color:GOLD},line:{color:GOLD}});
s.addShape('rect',{x:3.15,y:4.0,w:1.9,h:2.8,fill:{color:LIGHT},line:{color:'DDE2EC',width:0.75}});
s.addText([{text:'Termasuk',options:{color:GREY,fontSize:12,breakLine:true}},{text:'syarikat petrokimia PRefChem, Pengerang',options:{bold:true,color:NAVY,fontSize:15}}],{x:3.25,y:4.05,w:1.7,h:2.7,fontFace:F,align:'center',valign:'middle',margin:0});
colHead(5.3,'B. PEMBANGUNAN BAKAT HALAL');
card(s,5.3,2.3,2.2,1.6,'779','peserta dilatih sepanjang tahun 2025',{bs:48,ls:13,bar:NAVY,bc:NAVY});
card(s,7.65,2.3,2.2,1.6,'206','peserta dilatih sehingga April 2026',{bs:48,ls:13});
s.addText([
 {text:'Pelaksanaan TVET Halal Johor',options:{bullet:true,breakLine:true}},
 {text:'Kohort awal tamat latihan; sebahagiannya memasuki sektor pekerjaan berkaitan industri halal',options:{bullet:true}}],
 {x:5.3,y:4.05,w:4.55,h:1.5,fontFace:F,fontSize:14,color:INK,paraSpaceAfter:6,margin:0,valign:'top'});
s.addShape('rect',{x:5.3,y:5.65,w:4.55,h:1.15,fill:{color:NAVY}});
s.addText([{text:'RM200,000',options:{fontSize:26,bold:true,color:GOLD,breakLine:true}},{text:'PIJ: Kursus Profesional Halal dan Auditor Halal, 100 peserta',options:{fontSize:13,color:W}}],{x:5.45,y:5.67,w:4.3,h:1.1,fontFace:F,valign:'middle',margin:0});
photo(s,10.1,1.75,2.73,5.05,'RUANG GAMBAR\nLATIHAN TVET /\nAUDITOR HALAL /\nLAWATAN INDUSTRI');

// 5 HALAL CHAMPION
s=p.addSlide(); head(s,'HALAL CHAMPION: MEMBIMBING USAHAWAN KE ARAH PERTUMBUHAN LEBIH KOMPETITIF',5);
s.addText('PERJALANAN HALAL CHAMPION',{x:0.5,y:1.7,w:6,h:0.3,fontFace:F,fontSize:13,bold:true,color:GOLD,charSpacing:2,margin:0});
const fun=[[32,'usahawan dicalonkan',NAVY],[20,'usahawan menyatakan komitmen','1F3F7A'],[16,'menyertai kohort perintis Halal Champion Sandbox Johor',RED]];
fun.forEach((f,i)=>{const w=6.4*(f[0]/32)+(i==2?0.3:0),x=0.5+(6.7-w)/2,y=2.1+i*1.2;
 s.addShape('rect',{x,y,w,h:1.05,fill:{color:f[2]}});
 s.addText(String(f[0]),{x:x+0.1,y,w:1.2,h:1.05,fontFace:F,fontSize:44,bold:true,color:W,valign:'middle',margin:0});
 s.addText(f[1],{x:x+1.3,y,w:w-1.4,h:1.05,fontFace:F,fontSize:i==2?13:15,color:W,valign:'middle',margin:0});});
s.addShape('rect',{x:0.5,y:5.8,w:6.7,h:1.0,fill:{color:LIGHT},line:{color:GOLD,width:1}});
s.addText([{text:'Halal Sukses Johor  ',options:{bold:true,color:RED}},{text:'dengan kerjasama KUSKOP: platform bimbingan dan pembangunan usahawan',options:{color:INK}}],{x:0.7,y:5.8,w:6.3,h:1.0,fontFace:F,fontSize:14,valign:'middle',margin:0});
s.addShape('rect',{x:7.5,y:1.75,w:2.7,h:2.2,fill:{color:NAVY}});
s.addText('18',{x:7.5,y:1.8,w:2.7,h:1.3,fontFace:F,fontSize:72,bold:true,color:GOLD,align:'center',valign:'middle',margin:0});
s.addText('agensi teknikal, pembiayaan dan pembangunan usahawan diselaraskan',{x:7.6,y:3.1,w:2.5,h:0.8,fontFace:F,fontSize:12,color:W,align:'center',margin:0});
s.addText('SOKONGAN BERSEPADU',{x:7.5,y:4.1,w:2.7,h:0.3,fontFace:F,fontSize:12,bold:true,color:GOLD,margin:0});
['Pensijilan halal','Pembiayaan','Penjenamaan dan pembungkusan','Pemasaran','Pengembangan operasi','Akses pasaran eksport'].forEach((t,i)=>{
 s.addShape('rect',{x:7.5,y:4.45+i*0.39,w:0.1,h:0.3,fill:{color:RED}});
 s.addText(t,{x:7.7,y:4.42+i*0.39,w:2.5,h:0.36,fontFace:F,fontSize:13,color:INK,valign:'middle',margin:0});});
photo(s,10.45,1.75,2.38,5.05,'RUANG GAMBAR\nUSAHAWAN HALAL\nCHAMPION / PRODUK\nHALAL TEMPATAN');

// 6 INSENTIF & AKSES PASARAN
s=p.addSlide(); head(s,'SOKONGAN KEWANGAN DAN AKSES PASARAN DIPERLUAS KEPADA USAHAWAN',6);
s.addText('A. INSENTIF DAN SOKONGAN',{x:0.5,y:1.7,w:6,h:0.3,fontFace:F,fontSize:13,bold:true,color:GOLD,charSpacing:2,margin:0});
card(s,0.5,2.1,6.0,1.5,'RM500,000','MAINJ: membantu usahawan kecil mendapatkan pensijilan halal',{bs:38,ls:14});
card(s,0.5,3.75,6.0,1.5,'RM459,000','PIJ: 153 kantin SAKJ dipersijilkan halal pada 2026 (Belanjawan Johor 2025)',{bs:38,ls:14,bar:NAVY,bc:NAVY});
card(s,0.5,5.4,6.0,1.4,'RM200,000','PIJ: 40 usahawan medan selera di Johor pada 2027 (Belanjawan Johor 2027)',{bs:38,ls:14,fill:NAVY,bar:GOLD,bc:GOLD,lc:W});
s.addText('B. JOHOR HALAL JOURNEY',{x:6.8,y:1.7,w:6,h:0.3,fontFace:F,fontSize:13,bold:true,color:GOLD,charSpacing:2,margin:0});
photo(s,6.8,2.1,3.0,3.15,'RUANG GAMBAR PETA\nJOHOR: SOROT\n10 DAERAH\n(masukkan peta rasmi)');
s.addShape('rect',{x:9.95,y:2.1,w:2.88,h:3.15,fill:{color:NAVY}});
s.addText('10',{x:9.95,y:2.15,w:2.88,h:1.5,fontFace:F,fontSize:80,bold:true,color:GOLD,align:'center',valign:'middle',margin:0});
s.addText('daerah di Negeri Johor',{x:10.05,y:3.7,w:2.68,h:0.4,fontFace:F,fontSize:15,bold:true,color:W,align:'center',margin:0});
s.addText('Mendekati usahawan secara langsung',{x:10.05,y:4.15,w:2.68,h:0.8,fontFace:F,fontSize:13,color:'E6EAF3',align:'center',margin:0});
s.addText([
 {text:'Memperluas akses bimbingan dan sokongan industri halal',options:{bullet:true,breakLine:true}},
 {text:'Memperkukuh pemasaran dan membuka peluang pasaran domestik dan antarabangsa',options:{bullet:true}}],
 {x:6.8,y:5.35,w:3.0,h:1.45,fontFace:F,fontSize:12,color:INK,paraSpaceAfter:4,margin:0,valign:'top'});
photo(s,9.95,5.35,2.88,1.45,'RUANG GAMBAR PROGRAM /\nMEDAN SELERA');

// 7 PENUTUP
s=p.addSlide(); s.background={color:NAVY};
s.addShape('rect',{x:0,y:0,w:0.25,h:7.5,fill:{color:RED}});
s.addText('MEMPERKUKUH EKOSISTEM HALAL JOHOR MENUJU SASARAN 2030',{x:0.8,y:0.45,w:8.2,h:1.3,fontFace:F,fontSize:28,bold:true,color:W,valign:'top',margin:0});
logos(s,9.7,0.5,0.78,true);
s.addShape('rect',{x:0.8,y:1.85,w:1.4,h:0.06,fill:{color:GOLD}});
s.addText('33',{x:0.8,y:2.0,w:3.0,h:1.9,fontFace:F,fontSize:130,bold:true,color:GOLD,valign:'middle',margin:0});
s.addText([{text:'agensi menganggotai Pasukan Petugas PKHNJ 2030',options:{bold:true,color:W,fontSize:20,breakLine:true}},{text:'JAINJ sebagai urus setia',options:{color:'C9D3E8',fontSize:16}}],{x:3.9,y:2.3,w:5.0,h:1.4,fontFace:F,valign:'middle',margin:0});
['Kerjasama strategik antara agensi','Pembangunan keupayaan usahawan','Pemudahcaraan industri'].forEach((t,i)=>{
 s.addShape('rect',{x:0.8+i*2.75,y:4.05,w:2.6,h:0.85,fill:{color:'16305F'},line:{color:GOLD,width:0.75}});
 s.addText(t,{x:0.85+i*2.75,y:4.05,w:2.5,h:0.85,fontFace:F,fontSize:14,bold:true,color:W,align:'center',valign:'middle',margin:0});});
s.addShape('rect',{x:0.8,y:5.15,w:8.1,h:1.7,fill:{color:W}});
s.addShape('rect',{x:0.8,y:5.15,w:0.1,h:1.7,fill:{color:RED}});
s.addText('“Kerajaan Negeri akan terus memperkukuh pelaksanaan PKHNJ 2030 bagi memastikan ekosistem halal Johor berkembang secara lebih menyeluruh, mampan dan berdaya saing, seterusnya mencapai sasaran yang ditetapkan menjelang tahun 2030.”',{x:1.1,y:5.15,w:7.6,h:1.7,fontFace:F,fontSize:15,italic:true,color:NAVY,valign:'middle',margin:0});
photo(s,9.7,1.6,3.13,5.25,'LETAKKAN GAMBAR\nYB EXCO BERSAMA\nAGENSI / AKTIVITI\nBERKAITAN',true);
s.addText('Jawapan Soalan Lisan A93  |  Belanjawan Johor 2027',{x:0.8,y:7.0,w:8,h:0.3,fontFace:F,fontSize:11,color:'C9D3E8',margin:0});

p.writeFile({fileName:'Soal-Jawab-A93-PKHNJ-2030.pptx'}).then(f=>console.log('ok',f));
