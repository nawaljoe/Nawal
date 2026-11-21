// Single-slide PPTX of slide 3 ("Jawapan - Pendahuluan"), built to import cleanly into Canva:
// no layouts, placeholders, tables, charts, gradients or transparency — only text boxes, shapes, lines and logo images.
// Usage: NODE_PATH=<node_modules with pptxgenjs> node build_slide3_canva.js
const path = require('path');
const pptxgen = require('pptxgenjs');

const A = (f) => path.join(__dirname, 'assets', f);
const X = (px) => +(px / 144).toFixed(4);     // 1920 x 1080 design px -> inches (13.333" x 7.5")
const F = (px) => +(px * 0.5).toFixed(1);     // design px -> points
const FONT = 'Arial';
const NAVY = '071D3B', GOLD = 'C8A45D', GOLD_D = '94712C', OFF = 'F5F3EE', MUTE = '5B6474', ON_NAVY = 'B9C4D6', HAIR = '67614C';

const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE';
pres.title = 'Jawapan Pendahuluan – Soalan Lisan A203';
const s = pres.addSlide();
s.background = { color: OFF };

const T = (text, o) => s.addText(text, { isTextBox: true, fontFace: FONT, margin: 0, valign: 'top', ...o });
const rect = (x, y, w, h, color, name) => s.addShape(pres.shapes.RECTANGLE, { x: X(x), y: X(y), w: X(w), h: X(h), fill: { color }, line: { type: 'none' }, objectName: name });
const line = (x, y, w, color, width, name) => s.addShape(pres.shapes.LINE, { x: X(x), y: X(y), w: X(w), h: 0, line: { color, width }, objectName: name });

// ---- header ----
rect(96, 62, 8, 48, GOLD, 'Penanda pengepala');
T([{ text: 'JAWAPAN  ', options: { color: NAVY } }, { text: 'Pendahuluan', options: { color: GOLD_D } }], { x: X(120), y: X(58), w: X(560), h: X(56), fontSize: F(30), bold: true, charSpacing: 1.5, valign: 'middle', objectName: 'Label pengepala' });
line(560, 86, 920, NAVY, 1.5, 'Garis pengepala');
s.addImage({ path: A('belanjawan.png'), x: X(1505), y: X(50), w: X(143), h: X(72), altText: 'Logo Belanjawan Johor 2027', objectName: 'Logo Belanjawan Johor 2027' });
s.addImage({ path: A('jata.png'), x: X(1666), y: X(53), w: X(83), h: X(66), altText: 'Jata Negeri Johor', objectName: 'Jata Negeri Johor' });
s.addImage({ path: A('majujohor.png'), x: X(1767), y: X(53), w: X(57), h: X(66), altText: 'Logo Maju Johor', objectName: 'Logo Maju Johor' });

// ---- left panel: commitment ----
rect(96, 168, 760, 796, NAVY, 'Panel komitmen');
T('KOMITMEN KERAJAAN NEGERI', { x: X(140), y: X(214), w: X(680), h: X(36), fontSize: F(22), bold: true, color: GOLD, charSpacing: 3, valign: 'middle', objectName: 'Label komitmen' });
T('Masjid dan surau terus diperkasa', { x: X(140), y: X(268), w: X(680), h: X(110), fontSize: F(44), bold: true, color: 'FFFFFF', objectName: 'Tajuk komitmen' });
[
  ['01', 'Pengimarahan dan pengurusan', ''],
  ['02', 'Pembangunan infrastruktur', ''],
  ['03', 'Kemudahan selesa dan kondusif', 'Untuk kegunaan ahli kariah'],
].forEach(([n, t, sub], i) => {
  const y = 420 + i * 175;
  line(140, y, 672, HAIR, 0.75, 'Pemisah point ' + n);
  T(n, { x: X(140), y: X(y + 28), w: X(90), h: X(90), fontSize: F(52), bold: true, color: GOLD, objectName: 'Nombor point ' + n });
  T(t, { x: X(250), y: X(y + 26), w: X(562), h: X(58), fontSize: F(34), bold: true, color: 'FFFFFF', objectName: 'Point ' + n });
  if (sub) T(sub, { x: X(250), y: X(y + 90), w: X(562), h: X(40), fontSize: F(24), color: ON_NAVY, valign: 'middle', objectName: 'Keterangan point ' + n });
});

// ---- right: basis of the 10% / 20% ----
T('ASAS KOMITMEN KARIAH', { x: X(896), y: X(214), w: X(900), h: X(36), fontSize: F(22), bold: true, color: GOLD_D, charSpacing: 3, valign: 'middle', objectName: 'Label asas' });
[['10%', 'Pembinaan baharu'], ['20%', 'Naik taraf / baik pulih']].forEach(([v, l], i) => {
  const x = 896 + i * 476;
  rect(x, 270, 452, 230, 'FFFFFF', 'Kad ' + v);
  T(v, { x: X(x + 32), y: X(294), w: X(390), h: X(130), fontSize: F(104), bold: true, color: GOLD_D, valign: 'middle', objectName: 'Angka ' + v });
  T(l, { x: X(x + 32), y: X(432), w: X(390), h: X(46), fontSize: F(30), bold: true, color: NAVY, valign: 'middle', objectName: 'Label ' + v });
});
[
  [524, 'Garis Panduan Bil. 1/2024', 'Jabatan Perdana Menteri', '1 Jan 2024'],
  [748, 'Keputusan Mesyuarat ke-139', 'YAB Perdana Menteri bersama Menteri Besar dan Ketua Menteri', '28 Jun 2022'],
].forEach(([y, t, sub, d]) => {
  rect(896, y, 928, 200, 'FFFFFF', 'Kad ' + t);
  T(t, { x: X(928), y: X(y + 34), w: X(560), h: X(50), fontSize: F(34), bold: true, color: NAVY, valign: 'middle', objectName: 'Tajuk ' + t });
  T(sub, { x: X(928), y: X(y + 92), w: X(520), h: X(80), fontSize: F(24), color: MUTE, objectName: 'Keterangan ' + t });
  T(d, { x: X(1470), y: X(y + 34), w: X(326), h: X(50), fontSize: F(36), bold: true, color: GOLD_D, align: 'right', valign: 'middle', objectName: 'Tarikh ' + d });
});

// ---- footer ----
T('JAWAPAN SOALAN LISAN A203', { x: X(96), y: X(1010), w: X(800), h: X(40), fontSize: F(20), bold: true, color: MUTE, charSpacing: 2.5, valign: 'middle', objectName: 'Label bawah' });

s.addNotes('Pendahuluan jawapan A203: komitmen Kerajaan Negeri memperkasa masjid dan surau. Asas 10% / 20%: Garis Panduan Bil. 1/2024 (JPM, 1 Januari 2024), selaras keputusan Mesyuarat bersama Menteri Besar dan Ketua Menteri ke-139 pada 28 Jun 2022.');

pres.writeFile({ fileName: path.join(__dirname, 'A203_Slaid3_Canva.pptx') }).then((f) => console.log('wrote', f));
