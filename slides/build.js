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
function ph(s, x, y, w, h, label, small) {
  s.addShape(pres.ShapeType.rect, { x, y, w, h, fill: { color: PHC }, line: { color: "8A94C4", width: 1.5, dashType: "dash" }, objectName: "Ruang Gambar" });
  T(s, [
    { text: "GAMBAR", options: { fontSize: small ? 16 : 22, bold: true, color: "5A6499", breakLine: true } },
    { text: label, options: { fontSize: small ? 14 : 18, color: "5A6499", breakLine: true } },
    { text: "Ruang gambar sebenar (boleh diganti)", options: { fontSize: small ? 11 : 13, italic: true, color: "6B74A3" } },
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

  // ===== 11 : PERTAMA (kesedaran + bimbingan + Halal Kotej) =====
  s = slide(null, "PENDEKATAN PERTAMA", "Pendekatan Pertama");
  s.addText([{ text: "PERTAMA: HALAL SAMPAI KEPADA PENIAGA KECIL", options: { breakLine: true } },
             { text: "Pensijilan halal memerlukan masa, keyakinan dan komitmen. Peniaga diseru ambil peluang ini", options: { fontSize: 18, bold: false, color: GREY } }], { placeholder: "title" });
  const cW = (CW - 0.4) / 3, hH = 0.45, bH = 2.6, pH = CH - hH - bH - 0.1;
  const colX = (i) => L + i * (cW + 0.2);
  [["1  KESEDARAN HALAL", "Kursus kesedaran halal"], ["2  BIMBINGAN BERPERINGKAT", "Peniaga / medan selera"], ["3  HALAL KOTEJ \u2013 JT LAB", "Halal Kotej / usahawan asnaf"]].forEach(([h, p], i) => {
    R(s, colX(i), CT, cW, hH, NAVY, { objectName: "Tajuk Lajur" });
    T(s, h, colX(i) + 0.2, CT, cW - 0.4, hH, { fontSize: 16, bold: true, color: WHITE, valign: "middle" });
    R(s, colX(i), CT + hH, cW, bH, LAV, { objectName: "Badan Lajur" });
    ph(s, colX(i), CT + hH + bH + 0.1, cW, pH, p);
  });
  // col 1
  let x0 = colX(0), y0 = CT + hH;
  T(s, "PBT bersama JHDC", x0 + 0.2, y0 + 0.08, cW - 0.4, 0.3, { fontSize: 14, bold: true, color: GOLD });
  ["MBJB", "MBPG", "MPKu", "MBIP"].forEach((c, i) => {
    const cx = x0 + 0.2 + (i % 2) * 1.8, cy = y0 + 0.42 + Math.floor(i / 2) * 0.48;
    R(s, cx, cy, 1.7, 0.42, WHITE); T(s, c, cx, cy, 1.7, 0.42, { fontSize: 17, bold: true, align: "center", valign: "middle" });
  });
  T(s, "Rakan strategik latihan", x0 + 0.2, y0 + 1.5, cW - 0.4, 0.3, { fontSize: 14, bold: true, color: GOLD });
  T(s, "JAINJ \u00B7 JHDC \u00B7 UTM \u00B7 JT Lab", x0 + 0.2, y0 + 1.8, cW - 0.4, 0.3, { fontSize: 15, bold: true, valign: "middle" });
  R(s, x0 + 0.2, y0 + 2.17, cW - 0.4, 0.36, RED);
  T(s, "Hampir 3,000 peserta tahun ini", x0 + 0.2, y0 + 2.17, cW - 0.4, 0.36, { fontSize: 16, bold: true, color: WHITE, align: "center", valign: "middle" });
  // col 2
  x0 = colX(1);
  [[NAVY, "RM500,000", "MAINJ: 500 peniaga mikro dan kecil"], [NAVY, "44", "peniaga di bawah PBT telah mula dibantu"], [RED, "40", "usahawan medan selera, 2027 (PIJ)"]].forEach(([f, v, l], i) => {
    const ry = y0 + 0.1 + i * 0.83;
    R(s, x0 + 0.15, ry, cW - 0.3, 0.77, f);
    T(s, v, x0 + 0.3, ry, 1.75, 0.77, { fontSize: v.length > 3 ? 22 : 30, bold: true, color: WHITE, valign: "middle" });
    T(s, l, x0 + 2.05, ry, cW - 2.3, 0.77, { fontSize: 14, color: WHITE, valign: "middle" });
  });
  // col 3
  x0 = colX(2);
  T(s, "285", x0 + 0.2, y0 + 0.02, cW - 0.4, 1.0, { fontSize: 54, bold: true, color: RED, valign: "middle" });
  T(s, "peserta dibimbing oleh JT Lab tahun ini", x0 + 0.2, y0 + 0.98, cW - 0.4, 0.5, { fontSize: 14, bold: true });
  T(s, bl(["Usahawan asnaf dan peniaga di Larkin Sentral", "KEJORA, Jabatan Pertanian, YAPEIM, masjid"]), x0 + 0.2, y0 + 1.55, cW - 0.4, 1.0, { fontSize: 14, paraSpaceAfter: 3 });

  // ===== 14 : kantin SAKJ + KEMAS + rumah sembelihan (satu slide) =====
  s = slide(null, "PENDEKATAN PERTAMA");
  s.addText([{ text: "HALAL DI SEKOLAH DAN SUMBER MAKANAN", options: { breakLine: true } },
             { text: "Anak-anak kita menjamah makanan yang halal, bersih dan selamat; ibu bapa boleh berasa tenang", options: { fontSize: 18, bold: false, color: GREY } }], { placeholder: "title" });
  const lW = 7.9;
  R(s, L, CT, lW, 0.45, NAVY);
  T(s, [{ text: "KANTIN SEKOLAH AGAMA KERAJAAN JOHOR (SAKJ)", options: { color: WHITE } }, { text: "   sumbangan PIJ", options: { color: GOLD } }], L + 0.2, CT, lW - 0.4, 0.45, { fontSize: 15, bold: true, valign: "middle" });
  [[NAVY, "154", "kantin bersijil halal pada 2025", 36], [NAVY, "RM462,000", "PIJ: RM3,000 setiap kantin (Belanjawan Johor 2025)", 28], [RED, "129/133", "kantin bersijil pada 2026; empat lagi dalam audit", 32]].forEach(([f, v, l, vs], i) => {
    nb(s, L + i * 2.7, CT + 0.5, 2.5, 1.8, f, v, l, { vs, ls: 14, top: 0.1, pad: 0.2 });
  });
  R(s, L, CT + 2.45, lW, 0.45, NAVY);
  T(s, "PERLUASAN USAHA HALAL", L + 0.2, CT + 2.45, lW - 0.4, 0.45, { fontSize: 15, bold: true, color: WHITE, valign: "middle" });
  [[NAVY, "50", "dapur KEMAS kini di peringkat semakan dokumentasi"], [RED, "43", "rumah sembelihan Jabatan Perkhidmatan Veterinar bersijil halal; dua lagi dalam tindakan"]].forEach(([f, v, l], i) => {
    const x = L + i * 4.0;
    R(s, x, CT + 2.95, 3.9, 1.55, f, { objectName: "Blok" });
    T(s, v, x + 0.2, CT + 2.95, 1.1, 1.55, { fontSize: 38, bold: true, color: WHITE, valign: "middle" });
    T(s, l, x + 1.35, CT + 2.95, 2.4, 1.55, { fontSize: 14, color: WHITE, valign: "middle" });
  });
  ph(s, L + lW + 0.2, CT, CW - lW - 0.2, CH, "Kantin sekolah / murid menjamah makanan halal");

  // ===== 16 : KEDUA (Green Lane + PRefChem + Colorcon + pelaburan) =====
  s = slide(null, "PENDEKATAN KEDUA", "Pendekatan Kedua");
  s.addText([{ text: "KEDUA: HALAL MEMBUKA PASARAN DUNIA", options: { breakLine: true } },
             { text: "Halal bukan lagi soal makanan semata-mata, tetapi pintu ke pasaran global", options: { fontSize: 18, bold: false, color: GREY } }], { placeholder: "title" });
  const kH = 0.45, kB = 2.3;
  const gxs = [L, L + 3.05, L + 7.7], gws = [2.9, 4.5, 4.43];
  ["HALAL GREEN LANE", "PRefChem, PENGERANG", "COLORCON MALAYSIA"].forEach((h, i) => {
    R(s, gxs[i], CT, gws[i], kH, NAVY, { objectName: "Tajuk Lajur" });
    T(s, h, gxs[i] + 0.2, CT, gws[i] - 0.4, kH, { fontSize: 16, bold: true, color: WHITE, valign: "middle" });
  });
  // A: Green Lane
  R(s, gxs[0], CT + kH, gws[0], kB, NAVY);
  T(s, "15 HARI", gxs[0] + 0.25, CT + kH + 0.1, gws[0] - 0.5, 0.85, { fontSize: 38, bold: true, color: GOLD, valign: "middle" });
  T(s, "Halal Green Lane: sijil halal boleh diluluskan dalam tempoh 15 hari bekerja", gxs[0] + 0.25, CT + kH + 1.0, gws[0] - 0.5, 1.2, { fontSize: 15, color: WHITE });
  // B: PRefChem (teks + gambar sebelah)
  const phw = 1.9, tw = (i) => gws[i] - phw - 0.35;
  R(s, gxs[1], CT + kH, gws[1], kB, LAV);
  R(s, gxs[1] + 0.15, CT + kH + 0.1, tw(1), 0.5, RED);
  T(s, [{ text: "42 ", options: { fontSize: 24, bold: true } }, { text: "produk SPHM", options: { fontSize: 14, bold: true } }], gxs[1] + 0.25, CT + kH + 0.1, tw(1) - 0.2, 0.5, { color: WHITE, valign: "middle" });
  T(s, bl(["Bertindak awal; bersedia jadi pembekal petrokimia halal ke rantau", "Berpotensi hab petrokimia halal serantau"]), gxs[1] + 0.15, CT + kH + 0.68, tw(1), kB - 0.72, { fontSize: 13, paraSpaceAfter: 3 });
  ph(s, gxs[1] + gws[1] - phw - 0.1, CT + kH + 0.1, phw, kB - 0.2, "PRefChem", true);
  // C: Colorcon (teks + gambar sebelah)
  R(s, gxs[2], CT + kH, gws[2], kB, LAV);
  T(s, bl(["Syarikat multinasional dari Amerika Syarikat", "SPHM melalui bimbingan JHDC", "Menembusi pasaran India"]), gxs[2] + 0.15, CT + kH, tw(2), kB, { fontSize: 14, valign: "middle", paraSpaceAfter: 5 });
  ph(s, gxs[2] + gws[2] - phw - 0.1, CT + kH + 0.1, phw, kB - 0.2, "Colorcon", true);
  // investment
  const iy = CT + kH + kB + 0.1;
  R(s, L, iy, CW, 0.4, GOLD);
  T(s, [{ text: "PELABURAN INDUSTRI HALAL  ", options: { fontSize: 16, bold: true } }, { text: "diluluskan sehingga Jun 2026", options: { fontSize: 15 } }], L + 0.2, iy, CW - 0.4, 0.4, { valign: "middle" });
  const by = iy + 0.45, bh = CB - by;
  R(s, L, by, 3.7, bh, NAVY, { objectName: "Pelaburan" });
  T(s, "RM790.91 juta", L + 0.25, by + 0.08, 3.2, 0.5, { fontSize: 24, bold: true, color: GOLD, valign: "middle" });
  T(s, "27 projek; kedudukan kedua di peringkat nasional", L + 0.25, by + 0.6, 3.2, bh - 0.62, { fontSize: 14, color: WHITE });
  R(s, L + 3.85, by, 3.7, bh, LAV, { objectName: "Contoh" });
  T(s, [{ text: "CONTOH", options: { fontSize: 12, bold: true, color: GOLD, breakLine: true } }, { text: "Paris Baguette Halal Hub, Nusajaya", options: { fontSize: 15, bold: true, breakLine: true } }, { text: "Ellaziq, Simpang Renggam", options: { fontSize: 15, bold: true } }], L + 4.05, by, 3.3, bh, { valign: "middle", paraSpaceAfter: 3 });
  R(s, L + 7.7, by, CW - 7.7, bh, RED, { objectName: "HALMAS" });
  T(s, "RM2.256 bilion", L + 7.95, by + 0.08, CW - 8.2, 0.5, { fontSize: 24, bold: true, color: WHITE, valign: "middle" });
  T(s, "direalisasikan di Taman HALMAS, POIC Tanjung Langsat; 2,342 peluang pekerjaan", L + 7.95, by + 0.6, CW - 8.2, bh - 0.62, { fontSize: 14, color: WHITE });

  // ===== 20 : KETIGA (latihan + subsidi + TVET) =====
  s = slide(null, "PENDEKATAN KETIGA", "Pendekatan Ketiga");
  s.addText([{ text: "KETIGA: HALAL MENCIPTA PEKERJAAN", options: { breakLine: true } },
             { text: "Dari latihan kepada penempatan: tenaga kerja mahir halal Johor", options: { fontSize: 18, bold: false, color: GREY } }], { placeholder: "title" });
  const tW = (CW - 0.4) / 3, tH = 0.45, tB = CH - tH;
  const tx = (i) => L + i * (tW + 0.2);
  ["1  LATIHAN HALAL 2026", "2  SUBSIDI PIJ (50% YURAN)", "3  TVET HALAL (MAINJ)"].forEach((h, i) => {
    R(s, tx(i), CT, tW, tH, NAVY, { objectName: "Tajuk Lajur" });
    T(s, h, tx(i) + 0.2, CT, tW - 0.4, tH, { fontSize: 16, bold: true, color: WHITE, valign: "middle" });
  });
  // col 1
  R(s, tx(0), CT + tH, tW, 2.2, NAVY, { objectName: "Hero" });
  T(s, "3,384", tx(0) + 0.25, CT + tH + 0.1, tW - 0.5, 1.1, { fontSize: 58, bold: true, color: GOLD, valign: "middle" });
  T(s, "peserta dilatih dalam bidang halal tahun ini melalui enam penyedia latihan di Johor", tx(0) + 0.25, CT + tH + 1.25, tW - 0.5, 0.9, { fontSize: 15, color: WHITE });
  ph(s, tx(0), CT + tH + 2.3, tW, tB - 2.3, "Sesi latihan halal");
  // col 2
  let y2 = CT + tH;
  R(s, tx(1), y2, tW, tB, LAV, { objectName: "Badan Lajur" });
  T(s, "Kursus Eksekutif Halal dan Kursus Juruaudit Dalaman Halal", tx(1) + 0.2, y2 + 0.05, tW - 0.4, 0.5, { fontSize: 13, bold: true, color: GOLD, valign: "middle" });
  const hw = (tW - 0.5) / 2;
  [["50%", "subsidi yuran"], ["RM1,650", "setiap peserta (yuran RM3,300)"]].forEach(([v, l], i) => {
    const x = tx(1) + 0.2 + i * (hw + 0.1);
    R(s, x, y2 + 0.6, hw, 1.05, WHITE);
    T(s, v, x + 0.1, y2 + 0.62, hw - 0.2, 0.5, { fontSize: i ? 22 : 28, bold: true, color: RED, valign: "middle" });
    T(s, l, x + 0.1, y2 + 1.14, hw - 0.2, 0.5, { fontSize: 13 });
  });
  R(s, tx(1) + 0.2, y2 + 1.75, tW - 0.4, 0.45, RED);
  T(s, "116 peserta menerima manfaat", tx(1) + 0.2, y2 + 1.75, tW - 0.4, 0.45, { fontSize: 15, bold: true, color: WHITE, align: "center", valign: "middle" });
  T(s, bl(["Meringankan beban industri sederhana dan besar, termasuk pelabur asing (JAKIM wajibkan Eksekutif Halal)", "Graduan Eksekutif Halal UTM, UTHM dan KUIJSI dipadankan dengan industri (JTDC)"]), tx(1) + 0.2, y2 + 2.3, tW - 0.4, tB - 2.35, { fontSize: 14, paraSpaceAfter: 4 });
  // col 3
  let y3 = CT + tH;
  R(s, tx(2), y3, tW, tB, LAV, { objectName: "Badan Lajur" });
  R(s, tx(2) + 0.15, y3 + 0.1, tW - 0.3, 0.85, NAVY);
  T(s, "70", tx(2) + 0.3, y3 + 0.1, 0.95, 0.85, { fontSize: 36, bold: true, color: GOLD, valign: "middle" });
  T(s, "peserta asnaf dalam dua kohort dilatih sehingga November 2026", tx(2) + 1.3, y3 + 0.1, tW - 1.55, 0.85, { fontSize: 13, color: WHITE, valign: "middle" });
  R(s, tx(2) + 0.15, y3 + 1.03, tW - 0.3, 0.5, RED);
  T(s, "55 orang telah bekerja = 78.6%", tx(2) + 0.15, y3 + 1.03, tW - 0.3, 0.5, { fontSize: 15, bold: true, color: WHITE, align: "center", valign: "middle" });
  const bw = tW - 0.3;
  const kb = (yy, lab, segs, legend) => {
    T(s, lab, tx(2) + 0.15, yy, bw, 0.28, { fontSize: 13, bold: true, valign: "middle" });
    let xx = tx(2) + 0.15;
    segs.forEach(([pc, col, tx2, tc]) => {
      const w = bw * pc / 100;
      R(s, xx, yy + 0.3, w, 0.42, col, { line: { color: LAV, width: 1 } });
      T(s, tx2, xx, yy + 0.3, w, 0.42, { fontSize: tx2.length <= 3 ? 12 : 13, bold: true, color: tc, align: "center", valign: "middle" });
      xx += w;
    });
    if (legend) T(s, legend, tx(2) + 0.15, yy + 0.75, bw, 0.45, { fontSize: 12, color: GREY });
  };
  kb(y3 + 1.65, "KOHORT 1 \u00B7 20 peserta", [[100, NAVY, "100% penempatan pekerjaan", WHITE]]);
  kb(y3 + 2.55, "KOHORT 2 \u00B7 50 peserta", [[70, NAVY, "70% bekerja", WHITE], [20, RED, "20%", WHITE], [10, GOLD, "10%", NAVY]], "20% masih menjalani latihan praktikal; 10% melanjutkan pengajian");

  // ===== 23 : KEEMPAT (Halal Champion + kemajuan) =====
  s = slide(null, "PENDEKATAN KEEMPAT", "Pendekatan Keempat");
  s.addText([{ text: "KEEMPAT: USAHAWAN TEMPATAN MENJADI JUARA", options: { breakLine: true } },
             { text: "Halal Champion Johor: 10 daripada 12 syarikat yang dinilai telah mencatat kemajuan", options: { fontSize: 18, bold: false, color: GREY } }], { placeholder: "title" });
  const lw = 8.2;
  R(s, L, CT, 2.6, 1.3, NAVY, { objectName: "Hero" });
  T(s, "20", L + 0.2, CT, 1.2, 1.3, { fontSize: 48, bold: true, color: GOLD, valign: "middle" });
  T(s, "PMKS jenama asal Johor", L + 1.35, CT, 1.15, 1.3, { fontSize: 14, bold: true, color: WHITE, valign: "middle" });
  R(s, L + 2.75, CT, lw - 2.75, 1.3, LAV);
  T(s, bl(["Dirintis TWRJ, digerakkan bersama PUJB", "Dicalonkan agensi melalui MPUN", "Prestasi dinilai melalui kayu pengukur Majlis Halal Negeri Johor"]), L + 2.95, CT, lw - 3.1, 1.3, { fontSize: 14, valign: "middle", paraSpaceAfter: 2 });
  T(s, "LIMA ASPEK INTERVENSI BERSEPADU", L, CT + 1.4, lw, 0.3, { fontSize: 14, bold: true, color: GOLD, valign: "middle" });
  ["Pensijilan halal", "Pembiayaan", "Penjenamaan", "Pembungkusan", "Pemasaran"].forEach((t, i) => {
    const x = L + i * 1.65;
    s.addShape(pres.ShapeType.rect, { x, y: CT + 1.75, w: 1.55, h: 0.75, fill: { color: WHITE }, line: { color: NAVY, width: 1.5 }, objectName: "Aspek" });
    T(s, t, x + 0.02, CT + 1.75, 1.51, 0.75, { fontSize: 13, bold: true, align: "center", valign: "middle" });
  });
  ph(s, L + lw + 0.2, CT, CW - lw - 0.2, 2.5, "Usahawan Halal Champion");
  R(s, L, CT + 2.65, CW, 0.4, RED);
  T(s, "10 DARIPADA 12 SYARIKAT YANG DINILAI TELAH MENCATAT KEMAJUAN", L + 0.2, CT + 2.65, CW - 0.4, 0.4, { fontSize: 16, bold: true, color: WHITE, valign: "middle" });
  const cy = CT + 3.1, ch2 = CB - cy;
  const cw4 = [2.5, 3.7, 3.4, 2.23];
  let cx = L;
  [["NAIK TARAF", NAVY, [{ text: "136%", options: { fontSize: 28, bold: true, color: GOLD, breakLine: true } }, { text: "S'mores by Alkaff: mikro kepada syarikat kecil", options: { fontSize: 14, color: WHITE } }]],
   ["JUALAN MENINGKAT", NAVY, [{ text: "Sederhana: Salleh Food Industries 12.6%, ADIN Marketing Group 11%", options: { fontSize: 14, color: WHITE, breakLine: true } }, { text: "Kecil: Elham-Q Edible Oil 62%, WE1 50%", options: { fontSize: 14, color: WHITE } }]],
   ["RANGKAIAN BERTAMBAH", NAVY, [{ text: "Kopi Rakyat: 55 cawangan. Muiz Hot Chicken: jualan lebih RM40 juta, sasar 50 ejen baharu (Bank Islam: i-TEKAD, i-BANGKIT)", options: { fontSize: 14, color: WHITE } }]],
   ["EKSPORT", RED, [{ text: "Elham-Q: Jepun, Sudan, Bangladesh. Hijrah Water: Singapura", options: { fontSize: 14, color: WHITE } }]]].forEach(([h, f, runs], i) => {
    R(s, cx, cy, cw4[i], ch2, f, { objectName: "Kad Kemajuan" });
    T(s, h, cx + 0.15, cy + 0.05, cw4[i] - 0.3, 0.3, { fontSize: 13, bold: true, color: i === 3 ? WHITE : GOLD, valign: "middle" });
    T(s, runs, cx + 0.15, cy + 0.38, cw4[i] - 0.3, ch2 - 0.42, { valign: "top" });
    cx += cw4[i] + 0.1;
  });

  // ===== 27 : KELIMA (geran) =====
  s = slide(null, "PENDEKATAN KELIMA", "Pendekatan Kelima");
  s.addText([{ text: "KELIMA: GERAN YANG MERINGANKAN BEBAN", options: { breakLine: true } },
             { text: "Kerajaan Negeri menyalurkan geran secara langsung melalui MAINJ dan PIJ", options: { fontSize: 18, bold: false, color: GREY } }], { placeholder: "title" });
  const gw = 8.2;
  R(s, L, CT, gw, 0.8, GOLD, { objectName: "Hero" });
  T(s, "LEBIH RM1.3 JUTA", L + 0.25, CT, 5.2, 0.8, { fontSize: 36, bold: true, valign: "middle" });
  T(s, "jumlah geran", L + 5.0, CT, gw - 5.25, 0.8, { fontSize: 18, bold: true, align: "right", valign: "middle" });
  [["MAINJ", "RM500,000", "membantu 500 peniaga mikro dan kecil menyediakan dokumentasi pensijilan halal", NAVY],
   ["PIJ", "RM200,000", "subsidi 50% yuran kursus profesional halal", NAVY],
   ["PIJ", "RM462,000", "pensijilan halal bagi 154 kantin SAKJ (RM3,000 setiap kantin)", NAVY],
   ["PIJ \u00B7 2027", "RM200,000", "bagi 40 usahawan medan selera pada tahun 2027", RED]].forEach(([a, v, d, fill], i) => {
    const y = CT + 0.9 + i * 0.72;
    R(s, L, y, gw, 0.65, fill, { objectName: "Peruntukan" });
    T(s, a, L + 0.15, y, 1.2, 0.65, { fontSize: 14, bold: true, color: fill === RED ? WHITE : GOLD, valign: "middle" });
    T(s, v, L + 1.45, y, 2.5, 0.65, { fontSize: 24, bold: true, color: WHITE, valign: "middle" });
    T(s, d, L + 4.0, y, gw - 4.15, 0.65, { fontSize: 14, color: WHITE, valign: "middle" });
  });
  ph(s, L + gw + 0.2, CT, CW - gw - 0.2, 3.71, "Penyerahan geran / usahawan");
  R(s, L, CT + 3.85, CW, 0.65, NAVY, { objectName: "Penutup Geran" });
  T(s, "Geran ini meringankan beban kos, supaya usahawan kecil, asnaf dan industri tidak tertinggal dalam ekonomi halal", L + 0.25, CT + 3.85, CW - 0.5, 0.65, { fontSize: 16, bold: true, color: WHITE, valign: "middle" });

  // ===== 28 : PENUTUP (sasaran 2030 + perjalanan + halal bukan sekadar sijil) =====
  s = slide(null, "SASARAN 2030 DAN PENUTUP", "Sasaran dan Penutup");
  s.addText([{ text: "SASARAN 2030: HALAL BUKAN SEKADAR SIJIL", options: { breakLine: true } },
             { text: "Insya-Allah, Kerajaan Negeri akan terus berusaha memperkasa industri halal Johor", options: { fontSize: 18, bold: false, color: GREY } }], { placeholder: "title" });
  sub(s, "SASARAN MENJELANG 2030", L, CT - 0.05, 8);
  const gwT = (CW - 0.4) / 5;
  [["5,000", "", "syarikat baharu bersijil halal"], ["4,000", "", "tenaga kerja mahir halal"], ["RM5", " bilion", "pelaburan terkumpul"], ["RM18", " bilion", "eksport halal"], ["RM24", " bilion", "sumbangan kepada KDNK negeri"]].forEach(([v, u, l], i) => {
    const x = L + i * (gwT + 0.1), f = i < 2 ? NAVY : (i === 2 ? NAVY : RED);
    R(s, x, CT + 0.35, gwT, 1.5, i < 3 ? NAVY : RED, { objectName: "Sasaran" });
    T(s, [{ text: v, options: { fontSize: 34, bold: true, color: i < 3 ? GOLD : WHITE } }, { text: u, options: { fontSize: 18, bold: true, color: WHITE } }], x + 0.15, CT + 0.42, gwT - 0.3, 0.7, { valign: "middle" });
    T(s, l, x + 0.15, CT + 1.15, gwT - 0.3, 0.65, { fontSize: 14, color: WHITE });
  });
  const ry = CT + 2.0, rh = CB - ry;
  // left: progress + appreciation
  const lc = 4.2;
  R(s, L, ry, lc, 1.5, LAV, { objectName: "Perjalanan" });
  T(s, [{ text: "1,298 ", options: { fontSize: 30, bold: true, color: RED } }, { text: "syarikat baharu setakat ini", options: { fontSize: 14, bold: true } }], L + 0.2, ry + 0.05, lc - 0.4, 0.55, { valign: "middle" });
  R(s, L + 0.2, ry + 0.68, lc - 0.4, 0.28, "C9CFE6"); R(s, L + 0.2, ry + 0.68, (lc - 0.4) * 0.26, 0.28, RED);
  T(s, "26% daripada sasaran 5,000. Perjalanan masih jauh: usaha perlu terus dipergiat", L + 0.2, ry + 1.0, lc - 0.4, 0.48, { fontSize: 13, bold: true });
  R(s, L, ry + 1.6, lc, rh - 1.6, NAVY, { objectName: "Penghargaan" });
  T(s, [{ text: "PENGHARGAAN KEPADA", options: { fontSize: 12, bold: true, color: GOLD, breakLine: true } }, { text: "JAINJ, semua agensi dalam Taskforce, rakan industri dan para usahawan", options: { fontSize: 14, bold: true, color: WHITE } }], L + 0.2, ry + 1.6, lc - 0.4, rh - 1.6, { valign: "middle" });
  // middle: halal bermakna
  const mx = L + lc + 0.2, mw = 4.23;
  R(s, mx, ry, mw, 0.4, RED);
  T(s, "HALAL BERMAKNA", mx + 0.2, ry, mw - 0.4, 0.4, { fontSize: 15, bold: true, color: WHITE, valign: "middle" });
  [["home", "Makanan yang bersih dan selamat untuk keluarga"], ["store", "Pasaran yang lebih luas untuk usahawan"], ["grad", "Pekerjaan untuk anak muda"], ["help", "Kesejahteraan untuk seluruh rakyat Johor"]].forEach(([k, t], i) => {
    const iy = ry + 0.45 + i * ((rh - 0.45) / 4);
    const ih = (rh - 0.45) / 4 - 0.05;
    R(s, mx, iy, mw, ih, LAV);
    s.addImage({ data: ic[k], x: mx + 0.12, y: iy + (ih - 0.32) / 2, w: 0.32, h: 0.32 });
    T(s, t, mx + 0.55, iy, mw - 0.65, ih, { fontSize: 14, bold: true, valign: "middle" });
  });
  ph(s, mx + mw + 0.2, ry, CW - lc - mw - 0.4, rh, "Usahawan / keluarga Johor");

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
