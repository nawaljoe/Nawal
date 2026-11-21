// Builds an editable PPTX of the 7 A203 infographic slides.
// Canvas: 10.8" x 13.5" (4:5). Coordinates are written in the HTML design's px (1080 x 1350):
//   X(px) -> inches (px / 100), F(px) -> points (px * 0.72).
// Usage: NODE_PATH=<dir with pptxgenjs> node build.js
const path = require('path');
const pptxgen = require('pptxgenjs');
const { applyTheme } = require(process.env.PPTX_SKILL + '/scripts/apply_theme.js');

const A = (f) => path.join(__dirname, 'assets', f);
const X = (px) => +(px / 100).toFixed(3);
const F = (px) => +(px * 0.72).toFixed(1);
const FONT = 'Arial';

const THEME = {
  name: 'Johor Navy Emas',
  headFontFace: FONT,
  bodyFontFace: FONT,
  colors: {
    dk1: '1C2533', lt1: 'FFFFFF', dk2: '071D3B', lt2: 'F5F3EE',
    accent1: '123F70', accent2: 'C8A45D', accent3: '94712C', accent4: 'F3E7CB',
    accent5: '5B6474', accent6: 'DCD6C8', hlink: '123F70', folHlink: '94712C',
  },
};
// Hex copies for hex-only options and a few one-off tints
const H = { navy: '071D3B', royal: '123F70', gold: 'C8A45D', goldD: '94712C', goldT: 'F3E7CB', off: 'F5F3EE', line: 'DCD6C8', mute: '5B6474', ink: '1C2533' };
const TINT = { zebra: 'F8F6F1', blueT: 'E4ECF6', brown: '6E5220', onNavy: 'B9C4D6', footDark: '8D9BB3', chipBlue: 'E9EEF5', dash: 'A3A9B3', pale: 'C9D3E3' };

const pres = new pptxgen();
pres.defineLayout({ name: 'IG45', width: 10.8, height: 13.5 });
pres.layout = 'IG45';
pres.theme = { headFontFace: FONT, bodyFontFace: FONT };
pres.title = 'Infografik Jawapan Soalan Lisan A203 – Belanjawan Johor 2027';
pres.subject = 'Komitmen kewangan kariah bagi pembangunan masjid dan surau';
const C = pres.SchemeColor;

// ---------- shared layout pieces ----------
const logos = (dark) => {
  const o = [];
  if (dark) return o;
  o.push({ image: { path: A('belanjawan.png'), x: X(765), y: X(50), w: X(112), h: X(56) } });
  o.push({ image: { path: A('jata.png'), x: X(891), y: X(52), w: X(66), h: X(52) } });
  o.push({ image: { path: A('majujohor.png'), x: X(971), y: X(52), w: X(45), h: X(52) } });
  return o;
};
const footer = (txtColor, pgColor) => [
  { text: { text: 'JAWAPAN SOALAN LISAN A203', options: { x: X(64), y: X(1290), w: X(600), h: X(30), fontFace: FONT, fontSize: F(15), bold: true, color: txtColor, charSpacing: 2, margin: 0, valign: 'middle' } } },
  { text: { text: '/ 07', options: { x: X(962), y: X(1290), w: X(56), h: X(30), fontFace: FONT, fontSize: F(20), bold: true, color: pgColor, margin: 0, valign: 'middle' } } },
];
const slideNum = (color) => ({ x: X(880), y: X(1290), w: X(78), h: X(30), fontFace: FONT, fontSize: F(20), bold: true, color, align: 'right', valign: 'middle', margin: 0 });
const eyebrowPh = { placeholder: { options: { name: 'eyebrow', type: 'body', x: X(84), y: X(58), w: X(660), h: X(40), fontFace: FONT, fontSize: F(22), bold: true, color: C.text2, charSpacing: 1.2, margin: 0, valign: 'middle' }, text: '' } };
const titlePh = { placeholder: { options: { name: 'title', type: 'title', x: X(64), y: X(138), w: X(952), h: X(118), fontFace: FONT, fontSize: 36, bold: true, color: C.text2, align: 'left', margin: 0, valign: 'top', lineSpacingMultiple: 0.95 }, text: '' } };
const goldBar = { rect: { x: X(64), y: X(59), w: X(6), h: X(38), fill: { color: C.accent2 } } };

pres.defineSlideMaster({
  title: 'COVER_DARK',
  background: { color: H.navy },
  objects: [
    { image: { path: A('pattern_cover.png'), x: 0, y: 0, w: 10.8, h: 13.5 } },
    { image: { path: A('mosque_cover.png'), x: 0, y: X(1016), w: 10.8, h: X(250) } },
    { rect: { x: X(378), y: X(56), w: X(324), h: X(82), fill: { color: 'FFFFFF' }, rectRadius: 0 } },
    { image: { path: A('belanjawan.png'), x: X(400), y: X(68), w: X(116), h: X(58) } },
    { image: { path: A('jata.png'), x: X(534), y: X(68), w: X(73), h: X(58) } },
    { image: { path: A('majujohor.png'), x: X(626), y: X(68), w: X(50), h: X(58) } },
    ...footer(TINT.footDark, H.gold),
    { placeholder: { options: { name: 'title', type: 'title', x: X(64), y: X(226), w: X(952), h: X(160), fontFace: FONT, fontSize: F(66), bold: true, color: C.background1, align: 'center', valign: 'middle', margin: 0, lineSpacingMultiple: 0.95 }, text: '' } },
  ],
  slideNumber: slideNum('FFFFFF'),
});

pres.defineSlideMaster({
  title: 'KANDUNGAN_TAJUK',
  background: { color: H.off },
  objects: [{ image: { path: A('pattern_corner.png'), x: 0, y: 0, w: 10.8, h: 13.5 } }, goldBar, ...logos(), ...footer(H.mute, H.goldD), eyebrowPh, titlePh],
  slideNumber: slideNum(H.navy),
});

pres.defineSlideMaster({
  title: 'KANDUNGAN_BEBAS',
  background: { color: H.off },
  objects: [{ image: { path: A('pattern_corner.png'), x: 0, y: 0, w: 10.8, h: 13.5 } }, goldBar, ...logos(), ...footer(H.mute, H.goldD), eyebrowPh],
  slideNumber: slideNum(H.navy),
});

pres.defineSlideMaster({
  title: 'PENUTUP',
  background: { color: H.off },
  objects: [
    { image: { path: A('pattern_corner.png'), x: 0, y: 0, w: 10.8, h: 13.5 } },
    { rect: { x: 0, y: X(1020), w: 10.8, h: X(330), fill: { color: H.navy } } },
    { image: { path: A('pattern_band.png'), x: 0, y: X(1020), w: 10.8, h: X(330) } },
    { image: { path: A('mosque_small.png'), x: X(842), y: X(1108), w: X(190), h: X(150) } },
    goldBar, ...logos(), ...footer(TINT.footDark, H.gold), eyebrowPh, titlePh,
  ],
  slideNumber: slideNum('FFFFFF'),
});

// ---------- helpers ----------
const T = (slide, text, o) => slide.addText(text, { isTextBox: true, fontFace: FONT, margin: 0, valign: 'top', ...o });
const rule = (slide, fromPx) => slide.addShape(pres.shapes.LINE, { x: X(fromPx), y: X(78), w: X(744 - fromPx), h: 0, line: { color: H.navy, width: 1.5 }, objectName: 'Garis pengepala' });
const eyebrow = (slide, a, b) => slide.addText([{ text: a + '  ', options: { color: C.text2 } }, { text: b, options: { color: C.accent3 } }], { placeholder: 'eyebrow' });
const rect = (slide, x, y, w, h, color, name, extra = {}) => slide.addShape(pres.shapes.RECTANGLE, { x: X(x), y: X(y), w: X(w), h: X(h), fill: { color }, line: { type: 'none' }, objectName: name, ...extra });
const caption = (slide, y, tag, text, opts = {}) => {
  const tagW = opts.tagW || 118;
  rect(slide, 64 + (opts.dx || 0), y, tagW, 32, opts.tagFill || C.accent3, 'Label ' + tag);
  T(slide, tag, { x: X(64 + (opts.dx || 0)), y: X(y), w: X(tagW), h: X(32), fontSize: F(15), bold: true, color: opts.tagColor || C.background1, align: 'center', valign: 'middle', charSpacing: 1.5, objectName: 'Label ' + tag });
  T(slide, text, { x: X(64 + (opts.dx || 0) + tagW + 16), y: X(y - 4), w: X(952 - tagW - 16 - 2 * (opts.dx || 0)), h: X(opts.h || 40), fontSize: F(22), bold: true, color: opts.color || C.text2, valign: 'middle', objectName: 'Kapsyen ' + tag });
};
const bd = (c = H.line, pt = 0.75) => ({ type: 'solid', pt, color: c });
const NONE = { type: 'none' };
const thCell = (text, align = 'left') => ({ text, options: { fill: { color: H.navy }, color: 'FFFFFF', bold: true, fontSize: F(16.5), charSpacing: 1.2, align, valign: 'middle', border: [NONE, NONE, NONE, NONE] } });
const cell = (text, o = {}) => ({ text, options: { valign: 'middle', border: [NONE, NONE, bd(), NONE], ...o } });

// Standard 4-col donation table (Bil, Nama, Daerah, Jumlah)
function donationTable(slide, y, nameHdr, rows, total, rowH) {
  const data = [[thCell('BIL.', 'center'), thCell(nameHdr.toUpperCase()), thCell('DAERAH'), thCell('JUMLAH (RM)', 'right')]];
  rows.forEach(([n, nm, d, amt], i) => {
    const fill = { color: i % 2 ? TINT.zebra : 'FFFFFF' };
    data.push([
      cell(String(n), { fill, align: 'center', color: H.mute, bold: true }),
      cell(nm, { fill, bold: true, color: H.navy }),
      cell(d, { fill, color: H.ink }),
      cell(amt, { fill, bold: true, color: H.navy, align: 'right' }),
    ]);
  });
  const tf = { color: H.goldT };
  const tb = [bd(H.gold, 1.5), NONE, NONE, NONE];
  data.push([
    { text: '', options: { fill: tf, border: tb } },
    { text: 'JUMLAH', options: { fill: tf, border: tb, bold: true, color: H.navy, fontSize: F(22), charSpacing: 1, colspan: 2, valign: 'middle' } },
    { text: total, options: { fill: tf, border: tb, bold: true, color: H.navy, fontSize: F(27), align: 'right', valign: 'middle' } },
  ]);
  slide.addTable(data, { x: X(64), y: X(y), w: X(952), colW: [X(66), X(546), X(170), X(170)], rowH: rowH.map(X), fontFace: FONT, fontSize: F(22), color: H.ink, margin: [4, 10, 4, 10], objectName: 'Jadual ' + nameHdr });
}

// ================= SLIDE 1 — COVER =================
pres.addSection({ title: 'Isu Utama' });
{
  const s = pres.addSlide({ masterName: 'COVER_DARK', sectionTitle: 'Isu Utama' });
  s.addText([
    { text: 'KOMITMEN KARIAH', options: { breakLine: true } },
    { text: '10%', options: { color: C.accent2 } },
    { text: ' DAN ' },
    { text: '20%', options: { color: C.accent2 } },
  ], { placeholder: 'title' });
  // eyebrow with side rules
  T(s, 'SOALAN LISAN A203  ·  DUN MAHARANI', { x: X(240), y: X(186), w: X(600), h: X(36), fontSize: F(20), bold: true, color: C.accent2, align: 'center', valign: 'middle', charSpacing: 4, objectName: 'Label soalan' });
  s.addShape(pres.shapes.LINE, { x: X(186), y: X(204), w: X(46), h: 0, line: { color: H.gold, width: 1.5 } });
  s.addShape(pres.shapes.LINE, { x: X(848), y: X(204), w: X(46), h: 0, line: { color: H.gold, width: 1.5 } });
  T(s, 'Apa yang perlu kita fahami?', { x: X(64), y: X(386), w: X(952), h: X(48), fontSize: F(30), bold: true, color: TINT.pale, align: 'center', valign: 'middle', objectName: 'Subtajuk' });
  const big = (x, n, lbl, sub) => {
    s.addText([{ text: n, options: { fontSize: F(184) } }, { text: '%', options: { fontSize: F(92), superscript: true } }], { isTextBox: true, x: X(x), y: X(462), w: X(460), h: X(180), fontFace: FONT, bold: true, color: C.accent2, align: 'center', valign: 'middle', margin: 0, objectName: 'Angka ' + n + '%' });
    T(s, lbl, { x: X(x), y: X(652), w: X(460), h: X(38), fontSize: F(25), bold: true, color: C.background1, align: 'center', valign: 'middle', objectName: 'Label ' + n + '%' });
    T(s, sub, { x: X(x + 20), y: X(694), w: X(420), h: X(64), fontSize: F(21), color: TINT.onNavy, align: 'center', objectName: 'Keterangan ' + n + '%' });
  };
  big(72, '10', 'PEMBINAAN BAHARU', 'Komitmen kariah berdasarkan ketetapan garis panduan dan lokaliti');
  big(548, '20', 'NAIK TARAF / BAIK PULIH', 'Di Semenanjung Malaysia bagi kos melebihi RM100,000');
  s.addShape(pres.shapes.LINE, { x: X(540), y: X(490), w: 0, h: X(260), line: { color: H.gold, width: 1, transparency: 40 } });
  rect(s, 72, 800, 936, 156, 'FFFFFF', 'Kotak penjelasan', { fill: { color: 'FFFFFF', transparency: 94 } });
  rect(s, 72, 800, 5, 156, C.accent2, 'Penanda penjelasan');
  s.addText([
    { text: 'Komitmen kewangan kariah ini ' },
    { text: 'bukan caj yang dikenakan oleh Kerajaan Negeri', options: { bold: true, color: C.accent2 } },
    { text: ', sebaliknya sebahagian daripada tanggungjawab pembiayaan berdasarkan garis panduan Kerajaan Persekutuan.' },
  ], { isTextBox: true, x: X(106), y: X(800), w: X(880), h: X(156), fontFace: FONT, fontSize: F(24), color: 'E8EDF5', valign: 'middle', margin: 0, lineSpacingMultiple: 1.1, objectName: 'Penjelasan bukan caj' });
  s.addNotes('Isu: komitmen kewangan kariah 10% (bina baharu) dan 20% (naik taraf/baik pulih). Ia bukan caj Kerajaan Negeri tetapi ditetapkan Garis Panduan Kerajaan Persekutuan Bil. 1/2024.');
}

// ================= SLIDE 2 — GARIS PANDUAN =================
pres.addSection({ title: 'Garis Panduan' });
{
  const s = pres.addSlide({ masterName: 'KANDUNGAN_TAJUK', sectionTitle: 'Garis Panduan' });
  eyebrow(s, 'GARIS PANDUAN', 'Bil. 1/2024'); rule(s, 456);
  s.addText([{ text: 'BERDASARKAN GARIS PANDUAN', options: { breakLine: true } }, { text: 'KERAJAAN PERSEKUTUAN', options: { color: C.accent3 } }], { placeholder: 'title' });
  const facts = [
    [64, 286, 'Bil. 1/2024', 'Garis Panduan Permohonan Peruntukan Kerajaan Persekutuan', false],
    [364, 286, '1 Jan 2024', 'Dikeluarkan oleh Jabatan Perdana Menteri', false],
    [664, 352, '30%', 'Komitmen Kerajaan Negeri sebelum permohonan dikemukakan kepada Pejabat YAB Perdana Menteri', true],
  ];
  for (const [x, w, h, p, k] of facts) {
    rect(s, x, 272, w, 152, 'FFFFFF', 'Kad ' + h);
    rect(s, x, 272, w, 4, k ? C.accent2 : C.text2, 'Garis kad ' + h);
    T(s, h, { x: X(x + 18), y: X(290), w: X(w - 36), h: X(k ? 42 : 34), fontSize: F(k ? 34 : 25), bold: true, color: k ? C.accent3 : C.text2, valign: 'middle', objectName: 'Fakta ' + h });
    T(s, p, { x: X(x + 18), y: X(k ? 338 : 330), w: X(w - 36), h: X(80), fontSize: F(17.5), color: C.accent5, objectName: 'Keterangan ' + h });
  }
  caption(s, 450, 'BINA BAHARU', 'Nisbah komitmen kewangan mengikut lokaliti', { tagW: 160 });
  const groups = [
    ['Selangor / Pulau Pinang / Johor', true, [['Bandar', '50%', '30%', '20%'], ['Pinggir Bandar', '60%', '30%', '10%'], ['Luar Bandar', '65%', '30%', '5%']]],
    ['Negeri Sembilan / Melaka / Pahang / Perak', false, [['Bandar', '70%', '20%', '10%'], ['Pinggir Bandar', '70%', '20%', '10%'], ['Luar Bandar', '75%', '20%', '5%']]],
    ['Kedah / Perlis / Kelantan / Terengganu', false, [['Bandar', '75%', '15%', '10%'], ['Pinggir Bandar', '80%', '15%', '5%'], ['Luar Bandar', '80%', '15%', '5%']]],
    ['Sabah / Sarawak', false, [['Bandar', '80%', '15%', '5%'], ['Pinggir Bandar', '85%', '15%', '-'], ['Luar Bandar', '85%', '15%', '-']]],
    ['Wilayah Persekutuan', false, [['Kuala Lumpur & Putrajaya', '80%', '-', '20%'], ['Labuan', '100%', '-', '-']]],
  ];
  const data = [[thCell('NEGERI'), thCell('LOKALITI'), thCell('PERSEKUTUAN', 'center'), thCell('NEGERI', 'center'), thCell('KARIAH', 'center')]];
  const rowH = [50];
  groups.forEach(([g, jh, rows], gi) => {
    const fill = { color: jh ? H.goldT : gi % 2 ? TINT.zebra : 'FFFFFF' };
    rows.forEach((r, ri) => {
      const line = [];
      if (ri === 0) {
        const txt = jh
          ? [{ text: 'Selangor / Pulau Pinang /', options: { breakLine: true } }, { text: 'JOHOR', options: { fontSize: F(24), color: H.navy } }]
          : g;
        line.push({ text: txt, options: { rowspan: rows.length, fill: { color: jh ? H.gold : 'FFFFFF' }, bold: true, color: H.navy, fontSize: F(19), valign: 'middle', border: [NONE, bd(), bd(), NONE] } });
      }
      const pc = (v, k) => cell(v === '-' ? '–' : v, { fill, align: 'center', bold: v !== '-', color: v === '-' ? TINT.dash : k && jh ? H.goldD : H.navy });
      line.push(cell(r[0], { fill, color: H.ink }), pc(r[1]), pc(r[2]), pc(r[3], true));
      data.push(line);
      rowH.push(r[0].length > 16 ? 60 : 46);
    });
  });
  s.addTable(data, { x: X(64), y: X(494), w: X(952), colW: [X(262), X(244), X(174), X(130), X(142)], rowH: rowH.map(X), fontFace: FONT, fontSize: F(22), color: H.ink, margin: [3, 10, 3, 12], objectName: 'Jadual nisbah bina baharu' });
  T(s, 'Baris emas: kumpulan negeri yang merangkumi Johor. Sumber: Garis Panduan Bil. 1/2024, Jabatan Perdana Menteri.', { x: X(64), y: X(1228), w: X(952), h: X(30), fontSize: F(16), color: C.accent5, valign: 'middle', objectName: 'Nota sumber' });
  s.addNotes('Garis Panduan Bil. 1/2024 (JPM, 1 Januari 2024), selaras keputusan Mesyuarat Perdana Menteri bersama Menteri Besar dan Ketua Menteri ke-139 pada 28 Jun 2022. Kerajaan Negeri perlu sediakan komitmen 30% sebelum permohonan dikemukakan.');
}

// ================= SLIDE 3 — NAIK TARAF / BAIK PULIH =================
{
  const s = pres.addSlide({ masterName: 'KANDUNGAN_TAJUK', sectionTitle: 'Garis Panduan' });
  eyebrow(s, 'NISBAH PEMBIAYAAN', 'Naik Taraf'); rule(s, 520);
  s.addText([{ text: 'BAGAIMANA NISBAH PEMBIAYAAN', options: { breakLine: true } }, { text: 'NAIK TARAF DAN BAIK PULIH?', options: { color: C.accent3 } }], { placeholder: 'title' });
  s.addText([{ text: 'Kadar komitmen ditentukan oleh ' }, { text: 'wilayah', options: { bold: true, color: C.text2 } }, { text: ' dan ' }, { text: 'jumlah kos projek', options: { bold: true, color: C.text2 } }, { text: '.' }],
    { isTextBox: true, x: X(64), y: X(264), w: X(952), h: X(40), fontFace: FONT, fontSize: F(24), color: C.accent5, margin: 0, valign: 'middle', objectName: 'Pengenalan' });
  const rows = [
    ['Semenanjung', '≤ RM100,000', '100%', '-', 1, 0],
    ['Sabah, Sarawak dan W.P. Labuan', '≤ RM100,000', '100%', '-', 1, 0],
    ['Semenanjung', '> RM100,000', '80%', '20%', 0.8, 0.2],
    ['Sabah, Sarawak dan W.P. Labuan', '> RM200,000', '90%', '10%', 0.9, 0.1],
  ];
  const data = [[thCell('NEGERI'), thCell('KOS'), thCell('KERAJAAN PERSEKUTUAN', 'center'), thCell('KARIAH', 'center')]];
  const hdrH = 78, rowPx = 116, y0 = 340, colW = [372, 230, 190, 160];
  rows.forEach(([ng, kos, fed, kar], i) => {
    const hi = i >= 2;
    const sep = i === 2 ? [bd(H.navy, 2), NONE, bd(), NONE] : [NONE, NONE, bd(), NONE];
    data.push([
      cell(ng, { bold: true, color: H.navy, fontSize: F(22), border: sep, fill: { color: 'FFFFFF' } }),
      cell(kos, { bold: true, color: hi ? TINT.brown : H.royal, fontSize: F(22), fill: { color: hi ? H.goldT : TINT.blueT }, valign: 'top', margin: [16, 12, 0, 14], border: sep }),
      cell(fed, { bold: true, color: H.navy, fontSize: F(44), align: 'center', border: sep, fill: { color: 'FFFFFF' } }),
      cell(kar === '-' ? '–' : kar, { bold: true, color: kar === '-' ? TINT.dash : H.goldD, fontSize: F(44), align: 'center', border: sep, fill: { color: 'FFFFFF' } }),
    ]);
  });
  s.addTable(data, { x: X(64), y: X(y0), w: X(952), colW: colW.map(X), rowH: [hdrH, rowPx, rowPx, rowPx, rowPx].map(X), fontFace: FONT, fontSize: F(22), color: H.ink, margin: [4, 12, 4, 14], objectName: 'Jadual nisbah naik taraf' });
  // stacked split bar inside each KOS cell
  rows.forEach((r, i) => {
    const bx = 64 + colW[0] + 14, bw = colW[1] - 28, by = y0 + hdrH + i * rowPx + 78;
    rect(s, bx, by, bw * r[4], 12, C.accent1, 'Bar Persekutuan ' + (i + 1));
    if (r[5]) rect(s, bx + bw * r[4], by, bw * r[5], 12, C.accent2, 'Bar Kariah ' + (i + 1));
  });
  const ly = y0 + hdrH + 4 * rowPx + 20;
  rect(s, 64, ly + 6, 18, 18, C.accent1, 'Petunjuk Persekutuan');
  T(s, 'Kerajaan Persekutuan', { x: X(90), y: X(ly), w: X(240), h: X(30), fontSize: F(19), color: C.accent5, valign: 'middle' });
  rect(s, 320, ly + 6, 18, 18, C.accent2, 'Petunjuk Kariah');
  T(s, 'Kariah', { x: X(346), y: X(ly), w: X(120), h: X(30), fontSize: F(19), color: C.accent5, valign: 'middle' });
  T(s, 'Sumber: Garis Panduan Bil. 1/2024', { x: X(616), y: X(ly), w: X(400), h: X(30), fontSize: F(19), color: C.accent5, align: 'right', valign: 'middle', objectName: 'Sumber' });
  const ny = ly + 72;
  rect(s, 64, ny, 952, 170, C.text2, 'Kotak inisiatif negeri');
  s.addImage({ path: A('ic_shield.png'), x: X(100), y: X(ny + 53), w: X(64), h: X(64), altText: 'Ikon perisai', objectName: 'Ikon perisai' });
  s.addText([{ text: 'Kerajaan Negeri Johor turut mengambil inisiatif ' }, { text: 'membantu meringankan beban kewangan pihak kariah', options: { bold: true, color: C.accent2 } }, { text: ' melalui dana dan penyelarasan peruntukan.' }],
    { isTextBox: true, x: X(190), y: X(ny), w: X(790), h: X(170), fontFace: FONT, fontSize: F(24), color: C.background1, margin: 0, valign: 'middle', lineSpacingMultiple: 1.1, objectName: 'Nota inisiatif' });
  s.addNotes('Kos <= RM100,000 dibiayai penuh Kerajaan Persekutuan. Semenanjung > RM100,000: 80% Persekutuan, 20% kariah. Sabah, Sarawak dan W.P. Labuan > RM200,000: 90% / 10%.');
}

// ================= SLIDE 4 — TPMJ 1/2 =================
pres.addSection({ title: 'Sumbangan TPMJ' });
{
  const s = pres.addSlide({ masterName: 'KANDUNGAN_BEBAS', sectionTitle: 'Sumbangan TPMJ' });
  eyebrow(s, 'SUMBANGAN TPMJ', '2025 & 2026 · 1/2'); rule(s, 590);
  T(s, 'RM6.3', { x: X(64), y: X(146), w: X(310), h: X(96), fontSize: F(92), bold: true, color: C.text2, valign: 'middle', objectName: 'RM6.3 juta' });
  T(s, 'JUTA', { x: X(64), y: X(240), w: X(300), h: X(52), fontSize: F(40), bold: true, color: C.accent3, valign: 'middle', objectName: 'Unit juta' });
  rect(s, 384, 142, 4, 172, C.accent2, 'Pemisah tajuk');
  T(s, 'DIPERUNTUKKAN BAGI PEMBANGUNAN MASJID DAN SURAU', { x: X(410), y: X(140), w: X(606), h: X(112), fontSize: F(31), bold: true, color: C.text2, valign: 'top', objectName: 'Tajuk slaid' });
  T(s, 'Tabung Pembangunan Masjid dan Amal Jariah Johor (TPMJ) bagi tahun 2025 dan 2026', { x: X(410), y: X(256), w: X(606), h: X(60), fontSize: F(20), color: C.accent5, objectName: 'Subtajuk' });
  caption(s, 344, 'JADUAL 1', 'Sumbangan Pembinaan Surau Kritikal Negeri Johor');
  donationTable(s, 388, 'Nama Surau', [
    [1, 'Surau Al-Amir, Lorong Haji Amir, Simpang Renggam', 'Kluang', '259,800'],
    [2, 'Surau Kg. Jelutong Darat', 'Pontian', '240,000'],
    [3, 'Surau Parit Tegong', 'Pontian', '240,000'],
  ], '739,800', [50, 74, 48, 48, 56]);
  caption(s, 692, 'JADUAL 2', 'Sumbangan Pembinaan Semula dan Pembinaan Baharu Masjid Negeri Johor Tahun 2025', { h: 60 });
  donationTable(s, 766, 'Nama Masjid', [
    [1, 'Masjid An-Nur, Ladang Seri Gading', 'Batu Pahat', '1,000,000'],
    [2, 'Masjid Taman Sri Penawar, Bandar Penawar', 'Kota Tinggi', '1,000,000'],
    [3, 'Masjid Parit Haji Arif, Benut', 'Pontian', '500,000'],
    [4, 'Masjid Kg. Contoh, Kahang', 'Kluang', '400,000'],
    [5, 'Masjid Kg. Melayu, Chamek, Kahang', 'Kluang', '200,000'],
    [6, 'Masjid Al-Ehsan, Taman Wawasan, Kelapa Sawit', 'Kulai', '500,000'],
  ], '3,600,000', [50, 48, 48, 48, 48, 48, 48, 56]);
  s.addNotes('TPMJ memperuntukkan RM6.3 juta bagi komitmen pembinaan baharu masjid dan surau 2025-2026. Jadual 1: 3 surau kritikal (RM739,800). Jadual 2: 6 masjid tahun 2025 (RM3,600,000).');
}

// ================= SLIDE 5 — TPMJ 2/2 =================
{
  const s = pres.addSlide({ masterName: 'KANDUNGAN_TAJUK', sectionTitle: 'Sumbangan TPMJ' });
  eyebrow(s, 'SUMBANGAN TPMJ', '2025 & 2026 · 2/2'); rule(s, 590);
  s.addText([{ text: '16 ', options: { fontSize: 46, color: C.accent3 } }, { text: 'PROJEK PEMBANGUNAN MASJID DAN SURAU MENERIMA SUMBANGAN' }], { placeholder: 'title' });
  caption(s, 290, 'JADUAL 3', 'Sumbangan Pembinaan Semula dan Pembinaan Baharu Masjid Negeri Johor Tahun 2025', { h: 60 });
  donationTable(s, 362, 'Nama Masjid / Surau', [
    [1, 'Masjid Al-Faizun, Taman Kempas', 'Johor Bahru', '410,000'],
    [2, 'Masjid Bandar Bestari Perdana, Pasir Gudang', 'Johor Bahru', '315,000'],
    [3, 'Masjid Nurul Huda, Parit Lapis Dalam, Senggarang', 'Batu Pahat', '375,000'],
    [4, 'Surau Parit Lapis Laman, Mk. 4, Pt. Sulong', 'Batu Pahat', '50,000'],
    [5, 'Masjid Bandar Seri Impian', 'Kluang', '500,000'],
    [6, 'Surau Tengah, Kg. Melayu Raya, Pekan Nanas', 'Pontian', '50,000'],
    [7, 'Masjid Kg. Batu 4', 'Kota Tinggi', '300,000'],
  ], '2,000,000', [50, 48, 48, 74, 48, 48, 48, 48, 56]);
  // summary block (navy)
  const sy = 850;
  rect(s, 64, sy, 952, 356, C.text2, 'Latar rumusan');
  caption(s, sy + 24, 'JADUAL 4', 'Rumusan Keseluruhan Sumbangan', { dx: 26, tagFill: C.accent2, tagColor: C.text2, color: C.background1 });
  const gh = (t, a = 'left') => ({ text: t, options: { color: H.gold, bold: true, fontSize: F(15.5), charSpacing: 1.2, align: a, valign: 'bottom', fill: { color: H.navy }, border: [NONE, NONE, bd(H.gold, 1), NONE] } });
  const sc = (t, o = {}) => ({ text: t, options: { color: 'FFFFFF', fill: { color: H.navy }, valign: 'middle', border: [NONE, NONE, bd('33496A', 0.75), NONE], ...o } });
  const sumData = [
    [gh('BIL.', 'center'), gh('KATEGORI'), gh('BILANGAN', 'center'), gh('PERUNTUKAN (RM)', 'right')],
    [sc('1', { align: 'center', color: '9FB0C9' }), sc('Surau Kritikal'), sc('3', { align: 'center', bold: true }), sc('739,800', { align: 'right', bold: true })],
    [sc('2', { align: 'center', color: '9FB0C9' }), sc('Pembinaan Masjid 2025'), sc('6', { align: 'center', bold: true }), sc('3,600,000', { align: 'right', bold: true })],
    [sc('3', { align: 'center', color: '9FB0C9' }), sc('Pembinaan Masjid/Surau'), sc('7', { align: 'center', bold: true }), sc('2,000,000', { align: 'right', bold: true })],
    ...[[
      { text: '', options: { fill: { color: H.gold }, border: [NONE, NONE, NONE, NONE] } },
      { text: 'JUMLAH', options: { fill: { color: H.gold }, color: H.navy, bold: true, fontSize: F(24), valign: 'middle', border: [NONE, NONE, NONE, NONE] } },
      { text: '16', options: { fill: { color: H.gold }, color: H.navy, bold: true, fontSize: F(32), align: 'center', valign: 'middle', border: [NONE, NONE, NONE, NONE] } },
      { text: '6,339,800', options: { fill: { color: H.gold }, color: H.navy, bold: true, fontSize: F(32), align: 'right', valign: 'middle', border: [NONE, NONE, NONE, NONE] } },
    ]],
  ];
  s.addTable(sumData, { x: X(90), y: X(sy + 76), w: X(900), colW: [X(66), X(454), X(160), X(220)], rowH: [40, 50, 50, 50, 66].map(X), fontFace: FONT, fontSize: F(22), margin: [3, 10, 3, 10], objectName: 'Jadual rumusan' });
  s.addNotes('Jadual 3: 7 projek masjid/surau (RM2,000,000). Rumusan: 16 projek, RM6,339,800. Nota: jumlah Surau Kritikal RM739,800 berdasarkan pecahan terperinci (dokumen asal mencatat RM739,000 dalam rumusan).');
}

// ================= SLIDE 6 — PENCAPAIAN =================
pres.addSection({ title: 'Pencapaian & Inisiatif' });
{
  const s = pres.addSlide({ masterName: 'KANDUNGAN_BEBAS', sectionTitle: 'Pencapaian & Inisiatif' });
  eyebrow(s, 'PENCAPAIAN', 'Peruntukan'); rule(s, 420);
  s.addText([{ text: 'RM145.9', options: { fontSize: F(112), color: C.text2 } }, { text: ' JUTA', options: { fontSize: F(54), color: C.accent3 } }],
    { isTextBox: true, x: X(64), y: X(136), w: X(720), h: X(112), fontFace: FONT, bold: true, margin: 0, valign: 'bottom', objectName: 'RM145.9 juta' });
  rect(s, 803, 196, 213, 40, C.text2, 'Label tempoh');
  T(s, '2022 – NOV 2026', { x: X(803), y: X(196), w: X(213), h: X(40), fontSize: F(17), bold: true, color: C.background1, align: 'center', valign: 'middle', charSpacing: 1.5, objectName: 'Tempoh' });
  T(s, 'UNTUK PEMBANGUNAN MASJID DAN SURAU DI JOHOR', { x: X(64), y: X(258), w: X(952), h: X(42), fontSize: F(30), bold: true, color: C.text2, valign: 'middle', objectName: 'Tajuk slaid' });
  s.addShape(pres.shapes.LINE, { x: X(64), y: X(318), w: X(952), h: 0, line: { color: H.line, width: 0.75 } });
  s.addShape(pres.shapes.LINE, { x: X(64), y: X(424), w: X(952), h: 0, line: { color: H.line, width: 0.75 } });
  s.addImage({ path: A('ic_mosque.png'), x: X(64), y: X(343), w: X(56), h: X(56), altText: 'Ikon masjid', objectName: 'Ikon masjid' });
  T(s, '2,019', { x: X(136), y: X(334), w: X(190), h: X(74), fontSize: F(68), bold: true, color: C.accent3, valign: 'middle', objectName: '2,019 projek' });
  s.addText([{ text: 'projek atau sumbangan', options: { bold: true, color: C.text2, breakLine: true } }, { text: 'baik pulih, naik taraf, bina baharu & bina semula' }],
    { isTextBox: true, x: X(336), y: X(334), w: X(680), h: X(74), fontFace: FONT, fontSize: F(22), color: C.text1, margin: 0, valign: 'middle', objectName: 'Label 2,019' });
  T(s, 'TIGA SUMBER PERUNTUKAN TERBESAR', { x: X(64), y: X(448), w: X(700), h: X(28), fontSize: F(16), bold: true, color: C.accent3, charSpacing: 3, valign: 'middle', objectName: 'Label carta' });
  s.addChart(pres.charts.BAR, [{
    name: 'Peruntukan (RM juta)',
    labels: ['ICU JPM\n1,031 projek', 'TPMJ\n328 projek', 'Pejabat YAB MB Johor\n471 sumbangan'],
    values: [79.3, 20.8, 12.7],
  }], {
    x: X(54), y: X(484), w: X(962), h: X(400), barDir: 'bar', catAxisOrientation: 'maxMin',
    chartColors: [H.royal], barGapWidthPct: 45,
    showValue: true, dataLabelPosition: 'outEnd', dataLabelFormatCode: '"RM"0.0"j"', dataLabelColor: H.navy, dataLabelFontSize: F(26), dataLabelFontBold: true, dataLabelFontFace: '+mn-lt',
    catAxisLabelColor: H.navy, catAxisLabelFontSize: F(20), catAxisLabelFontFace: '+mn-lt', catAxisLineShow: false,
    valAxisHidden: true, valAxisMinVal: 0, valAxisMaxVal: 104, valGridLine: { style: 'none' }, catGridLine: { style: 'none' },
    showLegend: false, showTitle: false, objectName: 'Carta tiga sumber peruntukan',
  });
  T(s, 'ICU JPM: Pejabat Pembangunan Negeri Johor · TPMJ: Tabung Pembangunan Masjid dan Amal Jariah Johor. Selebihnya dibiayai pelbagai agensi peringkat Persekutuan dan Negeri.',
    { x: X(64), y: X(898), w: X(952), h: X(56), fontSize: F(18), color: C.accent5, objectName: 'Nota carta' });
  // DUN Maharani panel
  const py = 1010;
  rect(s, 64, py, 952, 246, C.text2, 'Panel DUN Maharani');
  s.addText([{ text: 'DUN N15 ', options: { color: C.background1 } }, { text: 'MAHARANI', options: { color: C.accent2 } }],
    { isTextBox: true, x: X(96), y: X(py + 24), w: X(500), h: X(36), fontFace: FONT, fontSize: F(24), bold: true, charSpacing: 1.5, margin: 0, valign: 'middle', objectName: 'DUN Maharani' });
  T(s, '2024 – 2026', { x: X(780), y: X(py + 24), w: X(204), h: X(36), fontSize: F(16), bold: true, color: C.accent2, align: 'right', charSpacing: 2, valign: 'middle', objectName: 'Tempoh DUN' });
  s.addShape(pres.shapes.LINE, { x: X(96), y: X(py + 72), w: X(888), h: 0, line: { color: H.gold, width: 0.75, transparency: 40 } });
  const cols = [[96, 340, 'RM1,867,110', 'jumlah peruntukan baik pulih, naik taraf & sumbangan', true], [462, 170, '14', 'buah masjid dan surau', false], [662, 322, 'RM741,400', 'ICU JPM, penyumbang terbesar, kira-kira 39.7%', false]];
  for (const [x, w, v, l, g] of cols) {
    T(s, v, { x: X(x), y: X(py + 92), w: X(w), h: X(54), fontSize: F(40), bold: true, color: g ? C.accent2 : C.background1, valign: 'middle', objectName: 'Nilai ' + v });
    T(s, l, { x: X(x), y: X(py + 150), w: X(w), h: X(56), fontSize: F(18), color: TINT.onNavy, objectName: 'Label ' + v });
  }
  rect(s, 662, py + 212, 322, 10, '2A3E5E', 'Meter latar');
  rect(s, 662, py + 212, 322 * 0.397, 10, C.accent2, 'Meter 39.7%');
  s.addNotes('2022 hingga November 2026: RM145.9 juta untuk 2,019 projek/sumbangan. ICU JPM RM79.3 juta (1,031 projek), TPMJ RM20.8 juta (328), Pejabat YAB MB RM12.7 juta (471 sumbangan). DUN N15 Maharani 2024-2026: RM1,867,110 untuk 14 masjid dan surau; ICU JPM RM741,400 (~39.7%).');
}

// ================= SLIDE 7 — INISIATIF & PENUTUP =================
{
  const s = pres.addSlide({ masterName: 'PENUTUP', sectionTitle: 'Pencapaian & Inisiatif' });
  eyebrow(s, 'INISIATIF', 'Kerajaan Negeri'); rule(s, 430);
  s.addText([{ text: 'USAHA BERTERUSAN MEMPERKASA', options: { breakLine: true } }, { text: 'PEMBANGUNAN MASJID DAN SURAU', options: { color: C.accent3 } }], { placeholder: 'title' });
  const cards = [
    { y: 292, h: 176, no: '01', icon: 'ic_fund.png', t: 'Penyediaan Dana Melalui TPMJ', k: false,
      body: [{ text: 'RM6.3 juta', options: { bold: true, color: C.text2 } }, { text: ' diperuntukkan bagi menampung komitmen pembinaan baharu masjid dan surau bagi tahun 2025 dan 2026.' }] },
    { y: 492, h: 222, no: '02', icon: 'ic_network.png', t: 'Penyelarasan Peruntukan Agensi Kerajaan Negeri', k: false, tags: ['MAINJ', 'PEJABAT YAB MB JOHOR', 'JAINJ', 'TPMJ'],
      body: [{ text: 'Permohonan dinilai berdasarkan keperluan dan keutamaan bagi mengelakkan pertindihan pembiayaan.' }] },
    { y: 738, h: 210, no: '03', icon: 'ic_people.png', t: 'Pengurusan Kutipan Khairat & Sumbangan Orang Ramai', k: true },
  ];
  for (const c of cards) {
    rect(s, 64, c.y, 952, c.h, 'FFFFFF', 'Kad inisiatif ' + c.no);
    rect(s, 64, c.y, 6, c.h, c.k ? C.accent2 : C.text2, 'Penanda kad ' + c.no);
    T(s, c.no, { x: X(86), y: X(c.y + 28), w: X(84), h: X(22), fontSize: F(16), bold: true, color: C.accent3, align: 'center', valign: 'middle', charSpacing: 1.5, objectName: 'Nombor ' + c.no });
    s.addImage({ path: A(c.icon), x: X(96), y: X(c.y + 58), w: X(64), h: X(64), altText: 'Ikon inisiatif ' + c.no, objectName: 'Ikon ' + c.no });
    T(s, c.t, { x: X(198), y: X(c.y + 28), w: X(790), h: X(40), fontSize: F(27), bold: true, color: C.text2, valign: 'top', objectName: 'Tajuk inisiatif ' + c.no });
    let by = c.y + 76;
    if (c.tags) {
      let tx = 198;
      for (const tg of c.tags) {
        const tw = 26 + tg.length * 12.5;
        rect(s, tx, c.y + 78, tw, 36, TINT.chipBlue, 'Tag ' + tg);
        T(s, tg, { x: X(tx), y: X(c.y + 78), w: X(tw), h: X(36), fontSize: F(17), bold: true, color: C.accent1, align: 'center', valign: 'middle', charSpacing: 1 });
        tx += tw + 10;
      }
      by = c.y + 128;
    }
    if (c.body) s.addText(c.body, { isTextBox: true, x: X(198), y: X(by), w: X(790), h: X(c.y + c.h - by - 20), fontFace: FONT, fontSize: F(22), color: C.text1, margin: 0, valign: 'top', lineSpacingMultiple: 1.1, objectName: 'Isi inisiatif ' + c.no });
    if (c.k) {
      T(s, '27', { x: X(198), y: X(c.y + 84), w: X(130), h: X(100), fontSize: F(80), bold: true, color: C.accent3, valign: 'middle', objectName: '27 permohonan' });
      s.addText([{ text: 'permohonan kebenaran kutipan khairat ' }, { text: 'diluluskan', options: { bold: true, color: C.text2 } }, { text: ' bagi tempoh 2025 hingga September 2026' }],
        { isTextBox: true, x: X(340), y: X(c.y + 84), w: X(648), h: X(100), fontFace: FONT, fontSize: F(21), color: C.text1, margin: 0, valign: 'middle', objectName: 'Label 27 permohonan' });
    }
  }
  T(s, '“', { x: X(64), y: X(1036), w: X(80), h: X(70), fontSize: F(90), bold: true, color: C.accent2, valign: 'top', objectName: 'Tanda petik' });
  s.addText([{ text: 'Marilah kita bersama-sama menyumbang ke dalam ' }, { text: 'Tabung Pembangunan Masjid dan Amal Jariah Johor', options: { bold: true, color: C.accent2 } }, { text: ' demi memastikan masjid terus terpelihara sebagai pusat ibadah, ilmu dan pembangunan ummah.' }],
    { isTextBox: true, x: X(64), y: X(1098), w: X(780), h: X(170), fontFace: FONT, fontSize: F(27), color: C.background1, margin: 0, valign: 'top', lineSpacingMultiple: 1.1, objectName: 'Seruan menyumbang' });
  s.addNotes('Tiga inisiatif: (1) dana TPMJ RM6.3 juta 2025-2026; (2) penyelarasan MAINJ, Pejabat YAB MB, JAINJ dan TPMJ; (3) 27 permohonan kutipan khairat diluluskan 2025 hingga September 2026 (Seksyen 106 Enakmen Pentadbiran Agama Islam (Negeri Johor) 2003).');
}

(async () => {
  const out = path.join(__dirname, 'A203_Infografik_Masjid_Surau.pptx');
  await pres.writeFile({ fileName: out });
  await applyTheme(out, THEME);
  console.log('wrote', out);
})();
