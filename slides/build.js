const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const fa = require("react-icons/fa");
const { applyTheme } = require("/root/.claude/skills/synced/73dd325d-3fe3-41c9-87ef-cd0391b3832b_637d1d23-f6c4-4283-91fb-5ad29edf9c34/pptx/scripts/apply_theme.js");

const NAVY = "1B2A7B", RED = "C8102E", GOLD = "A67C00", GOLD2 = "F2C94C";
const GREY = "4B5563", LIGHT = "EEF1F8", BG = "F5F6FA", WHITE = "FFFFFF", PH = "E3E8F5";
const LOGO = "/home/user/Nawal/slides/assets/logos.png";
const OUT = "/home/user/Nawal/slides/A93_Halal_Johor_4x3.pptx";

const THEME = {
  name: "Maju Johor Halal",
  headFontFace: "Arial", bodyFontFace: "Arial",
  colors: { dk1: "1F2937", lt1: "FFFFFF", dk2: NAVY, lt2: BG, accent1: NAVY, accent2: RED, accent3: GOLD,
    accent4: "3B5BDB", accent5: "6B7280", accent6: "DADFEC", hlink: NAVY, folHlink: "6B7280" },
};

const pres = new pptxgen();
pres.layout = "LAYOUT_4x3"; // 10 x 7.5 in
pres.theme = { headFontFace: "Arial", bodyFontFace: "Arial" };
pres.title = "Soalan Lisan A93 - Pensijilan Halal dan Industri Halal Negeri Johor";
pres.author = "Pejabat YB Exco Hal Ehwal Agama Islam Johor";

const FOOT = "Soalan Lisan A93  |  Dewan Negeri Johor  |  26 November 2026";
const footer = (c) => [
  { text: { text: FOOT, options: { x: 0.5, y: 7.07, w: 7, h: 0.3, fontSize: 10, color: c, margin: 0 } } },
];
const titlePh = (color) => ({
  placeholder: { options: { name: "title", type: "title", x: 0.8, y: 1.1, w: 8.7, h: 0.95, fontSize: 24, bold: true,
    color, align: "left", valign: "middle", margin: 0 }, text: "" },
});

// light content layout
pres.defineSlideMaster({
  title: "LIGHT", background: { color: BG },
  objects: [
    { image: { x: 3.75, y: 0.22, w: 2.5, h: 0.76, path: LOGO } },
    { rect: { x: 0.5, y: 1.15, w: 0.07, h: 0.85, fill: { color: RED } } },
    titlePh(NAVY), ...footer("6B7280"),
  ],
  slideNumber: { x: 8.8, y: 7.07, w: 0.7, h: 0.3, fontSize: 10, color: "6B7280", align: "right" },
});
// dark content layout
pres.defineSlideMaster({
  title: "DARK", background: { color: NAVY },
  objects: [
    { rect: { x: 3.4, y: 0.16, w: 3.2, h: 0.88, fill: { color: WHITE } } },
    { image: { x: 3.75, y: 0.22, w: 2.5, h: 0.76, path: LOGO } },
    { rect: { x: 0.5, y: 1.15, w: 0.07, h: 0.85, fill: { color: RED } } },
    titlePh(WHITE), ...footer("C5CBE8"),
  ],
  slideNumber: { x: 8.8, y: 7.07, w: 0.7, h: 0.3, fontSize: 10, color: "C5CBE8", align: "right" },
});
pres.defineSlideMaster({
  title: "COVER", background: { color: BG },
  objects: [{ image: { x: 3.5, y: 0.3, w: 3.0, h: 0.91, path: LOGO } }],
});

// ---------- helpers ----------
const sh = () => ({ type: "outer", color: "000000", opacity: 0.14, blur: 6, offset: 2, angle: 90 });
function T(s, text, x, y, w, h, o = {}) {
  s.addText(text, Object.assign({ x, y, w, h, fontSize: 14, color: NAVY, valign: "top", margin: 0, isTextBox: true }, o));
}
function card(s, x, y, w, h, fill = WHITE, name = "Kad") {
  s.addShape(pres.ShapeType.rect, { x, y, w, h, fill: { color: fill }, line: { color: fill, width: 0 }, shadow: sh(), objectName: name });
}
function ph(s, x, y, w, h, label) {
  s.addShape(pres.ShapeType.rect, { x, y, w, h, fill: { color: PH }, line: { color: "8A94C4", width: 1.25, dashType: "dash" }, objectName: "Ruang Gambar" });
  T(s, [
    { text: "GAMBAR", options: { fontSize: 14, bold: true, color: "5A6499", breakLine: true } },
    { text: label, options: { fontSize: 12, color: "5A6499", breakLine: true } },
    { text: "Ruang gambar sebenar (boleh diganti)", options: { fontSize: 10, italic: true, color: "6B74A3" } },
  ], x + 0.15, y, w - 0.3, h, { align: "center", valign: "middle" });
}
// stat: big value + label, laid out inside a box
function stat(s, x, y, w, h, val, label, o = {}) {
  const vs = o.vs || 32, vh = vs / 72 * 1.3;
  if (o.card !== false) card(s, x, y, w, h, o.fill || WHITE);
  const pad = o.pad ?? 0.15;
  const dark = (o.fill || WHITE) === NAVY;
  T(s, val, x + pad, y + (o.top ?? 0.15), w - 2 * pad, vh, { fontSize: vs, bold: true, color: o.vc || (dark ? GOLD2 : GOLD), align: o.align || "left", valign: "middle" });
  T(s, label, x + pad, y + (o.top ?? 0.15) + vh + 0.05, w - 2 * pad, h - vh - 0.3, { fontSize: o.ls || 14, color: o.lc || (dark ? WHITE : NAVY), align: o.align || "left", bold: !!o.lb });
}
async function icon(Comp, color, size = 256) {
  const svg = ReactDOMServer.renderToStaticMarkup(React.createElement(Comp, { color: "#" + color, size: String(size) }));
  const buf = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + buf.toString("base64");
}
function circleIcon(s, data, x, y, d, fill) {
  s.addShape(pres.ShapeType.ellipse, { x, y, w: d, h: d, fill: { color: fill }, line: { color: fill, width: 0 } });
  const p = d * 0.27;
  s.addImage({ data, x: x + p, y: y + p, w: d - 2 * p, h: d - 2 * p });
}
let sec = "";
function slide(master, title, section) {
  if (section && section !== sec) { pres.addSection({ title: section }); sec = section; }
  const s = pres.addSlide({ masterName: master, sectionTitle: sec });
  if (title) s.addText(title, { placeholder: "title" });
  return s;
}

(async () => {
  const ic = {};
  for (const [k, c, col] of [
    ["clean", fa.FaHandSparkles, WHITE], ["safe", fa.FaShieldAlt, WHITE], ["qual", fa.FaAward, WHITE],
    ["cert", fa.FaCertificate, WHITE], ["fin", fa.FaMoneyBillWave, WHITE], ["brand", fa.FaTags, WHITE],
    ["pack", fa.FaBoxOpen, WHITE], ["mkt", fa.FaBullhorn, WHITE],
    ["home", fa.FaHome, NAVY], ["store", fa.FaStore, NAVY], ["grad", fa.FaUserGraduate, NAVY], ["help", fa.FaHandsHelping, NAVY],
    ["globe", fa.FaGlobeAsia, WHITE],
  ]) ic[k] = await icon(c, col);

  // ===== 1 COVER =====
  sec = "";
  pres.addSection({ title: "Pembukaan" }); sec = "Pembukaan";
  let s = pres.addSlide({ masterName: "COVER", sectionTitle: sec });
  s.addShape(pres.ShapeType.rect, { x: 0, y: 1.6, w: 10, h: 3.9, fill: { color: NAVY }, line: { color: NAVY, width: 0 } });
  s.addShape(pres.ShapeType.rect, { x: 0.8, y: 1.95, w: 0.9, h: 0.07, fill: { color: RED }, line: { color: RED, width: 0 } });
  s.addShape(pres.ShapeType.rect, { x: 1.7, y: 1.95, w: 0.9, h: 0.07, fill: { color: WHITE }, line: { color: WHITE, width: 0 } });
  T(s, "PENSIJILAN HALAL & INDUSTRI HALAL NEGERI JOHOR", 0.8, 2.2, 8.4, 1.5, { fontSize: 34, bold: true, color: WHITE, valign: "middle" });
  T(s, "SOALAN LISAN A93", 0.8, 3.8, 8.4, 0.5, { fontSize: 26, bold: true, color: GOLD2 });
  T(s, "Dewan Negeri Johor  |  26 November 2026", 0.8, 4.4, 8.4, 0.35, { fontSize: 18, color: WHITE });
  T(s, "Soalan daripada: YB Tuan Ng Yak Howe (Bentayan)", 0.8, 4.8, 8.4, 0.35, { fontSize: 18, bold: true, color: WHITE });
  ph(s, 0, 5.5, 10, 2.0, "Suasana Dewan Negeri / visual industri halal");

  // ===== 2 =====
  s = slide("LIGHT", "JOHOR MELULUSKAN 1,298 PENSIJILAN HALAL BAHARU", "Pencapaian");
  card(s, 0.5, 2.2, 4.3, 4.7, NAVY, "Hero");
  T(s, "JUMLAH KELULUSAN BAHARU SPHM", 0.75, 2.5, 3.8, 0.3, { fontSize: 13, bold: true, color: GOLD2 });
  T(s, "1,298", 0.75, 2.95, 3.8, 1.3, { fontSize: 72, bold: true, color: GOLD2, valign: "middle" });
  T(s, "permohonan baharu SPHM diluluskan", 0.75, 4.4, 3.8, 0.7, { fontSize: 20, bold: true, color: WHITE });
  T(s, "sejak PKHNJ 2030 diperkenalkan sehingga 11 November 2026", 0.75, 5.35, 3.8, 1.0, { fontSize: 16, color: "DCE1F5" });
  stat(s, 5.0, 2.2, 2.15, 2.25, "1,743", "pemegang SPHM aktif", { ls: 16 });
  stat(s, 7.35, 2.2, 2.15, 2.25, "4,321", "sijil halal aktif", { ls: 16 });
  stat(s, 5.0, 4.65, 2.15, 2.25, "93%", "permohonan diluluskan dalam 30 hari bekerja", { ls: 16 });
  stat(s, 7.35, 4.65, 2.15, 2.25, "KEDUA", "di Malaysia selepas Selangor", { ls: 16 });

  // ===== 3 =====
  s = slide("LIGHT", "PENSIJILAN HALAL JOHOR MENINGKAT LEBIH LIMA KALI GANDA");
  card(s, 0.5, 2.2, 5.9, 4.7);
  T(s, "PENSIJILAN SPHM BAHARU", 0.75, 2.35, 5.4, 0.3, { fontSize: 14, bold: true, color: GREY });
  s.addChart(pres.charts.BAR, [{ name: "Pensijilan SPHM baharu", labels: ["2024", "2025", "2026*"], values: [133, 561, 737] }], {
    x: 0.65, y: 2.7, w: 5.6, h: 3.7, barDir: "col", chartColors: [NAVY, NAVY, GOLD], barGapWidthPct: 45,
    showValue: true, dataLabelPosition: "outEnd", dataLabelFontSize: 20, dataLabelFontBold: true, dataLabelColor: NAVY, dataLabelFontFace: "+mn-lt",
    catAxisLabelFontSize: 16, catAxisLabelColor: NAVY, catAxisLabelFontFace: "+mn-lt", catAxisLabelFontBold: true,
    valAxisHidden: true, valGridLine: { style: "none" }, catGridLine: { style: "none" }, valAxisMaxVal: 900, valAxisMinVal: 0, showLegend: false,
  });
  T(s, "* 2026: setakat 11 November", 0.75, 6.5, 5.4, 0.3, { fontSize: 12, color: GREY });
  card(s, 6.6, 2.2, 2.9, 2.75, NAVY, "Pencapaian 2026");
  T(s, "88%", 6.8, 2.35, 2.5, 1.0, { fontSize: 54, bold: true, color: GOLD2, valign: "middle" });
  T(s, "daripada sasaran tahunan 2026", 6.8, 3.4, 2.5, 0.7, { fontSize: 16, bold: true, color: WHITE });
  s.addShape(pres.ShapeType.rect, { x: 6.8, y: 4.35, w: 2.5, h: 0.28, fill: { color: "3A4A9A" }, line: { color: "3A4A9A", width: 0 } });
  s.addShape(pres.ShapeType.rect, { x: 6.8, y: 4.35, w: 2.5 * 0.88, h: 0.28, fill: { color: GOLD2 }, line: { color: GOLD2, width: 0 } });
  stat(s, 6.6, 5.15, 2.9, 1.75, "839", "sasaran pensijilan baharu 2026", { vs: 36 });

  // ===== 4 =====
  s = slide("LIGHT", "USAHAWAN BUMIPUTERA SEMAKIN YAKIN MENCEBURI INDUSTRI HALAL");
  const donut = (x, pct, col, head, mid, cap) => {
    card(s, x, 2.2, 4.4, 3.95);
    T(s, head, x + 0.2, 2.35, 4.0, 0.6, { fontSize: 14, bold: true, color: GREY, align: "center" });
    s.addChart(pres.charts.DOUGHNUT, [{ name: "Bumiputera", labels: ["Bumiputera", "Lain-lain"], values: [pct, 100 - pct] }], {
      x: x + 0.85, y: 2.95, w: 2.7, h: 2.7, holeSize: 74, chartColors: [col, "DADFEC"], showLegend: false,
      showLabel: false, showValue: false, showPercent: false, dataBorder: { pt: 0, color: "FFFFFF" },
    });
    T(s, mid, x + 1.2, 3.85, 2.0, 0.9, { fontSize: 26, bold: true, color: col === GOLD ? GOLD : NAVY, align: "center", valign: "middle" });
    T(s, cap, x + 0.2, 5.55, 4.0, 0.55, { fontSize: 14, bold: true, color: NAVY, align: "center" });
  };
  donut(0.5, 77.6, GOLD, "SYARIKAT BAHARU 2026 (441 memohon melalui JAINJ)", "77.6%", "342 syarikat ialah usahawan Bumiputera");
  donut(5.1, 38, NAVY, "PEMEGANG SIJIL SEDIA ADA", "38%", "ialah usahawan Bumiputera");
  card(s, 0.5, 6.3, 9.0, 0.6, NAVY, "Nota");
  T(s, "77.6% ialah bahagian daripada 441 syarikat baharu, bukan seluruh pemegang sijil", 0.7, 6.3, 8.6, 0.6, { fontSize: 14, bold: true, color: WHITE, valign: "middle" });

  // ===== 5 =====
  s = slide("LIGHT", "HALAL BUKAN SEKADAR LABEL, TETAPI JAMINAN BERSIH, SELAMAT DAN BERKUALITI");
  [["BERSIH", "clean"], ["SELAMAT", "safe"], ["BERKUALITI", "qual"]].forEach(([l, k], i) => {
    const x = 0.5 + i * 3.05;
    card(s, x, 2.2, 2.9, 1.5);
    circleIcon(s, ic[k], x + 0.2, 2.65, 0.75, NAVY);
    T(s, l, x + 1.1, 2.65, 1.75, 0.75, { fontSize: 18, bold: true, valign: "middle" });
  });
  T(s, "Halalan Toyyiban: daripada bahan mentah hinggalah ke pinggan rakyat", 0.5, 3.85, 9.0, 0.5, { fontSize: 16, color: GREY, valign: "middle" });
  card(s, 0.5, 4.5, 9.0, 1.7, NAVY, "Peluang global");
  T(s, "USD2.60 TRILION", 0.7, 4.7, 3.9, 0.6, { fontSize: 26, bold: true, color: GOLD2, valign: "middle" });
  T(s, "Perbelanjaan pengguna Muslim global, 2024", 0.7, 5.35, 3.9, 0.7, { fontSize: 14, color: WHITE });
  T(s, "➜", 4.6, 4.7, 0.8, 1.2, { fontSize: 40, bold: true, color: WHITE, align: "center", valign: "middle" });
  T(s, "USD3.56 TRILION", 5.4, 4.7, 4.0, 0.6, { fontSize: 26, bold: true, color: GOLD2, valign: "middle" });
  T(s, "Unjuran menjelang 2029", 5.4, 5.35, 3.9, 0.7, { fontSize: 14, color: WHITE });
  s.addShape(pres.ShapeType.rect, { x: 0.5, y: 6.35, w: 9.0, h: 0.55, fill: { color: WHITE }, line: { color: RED, width: 2 }, objectName: "Indeks" });
  T(s, "MALAYSIA KEKAL DI KEDUDUKAN PERTAMA INDEKS EKONOMI ISLAM GLOBAL", 0.6, 6.35, 8.8, 0.55, { fontSize: 14, bold: true, color: NAVY, align: "center", valign: "middle" });

  // ===== 6a =====
  s = slide("LIGHT", "PKHNJ 2030 MENJADI PEMACU PEMBANGUNAN INDUSTRI HALAL JOHOR", "Pelan dan Pendekatan");
  const line = (x, y, w, h, flipV) => s.addShape(pres.ShapeType.line, { x, y, w, h, flipV: !!flipV, line: { color: NAVY, width: 2 } });
  line(3.5, 2.825, 0.85, 0.525); line(5.65, 2.825, 0.85, 0.525, true);
  line(3.5, 4.65, 0.85, 0.575, true); line(5.65, 4.65, 0.85, 0.575);
  s.addShape(pres.ShapeType.ellipse, { x: 4.05, y: 3.05, w: 1.9, h: 1.9, fill: { color: NAVY }, line: { color: GOLD2, width: 3 }, objectName: "Hub" });
  T(s, "PKHNJ\n2030", 4.05, 3.05, 1.9, 1.9, { fontSize: 22, bold: true, color: WHITE, align: "center", valign: "middle" });
  stat(s, 0.5, 2.2, 3.0, 1.25, "7", "hala tuju strategik", { vs: 30, ls: 14 });
  stat(s, 6.5, 2.2, 3.0, 1.25, "21", "inisiatif", { vs: 30, ls: 14 });
  stat(s, 0.5, 4.6, 3.0, 1.25, "33", "agensi dalam Taskforce PKHNJ 2030", { vs: 30, ls: 14 });
  stat(s, 6.5, 4.6, 3.0, 1.25, "JAINJ", "sebagai urus setia", { vs: 30, ls: 14 });
  stat(s, 0.5, 6.05, 4.4, 0.85, "", "", { card: true });
  T(s, [{ text: "7 DISEMBER 2025", options: { bold: true, fontSize: 18, breakLine: true } }, { text: "Dipralancarkan oleh YAB Menteri Besar", options: { fontSize: 14, color: GREY } }], 0.65, 6.05, 4.1, 0.85, { valign: "middle" });
  card(s, 5.1, 6.05, 4.4, 0.85);
  T(s, [{ text: "25 FEBRUARI 2026", options: { bold: true, fontSize: 18, breakLine: true } }, { text: "Diluluskan MMK Negeri", options: { fontSize: 14, color: GREY } }], 5.25, 6.05, 4.1, 0.85, { valign: "middle" });

  // ===== 6b =====
  s = slide("LIGHT", "JHDC MENGGERAKKAN PKHNJ 2030 MELALUI TIGA PERANAN");
  T(s, "Johor Halal Development Corporation (JHDC), anak syarikat PIJ Holdings", 0.5, 2.05, 9, 0.3, { fontSize: 14, bold: true, color: GREY });
  [["AGENSI FASILITASI HALAL NEGERI JOHOR", "Membimbing pemohon dan memberi sokongan teknikal"],
   ["PENYELARAS PKHNJ 2030", "Menyelaras 21 inisiatif, memantau KPI dan laporan kemajuan"],
   ["PLATFORM EKOSISTEM HALAL", "Menghubungkan industri dengan agensi, institusi latihan, pelabur dan pembiaya"]].forEach(([a, b], i) => {
    const y = 2.45 + i * 1.3;
    card(s, 0.5, y, 5.9, 1.2);
    s.addShape(pres.ShapeType.ellipse, { x: 0.65, y: y + 0.3, w: 0.6, h: 0.6, fill: { color: NAVY }, line: { color: NAVY, width: 0 } });
    T(s, String(i + 1), 0.65, y + 0.3, 0.6, 0.6, { fontSize: 22, bold: true, color: GOLD2, align: "center", valign: "middle" });
    T(s, [{ text: a, options: { bold: true, fontSize: 15, breakLine: true } }, { text: b, options: { fontSize: 14, color: GREY } }], 1.4, y, 4.9, 1.2, { valign: "middle" });
  });
  ph(s, 6.6, 2.45, 2.9, 3.8, "YB Exco bersama JHDC / majlis PKHNJ 2030");
  s.addShape(pres.ShapeType.rect, { x: 0.5, y: 6.4, w: 9.0, h: 0.5, fill: { color: WHITE }, line: { color: RED, width: 2 }, objectName: "Nota Kuasa" });
  T(s, "Kuasa pensijilan kekal pada JAINJ dan JAKIM", 0.6, 6.4, 8.8, 0.5, { fontSize: 16, bold: true, align: "center", valign: "middle" });

  // ===== 7 =====
  s = slide("LIGHT", "PENIAGA KECIL TURUT DIBIMBING MENYERTAI INDUSTRI HALAL", "Pendekatan Pertama");
  T(s, "PENDEKATAN PERTAMA: HALAL SAMPAI KEPADA PENIAGA KECIL", 0.5, 2.05, 9, 0.28, { fontSize: 12, bold: true, color: RED });
  stat(s, 0.5, 2.45, 2.9, 1.95, "RM500,000", "MAINJ membantu dokumentasi pensijilan halal", { vs: 28 });
  stat(s, 3.55, 2.45, 2.9, 1.95, "500", "peniaga mikro dan kecil dibantu; 44 di bawah PBT telah mula dibantu", { vs: 34, ls: 13 });
  card(s, 6.6, 2.45, 2.9, 1.95);
  s.addShape(pres.ShapeType.rect, { x: 6.75, y: 2.58, w: 2.1, h: 0.28, fill: { color: RED }, line: { color: RED, width: 0 } });
  T(s, "PERANCANGAN 2027", 6.75, 2.58, 2.1, 0.28, { fontSize: 12, bold: true, color: WHITE, align: "center", valign: "middle" });
  T(s, "40", 6.75, 2.9, 2.6, 0.62, { fontSize: 34, bold: true, color: GOLD, valign: "middle" });
  T(s, "usahawan medan selera akan dibimbing (peruntukan PIJ)", 6.75, 3.55, 2.65, 0.8, { fontSize: 13 });
  card(s, 0.5, 4.6, 5.6, 2.3);
  T(s, "LATIHAN KESEDARAN HALAL", 0.7, 4.72, 5.2, 0.3, { fontSize: 13, bold: true, color: RED });
  T(s, "Hampir 3,000 peserta tahun ini", 0.7, 5.05, 5.2, 0.4, { fontSize: 20, bold: true });
  ["MBJB", "MBPG", "MPKu", "MBIP", "JAINJ", "JHDC", "UTM", "JT Lab"].forEach((c, i) => {
    const x = 0.7 + (i % 4) * 1.3, y = 5.65 + Math.floor(i / 4) * 0.62;
    s.addShape(pres.ShapeType.roundRect, { x, y, w: 1.2, h: 0.5, rectRadius: 0.08, fill: { color: LIGHT }, line: { color: LIGHT, width: 0 } });
    T(s, c, x, y, 1.2, 0.5, { fontSize: 15, bold: true, align: "center", valign: "middle" });
  });
  ph(s, 6.3, 4.6, 3.2, 2.3, "Peniaga kecil / medan selera");

  // ===== 8 =====
  s = slide("LIGHT", "USAHA HALAL DIPERLUAS DARI MEDAN SELERA HINGGA KE SEKOLAH");
  const panels = [
    ["HALAL KOTEJ – JT LAB", "Usahawan asnaf dan peniaga", "285", "peserta dibimbing 2026", ["KEJORA, Jabatan Pertanian", "YAPEIM dan masjid"]],
    ["KANTIN SEKOLAH AGAMA JOHOR", "Kantin sekolah", "129/133", "kantin bersijil halal 2026", ["4 lagi dalam audit", "2025: 154 kantin, RM462,000 PIJ"]],
    ["JAMINAN SUMBER MAKANAN", "Rumah sembelihan", "43", "rumah sembelihan bersijil halal", ["2 lagi dalam tindakan", "50 dapur KEMAS: semakan dokumen"]],
  ];
  panels.forEach(([hd, pl, big, lab, bl], i) => {
    const x = 0.5 + i * 3.05;
    card(s, x, 2.2, 2.9, 4.7);
    s.addShape(pres.ShapeType.rect, { x, y: 2.2, w: 2.9, h: 0.65, fill: { color: NAVY }, line: { color: NAVY, width: 0 } });
    T(s, hd, x + 0.12, 2.2, 2.66, 0.65, { fontSize: 14, bold: true, color: WHITE, align: "center", valign: "middle" });
    ph(s, x + 0.12, 3.0, 2.66, 1.2, pl);
    T(s, big, x + 0.12, 4.3, 2.66, 0.7, { fontSize: 36, bold: true, color: GOLD, align: "center", valign: "middle" });
    T(s, lab, x + 0.12, 5.0, 2.66, 0.5, { fontSize: 14, bold: true, align: "center" });
    T(s, bl.map((t, j) => ({ text: t, options: { bullet: true, breakLine: j < bl.length - 1 } })), x + 0.2, 5.55, 2.5, 1.25, { fontSize: 14, color: GREY, paraSpaceAfter: 4 });
  });

  // ===== 9 =====
  s = slide("LIGHT", "PENSIJILAN HALAL MEMBUKA PELUANG JOHOR KE PASARAN ANTARABANGSA", "Pendekatan Kedua");
  T(s, "PENDEKATAN KEDUA: HALAL MEMBUKA PASARAN DUNIA", 0.5, 2.05, 9, 0.28, { fontSize: 12, bold: true, color: RED });
  stat(s, 0.5, 2.45, 4.4, 1.3, "15 HARI", "Halal Green Lane: sijil boleh diluluskan dalam 15 hari bekerja", { vs: 30, ls: 13, fill: NAVY, pad: 0.2 });
  stat(s, 5.1, 2.45, 4.4, 1.3, "42 PRODUK", "memperoleh SPHM: PRefChem, Pengerang", { vs: 30, ls: 13, fill: NAVY, pad: 0.2 });
  // route
  card(s, 0.5, 3.9, 9.0, 0.95);
  s.addShape(pres.ShapeType.ellipse, { x: 0.7, y: 4.02, w: 0.7, h: 0.7, fill: { color: RED }, line: { color: RED, width: 0 } });
  T(s, "JOHOR", 1.5, 4.02, 1.2, 0.7, { fontSize: 18, bold: true, valign: "middle" });
  T(s, "➜", 2.6, 4.02, 0.7, 0.7, { fontSize: 28, bold: true, color: GOLD, align: "center", valign: "middle" });
  [["INDONESIA", 3.4], ["INDIA", 5.55], ["RANTAU", 7.45]].forEach(([c, x], i) => {
    const w = i === 0 ? 1.95 : i === 1 ? 1.75 : 1.8;
    s.addShape(pres.ShapeType.roundRect, { x, y: 4.07, w, h: 0.6, rectRadius: 0.1, fill: { color: NAVY }, line: { color: NAVY, width: 0 } });
    T(s, c, x, 4.07, w, 0.6, { fontSize: 16, bold: true, color: WHITE, align: "center", valign: "middle" });
  });
  [["PRefChem", ["Beroperasi di Pengerang", "SPHM bagi 42 produk", "Indonesia wajibkan halal produk kimia mulai 18 Okt 2026", "Bersedia jadi pembekal petrokimia halal ke Indonesia dan rantau"]],
   ["Colorcon Malaysia", ["Syarikat multinasional dari Amerika Syarikat", "SPHM melalui bimbingan JHDC", "Menembusi pasaran Indonesia dan India"]]].forEach(([n, b], i) => {
    const x = 0.5 + i * 4.6;
    card(s, x, 5.0, 4.4, 1.9);
    T(s, n, x + 0.2, 5.08, 4.0, 0.3, { fontSize: 15, bold: true, color: RED });
    T(s, b.map((t, j) => ({ text: t, options: { bullet: true, breakLine: j < b.length - 1 } })), x + 0.2, 5.42, 4.05, 1.45, { fontSize: 13, color: NAVY, paraSpaceAfter: 2 });
  });

  // ===== 10 =====
  s = slide("LIGHT", "JOHOR MEREKODKAN RM790.91 JUTA PELABURAN INDUSTRI HALAL");
  card(s, 0.5, 2.2, 9.0, 1.75, NAVY, "Hero");
  T(s, "PELABURAN DILULUSKAN SEHINGGA JUN 2026", 0.75, 2.32, 5, 0.3, { fontSize: 13, bold: true, color: GOLD2 });
  T(s, "RM790.91 JUTA", 0.75, 2.7, 5.2, 0.95, { fontSize: 44, bold: true, color: GOLD2, valign: "middle" });
  T(s, "27 PROJEK", 6.1, 2.65, 3.2, 0.6, { fontSize: 28, bold: true, color: WHITE, valign: "middle" });
  T(s, "Kedudukan kedua di peringkat nasional", 6.1, 3.25, 3.2, 0.6, { fontSize: 14, color: WHITE });
  ["Paris Baguette Halal Hub, Nusajaya", "Ellaziq, Simpang Renggam"].forEach((t, i) => {
    const x = 0.5 + i * 4.6;
    card(s, x, 4.1, 4.4, 0.7);
    T(s, [{ text: "Contoh: ", options: { color: GREY } }, { text: t, options: { bold: true } }], x + 0.15, 4.1, 4.1, 0.7, { fontSize: 14, valign: "middle" });
  });
  card(s, 0.5, 5.0, 9.0, 1.9);
  T(s, "TAMAN HALMAS, POIC TANJUNG LANGSAT: PELABURAN DIREALISASIKAN", 0.7, 5.1, 5.6, 0.5, { fontSize: 13, bold: true, color: RED });
  T(s, "RM2.256 BILION", 0.7, 5.65, 2.9, 0.55, { fontSize: 24, bold: true, color: GOLD, valign: "middle" });
  T(s, "pelaburan direalisasikan", 0.7, 6.25, 2.9, 0.4, { fontSize: 14 });
  T(s, "2,342", 3.6, 5.65, 2.2, 0.55, { fontSize: 24, bold: true, color: GOLD, valign: "middle" });
  T(s, "peluang pekerjaan diwujudkan", 3.6, 6.25, 2.5, 0.5, { fontSize: 14 });
  ph(s, 6.5, 5.1, 2.8, 1.7, "Kilang / Taman HALMAS");

  // ===== 11a =====
  s = slide("LIGHT", "INDUSTRI HALAL MELAHIRKAN TENAGA KERJA MAHIR JOHOR", "Pendekatan Ketiga");
  T(s, "PENDEKATAN KETIGA: HALAL MENCIPTA PEKERJAAN", 0.5, 2.05, 9, 0.28, { fontSize: 12, bold: true, color: RED });
  card(s, 0.5, 2.45, 4.3, 2.4, NAVY, "Hero");
  T(s, "3,384", 0.7, 2.6, 3.9, 1.1, { fontSize: 60, bold: true, color: GOLD2, valign: "middle" });
  T(s, "peserta dilatih dalam bidang halal pada tahun 2026 melalui enam penyedia latihan", 0.7, 3.8, 3.9, 0.95, { fontSize: 15, color: WHITE });
  card(s, 5.0, 2.45, 4.5, 2.4);
  T(s, "SUBSIDI LATIHAN PROFESIONAL (PIJ)", 5.2, 2.58, 4.1, 0.3, { fontSize: 13, bold: true, color: RED });
  T(s, "50%", 5.2, 2.95, 1.6, 0.8, { fontSize: 40, bold: true, color: GOLD, valign: "middle" });
  T(s, "subsidi yuran", 5.2, 3.75, 1.6, 0.4, { fontSize: 14 });
  T(s, "RM1,650", 6.8, 2.95, 2.6, 0.8, { fontSize: 36, bold: true, color: GOLD, valign: "middle" });
  T(s, "setiap peserta daripada yuran RM3,300", 6.8, 3.75, 2.6, 0.6, { fontSize: 14 });
  T(s, "116 peserta menerima manfaat", 5.2, 4.3, 4.1, 0.4, { fontSize: 16, bold: true });
  card(s, 0.5, 5.05, 5.7, 1.85);
  T(s, "Eksekutif Halal dan Juruaudit Dalaman Halal; graduan UTM, UTHM dan KUIJSI dipadankan terus dengan industri bersama JTDC", 0.7, 5.05, 5.3, 1.85, { fontSize: 15, valign: "middle" });
  ph(s, 6.4, 5.05, 3.1, 1.85, "Latihan profesional halal");

  // ===== 11b =====
  s = slide("LIGHT", "TVET HALAL MELATIH ANAK ASNAF MENJADI TENAGA KERJA MAHIR");
  card(s, 0.5, 2.2, 4.4, 2.0, NAVY, "Hero");
  T(s, "70", 0.7, 2.25, 1.5, 0.9, { fontSize: 48, bold: true, color: GOLD2, valign: "middle" });
  T(s, "peserta asnaf dilatih sehingga November 2026 (pembiayaan MAINJ)", 2.1, 2.3, 2.7, 0.95, { fontSize: 14, color: WHITE, valign: "middle" });
  T(s, "78.6%", 0.7, 3.2, 2.1, 0.9, { fontSize: 44, bold: true, color: GOLD2, valign: "middle" });
  T(s, "55 orang telah bekerja", 2.8, 3.2, 2.0, 0.9, { fontSize: 14, bold: true, color: WHITE, valign: "middle" });
  ph(s, 5.1, 2.2, 4.4, 2.0, "Peserta TVET Halal");
  const bar = (y, tag, sub, segs, legend) => {
    card(s, 0.5, y, 9.0, 1.25);
    T(s, tag, 0.7, y + 0.15, 2.3, 0.4, { fontSize: 15, bold: true, valign: "middle" });
    T(s, sub, 0.7, y + 0.55, 2.3, 0.4, { fontSize: 14, color: GREY });
    if (legend) T(s, legend, 3.1, y + 0.88, 6.2, 0.3, { fontSize: 13, color: GREY });
    let x = 3.1; const full = 6.2;
    segs.forEach(([p, col, tx, tc]) => {
      const w = full * p / 100;
      s.addShape(pres.ShapeType.rect, { x, y: y + 0.2, w, h: 0.6, fill: { color: col }, line: { color: WHITE, width: 1 } });
      T(s, tx, x, y + 0.2, w, 0.6, { fontSize: 14, bold: true, color: tc, align: "center", valign: "middle" });
      x += w;
    });
  };
  bar(4.4, "KOHORT 1", "20 peserta", [[100, GOLD, "100% penempatan pekerjaan", WHITE]]);
  bar(5.7, "KOHORT 2", "50 peserta", [[70, GOLD, "70% bekerja", WHITE], [20, NAVY, "20% praktikal", WHITE], [10, "6B74A3", "10%", WHITE]], "70% bekerja  |  20% latihan praktikal  |  10% melanjutkan pengajian");

  // ===== 12a =====
  s = slide("LIGHT", "USAHAWAN JOHOR DIBIMBING MENJADI PEMAIN INDUSTRI HALAL YANG BERDAYA SAING", "Pendekatan Keempat");
  T(s, "PENDEKATAN KEEMPAT: USAHAWAN TEMPATAN MENJADI JUARA", 0.5, 2.05, 9, 0.28, { fontSize: 12, bold: true, color: RED });
  card(s, 0.5, 2.45, 4.4, 2.1, NAVY, "Hero");
  T(s, "HALAL CHAMPION JOHOR", 0.7, 2.55, 4.0, 0.3, { fontSize: 14, bold: true, color: GOLD2 });
  T(s, "20", 0.7, 2.9, 1.4, 0.9, { fontSize: 54, bold: true, color: GOLD2, valign: "middle" });
  T(s, "PMKS jenama asal Johor", 2.1, 2.9, 2.7, 0.9, { fontSize: 16, bold: true, color: WHITE, valign: "middle" });
  T(s, "Dirintis TWRJ, digerakkan bersama PUJB", 0.7, 3.85, 4.0, 0.6, { fontSize: 13, color: "DCE1F5" });
  ph(s, 5.1, 2.45, 4.4, 2.1, "Usahawan Halal Champion");
  T(s, "LIMA ASPEK INTERVENSI", 0.5, 4.7, 9, 0.3, { fontSize: 14, bold: true, color: GREY });
  [["cert", "Pensijilan halal"], ["fin", "Pembiayaan"], ["brand", "Penjenamaan"], ["pack", "Pembungkusan"], ["mkt", "Pemasaran"]].forEach(([k, t], i) => {
    const x = 0.5 + i * 1.84;
    card(s, x, 5.05, 1.7, 1.35);
    circleIcon(s, ic[k], x + 0.6, 5.15, 0.5, NAVY);
    T(s, t, x + 0.05, 5.72, 1.6, 0.6, { fontSize: 13, bold: true, align: "center", valign: "middle" });
  });
  T(s, "10 daripada 12 syarikat yang dinilai telah mencatat kemajuan", 0.5, 6.5, 9, 0.4, { fontSize: 16, bold: true, align: "center", valign: "middle" });

  // ===== 12b =====
  s = slide("LIGHT", "JUALAN USAHAWAN HALAL CHAMPION MENINGKAT");
  const sales = [["136%", "S'mores by Alkaff", "mikro kepada syarikat kecil"], ["62%", "Elham-Q Edible Oil", "syarikat kecil"], ["50%", "WE1", "syarikat kecil"],
    ["12.6%", "Salleh Food Industries", "syarikat sederhana"], ["11%", "ADIN Marketing Group", "syarikat sederhana"]];
  sales.forEach(([v, n, d], i) => {
    const r = Math.floor(i / 3), c = i % 3;
    const w = r === 0 ? 2.9 : 4.4, x = r === 0 ? 0.5 + c * 3.05 : 0.5 + c * 4.6, y = 2.2 + r * 2.4;
    card(s, x, y, w, 2.25, r === 0 ? NAVY : WHITE);
    T(s, "JUALAN MENINGKAT", x + 0.2, y + 0.15, w - 0.4, 0.3, { fontSize: 12, bold: true, color: r === 0 ? "DCE1F5" : GREY });
    T(s, v, x + 0.2, y + 0.5, w - 0.4, 0.95, { fontSize: 50, bold: true, color: r === 0 ? GOLD2 : GOLD, valign: "middle" });
    T(s, [{ text: n, options: { bold: true, fontSize: 16, breakLine: true } }, { text: d, options: { fontSize: 13, color: r === 0 ? "DCE1F5" : GREY } }], x + 0.2, y + 1.5, w - 0.4, 0.7, { color: r === 0 ? WHITE : NAVY });
  });
  // replace right-hand card of row 2 with placeholder visually: handled by overlay above

  // ===== 12c =====
  s = slide("LIGHT", "JENAMA JOHOR MELUASKAN RANGKAIAN DAN MASUK PASARAN EKSPORT");
  const net = [["55", "cawangan", "KOPI RAKYAT", "Rangkaian bertambah"], ["RM40 JUTA+", "jualan", "MUIZ HOT CHICKEN", "Sasar 50 ejen baharu (pembiayaan Bank Islam: i-TEKAD, i-BANGKIT)"],
    ["3 NEGARA", "Jepun, Sudan, Bangladesh", "ELHAM-Q", "Eksport"], ["SINGAPURA", "pasaran eksport", "HIJRAH WATER", "Eksport"]];
  net.forEach(([v, l, n, d], i) => {
    const x = 0.5 + (i % 2) * 4.6, y = 2.2 + Math.floor(i / 2) * 2.2;
    card(s, x, y, 4.4, 2.05);
    T(s, n, x + 0.2, y + 0.15, 4.0, 0.3, { fontSize: 14, bold: true, color: RED });
    T(s, v, x + 0.2, y + 0.45, 4.0, 0.75, { fontSize: i === 0 ? 48 : 34, bold: true, color: GOLD, valign: "middle" });
    T(s, l, x + 0.2, y + 1.2, 4.0, 0.35, { fontSize: 16, bold: true });
    T(s, d, x + 0.2, y + 1.5, 4.0, 0.5, { fontSize: 13, color: GREY });
  });
  T(s, "Halal Sukses bersama KUSKOP terus membimbing PMKS Johor memperoleh pensijilan halal", 0.5, 6.65, 9, 0.3, { fontSize: 13, color: GREY, align: "center", valign: "middle" });

  // ===== 13 =====
  s = slide("LIGHT", "LEBIH RM1.3 JUTA GERAN UNTUK MEMPERKASA EKOSISTEM HALAL", "Pendekatan Kelima");
  card(s, 0.5, 2.2, 9.0, 1.05, NAVY, "Hero");
  T(s, "LEBIH RM1.3 JUTA", 0.75, 2.2, 5.0, 1.05, { fontSize: 38, bold: true, color: GOLD2, valign: "middle" });
  T(s, "geran melalui MAINJ dan PIJ", 5.5, 2.2, 3.8, 1.05, { fontSize: 18, bold: true, color: WHITE, valign: "middle", align: "right" });
  [["MAINJ", "RM500,000", "Membantu 500 peniaga mikro dan kecil menyediakan dokumentasi pensijilan halal", false],
   ["PIJ", "RM200,000", "Subsidi 50% yuran kursus profesional halal", false],
   ["PIJ", "RM462,000", "Pensijilan halal bagi 154 kantin SAKJ", false],
   ["PIJ", "RM200,000", "Bagi 40 usahawan medan selera pada tahun 2027", true]].forEach(([a, v, d, f], i) => {
    const x = 0.5 + (i % 2) * 4.6, y = 3.45 + Math.floor(i / 2) * 1.8;
    card(s, x, y, 4.4, 1.65);
    s.addShape(pres.ShapeType.roundRect, { x: x + 0.2, y: y + 0.12, w: 0.9, h: 0.3, rectRadius: 0.06, fill: { color: NAVY }, line: { color: NAVY, width: 0 } });
    T(s, a, x + 0.2, y + 0.12, 0.9, 0.3, { fontSize: 12, bold: true, color: WHITE, align: "center", valign: "middle" });
    if (f) {
      s.addShape(pres.ShapeType.roundRect, { x: x + 1.2, y: y + 0.12, w: 1.95, h: 0.3, rectRadius: 0.06, fill: { color: RED }, line: { color: RED, width: 0 } });
      T(s, "PERANCANGAN 2027", x + 1.2, y + 0.12, 1.95, 0.3, { fontSize: 11, bold: true, color: WHITE, align: "center", valign: "middle" });
    }
    T(s, v, x + 0.2, y + 0.45, 4.0, 0.55, { fontSize: 28, bold: true, color: GOLD, valign: "middle" });
    T(s, d, x + 0.2, y + 1.02, 4.0, 0.6, { fontSize: 13 });
  });

  // ===== 14 =====
  s = slide("DARK", "JOHOR MENYASARKAN INDUSTRI HALAL BERNILAI TINGGI MENJELANG 2030", "Sasaran dan Penutup");
  const tg = [["5,000", "syarikat baharu bersijil halal"], ["4,000", "tenaga kerja mahir halal"], ["RM5 BILION", "pelaburan terkumpul"]];
  tg.forEach(([v, l], i) => {
    const x = 0.5 + i * 3.05;
    s.addShape(pres.ShapeType.rect, { x, y: 2.3, w: 2.9, h: 1.9, fill: { color: "26378F" }, line: { color: GOLD2, width: 1.5 }, objectName: "Sasaran" });
    T(s, v, x + 0.1, 2.45, 2.7, 0.8, { fontSize: i === 2 ? 28 : 36, bold: true, color: GOLD2, align: "center", valign: "middle" });
    T(s, l, x + 0.15, 3.3, 2.6, 0.8, { fontSize: 15, bold: true, color: WHITE, align: "center" });
  });
  [["RM18 BILION", "eksport halal"], ["RM24 BILION", "sumbangan kepada KDNK negeri"]].forEach(([v, l], i) => {
    const x = 0.5 + i * 4.6;
    s.addShape(pres.ShapeType.rect, { x, y: 4.4, w: 4.4, h: 1.7, fill: { color: "26378F" }, line: { color: GOLD2, width: 1.5 }, objectName: "Sasaran" });
    T(s, v, x + 0.1, 4.55, 4.2, 0.8, { fontSize: 34, bold: true, color: GOLD2, align: "center", valign: "middle" });
    T(s, l, x + 0.15, 5.4, 4.1, 0.6, { fontSize: 15, bold: true, color: WHITE, align: "center" });
  });
  T(s, "SASARAN MENJELANG 2030 (belum dicapai). Setakat ini: 1,298 syarikat baharu bersijil, iaitu 26% daripada sasaran 5,000", 0.5, 6.3, 9, 0.65, { fontSize: 14, color: "DCE1F5", align: "center", valign: "middle" });

  // ===== 15 =====
  s = slide("DARK", "HALAL BUKAN SEKADAR SIJIL");
  [["home", "Makanan yang bersih dan selamat untuk keluarga"], ["store", "Pasaran yang lebih luas untuk usahawan"],
   ["grad", "Pekerjaan untuk anak muda"], ["help", "Kesejahteraan untuk seluruh rakyat Johor"]].forEach(([k, t], i) => {
    const x = 0.5 + (i % 2) * 4.6, y = 2.35 + Math.floor(i / 2) * 1.75;
    s.addShape(pres.ShapeType.roundRect, { x, y, w: 4.4, h: 1.55, rectRadius: 0.1, fill: { color: WHITE }, line: { color: WHITE, width: 0 }, objectName: "Mesej" });
    s.addShape(pres.ShapeType.ellipse, { x: x + 0.2, y: y + 0.4, w: 0.75, h: 0.75, fill: { color: LIGHT }, line: { color: LIGHT, width: 0 } });
    s.addImage({ data: ic[k], x: x + 0.2 + 0.2, y: y + 0.4 + 0.2, w: 0.35, h: 0.35 });
    T(s, t, x + 1.15, y, 3.1, 1.55, { fontSize: 17, bold: true, valign: "middle" });
  });
  s.addShape(pres.ShapeType.rect, { x: 0.5, y: 5.95, w: 9.0, h: 0.95, fill: { color: "26378F" }, line: { color: GOLD2, width: 1.5 }, objectName: "Komitmen" });
  T(s, "KOMITMEN KERAJAAN NEGERI JOHOR UNTUK TERUS MEMPERKASA INDUSTRI HALAL", 0.7, 5.95, 8.6, 0.95, { fontSize: 18, bold: true, color: GOLD2, align: "center", valign: "middle" });

  // ===== APPENDIX 16 =====
  s = slide("LIGHT", "LAMPIRAN: PENSIJILAN HALAL BAHARU DI NEGERI JOHOR", "Lampiran");
  const hd = (t, al) => ({ text: t, options: { bold: true, color: WHITE, fill: { color: NAVY }, fontSize: 16, align: al || "left" } });
  const cell = (t, o = {}) => ({ text: t, options: Object.assign({ fontSize: 16, color: NAVY, fill: { color: WHITE } }, o) });
  s.addTable([
    [hd("Tahun"), hd("Pensijilan SPHM Baharu", "center"), hd("Catatan")],
    [cell("2024", { bold: true }), cell("133", { align: "center", bold: true }), cell("Sebelum PKHNJ 2030")],
    [cell("2025", { bold: true }), cell("561", { align: "center", bold: true }), cell("-")],
    [cell("2026 (11 Nov)", { bold: true }), cell("737", { align: "center", bold: true }), cell("88% daripada sasaran 839")],
    [cell("Jumlah sejak PKHNJ 2030", { bold: true, fill: { color: "FFF4CC" } }), cell("1,298", { align: "center", bold: true, fill: { color: "FFF4CC" } }), cell("26% daripada sasaran 5,000", { bold: true, fill: { color: "FFF4CC" } })],
  ], { x: 0.5, y: 2.4, w: 9.0, colW: [3.4, 2.4, 3.2], rowH: 0.75, valign: "middle", border: { type: "solid", color: "C9CFE6", pt: 1 }, margin: [0, 0.12, 0, 0.12] });

  // ===== 17 =====
  s = slide("LIGHT", "LAMPIRAN: SENARAI HALAL CHAMPION JOHOR (KOHORT 1)");
  const co = ["IM Alkaff", "PIJ Manufacturing Sdn. Bhd.", "We1 Manufacturing (M) Sdn. Bhd.", "Azad Food Industries Sdn. Bhd.", "Ara Yasmeen Enterprise",
    "Salleh Food Industries Sdn. Bhd.", "Elham-Q Edible Oil Sdn. Bhd.", "Faiza Food Industries Sdn. Bhd.", "Usahawan Seri Enterprise", "Mak Siti Products (M) Sdn. Bhd.",
    "Muiz Food Industries Sdn. Bhd.", "Maiz Enterprise Sdn. Bhd.", "Eng's Legacy Sdn. Bhd.", "Hijrah Water Sdn. Bhd.", "Jalen Sdn. Bhd.",
    "Ikhwan Zaini Enterprise", "Sparkles Group Sdn. Bhd.", "ADIN Marketing Group Sdn. Bhd. (Haos Ek)", "Kopi Rakyat Sdn. Bhd.", "Umz Bioline Manufacturer Sdn. Bhd."];
  co.forEach((n, i) => {
    const col = Math.floor(i / 10), r = i % 10, x = 0.5 + col * 4.6, y = 2.2 + r * 0.47;
    s.addShape(pres.ShapeType.rect, { x, y, w: 4.4, h: 0.43, fill: { color: WHITE }, line: { color: "DADFEC", width: 0.75 }, objectName: "Baris" });
    s.addShape(pres.ShapeType.rect, { x, y, w: 0.5, h: 0.43, fill: { color: NAVY }, line: { color: NAVY, width: 0 } });
    T(s, String(i + 1), x, y, 0.5, 0.43, { fontSize: 14, bold: true, color: WHITE, align: "center", valign: "middle" });
    T(s, n, x + 0.6, y, 3.75, 0.43, { fontSize: 14, valign: "middle", fit: "shrink" });
  });

  // ===== 18 =====
  s = slide("LIGHT", "LAMPIRAN: PESERTA LATIHAN HALAL 2026 MENGIKUT PENYEDIA");
  const tr = [["Al Hamra Management Services PLT", 1190, "35.2%"], ["JHDC", 1117, "33.0%"], ["First Wing", 313, "9.2%"], ["DHMovere", 286, "8.5%"], ["JT Lab", 285, "8.4%"], ["UTM", 193, "5.7%"]];
  T(s, "Penyedia Latihan", 0.5, 2.15, 3.2, 0.3, { fontSize: 13, bold: true, color: GREY });
  T(s, "Peserta", 3.7, 2.15, 1.0, 0.3, { fontSize: 13, bold: true, color: GREY, align: "right" });
  T(s, "Peratus", 4.8, 2.15, 1.0, 0.3, { fontSize: 13, bold: true, color: GREY, align: "right" });
  tr.forEach(([n, v, p], i) => {
    const y = 2.5 + i * 0.6;
    s.addShape(pres.ShapeType.rect, { x: 0.5, y, w: 9.0, h: 0.52, fill: { color: WHITE }, line: { color: "DADFEC", width: 0.75 }, objectName: "Baris" });
    T(s, n, 0.65, y, 3.0, 0.52, { fontSize: 14, bold: true, valign: "middle", fit: "shrink" });
    T(s, v.toLocaleString("en-US"), 3.7, y, 1.0, 0.52, { fontSize: 15, bold: true, align: "right", valign: "middle" });
    T(s, p, 4.8, y, 1.0, 0.52, { fontSize: 15, bold: true, color: GOLD, align: "right", valign: "middle" });
    s.addShape(pres.ShapeType.rect, { x: 6.05, y: y + 0.12, w: 3.3 * v / 1190, h: 0.28, fill: { color: i === 0 ? NAVY : "3B5BDB" }, line: { color: NAVY, width: 0 } });
  });
  s.addShape(pres.ShapeType.rect, { x: 0.5, y: 6.15, w: 9.0, h: 0.6, fill: { color: NAVY }, line: { color: NAVY, width: 0 }, objectName: "Jumlah" });
  T(s, "Jumlah", 0.65, 6.15, 3.0, 0.6, { fontSize: 16, bold: true, color: WHITE, valign: "middle" });
  T(s, "3,384", 3.7, 6.15, 1.0, 0.6, { fontSize: 16, bold: true, color: GOLD2, align: "right", valign: "middle" });
  T(s, "100%", 4.8, 6.15, 1.0, 0.6, { fontSize: 16, bold: true, color: GOLD2, align: "right", valign: "middle" });

  // ===== 19 =====
  s = slide("LIGHT", "LAMPIRAN: BILANGAN PESERTA BIMBINGAN JT LAB (HALAL KOTEJ) 2026");
  const jt = [["KEJORA (2 bengkel halal)", "60"], ["Jabatan Pertanian", "15"], ["Masjid Batu Pahat (16 Julai)", "20 (anggaran)"], ["YAPEIM", "13"], ["JT Lab", "24"],
    ["JT Lab (3–4 Nov)", "43"], ["JT Lab (17–18 Nov)", "18"], ["JT Lab (19–20 Nov)", "20"], ["JT Lab (21–22 Nov)", "72"]];
  const hd2 = (t, al) => ({ text: t, options: { bold: true, color: WHITE, fill: { color: NAVY }, fontSize: 14, align: al || "left" } });
  const c2 = (t, o = {}) => ({ text: t, options: Object.assign({ fontSize: 14, color: NAVY, fill: { color: WHITE } }, o) });
  s.addTable([
    [hd2("Program / rakan"), hd2("Peserta", "right")],
    ...jt.map(([a, b]) => [c2(a), c2(b, { align: "right", bold: true })]),
    [c2("Jumlah", { bold: true, fill: { color: "FFF4CC" } }), c2("285", { align: "right", bold: true, fill: { color: "FFF4CC" } })],
  ], { x: 0.5, y: 2.2, w: 9.0, colW: [6.4, 2.6], rowH: 0.43, valign: "middle", border: { type: "solid", color: "C9CFE6", pt: 1 }, margin: [0, 0.12, 0, 0.12] });

  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log("done");
})();
