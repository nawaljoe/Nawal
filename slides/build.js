const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const fa = require("react-icons/fa");
const { applyTheme } = require("/root/.claude/skills/synced/73dd325d-3fe3-41c9-87ef-cd0391b3832b_637d1d23-f6c4-4283-91fb-5ad29edf9c34/pptx/scripts/apply_theme.js");

// Palette sampled from the Canva reference (A93_YB FARED)
const NAVY = "1E2A7B", RED = "D0202F", GOLD = "C29A3F", LAV = "EEF0F6", WHITE = "FFFFFF";
const GREY = "5B6275", PHC = "E3E8F5", GOLDT = "F3E7C8";
const LOGO = "/home/user/Nawal/slides/assets/logos.png";
const OUT = "/home/user/Nawal/slides/A93_Halal_Johor_16x9.pptx";

const THEME = {
  name: "Maju Johor Halal", headFontFace: "Arial", bodyFontFace: "Arial",
  colors: { dk1: "1F2937", lt1: "FFFFFF", dk2: NAVY, lt2: LAV, accent1: NAVY, accent2: RED, accent3: GOLD,
    accent4: "323490", accent5: "6B7280", accent6: "D9DCEB", hlink: NAVY, folHlink: "6B7280" },
};

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.333 x 7.5 in = 1920 x 1080 ratio (16:9)
pres.theme = { headFontFace: "Arial", bodyFontFace: "Arial" };
pres.title = "Soalan Lisan A93 - Pensijilan Halal dan Industri Halal Negeri Johor";
pres.author = "Pejabat YB Exco Hal Ehwal Agama Islam Johor";

const W = 13.333, L = 0.6, CW = 12.13, RE = L + CW, CT = 2.45, CB = 6.95, CH = CB - CT;
const FOOT = "Jawapan Soalan Lisan A93  |  Belanjawan Johor 2027  |  26 November 2026";
pres.defineSlideMaster({
  title: "KANDUNGAN", background: { color: WHITE },
  objects: [
    { rect: { x: 0, y: 0, w: 4.4, h: 0.08, fill: { color: RED } } },
    { rect: { x: 4.4, y: 0, w: W - 4.4, h: 0.08, fill: { color: NAVY } } },
    { image: { x: 9.5, y: 0.17, w: 3.2, h: 0.97, path: LOGO } },
    { placeholder: { options: { name: "title", type: "title", x: L, y: 1.2, w: CW, h: 1.1, fontSize: 32, bold: true,
        color: NAVY, align: "left", valign: "middle", margin: 0 }, text: "" } },
    { text: { text: FOOT, options: { x: L, y: 7.12, w: 8, h: 0.28, fontSize: 11, color: GREY, margin: 0 } } },
  ],
  slideNumber: { x: 11.7, y: 7.12, w: 1.03, h: 0.28, fontSize: 11, color: GREY, align: "right" },
});
pres.defineSlideMaster({ title: "PENUTUP", background: { color: WHITE }, objects: [] });

// ---------- helpers ----------
function T(s, text, x, y, w, h, o = {}) {
  s.addText(text, Object.assign({ x, y, w, h, fontSize: 20, color: NAVY, valign: "top", margin: 0, isTextBox: true }, o));
}
function R(s, x, y, w, h, fill, o = {}) {
  s.addShape(pres.ShapeType.rect, Object.assign({ x, y, w, h, fill: { color: fill }, line: { color: fill, width: 0 } }, o));
}
const bl = (arr) => arr.map((t, j) => ({ text: t, options: { bullet: true, breakLine: j < arr.length - 1 } }));
function tab(s, text) {
  const w = 0.45 + text.length * 0.13;
  s.addShape(pres.ShapeType.rect, { x: L, y: 0.28, w, h: 0.44, fill: { color: WHITE }, line: { color: RED, width: 1.5 }, objectName: "Label Seksyen" });
  T(s, text, L, 0.28, w, 0.44, { fontSize: 15, bold: true, align: "center", valign: "middle" });
}
function ph(s, x, y, w, h, label) {
  s.addShape(pres.ShapeType.rect, { x, y, w, h, fill: { color: PHC }, line: { color: "8A94C4", width: 1.5, dashType: "dash" }, objectName: "Ruang Gambar" });
  T(s, [
    { text: "GAMBAR", options: { fontSize: 22, bold: true, color: "5A6499", breakLine: true } },
    { text: label, options: { fontSize: 18, color: "5A6499", breakLine: true } },
    { text: "Ruang gambar sebenar (boleh diganti)", options: { fontSize: 13, italic: true, color: "6B74A3" } },
  ], x + 0.2, y, w - 0.4, h, { align: "center", valign: "middle" });
}
function phBg(s, label) {
  s.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: W, h: 7.5, fill: { color: PHC }, line: { color: "8A94C4", width: 1.5, dashType: "dash" }, objectName: "Ruang Gambar Latar" });
  T(s, "GAMBAR LATAR: " + label + "  (ruang gambar sebenar, boleh diganti)", 1, 7.12, W - 2, 0.3, { fontSize: 12, italic: true, color: "6B74A3", align: "center" });
}
// photo with navy caption box at the bottom (reference style)
function phc(s, x, y, w, h, capH, label, runs) {
  ph(s, x, y, w, h - capH, label);
  R(s, x, y + h - capH, w, capH, NAVY, { objectName: "Kapsyen" });
  T(s, runs, x + 0.25, y + h - capH, w - 0.5, capH, { valign: "middle" });
}
function sub(s, text, x, y, w) { T(s, text, x, y, w, 0.4, { fontSize: 18, bold: true, color: GOLD, valign: "middle" }); }
function tag(s, text, x, y, w, fill = GOLD, color = NAVY) {
  R(s, x, y, w, 0.4, fill);
  T(s, text, x, y, w, 0.4, { fontSize: 16, bold: true, color, align: "center", valign: "middle" });
}
// colored block: big value then label
function nb(s, x, y, w, h, fill, val, label, o = {}) {
  R(s, x, y, w, h, fill, { objectName: "Blok Angka" });
  const vs = o.vs || 48, vh = vs / 72 * 1.3, pad = o.pad ?? 0.3, top = o.top ?? 0.15;
  const light = fill === LAV || fill === GOLD;
  const vc = o.vc || (light ? NAVY : WHITE), lc = o.lc || (light ? NAVY : WHITE);
  T(s, val, x + pad, y + top, w - 2 * pad, vh, { fontSize: vs, bold: true, color: vc, valign: "middle", align: o.align || "left" });
  T(s, label, x + pad, y + top + vh + 0.04, w - 2 * pad, h - top - vh - 0.1, { fontSize: o.ls || 22, color: lc, align: o.align || "left", bold: !!o.lb });
}
async function icon(Comp, color, size = 256) {
  const svg = ReactDOMServer.renderToStaticMarkup(React.createElement(Comp, { color: "#" + color, size: String(size) }));
  return "image/png;base64," + (await sharp(Buffer.from(svg)).png().toBuffer()).toString("base64");
}
let sec = "";
function slide(title, tabText, section) {
  if (section && section !== sec) { pres.addSection({ title: section }); sec = section; }
  const s = pres.addSlide({ masterName: "KANDUNGAN", sectionTitle: sec });
  if (tabText) tab(s, tabText);
  if (title) s.addText(title, { placeholder: "title" });
  return s;
}
function twoBar(s, cx, y, each = 0.9) { R(s, cx - each, y, each, 0.08, RED); R(s, cx, y, each, 0.08, NAVY); }

(async () => {
  const ic = {};
  for (const [k, c, col] of [
    ["clean", fa.FaHandSparkles, WHITE], ["safe", fa.FaShieldAlt, WHITE], ["qual", fa.FaAward, WHITE],
    ["home", fa.FaHome, NAVY], ["store", fa.FaStore, NAVY], ["grad", fa.FaUserGraduate, NAVY], ["help", fa.FaHandsHelping, NAVY],
  ]) ic[k] = await icon(c, col);

  // ===== 1 COVER =====
  pres.addSection({ title: "Pembukaan" }); sec = "Pembukaan";
  let s = pres.addSlide({ masterName: "PENUTUP", sectionTitle: sec });
  phBg(s, "Dewan Negeri Johor (hitam putih, pudar)");
  s.addImage({ path: LOGO, x: 4.67, y: 0.45, w: 4.0, h: 1.21 });
  twoBar(s, W / 2, 1.95);
  T(s, "PENSIJILAN HALAL & INDUSTRI HALAL NEGERI JOHOR", 1.2, 2.15, W - 2.4, 1.6, { fontSize: 44, bold: true, align: "center", valign: "middle" });
  twoBar(s, W / 2, 3.9);
  T(s, "SOALAN LISAN A93", 1, 4.1, W - 2, 0.6, { fontSize: 32, bold: true, align: "center", color: RED });
  T(s, "Dewan Negeri Johor  |  26 November 2026", 1, 4.8, W - 2, 0.5, { fontSize: 24, bold: true, align: "center" });
  T(s, "Soalan daripada:", 1, 5.5, W - 2, 0.4, { fontSize: 20, align: "center", color: GREY });
  T(s, "YB TUAN NG YAK HOWE (BENTAYAN)", 1, 5.95, W - 2, 0.6, { fontSize: 30, bold: true, align: "center", color: "1F2937" });

  // ===== 2 : pencapaian (1,298 + pertumbuhan + Bumiputera + kedudukan kedua) =====
  s = slide(null, "PENCAPAIAN PENSIJILAN", "Pencapaian");
  s.addText([{ text: "PENCAPAIAN PENSIJILAN HALAL JOHOR", options: { breakLine: true } },
             { text: "Usaha kita bukan sahaja menambah bilangan, tetapi juga memudahkan urusan rakyat", options: { fontSize: 20, bold: false, color: GREY } }], { placeholder: "title" });
  const TH = 2.95;
  // col A: hero
  const colA = L, wA = 3.0;
  R(s, colA, CT, wA, TH, NAVY, { objectName: "Hero" });
  T(s, "1,298", colA + 0.2, CT + 0.1, wA - 0.4, 1.1, { fontSize: 60, bold: true, color: GOLD, valign: "middle" });
  T(s, "permohonan baharu SPHM diluluskan", colA + 0.25, CT + 1.25, wA - 0.5, 0.75, { fontSize: 18, bold: true, color: WHITE });
  T(s, "sejak PKHNJ 2030 diperkenalkan sehingga 11 November 2026", colA + 0.25, CT + 2.05, wA - 0.5, 0.8, { fontSize: 14, color: "DCE1F5" });
  // col B: growth chart
  const colB = L + 3.2, wB = 5.6;
  R(s, colB, CT, wB, TH, LAV, { objectName: "Panel Carta" });
  T(s, "PENSIJILAN SPHM BAHARU", colB + 0.25, CT + 0.05, wB - 0.5, 0.35, { fontSize: 16, bold: true });
  s.addChart(pres.charts.BAR, [{ name: "Pensijilan SPHM baharu", labels: ["2024", "2025", "2026*"], values: [133, 561, 737] }], {
    x: colB + 0.1, y: CT + 0.4, w: wB - 0.2, h: 1.85, barDir: "col", chartColors: [NAVY, NAVY, RED], barGapWidthPct: 60,
    showValue: true, dataLabelPosition: "outEnd", dataLabelFontSize: 20, dataLabelFontBold: true, dataLabelColor: NAVY, dataLabelFontFace: "+mn-lt",
    catAxisLabelFontSize: 15, catAxisLabelColor: NAVY, catAxisLabelFontFace: "+mn-lt", catAxisLabelFontBold: true,
    valAxisHidden: true, valGridLine: { style: "none" }, catGridLine: { style: "none" }, valAxisMaxVal: 950, valAxisMinVal: 0, showLegend: false,
  });
  R(s, colB + 0.25, CT + 2.3, wB - 0.5, 0.32, GOLD);
  T(s, "737 = 88% daripada sasaran 839 (*11 Nov)", colB + 0.25, CT + 2.3, wB - 0.5, 0.32, { fontSize: 14, bold: true, align: "center", valign: "middle" });
  T(s, "Lebih 4\u00D7 (2025)  |  Lebih 5\u00D7 (2026) berbanding 2024", colB + 0.25, CT + 2.65, wB - 0.5, 0.28, { fontSize: 14, bold: true, align: "center", valign: "middle" });
  // col C: Bumiputera
  const colC = L + 9.0, wC = CW - 9.0;
  R(s, colC, CT, wC, TH, LAV, { objectName: "Panel Bumiputera" });
  T(s, "USAHAWAN BUMIPUTERA", colC + 0.1, CT + 0.05, wC - 0.2, 0.35, { fontSize: 16, bold: true, align: "center" });
  s.addChart(pres.charts.DOUGHNUT, [{ name: "Bumiputera", labels: ["Bumiputera", "Lain-lain"], values: [77.6, 22.4] }], {
    x: colC + (wC - 1.6) / 2, y: CT + 0.4, w: 1.6, h: 1.6, holeSize: 72, chartColors: [RED, "D9DCEB"], showLegend: false,
    showLabel: false, showValue: false, showPercent: false, dataBorder: { pt: 0, color: "EEF0F6" },
  });
  T(s, "77.6%", colC + wC / 2 - 0.5, CT + 0.9, 1.0, 0.6, { fontSize: 15, bold: true, color: RED, align: "center", valign: "middle" });
  T(s, "342 daripada 441 syarikat baharu 2026 (JAINJ)", colC + 0.15, CT + 2.0, wC - 0.3, 0.45, { fontSize: 13, bold: true, align: "center" });
  R(s, colC + 0.15, CT + 2.5, wC - 0.3, 0.38, NAVY);
  T(s, [{ text: "38% ", options: { fontSize: 18, bold: true, color: GOLD } }, { text: "pemegang sijil sedia ada", options: { fontSize: 13, color: WHITE } }], colC + 0.15, CT + 2.5, wC - 0.3, 0.38, { align: "center", valign: "middle" });
  // bottom row: photo + position stats
  const sy = CT + TH + 0.15, sh = CH - TH - 0.15, sw = (CW - 2.3 - 0.6) / 4;
  ph(s, L, sy, 2.3, sh, "Sijil halal");
  [[GOLD, "KEDUA", "di Malaysia selepas Selangor", 30], [NAVY, "1,743", "pemegang SPHM aktif", 34], [NAVY, "4,321", "sijil halal aktif", 34], [RED, "93%", "diluluskan dalam 30 hari bekerja", 34]].forEach(([f, v, l, vs], i) => {
    nb(s, L + 2.45 + i * (sw + 0.15), sy, sw, sh, f, v, l, { vs, ls: 15, top: 0.1, pad: 0.2 });
  });

  // ===== 6 : bersih selamat berkualiti =====
  s = slide("HALAL BUKAN SEKADAR LABEL, TETAPI JAMINAN BERSIH, SELAMAT DAN BERKUALITI", "KEPENTINGAN HALAL");
  [["BERSIH", "clean"], ["SELAMAT", "safe"], ["BERKUALITI", "qual"]].forEach(([l, k], i) => {
    const y = CT + i * 1.2;
    R(s, L, y, 6.6, 1.1, NAVY, { objectName: "Blok" });
    s.addImage({ data: ic[k], x: L + 0.35, y: y + 0.2, w: 0.7, h: 0.7 });
    T(s, l, L + 1.4, y, 5.0, 1.1, { fontSize: 36, bold: true, color: WHITE, valign: "middle" });
  });
  R(s, L, CT + 3.7, 6.6, 0.8, GOLD);
  T(s, "Halalan Toyyiban: daripada bahan mentah hinggalah ke pinggan rakyat", L + 0.2, CT + 3.7, 6.2, 0.8, { fontSize: 20, bold: true, valign: "middle" });
  ph(s, L + 6.8, CT, CW - 6.8, 2.3, "Produk halal / pemprosesan makanan");
  R(s, L + 6.8, CT + 2.45, CW - 6.8, 2.05, LAV);
  T(s, "Setiap sijil yang dikeluarkan ialah jaminan kepada keluarga di Johor bahawa makanan dan produk yang mereka gunakan disediakan dengan betul.", L + 7.05, CT + 2.45, CW - 7.3, 2.05, { fontSize: 20, bold: true, valign: "middle" });

  // ===== 7 : peluang global =====
  s = slide("PELUANG INDUSTRI HALAL GLOBAL YANG BESAR", "KEPENTINGAN HALAL");
  sub(s, "PERBELANJAAN PENGGUNA MUSLIM GLOBAL", L, CT - 0.05, 8);
  nb(s, L, CT + 0.4, 5.4, 1.9, NAVY, "USD2.60 trilion", "pada tahun 2024", { vs: 40, lb: true, ls: 24 });
  T(s, "➜", L + 5.4, CT + 0.4, CW - 10.8, 1.9, { fontSize: 54, bold: true, color: GOLD, align: "center", valign: "middle" });
  nb(s, RE - 5.4, CT + 0.4, 5.4, 1.9, RED, "USD3.56 trilion", "unjuran menjelang 2029", { vs: 40, lb: true, ls: 24 });
  R(s, L, CT + 2.5, CW, 0.85, GOLD, { objectName: "Indeks" });
  T(s, "Malaysia kekal di kedudukan pertama Indeks Ekonomi Islam Global", L, CT + 2.5, CW, 0.85, { fontSize: 26, bold: true, align: "center", valign: "middle" });
  sub(s, "TUGAS KITA DI JOHOR: MENTERJEMAHKAN KELEBIHAN INI KEPADA", L, CT + 3.45, CW);
  const w7 = (CW - 0.4) / 3;
  ["PELABURAN", "PEKERJAAN", "PENDAPATAN RAKYAT"].forEach((t, i) => {
    R(s, L + i * (w7 + 0.2), CT + 3.9, w7, 0.6, LAV);
    T(s, t, L + i * (w7 + 0.2), CT + 3.9, w7, 0.6, { fontSize: 22, bold: true, align: "center", valign: "middle" });
  });

  // ===== 8 : PKHNJ 2030 + JHDC (satu slide) =====
  s = slide(null, "PKHNJ 2030 DAN JHDC", "Pelan dan Pendekatan");
  s.addText([{ text: "PKHNJ 2030 DAN PERANAN JHDC", options: { breakLine: true } },
             { text: "Pencapaian ini ialah hasil kerjasama banyak pihak", options: { fontSize: 20, bold: false, color: GREY } }], { placeholder: "title" });
  const topH = 2.55;
  // col A: PKHNJ 2030 facts
  const aW = 4.6;
  R(s, L, CT, aW, topH, NAVY, { objectName: "PKHNJ 2030" });
  T(s, "PKHNJ 2030", L + 0.25, CT + 0.08, aW - 0.5, 0.35, { fontSize: 16, bold: true, color: GOLD });
  [["7", "hala tuju strategik"], ["21", "inisiatif"], ["33", "agensi dalam Taskforce"]].forEach(([v, l], i) => {
    const x = L + 0.25 + i * 1.4;
    T(s, v, x, CT + 0.45, 1.3, 0.8, { fontSize: 44, bold: true, color: WHITE, valign: "middle" });
    T(s, l, x, CT + 1.28, 1.3, 0.6, { fontSize: 14, color: "DCE1F5" });
  });
  R(s, L + 0.25, CT + 1.95, aW - 0.5, 0.45, "323490");
  T(s, "JAINJ sebagai urus setia", L + 0.25, CT + 1.95, aW - 0.5, 0.45, { fontSize: 17, bold: true, color: WHITE, align: "center", valign: "middle" });
  // col B: dates
  const bX = L + aW + 0.2, bW = 3.9;
  [["7 DISEMBER 2025", "Dipralancarkan oleh YAB Menteri Besar Johor"], ["25 FEBRUARI 2026", "Diluluskan Majlis Mesyuarat Kerajaan Negeri"]].forEach(([d, t], i) => {
    const y = CT + i * 1.35;
    R(s, bX, y, bW, 1.2, RED);
    T(s, [{ text: d, options: { fontSize: 22, bold: true, breakLine: true } }, { text: t, options: { fontSize: 15 } }], bX + 0.25, y, bW - 0.4, 1.2, { color: WHITE, valign: "middle" });
  });
  // col C: photo
  const cX = bX + bW + 0.2;
  ph(s, cX, CT, RE - cX, topH, "Majlis pra-pelancaran PKHNJ 2030");
  // JHDC
  R(s, L, CT + 2.7, CW, 0.4, GOLD);
  T(s, [{ text: "JHDC  ", options: { fontSize: 17, bold: true } }, { text: "Johor Halal Development Corporation, anak syarikat PIJ Holdings \u2013 tiga peranan", options: { fontSize: 16 } }], L + 0.25, CT + 2.7, CW - 0.5, 0.4, { valign: "middle" });
  const rW = (CW - 0.4) / 3;
  [["1", "AGENSI FASILITASI HALAL NEGERI JOHOR", "Membimbing pemohon dan sokongan teknikal; kuasa pensijilan kekal pada JAINJ dan JAKIM"],
   ["2", "PENYELARAS PKHNJ 2030", "Menyelaras 21 inisiatif, memantau KPI dan menyatukan laporan kemajuan"],
   ["3", "PLATFORM EKOSISTEM HALAL", "Menghubungkan industri dengan agensi, institusi latihan, pelabur dan pembiaya"]].forEach(([n, h, b], i) => {
    const x = L + i * (rW + 0.2), y = CT + 3.2;
    R(s, x, y, rW, 0.5, NAVY);
    T(s, [{ text: n + "  ", options: { color: GOLD } }, { text: h, options: { color: WHITE } }], x + 0.15, y, rW - 0.3, 0.5, { fontSize: 14, bold: true, valign: "middle" });
    R(s, x, y + 0.5, rW, 0.8, LAV);
    T(s, b, x + 0.15, y + 0.5, rW - 0.3, 0.8, { fontSize: 14, valign: "middle" });
  });

  // ===== 10 : lima pendekatan =====
  s = slide("LIMA PENDEKATAN UTAMA KERAJAAN NEGERI", "PENDEKATAN KERAJAAN NEGERI");
  [["PERTAMA", "Halal sampai kepada peniaga kecil"], ["KEDUA", "Halal membuka pasaran dunia"], ["KETIGA", "Halal mencipta pekerjaan"],
   ["KEEMPAT", "Usahawan tempatan menjadi juara"], ["KELIMA", "Geran yang meringankan beban"]].forEach(([n, t], i) => {
    const y = CT + i * 0.92;
    R(s, L, y, 2.4, 0.8, GOLD); T(s, n, L, y, 2.4, 0.8, { fontSize: 22, bold: true, align: "center", valign: "middle" });
    R(s, L + 2.4, y, 5.6, 0.8, i % 2 ? RED : NAVY); T(s, t, L + 2.65, y, 5.2, 0.8, { fontSize: 22, bold: true, color: WHITE, valign: "middle" });
  });
  ph(s, L + 8.3, CT, CW - 8.3, 4.48, "Aktiviti Kerajaan Negeri / JAINJ");

  // ===== 11 : kesedaran =====
  s = slide("KURSUS KESEDARAN HALAL UNTUK PENIAGA KECIL", "PENDEKATAN PERTAMA", "Pendekatan Pertama");
  sub(s, "PBT BERSAMA JHDC – KURSUS KESEDARAN HALAL", L, CT - 0.05, 7);
  ["MBJB", "MBPG", "MPKu", "MBIP"].forEach((c, i) => {
    const x = L + (i % 2) * 3.2, y = CT + 0.4 + Math.floor(i / 2) * 0.95;
    R(s, x, y, 3.05, 0.82, NAVY); T(s, c, x, y, 3.05, 0.82, { fontSize: 28, bold: true, color: WHITE, align: "center", valign: "middle" });
  });
  sub(s, "RAKAN STRATEGIK LATIHAN", L, CT + 2.4, 7);
  ["JAINJ", "JHDC", "UTM", "JT Lab"].forEach((c, i) => {
    const x = L + (i % 2) * 3.2, y = CT + 2.85 + Math.floor(i / 2) * 0.95;
    R(s, x, y, 3.05, 0.82, LAV); T(s, c, x, y, 3.05, 0.82, { fontSize: 28, bold: true, align: "center", valign: "middle" });
  });
  nb(s, L + 6.6, CT, CW - 6.6, 1.85, RED, "Hampir 3,000", "peserta latihan kesedaran halal tahun ini", { vs: 48, ls: 22 });
  ph(s, L + 6.6, CT + 2.0, CW - 6.6, CH - 2.0, "Kursus kesedaran halal peniaga");

  // ===== 12 : bimbingan berperingkat =====
  s = slide("PENIAGA KECIL DIBIMBING SECARA BERPERINGKAT", "PENDEKATAN PERTAMA");
  const w12 = (CW - 0.4) / 3;
  nb(s, L, CT, w12, 2.75, NAVY, "RM500,000", "MAINJ: bantu 500 peniaga mikro dan kecil menyediakan dokumentasi pensijilan halal", { vs: 40, ls: 20 });
  nb(s, L + w12 + 0.2, CT, w12, 2.75, NAVY, "44", "peniaga di bawah PBT telah mula dibantu; selebihnya secara berperingkat", { vs: 54, ls: 20 });
  nb(s, L + 2 * (w12 + 0.2), CT, w12, 2.75, RED, "40", "usahawan medan selera dibimbing hingga bersijil halal pada 2027 (peruntukan PIJ)", { vs: 54, ls: 20 });
  ph(s, L, CT + 2.9, CW, CH - 2.9, "Peniaga kecil / gerai dan medan selera");

  // ===== 13 : Halal Kotej =====
  s = slide("HALAL KOTEJ: JT LAB MEMBIMBING USAHAWAN ASNAF DAN PENIAGA", "PENDEKATAN PERTAMA");
  sub(s, "JT LAB – MAKMAL ANALISIS HALAL NEGERI", L, CT - 0.05, 7);
  T(s, "285", L, CT + 0.35, 6.8, 1.9, { fontSize: 120, bold: true, color: RED, valign: "middle" });
  T(s, "peserta dibimbing pada tahun 2026", L, CT + 2.25, 6.8, 0.55, { fontSize: 26, bold: true });
  T(s, bl(["Usahawan asnaf dan peniaga di Larkin Sentral", "Kerjasama KEJORA, Jabatan Pertanian, YAPEIM dan masjid"]), L, CT + 2.95, 6.8, 1.55, { fontSize: 22, paraSpaceAfter: 8 });
  ph(s, L + 7.1, CT, CW - 7.1, CH, "Bimbingan Halal Kotej / usahawan asnaf");

  // ===== 14 : kantin SAKJ =====
  s = slide("KANTIN SEKOLAH AGAMA KERAJAAN JOHOR (SAKJ) BERSIJIL HALAL", "PENDEKATAN PERTAMA");
  [[NAVY, "154", "kantin bersijil halal pada tahun 2025"], [NAVY, "RM462,000", "sumbangan PIJ: RM3,000 setiap kantin (Belanjawan Johor 2025)"], [RED, "129/133", "kantin bersijil halal pada 2026; empat lagi dalam proses audit"]].forEach(([f, v, l], i) => {
    const y = CT + i * 1.52;
    R(s, L, y, 7.3, 1.42, f, { objectName: "Baris" });
    T(s, v, L + 0.3, y, 3.2, 1.42, { fontSize: 40, bold: true, color: WHITE, valign: "middle" });
    T(s, l, L + 3.6, y, 3.5, 1.42, { fontSize: 20, color: WHITE, valign: "middle" });
  });
  ph(s, L + 7.5, CT, CW - 7.5, CH, "Kantin Sekolah Agama Johor");

  // ===== 15 : KEMAS + rumah sembelihan =====
  s = slide("JAMINAN SUMBER MAKANAN: DAPUR KEMAS DAN RUMAH SEMBELIHAN", "PENDEKATAN PERTAMA");
  const w15 = (CW - 0.2) / 2;
  ph(s, L, CT, w15, 2.0, "Dapur KEMAS");
  nb(s, L, CT + 2.1, w15, 2.4, NAVY, "50", "dapur KEMAS kini di peringkat semakan dokumentasi", { vs: 54, ls: 22 });
  ph(s, L + w15 + 0.2, CT, w15, 2.0, "Rumah sembelihan");
  nb(s, L + w15 + 0.2, CT + 2.1, w15, 2.4, RED, "43", "rumah sembelihan Jabatan Perkhidmatan Veterinar bersijil halal; dua lagi dalam tindakan", { vs: 54, ls: 20 });

  // ===== 16 : Green Lane + PRefChem =====
  s = slide("HALAL GREEN LANE: PRefChem MENEMBUSI PASARAN HALAL KIMIA", "PENDEKATAN KEDUA", "Pendekatan Kedua");
  R(s, L, CT, 7.4, 1.4, NAVY);
  T(s, "15 HARI", L + 0.3, CT, 3.2, 1.4, { fontSize: 44, bold: true, color: WHITE, valign: "middle" });
  T(s, "Halal Green Lane: sijil boleh diluluskan dalam 15 hari bekerja", L + 3.6, CT, 3.6, 1.4, { fontSize: 20, color: WHITE, valign: "middle" });
  R(s, L, CT + 1.5, 7.4, 1.2, LAV);
  T(s, "Indonesia mewajibkan pensijilan halal bagi produk kimia mulai 18 Oktober 2026", L + 0.3, CT + 1.5, 6.8, 1.2, { fontSize: 22, bold: true, valign: "middle" });
  R(s, L, CT + 2.8, 7.4, 1.7, RED);
  T(s, "42 PRODUK", L + 0.3, CT + 2.8, 3.2, 1.7, { fontSize: 36, bold: true, color: WHITE, valign: "middle" });
  T(s, "PRefChem, Pengerang, bertindak awal: SPHM bagi 42 produk", L + 3.6, CT + 2.8, 3.6, 1.7, { fontSize: 20, color: WHITE, valign: "middle" });
  phc(s, L + 7.6, CT, CW - 7.6, CH, 1.35, "Produk / kilang PRefChem, Pengerang", [
    { text: "Pengerang berpotensi muncul sebagai hab petrokimia halal serantau", options: { fontSize: 18, bold: true, color: WHITE } }]);

  // ===== 17 : Colorcon =====
  s = slide("COLORCON MALAYSIA MENEMBUSI PASARAN INDONESIA DAN INDIA", "PENDEKATAN KEDUA");
  phc(s, L, CT, 6.0, CH, 1.3, "Colorcon Malaysia / penerimaan sijil", [
    { text: "Halal bukan lagi soal makanan semata-mata, tetapi pintu ke pasaran global", options: { fontSize: 20, bold: true, color: WHITE } }]);
  const rx17 = L + 6.2, rw17 = RE - rx17;
  [[NAVY, "COLORCON MALAYSIA", "syarikat multinasional dari Amerika Syarikat"], [RED, "SPHM", "diperoleh melalui bimbingan JHDC"], [GOLD, "INDONESIA & INDIA", "pasaran yang kini ditembusi"]].forEach(([f, a, b], i) => {
    const y = CT + i * 1.54;
    R(s, rx17, y, rw17, 1.42, f);
    T(s, [{ text: a, options: { fontSize: 28, bold: true, breakLine: true } }, { text: b, options: { fontSize: 22 } }], rx17 + 0.3, y, rw17 - 0.5, 1.42, { color: f === GOLD ? NAVY : WHITE, valign: "middle" });
  });

  // ===== 18 : pelaburan diluluskan =====
  s = slide("JOHOR MEREKODKAN RM790.91 JUTA PELABURAN INDUSTRI HALAL", "PELABURAN HALAL");
  R(s, L, CT, 7.6, 2.5, NAVY, { objectName: "Hero" });
  tag(s, "DILULUSKAN SEHINGGA JUN 2026", L + 0.3, CT + 0.2, 4.2);
  T(s, "RM790.91 juta", L + 0.3, CT + 0.7, 7.1, 1.1, { fontSize: 64, bold: true, color: WHITE, valign: "middle" });
  T(s, "pelaburan industri halal diluluskan", L + 0.3, CT + 1.8, 7.1, 0.5, { fontSize: 24, color: WHITE });
  nb(s, L + 7.8, CT, CW - 7.8, 2.5, RED, "27 projek", "kedudukan kedua di peringkat nasional", { vs: 44, ls: 24, top: 0.3 });
  const w18 = (CW - 0.2) / 2;
  [["Paris Baguette Halal Hub", "Nusajaya", "Paris Baguette"], ["Ellaziq", "Simpang Renggam", "Ellaziq"]].forEach(([n, loc, p], i) => {
    const x = L + i * (w18 + 0.2);
    ph(s, x, CT + 2.65, 2.9, 1.85, p);
    R(s, x + 2.9, CT + 2.65, w18 - 2.9, 1.85, LAV);
    T(s, [{ text: "CONTOH", options: { fontSize: 16, bold: true, color: GOLD, breakLine: true } }, { text: n, options: { fontSize: 24, bold: true, breakLine: true } }, { text: loc, options: { fontSize: 20 } }], x + 3.15, CT + 2.65, w18 - 3.3, 1.85, { valign: "middle" });
  });

  // ===== 19 : HALMAS =====
  s = slide("TAMAN HALMAS DI POIC TANJUNG LANGSAT MEREALISASIKAN PELABURAN BESAR", "PELABURAN HALAL");
  ph(s, L, CT, 6.4, CH, "Kilang / Taman HALMAS");
  const rx19 = L + 6.6, rw19 = RE - rx19;
  tag(s, "PELABURAN DIREALISASIKAN", rx19, CT, 4.4);
  nb(s, rx19, CT + 0.55, rw19, 1.95, RED, "RM2.256 bilion", "pelaburan direalisasikan", { vs: 40, ls: 24 });
  nb(s, rx19, CT + 2.65, rw19, 1.85, NAVY, "2,342", "peluang pekerjaan diwujudkan", { vs: 54, ls: 24 });

  // ===== 20 : 3,384 =====
  s = slide("SERAMAI 3,384 PESERTA DILATIH DALAM BIDANG HALAL", "PENDEKATAN KETIGA", "Pendekatan Ketiga");
  R(s, L, CT, 7.2, CH, NAVY, { objectName: "Hero" });
  T(s, "3,384", L + 0.4, CT + 0.2, 6.4, 2.0, { fontSize: 110, bold: true, color: GOLD, valign: "middle" });
  T(s, "peserta dilatih dalam bidang halal pada tahun 2026", L + 0.4, CT + 2.3, 6.4, 1.0, { fontSize: 28, bold: true, color: WHITE });
  T(s, "melalui enam penyedia latihan di Johor", L + 0.4, CT + 3.4, 6.4, 0.8, { fontSize: 24, color: WHITE });
  ph(s, L + 7.4, CT, CW - 7.4, CH, "Sesi latihan halal");

  // ===== 21 : subsidi =====
  s = slide("PIJ MENYUBSIDI YURAN KURSUS PROFESIONAL HALAL", "PENDEKATAN KETIGA");
  const w21 = (CW - 0.4) / 3;
  nb(s, L, CT, w21, 1.9, LAV, "50%", "subsidi yuran kursus", { vs: 48, vc: RED, ls: 20 });
  nb(s, L + w21 + 0.2, CT, w21, 1.9, LAV, "RM1,650", "setiap peserta daripada yuran RM3,300", { vs: 44, vc: RED, ls: 20 });
  nb(s, L + 2 * (w21 + 0.2), CT, w21, 1.9, RED, "116", "peserta telah menerima manfaat", { vs: 48, ls: 20 });
  R(s, L, CT + 2.05, 8.1, 2.45, NAVY);
  T(s, bl(["Kursus Eksekutif Halal dan Kursus Juruaudit Dalaman Halal; meringankan beban industri sederhana dan besar, termasuk pelabur asing, yang diwajibkan JAKIM mempunyai Eksekutif Halal",
           "Graduan Eksekutif Halal UTM, UTHM dan KUIJSI dipadankan terus dengan industri bersama JTDC"]), L + 0.3, CT + 2.05, 7.5, 2.45, { fontSize: 20, color: WHITE, valign: "middle", paraSpaceAfter: 8 });
  ph(s, L + 8.3, CT + 2.05, CW - 8.3, 2.45, "Kursus Eksekutif Halal");

  // ===== 22a : TVET =====
  s = slide("TVET HALAL MELATIH ANAK ASNAF MENJADI TENAGA KERJA MAHIR", "PENDEKATAN KETIGA");
  nb(s, L, CT, 7.4, 2.15, NAVY, "70", "peserta asnaf dalam dua kohort dilatih sehingga November 2026 (pembiayaan MAINJ)", { vs: 60, ls: 22 });
  nb(s, L, CT + 2.3, 7.4, 2.2, RED, "55", "orang telah bekerja = 78.6% penempatan pekerjaan", { vs: 60, ls: 24 });
  ph(s, L + 7.6, CT, CW - 7.6, CH, "Peserta TVET Halal");

  // ===== 22b : kohort =====
  s = slide("PENEMPATAN PEKERJAAN PESERTA TVET HALAL MENGIKUT KOHORT", "PENDEKATAN KETIGA");
  const bar = (y, h, tagText, subText, segs, legend) => {
    R(s, L, y, 8.2, h, LAV);
    T(s, [{ text: tagText, options: { bold: true, fontSize: 24, color: NAVY, breakLine: true } }, { text: subText, options: { fontSize: 22 } }], L + 0.25, y + 0.1, 2.3, 1.1, { valign: "top" });
    let x = L + 2.7; const full = 8.2 - 2.9;
    segs.forEach(([p, col, tx, tc]) => {
      const w = full * p / 100;
      R(s, x, y + 0.2, w, 0.85, col, { line: { color: LAV, width: 1 } });
      T(s, tx, x, y + 0.2, w, 0.85, { fontSize: tx.length <= 3 ? 16 : 20, bold: true, color: tc, align: "center", valign: "middle" });
      x += w;
    });
    if (legend) T(s, legend, L + 2.7, y + 1.2, full, 0.8, { fontSize: 20, color: GREY });
  };
  bar(CT, 1.3, "KOHORT 1", "20 peserta", [[100, NAVY, "100% penempatan pekerjaan", WHITE]]);
  bar(CT + 1.5, 3.0, "KOHORT 2", "50 peserta", [[70, NAVY, "70% bekerja", WHITE], [20, RED, "20%", WHITE], [10, GOLD, "10%", NAVY]], "70% bekerja  |  20% masih menjalani latihan praktikal  |  10% melanjutkan pengajian");
  ph(s, L + 8.4, CT, CW - 8.4, CH, "Graduan TVET Halal");

  // ===== 23a : Halal Champion =====
  s = slide("HALAL CHAMPION JOHOR: PROGRAM INTERVENSI BAGI 20 PMKS JENAMA ASAL JOHOR", "PENDEKATAN KEEMPAT", "Pendekatan Keempat");
  R(s, L, CT, 6.2, 2.2, NAVY, { objectName: "Hero" });
  T(s, "20", L + 0.3, CT, 2.2, 2.2, { fontSize: 100, bold: true, color: GOLD, valign: "middle" });
  T(s, "PMKS jenama asal Johor", L + 2.5, CT, 3.5, 2.2, { fontSize: 28, bold: true, color: WHITE, valign: "middle" });
  R(s, L, CT + 2.35, 6.2, 2.15, LAV);
  T(s, bl(["Dirintis TWRJ dan digerakkan bersama PUJB", "Dicalonkan agensi melalui Majlis Pembangunan Usahawan Negeri Johor (MPUN)"]), L + 0.3, CT + 2.35, 5.7, 2.15, { fontSize: 22, valign: "middle", paraSpaceAfter: 8 });
  ph(s, L + 6.4, CT, CW - 6.4, CH, "Usahawan Halal Champion");

  // ===== 23b : lima intervensi =====
  s = slide("LIMA ASPEK INTERVENSI BERSEPADU UNTUK USAHAWAN", "PENDEKATAN KEEMPAT");
  const w23 = (CW - 0.8) / 5;
  ["Pensijilan halal", "Pembiayaan", "Penjenamaan", "Pembungkusan", "Pemasaran"].forEach((t, i) => {
    const x = L + i * (w23 + 0.2);
    R(s, x, CT, w23, 1.9, NAVY);
    s.addShape(pres.ShapeType.ellipse, { x: x + w23 / 2 - 0.35, y: CT + 0.2, w: 0.7, h: 0.7, fill: { color: GOLD }, line: { color: GOLD, width: 0 } });
    T(s, String(i + 1), x + w23 / 2 - 0.35, CT + 0.2, 0.7, 0.7, { fontSize: 28, bold: true, color: NAVY, align: "center", valign: "middle" });
    T(s, t, x + 0.05, CT + 1.0, w23 - 0.1, 0.8, { fontSize: 19, bold: true, color: WHITE, align: "center", valign: "middle" });
  });
  R(s, L, CT + 2.05, CW, 1.2, RED);
  T(s, "10 daripada 12 syarikat yang dinilai telah mencatat kemajuan", L + 0.3, CT + 2.05, CW - 0.6, 1.2, { fontSize: 30, bold: true, color: WHITE, align: "center", valign: "middle" });
  R(s, L, CT + 3.4, CW, 1.1, LAV);
  T(s, "Prestasi dinilai melalui kayu pengukur yang diluluskan Majlis Halal Negeri Johor", L + 0.3, CT + 3.4, CW - 0.6, 1.1, { fontSize: 24, bold: true, align: "center", valign: "middle" });

  // ===== 24 : jualan =====
  s = slide("JUALAN USAHAWAN HALAL CHAMPION MENINGKAT", "PENDEKATAN KEEMPAT");
  const card24 = (x, y, w, h, fill, v, n, d, vs) => {
    R(s, x, y, w, h, fill);
    T(s, v, x + 0.3, y + 0.1, w - 0.6, vs / 72 * 1.3, { fontSize: vs, bold: true, color: WHITE, valign: "middle" });
    T(s, [{ text: n, options: { fontSize: 22, bold: true, breakLine: true } }, { text: d, options: { fontSize: 18 } }], x + 0.3, y + 0.1 + vs / 72 * 1.3, w - 0.6, h - vs / 72 * 1.3 - 0.2, { color: WHITE });
  };
  card24(L, CT, 5.3, 2.3, RED, "136%", "S'mores by Alkaff", "naik taraf daripada perusahaan mikro kepada syarikat kecil", 54);
  card24(L + 5.5, CT, 3.3, 2.3, NAVY, "62%", "Elham-Q Edible Oil", "syarikat kecil", 54);
  card24(L + 9.0, CT, 3.13, 2.3, NAVY, "50%", "WE1", "syarikat kecil", 54);
  card24(L, CT + 2.45, 4.0, 2.05, NAVY, "12.6%", "Salleh Food Industries", "syarikat sederhana", 48);
  card24(L + 4.15, CT + 2.45, 4.0, 2.05, NAVY, "11%", "ADIN Marketing Group", "syarikat sederhana", 48);
  ph(s, L + 8.3, CT + 2.45, CW - 8.3, 2.05, "Produk Halal Champion");

  // ===== 25 : rangkaian =====
  s = slide("KOPI RAKYAT DAN MUIZ HOT CHICKEN MELUASKAN RANGKAIAN", "PENDEKATAN KEEMPAT");
  const w25 = (CW - 0.2) / 2;
  ph(s, L, CT, w25, 1.9, "Kopi Rakyat");
  nb(s, L, CT + 2.0, w25, 2.5, NAVY, "55", "cawangan Kopi Rakyat kini beroperasi", { vs: 60, ls: 24 });
  ph(s, L + w25 + 0.2, CT, w25, 1.9, "Muiz Hot Chicken");
  nb(s, L + w25 + 0.2, CT + 2.0, w25, 2.5, NAVY, "RM40 juta+", "jualan Muiz Hot Chicken; sasar 50 ejen baharu melalui pembiayaan Bank Islam (i-TEKAD, i-BANGKIT)", { vs: 44, ls: 20 });

  // ===== 26 : eksport + Halal Sukses =====
  s = slide("USAHAWAN JOHOR MENEMBUSI PASARAN EKSPORT", "PENDEKATAN KEEMPAT");
  [["ELHAM-Q", "mengeksport ke Jepun, Sudan dan Bangladesh"], ["HIJRAH WATER", "mengeksport ke Singapura"]].forEach(([n, d], i) => {
    const y = CT + i * 1.65;
    R(s, L, y, 7.4, 1.5, RED);
    T(s, [{ text: n, options: { fontSize: 32, bold: true, breakLine: true } }, { text: d, options: { fontSize: 22 } }], L + 0.3, y + 0.05, 6.8, 1.4, { color: WHITE, valign: "middle" });
  });
  ph(s, L + 7.6, CT, CW - 7.6, 3.15, "Produk eksport Johor");
  R(s, L, CT + 3.3, CW, 1.2, NAVY, { objectName: "Halal Sukses" });
  T(s, [{ text: "HALAL SUKSES JOHOR  ", options: { fontSize: 22, bold: true, color: GOLD } }, { text: "bersama KUSKOP terus membimbing PMKS Johor memperoleh pensijilan halal", options: { fontSize: 22, color: WHITE } }], L + 0.3, CT + 3.3, CW - 0.6, 1.2, { valign: "middle" });

  // ===== 27 : geran =====
  s = slide("LEBIH RM1.3 JUTA GERAN UNTUK MEMPERKASA EKOSISTEM HALAL", "PENDEKATAN KELIMA", "Pendekatan Kelima");
  R(s, L, CT, CW, 0.85, GOLD, { objectName: "Hero" });
  T(s, "LEBIH RM1.3 JUTA", L + 0.3, CT, 7.2, 0.85, { fontSize: 44, bold: true, valign: "middle" });
  T(s, "geran melalui MAINJ dan PIJ", L + 6.6, CT, CW - 6.9, 0.85, { fontSize: 24, bold: true, align: "right", valign: "middle" });
  [["MAINJ", "RM500,000", "membantu 500 peniaga mikro dan kecil menyediakan dokumentasi pensijilan halal", NAVY],
   ["PIJ", "RM200,000", "subsidi 50% yuran kursus profesional halal", NAVY],
   ["PIJ", "RM462,000", "pensijilan halal bagi 154 kantin SAKJ", NAVY],
   ["PIJ · 2027", "RM200,000", "bagi 40 usahawan medan selera pada tahun 2027", RED]].forEach(([a, v, d, fill], i) => {
    const y = CT + 0.95 + i * 0.88;
    R(s, L, y, CW, 0.8, fill, { objectName: "Peruntukan" });
    tag(s, a, L + 0.25, y + 0.2, a.length > 5 ? 1.6 : 1.1);
    T(s, v, L + 2.1, y, 3.6, 0.8, { fontSize: 32, bold: true, color: WHITE, valign: "middle" });
    T(s, d, L + 5.8, y, CW - 6.0, 0.8, { fontSize: 20, color: WHITE, valign: "middle" });
  });

  // ===== 28 : sasaran 2030 =====
  s = slide("JOHOR MENYASARKAN INDUSTRI HALAL BERNILAI TINGGI MENJELANG 2030", "SASARAN 2030", "Sasaran dan Penutup");
  const w28 = (CW - 0.4) / 3;
  [["5,000", "syarikat baharu bersijil halal"], ["4,000", "tenaga kerja mahir halal"], ["RM5 bilion", "pelaburan terkumpul"]].forEach(([v, l], i) => {
    nb(s, L + i * (w28 + 0.2), CT, w28, 2.1, NAVY, v, l, { vs: 38, ls: 22 });
  });
  const w28b = (CW - 0.2) / 2;
  nb(s, L, CT + 2.25, w28b, 2.25, RED, "RM18 bilion", "eksport halal", { vs: 54, ls: 26 });
  nb(s, L + w28b + 0.2, CT + 2.25, w28b, 2.25, RED, "RM24 bilion", "sumbangan kepada KDNK negeri", { vs: 54, ls: 26 });

  // ===== 29 : perjalanan masih jauh =====
  s = slide("PERJALANAN MASIH JAUH: USAHA PERLU TERUS DIPERGIATKAN", "SASARAN 2030");
  R(s, L, CT, 7.8, 2.3, LAV);
  T(s, [{ text: "1,298 ", options: { fontSize: 44, bold: true, color: RED } }, { text: "syarikat baharu setakat ini daripada sasaran 5,000", options: { fontSize: 22, bold: true } }], L + 0.3, CT + 0.1, 7.3, 1.0, { valign: "middle" });
  R(s, L + 0.3, CT + 1.3, 7.2, 0.7, "C9CFE6"); R(s, L + 0.3, CT + 1.3, 7.2 * 0.26, 0.7, RED);
  T(s, "26% daripada sasaran", L + 0.3 + 7.2 * 0.26 + 0.15, CT + 1.3, 4.5, 0.7, { fontSize: 22, bold: true, valign: "middle" });
  sub(s, "PENGHARGAAN KEPADA", L, CT + 2.45, 6);
  ["JAINJ", "Agensi dalam Taskforce", "Rakan industri", "Para usahawan"].forEach((t, i) => {
    const x = L + (i % 2) * 3.95, y = CT + 2.9 + Math.floor(i / 2) * 0.85;
    R(s, x, y, 3.85, 0.75, NAVY); T(s, t, x, y, 3.85, 0.75, { fontSize: 22, bold: true, color: WHITE, align: "center", valign: "middle" });
  });
  ph(s, L + 8.0, CT, CW - 8.0, CH, "Taskforce PKHNJ 2030 / rakan industri");

  // ===== 30 : PENUTUP =====
  s = pres.addSlide({ masterName: "PENUTUP", sectionTitle: sec });
  phBg(s, "Dewan Negeri Johor (hitam putih, pudar)");
  s.addImage({ path: LOGO, x: 4.87, y: 0.3, w: 3.6, h: 1.09 });
  twoBar(s, W / 2, 1.5);
  T(s, "HALAL BUKAN SEKADAR SIJIL", 1, 1.65, W - 2, 0.9, { fontSize: 48, bold: true, align: "center", valign: "middle" });
  [["home", "Makanan yang bersih dan selamat untuk keluarga"], ["store", "Pasaran yang lebih luas untuk usahawan"],
   ["grad", "Pekerjaan untuk anak muda"], ["help", "Kesejahteraan untuk seluruh rakyat Johor"]].forEach(([k, t], i) => {
    const bw15 = (CW - 0.2) / 2, x = L + (i % 2) * (bw15 + 0.2), y = 2.8 + Math.floor(i / 2) * 1.3;
    s.addShape(pres.ShapeType.rect, { x, y, w: bw15, h: 1.15, fill: { color: WHITE }, line: { color: NAVY, width: 1.5 }, objectName: "Mesej" });
    s.addShape(pres.ShapeType.ellipse, { x: x + 0.25, y: y + 0.2, w: 0.75, h: 0.75, fill: { color: LAV }, line: { color: LAV, width: 0 } });
    s.addImage({ data: ic[k], x: x + 0.25 + 0.2, y: y + 0.2 + 0.2, w: 0.35, h: 0.35 });
    T(s, t, x + 1.25, y, bw15 - 1.4, 1.15, { fontSize: 22, bold: true, valign: "middle" });
  });
  twoBar(s, W / 2, 5.55);
  R(s, L, 5.75, CW, 0.95, NAVY, { objectName: "Komitmen" });
  T(s, "KOMITMEN KERAJAAN NEGERI JOHOR UNTUK TERUS MEMPERKASA INDUSTRI HALAL", L + 0.3, 5.75, CW - 0.6, 0.95, { fontSize: 24, bold: true, color: WHITE, align: "center", valign: "middle" });
  T(s, "Sekian, terima kasih.", 1, 6.78, W - 2, 0.35, { fontSize: 18, italic: true, align: "center" });

  // ===== APPENDIX 31 =====
  s = slide("LAMPIRAN: PENSIJILAN HALAL BAHARU DI NEGERI JOHOR", "LAMPIRAN", "Lampiran");
  const hd = (t, al) => ({ text: t, options: { bold: true, color: WHITE, fill: { color: NAVY }, fontSize: 24, align: al || "left" } });
  const cell = (t, o = {}) => ({ text: t, options: Object.assign({ fontSize: 24, color: NAVY, fill: { color: WHITE } }, o) });
  const alt = { fill: { color: LAV } };
  s.addTable([
    [hd("Tahun"), hd("Pensijilan SPHM Baharu", "center"), hd("Catatan")],
    [cell("2024", { bold: true }), cell("133", { align: "center", bold: true }), cell("Sebelum PKHNJ 2030")],
    [cell("2025", Object.assign({ bold: true }, alt)), cell("561", Object.assign({ align: "center", bold: true }, alt)), cell("-", alt)],
    [cell("2026 (11 Nov)", { bold: true }), cell("737", { align: "center", bold: true }), cell("88% daripada sasaran 839")],
    [cell("Jumlah sejak PKHNJ 2030", { bold: true, fill: { color: GOLDT } }), cell("1,298", { align: "center", bold: true, fill: { color: GOLDT } }), cell("26% daripada sasaran 5,000", { bold: true, fill: { color: GOLDT } })],
  ], { x: L, y: CT, w: CW, colW: [5.2, 2.5, 4.43], rowH: 0.85, valign: "middle", border: { type: "solid", color: "C9CFE6", pt: 1 }, margin: [0, 0.2, 0, 0.2] });

  // ===== 32 =====
  s = slide("LAMPIRAN: SENARAI HALAL CHAMPION JOHOR (KOHORT 1)", "LAMPIRAN");
  const co = ["IM Alkaff", "PIJ Manufacturing Sdn. Bhd.", "We1 Manufacturing (M) Sdn. Bhd.", "Azad Food Industries Sdn. Bhd.", "Ara Yasmeen Enterprise",
    "Salleh Food Industries Sdn. Bhd.", "Elham-Q Edible Oil Sdn. Bhd.", "Faiza Food Industries Sdn. Bhd.", "Usahawan Seri Enterprise", "Mak Siti Products (M) Sdn. Bhd.",
    "Muiz Food Industries Sdn. Bhd.", "Maiz Enterprise Sdn. Bhd.", "Eng's Legacy Sdn. Bhd.", "Hijrah Water Sdn. Bhd.", "Jalen Sdn. Bhd.",
    "Ikhwan Zaini Enterprise", "Sparkles Group Sdn. Bhd.", "ADIN Marketing Group Sdn. Bhd. (Haos Ek)", "Kopi Rakyat Sdn. Bhd.", "Umz Bioline Manufacturer Sdn. Bhd."];
  const cw17 = (CW - 0.2) / 2;
  co.forEach((n, i) => {
    const col = Math.floor(i / 10), r = i % 10, x = L + col * (cw17 + 0.2), y = CT - 0.05 + r * 0.46;
    R(s, x, y, cw17, 0.42, LAV, { objectName: "Baris" });
    R(s, x, y, 0.55, 0.42, i % 2 ? RED : NAVY);
    T(s, String(i + 1), x, y, 0.55, 0.42, { fontSize: 18, bold: true, color: WHITE, align: "center", valign: "middle" });
    T(s, n, x + 0.7, y, cw17 - 0.75, 0.42, { fontSize: n.length > 36 ? 16 : 18, valign: "middle" });
  });

  // ===== 33 =====
  s = slide("LAMPIRAN: PESERTA LATIHAN HALAL 2026 MENGIKUT PENYEDIA", "LAMPIRAN");
  const tr = [["Al Hamra Management Services PLT", 1190, "35.2%"], ["JHDC", 1117, "33.0%"], ["First Wing", 313, "9.2%"], ["DHMovere", 286, "8.5%"], ["JT Lab", 285, "8.4%"], ["UTM", 193, "5.7%"]];
  T(s, "Penyedia Latihan", L + 0.2, CT - 0.1, 5.0, 0.35, { fontSize: 18, bold: true, color: GREY });
  T(s, "Peserta", L + 5.3, CT - 0.1, 1.4, 0.35, { fontSize: 18, bold: true, color: GREY, align: "right" });
  T(s, "Peratus", L + 6.8, CT - 0.1, 1.4, 0.35, { fontSize: 18, bold: true, color: GREY, align: "right" });
  tr.forEach(([n, v, p], i) => {
    const y = CT + 0.3 + i * 0.58;
    R(s, L, y, CW, 0.52, LAV, { objectName: "Baris" });
    T(s, n, L + 0.2, y, 5.1, 0.52, { fontSize: 20, bold: true, valign: "middle" });
    T(s, v.toLocaleString("en-US"), L + 5.3, y, 1.4, 0.52, { fontSize: 22, bold: true, align: "right", valign: "middle" });
    T(s, p, L + 6.8, y, 1.4, 0.52, { fontSize: 22, bold: true, color: RED, align: "right", valign: "middle" });
    R(s, L + 8.5, y + 0.1, 3.4 * v / 1190, 0.32, i === 0 ? RED : NAVY);
  });
  R(s, L, CT + 3.85, CW, 0.65, NAVY, { objectName: "Jumlah" });
  T(s, "Jumlah", L + 0.2, CT + 3.85, 5.1, 0.65, { fontSize: 22, bold: true, color: WHITE, valign: "middle" });
  T(s, "3,384", L + 5.3, CT + 3.85, 1.4, 0.65, { fontSize: 22, bold: true, color: WHITE, align: "right", valign: "middle" });
  T(s, "100%", L + 6.8, CT + 3.85, 1.4, 0.65, { fontSize: 22, bold: true, color: WHITE, align: "right", valign: "middle" });

  // ===== 34 =====
  s = slide("LAMPIRAN: BILANGAN PESERTA BIMBINGAN JT LAB (HALAL KOTEJ) 2026", "LAMPIRAN");
  const jt = [["KEJORA (2 bengkel halal)", "60"], ["Jabatan Pertanian", "15"], ["Masjid Batu Pahat (16 Julai)", "20 (anggaran)"], ["YAPEIM", "13"], ["JT Lab", "24"],
    ["JT Lab (3–4 Nov)", "43"], ["JT Lab (17–18 Nov)", "18"], ["JT Lab (19–20 Nov)", "20"], ["JT Lab (21–22 Nov)", "72"]];
  const hd2 = (t, al) => ({ text: t, options: { bold: true, color: WHITE, fill: { color: NAVY }, fontSize: 18, align: al || "left" } });
  const c2 = (t, o = {}) => ({ text: t, options: Object.assign({ fontSize: 18, color: NAVY, fill: { color: WHITE } }, o) });
  s.addTable([
    [hd2("Program / rakan"), hd2("Peserta", "right")],
    ...jt.map(([a, b], i) => [c2(a, i % 2 ? alt : {}), c2(b, Object.assign({ align: "right", bold: true }, i % 2 ? alt : {}))]),
    [c2("Jumlah", { bold: true, fill: { color: GOLDT } }), c2("285", { align: "right", bold: true, fill: { color: GOLDT } })],
  ], { x: L, y: CT - 0.1, w: CW, colW: [8.6, 3.53], rowH: 0.42, valign: "middle", border: { type: "solid", color: "C9CFE6", pt: 1 }, margin: [0, 0.2, 0, 0.2] });

  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log("done");
})();
