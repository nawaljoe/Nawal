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

// ---- headline and call to scan ----
s.addImage({ path: A('mosque_cover.png'), x: X(0), y: X(738), w: X(1080), h: X(250), altText: 'Siluet masjid', objectName: 'Siluet masjid' });
line(96, 250, 46, 0, GOLD, 1.5, 'Garis label');
T('TABUNG PEMBANGUNAN MASJID JOHOR', { x: X(158), y: X(232), w: X(930), h: X(36), fontSize: F(22), bold: true, color: GOLD, charSpacing: 3, valign: 'middle', objectName: 'Nama tabung' });
T([{ text: 'MARILAH KITA', options: { color: 'FFFFFF', breakLine: true } }, { text: 'BERSAMA-SAMA', options: { color: GOLD, breakLine: true } }, { text: 'MENYUMBANG', options: { color: GOLD } }], { x: X(96), y: X(300), w: X(980), h: X(300), fontSize: F(92), bold: true, lineSpacingMultiple: 1.0, objectName: 'Tajuk slaid' });
T('IMBAS KOD QR  →', { x: X(96), y: X(676), w: X(900), h: X(50), fontSize: F(34), bold: true, color: 'FFFFFF', charSpacing: 3, valign: 'middle', objectName: 'Label imbas' });

// ---- DuitNow QR poster (901 x 1280), as large as the slide allows ----
s.addImage({ path: A('qr_duitnow.jpg'), x: X(1120), y: X(40), w: X(704), h: X(1000), altText: 'Kod QR DuitNow Tabung Pembangunan Masjid Johor', objectName: 'Kod QR DuitNow' });

T('JAWAPAN SOALAN LISAN A203', { x: X(96), y: X(1010), w: X(800), h: X(40), fontSize: F(20), bold: true, color: FOOT, charSpacing: 2.5, valign: 'middle', objectName: 'Label bawah' });

s.addNotes('Slaid sumbangan: imbas kod QR DuitNow (Malaysia National QR) Tabung Pembangunan Masjid Johor, rakan peniaga Bank Rakyat. Seruan: "Marilah kita bersama-sama menyumbang ke dalam Tabung Pembangunan Masjid dan Amal Jariah Johor demi memastikan masjid terus terpelihara sebagai pusat ibadah, ilmu dan pembangunan ummah." Untuk tukar kod QR: klik kanan gambar > Change Picture.');

pres.writeFile({ fileName: path.join(__dirname, 'A203_Slaid12_Canva.pptx') }).then((f) => console.log('wrote', f));
