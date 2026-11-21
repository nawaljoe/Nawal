// Single-slide PPTX of slide 5 ("Berdasarkan Garis Panduan Kerajaan Persekutuan"), built to import cleanly into Canva:
// no layouts, placeholders, tables, charts, gradients or transparency — only text boxes, shapes, lines and logo images.
// The locality table is drawn from shapes + text boxes so merged cells and colours survive the import.
// Usage: NODE_PATH=<node_modules with pptxgenjs> node build_slide5_canva.js
const path = require('path');
const pptxgen = require('pptxgenjs');

const A = (f) => path.join(__dirname, 'assets', f);
const X = (px) => +(px / 144).toFixed(4);     // 1920 x 1080 design px -> inches (13.333" x 7.5")
const F = (px) => +(px * 0.5).toFixed(1);     // design px -> points
const FONT = 'Arial';
const NAVY = '071D3B', GOLD = 'C8A45D', GOLD_D = '94712C', GOLD_T = 'F3E7CB', OFF = 'F5F3EE', MUTE = '5B6474', INK = '1C2533';
const ON_NAVY = 'B9C4D6', HAIR = '67614C', LINE = 'DCD6C8', ZEBRA = 'F8F6F1', DASH = 'A3A9B3';

const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE';
pres.title = 'Garis Panduan Kerajaan Persekutuan – Soalan Lisan A203';
const s = pres.addSlide();
s.background = { color: OFF };

const T = (text, o) => s.addText(text, { isTextBox: true, fontFace: FONT, margin: 0, valign: 'top', ...o });
const rect = (x, y, w, h, color, name) => s.addShape(pres.shapes.RECTANGLE, { x: X(x), y: X(y), w: X(w), h: X(h), fill: { color }, line: { type: 'none' }, objectName: name });
const line = (x, y, w, h, color, width, name) => s.addShape(pres.shapes.LINE, { x: X(x), y: X(y), w: X(w), h: X(h), line: { color, width }, objectName: name });

// ---- header ----
rect(96, 62, 8, 48, GOLD, 'Penanda pengepala');
T([{ text: 'GARIS PANDUAN  ', options: { color: NAVY } }, { text: 'Bil. 1/2024', options: { color: GOLD_D } }], { x: X(120), y: X(58), w: X(560), h: X(56), fontSize: F(30), bold: true, charSpacing: 1.5, valign: 'middle', objectName: 'Label pengepala' });
line(670, 86, 810, 0, NAVY, 1.5, 'Garis pengepala');
s.addImage({ path: A('belanjawan.png'), x: X(1505), y: X(50), w: X(143), h: X(72), altText: 'Logo Belanjawan Johor 2027', objectName: 'Logo Belanjawan Johor 2027' });
s.addImage({ path: A('jata.png'), x: X(1666), y: X(53), w: X(83), h: X(66), altText: 'Jata Negeri Johor', objectName: 'Jata Negeri Johor' });
s.addImage({ path: A('majujohor.png'), x: X(1767), y: X(53), w: X(57), h: X(66), altText: 'Logo Maju Johor', objectName: 'Logo Maju Johor' });
T([{ text: 'BERDASARKAN GARIS PANDUAN', options: { color: NAVY, breakLine: true } }, { text: 'KERAJAAN PERSEKUTUAN', options: { color: GOLD_D } }], { x: X(96), y: X(140), w: X(1728), h: X(140), fontSize: 30, bold: true, lineSpacingMultiple: 0.95, objectName: 'Tajuk slaid' });

// ---- caption ----
rect(96, 292, 180, 38, GOLD_D, 'Label bina baharu');
T('BINA BAHARU', { x: X(96), y: X(292), w: X(180), h: X(38), fontSize: F(19), bold: true, color: 'FFFFFF', align: 'center', valign: 'middle', charSpacing: 1.5, objectName: 'Teks label bina baharu' });
T('Nisbah komitmen kewangan mengikut lokaliti', { x: X(294), y: X(290), w: X(800), h: X(42), fontSize: F(27), bold: true, color: NAVY, valign: 'middle', objectName: 'Kapsyen jadual' });

// ---- locality table (shapes + text) ----
const COLS = [96, 366, 606, 796, 946, 1096];     // column edges
const HEAD_Y = 340, HEAD_H = 46;
rect(96, HEAD_Y, 1000, HEAD_H, NAVY, 'Latar tajuk jadual');
[['NEGERI', 'left'], ['LOKALITI', 'left'], ['PERSEKUTUAN', 'center'], ['NEGERI', 'center'], ['KARIAH', 'center']].forEach(([t, a], i) => {
  const pad = a === 'left' ? 14 : 0;
  T(t, { x: X(COLS[i] + pad), y: X(HEAD_Y), w: X(COLS[i + 1] - COLS[i] - pad), h: X(HEAD_H), fontSize: F(16.5), bold: true, color: 'FFFFFF', align: a, valign: 'middle', objectName: 'Tajuk lajur ' + t + ' ' + (i + 1) });
});
const groups = [
  ['Selangor / Pulau Pinang / Johor', true, [['Bandar', '50%', '30%', '20%'], ['Pinggir Bandar', '60%', '30%', '10%'], ['Luar Bandar', '65%', '30%', '5%']]],
  ['Negeri Sembilan / Melaka / Pahang / Perak', false, [['Bandar', '70%', '20%', '10%'], ['Pinggir Bandar', '70%', '20%', '10%'], ['Luar Bandar', '75%', '20%', '5%']]],
  ['Kedah / Perlis / Kelantan / Terengganu', false, [['Bandar', '75%', '15%', '10%'], ['Pinggir Bandar', '80%', '15%', '5%'], ['Luar Bandar', '80%', '15%', '5%']]],
  ['Sabah / Sarawak', false, [['Bandar', '80%', '15%', '5%'], ['Pinggir Bandar', '85%', '15%', '-'], ['Luar Bandar', '85%', '15%', '-']]],
  ['Wilayah Persekutuan', false, [['Kuala Lumpur & Putrajaya', '80%', '-', '20%'], ['Labuan', '100%', '-', '-']]],
];
let y = HEAD_Y + HEAD_H;
groups.forEach(([g, jh, rows], gi) => {
  const fill = jh ? GOLD_T : gi % 2 ? ZEBRA : 'FFFFFF';
  const heights = rows.map((r) => (r[0].length > 16 ? 64 : 38));
  const gh = heights.reduce((a, b) => a + b, 0);
  // group (merged) cell
  rect(96, y, 270, gh, jh ? GOLD : 'FFFFFF', 'Sel kumpulan ' + (gi + 1));
  const gtxt = jh
    ? [{ text: 'Selangor / Pulau Pinang /', options: { fontSize: F(24), breakLine: true } }, { text: 'JOHOR', options: { fontSize: F(30) } }]
    : g;
  T(gtxt, { x: X(110), y: X(y), w: X(246), h: X(gh), fontSize: F(24), bold: true, color: NAVY, valign: 'middle', objectName: 'Kumpulan negeri ' + (gi + 1) });
  let ry = y;
  rows.forEach((r, ri) => {
    const h = heights[ri];
    rect(366, ry, 730, h, fill, 'Latar baris ' + (gi + 1) + '.' + (ri + 1));
    T(r[0], { x: X(378), y: X(ry), w: X(222), h: X(h), fontSize: F(26), color: INK, valign: 'middle', objectName: 'Lokaliti ' + (gi + 1) + '.' + (ri + 1) });
    r.slice(1).forEach((v, ci) => {
      const dash = v === '-';
      const col = ci + 2;                       // 2..4 -> columns 3..5
      T(dash ? '–' : v, { x: X(COLS[col]), y: X(ry), w: X(COLS[col + 1] - COLS[col]), h: X(h), fontSize: F(26), bold: !dash, color: dash ? DASH : (ci === 2 && jh ? GOLD_D : NAVY), align: 'center', valign: 'middle', objectName: ['Persekutuan', 'Negeri', 'Kariah'][ci] + ' ' + (gi + 1) + '.' + (ri + 1) });
    });
    if (ri < rows.length - 1) line(366, ry + h, 730, 0, LINE, 0.75, 'Garis baris ' + (gi + 1) + '.' + (ri + 1));
    ry += h;
  });
  line(96, y + gh, 1000, 0, jh ? GOLD : LINE, 1, 'Garis kumpulan ' + (gi + 1));
  y += gh;
});
line(366, HEAD_Y + HEAD_H, 0, y - (HEAD_Y + HEAD_H), LINE, 0.75, 'Garis menegak jadual');

// ---- right: key points from the reply ----
rect(1136, 292, 688, 654, NAVY, 'Panel perkara penting');
T('PERKARA PENTING', { x: X(1172), y: X(318), w: X(600), h: X(36), fontSize: F(22), bold: true, color: GOLD, charSpacing: 3, valign: 'middle', objectName: 'Label perkara penting' });
const pts = [
  ['01', [{ text: '30%', options: { color: GOLD } }, { text: ' komitmen Kerajaan Negeri' }], 'Daripada jumlah permohonan, sebelum dikemukakan kepada Pejabat YAB Perdana Menteri'],
  ['02', [{ text: 'Bukan caj', options: { color: GOLD } }, { text: ' Kerajaan Negeri' }], 'Sebahagian tanggungjawab pembiayaan garis panduan; tiada pengecualian'],
  ['03', [{ text: 'Mohon kutipan khairat' }], 'Melalui Pejabat Kadi Daerah, tertakluk garis panduan dan peraturan'],
  ['04', [{ text: 'Kutipan tidak mencukupi?' }], 'Projek disesuaikan mengikut peruntukan diterima dan kemampuan pembiayaan'],
];
pts.forEach(([n, t, sub], i) => {
  const py = 372 + i * 138;
  line(1172, py, 616, 0, HAIR, 0.75, 'Pemisah point ' + n);
  T(n, { x: X(1172), y: X(py + 20), w: X(74), h: X(70), fontSize: F(44), bold: true, color: GOLD, objectName: 'Nombor point ' + n });
  T(t, { x: X(1262), y: X(py + 18), w: X(530), h: X(44), fontSize: F(32), bold: true, color: 'FFFFFF', objectName: 'Point ' + n });
  T(sub, { x: X(1262), y: X(py + 64), w: X(530), h: X(76), fontSize: F(22), color: ON_NAVY, objectName: 'Keterangan point ' + n });
});

// ---- footer ----
T('JAWAPAN SOALAN LISAN A203', { x: X(96), y: X(1010), w: X(800), h: X(40), fontSize: F(20), bold: true, color: MUTE, charSpacing: 2.5, valign: 'middle', objectName: 'Label bawah' });

s.addNotes('Garis Panduan Bil. 1/2024 (JPM, 1 Januari 2024), selaras keputusan Mesyuarat Perdana Menteri bersama Menteri Besar dan Ketua Menteri ke-139 pada 28 Jun 2022.\n\nKerajaan Negeri juga perlu menyediakan komitmen sebanyak 30% daripada jumlah permohonan peruntukan sebelum dikemukakan kepada Pejabat YAB Perdana Menteri untuk pertimbangan kelulusan.\n\nKomitmen kewangan yang perlu disediakan oleh pihak kariah bukan merupakan caj yang dikenakan oleh Kerajaan Negeri, sebaliknya merupakan sebahagian daripada tanggungjawab pembiayaan yang telah ditetapkan melalui garis panduan berkenaan. Oleh itu, tiada pengecualian diberikan kepada pihak kariah yang tertakluk kepada syarat komitmen tersebut.\n\nBagi membantu pihak kariah mengumpulkan dana, pihak kariah disyorkan untuk memohon kebenaran menjalankan pungutan khairat melalui Pejabat Kadi Daerah masing-masing, tertakluk kepada garis panduan dan peraturan yang berkuat kuasa. Sekiranya jumlah kutipan khairat masih tidak mencukupi untuk menampung keseluruhan kos pembinaan, pelaksanaan projek pembinaan masjid dan surau akan disesuaikan berdasarkan jumlah peruntukan kewangan yang diterima serta kemampuan pembiayaan yang tersedia.');

pres.writeFile({ fileName: path.join(__dirname, 'A203_Slaid5_Canva.pptx') }).then((f) => console.log('wrote', f));
