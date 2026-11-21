// Builds the 16:9 editable PPTX (8 slides) with picture placeholders.
// Canvas 13.333" x 7.5". Coordinates are written in px of a 1920 x 1080 design:
//   X(px) -> inches (px / 144), F(px) -> points (px * 0.5).
// Usage: PPTX_SKILL=<pptx skill dir> NODE_PATH=<node_modules with pptxgenjs, jszip> node build16.js
const path = require('path');
const fs = require('fs');
const pptxgen = require('pptxgenjs');
const JSZip = require('jszip');
const { applyTheme } = require(process.env.PPTX_SKILL + '/scripts/apply_theme.js');

const A = (f) => path.join(__dirname, 'assets', f);
const X = (px) => +(px / 144).toFixed(4);
const F = (px) => +(px * 0.5).toFixed(1);
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
const H = { navy: '071D3B', royal: '123F70', gold: 'C8A45D', goldD: '94712C', goldT: 'F3E7CB', off: 'F5F3EE', line: 'DCD6C8', mute: '5B6474', ink: '1C2533' };
const REF = { indigo: '20237A', red: 'D71E26', ink: '1A1A2E' }; // colours of the Soal Jawab reference deck
const TINT = { zebra: 'F8F6F1', blueT: 'E4ECF6', brown: '6E5220', onNavy: 'B9C4D6', footDark: '8D9BB3', chipBlue: 'E9EEF5', dash: 'A3A9B3', pale: 'C9D3E3', slot: 'E8E4DA' };

const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE';
pres.theme = { headFontFace: FONT, bodyFontFace: FONT };
pres.title = 'Infografik Jawapan Soalan Lisan A203 – Belanjawan Johor 2027';
pres.subject = 'Komitmen kewangan kariah bagi pembangunan masjid dan surau';
const C = pres.SchemeColor;

// ---------- layout pieces ----------
const logos = [
  { image: { path: A('belanjawan.png'), x: X(1505), y: X(50), w: X(143), h: X(72) } },
  { image: { path: A('jata.png'), x: X(1666), y: X(53), w: X(83), h: X(66) } },
  { image: { path: A('majujohor.png'), x: X(1767), y: X(53), w: X(57), h: X(66) } },
];
const footer = (txt) => [
  { text: { text: 'JAWAPAN SOALAN LISAN A203', options: { x: X(96), y: X(1010), w: X(800), h: X(40), fontFace: FONT, fontSize: F(20), bold: true, color: txt, charSpacing: 2.5, margin: 0, valign: 'middle' } } },
];
const goldBar = { rect: { x: X(96), y: X(62), w: X(8), h: X(48), fill: { color: C.accent2 } } };
const ph = (name, type, x, y, w, h, o = {}) => ({ placeholder: { options: { name, type, x: X(x), y: X(y), w: X(w), h: X(h), fontFace: FONT, margin: 0, ...o }, text: o.prompt || '' } });
const eyebrowPh = ph('eyebrow', 'body', 120, 58, 1340, 56, { fontSize: F(30), bold: true, color: C.text2, charSpacing: 1.5, valign: 'middle', prompt: 'LABEL  Bahagian' });
const titlePh = (o = {}) => ph('title', 'title', o.x || 96, o.y || 140, o.w || 1728, o.h || 140, { fontSize: o.fs || 30, bold: true, color: C.text2, align: 'left', valign: 'top', lineSpacingMultiple: 0.95, prompt: 'Tajuk slaid' });
const fotoPh = (name, x, y, w, h) => ph(name, 'image', x, y, w, h, { fontSize: 12, color: C.accent5, align: 'center', valign: 'middle', prompt: 'Klik ikon untuk masukkan gambar' });
const light = (extra) => ({
  background: { color: H.off },
  objects: [{ image: { path: A('pattern_corner_w.png'), x: 0, y: 0, w: 13.333, h: 7.5 } }, goldBar, ...logos, ...footer(H.mute, H.goldD), eyebrowPh, ...extra],
});

// Photo slots — positions shared by layouts and slides
const SLOT = {
  cover: [1056, 0, 864, 1080],
  s3: [1196, 330, 628, 360],
  side: [96, 520, 620, 448],
  s6: [1136, 140, 688, 400],
  card: [0, 1, 2].map((i) => [96 + i * 587, 296, 554, 320]),
  qr: [1288, 196, 470, 470],
};

// ---------- Soal Jawab reference style: official cover and question slide ----------
const refLogos = (y, h, gap) => {
  const ws = [263 / 132, 158 / 125, 106 / 122].map((r) => Math.round(r * h));
  let x = Math.round((1920 - ws.reduce((a, b) => a + b, 0) - 2 * gap) / 2);
  return ['belanjawan.png', 'jata.png', 'majujohor.png'].map((f, i) => { const o = { image: { path: A(f), x: X(x), y: X(y), w: X(ws[i]), h: X(h) } }; x += ws[i] + gap; return o; });
};
const refBar = (y) => [
  { rect: { x: X(816), y: X(y), w: X(144), h: X(16), fill: { color: REF.red } } },
  { rect: { x: X(960), y: X(y), w: X(144), h: X(16), fill: { color: REF.indigo } } },
];
pres.defineSlideMaster({
  title: 'Kulit Rasmi',
  background: { color: 'FFFFFF' },
  objects: [
    { image: { path: A('bg_dewan.jpg'), x: 0, y: 0, w: 13.333, h: 7.5 } },
    ...refLogos(112, 110, 70), ...refBar(340), ...refBar(810),
    ph('title', 'title', 120, 372, 1680, 420, { fontSize: F(78), bold: true, color: REF.indigo, align: 'center', valign: 'middle', lineSpacingMultiple: 1.0, prompt: 'Tajuk mesyuarat' }),
    ph('nama', 'body', 120, 862, 1680, 56, { fontFace: 'Times New Roman', fontSize: F(42), bold: true, color: REF.ink, align: 'center', valign: 'middle', prompt: 'Nama YB' }),
    ph('jawatan', 'body', 120, 922, 1680, 52, { fontFace: 'Times New Roman', fontSize: F(36), bold: true, color: REF.indigo, align: 'center', valign: 'middle', prompt: 'Jawatan' }),
  ],
});
pres.defineSlideMaster({
  title: 'Soalan Lisan',
  background: { color: 'FFFFFF' },
  objects: [
    { image: { path: A('bg_dewan_lembut.jpg'), x: 0, y: 0, w: 13.333, h: 7.5 } },
    ...refLogos(52, 84, 48),
    { rect: { x: X(150), y: X(200), w: X(12), h: X(670), fill: { color: REF.red } } },
    ph('title', 'title', 206, 196, 1180, 130, { fontSize: F(112), bold: true, color: REF.indigo, charSpacing: 2, align: 'left', valign: 'middle', prompt: 'SOALAN' }),
    ph('nama', 'body', 210, 340, 1180, 62, { fontFace: 'Times New Roman', fontSize: F(50), bold: true, color: REF.ink, valign: 'middle', prompt: 'NAMA YB' }),
    ph('dun', 'body', 210, 430, 1180, 60, { fontFace: 'Times New Roman', fontSize: F(48), bold: true, italic: true, color: REF.ink, valign: 'middle', prompt: '(DUN)' }),
    ph('soalan', 'body', 210, 524, 1520, 350, { fontSize: F(50), bold: true, color: REF.indigo, valign: 'top', lineSpacingMultiple: 1.12, prompt: 'TEKS SOALAN' }),
    fotoPh('foto_potret', 1460, 176, 290, 290),
  ],
});
pres.defineSlideMaster({
  title: 'Isu Utama Gelap',
  background: { color: H.navy },
  objects: [
    { image: { path: A('pattern_cover_w.png'), x: 0, y: 0, w: X(1056), h: 7.5 } },
    { rect: { x: X(96), y: X(72), w: X(341), h: X(88), fill: { color: 'FFFFFF' } } },
    { image: { path: A('belanjawan.png'), x: X(116), y: X(84), w: X(128), h: X(64) } },
    { image: { path: A('jata.png'), x: X(262), y: X(84), w: X(81), h: X(64) } },
    { image: { path: A('majujohor.png'), x: X(361), y: X(84), w: X(56), h: X(64) } },
    ...footer(TINT.footDark, H.gold, 916),
    ph('title', 'title', 96, 236, 900, 224, { fontSize: F(80), bold: true, color: C.background1, align: 'left', valign: 'top', lineSpacingMultiple: 1.0, prompt: 'Tajuk utama' }),
    fotoPh('foto_kulit', ...SLOT.cover),
  ],
});
pres.defineSlideMaster({ title: 'Tajuk Sahaja', ...light([titlePh()]) });
pres.defineSlideMaster({ title: 'Tajuk dan Gambar Kanan', ...light([titlePh(), fotoPh('foto_kanan', ...SLOT.s3)]) });
pres.defineSlideMaster({ title: 'Dua Lajur Gambar Kiri', ...light([titlePh({ x: 96, y: 306, w: 620, h: 130, fs: F(33) }), fotoPh('foto_kiri', ...SLOT.side)]) });
pres.defineSlideMaster({ title: 'Statistik Gambar Kanan', ...light([titlePh({ x: 96, y: 336, w: 1000, h: 54, fs: F(32) }), fotoPh('foto_atas', ...SLOT.s6)]) });
pres.defineSlideMaster({
  title: 'Inisiatif 3 Kad',
  ...light([titlePh(), ...SLOT.card.map(([x, y, w, h], i) => fotoPh('foto_kad_' + (i + 1), x, y, w, h))]),
});
pres.defineSlideMaster({
  title: 'Sumbangan QR',
  background: { color: H.navy },
  objects: [
    { image: { path: A('pattern_cover_w.png'), x: 0, y: 0, w: X(1056), h: 7.5 } },
    { rect: { x: X(96), y: X(72), w: X(341), h: X(88), fill: { color: 'FFFFFF' } } },
    { image: { path: A('belanjawan.png'), x: X(116), y: X(84), w: X(128), h: X(64) } },
    { image: { path: A('jata.png'), x: X(262), y: X(84), w: X(81), h: X(64) } },
    { image: { path: A('majujohor.png'), x: X(361), y: X(84), w: X(56), h: X(64) } },
    { rect: { x: X(1240), y: X(150), w: X(566), h: X(790), fill: { color: 'FFFFFF' } } },
    ...footer(TINT.footDark, H.gold, 1176),
    ph('title', 'title', 96, 234, 1060, 146, { fontSize: F(58), bold: true, color: C.background1, align: 'left', valign: 'top', lineSpacingMultiple: 1.0, prompt: 'Tajuk' }),
    ph('nama_akaun', 'body', 140, 640, 1000, 44, { fontSize: F(32), bold: true, color: C.background1, valign: 'middle', prompt: 'Taip nama akaun' }),
    ph('no_akaun', 'body', 140, 744, 1000, 52, { fontSize: F(44), bold: true, color: C.accent2, valign: 'middle', charSpacing: 2, prompt: 'Taip nombor akaun' }),
    ph('bank', 'body', 140, 856, 1000, 44, { fontSize: F(32), bold: true, color: C.background1, valign: 'middle', prompt: 'Taip nama bank' }),
    fotoPh('foto_qr', ...SLOT.qr),
  ],
});

// ---------- helpers ----------
const T = (slide, text, o) => slide.addText(text, { isTextBox: true, fontFace: FONT, margin: 0, valign: 'top', ...o });
const rule = (slide, fromPx) => slide.addShape(pres.shapes.LINE, { x: X(fromPx), y: X(86), w: X(1480 - fromPx), h: 0, line: { color: H.navy, width: 1.5 }, objectName: 'Garis pengepala' });
const eyebrow = (slide, a, b) => {
  slide.addText([{ text: a + '  ', options: { color: C.text2 } }, { text: b, options: { color: C.accent3 } }], { placeholder: 'eyebrow' });
  rule(slide, Math.round(156 + (a.length + 2 + b.length) * 19.5));
};
const rect = (slide, x, y, w, h, color, name, extra = {}) => slide.addShape(pres.shapes.RECTANGLE, { x: X(x), y: X(y), w: X(w), h: X(h), fill: { color }, line: { type: 'none' }, objectName: name, ...extra });
// Empty picture placeholder over a neutral backdrop (the backdrop shows until a photo is inserted)
const foto = (slide, name, [x, y, w, h], dark = false) => {
  rect(slide, x, y, w, h, dark ? H.royal : TINT.slot, 'Latar ruang gambar', dark ? { fill: { color: H.royal, transparency: 45 } } : {});
  if (dark) slide.addImage({ path: A('mosque_cover.png'), x: X(x), y: X(y + h - 200), w: X(w), h: X(200), altText: 'Siluet masjid', objectName: 'Siluet masjid' });
  else slide.addImage({ path: A('ic_photo.png'), x: X(x + w / 2 - 32), y: X(y + h / 2 - 32), w: X(64), h: X(64), altText: 'Ikon ruang gambar', objectName: 'Ikon ruang gambar' });
  slide.addText('', { placeholder: name });
};
const caption = (slide, x, y, w, tag, text, o = {}) => {
  const tagW = o.tagW || 140;
  rect(slide, x, y, tagW, 38, o.tagFill || C.accent3, 'Label ' + tag);
  T(slide, tag, { x: X(x), y: X(y), w: X(tagW), h: X(38), fontSize: F(19), bold: true, color: o.tagColor || C.background1, align: 'center', valign: 'middle', charSpacing: 1.5, objectName: 'Label ' + tag });
  T(slide, text, { x: X(x + tagW + 18), y: X(y - 2), w: X(w - tagW - 18), h: X(o.h || 42), fontSize: F(27), bold: true, color: o.color || C.text2, valign: o.h ? 'top' : 'middle', objectName: 'Kapsyen ' + tag });
};
const bd = (c = H.line, pt = 0.75) => ({ type: 'solid', pt, color: c });
const NONE = { type: 'none' };
const thCell = (text, align = 'left') => ({ text, options: { fill: { color: H.navy }, color: 'FFFFFF', bold: true, fontSize: F(19), charSpacing: 0.5, align, valign: 'middle', border: [NONE, NONE, NONE, NONE] } });
const cell = (text, o = {}) => ({ text, options: { valign: 'middle', border: [NONE, NONE, bd(), NONE], ...o } });

function donationTable(slide, x, y, w, nameHdr, rows, total, rowH, [dW, aW] = [170, 170], fs = 26) {
  const data = [[thCell('BIL.', 'center'), thCell(nameHdr.toUpperCase()), thCell('DAERAH'), thCell('JUMLAH (RM)', 'right')]];
  rows.forEach(([n, nm, d, amt], i) => {
    const fill = { color: i % 2 ? TINT.zebra : 'FFFFFF' };
    data.push([cell(String(n), { fill, align: 'center', color: H.mute, bold: true }), cell(nm, { fill, bold: true, color: H.navy }), cell(d, { fill, color: H.ink }), cell(amt, { fill, bold: true, color: H.navy, align: 'right' })]);
  });
  const tf = { color: H.goldT }, tb = [bd(H.gold, 1.5), NONE, NONE, NONE];
  data.push([
    { text: '', options: { fill: tf, border: tb } },
    { text: 'JUMLAH', options: { fill: tf, border: tb, bold: true, color: H.navy, fontSize: F(27), charSpacing: 1, colspan: 2, valign: 'middle' } },
    { text: total, options: { fill: tf, border: tb, bold: true, color: H.navy, fontSize: F(28), align: 'right', valign: 'middle' } },
  ]);
  const nameW = w - 80 - dW - aW;
  slide.addTable(data, { x: X(x), y: X(y), w: X(w), colW: [X(80), X(nameW), X(dW), X(aW)], rowH: rowH.map(X), fontFace: FONT, fontSize: F(fs), color: H.ink, margin: [3, 10, 3, 10], objectName: 'Jadual ' + nameHdr });
}

// ================= 1 — KULIT RASMI =================
pres.addSection({ title: 'Pembukaan' });
{
  const s = pres.addSlide({ masterName: 'Kulit Rasmi', sectionTitle: 'Pembukaan' });
  s.addText([{ text: 'MESYUARAT KEDUA', options: { breakLine: true } }, { text: '(BELANJAWAN 2027)', options: { breakLine: true } }, { text: 'BAGI PENGGAL PERSIDANGAN PERTAMA', options: { breakLine: true } }, { text: 'DEWAN NEGERI JOHOR KE-16' }], { placeholder: 'title' });
  s.addText('YB TUAN HAJI MOHD FARED BIN HAJI MOHD KHALID', { placeholder: 'nama' });
  s.addText('PENGERUSI JAWATANKUASA HAL EHWAL AGAMA ISLAM NEGERI JOHOR', { placeholder: 'jawatan' });
  s.addNotes('Mesyuarat Kedua (Belanjawan 2027) bagi Penggal Persidangan Pertama Dewan Negeri Johor Ke-16. Jawapan Soalan Lisan A203 oleh Pengerusi Jawatankuasa Hal Ehwal Agama Islam Negeri Johor.');
}

// ================= 2 — SOALAN =================
{
  const s = pres.addSlide({ masterName: 'Soalan Lisan', sectionTitle: 'Pembukaan' });
  s.addText('SOALAN A203', { placeholder: 'title' });
  s.addText("YB DATO' ASHARI BIN MD. SARIP", { placeholder: 'nama' });
  s.addText('(MAHARANI)', { placeholder: 'dun' });
  s.addText('APAKAH PERNAH DIBINCANGKAN CARA ATAU LANGKAH BAGI MEMUDAHKAN PERUNTUKAN MASJID DAN SURAU DIBERI TANPA DIKENAKAN CAJ SEBANYAK 10% BAGI PEMBINAAN BAHARU DAN 20% BAGI KERJA NAIK TARAF / BAIK PULIH?', { placeholder: 'soalan' });
  s.addShape(pres.shapes.OVAL, { x: X(1432), y: X(148), w: X(346), h: X(346), fill: { color: 'FFFFFF' }, line: { color: REF.indigo, width: 3.5 }, objectName: 'Bingkai bulat potret' });
  s.addImage({ path: A('potret_ashari_bulat.png'), x: X(1450), y: X(166), w: X(310), h: X(310), rounding: true, altText: 'Potret YB Dato\' Ashari bin Md. Sarip', objectName: 'Potret YB Dato Ashari' });
  s.addNotes('Soalan A203 daripada YB Dato\' Ashari bin Md. Sarip (Maharani). Untuk tukar potret: klik kanan gambar > Change Picture.');
}

// ================= 3 — ISU UTAMA =================
pres.addSection({ title: 'Isu Utama' });
{
  const s = pres.addSlide({ masterName: 'Isu Utama Gelap', sectionTitle: 'Isu Utama' });
  foto(s, 'foto_kulit', SLOT.cover, true);
  s.addShape(pres.shapes.LINE, { x: X(1056), y: 0, w: 0, h: 7.5, line: { color: H.gold, width: 2 } });
  s.addShape(pres.shapes.LINE, { x: X(96), y: X(206), w: X(46), h: 0, line: { color: H.gold, width: 1.5 } });
  T(s, 'SOALAN LISAN A203  ·  DUN MAHARANI', { x: X(158), y: X(188), w: X(800), h: X(36), fontSize: F(24), bold: true, color: C.accent2, valign: 'middle', charSpacing: 4, objectName: 'Label soalan' });
  s.addText([{ text: 'KOMITMEN KARIAH', options: { breakLine: true } }, { text: '10%', options: { color: C.accent2 } }, { text: ' DAN ' }, { text: '20%', options: { color: C.accent2 } }], { placeholder: 'title' });
  T(s, 'Apa yang perlu kita fahami?', { x: X(96), y: X(476), w: X(880), h: X(50), fontSize: F(36), bold: true, color: TINT.pale, valign: 'middle', objectName: 'Subtajuk' });
  const big = (x, n, lbl, sub) => {
    s.addText([{ text: n, options: { fontSize: F(128) } }, { text: '%', options: { fontSize: F(64), superscript: true } }], { isTextBox: true, x: X(x), y: X(548), w: X(420), h: X(158), fontFace: FONT, bold: true, color: C.accent2, valign: 'middle', margin: 0, objectName: 'Angka ' + n + '%' });
    T(s, lbl, { x: X(x), y: X(716), w: X(420), h: X(40), fontSize: F(28), bold: true, color: C.background1, valign: 'middle', objectName: 'Label ' + n + '%' });
    T(s, sub, { x: X(x), y: X(760), w: X(400), h: X(66), fontSize: F(24), color: TINT.onNavy, objectName: 'Keterangan ' + n + '%' });
  };
  big(96, '10', 'PEMBINAAN BAHARU', 'Komitmen kariah berdasarkan ketetapan garis panduan dan lokaliti');
  big(556, '20', 'NAIK TARAF / BAIK PULIH', 'Di Semenanjung Malaysia bagi kos melebihi RM100,000');
  s.addShape(pres.shapes.LINE, { x: X(528), y: X(566), w: 0, h: X(256), line: { color: H.gold, width: 1, transparency: 40 } });
  rect(s, 96, 852, 880, 136, 'FFFFFF', 'Kotak penjelasan', { fill: { color: 'FFFFFF', transparency: 93 } });
  rect(s, 96, 852, 6, 136, C.accent2, 'Penanda penjelasan');
  s.addText([{ text: 'Komitmen kewangan kariah ini ' }, { text: 'bukan caj yang dikenakan oleh Kerajaan Negeri', options: { bold: true, color: C.accent2 } }, { text: ', sebaliknya sebahagian daripada tanggungjawab pembiayaan berdasarkan garis panduan Kerajaan Persekutuan.' }],
    { isTextBox: true, x: X(128), y: X(852), w: X(830), h: X(136), fontFace: FONT, fontSize: F(25), color: 'E8EDF5', valign: 'middle', margin: 0, lineSpacingMultiple: 1.05, objectName: 'Penjelasan bukan caj' });
  s.addNotes('Isu: komitmen kewangan kariah 10% (bina baharu) dan 20% (naik taraf/baik pulih). Ia bukan caj Kerajaan Negeri tetapi ditetapkan Garis Panduan Kerajaan Persekutuan Bil. 1/2024. Ruang kanan: masukkan gambar masjid/surau.');
}

// ================= 4 — GARIS PANDUAN =================
pres.addSection({ title: 'Garis Panduan' });
{
  const s = pres.addSlide({ masterName: 'Tajuk Sahaja', sectionTitle: 'Garis Panduan' });
  eyebrow(s, 'GARIS PANDUAN', 'Bil. 1/2024');
  s.addText([{ text: 'BERDASARKAN GARIS PANDUAN', options: { breakLine: true } }, { text: 'KERAJAAN PERSEKUTUAN', options: { color: C.accent3 } }], { placeholder: 'title' });
  caption(s, 96, 300, 470, 'BINA BAHARU', 'Nisbah ikut lokaliti', { tagW: 180 });
  const facts = [
    [352, 'Bil. 1/2024', 'Garis Panduan Permohonan Peruntukan Kerajaan Persekutuan', false],
    [556, '1 Jan 2024', 'Dikeluarkan oleh Jabatan Perdana Menteri', false],
    [760, '30%', 'Komitmen Kerajaan Negeri sebelum permohonan dikemukakan kepada Pejabat YAB Perdana Menteri', true],
  ];
  for (const [y, h, p, k] of facts) {
    rect(s, 96, y, 470, 188, k ? H.goldT : 'FFFFFF', 'Kad ' + h);
    T(s, h, { x: X(124), y: X(y + 20), w: X(420), h: X(60), fontSize: F(k ? 52 : 38), bold: true, color: k ? C.accent3 : C.text2, valign: 'middle', objectName: 'Fakta ' + h });
    T(s, p, { x: X(124), y: X(y + 88), w: X(420), h: X(90), fontSize: F(23), color: k ? TINT.brown : C.accent5, objectName: 'Keterangan ' + h });
  }
  const groups = [
    ['Selangor / Pulau Pinang / Johor', true, [['Bandar', '50%', '30%', '20%'], ['Pinggir Bandar', '60%', '30%', '10%'], ['Luar Bandar', '65%', '30%', '5%']]],
    ['Negeri Sembilan / Melaka / Pahang / Perak', false, [['Bandar', '70%', '20%', '10%'], ['Pinggir Bandar', '70%', '20%', '10%'], ['Luar Bandar', '75%', '20%', '5%']]],
    ['Kedah / Perlis / Kelantan / Terengganu', false, [['Bandar', '75%', '15%', '10%'], ['Pinggir Bandar', '80%', '15%', '5%'], ['Luar Bandar', '80%', '15%', '5%']]],
    ['Sabah / Sarawak', false, [['Bandar', '80%', '15%', '5%'], ['Pinggir Bandar', '85%', '15%', '-'], ['Luar Bandar', '85%', '15%', '-']]],
    ['Wilayah Persekutuan', false, [['Kuala Lumpur & Putrajaya', '80%', '-', '20%'], ['Labuan', '100%', '-', '-']]],
  ];
  const data = [[thCell('NEGERI'), thCell('LOKALITI'), thCell('PERSEKUTUAN', 'center'), thCell('NEGERI', 'center'), thCell('KARIAH', 'center')]];
  groups.forEach(([g, jh, rows], gi) => {
    const fill = { color: jh ? H.goldT : gi % 2 ? TINT.zebra : 'FFFFFF' };
    rows.forEach((r, ri) => {
      const line = [];
      if (ri === 0) {
        const txt = jh ? [{ text: 'Selangor / Pulau Pinang /', options: { breakLine: true } }, { text: 'JOHOR', options: { fontSize: F(30) } }] : g;
        line.push({ text: txt, options: { rowspan: rows.length, fill: { color: jh ? H.gold : 'FFFFFF' }, bold: true, color: H.navy, fontSize: F(24), valign: 'middle', border: [NONE, bd(), bd(), NONE] } });
      }
      const pc = (v, k) => cell(v === '-' ? '–' : v, { fill, align: 'center', bold: v !== '-', color: v === '-' ? TINT.dash : k && jh ? H.goldD : H.navy });
      line.push(cell(r[0], { fill, color: H.ink }), pc(r[1]), pc(r[2]), pc(r[3], true));
      data.push(line);
    });
  });
  s.addTable(data, { x: X(600), y: X(300), w: X(1224), colW: [X(300), X(330), X(214), X(180), X(200)], rowH: [X(50), ...Array(14).fill(X(42.5))], fontFace: FONT, fontSize: F(26), color: H.ink, margin: [2, 10, 2, 12], objectName: 'Jadual nisbah bina baharu' });
  T(s, 'Baris emas: kumpulan negeri yang merangkumi Johor.', { x: X(96), y: X(962), w: X(470), h: X(30), fontSize: F(19), color: C.accent5, valign: 'middle', objectName: 'Nota' });
  s.addNotes('Garis Panduan Bil. 1/2024 (JPM, 1 Januari 2024), selaras keputusan Mesyuarat Perdana Menteri bersama Menteri Besar dan Ketua Menteri ke-139 pada 28 Jun 2022. Kerajaan Negeri perlu sediakan komitmen 30% sebelum permohonan dikemukakan.');
}

// ================= 5 — NAIK TARAF =================
{
  const s = pres.addSlide({ masterName: 'Tajuk dan Gambar Kanan', sectionTitle: 'Garis Panduan' });
  eyebrow(s, 'NISBAH PEMBIAYAAN', 'Naik Taraf');
  s.addText([{ text: 'BAGAIMANA NISBAH PEMBIAYAAN', options: { breakLine: true } }, { text: 'NAIK TARAF DAN BAIK PULIH?', options: { color: C.accent3 } }], { placeholder: 'title' });
  s.addText([{ text: 'Kadar komitmen ditentukan oleh ' }, { text: 'wilayah', options: { bold: true, color: C.text2 } }, { text: ' dan ' }, { text: 'jumlah kos projek', options: { bold: true, color: C.text2 } }, { text: '.' }],
    { isTextBox: true, x: X(96), y: X(280), w: X(1060), h: X(40), fontFace: FONT, fontSize: F(28), color: C.accent5, margin: 0, valign: 'middle', objectName: 'Pengenalan' });
  const rows = [
    ['Semenanjung', '≤ RM100,000', '100%', '-', 1, 0],
    ['Sabah, Sarawak dan W.P. Labuan', '≤ RM100,000', '100%', '-', 1, 0],
    ['Semenanjung', '> RM100,000', '80%', '20%', 0.8, 0.2],
    ['Sabah, Sarawak dan W.P. Labuan', '> RM200,000', '90%', '10%', 0.9, 0.1],
  ];
  const data = [[thCell('NEGERI'), thCell('KOS'), thCell('KERAJAAN PERSEKUTUAN', 'center'), thCell('KARIAH', 'center')]];
  const y0 = 340, hdrH = 70, rowPx = 116, colW = [372, 268, 230, 190];
  rows.forEach(([ng, kos, fed, kar], i) => {
    const hi = i >= 2;
    const sep = i === 2 ? [bd(H.navy, 2), NONE, bd(), NONE] : [NONE, NONE, bd(), NONE];
    data.push([
      cell(ng, { bold: true, color: H.navy, fontSize: F(27), border: sep, fill: { color: 'FFFFFF' } }),
      cell(kos, { bold: true, color: hi ? TINT.brown : H.royal, fontSize: F(27), fill: { color: hi ? H.goldT : TINT.blueT }, valign: 'middle', border: sep }),
      cell(fed, { bold: true, color: H.navy, fontSize: F(56), align: 'center', border: sep, fill: { color: 'FFFFFF' } }),
      cell(kar === '-' ? '–' : kar, { bold: true, color: kar === '-' ? TINT.dash : H.goldD, fontSize: F(56), align: 'center', border: sep, fill: { color: 'FFFFFF' } }),
    ]);
  });
  s.addTable(data, { x: X(96), y: X(y0), w: X(1060), colW: colW.map(X), rowH: [hdrH, rowPx, rowPx, rowPx, rowPx].map(X), fontFace: FONT, fontSize: F(27), color: H.ink, margin: [3, 12, 3, 16], objectName: 'Jadual nisbah naik taraf' });
  const ly = y0 + hdrH + 4 * rowPx + 22;
  T(s, 'Sumber: Garis Panduan Bil. 1/2024', { x: X(96), y: X(ly), w: X(640), h: X(34), fontSize: F(23), color: C.accent5, valign: 'middle', objectName: 'Sumber' });
  foto(s, 'foto_kanan', SLOT.s3);
  rect(s, 1196, 714, 628, 226, C.text2, 'Kotak inisiatif negeri');
  s.addImage({ path: A('ic_shield.png'), x: X(1226), y: X(745), w: X(60), h: X(60), altText: 'Ikon perisai', objectName: 'Ikon perisai' });
  s.addText([{ text: 'Kerajaan Negeri Johor turut mengambil inisiatif ' }, { text: 'membantu meringankan beban kewangan pihak kariah', options: { bold: true, color: C.accent2 } }, { text: ' melalui dana dan penyelarasan peruntukan.' }],
    { isTextBox: true, x: X(1306), y: X(734), w: X(494), h: X(190), fontFace: FONT, fontSize: F(27), color: C.background1, margin: 0, valign: 'middle', lineSpacingMultiple: 1.05, objectName: 'Nota inisiatif' });
  s.addNotes('Kos <= RM100,000 dibiayai penuh Kerajaan Persekutuan. Semenanjung > RM100,000: 80% Persekutuan, 20% kariah. Sabah, Sarawak dan W.P. Labuan > RM200,000: 90% / 10%.');
}

// ================= 6 — TPMJ 1/2 =================
pres.addSection({ title: 'Sumbangan TPMJ' });
const sideHead = (s, big, bigColor, unit, title, sub) => {
  s.addText(unit ? [{ text: big }, { text: ' ' + unit, options: { fontSize: F(56), color: C.accent3 } }] : big,
    { isTextBox: true, x: X(96), y: X(138), w: X(640), h: X(160), fontFace: FONT, fontSize: F(150), bold: true, color: bigColor, margin: 0, valign: 'bottom', objectName: 'Angka utama' });
  s.addText(title, { placeholder: 'title' });
  T(s, sub, { x: X(96), y: X(444), w: X(620), h: X(62), fontSize: F(23), color: C.accent5, objectName: 'Subtajuk' });
  foto(s, 'foto_kiri', SLOT.side);
};
{
  const s = pres.addSlide({ masterName: 'Dua Lajur Gambar Kiri', sectionTitle: 'Sumbangan TPMJ' });
  eyebrow(s, 'SUMBANGAN TPMJ', '2025 & 2026 · 1/2');
  sideHead(s, 'RM6.3', C.text2, 'JUTA', 'DIPERUNTUKKAN BAGI PEMBANGUNAN MASJID DAN SURAU', 'Tabung Pembangunan Masjid dan Amal Jariah Johor (TPMJ) bagi tahun 2025 dan 2026');
  caption(s, 756, 140, 1068, 'JADUAL 1', 'Sumbangan Pembinaan Surau Kritikal Negeri Johor');
  donationTable(s, 756, 194, 1068, 'Nama Surau', [
    [1, 'Surau Al-Amir, Lorong Haji Amir, Simpang Renggam', 'Kluang', '259,800'],
    [2, 'Surau Kg. Jelutong Darat', 'Pontian', '240,000'],
    [3, 'Surau Parit Tegong', 'Pontian', '240,000'],
  ], '739,800', [44, 70, 44, 44, 52]);
  caption(s, 756, 474, 1068, 'JADUAL 2', 'Sumbangan Pembinaan Semula dan Pembinaan Baharu Masjid Negeri Johor Tahun 2025', { h: 72 });
  donationTable(s, 756, 556, 1068, 'Nama Masjid', [
    [1, 'Masjid An-Nur, Ladang Seri Gading', 'Batu Pahat', '1,000,000'],
    [2, 'Masjid Taman Sri Penawar, Bandar Penawar', 'Kota Tinggi', '1,000,000'],
    [3, 'Masjid Parit Haji Arif, Benut', 'Pontian', '500,000'],
    [4, 'Masjid Kg. Contoh, Kahang', 'Kluang', '400,000'],
    [5, 'Masjid Kg. Melayu, Chamek, Kahang', 'Kluang', '200,000'],
    [6, 'Masjid Al-Ehsan, Taman Wawasan, Kelapa Sawit', 'Kulai', '500,000'],
  ], '3,600,000', [44, 44, 44, 44, 44, 44, 64, 52]);
  s.addNotes('TPMJ memperuntukkan RM6.3 juta bagi komitmen pembinaan baharu masjid dan surau 2025-2026. Jadual 1: 3 surau kritikal (RM739,800). Jadual 2: 6 masjid tahun 2025 (RM3,600,000).');
}

// ================= 7 — TPMJ 2/2 =================
{
  const s = pres.addSlide({ masterName: 'Dua Lajur Gambar Kiri', sectionTitle: 'Sumbangan TPMJ' });
  eyebrow(s, 'SUMBANGAN TPMJ', '2025 & 2026 · 2/2');
  sideHead(s, '16', C.accent3, '', 'PROJEK PEMBANGUNAN MASJID DAN SURAU MENERIMA SUMBANGAN', 'Tabung Pembangunan Masjid dan Amal Jariah Johor (TPMJ) bagi tahun 2025 dan 2026');
  caption(s, 756, 140, 1068, 'JADUAL 3', 'Sumbangan Pembinaan Semula dan Pembinaan Baharu Masjid Negeri Johor Tahun 2025', { h: 72 });
  donationTable(s, 756, 222, 1068, 'Nama Masjid / Surau', [
    [1, 'Masjid Al-Faizun, Taman Kempas', 'Johor Bahru', '410,000'],
    [2, 'Masjid Bandar Bestari Perdana, Pasir Gudang', 'Johor Bahru', '315,000'],
    [3, 'Masjid Nurul Huda, Parit Lapis Dalam, Senggarang', 'Batu Pahat', '375,000'],
    [4, 'Surau Parit Lapis Laman, Mk. 4, Pt. Sulong', 'Batu Pahat', '50,000'],
    [5, 'Masjid Bandar Seri Impian', 'Kluang', '500,000'],
    [6, 'Surau Tengah, Kg. Melayu Raya, Pekan Nanas', 'Pontian', '50,000'],
    [7, 'Masjid Kg. Batu 4', 'Kota Tinggi', '300,000'],
  ], '2,000,000', [44, 44, 44, 70, 44, 44, 44, 44, 50], [196, 172], 24);
  const sy = 672;
  rect(s, 756, sy, 1068, 300, C.text2, 'Latar rumusan');
  caption(s, 782, sy + 18, 1016, 'JADUAL 4', 'Rumusan Keseluruhan Sumbangan', { tagFill: C.accent2, tagColor: C.text2, color: C.background1 });
  const gh = (t, a = 'left') => ({ text: t, options: { color: H.gold, bold: true, fontSize: F(19), charSpacing: 1, align: a, valign: 'bottom', fill: { color: H.navy }, border: [NONE, NONE, bd(H.gold, 1), NONE] } });
  const sc = (t, o = {}) => ({ text: t, options: { color: 'FFFFFF', fill: { color: H.navy }, valign: 'middle', border: [NONE, NONE, bd('33496A', 0.75), NONE], ...o } });
  const G = (t, o = {}) => ({ text: t, options: { fill: { color: H.gold }, color: H.navy, bold: true, valign: 'middle', border: [NONE, NONE, NONE, NONE], ...o } });
  s.addTable([
    [gh('BIL.', 'center'), gh('KATEGORI'), gh('BILANGAN', 'center'), gh('PERUNTUKAN (RM)', 'right')],
    [sc('1', { align: 'center', color: '9FB0C9' }), sc('Surau Kritikal'), sc('3', { align: 'center', bold: true }), sc('739,800', { align: 'right', bold: true })],
    [sc('2', { align: 'center', color: '9FB0C9' }), sc('Pembinaan Masjid 2025'), sc('6', { align: 'center', bold: true }), sc('3,600,000', { align: 'right', bold: true })],
    [sc('3', { align: 'center', color: '9FB0C9' }), sc('Pembinaan Masjid/Surau'), sc('7', { align: 'center', bold: true }), sc('2,000,000', { align: 'right', bold: true })],
    [G(''), G('JUMLAH', { fontSize: F(28) }), G('16', { fontSize: F(40), align: 'center' }), G('6,339,800', { fontSize: F(40), align: 'right' })],
  ], { x: X(782), y: X(sy + 70), w: X(1016), colW: [X(96), X(460), X(200), X(260)], rowH: [34, 40, 40, 40, 56].map(X), fontFace: FONT, fontSize: F(27), margin: [2, 10, 2, 10], objectName: 'Jadual rumusan' });
  s.addNotes('Jadual 3: 7 projek masjid/surau (RM2,000,000). Rumusan: 16 projek, RM6,339,800. Nota: jumlah Surau Kritikal RM739,800 berdasarkan pecahan terperinci (dokumen asal mencatat RM739,000 dalam rumusan).');
}

// ================= 8 — PENCAPAIAN =================
pres.addSection({ title: 'Pencapaian & Inisiatif' });
{
  const s = pres.addSlide({ masterName: 'Statistik Gambar Kanan', sectionTitle: 'Pencapaian & Inisiatif' });
  eyebrow(s, 'PENCAPAIAN', 'Peruntukan');
  rect(s, 96, 140, 240, 40, C.text2, 'Label tempoh');
  T(s, '2022 – NOV 2026', { x: X(96), y: X(140), w: X(240), h: X(40), fontSize: F(20), bold: true, color: C.background1, align: 'center', valign: 'middle', charSpacing: 1.5, objectName: 'Tempoh' });
  s.addText([{ text: 'RM145.9', options: { fontSize: F(130), color: C.text2 } }, { text: ' JUTA', options: { fontSize: F(62), color: C.accent3 } }],
    { isTextBox: true, x: X(96), y: X(186), w: X(1000), h: X(146), fontFace: FONT, bold: true, margin: 0, valign: 'bottom', objectName: 'RM145.9 juta' });
  s.addText('UNTUK PEMBANGUNAN MASJID DAN SURAU DI JOHOR', { placeholder: 'title' });
  s.addShape(pres.shapes.LINE, { x: X(96), y: X(404), w: X(1000), h: 0, line: { color: H.line, width: 0.75 } });
  s.addShape(pres.shapes.LINE, { x: X(96), y: X(500), w: X(1000), h: 0, line: { color: H.line, width: 0.75 } });
  s.addImage({ path: A('ic_mosque.png'), x: X(96), y: X(422), w: X(60), h: X(60), altText: 'Ikon masjid', objectName: 'Ikon masjid' });
  T(s, '2,019', { x: X(176), y: X(414), w: X(240), h: X(78), fontSize: F(80), bold: true, color: C.accent3, valign: 'middle', objectName: '2,019 projek' });
  s.addText([{ text: 'projek atau sumbangan', options: { bold: true, color: C.text2, breakLine: true } }, { text: 'baik pulih, naik taraf, bina baharu & bina semula' }],
    { isTextBox: true, x: X(430), y: X(414), w: X(666), h: X(78), fontFace: FONT, fontSize: F(26), color: C.text1, margin: 0, valign: 'middle', objectName: 'Label 2,019' });
  T(s, 'TIGA SUMBER PERUNTUKAN TERBESAR', { x: X(96), y: X(522), w: X(800), h: X(30), fontSize: F(20), bold: true, color: C.accent3, charSpacing: 3, valign: 'middle', objectName: 'Label carta' });
  // three largest sources — detail cards (bar length is proportional to the amount)
  const src = [
    { no: '1', nama: 'ICU JPM', penuh: 'Pejabat Pembangunan Negeri Johor', rm: 'RM79.3 juta', v: 79.3, bil: '1,031', unit: 'projek di masjid dan surau' },
    { no: '2', nama: 'TPMJ', penuh: 'Tabung Pembangunan Masjid dan Amal Jariah Johor', rm: 'RM20.8 juta', v: 20.8, bil: '328', unit: 'projek dan sumbangan kepada masjid dan surau' },
    { no: '3', nama: 'Pejabat YAB Menteri Besar Johor', penuh: '', rm: 'RM12.7 juta', v: 12.7, bil: '471', unit: 'sumbangan kepada masjid dan surau' },
  ];
  src.forEach((r, i) => {
    const y = 558 + i * 126, h = 118;
    rect(s, 96, y, 1000, h, 'FFFFFF', 'Kad sumber ' + r.no);
    rect(s, 96, y, 66, h, i === 0 ? C.text2 : C.accent1, 'Nombor sumber ' + r.no);
    T(s, r.no, { x: X(96), y: X(y), w: X(66), h: X(h), fontSize: F(46), bold: true, color: C.background1, align: 'center', valign: 'middle', objectName: 'Nombor ' + r.no });
    T(s, r.nama, { x: X(184), y: X(y + 10), w: X(560), h: X(40), fontSize: F(r.penuh ? 34 : 29), bold: true, color: C.text2, valign: 'middle', objectName: 'Nama sumber ' + r.no });
    if (r.penuh) T(s, r.penuh, { x: X(184), y: X(y + 50), w: X(560), h: X(28), fontSize: F(20), color: C.accent5, valign: 'middle', objectName: 'Nama penuh ' + r.no });
    s.addText([{ text: r.bil + ' ', options: { bold: true, color: C.accent3, fontSize: F(30) } }, { text: r.unit, options: { color: C.text1, fontSize: F(21) } }],
      { isTextBox: true, x: X(184), y: X(y + (r.penuh ? 80 : 56)), w: X(560), h: X(34), fontFace: FONT, margin: 0, valign: 'middle', objectName: 'Bilangan projek ' + r.no });
    T(s, r.rm, { x: X(752), y: X(y + 12), w: X(328), h: X(54), fontSize: F(40), bold: true, color: C.text2, align: 'right', valign: 'middle', objectName: 'Nilai sumber ' + r.no });
    rect(s, 752, y + 84, 328, 14, 'E4E4EA', 'Latar bar ' + r.no);
    rect(s, 752, y + 84, +(328 * r.v / 79.3).toFixed(1), 14, i === 0 ? C.text2 : C.accent1, 'Bar sumber ' + r.no);
  });
  T(s, 'Selebihnya dibiayai oleh pelbagai agensi peringkat Persekutuan dan Negeri.', { x: X(96), y: X(944), w: X(1000), h: X(34), fontSize: F(21), color: C.accent5, valign: 'middle', objectName: 'Nota sumber' });
  foto(s, 'foto_atas', SLOT.s6);
  const px = 1136, py = 566, pw = 688;
  rect(s, px, py, pw, 404, C.text2, 'Panel DUN Maharani');
  s.addText([{ text: 'DUN N15 ', options: { color: C.background1 } }, { text: 'MAHARANI', options: { color: C.accent2 } }], { isTextBox: true, x: X(px + 32), y: X(py + 22), w: X(400), h: X(40), fontFace: FONT, fontSize: F(30), bold: true, charSpacing: 1.5, margin: 0, valign: 'middle', objectName: 'DUN Maharani' });
  T(s, '2024 – 2026', { x: X(px + pw - 252), y: X(py + 22), w: X(220), h: X(40), fontSize: F(20), bold: true, color: C.accent2, align: 'right', charSpacing: 2, valign: 'middle', objectName: 'Tempoh DUN' });
  s.addShape(pres.shapes.LINE, { x: X(px + 32), y: X(py + 78), w: X(pw - 64), h: 0, line: { color: H.gold, width: 0.75, transparency: 40 } });
  T(s, 'RM1,867,110', { x: X(px + 32), y: X(py + 96), w: X(pw - 64), h: X(66), fontSize: F(60), bold: true, color: C.accent2, valign: 'middle', objectName: 'Nilai RM1,867,110' });
  T(s, 'jumlah peruntukan baik pulih, naik taraf & sumbangan', { x: X(px + 32), y: X(py + 166), w: X(pw - 64), h: X(34), fontSize: F(22), color: TINT.onNavy, objectName: 'Label RM1,867,110' });
  T(s, '14', { x: X(px + 32), y: X(py + 226), w: X(180), h: X(56), fontSize: F(50), bold: true, color: C.background1, valign: 'middle', objectName: 'Nilai 14' });
  T(s, 'buah masjid dan surau', { x: X(px + 32), y: X(py + 286), w: X(190), h: X(64), fontSize: F(22), color: TINT.onNavy, objectName: 'Label 14' });
  T(s, 'RM741,400', { x: X(px + 262), y: X(py + 226), w: X(394), h: X(56), fontSize: F(50), bold: true, color: C.background1, valign: 'middle', objectName: 'Nilai RM741,400' });
  T(s, 'ICU JPM, penyumbang terbesar, kira-kira 39.7%', { x: X(px + 262), y: X(py + 286), w: X(394), h: X(64), fontSize: F(22), color: TINT.onNavy, objectName: 'Label RM741,400' });
  rect(s, px + 262, py + 360, 394, 12, '2A3E5E', 'Meter latar');
  rect(s, px + 262, py + 360, 394 * 0.397, 12, C.accent2, 'Meter 39.7%');
  s.addNotes('2022 hingga November 2026: RM145.9 juta untuk 2,019 projek/sumbangan. ICU JPM RM79.3 juta (1,031 projek), TPMJ RM20.8 juta (328), Pejabat YAB MB RM12.7 juta (471 sumbangan). DUN N15 Maharani 2024-2026: RM1,867,110 untuk 14 masjid dan surau; ICU JPM RM741,400 (~39.7%).');
}

// ================= 9 — INISIATIF =================
{
  const s = pres.addSlide({ masterName: 'Inisiatif 3 Kad', sectionTitle: 'Pencapaian & Inisiatif' });
  eyebrow(s, 'INISIATIF', 'Kerajaan Negeri');
  s.addText([{ text: 'USAHA BERTERUSAN MEMPERKASA ' }, { text: 'PEMBANGUNAN MASJID DAN SURAU', options: { color: C.accent3 } }], { placeholder: 'title' });
  const cards = [
    { no: '01', icon: 'ic_fund.png', t: 'Penyediaan Dana Melalui TPMJ', body: [{ text: 'RM6.3 juta', options: { bold: true, color: C.text2 } }, { text: ' diperuntukkan bagi menampung komitmen pembinaan baharu masjid dan surau bagi tahun 2025 dan 2026.' }] },
    { no: '02', icon: 'ic_network.png', t: 'Penyelarasan Peruntukan Agensi Kerajaan Negeri', tags: ['MAINJ', 'PEJABAT YAB MB JOHOR', 'JAINJ', 'TPMJ'], body: [{ text: 'Permohonan dinilai berdasarkan keperluan dan keutamaan bagi mengelakkan pertindihan pembiayaan.' }] },
    { no: '03', icon: 'ic_people.png', t: 'Pengurusan Kutipan Khairat & Sumbangan Orang Ramai', k: true },
  ];
  cards.forEach((c, i) => {
    const [x, y, w] = SLOT.card[i];
    rect(s, x, y, w, 672, 'FFFFFF', 'Kad inisiatif ' + c.no, { shadow: { type: 'outer', color: '000000', opacity: 0.08, blur: 6, offset: 2, angle: 90 } });
    foto(s, 'foto_kad_' + (i + 1), SLOT.card[i]);
    rect(s, x, y + 320, w, 6, c.k ? C.accent2 : C.text2, 'Pemisah kad ' + c.no);
    s.addImage({ path: A(c.icon), x: X(x + 22), y: X(y + 350), w: X(52), h: X(52), altText: 'Ikon inisiatif ' + c.no, objectName: 'Ikon ' + c.no });
    T(s, c.no, { x: X(x + 22), y: X(y + 406), w: X(52), h: X(22), fontSize: F(18), bold: true, color: C.accent3, align: 'center', valign: 'middle', objectName: 'Nombor ' + c.no });
    T(s, c.t, { x: X(x + 92), y: X(y + 346), w: X(w - 114), h: X(76), fontSize: F(28), bold: true, color: C.text2, valign: 'top', lineSpacingMultiple: 0.95, objectName: 'Tajuk inisiatif ' + c.no });
    let by = y + 440;
    if (c.tags) {
      let tx = x + 22;
      for (const tg of c.tags) {
        const tw = 22 + tg.length * 11.5;
        rect(s, tx, y + 440, tw, 34, TINT.chipBlue, 'Tag ' + tg);
        T(s, tg, { x: X(tx), y: X(y + 440), w: X(tw), h: X(34), fontSize: F(16), bold: true, color: C.accent1, align: 'center', valign: 'middle', charSpacing: 0.3 });
        tx += tw + 8;
      }
      by = y + 490;
    }
    if (c.body) s.addText(c.body, { isTextBox: true, x: X(x + 22), y: X(by), w: X(w - 44), h: X(y + 656 - by), fontFace: FONT, fontSize: F(26), color: C.text1, margin: 0, valign: 'top', lineSpacingMultiple: 1.05, objectName: 'Isi inisiatif ' + c.no });
    if (c.k) {
      T(s, '27', { x: X(x + 22), y: X(y + 450), w: X(130), h: X(100), fontSize: F(96), bold: true, color: C.accent3, valign: 'middle', objectName: '27 permohonan' });
      s.addText([{ text: 'permohonan kebenaran kutipan khairat ' }, { text: 'diluluskan', options: { bold: true, color: C.text2 } }, { text: ' bagi tempoh 2025 hingga September 2026' }],
        { isTextBox: true, x: X(x + 160), y: X(y + 444), w: X(w - 182), h: X(160), fontFace: FONT, fontSize: F(26), color: C.text1, margin: 0, valign: 'middle', lineSpacingMultiple: 1.05, objectName: 'Label 27 permohonan' });
    }
  });
  s.addNotes('Tiga inisiatif: (1) dana TPMJ RM6.3 juta 2025-2026; (2) penyelarasan MAINJ, Pejabat YAB MB, JAINJ dan TPMJ; (3) 27 permohonan kutipan khairat diluluskan 2025 hingga September 2026 (Seksyen 106 Enakmen Pentadbiran Agama Islam (Negeri Johor) 2003).');
}

// ================= 10 — SUMBANGAN (QR & AKAUN) =================
{
  const s = pres.addSlide({ masterName: 'Sumbangan QR', sectionTitle: 'Pencapaian & Inisiatif' });
  s.addShape(pres.shapes.LINE, { x: X(96), y: X(206), w: X(46), h: 0, line: { color: H.gold, width: 1.5 } });
  T(s, 'TABUNG PEMBANGUNAN MASJID DAN AMAL JARIAH JOHOR', { x: X(158), y: X(188), w: X(1000), h: X(36), fontSize: F(22), bold: true, color: C.accent2, valign: 'middle', charSpacing: 3, objectName: 'Nama tabung' });
  s.addText([{ text: 'MARILAH KITA', options: { breakLine: true } }, { text: 'BERSAMA-SAMA MENYUMBANG', options: { color: C.accent2 } }], { placeholder: 'title' });
  s.addText([{ text: 'Menyumbang ke dalam ' }, { text: 'Tabung Pembangunan Masjid dan Amal Jariah Johor', options: { bold: true, color: C.accent2 } }, { text: ' demi memastikan masjid terus terpelihara sebagai pusat ibadah, ilmu dan pembangunan ummah.' }],
    { isTextBox: true, x: X(96), y: X(406), w: X(1060), h: X(140), fontFace: FONT, fontSize: F(29), color: 'E8EDF5', margin: 0, valign: 'top', lineSpacingMultiple: 1.08, objectName: 'Seruan menyumbang' });
  // account template
  rect(s, 96, 574, 1060, 380, 'FFFFFF', 'Kotak maklumat akaun', { fill: { color: 'FFFFFF', transparency: 92 } });
  rect(s, 96, 574, 6, 380, C.accent2, 'Penanda maklumat akaun');
  const row = (y, label) => {
    T(s, label, { x: X(140), y: X(y), w: X(400), h: X(28), fontSize: F(19), bold: true, color: C.accent2, charSpacing: 2.5, valign: 'middle', objectName: 'Label ' + label });
  };
  row(606, 'NAMA AKAUN'); row(710, 'NO. AKAUN'); row(822, 'BANK');
  for (const y of [688, 800, 904]) s.addShape(pres.shapes.LINE, { x: X(140), y: X(y), w: X(980), h: 0, line: { color: 'FFFFFF', width: 0.75, dashType: 'dash', transparency: 60 } });
  s.addText('', { placeholder: 'nama_akaun' });
  s.addText('', { placeholder: 'no_akaun' });
  s.addText('', { placeholder: 'bank' });
  // QR panel
  rect(s, 1288, 196, 470, 470, 'EFEFF2', 'Latar kod QR');
  s.addImage({ path: A('ic_qr.png'), x: X(1475), y: X(383), w: X(96), h: X(96), altText: 'Ikon ruang kod QR', objectName: 'Ikon ruang kod QR' });
  s.addText('', { placeholder: 'foto_qr' });
  rect(s, 1288, 700, 470, 6, C.accent2, 'Pemisah QR');
  T(s, 'IMBAS UNTUK MENYUMBANG', { x: X(1264), y: X(728), w: X(518), h: X(48), fontSize: F(34), bold: true, color: C.text2, align: 'center', valign: 'middle', objectName: 'Label imbas' });
  T(s, 'Sumbangan merupakan amal jariah yang manfaatnya dinikmati masyarakat dan generasi akan datang.', { x: X(1288), y: X(790), w: X(470), h: X(120), fontSize: F(23), color: C.accent5, align: 'center', valign: 'top', objectName: 'Keterangan amal jariah' });
  s.addNotes('Templat sumbangan: klik ikon dalam kotak putih untuk masukkan imej kod QR, dan taip nama akaun, nombor akaun serta nama bank pada ruang yang disediakan. Seruan berdasarkan penutup jawapan A203.');
}

// pptxgenjs 4.0.1 drops type="pic" on image placeholders (its lookup checks the mapped value as a key).
// Add it back to every typeless placeholder, which in this deck are only the picture placeholders.
async function fixPicPlaceholders(file) {
  const zip = await JSZip.loadAsync(fs.readFileSync(file));
  let n = 0;
  for (const name of Object.keys(zip.files)) {
    if (!/^ppt\/(slides|slideLayouts)\/[^/]+\.xml$/.test(name)) continue;
    const xml = await zip.file(name).async('string');
    const out = xml.replace(/<p:ph\s+idx="(\d+)"\s+(hasCustomPrompt="1"\s*)?\/>/g, (m, idx, hp) => { n++; return `<p:ph type="pic" idx="${idx}"${hp ? ' hasCustomPrompt="1"' : ''}/>`; });
    let out2 = out;
    if (/name="Soalan Lisan"/.test(out) || (name.startsWith('ppt/slides/') && /SOALAN A203/.test(out))) {
      out2 = out.replace(/(<p:ph type="pic"[^>]*\/>[\s\S]*?<a:prstGeom prst=")rect(")/, '$1ellipse$2');
    }
    if (out2 !== xml) zip.file(name, out2);
  }
  fs.writeFileSync(file, await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' }));
  return n;
}

(async () => {
  const out = path.join(__dirname, 'A203_Infografik_16x9.pptx');
  await pres.writeFile({ fileName: out });
  console.log('picture placeholders fixed:', await fixPicPlaceholders(out));
  await applyTheme(out, THEME);
  console.log('wrote', out);
})();
