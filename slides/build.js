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
const OUT = "/home/user/Nawal/slides/A93_Halal_Johor_4x3.pptx";

const THEME = {
  name: "Maju Johor Halal", headFontFace: "Arial", bodyFontFace: "Arial",
  colors: { dk1: "1F2937", lt1: "FFFFFF", dk2: NAVY, lt2: LAV, accent1: NAVY, accent2: RED, accent3: GOLD,
    accent4: "323490", accent5: "6B7280", accent6: "D9DCEB", hlink: NAVY, folHlink: "6B7280" },
};

const pres = new pptxgen();
pres.layout = "LAYOUT_4x3"; // 10 x 7.5 in
pres.theme = { headFontFace: "Arial", bodyFontFace: "Arial" };
pres.title = "Soalan Lisan A93 - Pensijilan Halal dan Industri Halal Negeri Johor";
pres.author = "Pejabat YB Exco Hal Ehwal Agama Islam Johor";

const FOOT = "Jawapan Soalan Lisan A93  |  Belanjawan Johor 2027  |  26 November 2026";
pres.defineSlideMaster({
  title: "KANDUNGAN", background: { color: WHITE },
  objects: [
    { rect: { x: 0, y: 0, w: 3.2, h: 0.07, fill: { color: RED } } },
    { rect: { x: 3.2, y: 0, w: 6.8, h: 0.07, fill: { color: NAVY } } },
    { image: { x: 7.0, y: 0.15, w: 2.6, h: 0.79, path: LOGO } },
    { placeholder: { options: { name: "title", type: "title", x: 0.5, y: 1.05, w: 9.0, h: 0.9, fontSize: 24, bold: true,
        color: NAVY, align: "left", valign: "middle", margin: 0 }, text: "" } },
    { text: { text: FOOT, options: { x: 0.5, y: 7.1, w: 7, h: 0.25, fontSize: 10, color: GREY, margin: 0 } } },
  ],
  slideNumber: { x: 8.8, y: 7.1, w: 0.7, h: 0.25, fontSize: 10, color: GREY, align: "right" },
});
pres.defineSlideMaster({ title: "PENUTUP", background: { color: WHITE }, objects: [] });

// ---------- helpers ----------
function T(s, text, x, y, w, h, o = {}) {
  s.addText(text, Object.assign({ x, y, w, h, fontSize: 14, color: NAVY, valign: "top", margin: 0, isTextBox: true }, o));
}
function R(s, x, y, w, h, fill, o = {}) {
  s.addShape(pres.ShapeType.rect, Object.assign({ x, y, w, h, fill: { color: fill }, line: { color: fill, width: 0 } }, o));
}
function tab(s, text) {
  const w = 0.35 + text.length * 0.098;
  s.addShape(pres.ShapeType.rect, { x: 0.5, y: 0.22, w, h: 0.34, fill: { color: WHITE }, line: { color: RED, width: 1.25 }, objectName: "Label Seksyen" });
  T(s, text, 0.5, 0.22, w, 0.34, { fontSize: 11, bold: true, align: "center", valign: "middle" });
}
function ph(s, x, y, w, h, label) {
  s.addShape(pres.ShapeType.rect, { x, y, w, h, fill: { color: PHC }, line: { color: "8A94C4", width: 1.25, dashType: "dash" }, objectName: "Ruang Gambar" });
  T(s, [
    { text: "GAMBAR", options: { fontSize: 14, bold: true, color: "5A6499", breakLine: true } },
    { text: label, options: { fontSize: 12, color: "5A6499", breakLine: true } },
    { text: "Ruang gambar sebenar (boleh diganti)", options: { fontSize: 10, italic: true, color: "6B74A3" } },
  ], x + 0.15, y, w - 0.3, h, { align: "center", valign: "middle" });
}
// photo with navy caption box at the bottom (reference style)
function phBg(s, label) {
  s.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: 10, h: 7.5, fill: { color: PHC }, line: { color: "8A94C4", width: 1.25, dashType: "dash" }, objectName: "Ruang Gambar Latar" });
  T(s, "GAMBAR LATAR: " + label + "  (ruang gambar sebenar, boleh diganti)", 0.5, 7.0, 9.0, 0.3, { fontSize: 11, italic: true, color: "6B74A3", align: "center" });
}
function phc(s, x, y, w, h, capH, label, runs) {
  ph(s, x, y, w, h - capH, label);
  R(s, x, y + h - capH, w, capH, NAVY, { objectName: "Kapsyen" });
  T(s, runs, x + 0.15, y + h - capH, w - 0.3, capH, { valign: "middle" });
}
function sub(s, text, x, y, w) { T(s, text, x, y, w, 0.3, { fontSize: 13, bold: true, color: GOLD }); }
function tag(s, text, x, y, w, fill = GOLD, color = NAVY) {
  R(s, x, y, w, 0.28, fill);
  T(s, text, x, y, w, 0.28, { fontSize: 11, bold: true, color, align: "center", valign: "middle" });
}
// colored block: big value then label
function nb(s, x, y, w, h, fill, val, label, o = {}) {
  R(s, x, y, w, h, fill, { objectName: "Blok Angka" });
  const vs = o.vs || 36, vh = vs / 72 * 1.3, pad = o.pad ?? 0.2, top = o.top ?? 0.12;
  const vc = o.vc || (fill === LAV ? NAVY : WHITE), lc = o.lc || (fill === LAV ? NAVY : WHITE);
  T(s, val, x + pad, y + top, w - 2 * pad, vh, { fontSize: vs, bold: true, color: vc, valign: "middle", align: o.align || "left" });
  T(s, label, x + pad, y + top + vh + 0.03, w - 2 * pad, h - top - vh - 0.1, { fontSize: o.ls || 14, color: lc, align: o.align || "left", bold: !!o.lb });
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
function twoBar(s, cx, y, each = 0.75) {
  R(s, cx - each, y, each, 0.07, RED); R(s, cx, y, each, 0.07, NAVY);
}

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
  s.addImage({ path: LOGO, x: 3.3, y: 0.45, w: 3.4, h: 1.03 });
  twoBar(s, 5, 1.85);
  T(s, "PENSIJILAN HALAL & INDUSTRI HALAL NEGERI JOHOR", 1.0, 2.05, 8.0, 1.7, { fontSize: 34, bold: true, align: "center", valign: "middle" });
  twoBar(s, 5, 3.9);
  T(s, "SOALAN LISAN A93", 1.0, 4.15, 8.0, 0.5, { fontSize: 26, bold: true, align: "center", color: RED });
  T(s, "Dewan Negeri Johor  |  26 November 2026", 1.0, 4.75, 8.0, 0.4, { fontSize: 18, bold: true, align: "center" });
  T(s, "Soalan daripada:", 1.0, 5.45, 8.0, 0.3, { fontSize: 16, align: "center", color: GREY });
  T(s, "YB TUAN NG YAK HOWE (BENTAYAN)", 1.0, 5.8, 8.0, 0.45, { fontSize: 22, bold: true, align: "center", color: "1F2937" });

  // ===== 2 =====
  s = slide("JOHOR MELULUSKAN 1,298 PENSIJILAN HALAL BAHARU", "PENCAPAIAN PENSIJILAN", "Pencapaian");
  T(s, "1,298", 0.5, 2.0, 5.8, 1.5, { fontSize: 88, bold: true, color: RED, valign: "middle" });
  T(s, "permohonan baharu SPHM diluluskan sejak PKHNJ 2030 diperkenalkan sehingga 11 November 2026", 0.5, 3.55, 5.7, 0.85, { fontSize: 16 });
  ph(s, 6.4, 2.1, 3.1, 2.3, "Penyampaian sijil halal");
  nb(s, 0.5, 4.6, 2.9, 1.45, NAVY, "1,743", "pemegang SPHM aktif");
  nb(s, 3.55, 4.6, 2.9, 1.45, NAVY, "4,321", "sijil halal aktif");
  nb(s, 6.6, 4.6, 2.9, 1.45, RED, "93%", "permohonan diluluskan dalam 30 hari bekerja");
  R(s, 0.5, 6.2, 9.0, 0.7, GOLD, { objectName: "Kedudukan" });
  T(s, [{ text: "KEDUA ", options: { bold: true, fontSize: 22 } }, { text: "di Malaysia selepas Selangor", options: { bold: true, fontSize: 18 } }], 0.5, 6.2, 9.0, 0.7, { align: "center", valign: "middle" });

  // ===== 3 =====
  s = slide("PENSIJILAN HALAL JOHOR MENINGKAT LEBIH LIMA KALI GANDA", "PERTUMBUHAN PENSIJILAN");
  R(s, 0.5, 2.1, 5.7, 4.8, LAV, { objectName: "Panel Carta" });
  T(s, "PENSIJILAN SPHM BAHARU", 0.7, 2.22, 5.3, 0.3, { fontSize: 14, bold: true });
  s.addChart(pres.charts.BAR, [{ name: "Pensijilan SPHM baharu", labels: ["2024", "2025", "2026*"], values: [133, 561, 737] }], {
    x: 0.6, y: 2.6, w: 5.5, h: 3.8, barDir: "col", chartColors: [NAVY, NAVY, RED], barGapWidthPct: 45,
    showValue: true, dataLabelPosition: "outEnd", dataLabelFontSize: 20, dataLabelFontBold: true, dataLabelColor: NAVY, dataLabelFontFace: "+mn-lt",
    catAxisLabelFontSize: 16, catAxisLabelColor: NAVY, catAxisLabelFontFace: "+mn-lt", catAxisLabelFontBold: true,
    valAxisHidden: true, valGridLine: { style: "none" }, catGridLine: { style: "none" }, valAxisMaxVal: 900, valAxisMinVal: 0, showLegend: false,
  });
  T(s, "* 2026: setakat 11 November", 0.7, 6.5, 5.3, 0.3, { fontSize: 12, color: GREY });
  R(s, 6.4, 2.1, 3.1, 2.45, NAVY, { objectName: "Pencapaian 2026" });
  T(s, "88%", 6.6, 2.2, 2.7, 1.0, { fontSize: 56, bold: true, color: WHITE, valign: "middle" });
  T(s, "daripada sasaran tahunan 839", 6.6, 3.25, 2.7, 0.5, { fontSize: 15, bold: true, color: WHITE });
  R(s, 6.6, 3.95, 2.7, 0.28, "3A4AA0"); R(s, 6.6, 3.95, 2.7 * 0.88, 0.28, GOLD);
  nb(s, 6.4, 4.7, 3.1, 1.2, RED, "LEBIH 5×", "berbanding 2024 (133)", { vs: 30 });
  R(s, 6.4, 6.05, 3.1, 0.85, LAV);
  T(s, [{ text: "Sasaran 2026: ", options: { fontSize: 14 } }, { text: "839", options: { fontSize: 24, bold: true } }], 6.4, 6.05, 3.1, 0.85, { align: "center", valign: "middle" });

  // ===== 4 =====
  s = slide("USAHAWAN BUMIPUTERA SEMAKIN YAKIN MENCEBURI INDUSTRI HALAL", "PENGLIBATAN BUMIPUTERA");
  R(s, 0.5, 2.1, 4.4, 4.0, LAV, { objectName: "Panel Donut" });
  T(s, "SYARIKAT BAHARU 2026", 0.7, 2.2, 4.0, 0.3, { fontSize: 14, bold: true, align: "center" });
  s.addChart(pres.charts.DOUGHNUT, [{ name: "Bumiputera", labels: ["Bumiputera", "Lain-lain"], values: [77.6, 22.4] }], {
    x: 1.0, y: 2.55, w: 3.4, h: 2.9, holeSize: 66, chartColors: [RED, "D9DCEB"], showLegend: false,
    showLabel: false, showValue: false, showPercent: false, dataBorder: { pt: 0, color: "EEF0F6" },
  });
  T(s, "77.6%", 2.1, 3.55, 1.2, 0.9, { fontSize: 24, bold: true, color: RED, align: "center", valign: "middle" });
  R(s, 0.7, 5.62, 0.28, 0.28, RED);
  T(s, "342 daripada 441 syarikat baharu ialah usahawan Bumiputera", 1.1, 5.55, 3.7, 0.5, { fontSize: 13, bold: true });
  nb(s, 5.1, 2.1, 4.4, 2.0, NAVY, "441", "syarikat baharu memohon melalui JAINJ pada tahun 2026", { vs: 52 });
  R(s, 5.1, 4.25, 4.4, 1.85, LAV);
  tag(s, "PERBANDINGAN", 5.3, 4.37, 1.5, NAVY, WHITE);
  T(s, "38%", 5.3, 4.7, 4.0, 0.7, { fontSize: 44, bold: true, color: NAVY, valign: "middle" });
  T(s, "pemegang sijil sedia ada ialah usahawan Bumiputera", 5.3, 5.45, 4.0, 0.55, { fontSize: 14 });
  R(s, 0.5, 6.25, 9.0, 0.65, NAVY);
  T(s, "77.6% ialah bahagian daripada 441 syarikat baharu, bukan seluruh pemegang sijil", 0.7, 6.25, 8.6, 0.65, { fontSize: 14, bold: true, color: WHITE, valign: "middle" });

  // ===== 5 =====
  s = slide("HALAL BUKAN SEKADAR LABEL, TETAPI JAMINAN BERSIH, SELAMAT DAN BERKUALITI", "KEPENTINGAN HALAL");
  [["BERSIH", "clean"], ["SELAMAT", "safe"], ["BERKUALITI", "qual"]].forEach(([l, k], i) => {
    const x = 0.5 + i * 3.05;
    R(s, x, 2.1, 2.9, 1.3, NAVY, { objectName: "Blok" });
    s.addImage({ data: ic[k], x: x + 0.2, y: 2.45, w: 0.6, h: 0.6 });
    T(s, l, x + 1.0, 2.1, 1.85, 1.3, { fontSize: 18, bold: true, color: WHITE, valign: "middle" });
  });
  T(s, "Halalan Toyyiban: daripada bahan mentah hinggalah ke pinggan rakyat", 0.5, 3.55, 9.0, 0.5, { fontSize: 16, bold: true, valign: "middle" });
  sub(s, "PERBELANJAAN PENGGUNA MUSLIM GLOBAL", 0.5, 4.2, 9);
  nb(s, 0.5, 4.55, 4.0, 1.5, NAVY, "USD2.60 trilion", "pada tahun 2024", { vs: 28, lb: true, ls: 15 });
  T(s, "➜", 4.5, 4.55, 1.0, 1.5, { fontSize: 40, bold: true, color: GOLD, align: "center", valign: "middle" });
  nb(s, 5.5, 4.55, 4.0, 1.5, RED, "USD3.56 trilion", "unjuran menjelang 2029", { vs: 28, lb: true, ls: 15 });
  R(s, 0.5, 6.2, 9.0, 0.7, GOLD, { objectName: "Indeks" });
  T(s, "Malaysia kekal di kedudukan pertama Indeks Ekonomi Islam Global", 0.5, 6.2, 9.0, 0.7, { fontSize: 15, bold: true, align: "center", valign: "middle" });

  // ===== 6a =====
  s = slide("PKHNJ 2030 MENJADI PEMACU PEMBANGUNAN INDUSTRI HALAL JOHOR", "HALA TUJU", "Pelan dan Pendekatan");
  nb(s, 0.5, 2.1, 1.65, 2.1, NAVY, "7", "hala tuju strategik", { vs: 44, pad: 0.15, ls: 14 });
  nb(s, 2.28, 2.1, 1.65, 2.1, NAVY, "21", "inisiatif", { vs: 44, pad: 0.15, ls: 14 });
  nb(s, 4.06, 2.1, 1.65, 2.1, NAVY, "33", "agensi dalam Taskforce", { vs: 44, pad: 0.15, ls: 14 });
  R(s, 0.5, 4.35, 5.21, 0.65, NAVY);
  T(s, "JAINJ sebagai urus setia", 0.5, 4.35, 5.21, 0.65, { fontSize: 18, bold: true, color: WHITE, align: "center", valign: "middle" });
  R(s, 0.5, 5.15, 5.21, 1.55, RED, { objectName: "Tarikh" });
  T(s, [{ text: "25 FEBRUARI 2026", options: { fontSize: 24, bold: true, breakLine: true } }, { text: "Diluluskan Majlis Mesyuarat Kerajaan Negeri", options: { fontSize: 15 } }], 0.7, 5.15, 4.8, 1.55, { color: WHITE, valign: "middle" });
  phc(s, 5.9, 2.1, 3.6, 4.6, 1.3, "Majlis pelancaran PKHNJ 2030", [
    { text: "PRA-PELANCARAN", options: { fontSize: 12, bold: true, color: GOLD, breakLine: true } },
    { text: "7 Disember 2025", options: { fontSize: 22, bold: true, color: WHITE, breakLine: true } },
    { text: "oleh YAB Menteri Besar Johor", options: { fontSize: 13, color: WHITE } }]);

  // ===== 6b =====
  s = slide("JHDC MENGGERAKKAN PKHNJ 2030 MELALUI TIGA PERANAN", "PERANAN JHDC");
  phc(s, 0.5, 2.1, 3.4, 4.2, 1.2, "YB Exco bersama JHDC", [
    { text: "JHDC", options: { fontSize: 20, bold: true, color: GOLD, breakLine: true } },
    { text: "Johor Halal Development Corporation, anak syarikat PIJ Holdings", options: { fontSize: 12, color: WHITE } }]);
  [["1", "AGENSI FASILITASI HALAL NEGERI JOHOR", "Membimbing pemohon dan memberi sokongan teknikal"],
   ["2", "PENYELARAS PKHNJ 2030", "Menyelaras 21 inisiatif, memantau KPI dan menyatukan laporan kemajuan"],
   ["3", "PLATFORM EKOSISTEM HALAL", "Menghubungkan industri dengan agensi, institusi latihan, pelabur dan pembiaya"]].forEach(([n, a, b], i) => {
    const y = 2.1 + i * 1.45;
    R(s, 4.1, y, 5.4, 0.5, NAVY, { objectName: "Tajuk Peranan" });
    T(s, [{ text: n + "  ", options: { color: GOLD } }, { text: a, options: { color: WHITE } }], 4.25, y, 5.1, 0.5, { fontSize: 13, bold: true, valign: "middle" });
    R(s, 4.1, y + 0.5, 5.4, 0.85, LAV);
    T(s, b, 4.25, y + 0.5, 5.1, 0.85, { fontSize: 14, valign: "middle" });
  });
  R(s, 0.5, 6.45, 9.0, 0.45, RED, { objectName: "Nota Kuasa" });
  T(s, "Kuasa pensijilan kekal pada JAINJ dan JAKIM", 0.5, 6.45, 9.0, 0.45, { fontSize: 16, bold: true, color: WHITE, align: "center", valign: "middle" });

  // ===== 7 =====
  s = slide("PENIAGA KECIL TURUT DIBIMBING MENYERTAI INDUSTRI HALAL", "PENDEKATAN PERTAMA", "Pendekatan Pertama");
  const row = (y, fill, big, tg, label, bs) => {
    R(s, 0.5, y, 5.7, 1.5, fill, { objectName: "Baris" });
    T(s, big, 0.7, y + 0.15, 2.7, 0.75, { fontSize: bs, bold: true, color: WHITE, valign: "middle" });
    tag(s, tg, 0.7, y + 1.0, 1.1);
    T(s, label, 3.4, y, 2.65, 1.5, { fontSize: 14, color: WHITE, valign: "middle" });
  };
  row(2.1, NAVY, "RM500,000", "MAINJ", "membantu 500 peniaga mikro dan kecil menyediakan dokumentasi pensijilan halal", 32);
  row(3.75, NAVY, "44", "PBT", "peniaga di bawah PBT telah mula dibantu", 44);
  row(5.4, RED, "40", "PIJ · 2027", "usahawan medan selera akan dibimbing sehingga memperoleh pensijilan halal (perancangan 2027)", 44);
  ph(s, 6.4, 2.1, 3.1, 2.1, "Peniaga kecil / medan selera");
  R(s, 6.4, 4.35, 3.1, 2.55, LAV);
  T(s, "Hampir 3,000 peserta latihan kesedaran halal tahun ini", 6.55, 4.4, 2.8, 0.7, { fontSize: 13, bold: true, valign: "middle" });
  ["MBJB", "MBPG", "MPKu", "MBIP", "JAINJ", "JHDC", "UTM", "JT Lab"].forEach((c, i) => {
    const x = 6.55 + (i % 2) * 1.45, y = 5.15 + Math.floor(i / 2) * 0.42;
    R(s, x, y, 1.35, 0.36, WHITE);
    T(s, c, x, y, 1.35, 0.36, { fontSize: 13, bold: true, align: "center", valign: "middle" });
  });

  // ===== 8 =====
  s = slide("USAHA HALAL DIPERLUAS DARI MEDAN SELERA HINGGA KE SEKOLAH", "PEMERKASAAN KOMUNITI");
  [["HALAL KOTEJ – JT LAB", "Usahawan asnaf dan peniaga", "285", "peserta dibimbing pada 2026", ["Usahawan asnaf dan peniaga", "KEJORA, Jabatan Pertanian, YAPEIM dan masjid"]],
   ["KANTIN SEKOLAH AGAMA JOHOR", "Kantin sekolah", "129/133", "kantin bersijil halal pada 2026", ["4 lagi dalam proses audit", "2025: 154 kantin bersijil (RM462,000 PIJ)"]],
   ["JAMINAN SUMBER MAKANAN", "Rumah sembelihan", "43", "rumah sembelihan bersijil halal", ["2 lagi dalam tindakan", "50 dapur KEMAS: semakan dokumentasi"]]].forEach(([hd, pl, big, lab, bl], i) => {
    const x = 0.5 + i * 3.05;
    ph(s, x, 2.1, 2.9, 1.5, pl);
    R(s, x, 3.6, 2.9, 0.7, NAVY, { objectName: "Tajuk Panel" });
    T(s, hd, x + 0.12, 3.6, 2.66, 0.7, { fontSize: 14, bold: true, color: WHITE, align: "center", valign: "middle" });
    R(s, x, 4.3, 2.9, 2.6, LAV, { objectName: "Badan Panel" });
    T(s, big, x + 0.15, 4.38, 2.6, 0.7, { fontSize: 38, bold: true, color: RED, valign: "middle" });
    T(s, lab, x + 0.15, 5.08, 2.6, 0.5, { fontSize: 14, bold: true });
    T(s, bl.map((t, j) => ({ text: t, options: { bullet: true, breakLine: j < bl.length - 1 } })), x + 0.15, 5.65, 2.65, 1.2, { fontSize: 13, paraSpaceAfter: 3 });
  });

  // ===== 9 =====
  s = slide("PENSIJILAN HALAL MEMBUKA PELUANG JOHOR KE PASARAN ANTARABANGSA", "PENDEKATAN KEDUA", "Pendekatan Kedua");
  s.addShape(pres.ShapeType.homePlate, { x: 0.5, y: 2.1, w: 3.35, h: 1.2, fill: { color: NAVY }, line: { color: NAVY, width: 0 }, objectName: "Langkah 1" });
  s.addShape(pres.ShapeType.chevron, { x: 3.2, y: 2.1, w: 3.4, h: 1.2, fill: { color: GOLD }, line: { color: GOLD, width: 0 }, objectName: "Langkah 2" });
  s.addShape(pres.ShapeType.chevron, { x: 5.95, y: 2.1, w: 3.55, h: 1.2, fill: { color: RED }, line: { color: RED, width: 0 }, objectName: "Langkah 3" });
  T(s, [{ text: "15 HARI", options: { fontSize: 24, bold: true, breakLine: true } }, { text: "Halal Green Lane (hari bekerja)", options: { fontSize: 12 } }], 0.7, 2.1, 2.5, 1.2, { color: WHITE, valign: "middle" });
  T(s, [{ text: "42 PRODUK", options: { fontSize: 22, bold: true, breakLine: true } }, { text: "SPHM PRefChem", options: { fontSize: 12 } }], 3.95, 2.1, 2.35, 1.2, { color: NAVY, valign: "middle" });
  T(s, [{ text: "INDONESIA & INDIA", options: { fontSize: 16, bold: true, breakLine: true } }, { text: "pasaran antarabangsa", options: { fontSize: 12 } }], 6.7, 2.1, 2.6, 1.2, { color: WHITE, valign: "middle" });
  R(s, 0.5, 3.45, 9.0, 0.6, LAV);
  T(s, "Indonesia wajibkan pensijilan halal bagi produk kimia mulai 18 Oktober 2026", 0.7, 3.45, 8.6, 0.6, { fontSize: 14, bold: true, valign: "middle" });
  [["PREFCHEM, PENGERANG", ["Syarikat petrokimia di Pengerang", "SPHM bagi 42 produk", "Bersedia jadi pembekal bahan mentah petrokimia halal ke Indonesia dan rantau"], "Kilang PRefChem"],
   ["COLORCON MALAYSIA", ["Syarikat multinasional dari Amerika Syarikat", "SPHM melalui bimbingan JHDC", "Menembusi pasaran Indonesia dan India"], "Colorcon Malaysia"]].forEach(([n, b, p], i) => {
    const x = 0.5 + i * 4.6;
    R(s, x, 4.2, 4.4, 0.45, NAVY, { objectName: "Tajuk Syarikat" });
    T(s, n === "PREFCHEM, PENGERANG" ? "PRefChem, Pengerang".toUpperCase().replace("PREFCHEM", "PRefChem") : n, x + 0.15, 4.2, 4.1, 0.45, { fontSize: 14, bold: true, color: WHITE, valign: "middle" });
    R(s, x, 4.65, 4.4, 2.25, LAV);
    T(s, b.map((t, j) => ({ text: t, options: { bullet: true, breakLine: j < b.length - 1 } })), x + 0.15, 4.75, 2.75, 2.05, { fontSize: 13, paraSpaceAfter: 4 });
    ph(s, x + 3.0, 4.8, 1.3, 1.95, p);
  });

  // ===== 10 =====
  s = slide("JOHOR MEREKODKAN RM790.91 JUTA PELABURAN INDUSTRI HALAL", "PELABURAN HALAL");
  R(s, 0.5, 2.1, 5.6, 1.75, NAVY, { objectName: "Hero" });
  tag(s, "DILULUSKAN SEHINGGA JUN 2026", 0.7, 2.22, 2.9);
  T(s, "RM790.91 juta", 0.7, 2.6, 5.2, 0.8, { fontSize: 40, bold: true, color: WHITE, valign: "middle" });
  T(s, "pelaburan industri halal diluluskan", 0.7, 3.4, 5.2, 0.35, { fontSize: 14, color: WHITE });
  nb(s, 6.25, 2.1, 3.25, 1.75, RED, "27", "projek pelaburan, kedudukan kedua di peringkat nasional", { vs: 38, ls: 13 });
  ["Paris Baguette Halal Hub, Nusajaya", "Ellaziq, Simpang Renggam"].forEach((t, i) => {
    const x = 0.5 + i * 4.6;
    R(s, x, 4.0, 4.4, 0.7, LAV);
    T(s, [{ text: "CONTOH  ", options: { fontSize: 11, bold: true, color: GOLD } }, { text: t, options: { fontSize: 14, bold: true } }], x + 0.15, 4.0, 4.1, 0.7, { valign: "middle" });
  });
  R(s, 0.5, 4.85, 9.0, 0.45, NAVY);
  T(s, "TAMAN HALMAS, POIC TANJUNG LANGSAT", 0.7, 4.85, 5.5, 0.45, { fontSize: 14, bold: true, color: WHITE, valign: "middle" });
  tag(s, "PELABURAN DIREALISASIKAN", 6.5, 4.935, 2.85, GOLD, NAVY);
  nb(s, 0.5, 5.45, 2.9, 1.45, RED, "RM2.256 bilion", "pelaburan direalisasikan", { vs: 24, ls: 14 });
  nb(s, 3.55, 5.45, 2.9, 1.45, NAVY, "2,342", "peluang pekerjaan diwujudkan", { vs: 34, ls: 14 });
  ph(s, 6.6, 5.45, 2.9, 1.45, "Kilang / Taman HALMAS");

  // ===== 11a =====
  s = slide("INDUSTRI HALAL MELAHIRKAN TENAGA KERJA MAHIR JOHOR", "PENDEKATAN KETIGA", "Pendekatan Ketiga");
  nb(s, 0.5, 2.1, 5.0, 2.0, NAVY, "3,384", "peserta dilatih dalam bidang halal pada tahun 2026 melalui enam penyedia latihan", { vs: 60, ls: 15 });
  ph(s, 5.65, 2.1, 3.85, 2.0, "Latihan halal");
  sub(s, "SUBSIDI KURSUS EKSEKUTIF HALAL DAN JURUAUDIT DALAMAN HALAL (PIJ)", 0.5, 4.3, 9);
  nb(s, 0.5, 4.65, 2.9, 1.35, LAV, "50%", "subsidi yuran kursus", { vs: 38, vc: RED });
  nb(s, 3.55, 4.65, 2.9, 1.35, LAV, "RM1,650", "setiap peserta daripada yuran RM3,300", { vs: 30, vc: RED, ls: 13 });
  nb(s, 6.6, 4.65, 2.9, 1.35, RED, "116", "peserta menerima manfaat", { vs: 38 });
  R(s, 0.5, 6.15, 9.0, 0.75, NAVY);
  T(s, "Graduan Eksekutif Halal UTM, UTHM dan KUIJSI dipadankan terus dengan industri bersama JTDC", 0.7, 6.15, 8.6, 0.75, { fontSize: 14, bold: true, color: WHITE, valign: "middle" });

  // ===== 11b =====
  s = slide("TVET HALAL MELATIH ANAK ASNAF MENJADI TENAGA KERJA MAHIR", "PENDEKATAN KETIGA");
  R(s, 0.5, 2.1, 2.9, 1.0, NAVY); T(s, "70", 0.5, 2.1, 2.9, 1.0, { fontSize: 44, bold: true, color: WHITE, align: "center", valign: "middle" });
  T(s, "peserta asnaf dilatih sehingga November 2026 (pembiayaan MAINJ)", 3.55, 2.1, 2.5, 1.0, { fontSize: 14, valign: "middle" });
  T(s, "▼", 0.5, 3.1, 2.9, 0.3, { fontSize: 16, color: GOLD, align: "center", valign: "middle" });
  R(s, 0.8, 3.4, 2.3, 1.0, RED); T(s, "55", 0.8, 3.4, 2.3, 1.0, { fontSize: 44, bold: true, color: WHITE, align: "center", valign: "middle" });
  T(s, [{ text: "78.6%", options: { fontSize: 24, bold: true, color: RED, breakLine: true } }, { text: "telah bekerja", options: { fontSize: 14 } }], 3.55, 3.4, 2.5, 1.0, { valign: "middle" });
  ph(s, 6.2, 2.1, 3.3, 2.3, "Peserta TVET Halal");
  sub(s, "PENEMPATAN MENGIKUT KOHORT", 0.5, 4.6, 9);
  const bar = (y, tagText, subText, segs, legend) => {
    R(s, 0.5, y, 9.0, 1.0, LAV);
    T(s, [{ text: tagText, options: { bold: true, fontSize: 15, breakLine: true } }, { text: subText, options: { fontSize: 14 } }], 0.7, y, 1.7, 1.0, { valign: "middle" });
    let x = 2.5; const full = 6.8;
    segs.forEach(([p, col, tx, tc]) => {
      const w = full * p / 100;
      R(s, x, y + 0.12, w, 0.5, col, { line: { color: LAV, width: 1 } });
      T(s, tx, x, y + 0.12, w, 0.5, { fontSize: 13, bold: true, color: tc, align: "center", valign: "middle" });
      x += w;
    });
    if (legend) T(s, legend, 2.5, y + 0.67, 6.8, 0.28, { fontSize: 12, color: GREY });
  };
  bar(4.95, "KOHORT 1", "20 peserta", [[100, NAVY, "100% penempatan pekerjaan", WHITE]]);
  bar(6.0, "KOHORT 2", "50 peserta", [[70, NAVY, "70% bekerja", WHITE], [20, RED, "20% praktikal", WHITE], [10, GOLD, "10%", NAVY]], "20% masih menjalani latihan praktikal  |  10% melanjutkan pengajian");

  // ===== 12a =====
  s = slide("USAHAWAN JOHOR DIBIMBING MENJADI PEMAIN INDUSTRI HALAL YANG BERDAYA SAING", "PENDEKATAN KEEMPAT", "Pendekatan Keempat");
  R(s, 0.5, 2.1, 3.3, 1.5, NAVY, { objectName: "Hero" });
  T(s, "20", 0.7, 2.1, 1.4, 1.5, { fontSize: 58, bold: true, color: WHITE, valign: "middle" });
  T(s, "PMKS jenama asal Johor", 2.1, 2.1, 1.6, 1.5, { fontSize: 15, bold: true, color: WHITE, valign: "middle" });
  R(s, 3.95, 2.1, 5.55, 1.5, LAV);
  R(s, 3.95, 2.1, 0.08, 1.5, RED);
  T(s, [{ text: "HALAL CHAMPION JOHOR", options: { fontSize: 15, bold: true, color: RED, breakLine: true } },
        { text: "Dirintis TWRJ, digerakkan bersama PUJB. Usahawan dicalonkan agensi melalui MPUN.", options: { fontSize: 14 } }], 4.2, 2.1, 5.15, 1.5, { valign: "middle" });
  sub(s, "LIMA ASPEK INTERVENSI", 0.5, 3.8, 5);
  [["1", "Pensijilan halal"], ["2", "Pembiayaan"], ["3", "Penjenamaan"], ["4", "Pembungkusan"], ["5", "Pemasaran"]].forEach(([n, t], i) => {
    const x = 0.5 + (i % 2) * 2.7, y = 4.15 + Math.floor(i / 2) * 0.65;
    s.addShape(pres.ShapeType.rect, { x, y, w: 2.6, h: 0.55, fill: { color: WHITE }, line: { color: NAVY, width: 1.25 }, objectName: "Aspek" });
    s.addShape(pres.ShapeType.ellipse, { x: x + 0.08, y: y + 0.1, w: 0.35, h: 0.35, fill: { color: GOLD }, line: { color: GOLD, width: 0 } });
    T(s, n, x + 0.08, y + 0.1, 0.35, 0.35, { fontSize: 13, bold: true, color: WHITE, align: "center", valign: "middle" });
    T(s, t, x + 0.5, y, 2.05, 0.55, { fontSize: 13, bold: true, valign: "middle" });
  });
  R(s, 3.2, 5.45, 2.6, 0.55, RED);
  T(s, "10 daripada 12 mencatat kemajuan", 3.25, 5.45, 2.5, 0.55, { fontSize: 12, bold: true, color: WHITE, align: "center", valign: "middle" });
  ph(s, 6.0, 3.8, 3.5, 2.2, "Usahawan Halal Champion");
  R(s, 0.5, 6.15, 9.0, 0.75, NAVY, { objectName: "Halal Sukses" });
  T(s, [{ text: "HALAL SUKSES  ", options: { fontSize: 14, bold: true, color: GOLD } }, { text: "bersama KUSKOP terus membimbing PMKS Johor memperoleh pensijilan halal", options: { fontSize: 14, color: WHITE } }], 0.7, 6.15, 8.6, 0.75, { valign: "middle" });

  // ===== 12b =====
  s = slide("JUALAN USAHAWAN HALAL CHAMPION MENINGKAT", "PENDEKATAN KEEMPAT");
  R(s, 0.5, 2.1, 4.4, 2.3, RED, { objectName: "Hero" });
  T(s, "136%", 0.7, 2.2, 4.0, 1.1, { fontSize: 66, bold: true, color: WHITE, valign: "middle" });
  T(s, [{ text: "S'mores by Alkaff", options: { fontSize: 17, bold: true, breakLine: true } }, { text: "naik taraf daripada perusahaan mikro kepada syarikat kecil", options: { fontSize: 14 } }], 0.7, 3.35, 4.0, 1.0, { color: WHITE });
  [["62%", "Elham-Q Edible Oil", "syarikat kecil"], ["50%", "WE1", "syarikat kecil"], ["12.6%", "Salleh Food Industries", "syarikat sederhana"], ["11%", "ADIN Marketing Group", "syarikat sederhana"]].forEach(([v, n, d], i) => {
    const x = 5.1 + (i % 2) * 2.25, y = 2.1 + Math.floor(i / 2) * 1.2;
    R(s, x, y, 2.15, 1.1, NAVY);
    T(s, v, x + 0.12, y + 0.05, 1.9, 0.5, { fontSize: 28, bold: true, color: WHITE, valign: "middle" });
    T(s, [{ text: n, options: { fontSize: 12, bold: true, breakLine: true } }, { text: d, options: { fontSize: 11 } }], x + 0.12, y + 0.55, 1.95, 0.52, { color: WHITE });
  });
  ph(s, 0.5, 4.6, 4.4, 2.3, "Produk Halal Champion");
  R(s, 5.1, 4.8, 4.4, 2.1, LAV);
  T(s, "10/12", 5.3, 4.9, 4.0, 0.9, { fontSize: 48, bold: true, color: RED, valign: "middle" });
  T(s, "syarikat yang dinilai telah mencatat kemajuan", 5.3, 5.8, 4.0, 0.5, { fontSize: 14, bold: true });
  T(s, "Prestasi dinilai melalui kayu pengukur yang diluluskan Majlis Halal Negeri Johor", 5.3, 6.3, 4.0, 0.55, { fontSize: 12, color: GREY });

  // ===== 12c =====
  s = slide("JENAMA JOHOR MELUASKAN RANGKAIAN DAN MASUK PASARAN EKSPORT", "PENDEKATAN KEEMPAT");
  [[NAVY, "55", "KOPI RAKYAT", "cawangan", 44], [NAVY, "RM40 juta+", "MUIZ HOT CHICKEN", "jualan; sasar 50 ejen baharu melalui pembiayaan Bank Islam (i-TEKAD, i-BANGKIT)", 26],
   [RED, "EKSPORT", "ELHAM-Q", "Jepun, Sudan dan Bangladesh", 26], [RED, "EKSPORT", "HIJRAH WATER", "Singapura", 26]].forEach(([fill, big, tg, lab, bs], i) => {
    const y = 2.1 + i * 1.2;
    R(s, 0.5, y, 5.8, 1.1, fill, { objectName: "Baris" });
    T(s, big, 0.7, y + 0.08, 2.6, 0.6, { fontSize: bs, bold: true, color: WHITE, valign: "middle" });
    tag(s, tg, 0.7, y + 0.72, tg.length * 0.1 + 0.3);
    T(s, lab, 3.4, y, 2.75, 1.1, { fontSize: 13, color: WHITE, valign: "middle" });
  });
  ph(s, 6.5, 2.1, 3.0, 2.3, "Kopi Rakyat / Muiz Hot Chicken");
  ph(s, 6.5, 4.55, 3.0, 2.35, "Produk eksport Johor");

  // ===== 13 =====
  s = slide("LEBIH RM1.3 JUTA GERAN UNTUK MEMPERKASA EKOSISTEM HALAL", "PENDEKATAN KELIMA", "Pendekatan Kelima");
  R(s, 0.5, 2.1, 9.0, 1.0, GOLD, { objectName: "Hero" });
  T(s, "LEBIH RM1.3 JUTA", 0.7, 2.1, 5.4, 1.0, { fontSize: 38, bold: true, valign: "middle" });
  T(s, "geran melalui MAINJ dan PIJ", 5.5, 2.1, 3.8, 1.0, { fontSize: 18, bold: true, align: "right", valign: "middle" });
  [["MAINJ", "RM500,000", "membantu 500 peniaga mikro dan kecil menyediakan dokumentasi pensijilan halal", NAVY],
   ["PIJ", "RM200,000", "subsidi 50% yuran kursus profesional halal", NAVY],
   ["PIJ", "RM462,000", "pensijilan halal bagi 154 kantin SAKJ", NAVY],
   ["PIJ · 2027", "RM200,000", "bagi 40 usahawan medan selera pada tahun 2027", RED]].forEach(([a, v, d, fill], i) => {
    const y = 3.25 + i * 0.92;
    R(s, 0.5, y, 9.0, 0.84, fill, { objectName: "Peruntukan" });
    tag(s, a, 0.7, y + 0.08, a.length > 5 ? 1.15 : 0.85);
    T(s, v, 0.7, y + 0.36, 3.2, 0.45, { fontSize: 26, bold: true, color: WHITE, valign: "middle" });
    T(s, d, 4.1, y, 5.2, 0.84, { fontSize: 14, color: WHITE, valign: "middle" });
  });

  // ===== 14 =====
  s = slide("JOHOR MENYASARKAN INDUSTRI HALAL BERNILAI TINGGI MENJELANG 2030", "SASARAN 2030", "Sasaran dan Penutup");
  sub(s, "SASARAN 2030 – PENSIJILAN DAN TENAGA KERJA", 0.5, 2.05, 5.9);
  nb(s, 0.5, 2.4, 2.9, 1.6, NAVY, "5,000", "syarikat baharu bersijil halal", { vs: 38 });
  nb(s, 3.55, 2.4, 2.85, 1.6, NAVY, "4,000", "tenaga kerja mahir halal", { vs: 38 });
  sub(s, "SASARAN 2030 – EKONOMI", 0.5, 4.15, 5.9);
  nb(s, 0.5, 4.5, 2.9, 2.4, RED, "RM24 bilion", "sumbangan kepada KDNK negeri", { vs: 26, ls: 15, lb: true, top: 0.35 });
  [["RM18 bilion", "nilai eksport halal"], ["RM5 bilion", "pelaburan terkumpul"]].forEach(([v, l], i) => {
    const y = 4.5 + i * 1.25;
    R(s, 3.55, y, 2.85, 1.15, LAV);
    T(s, [{ text: v, options: { fontSize: 22, bold: true, breakLine: true } }, { text: l, options: { fontSize: 14 } }], 3.7, y, 2.6, 1.15, { valign: "middle" });
  });
  phc(s, 6.55, 2.4, 2.95, 4.5, 1.9, "Industri halal Johor", [
    { text: "SETAKAT INI", options: { fontSize: 12, bold: true, color: GOLD, breakLine: true } },
    { text: "1,298 syarikat baharu bersijil = 26% daripada sasaran 5,000", options: { fontSize: 14, bold: true, color: WHITE } }]);

  // ===== 15 =====
  s = pres.addSlide({ masterName: "PENUTUP", sectionTitle: sec });
  phBg(s, "Dewan Negeri Johor (hitam putih, pudar)");
  s.addImage({ path: LOGO, x: 3.4, y: 0.35, w: 3.2, h: 0.97 });
  twoBar(s, 5, 1.5);
  T(s, "HALAL BUKAN SEKADAR SIJIL", 0.5, 1.65, 9.0, 0.8, { fontSize: 32, bold: true, align: "center", valign: "middle" });
  [["home", "Makanan yang bersih dan selamat untuk keluarga"], ["store", "Pasaran yang lebih luas untuk usahawan"],
   ["grad", "Pekerjaan untuk anak muda"], ["help", "Kesejahteraan untuk seluruh rakyat Johor"]].forEach(([k, t], i) => {
    const x = 0.5 + (i % 2) * 4.6, y = 2.7 + Math.floor(i / 2) * 1.3;
    s.addShape(pres.ShapeType.rect, { x, y, w: 4.4, h: 1.15, fill: { color: WHITE }, line: { color: NAVY, width: 1.5 }, objectName: "Mesej" });
    s.addShape(pres.ShapeType.ellipse, { x: x + 0.2, y: y + 0.25, w: 0.65, h: 0.65, fill: { color: LAV }, line: { color: LAV, width: 0 } });
    s.addImage({ data: ic[k], x: x + 0.2 + 0.17, y: y + 0.25 + 0.17, w: 0.31, h: 0.31 });
    T(s, t, x + 1.05, y, 3.2, 1.15, { fontSize: 16, bold: true, valign: "middle" });
  });
  twoBar(s, 5, 5.45);
  R(s, 0.5, 5.75, 9.0, 1.0, NAVY, { objectName: "Komitmen" });
  T(s, "KOMITMEN KERAJAAN NEGERI JOHOR UNTUK TERUS MEMPERKASA INDUSTRI HALAL", 0.8, 5.75, 8.4, 1.0, { fontSize: 18, bold: true, color: WHITE, align: "center", valign: "middle" });

  // ===== APPENDIX 16 =====
  s = slide("LAMPIRAN: PENSIJILAN HALAL BAHARU DI NEGERI JOHOR", "LAMPIRAN", "Lampiran");
  const hd = (t, al) => ({ text: t, options: { bold: true, color: WHITE, fill: { color: NAVY }, fontSize: 16, align: al || "left" } });
  const cell = (t, o = {}) => ({ text: t, options: Object.assign({ fontSize: 16, color: NAVY, fill: { color: WHITE } }, o) });
  const alt = { fill: { color: LAV } };
  s.addTable([
    [hd("Tahun"), hd("Pensijilan SPHM Baharu", "center"), hd("Catatan")],
    [cell("2024", { bold: true }), cell("133", { align: "center", bold: true }), cell("Sebelum PKHNJ 2030")],
    [cell("2025", Object.assign({ bold: true }, alt)), cell("561", Object.assign({ align: "center", bold: true }, alt)), cell("-", alt)],
    [cell("2026 (11 Nov)", { bold: true }), cell("737", { align: "center", bold: true }), cell("88% daripada sasaran 839")],
    [cell("Jumlah sejak PKHNJ 2030", { bold: true, fill: { color: GOLDT } }), cell("1,298", { align: "center", bold: true, fill: { color: GOLDT } }), cell("26% daripada sasaran 5,000", { bold: true, fill: { color: GOLDT } })],
  ], { x: 0.5, y: 2.4, w: 9.0, colW: [3.4, 2.4, 3.2], rowH: 0.75, valign: "middle", border: { type: "solid", color: "C9CFE6", pt: 1 }, margin: [0, 0.12, 0, 0.12] });

  // ===== 17 =====
  s = slide("LAMPIRAN: SENARAI HALAL CHAMPION JOHOR (KOHORT 1)", "LAMPIRAN");
  const co = ["IM Alkaff", "PIJ Manufacturing Sdn. Bhd.", "We1 Manufacturing (M) Sdn. Bhd.", "Azad Food Industries Sdn. Bhd.", "Ara Yasmeen Enterprise",
    "Salleh Food Industries Sdn. Bhd.", "Elham-Q Edible Oil Sdn. Bhd.", "Faiza Food Industries Sdn. Bhd.", "Usahawan Seri Enterprise", "Mak Siti Products (M) Sdn. Bhd.",
    "Muiz Food Industries Sdn. Bhd.", "Maiz Enterprise Sdn. Bhd.", "Eng's Legacy Sdn. Bhd.", "Hijrah Water Sdn. Bhd.", "Jalen Sdn. Bhd.",
    "Ikhwan Zaini Enterprise", "Sparkles Group Sdn. Bhd.", "ADIN Marketing Group Sdn. Bhd. (Haos Ek)", "Kopi Rakyat Sdn. Bhd.", "Umz Bioline Manufacturer Sdn. Bhd."];
  co.forEach((n, i) => {
    const col = Math.floor(i / 10), r = i % 10, x = 0.5 + col * 4.6, y = 2.1 + r * 0.48;
    R(s, x, y, 4.4, 0.43, LAV, { objectName: "Baris" });
    R(s, x, y, 0.5, 0.43, i % 2 ? RED : NAVY);
    T(s, String(i + 1), x, y, 0.5, 0.43, { fontSize: 14, bold: true, color: WHITE, align: "center", valign: "middle" });
    T(s, n, x + 0.6, y, 3.75, 0.43, { fontSize: 14, valign: "middle", fit: "shrink" });
  });

  // ===== 18 =====
  s = slide("LAMPIRAN: PESERTA LATIHAN HALAL 2026 MENGIKUT PENYEDIA", "LAMPIRAN");
  const tr = [["Al Hamra Management Services PLT", 1190, "35.2%"], ["JHDC", 1117, "33.0%"], ["First Wing", 313, "9.2%"], ["DHMovere", 286, "8.5%"], ["JT Lab", 285, "8.4%"], ["UTM", 193, "5.7%"]];
  T(s, "Penyedia Latihan", 0.5, 2.1, 3.2, 0.3, { fontSize: 13, bold: true, color: GREY });
  T(s, "Peserta", 3.7, 2.1, 1.0, 0.3, { fontSize: 13, bold: true, color: GREY, align: "right" });
  T(s, "Peratus", 4.8, 2.1, 1.0, 0.3, { fontSize: 13, bold: true, color: GREY, align: "right" });
  tr.forEach(([n, v, p], i) => {
    const y = 2.45 + i * 0.6;
    R(s, 0.5, y, 9.0, 0.52, LAV, { objectName: "Baris" });
    T(s, n, 0.65, y, 3.0, 0.52, { fontSize: 14, bold: true, valign: "middle", fit: "shrink" });
    T(s, v.toLocaleString("en-US"), 3.7, y, 1.0, 0.52, { fontSize: 15, bold: true, align: "right", valign: "middle" });
    T(s, p, 4.8, y, 1.0, 0.52, { fontSize: 15, bold: true, color: RED, align: "right", valign: "middle" });
    R(s, 6.05, y + 0.12, 3.3 * v / 1190, 0.28, i === 0 ? RED : NAVY);
  });
  R(s, 0.5, 6.1, 9.0, 0.65, NAVY, { objectName: "Jumlah" });
  T(s, "Jumlah", 0.65, 6.1, 3.0, 0.65, { fontSize: 16, bold: true, color: WHITE, valign: "middle" });
  T(s, "3,384", 3.7, 6.1, 1.0, 0.65, { fontSize: 16, bold: true, color: WHITE, align: "right", valign: "middle" });
  T(s, "100%", 4.8, 6.1, 1.0, 0.65, { fontSize: 16, bold: true, color: WHITE, align: "right", valign: "middle" });

  // ===== 19 =====
  s = slide("LAMPIRAN: BILANGAN PESERTA BIMBINGAN JT LAB (HALAL KOTEJ) 2026", "LAMPIRAN");
  const jt = [["KEJORA (2 bengkel halal)", "60"], ["Jabatan Pertanian", "15"], ["Masjid Batu Pahat (16 Julai)", "20 (anggaran)"], ["YAPEIM", "13"], ["JT Lab", "24"],
    ["JT Lab (3–4 Nov)", "43"], ["JT Lab (17–18 Nov)", "18"], ["JT Lab (19–20 Nov)", "20"], ["JT Lab (21–22 Nov)", "72"]];
  const hd2 = (t, al) => ({ text: t, options: { bold: true, color: WHITE, fill: { color: NAVY }, fontSize: 14, align: al || "left" } });
  const c2 = (t, o = {}) => ({ text: t, options: Object.assign({ fontSize: 14, color: NAVY, fill: { color: WHITE } }, o) });
  s.addTable([
    [hd2("Program / rakan"), hd2("Peserta", "right")],
    ...jt.map(([a, b], i) => [c2(a, i % 2 ? alt : {}), c2(b, Object.assign({ align: "right", bold: true }, i % 2 ? alt : {}))]),
    [c2("Jumlah", { bold: true, fill: { color: GOLDT } }), c2("285", { align: "right", bold: true, fill: { color: GOLDT } })],
  ], { x: 0.5, y: 2.1, w: 9.0, colW: [6.4, 2.6], rowH: 0.43, valign: "middle", border: { type: "solid", color: "C9CFE6", pt: 1 }, margin: [0, 0.12, 0, 0.12] });

  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log("done");
})();
