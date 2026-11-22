// Templat slaid tunggal PPTX yang boleh diimport ke Canva (16:9, 13.333" x 7.5").
// Peraturan: tiada layout/placeholder/jadual/carta/kecerunan/kelutsinaran — hanya kotak teks, bentuk, garisan dan gambar.
// Jadual dibina daripada bentuk + kotak teks (sel gabungan & warna selamat diimport).
// Guna:  NODE_PATH=<node_modules yang ada pptxgenjs> node canva_slide_template.js [fail_keluar.pptx]
// Koordinat ditulis dalam px reka bentuk 1920 x 1080: X(px) -> inci, F(px) -> pt.
const path = require('path');
const pptxgen = require('pptxgenjs');

const A = (f) => path.join(__dirname, '..', 'assets', f);
const X = (px) => +(px / 144).toFixed(4);
const F = (px) => +(px * 0.5).toFixed(1);
const FONT = 'Arial';                     // ada dalam Canva; jangan guna fon lain
const NAVY = '071D3B', GOLD = 'C8A45D', GOLD_D = '94712C', GOLD_T = 'F3E7CB', OFF = 'F5F3EE', MUTE = '5B6474', INK = '1C2533';
const LINE = 'DCD6C8', HAIR = '67614C';   // HAIR = emas pudar di atas navy (ganti kelutsinaran)

const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE';
pres.title = 'Tajuk slaid';
const s = pres.addSlide();
s.background = { color: OFF };

const T = (text, o) => s.addText(text, { isTextBox: true, fontFace: FONT, margin: 0, valign: 'top', ...o });
const rect = (x, y, w, h, color, name) => s.addShape(pres.shapes.RECTANGLE, { x: X(x), y: X(y), w: X(w), h: X(h), fill: { color }, line: { type: 'none' }, objectName: name });
const line = (x, y, w, h, color, width, name) => s.addShape(pres.shapes.LINE, { x: X(x), y: X(y), w: X(w), h: X(h), line: { color, width }, objectName: name });

// ---- pengepala: label kiri, garis, tiga logo kanan ----
const label1 = 'LABEL', label2 = 'Bahagian';
rect(96, 62, 8, 48, GOLD, 'Penanda pengepala');
T([{ text: label1 + '  ', options: { color: NAVY } }, { text: label2, options: { color: GOLD_D } }], { x: X(120), y: X(58), w: X(760), h: X(56), fontSize: F(30), bold: true, charSpacing: 1.5, valign: 'middle', objectName: 'Label pengepala' });
// garis bermula SELEPAS teks label (kira ~19.5px sehuruf + 156)
line(Math.round(156 + (label1.length + 2 + label2.length) * 19.5), 86, 1480 - Math.round(156 + (label1.length + 2 + label2.length) * 19.5), 0, NAVY, 1.5, 'Garis pengepala');
s.addImage({ path: A('belanjawan.png'), x: X(1505), y: X(50), w: X(143), h: X(72), altText: 'Logo Belanjawan Johor 2027', objectName: 'Logo Belanjawan Johor 2027' });
s.addImage({ path: A('jata.png'), x: X(1666), y: X(53), w: X(83), h: X(66), altText: 'Jata Negeri Johor', objectName: 'Jata Negeri Johor' });
s.addImage({ path: A('majujohor.png'), x: X(1767), y: X(53), w: X(57), h: X(66), altText: 'Logo Maju Johor', objectName: 'Logo Maju Johor' });

// ---- tajuk (dua warna) ----
T([{ text: 'TAJUK BARIS PERTAMA', options: { color: NAVY, breakLine: true } }, { text: 'BARIS KEDUA EMAS', options: { color: GOLD_D } }], { x: X(96), y: X(140), w: X(1728), h: X(140), fontSize: 30, bold: true, lineSpacingMultiple: 0.95, objectName: 'Tajuk slaid' });

// ---- contoh: panel navy + senarai point ----
rect(96, 292, 760, 640, NAVY, 'Panel');
[['01', 'Point pertama'], ['02', 'Point kedua'], ['03', 'Point ketiga']].forEach(([n, t], i) => {
  const y = 340 + i * 180;
  line(140, y, 672, 0, HAIR, 0.75, 'Pemisah ' + n);
  T(n, { x: X(140), y: X(y + 28), w: X(90), h: X(90), fontSize: F(52), bold: true, color: GOLD, objectName: 'Nombor ' + n });
  T(t, { x: X(250), y: X(y + 26), w: X(562), h: X(58), fontSize: F(34), bold: true, color: 'FFFFFF', objectName: 'Point ' + n });
});

// ---- contoh: kad statistik ----
rect(896, 292, 452, 230, 'FFFFFF', 'Kad 10%');
T('10%', { x: X(928), y: X(316), w: X(390), h: X(130), fontSize: F(104), bold: true, color: GOLD_D, valign: 'middle', objectName: 'Angka 10%' });
T('Keterangan', { x: X(928), y: X(454), w: X(390), h: X(46), fontSize: F(30), bold: true, color: NAVY, valign: 'middle', objectName: 'Label 10%' });

// ---- contoh: jadual daripada bentuk (header navy, baris zebra, jumlah emas) ----
const rows = [['1', 'Nama pertama', 'Daerah A', '100,000'], ['2', 'Nama kedua', 'Daerah B', '200,000']];
rect(896, 560, 928, 44, NAVY, 'Latar tajuk jadual');
[['BIL.', 896, 70, 'center'], ['NAMA', 980, 400, 'left'], ['DAERAH', 1400, 200, 'left'], ['JUMLAH (RM)', 1610, 200, 'right']].forEach(([t, x, w, a]) =>
  T(t, { x: X(x), y: X(560), w: X(w), h: X(44), fontSize: F(17), bold: true, color: 'FFFFFF', align: a, valign: 'middle', objectName: 'Tajuk lajur ' + t }));
rows.forEach(([n, nm, d, amt], i) => {
  const y = 604 + i * 44;
  rect(896, y, 928, 44, i % 2 ? 'F8F6F1' : 'FFFFFF', 'Latar baris ' + n);
  T(n, { x: X(896), y: X(y), w: X(70), h: X(44), fontSize: F(26), bold: true, color: MUTE, align: 'center', valign: 'middle' });
  T(nm, { x: X(980), y: X(y), w: X(400), h: X(44), fontSize: F(26), bold: true, color: NAVY, valign: 'middle' });
  T(d, { x: X(1400), y: X(y), w: X(200), h: X(44), fontSize: F(26), color: INK, valign: 'middle' });
  T(amt, { x: X(1610), y: X(y), w: X(200), h: X(44), fontSize: F(26), bold: true, color: NAVY, align: 'right', valign: 'middle' });
  line(896, y + 44, 928, 0, LINE, 0.75, 'Garis baris ' + n);
});
rect(896, 692, 928, 48, GOLD_T, 'Latar jumlah');
line(896, 692, 928, 0, GOLD, 1.5, 'Garis jumlah');
T('JUMLAH', { x: X(980), y: X(692), w: X(400), h: X(48), fontSize: F(27), bold: true, color: NAVY, charSpacing: 1, valign: 'middle' });
T('300,000', { x: X(1610), y: X(692), w: X(200), h: X(48), fontSize: F(28), bold: true, color: NAVY, align: 'right', valign: 'middle' });

// ---- pengaki ----
T('JAWAPAN SOALAN LISAN', { x: X(96), y: X(1010), w: X(800), h: X(40), fontSize: F(20), bold: true, color: MUTE, charSpacing: 2.5, valign: 'middle', objectName: 'Label bawah' });
s.addNotes('Nota penceramah: letak ayat penuh dokumen sumber di sini.');

const out = path.resolve(process.argv[2] || 'slaid_canva.pptx');
pres.writeFile({ fileName: out }).then((f) => console.log('wrote', f));
