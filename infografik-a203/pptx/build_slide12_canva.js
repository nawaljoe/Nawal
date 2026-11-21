// Single-slide PPTX of the last slide ("Marilah kita bersama-sama menyumbang" + DuitNow QR), built to import cleanly into Canva:
// no layouts, placeholders, tables, charts, gradients or transparency — only text boxes, shapes, lines and images.
// Usage: NODE_PATH=<node_modules with pptxgenjs> node build_slide12_canva.js
const path = require('path');
const pptxgen = require('pptxgenjs');

const A = (f) => path.join(__dirname, 'assets', f);
const X = (px) => +(px / 144).toFixed(4);     // 1920 x 1080 design px -> inches (13.333" x 7.5")
const F = (px) => +(px * 0.5).toFixed(1);     // design px -> points
const FONT = 'Arial';
const NAVY = '071D3B', GOLD = 'C8A45D', ON_NAVY = 'B9C4D6', FOOT = '8D9BB3', HAIR = '67614C';

const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE';
pres.title = 'Marilah Kita Bersama-sama Menyumbang – Soalan Lisan A203';
const s = pres.addSlide();
s.background = { color: NAVY };

const T = (text, o) => s.addText(text, { isTextBox: true, fontFace: FONT, margin: 0, valign: 'top', ...o });
const rect = (x, y, w, h, color, name) => s.addShape(pres.shapes.RECTANGLE, { x: X(x), y: X(y), w: X(w), h: X(h), fill: { color }, line: { type: 'none' }, objectName: name });
const line = (x, y, w, h, color, width, name) => s.addShape(pres.shapes.LINE, { x: X(x), y: X(y), w: X(w), h: X(h), line: { color, width }, objectName: name });

// ---- logos on a white chip ----
rect(96, 72, 341, 88, 'FFFFFF', 'Latar logo');
s.addImage({ path: A('belanjawan.png'), x: X(116), y: X(84), w: X(128), h: X(64), altText: 'Logo Belanjawan Johor 2027', objectName: 'Logo Belanjawan Johor 2027' });
s.addImage({ path: A('jata.png'), x: X(262), y: X(84), w: X(81), h: X(64), altText: 'Jata Negeri Johor', objectName: 'Jata Negeri Johor' });
s.addImage({ path: A('majujohor.png'), x: X(361), y: X(84), w: X(56), h: X(64), altText: 'Logo Maju Johor', objectName: 'Logo Maju Johor' });

// ---- headline and call to give ----
line(96, 206, 46, 0, GOLD, 1.5, 'Garis label');
T('TABUNG PEMBANGUNAN MASJID DAN AMAL JARIAH JOHOR', { x: X(158), y: X(188), w: X(1000), h: X(36), fontSize: F(22), bold: true, color: GOLD, charSpacing: 3, valign: 'middle', objectName: 'Nama tabung' });
T([{ text: 'MARILAH KITA', options: { color: 'FFFFFF', breakLine: true } }, { text: 'BERSAMA-SAMA MENYUMBANG', options: { color: GOLD } }], { x: X(96), y: X(234), w: X(1060), h: X(146), fontSize: F(58), bold: true, lineSpacingMultiple: 1.0, objectName: 'Tajuk slaid' });
T([{ text: 'Menyumbang ke dalam ', options: {} }, { text: 'Tabung Pembangunan Masjid dan Amal Jariah Johor', options: { bold: true, color: GOLD } }, { text: ' demi memastikan masjid terus terpelihara sebagai pusat ibadah, ilmu dan pembangunan ummah.', options: {} }], { x: X(96), y: X(406), w: X(1060), h: X(140), fontSize: F(29), color: 'E8EDF5', lineSpacingMultiple: 1.08, objectName: 'Seruan menyumbang' });

// ---- what a contribution supports ----
[
  ['01', 'Pemugaran, pemuliharaan dan pembangunan masjid', 'Serta penyelenggaraan masjid-masjid di seluruh Negeri Johor'],
  ['02', 'Memperkasa kerja-kerja amal Islamiah', 'Serta perkara-perkara lain yang berkaitan'],
  ['03', 'Setiap sumbangan ialah amal jariah', 'Manfaatnya dinikmati masyarakat dan generasi akan datang'],
].forEach(([n, t, sub], i) => {
  const y = 556 + i * 118;
  line(96, y, 1000, 0, HAIR, 0.75, 'Pemisah point ' + n);
  T(n, { x: X(96), y: X(y + 18), w: X(90), h: X(70), fontSize: F(48), bold: true, color: GOLD, objectName: 'Nombor point ' + n });
  T(t, { x: X(206), y: X(y + 16), w: X(890), h: X(44), fontSize: F(32), bold: true, color: 'FFFFFF', valign: 'middle', objectName: 'Point ' + n });
  T(sub, { x: X(206), y: X(y + 62), w: X(890), h: X(36), fontSize: F(23), color: ON_NAVY, valign: 'middle', objectName: 'Keterangan point ' + n });
});
T('IMBAS KOD QR UNTUK MENYUMBANG  →', { x: X(96), y: X(924), w: X(1000), h: X(40), fontSize: F(26), bold: true, color: GOLD, charSpacing: 3, valign: 'middle', objectName: 'Label imbas' });

// ---- DuitNow QR poster (901 x 1280) ----
s.addImage({ path: A('qr_duitnow.jpg'), x: X(1205), y: X(100), w: X(619), h: X(879), altText: 'Kod QR DuitNow Tabung Pembangunan Masjid Johor', objectName: 'Kod QR DuitNow' });

T('JAWAPAN SOALAN LISAN A203', { x: X(96), y: X(1010), w: X(800), h: X(40), fontSize: F(20), bold: true, color: FOOT, charSpacing: 2.5, valign: 'middle', objectName: 'Label bawah' });

s.addNotes('Slaid sumbangan: imbas kod QR DuitNow (Malaysia National QR) Tabung Pembangunan Masjid Johor, rakan peniaga Bank Rakyat. Seruan dan tiga point diambil daripada penutup jawapan A203. Untuk tukar kod QR: klik kanan gambar > Change Picture.');

pres.writeFile({ fileName: path.join(__dirname, 'A203_Slaid12_Canva.pptx') }).then((f) => console.log('wrote', f));
