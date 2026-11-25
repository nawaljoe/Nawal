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
pres.layout = "LAYOUT_WIDE"; // 13.333 x 7.5 in  = 1920 x 1080 @144dpi (16:9)
pres.theme = { headFontFace: "Arial", bodyFontFace: "Arial" };
pres.title = "Soalan Lisan A93 - Pensijilan Halal dan Industri Halal Negeri Johor";
pres.author = "Pejabat YB Exco Hal Ehwal Agama Islam Johor";

const W = 13.333, L = 0.6, CW = 12.13, RE = L + CW; // left margin, content width, right edge
const FOOT = "Jawapan Soalan Lisan A93  |  Belanjawan Johor 2027  |  26 November 2026";
pres.defineSlideMaster({
  title: "KANDUNGAN", background: { color: WHITE },
  objects: [
    { rect: { x: 0, y: 0, w: 4.4, h: 0.08, fill: { color: RED } } },
    { rect: { x: 4.4, y: 0, w: W - 4.4, h: 0.08, fill: { color: NAVY } } },
    { image: { x: 9.5, y: 0.17, w: 3.2, h: 0.97, path: LOGO } },
    { placeholder: { options: { name: "title", type: "title", x: L, y: 1.2, w: CW, h: 0.95, fontSize: 28, bold: true,
        color: NAVY, align: "left", valign: "middle", margin: 0 }, text: "" } },
    { text: { text: FOOT, options: { x: L, y: 7.12, w: 8, h: 0.28, fontSize: 11, color: GREY, margin: 0 } } },
  ],
  slideNumber: { x: 11.7, y: 7.12, w: 1.03, h: 0.28, fontSize: 11, color: GREY, align: "right" },
});
pres.defineSlideMaster({ title: "PENUTUP", background: { color: WHITE }, objects: [] });

// ---------- helpers ----------
function T(s, text, x, y, w, h, o = {}) {
  s.addText(text, Object.assign({ x, y, w, h, fontSize: 16, color: NAVY, valign: "top", margin: 0, isTextBox: true }, o));
}
function R(s, x, y, w, h, fill, o = {}) {
  s.addShape(pres.ShapeType.rect, Object.assign({ x, y, w, h, fill: { color: fill }, line: { color: fill, width: 0 } }, o));
}
function tab(s, text) {
  const w = 0.4 + text.length * 0.115;
  s.addShape(pres.ShapeType.rect, { x: L, y: 0.28, w, h: 0.4, fill: { color: WHITE }, line: { color: RED, width: 1.5 }, objectName: "Label Seksyen" });
  T(s, text, L, 0.28, w, 0.4, { fontSize: 13, bold: true, align: "center", valign: "middle" });
}
function ph(s, x, y, w, h, label) {
  s.addShape(pres.ShapeType.rect, { x, y, w, h, fill: { color: PHC }, line: { color: "8A94C4", width: 1.25, dashType: "dash" }, objectName: "Ruang Gambar" });
  T(s, [
    { text: "GAMBAR", options: { fontSize: 16, bold: true, color: "5A6499", breakLine: true } },
    { text: label, options: { fontSize: 14, color: "5A6499", breakLine: true } },
    { text: "Ruang gambar sebenar (boleh diganti)", options: { fontSize: 11, italic: true, color: "6B74A3" } },
  ], x + 0.15, y, w - 0.3, h, { align: "center", valign: "middle" });
}
function phBg(s, label) {
  s.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: W, h: 7.5, fill: { color: PHC }, line: { color: "8A94C4", width: 1.25, dashType: "dash" }, objectName: "Ruang Gambar Latar" });
  T(s, "GAMBAR LATAR: " + label + "  (ruang gambar sebenar, boleh diganti)", 1, 7.05, W - 2, 0.3, { fontSize: 12, italic: true, color: "6B74A3", align: "center" });
}
// photo with navy caption box at the bottom (reference style)
function phc(s, x, y, w, h, capH, label, runs) {
  ph(s, x, y, w, h - capH, label);
  R(s, x, y + h - capH, w, capH, NAVY, { objectName: "Kapsyen" });
  T(s, runs, x + 0.2, y + h - capH, w - 0.4, capH, { valign: "middle" });
}
function sub(s, text, x, y, w) { T(s, text, x, y, w, 0.34, { fontSize: 15, bold: true, color: GOLD }); }
function tag(s, text, x, y, w, fill = GOLD, color = NAVY) {
  R(s, x, y, w, 0.34, fill);
  T(s, text, x, y, w, 0.34, { fontSize: 13, bold: true, color, align: "center", valign: "middle" });
}
// colored block: big value then label
function nb(s, x, y, w, h, fill, val, label, o = {}) {
  R(s, x, y, w, h, fill, { objectName: "Blok Angka" });
  const vs = o.vs || 40, vh = vs / 72 * 1.3, pad = o.pad ?? 0.25, top = o.top ?? 0.15;
  const vc = o.vc || (fill === LAV || fill === GOLD ? NAVY : WHITE), lc = o.lc || (fill === LAV || fill === GOLD ? NAVY : WHITE);
  T(s, val, x + pad, y + top, w - 2 * pad, vh, { fontSize: vs, bold: true, color: vc, valign: "middle", align: o.align || "left" });
  T(s, label, x + pad, y + top + vh + 0.04, w - 2 * pad, h - top - vh - 0.1, { fontSize: o.ls || 16, color: lc, align: o.align || "left", bold: !!o.lb });
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
function twoBar(s, cx, y, each = 0.9) {
  R(s, cx - each, y, each, 0.08, RED); R(s, cx, y, each, 0.08, NAVY);
}
const CT = 2.3; // content top

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
  T(s, "PENSIJILAN HALAL & INDUSTRI HALAL NEGERI JOHOR", 1.2, 2.15, W - 2.4, 1.6, { fontSize: 42, bold: true, align: "center", valign: "middle" });
  twoBar(s, W / 2, 3.9);
  T(s, "SOALAN LISAN A93", 1, 4.1, W - 2, 0.55, { fontSize: 30, bold: true, align: "center", color: RED });
  T(s, "Dewan Negeri Johor  |  26 November 2026", 1, 4.75, W - 2, 0.45, { fontSize: 22, bold: true, align: "center" });
  T(s, "Soalan daripada:", 1, 5.5, W - 2, 0.35, { fontSize: 18, align: "center", color: GREY });
  T(s, "YB TUAN NG YAK HOWE (BENTAYAN)", 1, 5.9, W - 2, 0.55, { fontSize: 28, bold: true, align: "center", color: "1F2937" });

  // ===== 2 =====
  s = slide("JOHOR MELULUSKAN 1,298 PENSIJILAN HALAL BAHARU", "PENCAPAIAN PENSIJILAN", "Pencapaian");
  T(s, "1,298", L, 2.2, 7.0, 1.9, { fontSize: 120, bold: true, color: RED, valign: "middle" });
  T(s, "permohonan baharu SPHM diluluskan sejak PKHNJ 2030 diperkenalkan sehingga 11 November 2026", L, 4.15, 7.0, 1.0, { fontSize: 20 });
  ph(s, 7.9, CT, RE - 7.9, 2.85, "Penyampaian sijil halal");
  const bw = (CW - 0.45) / 4;
  nb(s, L, 5.3, bw, 1.6, NAVY, "1,743", "pemegang SPHM aktif", { vs: 44 });
  nb(s, L + (bw + 0.15), 5.3, bw, 1.6, NAVY, "4,321", "sijil halal aktif", { vs: 44 });
  nb(s, L + 2 * (bw + 0.15), 5.3, bw, 1.6, RED, "93%", "diluluskan dalam 30 hari bekerja", { vs: 44 });
  nb(s, L + 3 * (bw + 0.15), 5.3, bw, 1.6, GOLD, "KEDUA", "di Malaysia selepas Selangor", { vs: 44 });

  // ===== 3 =====
  s = slide("PENSIJILAN HALAL JOHOR MENINGKAT LEBIH LIMA KALI GANDA", "PERTUMBUHAN PENSIJILAN");
  R(s, L, CT, 7.3, 4.6, LAV, { objectName: "Panel Carta" });
  T(s, "PENSIJILAN SPHM BAHARU", L + 0.25, CT + 0.12, 6.8, 0.35, { fontSize: 16, bold: true });
  s.addChart(pres.charts.BAR, [{ name: "Pensijilan SPHM baharu", labels: ["2024", "2025", "2026*"], values: [133, 561, 737] }], {
    x: L + 0.1, y: CT + 0.5, w: 7.1, h: 3.7, barDir: "col", chartColors: [NAVY, NAVY, RED], barGapWidthPct: 50,
    showValue: true, dataLabelPosition: "outEnd", dataLabelFontSize: 24, dataLabelFontBold: true, dataLabelColor: NAVY, dataLabelFontFace: "+mn-lt",
    catAxisLabelFontSize: 18, catAxisLabelColor: NAVY, catAxisLabelFontFace: "+mn-lt", catAxisLabelFontBold: true,
    valAxisHidden: true, valGridLine: { style: "none" }, catGridLine: { style: "none" }, valAxisMaxVal: 900, valAxisMinVal: 0, showLegend: false,
  });
  T(s, "* 2026: setakat 11 November", L + 0.25, CT + 4.22, 6.8, 0.3, { fontSize: 13, color: GREY });
  const rx = L + 7.5, rw = RE - rx;
  R(s, rx, CT, rw, 2.3, NAVY, { objectName: "Pencapaian 2026" });
  T(s, "88%", rx + 0.3, CT + 0.1, 2.4, 1.2, { fontSize: 64, bold: true, color: WHITE, valign: "middle" });
  T(s, "daripada sasaran tahunan 839", rx + 2.5, CT + 0.1, rw - 2.7, 1.2, { fontSize: 18, bold: true, color: WHITE, valign: "middle" });
  R(s, rx + 0.3, CT + 1.6, rw - 0.6, 0.36, "3A4AA0"); R(s, rx + 0.3, CT + 1.6, (rw - 0.6) * 0.88, 0.36, GOLD);
  nb(s, rx, CT + 2.45, rw, 1.15, RED, "LEBIH 5×", "berbanding 2024 (133)", { vs: 34, top: 0.08 });
  R(s, rx, CT + 3.75, rw, 0.85, LAV);
  T(s, [{ text: "Sasaran 2026: ", options: { fontSize: 18 } }, { text: "839", options: { fontSize: 30, bold: true } }], rx, CT + 3.75, rw, 0.85, { align: "center", valign: "middle" });

  // ===== 4 =====
  s = slide("USAHAWAN BUMIPUTERA SEMAKIN YAKIN MENCEBURI INDUSTRI HALAL", "PENGLIBATAN BUMIPUTERA");
  R(s, L, CT, 5.9, 4.0, LAV, { objectName: "Panel Donut" });
  T(s, "SYARIKAT BAHARU 2026", L + 0.2, CT + 0.1, 5.5, 0.35, { fontSize: 16, bold: true, align: "center" });
  s.addChart(pres.charts.DOUGHNUT, [{ name: "Bumiputera", labels: ["Bumiputera", "Lain-lain"], values: [77.6, 22.4] }], {
    x: L + 1.35, y: CT + 0.45, w: 3.2, h: 2.85, holeSize: 66, chartColors: [RED, "D9DCEB"], showLegend: false,
    showLabel: false, showValue: false, showPercent: false, dataBorder: { pt: 0, color: "EEF0F6" },
  });
  T(s, "77.6%", L + 2.25, CT + 1.4, 1.4, 0.9, { fontSize: 28, bold: true, color: RED, align: "center", valign: "middle" });
  R(s, L + 0.3, CT + 3.42, 0.3, 0.3, RED);
  T(s, "342 daripada 441 syarikat baharu ialah usahawan Bumiputera", L + 0.75, CT + 3.3, 4.9, 0.6, { fontSize: 15, bold: true, valign: "middle" });
  const r4 = L + 6.1, w4 = RE - r4;
  nb(s, r4, CT, w4, 1.85, NAVY, "441", "syarikat baharu memohon melalui JAINJ pada tahun 2026", { vs: 54, ls: 18 });
  R(s, r4, CT + 2.0, w4, 2.0, LAV);
  tag(s, "PERBANDINGAN", r4 + 0.25, CT + 2.12, 1.8, NAVY, WHITE);
  T(s, "38%", r4 + 0.25, CT + 2.5, 2.2, 0.9, { fontSize: 50, bold: true, color: NAVY, valign: "middle" });
  T(s, "pemegang sijil sedia ada ialah usahawan Bumiputera", r4 + 2.5, CT + 2.5, w4 - 2.7, 0.9, { fontSize: 18, valign: "middle" });
  R(s, L, CT + 4.15, CW, 0.5, NAVY);
  T(s, "77.6% ialah bahagian daripada 441 syarikat baharu, bukan seluruh pemegang sijil", L + 0.25, CT + 4.15, CW - 0.5, 0.5, { fontSize: 16, bold: true, color: WHITE, valign: "middle" });

  // ===== 5 =====
  s = slide("HALAL BUKAN SEKADAR LABEL, TETAPI JAMINAN BERSIH, SELAMAT DAN BERKUALITI", "KEPENTINGAN HALAL");
  const w5 = (CW - 0.34) / 3;
  [["BERSIH", "clean"], ["SELAMAT", "safe"], ["BERKUALITI", "qual"]].forEach(([l, k], i) => {
    const x = L + i * (w5 + 0.17);
    R(s, x, CT, w5, 1.3, NAVY, { objectName: "Blok" });
    s.addImage({ data: ic[k], x: x + 0.35, y: CT + 0.3, w: 0.7, h: 0.7 });
    T(s, l, x + 1.3, CT, w5 - 1.4, 1.3, { fontSize: 24, bold: true, color: WHITE, valign: "middle" });
  });
  T(s, "Halalan Toyyiban: daripada bahan mentah hinggalah ke pinggan rakyat", L, CT + 1.4, CW, 0.5, { fontSize: 20, bold: true, valign: "middle" });
  sub(s, "PERBELANJAAN PENGGUNA MUSLIM GLOBAL", L, CT + 2.0, CW);
  nb(s, L, CT + 2.35, 5.3, 1.45, NAVY, "USD2.60 trilion", "pada tahun 2024", { vs: 34, lb: true, ls: 18 });
  T(s, "➜", L + 5.3, CT + 2.35, CW - 10.6, 1.45, { fontSize: 44, bold: true, color: GOLD, align: "center", valign: "middle" });
  nb(s, RE - 5.3, CT + 2.35, 5.3, 1.45, RED, "USD3.56 trilion", "unjuran menjelang 2029", { vs: 34, lb: true, ls: 18 });
  R(s, L, CT + 3.95, CW, 0.65, GOLD, { objectName: "Indeks" });
  T(s, "Malaysia kekal di kedudukan pertama Indeks Ekonomi Islam Global", L, CT + 3.95, CW, 0.65, { fontSize: 20, bold: true, align: "center", valign: "middle" });

  // ===== 6a =====
  s = slide("PKHNJ 2030 MENJADI PEMACU PEMBANGUNAN INDUSTRI HALAL JOHOR", "HALA TUJU", "Pelan dan Pendekatan");
  const w6 = (7.9 - 0.34) / 3;
  [["7", "hala tuju strategik"], ["21", "inisiatif"], ["33", "agensi dalam Taskforce"]].forEach(([v, l], i) => {
    nb(s, L + i * (w6 + 0.17), CT, w6, 2.0, NAVY, v, l, { vs: 54, ls: 18 });
  });
  R(s, L, CT + 2.15, 7.9, 0.65, NAVY);
  T(s, "JAINJ sebagai urus setia", L, CT + 2.15, 7.9, 0.65, { fontSize: 22, bold: true, color: WHITE, align: "center", valign: "middle" });
  R(s, L, CT + 2.95, 7.9, 1.65, RED, { objectName: "Tarikh" });
  T(s, [{ text: "25 FEBRUARI 2026", options: { fontSize: 30, bold: true, breakLine: true } }, { text: "Diluluskan Majlis Mesyuarat Kerajaan Negeri", options: { fontSize: 18 } }], L + 0.3, CT + 2.95, 7.3, 1.65, { color: WHITE, valign: "middle" });
  phc(s, L + 8.1, CT, CW - 8.1, 4.6, 1.5, "Majlis pelancaran PKHNJ 2030", [
    { text: "PRA-PELANCARAN", options: { fontSize: 14, bold: true, color: GOLD, breakLine: true } },
    { text: "7 Disember 2025", options: { fontSize: 26, bold: true, color: WHITE, breakLine: true } },
    { text: "oleh YAB Menteri Besar Johor", options: { fontSize: 16, color: WHITE } }]);

  // ===== 6b =====
  s = slide("JHDC MENGGERAKKAN PKHNJ 2030 MELALUI TIGA PERANAN", "PERANAN JHDC");
  phc(s, L, CT, 4.4, 3.95, 1.4, "YB Exco bersama JHDC", [
    { text: "JHDC", options: { fontSize: 24, bold: true, color: GOLD, breakLine: true } },
    { text: "Johor Halal Development Corporation, anak syarikat PIJ Holdings", options: { fontSize: 14, color: WHITE } }]);
  const rx6 = L + 4.6, rw6 = RE - rx6;
  [["1", "AGENSI FASILITASI HALAL NEGERI JOHOR", "Membimbing pemohon dan memberi sokongan teknikal"],
   ["2", "PENYELARAS PKHNJ 2030", "Menyelaras 21 inisiatif, memantau KPI dan menyatukan laporan kemajuan"],
   ["3", "PLATFORM EKOSISTEM HALAL", "Menghubungkan industri dengan agensi, institusi latihan, pelabur dan pembiaya"]].forEach(([n, a, b], i) => {
    const y = CT + i * 1.35;
    R(s, rx6, y, rw6, 0.5, NAVY, { objectName: "Tajuk Peranan" });
    T(s, [{ text: n + "  ", options: { color: GOLD } }, { text: a, options: { color: WHITE } }], rx6 + 0.2, y, rw6 - 0.4, 0.5, { fontSize: 16, bold: true, valign: "middle" });
    R(s, rx6, y + 0.5, rw6, 0.75, LAV);
    T(s, b, rx6 + 0.2, y + 0.5, rw6 - 0.4, 0.75, { fontSize: 17, valign: "middle" });
  });
  R(s, L, CT + 4.1, CW, 0.5, RED, { objectName: "Nota Kuasa" });
  T(s, "Kuasa pensijilan kekal pada JAINJ dan JAKIM", L, CT + 4.1, CW, 0.5, { fontSize: 20, bold: true, color: WHITE, align: "center", valign: "middle" });

  // ===== 7 =====
  s = slide("PENIAGA KECIL TURUT DIBIMBING MENYERTAI INDUSTRI HALAL", "PENDEKATAN PERTAMA", "Pendekatan Pertama");
  const row = (y, fill, big, tg, label, bs) => {
    R(s, L, y, 7.7, 1.4, fill, { objectName: "Baris" });
    T(s, big, L + 0.3, y + 0.1, 3.5, 0.75, { fontSize: bs, bold: true, color: WHITE, valign: "middle" });
    tag(s, tg, L + 0.3, y + 0.92, 1.3);
    T(s, label, L + 3.9, y, 3.6, 1.4, { fontSize: 17, color: WHITE, valign: "middle" });
  };
  row(CT, NAVY, "RM500,000", "MAINJ", "membantu 500 peniaga mikro dan kecil menyediakan dokumentasi pensijilan halal", 38);
  row(CT + 1.6, NAVY, "44", "PBT", "peniaga di bawah PBT telah mula dibantu", 48);
  row(CT + 3.2, RED, "40", "PIJ · 2027", "usahawan medan selera akan dibimbing sehingga memperoleh pensijilan halal (perancangan 2027)", 48);
  const r7 = L + 7.9, w7 = RE - r7;
  ph(s, r7, CT, w7, 1.95, "Peniaga kecil / medan selera");
  R(s, r7, CT + 2.1, w7, 2.5, LAV);
  T(s, "Hampir 3,000 peserta latihan kesedaran halal tahun ini", r7 + 0.2, CT + 2.15, w7 - 0.4, 0.7, { fontSize: 16, bold: true, valign: "middle" });
  ["MBJB", "MBPG", "MPKu", "MBIP", "JAINJ", "JHDC", "UTM", "JT Lab"].forEach((c, i) => {
    const cw = (w7 - 0.55) / 2, x = r7 + 0.2 + (i % 2) * (cw + 0.15), y = CT + 2.9 + Math.floor(i / 2) * 0.42;
    R(s, x, y, cw, 0.36, WHITE);
    T(s, c, x, y, cw, 0.36, { fontSize: 15, bold: true, align: "center", valign: "middle" });
  });

  // ===== 8 =====
  s = slide("USAHA HALAL DIPERLUAS DARI MEDAN SELERA HINGGA KE SEKOLAH", "PEMERKASAAN KOMUNITI");
  const w8 = (CW - 0.34) / 3;
  [["HALAL KOTEJ – JT LAB", "Usahawan asnaf dan peniaga", "285", "peserta dibimbing pada 2026", ["Usahawan asnaf dan peniaga", "KEJORA, Jabatan Pertanian, YAPEIM dan masjid"]],
   ["KANTIN SEKOLAH AGAMA JOHOR", "Kantin sekolah", "129/133", "kantin bersijil halal pada 2026", ["4 lagi dalam proses audit", "2025: 154 kantin bersijil (RM462,000 PIJ)"]],
   ["JAMINAN SUMBER MAKANAN", "Rumah sembelihan", "43", "rumah sembelihan bersijil halal", ["2 lagi dalam tindakan", "50 dapur KEMAS: semakan dokumentasi"]]].forEach(([hd, pl, big, lab, bl], i) => {
    const x = L + i * (w8 + 0.17);
    ph(s, x, CT, w8, 1.4, pl);
    R(s, x, CT + 1.4, w8, 0.6, NAVY, { objectName: "Tajuk Panel" });
    T(s, hd, x + 0.15, CT + 1.4, w8 - 0.3, 0.6, { fontSize: 16, bold: true, color: WHITE, align: "center", valign: "middle" });
    R(s, x, CT + 2.0, w8, 2.6, LAV, { objectName: "Badan Panel" });
    T(s, big, x + 0.25, CT + 2.05, w8 - 0.5, 0.8, { fontSize: 44, bold: true, color: RED, valign: "middle" });
    T(s, lab, x + 0.25, CT + 2.85, w8 - 0.5, 0.4, { fontSize: 16, bold: true, fit: "shrink" });
    T(s, bl.map((t, j) => ({ text: t, options: { bullet: true, breakLine: j < bl.length - 1 } })), x + 0.25, CT + 3.4, w8 - 0.5, 1.15, { fontSize: 14, paraSpaceAfter: 3 });
  });

  // ===== 9 =====
  s = slide("PENSIJILAN HALAL MEMBUKA PELUANG JOHOR KE PASARAN ANTARABANGSA", "PENDEKATAN KEDUA", "Pendekatan Kedua");
  s.addShape(pres.ShapeType.homePlate, { x: L, y: CT, w: 4.4, h: 1.25, fill: { color: NAVY }, line: { color: NAVY, width: 0 }, objectName: "Langkah 1" });
  s.addShape(pres.ShapeType.chevron, { x: L + 3.85, y: CT, w: 4.4, h: 1.25, fill: { color: GOLD }, line: { color: GOLD, width: 0 }, objectName: "Langkah 2" });
  s.addShape(pres.ShapeType.chevron, { x: L + 7.7, y: CT, w: CW - 7.7, h: 1.25, fill: { color: RED }, line: { color: RED, width: 0 }, objectName: "Langkah 3" });
  T(s, [{ text: "15 HARI", options: { fontSize: 30, bold: true, breakLine: true } }, { text: "Halal Green Lane (hari bekerja)", options: { fontSize: 15 } }], L + 0.3, CT, 3.5, 1.25, { color: WHITE, valign: "middle" });
  T(s, [{ text: "42 PRODUK", options: { fontSize: 28, bold: true, breakLine: true } }, { text: "SPHM PRefChem", options: { fontSize: 15 } }], L + 4.8, CT, 3.0, 1.25, { color: NAVY, valign: "middle" });
  T(s, [{ text: "INDONESIA & INDIA", options: { fontSize: 20, bold: true, breakLine: true } }, { text: "pasaran antarabangsa", options: { fontSize: 15 } }], L + 8.65, CT, 3.0, 1.25, { color: WHITE, valign: "middle" });
  R(s, L, CT + 1.4, CW, 0.6, LAV);
  T(s, "Indonesia wajibkan pensijilan halal bagi produk kimia mulai 18 Oktober 2026", L + 0.25, CT + 1.4, CW - 0.5, 0.6, { fontSize: 18, bold: true, valign: "middle" });
  const w9 = (CW - 0.2) / 2;
  [["PRefChem, Pengerang", ["Syarikat petrokimia di Pengerang", "SPHM bagi 42 produk", "Bersedia jadi pembekal bahan mentah petrokimia halal ke Indonesia dan rantau"], "Kilang PRefChem"],
   ["Colorcon Malaysia", ["Syarikat multinasional dari Amerika Syarikat", "SPHM melalui bimbingan JHDC", "Menembusi pasaran Indonesia dan India"], "Colorcon Malaysia"]].forEach(([n, b, p], i) => {
    const x = L + i * (w9 + 0.2);
    R(s, x, CT + 2.15, w9, 0.5, NAVY, { objectName: "Tajuk Syarikat" });
    T(s, n.toUpperCase().replace("PREFCHEM", "PRefChem"), x + 0.2, CT + 2.15, w9 - 0.4, 0.5, { fontSize: 16, bold: true, color: WHITE, valign: "middle" });
    R(s, x, CT + 2.65, w9, 1.95, LAV);
    T(s, b.map((t, j) => ({ text: t, options: { bullet: true, breakLine: j < b.length - 1 } })), x + 0.2, CT + 2.75, w9 - 2.5, 1.8, { fontSize: 15, paraSpaceAfter: 4 });
    ph(s, x + w9 - 2.15, CT + 2.8, 1.95, 1.65, p);
  });

  // ===== 10 =====
  s = slide("JOHOR MEREKODKAN RM790.91 JUTA PELABURAN INDUSTRI HALAL", "PELABURAN HALAL");
  R(s, L, CT, 8.0, 1.75, NAVY, { objectName: "Hero" });
  tag(s, "DILULUSKAN SEHINGGA JUN 2026", L + 0.3, CT + 0.15, 3.3);
  T(s, "RM790.91 juta", L + 0.3, CT + 0.5, 7.4, 0.8, { fontSize: 48, bold: true, color: WHITE, valign: "middle" });
  T(s, "pelaburan industri halal diluluskan", L + 0.3, CT + 1.32, 7.4, 0.35, { fontSize: 18, color: WHITE });
  nb(s, L + 8.15, CT, CW - 8.15, 1.75, RED, "27", "projek pelaburan, kedudukan kedua di peringkat nasional", { vs: 44, ls: 16 });
  const w10 = (CW - 0.2) / 2;
  ["Paris Baguette Halal Hub, Nusajaya", "Ellaziq, Simpang Renggam"].forEach((t, i) => {
    const x = L + i * (w10 + 0.2);
    R(s, x, CT + 1.9, w10, 0.65, LAV);
    T(s, [{ text: "CONTOH  ", options: { fontSize: 13, bold: true, color: GOLD } }, { text: t, options: { fontSize: 18, bold: true } }], x + 0.25, CT + 1.9, w10 - 0.5, 0.65, { valign: "middle" });
  });
  R(s, L, CT + 2.7, CW, 0.5, NAVY);
  T(s, "TAMAN HALMAS, POIC TANJUNG LANGSAT", L + 0.25, CT + 2.7, 7, 0.5, { fontSize: 17, bold: true, color: WHITE, valign: "middle" });
  tag(s, "PELABURAN DIREALISASIKAN", RE - 3.6, CT + 2.78, 3.4, GOLD, NAVY);
  const w10b = (CW - 0.4) / 3;
  nb(s, L, CT + 3.3, w10b, 1.3, RED, "RM2.256 bilion", "pelaburan direalisasikan", { vs: 30, ls: 16 });
  nb(s, L + w10b + 0.2, CT + 3.3, w10b, 1.3, NAVY, "2,342", "peluang pekerjaan diwujudkan", { vs: 36, ls: 16 });
  ph(s, L + 2 * (w10b + 0.2), CT + 3.3, w10b, 1.3, "Kilang / Taman HALMAS");

  // ===== 11a =====
  s = slide("INDUSTRI HALAL MELAHIRKAN TENAGA KERJA MAHIR JOHOR", "PENDEKATAN KETIGA", "Pendekatan Ketiga");
  nb(s, L, CT, 7.2, 2.0, NAVY, "3,384", "peserta dilatih dalam bidang halal pada tahun 2026 melalui enam penyedia latihan", { vs: 66, ls: 18 });
  ph(s, L + 7.4, CT, CW - 7.4, 2.0, "Latihan halal");
  sub(s, "SUBSIDI KURSUS EKSEKUTIF HALAL DAN JURUAUDIT DALAMAN HALAL (PIJ)", L, CT + 2.2, CW);
  const w11 = (CW - 0.34) / 3;
  nb(s, L, CT + 2.55, w11, 1.35, LAV, "50%", "subsidi yuran kursus", { vs: 40, vc: RED, ls: 17 });
  nb(s, L + w11 + 0.17, CT + 2.55, w11, 1.35, LAV, "RM1,650", "setiap peserta daripada yuran RM3,300", { vs: 32, vc: RED, ls: 15, top: 0.08 });
  nb(s, L + 2 * (w11 + 0.17), CT + 2.55, w11, 1.35, RED, "116", "peserta menerima manfaat", { vs: 40, ls: 17 });
  R(s, L, CT + 4.02, CW, 0.58, NAVY);
  T(s, "Graduan Eksekutif Halal UTM, UTHM dan KUIJSI dipadankan terus dengan industri bersama JTDC", L + 0.25, CT + 4.02, CW - 0.5, 0.58, { fontSize: 16, bold: true, color: WHITE, valign: "middle" });

  // ===== 11b =====
  s = slide("TVET HALAL MELATIH ANAK ASNAF MENJADI TENAGA KERJA MAHIR", "PENDEKATAN KETIGA");
  R(s, L, CT, 3.3, 0.95, NAVY); T(s, "70", L, CT, 3.3, 0.95, { fontSize: 48, bold: true, color: WHITE, align: "center", valign: "middle" });
  T(s, "peserta asnaf dilatih sehingga November 2026 (pembiayaan MAINJ)", L + 3.5, CT, 4.2, 0.95, { fontSize: 18, valign: "middle" });
  T(s, "▼", L, CT + 0.95, 3.3, 0.28, { fontSize: 16, color: GOLD, align: "center", valign: "middle" });
  R(s, L + 0.35, CT + 1.23, 2.6, 0.95, RED); T(s, "55", L + 0.35, CT + 1.23, 2.6, 0.95, { fontSize: 48, bold: true, color: WHITE, align: "center", valign: "middle" });
  T(s, [{ text: "78.6%  ", options: { fontSize: 30, bold: true, color: RED } }, { text: "telah bekerja", options: { fontSize: 18 } }], L + 3.5, CT + 1.23, 4.2, 0.95, { valign: "middle" });
  ph(s, L + 8.0, CT, CW - 8.0, 2.18, "Peserta TVET Halal");
  sub(s, "PENEMPATAN MENGIKUT KOHORT", L, CT + 2.3, CW);
  const bar = (y, h, tagText, subText, segs, legend) => {
    R(s, L, y, CW, h, LAV);
    T(s, [{ text: tagText, options: { bold: true, fontSize: 18, breakLine: true } }, { text: subText, options: { fontSize: 16 } }], L + 0.25, y, 2.2, h, { valign: "middle" });
    let x = L + 2.7; const full = CW - 2.95;
    segs.forEach(([p, col, tx, tc]) => {
      const w = full * p / 100;
      R(s, x, y + 0.1, w, 0.5, col, { line: { color: LAV, width: 1 } });
      T(s, tx, x, y + 0.1, w, 0.5, { fontSize: 16, bold: true, color: tc, align: "center", valign: "middle" });
      x += w;
    });
    if (legend) T(s, legend, L + 2.7, y + 0.65, full, 0.28, { fontSize: 14, color: GREY });
  };
  bar(CT + 2.65, 0.75, "KOHORT 1", "20 peserta", [[100, NAVY, "100% penempatan pekerjaan", WHITE]]);
  bar(CT + 3.5, 1.1, "KOHORT 2", "50 peserta", [[70, NAVY, "70% bekerja", WHITE], [20, RED, "20% praktikal", WHITE], [10, GOLD, "10%", NAVY]], "20% masih menjalani latihan praktikal  |  10% melanjutkan pengajian");

  // ===== 12a =====
  s = slide("USAHAWAN JOHOR DIBIMBING MENJADI PEMAIN INDUSTRI HALAL YANG BERDAYA SAING", "PENDEKATAN KEEMPAT", "Pendekatan Keempat");
  R(s, L, CT, 4.4, 1.55, NAVY, { objectName: "Hero" });
  T(s, "20", L + 0.3, CT, 1.7, 1.55, { fontSize: 72, bold: true, color: WHITE, valign: "middle" });
  T(s, "PMKS jenama asal Johor", L + 2.0, CT, 2.3, 1.55, { fontSize: 20, bold: true, color: WHITE, valign: "middle" });
  R(s, L + 4.55, CT, CW - 4.55, 1.55, LAV);
  R(s, L + 4.55, CT, 0.09, 1.55, RED);
  T(s, [{ text: "HALAL CHAMPION JOHOR", options: { fontSize: 20, bold: true, color: RED, breakLine: true } },
        { text: "Dirintis TWRJ, digerakkan bersama PUJB. Usahawan dicalonkan agensi melalui MPUN.", options: { fontSize: 18 } }], L + 4.85, CT, CW - 5.1, 1.55, { valign: "middle" });
  sub(s, "LIMA ASPEK INTERVENSI", L, CT + 1.7, 6);
  const cw12 = 2.7;
  [["1", "Pensijilan halal"], ["2", "Pembiayaan"], ["3", "Penjenamaan"], ["4", "Pembungkusan"], ["5", "Pemasaran"]].forEach(([n, t], i) => {
    const x = L + (i % 3) * (cw12 + 0.15), y = CT + 2.1 + Math.floor(i / 3) * 0.7;
    s.addShape(pres.ShapeType.rect, { x, y, w: cw12, h: 0.6, fill: { color: WHITE }, line: { color: NAVY, width: 1.5 }, objectName: "Aspek" });
    s.addShape(pres.ShapeType.ellipse, { x: x + 0.1, y: y + 0.1, w: 0.4, h: 0.4, fill: { color: GOLD }, line: { color: GOLD, width: 0 } });
    T(s, n, x + 0.1, y + 0.1, 0.4, 0.4, { fontSize: 15, bold: true, color: WHITE, align: "center", valign: "middle" });
    T(s, t, x + 0.6, y, cw12 - 0.65, 0.6, { fontSize: 16, bold: true, valign: "middle" });
  });
  R(s, L + 2 * (cw12 + 0.15), CT + 2.8, cw12, 0.6, RED);
  T(s, "10 daripada 12 mencatat kemajuan", L + 2 * (cw12 + 0.15) + 0.1, CT + 2.8, cw12 - 0.2, 0.6, { fontSize: 14, bold: true, color: WHITE, align: "center", valign: "middle" });
  ph(s, L + 8.5, CT + 1.7, CW - 8.5, 1.7, "Usahawan Halal Champion");
  R(s, L, CT + 3.65, CW, 0.95, NAVY, { objectName: "Halal Sukses" });
  T(s, [{ text: "HALAL SUKSES  ", options: { fontSize: 18, bold: true, color: GOLD } }, { text: "bersama KUSKOP terus membimbing PMKS Johor memperoleh pensijilan halal", options: { fontSize: 18, color: WHITE } }], L + 0.3, CT + 3.65, CW - 0.6, 0.95, { valign: "middle" });

  // ===== 12b =====
  s = slide("JUALAN USAHAWAN HALAL CHAMPION MENINGKAT", "PENDEKATAN KEEMPAT");
  R(s, L, CT, 5.0, 2.3, RED, { objectName: "Hero" });
  T(s, "136%", L + 0.3, CT + 0.1, 4.4, 1.2, { fontSize: 76, bold: true, color: WHITE, valign: "middle" });
  T(s, [{ text: "S'mores by Alkaff", options: { fontSize: 22, bold: true, breakLine: true } }, { text: "naik taraf daripada perusahaan mikro kepada syarikat kecil", options: { fontSize: 16 } }], L + 0.3, CT + 1.3, 4.5, 0.95, { color: WHITE });
  const sw = (CW - 5.15 - 0.15) / 2;
  [["62%", "Elham-Q Edible Oil", "syarikat kecil"], ["50%", "WE1", "syarikat kecil"], ["12.6%", "Salleh Food Industries", "syarikat sederhana"], ["11%", "ADIN Marketing Group", "syarikat sederhana"]].forEach(([v, n, d], i) => {
    const x = L + 5.15 + (i % 2) * (sw + 0.15), y = CT + Math.floor(i / 2) * 1.2;
    R(s, x, y, sw, 1.1, NAVY);
    T(s, v, x + 0.2, y + 0.05, 1.5, 1.0, { fontSize: 32, bold: true, color: WHITE, valign: "middle" });
    T(s, [{ text: n, options: { fontSize: 15, bold: true, breakLine: true } }, { text: d, options: { fontSize: 13 } }], x + 1.75, y, sw - 1.85, 1.1, { color: WHITE, valign: "middle" });
  });
  ph(s, L, CT + 2.45, 5.0, 2.15, "Produk Halal Champion");
  R(s, L + 5.15, CT + 2.45, CW - 5.15, 2.15, LAV);
  T(s, "10/12", L + 5.45, CT + 2.55, 3.0, 1.0, { fontSize: 60, bold: true, color: RED, valign: "middle" });
  T(s, "syarikat yang dinilai telah mencatat kemajuan", L + 8.5, CT + 2.55, CW - 8.7, 1.0, { fontSize: 18, bold: true, valign: "middle" });
  T(s, "Prestasi dinilai melalui kayu pengukur yang diluluskan Majlis Halal Negeri Johor", L + 5.45, CT + 3.65, CW - 5.75, 0.8, { fontSize: 15, color: GREY });

  // ===== 12c =====
  s = slide("JENAMA JOHOR MELUASKAN RANGKAIAN DAN MASUK PASARAN EKSPORT", "PENDEKATAN KEEMPAT");
  [[NAVY, "55", "KOPI RAKYAT", "cawangan", 48], [NAVY, "RM40 juta+", "MUIZ HOT CHICKEN", "jualan; sasar 50 ejen baharu melalui pembiayaan Bank Islam (i-TEKAD, i-BANGKIT)", 34],
   [RED, "EKSPORT", "ELHAM-Q", "Jepun, Sudan dan Bangladesh", 34], [RED, "EKSPORT", "HIJRAH WATER", "Singapura", 34]].forEach(([fill, big, tg, lab, bs], i) => {
    const y = CT + i * 1.18;
    R(s, L, y, 8.0, 1.08, fill, { objectName: "Baris" });
    T(s, big, L + 0.3, y + 0.05, 3.6, 0.65, { fontSize: bs, bold: true, color: WHITE, valign: "middle" });
    tag(s, tg, L + 0.3, y + 0.68, tg.length * 0.115 + 0.4);
    T(s, lab, L + 4.2, y, 3.6, 1.08, { fontSize: 16, color: WHITE, valign: "middle" });
  });
  ph(s, L + 8.2, CT, CW - 8.2, 2.2, "Kopi Rakyat / Muiz Hot Chicken");
  ph(s, L + 8.2, CT + 2.4, CW - 8.2, 2.2, "Produk eksport Johor");

  // ===== 13 =====
  s = slide("LEBIH RM1.3 JUTA GERAN UNTUK MEMPERKASA EKOSISTEM HALAL", "PENDEKATAN KELIMA", "Pendekatan Kelima");
  R(s, L, CT, CW, 0.95, GOLD, { objectName: "Hero" });
  T(s, "LEBIH RM1.3 JUTA", L + 0.3, CT, 7.5, 0.95, { fontSize: 44, bold: true, valign: "middle" });
  T(s, "geran melalui MAINJ dan PIJ", L + 6.8, CT, CW - 7.1, 0.95, { fontSize: 22, bold: true, align: "right", valign: "middle" });
  [["MAINJ", "RM500,000", "membantu 500 peniaga mikro dan kecil menyediakan dokumentasi pensijilan halal", NAVY],
   ["PIJ", "RM200,000", "subsidi 50% yuran kursus profesional halal", NAVY],
   ["PIJ", "RM462,000", "pensijilan halal bagi 154 kantin SAKJ", NAVY],
   ["PIJ · 2027", "RM200,000", "bagi 40 usahawan medan selera pada tahun 2027", RED]].forEach(([a, v, d, fill], i) => {
    const y = CT + 1.05 + i * 0.9;
    R(s, L, y, CW, 0.82, fill, { objectName: "Peruntukan" });
    tag(s, a, L + 0.3, y + 0.24, a.length > 5 ? 1.4 : 1.0);
    T(s, v, L + 1.95, y, 3.6, 0.82, { fontSize: 32, bold: true, color: WHITE, valign: "middle" });
    T(s, d, L + 5.7, y, CW - 5.95, 0.82, { fontSize: 18, color: WHITE, valign: "middle" });
  });

  // ===== 14 =====
  s = slide("JOHOR MENYASARKAN INDUSTRI HALAL BERNILAI TINGGI MENJELANG 2030", "SASARAN 2030", "Sasaran dan Penutup");
  sub(s, "SASARAN 2030 – PENSIJILAN DAN TENAGA KERJA", L, CT - 0.05, 8.6);
  const w14 = 4.2;
  nb(s, L, CT + 0.35, w14, 1.5, NAVY, "5,000", "syarikat baharu bersijil halal", { vs: 44, ls: 17 });
  nb(s, L + w14 + 0.2, CT + 0.35, w14, 1.5, NAVY, "4,000", "tenaga kerja mahir halal", { vs: 44, ls: 17 });
  sub(s, "SASARAN 2030 – EKONOMI", L, CT + 2.0, 8.6);
  nb(s, L, CT + 2.4, w14, 2.2, RED, "RM24 bilion", "sumbangan kepada KDNK negeri", { vs: 32, ls: 18, lb: true, top: 0.4 });
  [["RM18 bilion", "nilai eksport halal"], ["RM5 bilion", "pelaburan terkumpul"]].forEach(([v, l], i) => {
    const y = CT + 2.4 + i * 1.15;
    R(s, L + w14 + 0.2, y, w14, 1.05, LAV);
    T(s, [{ text: v, options: { fontSize: 28, bold: true, breakLine: true } }, { text: l, options: { fontSize: 16 } }], L + w14 + 0.45, y, w14 - 0.5, 1.05, { valign: "middle" });
  });
  phc(s, L + 8.8, CT + 0.35, CW - 8.8, 4.25, 1.75, "Industri halal Johor", [
    { text: "SETAKAT INI", options: { fontSize: 14, bold: true, color: GOLD, breakLine: true } },
    { text: "1,298 syarikat baharu bersijil = 26% daripada sasaran 5,000", options: { fontSize: 17, bold: true, color: WHITE } }]);

  // ===== 15 =====
  s = pres.addSlide({ masterName: "PENUTUP", sectionTitle: sec });
  phBg(s, "Dewan Negeri Johor (hitam putih, pudar)");
  s.addImage({ path: LOGO, x: 4.87, y: 0.35, w: 3.6, h: 1.09 });
  twoBar(s, W / 2, 1.6);
  T(s, "HALAL BUKAN SEKADAR SIJIL", 1, 1.75, W - 2, 0.9, { fontSize: 42, bold: true, align: "center", valign: "middle" });
  [["home", "Makanan yang bersih dan selamat untuk keluarga"], ["store", "Pasaran yang lebih luas untuk usahawan"],
   ["grad", "Pekerjaan untuk anak muda"], ["help", "Kesejahteraan untuk seluruh rakyat Johor"]].forEach(([k, t], i) => {
    const bw15 = (CW - 0.2) / 2, x = L + (i % 2) * (bw15 + 0.2), y = 2.95 + Math.floor(i / 2) * 1.25;
    s.addShape(pres.ShapeType.rect, { x, y, w: bw15, h: 1.1, fill: { color: WHITE }, line: { color: NAVY, width: 1.5 }, objectName: "Mesej" });
    s.addShape(pres.ShapeType.ellipse, { x: x + 0.25, y: y + 0.2, w: 0.7, h: 0.7, fill: { color: LAV }, line: { color: LAV, width: 0 } });
    s.addImage({ data: ic[k], x: x + 0.25 + 0.18, y: y + 0.2 + 0.18, w: 0.34, h: 0.34 });
    T(s, t, x + 1.2, y, bw15 - 1.4, 1.1, { fontSize: 20, bold: true, valign: "middle" });
  });
  twoBar(s, W / 2, 5.6);
  R(s, L, 5.9, CW, 0.95, NAVY, { objectName: "Komitmen" });
  T(s, "KOMITMEN KERAJAAN NEGERI JOHOR UNTUK TERUS MEMPERKASA INDUSTRI HALAL", L + 0.3, 5.9, CW - 0.6, 0.95, { fontSize: 22, bold: true, color: WHITE, align: "center", valign: "middle" });

  // ===== APPENDIX 16 =====
  s = slide("LAMPIRAN: PENSIJILAN HALAL BAHARU DI NEGERI JOHOR", "LAMPIRAN", "Lampiran");
  const hd = (t, al) => ({ text: t, options: { bold: true, color: WHITE, fill: { color: NAVY }, fontSize: 20, align: al || "left" } });
  const cell = (t, o = {}) => ({ text: t, options: Object.assign({ fontSize: 20, color: NAVY, fill: { color: WHITE } }, o) });
  const alt = { fill: { color: LAV } };
  s.addTable([
    [hd("Tahun"), hd("Pensijilan SPHM Baharu", "center"), hd("Catatan")],
    [cell("2024", { bold: true }), cell("133", { align: "center", bold: true }), cell("Sebelum PKHNJ 2030")],
    [cell("2025", Object.assign({ bold: true }, alt)), cell("561", Object.assign({ align: "center", bold: true }, alt)), cell("-", alt)],
    [cell("2026 (11 Nov)", { bold: true }), cell("737", { align: "center", bold: true }), cell("88% daripada sasaran 839")],
    [cell("Jumlah sejak PKHNJ 2030", { bold: true, fill: { color: GOLDT } }), cell("1,298", { align: "center", bold: true, fill: { color: GOLDT } }), cell("26% daripada sasaran 5,000", { bold: true, fill: { color: GOLDT } })],
  ], { x: L, y: CT + 0.2, w: CW, colW: [4.8, 3.2, 4.13], rowH: 0.8, valign: "middle", border: { type: "solid", color: "C9CFE6", pt: 1 }, margin: [0, 0.2, 0, 0.2] });

  // ===== 17 =====
  s = slide("LAMPIRAN: SENARAI HALAL CHAMPION JOHOR (KOHORT 1)", "LAMPIRAN");
  const co = ["IM Alkaff", "PIJ Manufacturing Sdn. Bhd.", "We1 Manufacturing (M) Sdn. Bhd.", "Azad Food Industries Sdn. Bhd.", "Ara Yasmeen Enterprise",
    "Salleh Food Industries Sdn. Bhd.", "Elham-Q Edible Oil Sdn. Bhd.", "Faiza Food Industries Sdn. Bhd.", "Usahawan Seri Enterprise", "Mak Siti Products (M) Sdn. Bhd.",
    "Muiz Food Industries Sdn. Bhd.", "Maiz Enterprise Sdn. Bhd.", "Eng's Legacy Sdn. Bhd.", "Hijrah Water Sdn. Bhd.", "Jalen Sdn. Bhd.",
    "Ikhwan Zaini Enterprise", "Sparkles Group Sdn. Bhd.", "ADIN Marketing Group Sdn. Bhd. (Haos Ek)", "Kopi Rakyat Sdn. Bhd.", "Umz Bioline Manufacturer Sdn. Bhd."];
  const cw17 = (CW - 0.2) / 2;
  co.forEach((n, i) => {
    const col = Math.floor(i / 10), r = i % 10, x = L + col * (cw17 + 0.2), y = CT - 0.05 + r * 0.47;
    R(s, x, y, cw17, 0.42, LAV, { objectName: "Baris" });
    R(s, x, y, 0.55, 0.42, i % 2 ? RED : NAVY);
    T(s, String(i + 1), x, y, 0.55, 0.42, { fontSize: 16, bold: true, color: WHITE, align: "center", valign: "middle" });
    T(s, n, x + 0.7, y, cw17 - 0.8, 0.42, { fontSize: 16, valign: "middle" });
  });

  // ===== 18 =====
  s = slide("LAMPIRAN: PESERTA LATIHAN HALAL 2026 MENGIKUT PENYEDIA", "LAMPIRAN");
  const tr = [["Al Hamra Management Services PLT", 1190, "35.2%"], ["JHDC", 1117, "33.0%"], ["First Wing", 313, "9.2%"], ["DHMovere", 286, "8.5%"], ["JT Lab", 285, "8.4%"], ["UTM", 193, "5.7%"]];
  T(s, "Penyedia Latihan", L + 0.2, CT - 0.05, 4.5, 0.3, { fontSize: 14, bold: true, color: GREY });
  T(s, "Peserta", L + 4.7, CT - 0.05, 1.3, 0.3, { fontSize: 14, bold: true, color: GREY, align: "right" });
  T(s, "Peratus", L + 6.1, CT - 0.05, 1.3, 0.3, { fontSize: 14, bold: true, color: GREY, align: "right" });
  tr.forEach(([n, v, p], i) => {
    const y = CT + 0.3 + i * 0.57;
    R(s, L, y, CW, 0.5, LAV, { objectName: "Baris" });
    T(s, n, L + 0.2, y, 4.5, 0.5, { fontSize: 17, bold: true, valign: "middle" });
    T(s, v.toLocaleString("en-US"), L + 4.7, y, 1.3, 0.5, { fontSize: 18, bold: true, align: "right", valign: "middle" });
    T(s, p, L + 6.1, y, 1.3, 0.5, { fontSize: 18, bold: true, color: RED, align: "right", valign: "middle" });
    R(s, L + 7.8, y + 0.11, 4.0 * v / 1190, 0.28, i === 0 ? RED : NAVY);
  });
  R(s, L, CT + 3.8, CW, 0.65, NAVY, { objectName: "Jumlah" });
  T(s, "Jumlah", L + 0.2, CT + 3.8, 4.5, 0.65, { fontSize: 18, bold: true, color: WHITE, valign: "middle" });
  T(s, "3,384", L + 4.7, CT + 3.8, 1.3, 0.65, { fontSize: 18, bold: true, color: WHITE, align: "right", valign: "middle" });
  T(s, "100%", L + 6.1, CT + 3.8, 1.3, 0.65, { fontSize: 18, bold: true, color: WHITE, align: "right", valign: "middle" });

  // ===== 19 =====
  s = slide("LAMPIRAN: BILANGAN PESERTA BIMBINGAN JT LAB (HALAL KOTEJ) 2026", "LAMPIRAN");
  const jt = [["KEJORA (2 bengkel halal)", "60"], ["Jabatan Pertanian", "15"], ["Masjid Batu Pahat (16 Julai)", "20 (anggaran)"], ["YAPEIM", "13"], ["JT Lab", "24"],
    ["JT Lab (3–4 Nov)", "43"], ["JT Lab (17–18 Nov)", "18"], ["JT Lab (19–20 Nov)", "20"], ["JT Lab (21–22 Nov)", "72"]];
  const hd2 = (t, al) => ({ text: t, options: { bold: true, color: WHITE, fill: { color: NAVY }, fontSize: 16, align: al || "left" } });
  const c2 = (t, o = {}) => ({ text: t, options: Object.assign({ fontSize: 16, color: NAVY, fill: { color: WHITE } }, o) });
  s.addTable([
    [hd2("Program / rakan"), hd2("Peserta", "right")],
    ...jt.map(([a, b], i) => [c2(a, i % 2 ? alt : {}), c2(b, Object.assign({ align: "right", bold: true }, i % 2 ? alt : {}))]),
    [c2("Jumlah", { bold: true, fill: { color: GOLDT } }), c2("285", { align: "right", bold: true, fill: { color: GOLDT } })],
  ], { x: L, y: CT - 0.05, w: CW, colW: [8.6, 3.53], rowH: 0.42, valign: "middle", border: { type: "solid", color: "C9CFE6", pt: 1 }, margin: [0, 0.2, 0, 0.2] });

  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log("done");
})();
