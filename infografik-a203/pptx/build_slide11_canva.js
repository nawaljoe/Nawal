// Single-slide PPTX of slide 11 ("Inisiatif 2 & 3": agency coordination and khairat collections), built to import cleanly into Canva:
// no layouts, placeholders, tables, charts, gradients or transparency — only text boxes, shapes, lines and logo images.
// Usage: NODE_PATH=<node_modules with pptxgenjs> node build_slide11_canva.js
const path = require('path');
const pptxgen = require('pptxgenjs');

const A = (f) => path.join(__dirname, 'assets', f);
const X = (px) => +(px / 144).toFixed(4);     // 1920 x 1080 design px -> inches (13.333" x 7.5")
const F = (px) => +(px * 0.5).toFixed(1);     // design px -> points
const FONT = 'Arial';
const NAVY = '071D3B', GOLD = 'C8A45D', GOLD_D = '94712C', OFF = 'F5F3EE', MUTE = '5B6474', INK = '1C2533', LINE = 'DCD6C8', CHIP = 'E9EEF5', ROYAL = '123F70';

const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE';
pres.title = 'Inisiatif 2 & 3 – Soalan Lisan A203';
const s = pres.addSlide();
s.background = { color: OFF };

const T = (text, o) => s.addText(text, { isTextBox: true, fontFace: FONT, margin: 0, valign: 'top', ...o });
const rect = (x, y, w, h, color, name) => s.addShape(pres.shapes.RECTANGLE, { x: X(x), y: X(y), w: X(w), h: X(h), fill: { color }, line: { type: 'none' }, objectName: name });
const line = (x, y, w, h, color, width, name) => s.addShape(pres.shapes.LINE, { x: X(x), y: X(y), w: X(w), h: X(h), line: { color, width }, objectName: name });

// ---- header ----
rect(96, 62, 8, 48, GOLD, 'Penanda pengepala');
T([{ text: 'INISIATIF  ', options: { color: NAVY } }, { text: 'Kerajaan Negeri · 2 & 3', options: { color: GOLD_D } }], { x: X(120), y: X(58), w: X(760), h: X(56), fontSize: F(30), bold: true, charSpacing: 1.5, valign: 'middle', objectName: 'Label pengepala' });
line(800, 86, 680, 0, NAVY, 1.5, 'Garis pengepala');
s.addImage({ path: A('belanjawan.png'), x: X(1505), y: X(50), w: X(143), h: X(72), altText: 'Logo Belanjawan Johor 2027', objectName: 'Logo Belanjawan Johor 2027' });
s.addImage({ path: A('jata.png'), x: X(1666), y: X(53), w: X(83), h: X(66), altText: 'Jata Negeri Johor', objectName: 'Jata Negeri Johor' });
s.addImage({ path: A('majujohor.png'), x: X(1767), y: X(53), w: X(57), h: X(66), altText: 'Logo Maju Johor', objectName: 'Logo Maju Johor' });

// ---- two columns ----
[
  { x: 96, no: '2', title: 'PENYELARASAN PERUNTUKAN MELALUI AGENSI KERAJAAN NEGERI' },
  { x: 984, no: '3', title: 'PENGURUSAN KUTIPAN KHAIRAT DAN SUMBANGAN ORANG RAMAI' },
].forEach(({ x, no, title }) => {
  rect(x, 168, 840, 130, NAVY, 'Kepala perkara ' + no);
  T(no, { x: X(x + 30), y: X(168), w: X(84), h: X(130), fontSize: F(100), bold: true, color: GOLD, valign: 'middle', objectName: 'Nombor perkara ' + no });
  T(title, { x: X(x + 124), y: X(168), w: X(690), h: X(130), fontSize: F(30), bold: true, color: 'FFFFFF', valign: 'middle', objectName: 'Tajuk perkara ' + no });
  rect(x, 298, 840, 552, 'FFFFFF', 'Isi perkara ' + no);
});
const point = (x, y, no, t, sub) => {
  line(x + 28, y, 784, 0, LINE, 0.75, 'Pemisah ' + no + ' ' + t.slice(0, 12));
  T(t, { x: X(x + 28), y: X(y + 18), w: X(784), h: X(40), fontSize: F(30), bold: true, color: NAVY, valign: 'middle', objectName: 'Point ' + no + ' ' + t.slice(0, 16) });
  T(sub, { x: X(x + 28), y: X(y + 62), w: X(784), h: X(66), fontSize: F(23), color: MUTE, objectName: 'Keterangan ' + no + ' ' + t.slice(0, 16) });
};
// 2 — agency coordination
T('KERJASAMA AGENSI', { x: X(124), y: X(326), w: X(500), h: X(30), fontSize: F(19), bold: true, color: GOLD_D, charSpacing: 2.5, valign: 'middle', objectName: 'Label kerjasama' });
let tx = 124;
['MAINJ', 'PEJABAT YAB MB JOHOR', 'JAINJ', 'TPMJ'].forEach((tg) => {
  const tw = 28 + tg.length * 13;
  rect(tx, 368, tw, 42, CHIP, 'Tag ' + tg);
  T(tg, { x: X(tx), y: X(368), w: X(tw), h: X(42), fontSize: F(19), bold: true, color: ROYAL, align: 'center', valign: 'middle', objectName: 'Teks tag ' + tg });
  tx += tw + 10;
});
T('Mengoptimumkan sumber kewangan, selain peruntukan Kerajaan Persekutuan', { x: X(124), y: X(424), w: X(784), h: X(64), fontSize: F(23), color: MUTE, objectName: 'Keterangan kerjasama' });
point(96, 506, '2', 'Dinilai ikut keperluan dan keutamaan', 'Semua permohonan, sebelum penyelarasan peruntukan dibuat');
point(96, 664, '2', 'Pengagihan teratur', 'Mengelakkan pertindihan pembiayaan bagi masjid dan surau yang sama');
// 3 — khairat collections
T('27', { x: X(1012), y: X(318), w: X(190), h: X(110), fontSize: F(100), bold: true, color: GOLD_D, valign: 'middle', objectName: '27 permohonan' });
T([{ text: 'permohonan kutipan khairat ', options: {} }, { text: 'diluluskan', options: { bold: true, color: NAVY } }, { text: ', 2025 hingga September 2026', options: {} }], { x: X(1214), y: X(318), w: X(582), h: X(110), fontSize: F(26), color: INK, valign: 'middle', objectName: 'Label 27 permohonan' });
point(984, 440, '3', 'Dibenarkan, tertakluk peraturan', 'Sumbangan orang ramai untuk pembinaan dan naik taraf masjid dan surau');
point(984, 576, '3', 'MAINJ mengawal selia kutipan', 'Seksyen 106 Enakmen Pentadbiran Agama Islam (Negeri Johor) 2003');
point(984, 712, '3', 'Patuhi garis panduan pungutan', 'Garis Panduan Permohonan Pungutan Khairat (Negeri Johor) 2020');

// ---- closing statement ----
rect(96, 874, 1728, 96, NAVY, 'Penutup perkara');
T([{ text: 'Kerajaan Negeri akan terus berusaha ' }, { text: 'meringankan beban pihak kariah', options: { bold: true, color: GOLD } }, { text: ' dan memastikan masjid dan surau terus dipelihara dan diperkasa di Negeri Johor.' }], { x: X(132), y: X(874), w: X(1656), h: X(96), fontSize: F(30), color: 'FFFFFF', valign: 'middle', objectName: 'Kenyataan penutup' });

T('JAWAPAN SOALAN LISAN A203', { x: X(96), y: X(1010), w: X(800), h: X(40), fontSize: F(20), bold: true, color: MUTE, charSpacing: 2.5, valign: 'middle', objectName: 'Label bawah' });

s.addNotes('2. Penyelarasan Peruntukan Melalui Agensi Kerajaan Negeri. Selain peruntukan Kerajaan Persekutuan, Kerajaan Negeri turut mengoptimumkan sumber kewangan melalui kerjasama beberapa agensi, antaranya Majlis Agama Islam Negeri Johor (MAINJ), Pejabat YAB Menteri Besar Johor, Jabatan Agama Islam Negeri Johor (JAINJ) serta Tabung Pembangunan Masjid dan Amal Jariah Johor. Semua permohonan akan dinilai berdasarkan keperluan dan keutamaan sebelum penyelarasan peruntukan dibuat bagi memastikan pengagihan dapat dilaksanakan secara teratur serta mengelakkan pertindihan pembiayaan bagi masjid dan surau yang sama.\n\n3. Pengurusan Kutipan Khairat dan Sumbangan Orang Ramai. Kerajaan Negeri turut membenarkan pengumpulan dana melalui sumbangan orang ramai bagi tujuan pembinaan dan naik taraf masjid serta surau, tertakluk kepada peraturan dan garis panduan yang berkuat kuasa. MAINJ, berdasarkan Seksyen 106 Enakmen Pentadbiran Agama Islam (Negeri Johor) 2003, mempunyai kuasa untuk mengawal selia kutipan khairat di Negeri Johor. Sebanyak 27 permohonan kebenaran kutipan khairat bagi tujuan baik pulih, bina baharu dan bina semula masjid dan surau telah diluluskan bagi tempoh tahun 2025 hingga September 2026. Semua permohonan kutipan hendaklah mematuhi Garis Panduan Permohonan Pungutan Khairat (Negeri Johor) 2020 bagi memastikan kutipan dilaksanakan secara teratur dan tujuan sumbangan dapat dipelihara.\n\nKerajaan Negeri akan terus berusaha meringankan beban pihak kariah dan memastikan institusi masjid serta surau terus dipelihara dan diperkasa di Negeri Johor.');

pres.writeFile({ fileName: path.join(__dirname, 'A203_Slaid11_Canva.pptx') }).then((f) => console.log('wrote', f));
