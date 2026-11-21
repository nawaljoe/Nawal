// Single-slide PPTX of slide 7 ("1. Penyediaan dana melalui TPMJ" - RM6.3 juta, Jadual 1 & 2), built to import cleanly into Canva:
// no layouts, placeholders, tables, charts, gradients or transparency — only text boxes, shapes, lines and images.
// The donation tables are drawn from shapes + text boxes so colours and alignment survive the import.
// Usage: NODE_PATH=<node_modules with pptxgenjs> node build_slide7_canva.js
const path = require('path');
const pptxgen = require('pptxgenjs');

const A = (f) => path.join(__dirname, 'assets', f);
const X = (px) => +(px / 144).toFixed(4);     // 1920 x 1080 design px -> inches (13.333" x 7.5")
const F = (px) => +(px * 0.5).toFixed(1);     // design px -> points
const FONT = 'Arial';
const NAVY = '071D3B', GOLD = 'C8A45D', GOLD_D = '94712C', GOLD_T = 'F3E7CB', OFF = 'F5F3EE', MUTE = '5B6474', INK = '1C2533';
const LINE = 'DCD6C8', ZEBRA = 'F8F6F1', SLOT = 'E8E4DA';

const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE';
pres.title = '1. Penyediaan Dana Melalui TPMJ – Soalan Lisan A203';
const s = pres.addSlide();
s.background = { color: OFF };

const T = (text, o) => s.addText(text, { isTextBox: true, fontFace: FONT, margin: 0, valign: 'top', ...o });
const rect = (x, y, w, h, color, name) => s.addShape(pres.shapes.RECTANGLE, { x: X(x), y: X(y), w: X(w), h: X(h), fill: { color }, line: { type: 'none' }, objectName: name });
const line = (x, y, w, h, color, width, name) => s.addShape(pres.shapes.LINE, { x: X(x), y: X(y), w: X(w), h: X(h), line: { color, width }, objectName: name });

// ---- header ----
rect(96, 62, 8, 48, GOLD, 'Penanda pengepala');
T([{ text: 'SUMBANGAN TPMJ  ', options: { color: NAVY } }, { text: '2025 & 2026 · 1/2', options: { color: GOLD_D } }], { x: X(120), y: X(58), w: X(760), h: X(56), fontSize: F(30), bold: true, charSpacing: 1.5, valign: 'middle', objectName: 'Label pengepala' });
line(820, 86, 660, 0, NAVY, 1.5, 'Garis pengepala');
s.addImage({ path: A('belanjawan.png'), x: X(1505), y: X(50), w: X(143), h: X(72), altText: 'Logo Belanjawan Johor 2027', objectName: 'Logo Belanjawan Johor 2027' });
s.addImage({ path: A('jata.png'), x: X(1666), y: X(53), w: X(83), h: X(66), altText: 'Jata Negeri Johor', objectName: 'Jata Negeri Johor' });
s.addImage({ path: A('majujohor.png'), x: X(1767), y: X(53), w: X(57), h: X(66), altText: 'Logo Maju Johor', objectName: 'Logo Maju Johor' });
T([{ text: '1. ', options: { color: GOLD_D } }, { text: 'PENYEDIAAN DANA MELALUI TABUNG PEMBANGUNAN MASJID DAN AMAL JARIAH JOHOR', options: { color: NAVY } }], { x: X(96), y: X(138), w: X(1728), h: X(60), fontSize: 17, bold: true, valign: 'middle', objectName: 'Tajuk slaid' });

// ---- left: headline figure + photo space ----
T([{ text: 'RM6.3', options: { fontSize: F(124), color: NAVY } }, { text: ' JUTA', options: { fontSize: F(56), color: GOLD_D } }], { x: X(96), y: X(214), w: X(640), h: X(130), bold: true, valign: 'bottom', objectName: 'Angka utama' });
T('DIPERUNTUKKAN BAGI PEMBANGUNAN MASJID DAN SURAU', { x: X(96), y: X(350), w: X(620), h: X(96), fontSize: F(33), bold: true, color: NAVY, objectName: 'Tajuk angka' });
T('Tabung Pembangunan Masjid dan Amal Jariah Johor (TPMJ) bagi tahun 2025 dan 2026', { x: X(96), y: X(448), w: X(620), h: X(62), fontSize: F(23), color: MUTE, objectName: 'Subtajuk' });
rect(96, 540, 620, 420, SLOT, 'Ruang gambar');
s.addImage({ path: A('ic_photo.png'), x: X(374), y: X(718), w: X(64), h: X(64), altText: 'Ikon ruang gambar', objectName: 'Ikon ruang gambar' });

// ---- right: the two donation tables (shapes + text) ----
const COLS = [756, 836, 1654, 1824];  // BIL | NAMA | DAERAH | JUMLAH edges (last col ends at 1824)
function caption(y, tag, text, h = 42) {
  rect(756, y, 140, 38, GOLD_D, 'Label ' + tag);
  T(tag, { x: X(756), y: X(y), w: X(140), h: X(38), fontSize: F(19), bold: true, color: 'FFFFFF', align: 'center', valign: 'middle', charSpacing: 1.5, objectName: 'Teks label ' + tag });
  T(text, { x: X(914), y: X(y - 2), w: X(910), h: X(h), fontSize: F(27), bold: true, color: NAVY, valign: h > 42 ? 'top' : 'middle', objectName: 'Kapsyen ' + tag });
}
function table(tag, y0, nameHdr, rows, total, heights) {
  // columns: BIL 756-836, NAMA 836-1484, DAERAH 1484-1654, JUMLAH 1654-1824
  const C = [756, 836, 1484, 1654, 1824];
  const hh = heights[0];
  rect(756, y0, 1068, hh, NAVY, 'Latar tajuk ' + tag);
  [['BIL.', 'center'], [nameHdr.toUpperCase(), 'left'], ['DAERAH', 'left'], ['JUMLAH (RM)', 'right']].forEach(([t, a], i) => {
    const padL = a === 'left' ? 14 : 0, padR = a === 'right' ? 14 : 0;
    T(t, { x: X(C[i] + padL), y: X(y0), w: X(C[i + 1] - C[i] - padL - padR), h: X(hh), fontSize: F(17), bold: true, color: 'FFFFFF', align: a, valign: 'middle', objectName: 'Tajuk lajur ' + (i + 1) + ' ' + tag });
  });
  let y = y0 + hh;
  rows.forEach(([n, nm, d, amt], i) => {
    const h = heights[i + 1];
    rect(756, y, 1068, h, i % 2 ? ZEBRA : 'FFFFFF', 'Latar baris ' + tag + ' ' + (i + 1));
    T(String(n), { x: X(C[0]), y: X(y), w: X(C[1] - C[0]), h: X(h), fontSize: F(26), bold: true, color: MUTE, align: 'center', valign: 'middle', objectName: 'Bil ' + tag + ' ' + (i + 1) });
    T(nm, { x: X(C[1] + 14), y: X(y), w: X(C[2] - C[1] - 24), h: X(h), fontSize: F(26), bold: true, color: NAVY, valign: 'middle', objectName: 'Nama ' + tag + ' ' + (i + 1) });
    T(d, { x: X(C[2] + 14), y: X(y), w: X(C[3] - C[2] - 14), h: X(h), fontSize: F(26), color: INK, valign: 'middle', objectName: 'Daerah ' + tag + ' ' + (i + 1) });
    T(amt, { x: X(C[3]), y: X(y), w: X(C[4] - C[3] - 14), h: X(h), fontSize: F(26), bold: true, color: NAVY, align: 'right', valign: 'middle', objectName: 'Jumlah ' + tag + ' ' + (i + 1) });
    line(756, y + h, 1068, 0, LINE, 0.75, 'Garis baris ' + tag + ' ' + (i + 1));
    y += h;
  });
  const th = heights[rows.length + 1];
  rect(756, y, 1068, th, GOLD_T, 'Latar jumlah ' + tag);
  line(756, y, 1068, 0, GOLD, 1.5, 'Garis jumlah ' + tag);
  T('JUMLAH', { x: X(C[1] + 14), y: X(y), w: X(400), h: X(th), fontSize: F(27), bold: true, color: NAVY, charSpacing: 1, valign: 'middle', objectName: 'Label jumlah ' + tag });
  T(total, { x: X(C[3]), y: X(y), w: X(C[4] - C[3] - 14), h: X(th), fontSize: F(28), bold: true, color: NAVY, align: 'right', valign: 'middle', objectName: 'Jumlah keseluruhan ' + tag });
}

caption(224, 'JADUAL 1', 'Sumbangan Pembinaan Surau Kritikal Negeri Johor');
table('J1', 274, 'Nama Surau', [
  [1, 'Surau Al-Amir, Lorong Haji Amir, Simpang Renggam', 'Kluang', '259,800'],
  [2, 'Surau Kg. Jelutong Darat', 'Pontian', '240,000'],
  [3, 'Surau Parit Tegong', 'Pontian', '240,000'],
], '739,800', [44, 66, 40, 40, 48]);

caption(544, 'JADUAL 2', 'Sumbangan Pembinaan Semula dan Pembinaan Baharu Masjid Negeri Johor Tahun 2025', 66);
table('J2', 620, 'Nama Masjid', [
  [1, 'Masjid An-Nur, Ladang Seri Gading', 'Batu Pahat', '1,000,000'],
  [2, 'Masjid Taman Sri Penawar, Bandar Penawar', 'Kota Tinggi', '1,000,000'],
  [3, 'Masjid Parit Haji Arif, Benut', 'Pontian', '500,000'],
  [4, 'Masjid Kg. Contoh, Kahang', 'Kluang', '400,000'],
  [5, 'Masjid Kg. Melayu, Chamek, Kahang', 'Kluang', '200,000'],
  [6, 'Masjid Al-Ehsan, Taman Wawasan, Kelapa Sawit', 'Kulai', '500,000'],
], '3,600,000', [44, 40, 40, 40, 40, 40, 44, 48]);

// ---- footer ----
T('JAWAPAN SOALAN LISAN A203', { x: X(96), y: X(1010), w: X(800), h: X(40), fontSize: F(20), bold: true, color: MUTE, charSpacing: 2.5, valign: 'middle', objectName: 'Label bawah' });

s.addNotes('1. Penyediaan dana melalui Tabung Pembangunan Masjid dan Amal Jariah Johor (TPMJ): RM6.3 juta diperuntukkan bagi menampung komitmen pembinaan baharu masjid dan surau 2025-2026. Jadual 1: 3 surau kritikal (RM739,800). Jadual 2: 6 masjid tahun 2025 (RM3,600,000). Ruang gambar kiri: letakkan gambar di atas kotak kelabu.');

pres.writeFile({ fileName: path.join(__dirname, 'A203_Slaid7_Canva.pptx') }).then((f) => console.log('wrote', f));
