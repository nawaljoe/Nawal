const pptxgen = require("pptxgenjs");
const path = require("path");
const A = require("./assets");

const OUTFILE = process.argv[2] || path.join(__dirname, "deck.pptx");
const LOGO_SRC = "/home/user/Nawal/slides_pra_perkahwinan/assets";

// ---------- Palette ----------
const NAVY = "25287A";
const INK = "2A2B36";
const MUTED = "6E6656";
const GOLD = "A8864F";
const GOLD_SOFT = "EADDBF";
const CARD = "FFFDF8";
const LINE = "D9CBAE";
const P = {
  sage: { bg: "DFE9DB", deep: "47683F", mid: "A9C3A1" },
  blue: { bg: "DCE5F0", deep: "3D5A80", mid: "A7BCD6" },
  peach: { bg: "F6E0D3", deep: "9A5233", mid: "E2B29A" },
  yellow: { bg: "F5EBC9", deep: "7C6114", mid: "DCC77E" },
  lav: { bg: "E6E0EF", deep: "5B4B82", mid: "BDB1D6" },
  gold: { bg: "EFE4CB", deep: "7A5C28", mid: "D3BC8B" },
};
const HEAD = "Montserrat";
const BODY = "Inter";
const W = 13.333, H = 7.5, MX = 0.6, RX = 12.733;

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
pres.title = "Penambahbaikan Modul Kursus Pra Perkahwinan Islam Negeri Johor";
pres.author = "Pejabat YB Pengerusi Jawatankuasa Hal Ehwal Agama Islam Negeri Johor";
pres.subject = "Jawapan Soalan Lisan A182 - Belanjawan Johor 2027";

const ICON = {};
async function icon(name, color) {
  const k = name + color;
  if (!ICON[k]) ICON[k] = await A.iconPng(name, color);
  return ICON[k];
}

// ---------- Helpers ----------
function T(s, text, o) {
  s.addText(text, Object.assign({ isTextBox: true, margin: 0, fontFace: BODY, color: INK, valign: "top", fontSize: 13 }, o));
}
function shadow() {
  return { type: "outer", color: "5B4A2A", opacity: 0.1, blur: 10, offset: 2, angle: 90 };
}
function rrect(s, x, y, w, h, fill, o = {}) {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, Object.assign({
    x, y, w, h, rectRadius: o.r ?? 0.14,
    fill: { color: fill, transparency: o.transparency || 0 },
    line: o.line ? { color: o.line, width: o.lineW || 0.75, dashType: o.dash || "solid" } : { type: "none" },
    shadow: o.shadow ? shadow() : undefined,
    objectName: o.name,
  }));
}
function circle(s, x, y, d, fill, o = {}) {
  s.addShape(pres.shapes.OVAL, {
    x, y, w: d, h: d,
    fill: fill ? { color: fill } : { type: "none" },
    line: o.line ? { color: o.line, width: o.lineW || 1, dashType: o.dash || "solid" } : { type: "none" },
    shadow: o.shadow ? shadow() : undefined,
  });
}
function line(s, x1, y1, x2, y2, color = LINE, width = 1.25, o = {}) {
  const x = Math.min(x1, x2), y = Math.min(y1, y2);
  const w = Math.max(Math.abs(x2 - x1), 0.001), h = Math.max(Math.abs(y2 - y1), 0.001);
  const flipH = (x2 - x1) * (y2 - y1) < 0;
  s.addShape(pres.shapes.LINE, {
    x, y, w, h, flipH,
    line: { color, width, dashType: o.dash || "solid", endArrowType: o.arrow },
  });
}
async function iconImg(s, name, color, x, y, size) {
  s.addImage({ data: await icon(name, color), x, y, w: size, h: size });
}
async function iconCircle(s, name, bg, fg, x, y, d) {
  circle(s, x, y, d, bg);
  await iconImg(s, name, fg, x + d * 0.22, y + d * 0.22, d * 0.56);
}
let phCount = 0;
async function photo(s, x, y, w, h, hint) {
  const f = `ph_${++phCount}.png`;
  await A.placeholder(f, w, h, hint);
  s.addImage({ path: path.join(A.OUT, f), x, y, w, h, altText: "Ruang gambar: " + hint, objectName: "RUANG GAMBAR" });
}
// three logos, right-aligned ending at xr (or left-aligned from xl)
function logos(s, { xl, xr, y, h }) {
  const items = [
    ["logo_belanjawan.png", 199 / 100, "Logo Belanjawan Johor 2027"],
    ["logo_jata.png", 158 / 125, "Jata Negeri Johor"],
    ["logo_maju.png", 106 / 122, "Logo Maju Johor"],
  ];
  const gap = h * 0.32;
  const total = items.reduce((a, it) => a + it[1] * h, 0) + gap * 2;
  let x = xl !== undefined ? xl : xr - total;
  for (const [f, r, alt] of items) {
    s.addImage({ path: path.join(A.OUT, f), x, y, w: r * h, h, altText: alt, objectName: alt });
    x += r * h + gap;
  }
}
function bg(s, file) {
  s.background = { path: path.join(A.OUT, file) };
}
const EYEBROW = "SOALAN LISAN A182   ·   BELANJAWAN JOHOR 2027";
function header(s, title, sub, tsize = 26) {
  T(s, EYEBROW, { x: MX, y: 0.47, w: 7.5, h: 0.3, fontFace: HEAD, fontSize: 10, bold: true, color: GOLD, charSpacing: 2, valign: "middle" });
  logos(s, { xr: RX, y: 0.38, h: 0.48 });
  T(s, title, { x: MX, y: 0.92, w: 12.13, h: 0.58, fontFace: HEAD, fontSize: tsize, bold: true, color: NAVY, valign: "middle" });
  if (sub) T(s, sub, { x: MX, y: 1.5, w: 12.13, h: 0.34, fontSize: 12.5, italic: true, color: MUTED, valign: "middle" });
}
function footer(s, n, xl = MX, short = false) {
  T(s, short ? "Sidang Dewan Negeri Johor  ·  23 November 2026" : "Jawapan Lisan YB Pengerusi Jawatankuasa Hal Ehwal Agama Islam Negeri Johor  ·  Sidang Dewan Negeri Johor, 23 November 2026", {
    x: xl, y: 7.02, w: RX - 1.3 - xl, h: 0.25, fontSize: 9, fit: "shrink", color: "8F8570", valign: "middle" });
  T(s, String(n).padStart(2, "0") + " / 07", { x: RX - 1.2, y: 7.02, w: 1.2, h: 0.25, fontFace: HEAD, fontSize: 9, bold: true, color: GOLD, align: "right", valign: "middle" });
}
function label(s, text, x, y, w, color = GOLD, size = 9.5) {
  T(s, text, { x, y, w, h: 0.24, fontFace: HEAD, fontSize: size, bold: true, color, charSpacing: 1.5, valign: "middle" });
}
function chip(s, text, x, y, w, h, fill, color, size = 12, o = {}) {
  rrect(s, x, y, w, h, fill, { r: h / 2, line: o.line });
  T(s, text, { x: x + 0.08, y, w: w - 0.16, h, fontSize: size, color, bold: o.bold ?? true, align: "center", valign: "middle" });
}
function bullets(items, size = 12.5, color = INK, space = 4) {
  return items.map((t, i) => ({
    text: t,
    options: { bullet: { code: "25CF", indent: 13 }, fontSize: size, color, paraSpaceAfter: space, breakLine: i < items.length - 1 },
  }));
}
function numBadge(s, n, x, y, d, fill, color = "FFFFFF") {
  circle(s, x, y, d, fill);
  T(s, String(n).padStart(2, "0"), { x, y, w: d, h: d, fontFace: HEAD, fontSize: d * 26, bold: true, color, align: "center", valign: "middle" });
}

async function build() {
  await A.background("bg_content.png", "br");
  await A.background("bg_cover.png", "bl");
  await A.logos(LOGO_SRC);

  // ======================= SLIDE 1 — COVER =======================
  {
    const s = pres.addSlide();
    bg(s, "bg_cover.png");
    await photo(s, 7.55, 0, W - 7.55, H, "Cadangan: Gambar YB Fared ketika Sidang DUN");
    logos(s, { xl: MX, y: 0.55, h: 0.6 });
    chip(s, "BELANJAWAN JOHOR 2027", MX, 1.55, 2.55, 0.36, "F3E9D3", NAVY, 10, { line: GOLD });
    T(s, "SOALAN LISAN", { x: MX, y: 2.15, w: 3, h: 0.3, fontFace: HEAD, fontSize: 12, bold: true, color: GOLD, charSpacing: 4, valign: "middle" });
    T(s, "A182", { x: MX - 0.04, y: 2.42, w: 4, h: 1.0, fontFace: HEAD, fontSize: 66, bold: true, color: GOLD, valign: "middle" });
    T(s, [
      { text: "PENAMBAHBAIKAN MODUL", options: { breakLine: true } },
      { text: "KURSUS PRA PERKAHWINAN", options: { breakLine: true } },
      { text: "ISLAM NEGERI JOHOR" },
    ], { x: MX, y: 3.55, w: 6.7, h: 1.6, fontFace: HEAD, fontSize: 30, bold: true, color: NAVY, lineSpacingMultiple: 1.05, valign: "middle" });
    // info grid
    rrect(s, MX, 5.5, 6.5, 1.35, CARD, { shadow: true, r: 0.12 });
    label(s, "DIKEMUKAKAN OLEH", MX + 0.3, 5.68, 3.2);
    T(s, [
      { text: "YB Datuk Mohamad Najib bin Samuri", options: { bold: true, fontSize: 13.5, color: NAVY, breakLine: true } },
      { text: "ADUN Parit Yaani", options: { fontSize: 12.5, color: INK } },
    ], { x: MX + 0.3, y: 5.97, w: 3.35, h: 0.7, lineSpacingMultiple: 1.1 });
    line(s, MX + 3.75, 5.72, MX + 3.75, 6.63, LINE, 1);
    label(s, "SIDANG DUN JOHOR", MX + 3.98, 5.68, 2.4);
    T(s, [
      { text: "Belanjawan 2027", options: { bold: true, fontSize: 13.5, color: NAVY, breakLine: true } },
      { text: "23 November 2026", options: { fontSize: 12.5, color: INK } },
    ], { x: MX + 3.98, y: 5.97, w: 2.4, h: 0.7, lineSpacingMultiple: 1.1 });
  }

  // ======================= SLIDE 2 — MBKPPI V5 =======================
  {
    const s = pres.addSlide();
    bg(s, "bg_content.png");
    if (process.env.S2_TITLE) header(s, process.env.S2_TITLE, undefined, 18);
    else header(s, "9 TAJUK UTAMA, PERSEDIAAN LEBIH MENYELURUH");
    footer(s, 2);
    // ---- left info panel
    const lx = MX, ly = 1.75, lw = 3.7, lh = 5.1;
    rrect(s, lx, ly, lw, lh, NAVY, { r: 0.16, shadow: true });
    T(s, "MODUL BERSEPADU KURSUS PRA PERKAHWINAN ISLAM", { x: lx + 0.3, y: ly + 0.22, w: lw - 0.6, h: 0.42, fontFace: HEAD, fontSize: 10, bold: true, color: GOLD_SOFT, charSpacing: 1 });
    T(s, [
      { text: "MBKPPI ", options: { color: "FFFFFF" } },
      { text: "VERSI 5", options: { color: "D9BE86" } },
    ], { x: lx + 0.3, y: ly + 0.64, w: lw - 0.6, h: 0.45, fontFace: HEAD, fontSize: 24, bold: true, valign: "middle" });
    const facts = [
      ["LuCalendarDays", "Dilancarkan pada", "22 Oktober 2026"],
      ["LuUserRound", "Oleh", "YB Pengerusi Jawatankuasa Hal Ehwal Agama Islam Negeri Johor"],
      ["LuLandmark", "Dilaksanakan oleh", "Jabatan Agama Islam Negeri Johor (JAINJ)"],
    ];
    let fy = ly + 1.22; const fh = [0.6, 0.9, 0.72]; let fi = 0;
    for (const [ic, k, v] of facts) {
      circle(s, lx + 0.3, fy + 0.02, 0.42, "3A3E8F");
      await iconImg(s, ic, "E7D3A6", lx + 0.39, fy + 0.11, 0.24);
      T(s, [
        { text: k, options: { fontSize: 9.5, color: "C9CBE6", breakLine: true } },
        { text: v, options: { fontSize: 12, bold: true, color: "FFFFFF" } },
      ], { x: lx + 0.88, y: fy, w: lw - 1.15, h: 0.62 });
      fy += fh[fi++];
    }
    // objective
    line(s, lx + 0.3, ly + 3.5, lx + lw - 0.3, ly + 3.5, "4A4E9A", 0.75);
    T(s, "OBJEKTIF PENAMBAHBAIKAN", { x: lx + 0.3, y: ly + 3.6, w: lw - 0.6, h: 0.25, fontFace: HEAD, fontSize: 9.5, bold: true, color: "D9BE86", charSpacing: 1.5 });
    T(s, "Memastikan bakal pasangan bukan sahaja mempunyai kefahaman mengenai hukum-hakam perkahwinan, malah turut dilengkapi dengan ilmu pengetahuan, kemahiran dan persediaan praktikal dalam mengurus kehidupan berkeluarga.",
      { x: lx + 0.3, y: ly + 3.9, w: lw - 0.6, h: 1.05, fontSize: 10, italic: true, color: "FFFFFF", lineSpacingMultiple: 1.08 });

    // ---- mind map region x 4.45–12.73
    const mx0 = MX + 3.7 + 0.3, mx1 = RX;
    const colW = 2.55;
    const cxL = mx0, cxR = mx1 - colW;
    const cTop = 1.75, cH = 3.05;
    const hubCx = (mx0 + colW + cxR) / 2; // centre between columns
    const groups = [
      { c: P.sage, lbl: "TAJUK 01 – 03" },
      { c: P.blue, lbl: "TAJUK 04 – 06" },
      { c: P.peach, lbl: "TAJUK 07 – 09" },
    ];
    const topics = [
      "Tasawwur Islam", "Perkahwinan dan Majlis Akad Nikah", "Prosedur Perkahwinan",
      "Tanggungjawab Suami Isteri", "Komunikasi Suami Isteri", "Pengurusan Kewangan",
      "Pengurusan Kesihatan", "Pengurusan Stres dan Konflik", "Pembubaran Perkahwinan",
    ];
    // cluster backgrounds
    rrect(s, cxL, cTop, colW, cH, groups[0].c.bg, { r: 0.16, transparency: 25 });
    rrect(s, cxR, cTop, colW, cH, groups[1].c.bg, { r: 0.16, transparency: 25 });
    const bTop = 5.05, bH = 1.8;
    rrect(s, mx0, bTop, mx1 - mx0, bH, groups[2].c.bg, { r: 0.16, transparency: 25 });
    label(s, groups[0].lbl, cxL + 0.18, cTop + 0.12, 2.2, groups[0].c.deep);
    label(s, groups[1].lbl, cxR + 0.18, cTop + 0.12, 2.2, groups[1].c.deep);
    label(s, groups[2].lbl, mx0 + 0.18, bTop + 0.12, 2.2, groups[2].c.deep);

    const pillH = 0.78, pillW = colW - 0.3;
    const pills = [];
    for (let i = 0; i < 3; i++) pills.push({ x: cxL + 0.15, y: cTop + 0.45 + i * (pillH + 0.12), g: 0, side: "L" });
    for (let i = 0; i < 3; i++) pills.push({ x: cxR + 0.15, y: cTop + 0.45 + i * (pillH + 0.12), g: 1, side: "R" });
    const bw = (mx1 - mx0 - 0.3 - 0.4) / 3;
    for (let i = 0; i < 3; i++) pills.push({ x: mx0 + 0.15 + i * (bw + 0.2), y: bTop + 0.5, g: 2, side: "B", w: bw });

    const hubD = 1.55, hubCy = 3.95;
    const hubX = hubCx - hubD / 2, hubY = hubCy - hubD / 2;
    // photo above hub
    await photo(s, cxL + colW + 0.2, cTop, cxR - cxL - colW - 0.4, 1.15, "Cadangan: Gambar pelaksanaan kursus");
    // connectors
    pills.forEach((p, i) => {
      const pw = p.w || pillW;
      let tx, ty;
      if (p.side === "L") { tx = p.x + pw; ty = p.y + pillH / 2; }
      else if (p.side === "R") { tx = p.x; ty = p.y + pillH / 2; }
      else { tx = p.x + pw / 2 + (i === 6 ? 0.6 : i === 8 ? -0.6 : 0); ty = p.y; }
      line(s, hubCx, hubCy, tx, ty, groups[p.g].c.mid, 1.5);
    });
    circle(s, hubX - 0.13, hubY - 0.13, hubD + 0.26, CARD, { line: GOLD, lineW: 1, dash: "dash" });
    circle(s, hubX, hubY, hubD, NAVY, { shadow: true });
    T(s, [
      { text: "MBKPPI", options: { fontSize: 18, bold: true, color: "FFFFFF", breakLine: true } },
      { text: "VERSI 5", options: { fontSize: 13, bold: true, color: "D9BE86" } },
    ], { x: hubX, y: hubY, w: hubD, h: hubD, fontFace: HEAD, align: "center", valign: "middle" });

    pills.forEach((p, i) => {
      const pw = p.w || pillW;
      const g = groups[p.g].c;
      rrect(s, p.x, p.y, pw, pillH, CARD, { r: 0.12, shadow: true });
      numBadge(s, i + 1, p.x + 0.14, p.y + (pillH - 0.46) / 2, 0.46, g.deep);
      T(s, topics[i], { x: p.x + 0.72, y: p.y, w: pw - 0.84, h: pillH, fontSize: 12.5, bold: true, color: INK, valign: "middle" });
    });
  }

  // ======================= SLIDE 3 — BAHAGIAN 1 (boxed, clean) =======================
  {
    const s = pres.addSlide();
    bg(s, "bg_content.png");
    header(s, "PERSIAPAN MEMBINA RUMAH TANGGA");
    footer(s, 3);
    const top = 1.75, bot = 6.85, PAD = 0.25;
    const phW = 3.2;
    // photo + key message box under it
    const msgH = 1.2;
    await photo(s, MX, top, phW, bot - top - msgH - 0.2, "Cadangan: Gambar peserta Kursus Pra Perkahwinan Islam");
    rrect(s, MX, bot - msgH, phW, msgH, NAVY, { r: 0.14 });
    T(s, [
      { text: "Masalah kesihatan mental bukanlah tanda kelemahan diri", options: { bold: true, fontSize: 12, color: "FFFFFF", breakLine: true } },
      { text: "sebaliknya perlu dikenal pasti dan ditangani dengan sokongan serta bantuan yang bersesuaian", options: { fontSize: 9.5, italic: true, color: "D6D8EE" } },
    ], { x: MX + 0.22, y: bot - msgH, w: phW - 0.44, h: msgH, valign: "middle", paraSpaceAfter: 3 });

    const ax = MX + phW + 0.3, aw = RX - ax;
    const colw = (aw - 0.3) / 2;
    const boxHead = (n, t, c, x, y, w) => {
      T(s, String(n).padStart(2, "0"), { x: x + PAD, y: y + 0.14, w: 0.6, h: 0.52, fontFace: HEAD, fontSize: 24, bold: true, color: c.deep, valign: "middle" });
      T(s, t, { x: x + PAD + 0.68, y: y + 0.14, w: w - PAD * 2 - 0.68, h: 0.52, fontFace: HEAD, fontSize: 12, bold: true, color: c.deep, valign: "middle" });
    };
    const tH = 2.42;
    const top2 = [
      { c: P.yellow, t: "PENGURUSAN KEWANGAN KELUARGA DAN TANGGUNGJAWAB NAFKAH",
        pts: ["Perancangan perbelanjaan", "Amalan menabung", "Pengurusan hutang", "Tanggungjawab nafkah", "Hak dan tanggungjawab suami isteri", "Kestabilan kewangan serta kesejahteraan keluarga"] },
      { c: P.sage, t: "KOMUNIKASI SUAMI ISTERI",
        pts: ["Komunikasi yang berkesan", "Komunikasi dalam era digital", "Penggunaan media sosial dan teknologi secara beretika", "Penjagaan privasi", "Pembinaan kepercayaan", "Sikap saling memahami antara pasangan"] },
    ];
    top2.forEach((c, i) => {
      const x = ax + i * (colw + 0.3);
      rrect(s, x, top, colw, tH, c.c.bg, { r: 0.14 });
      boxHead(i + 1, c.t, c.c, x, top, colw);
      T(s, bullets(c.pts, 11.5, INK, 2), { x: x + PAD, y: top + 0.84, w: colw - PAD * 2, h: tH - 0.9 });
    });
    // 03 kesihatan mental — one box
    const by = top + tH + 0.25, bh = bot - by, c3 = P.blue;
    rrect(s, ax, by, aw, bh, c3.bg, { r: 0.14 });
    boxHead(3, "PENGURUSAN KESIHATAN MENTAL", c3, ax, by, aw);
    const sy = by + 0.72;
    const aX = ax + PAD, aW = 2.75, bX = aX + aW + 0.3, bW = ax + aw - PAD - bX;
    label(s, "TANDA-TANDA TEKANAN EMOSI", aX, sy, aW, c3.deep, 8.5);
    T(s, bullets(["Stres berlebihan", "Keresahan", "Kemurungan", "Mudah marah", "Gangguan tidur"], 11.5, INK, 1.5), { x: aX, y: sy + 0.27, w: aW, h: 1.15 });
    label(s, "PENGURUSAN DAN BANTUAN", bX, sy, bW, c3.deep, 8.5);
    T(s, "Pengurusan emosi   ·   Sokongan pasangan", { x: bX, y: sy + 0.27, w: bW, h: 0.25, fontSize: 11.5, bold: true, color: INK, valign: "middle" });
    T(s, "Saluran bantuan profesional:", { x: bX, y: sy + 0.55, w: bW, h: 0.22, fontSize: 10, italic: true, color: MUTED, valign: "middle" });
    const lw1 = 3.0;
    T(s, bullets(["Klinik Kesihatan dan hospital kerajaan", "Pegawai Psikologi"], 11, INK, 1.5), { x: bX, y: sy + 0.8, w: lw1, h: 0.46 });
    T(s, bullets(["Kaunselor Berdaftar", "Pakar Psikiatri"], 11, INK, 1.5), { x: bX + lw1 + 0.1, y: sy + 0.8, w: bW - lw1 - 0.1, h: 0.46 });
    T(s, bullets(["Perkhidmatan MENTARI di bawah Kementerian Kesihatan Malaysia"], 11, INK, 0), { x: bX, y: sy + 1.27, w: bW, h: 0.23 });
  }

  // ======================= SLIDE 4 — BAHAGIAN 2 (boxed, clean) =======================
  {
    const s = pres.addSlide();
    bg(s, "bg_content.png");
    header(s, "MEMPERKUKUH INSTITUSI KEKELUARGAAN");
    footer(s, 4);
    const top = 1.75, bot = 6.85, PAD = 0.25;
    const phW = 3.2, phX = RX - phW;
    await photo(s, phX, top, phW, bot - top, "Cadangan: Gambar keluarga atau program kekeluargaan");
    const ax = MX, aw = phX - 0.3 - MX;
    const colw = (aw - 0.3) / 2;
    const boxHead = (n, t, c, x, y, w) => {
      T(s, String(n).padStart(2, "0"), { x: x + PAD, y: y + 0.14, w: 0.6, h: 0.52, fontFace: HEAD, fontSize: 24, bold: true, color: c.deep, valign: "middle" });
      T(s, t, { x: x + PAD + 0.68, y: y + 0.14, w: w - PAD * 2 - 0.68, h: 0.52, fontFace: HEAD, fontSize: 12, bold: true, color: c.deep, valign: "middle" });
    };
    const tH = 2.55;
    const top2 = [
      { c: P.peach, t: "PENGURUSAN KONFLIK DAN TEKANAN RUMAH TANGGA",
        pts: ["Pengawalan emosi", "Komunikasi berkesan", "Menyelesaikan perselisihan secara matang dan berhemah", "Menghadapi cabaran kehidupan berumah tangga", "Mengelakkan konflik daripada menjejaskan keharmonian keluarga"] },
      { c: P.sage, t: "KEMAHIRAN KEIBUBAPAAN",
        pts: ["Tanggungjawab ibu bapa", "Mendidik dan membimbing anak-anak", "Pembentukan akhlak", "Pendidikan agama", "Pelaksanaan tanggungjawab bersama", "Membina keluarga yang sejahtera"] },
    ];
    top2.forEach((c, i) => {
      const x = ax + i * (colw + 0.3);
      rrect(s, x, top, colw, tH, c.c.bg, { r: 0.14 });
      boxHead(i + 4, c.t, c.c, x, top, colw);
      T(s, bullets(c.pts, 11.5, INK, 2), { x: x + PAD, y: top + 0.76, w: colw - PAD * 2, h: tH - 0.86 });
    });
    const by = top + tH + 0.25, bh = bot - by, c6 = P.lav;
    rrect(s, ax, by, aw, bh, c6.bg, { r: 0.14 });
    boxHead(6, "PEMANTAPAN AKIDAH DAN TANGGUNGJAWAB SUAMI ISTERI", c6, ax, by, aw);
    const sy = by + 0.72;
    const aX = ax + PAD, aW = 3.3, bX = aX + aW + 0.3, bW = ax + aw - PAD - bX;
    label(s, "PEGANGAN", aX, sy, aW, c6.deep, 8.5);
    T(s, [
      { text: "Ahli Sunnah Wal Jamaah", options: { bold: true, fontSize: 12.5, color: NAVY, breakLine: true } },
      { text: "aliran Al-Asya'irah dan Al-Maturidiyyah", options: { fontSize: 11, color: INK, breakLine: true } },
      { text: "Asas pembentukan keluarga Islam", options: { fontSize: 10.5, italic: true, color: MUTED } },
    ], { x: aX, y: sy + 0.28, w: aW, h: 0.85, paraSpaceAfter: 3 });
    label(s, "KONSEP LELAKI SEBAGAI QAWWAM", bX, sy, bW, c6.deep, 8.5);
    const roles = [["LuCompass", "Memimpin"], ["LuHandCoins", "Memberikan nafkah"], ["LuShield", "Melindungi"], ["LuUsersRound", "Membimbing keluarga"]];
    const rw = bW / 2;
    for (let i = 0; i < 4; i++) {
      const rx = bX + (i % 2) * rw, ry = sy + 0.3 + Math.floor(i / 2) * 0.32;
      await iconImg(s, roles[i][0], c6.deep, rx, ry + 0.04, 0.21);
      T(s, roles[i][1], { x: rx + 0.3, y: ry, w: rw - 0.32, h: 0.29, fontSize: 11.5, bold: true, color: INK, valign: "middle" });
    }
    T(s, "Memahami hak serta peranan masing-masing dalam institusi perkahwinan", { x: bX, y: sy + 0.98, w: bW, h: 0.4, fontSize: 10.5, italic: true, color: MUTED });
  }

  // ======================= SLIDE 5 — PENDEKATAN 1 & 2 (large text) =======================
  {
    const s = pres.addSlide();
    bg(s, "bg_content.png");
    header(s, "PEMANTAPAN PELAKSANAAN DAN KEBERKESANAN KURSUS");
    T(s, "Aspek pelaksanaan dan keberkesanan penyampaian kursus", { x: MX, y: 1.5, w: 12.13, h: 0.36, fontSize: 14, italic: true, color: MUTED, valign: "middle" });
    footer(s, 5);
    const top = 2.05, bot = 6.85, ch = bot - top;
    const phW = 3.3;
    await photo(s, MX, top, phW, ch, "Cadangan: Gambar penceramah atau pelaksanaan kursus");
    const x1 = MX + phW + 0.3, w1 = 3.75;
    const x2 = x1 + w1 + 0.3, w2 = RX - x2;
    const PAD = 0.28;
    const head = (x, w, n, c, t) => {
      T(s, [
        { text: n + ".  ", options: { color: GOLD } },
        { text: t, options: { color: c.deep } },
      ], { x: x + PAD, y: top + 0.22, w: w - PAD * 2, h: 1.05, fontFace: HEAD, fontSize: 16, bold: true, valign: "middle" });
    };
    // ---- Pendekatan 1
    rrect(s, x1, top, w1, ch, CARD, { r: 0.16, shadow: true });
    head(x1, w1, 1, P.gold, "Pemantapan Kompetensi Penceramah dan Kaedah Penyampaian");
    T(s, bullets(["Latihan dan penyelarasan penyampaian modul", "Perbincangan", "Kajian kes", "Simulasi", "Perkongsian pengalaman"], 15, INK, 9),
      { x: x1 + PAD, y: top + 1.5, w: w1 - PAD * 2, h: 2.9 });
    // ---- Pendekatan 2
    const c2 = P.blue;
    rrect(s, x2, top, w2, ch, CARD, { r: 0.16, shadow: true });
    head(x2, w2, 2, c2, "Penambahbaikan Kaedah Penilaian dan Pemantauan Peserta");
    T(s, bullets(["Sistem Pengurusan Perkahwinan Islam (SPPIM)", "Rekod penyertaan, kehadiran dan penilaian peserta", "Ujian penilaian bagi setiap tajuk"], 14, INK, 5),
      { x: x2 + PAD, y: top + 1.45, w: w2 - PAD * 2, h: 1.5 });
    const iy = top + 3.05, ih = bot - 0.18 - iy;
    rrect(s, x2 + 0.18, iy, w2 - 0.36, ih, c2.bg, { r: 0.12 });
    T(s, "4 INDIKATOR PEMANTAUAN", { x: x2 + PAD + 0.1, y: iy + 0.1, w: w2 - PAD * 2, h: 0.3, fontFace: HEAD, fontSize: 11, bold: true, color: c2.deep, charSpacing: 1.5, valign: "middle" });
    const inds = ["Kadar penyertaan", "Pencapaian penilaian", "Tahap kefahaman", "Kepuasan peserta"];
    const tw = (w2 - 0.36 - 0.3) / 2;
    inds.forEach((t, k) => {
      const tx = x2 + PAD + 0.1, ty = iy + 0.42 + k * 0.27;
      T(s, [
        { text: String(k + 1), options: { fontFace: HEAD, bold: true, color: GOLD, fontSize: 14 } },
        { text: "  " + t, options: { bold: true, color: NAVY, fontSize: 13 } },
      ], { x: tx, y: ty, w: w2 - PAD * 2 - 0.2, h: 0.27, valign: "middle" });
    });
  }

  // ======================= SLIDE 6 — EKOSISTEM AGENSI =======================
  {
    const s = pres.addSlide();
    bg(s, "bg_content.png");
    header(s, "SOKONGAN BERTERUSAN MELALUI KERJASAMA STRATEGIK",
      "Saluran rujukan yang lebih tersusun — bimbingan, khidmat nasihat dan bantuan bersesuaian");
    footer(s, 6);
    const CAT = {
      kel: { c: P.sage, n: "Kekeluargaan" },
      und: { c: P.lav, n: "Perundangan" },
      kes: { c: P.blue, n: "Kesihatan mental" },
      kew: { c: P.yellow, n: "Kewangan" },
      keb: { c: P.peach, n: "Kebajikan" },
    };
    const ag = [
      { k: "kel", ic: "LuHouse", ab: null, nm: "Bahagian Pembangunan Keluarga JAINJ", fn: "Program pasca perkahwinan · Hubungan suami isteri · Khidmat nasihat rumah tangga" },
      { k: "kel", ic: "LuHeartHandshake", ab: "YPKDT", nm: "Yayasan Pembangunan Keluarga Darul Ta'zim", fn: "Bimbingan dan pembangunan institusi keluarga" },
      { k: "und", ic: "LuScale", ab: "JKSNJ", nm: "Jabatan Kehakiman Syariah Negeri Johor", fn: "Undang-undang keluarga Islam · Penyelesaian konflik rumah tangga" },
      { k: "kel", ic: "LuMessageCircleHeart", ab: "LPPKN", nm: "Lembaga Penduduk dan Pembangunan Keluarga Negara", fn: "Khidmat runding cara · Pendidikan kekeluargaan" },
      { k: "kes", ic: "LuHeartPulse", ab: null, nm: "Jabatan Kesihatan Negeri Johor", fn: "Rujukan kesihatan mental · Bantuan profesional" },
      { k: "keb", ic: "LuHandCoins", ab: "MAINJ", nm: "Majlis Agama Islam Negeri Johor", fn: "Bantuan kewangan dan kebajikan (mengikut syarat kelayakan)" },
      { k: "keb", ic: "LuHandHeart", ab: "JKM", nm: "Jabatan Kebajikan Masyarakat", fn: "Bantuan kebajikan · Perlindungan sosial" },
      { k: "kew", ic: "LuPiggyBank", ab: "AKPK", nm: "Agensi Kaunseling dan Pengurusan Kredit", fn: "Pendidikan kewangan · Nasihat pengurusan hutang" },
    ];
    const top = 1.98, bot = 6.85, gap = 0.16;
    const ch = (bot - top - gap * 3) / 4;
    const cw = 4.45;
    const xL = MX, xR = RX - cw;
    const spL = xL + cw + 0.22, spR = xR - 0.22;
    const hubCx = (spL + spR) / 2, hubD = 1.8;
    const centers = [0, 1, 2, 3].map(i => top + i * (ch + gap) + ch / 2);
    const hubCy = (centers[0] + centers[3]) / 2 + 0.05;
    // spines
    line(s, spL, centers[0], spL, centers[3], "CDBB97", 1.25);
    line(s, spR, centers[0], spR, centers[3], "CDBB97", 1.25);
    for (const cy of centers) {
      line(s, xL + cw, cy, spL, cy, "CDBB97", 1.25);
      line(s, spR, cy, xR, cy, "CDBB97", 1.25);
    }
    line(s, spL, hubCy, hubCx - hubD / 2, hubCy, "CDBB97", 1.25);
    line(s, hubCx + hubD / 2, hubCy, spR, hubCy, "CDBB97", 1.25);
    for (const cy of centers) { circle(s, spL - 0.05, cy - 0.05, 0.1, GOLD); circle(s, spR - 0.05, cy - 0.05, 0.1, GOLD); }
    // hub
    circle(s, hubCx - hubD / 2 - 0.13, hubCy - hubD / 2 - 0.13, hubD + 0.26, CARD, { line: GOLD, lineW: 1, dash: "dash" });
    circle(s, hubCx - hubD / 2, hubCy - hubD / 2, hubD, NAVY, { shadow: true });
    T(s, [
      { text: "JAINJ", options: { fontFace: HEAD, fontSize: 24, bold: true, color: "FFFFFF", breakLine: true } },
      { text: "Jabatan Agama Islam Negeri Johor", options: { fontSize: 10, color: "D9BE86" } },
    ], { x: hubCx - hubD / 2 + 0.15, y: hubCy - hubD / 2, w: hubD - 0.3, h: hubD, align: "center", valign: "middle" });
    // photo (small) above hub; legend below hub
    const colX = spL + 0.2, colW = spR - spL - 0.4;
    const phY = top, phH = hubCy - hubD / 2 - 0.3 - top;
    await photo(s, colX, phY, colW, phH, "Cadangan: Gambar aktiviti JAINJ");
    const lgY = hubCy + hubD / 2 + 0.22;
    label(s, "KOD WARNA FUNGSI", colX + 0.3, lgY, colW, GOLD, 8.5);
    const keys = Object.values(CAT);
    keys.forEach((k, i) => {
      const lx = colX + 0.3, ly = lgY + 0.28 + i * 0.215;
      circle(s, lx, ly + 0.035, 0.145, k.c.deep);
      T(s, k.n, { x: lx + 0.24, y: ly, w: colW - 0.6, h: 0.215, fontSize: 10.5, color: INK, valign: "middle" });
    });
    // agency cards
    for (let i = 0; i < 8; i++) {
      const a = ag[i], c = CAT[a.k].c;
      const x = i < 4 ? xL : xR, y = top + (i % 4) * (ch + gap);
      rrect(s, x, y, cw, ch, CARD, { r: 0.12, shadow: true });
      rrect(s, x + 0.12, y + 0.12, 0.52, ch - 0.24, c.bg, { r: 0.1 });
      await iconImg(s, a.ic, c.deep, x + 0.22, y + 0.22, 0.32);
      T(s, String(i + 1).padStart(2, "0"), { x: x + 0.12, y: y + ch - 0.48, w: 0.52, h: 0.3, fontFace: HEAD, fontSize: 10, bold: true, color: c.deep, align: "center", valign: "middle" });
      const tx = x + 0.78, tw = cw - 0.88;
      const runs = [];
      if (a.ab) {
        runs.push({ text: a.ab + "  ", options: { fontFace: HEAD, bold: true, fontSize: 15, color: c.deep } });
        runs.push({ text: a.nm, options: { fontSize: 10.5, color: MUTED, breakLine: true } });
      } else {
        runs.push({ text: a.nm, options: { fontFace: HEAD, bold: true, fontSize: 11.5, color: c.deep, breakLine: true } });
      }
      runs.push({ text: a.fn, options: { fontSize: 12.5, color: INK } });
      T(s, runs, { x: tx, y: y + 0.06, w: tw, h: ch - 0.12, valign: "middle", paraSpaceAfter: 2 });
    }
  }

  // ======================= SLIDE 7 — KESIMPULAN (photo collage) =======================
  {
    const s = pres.addSlide();
    bg(s, "bg_cover.png");
    // ---- photo collage (mixed sizes), left
    const g = 0.15, cTop = 0.6, cBot = 6.9, cL = MX, cR = 6.6;
    const bigW = 3.7, bigH = 3.95;
    const smW = cR - cL - bigW - g;
    const lowY = cTop + bigH + g, lowH = cBot - lowY;
    const sH = (bigH - g) / 2;
    const leftLowW = 1.9;
    await photo(s, cL, cTop, bigW, bigH, "Gambar utama: keluarga");
    await photo(s, cL + bigW + g, cTop, smW, sH, "Gambar program");
    await photo(s, cL + bigW + g, cTop + sH + g, smW, sH, "Gambar peserta kursus");
    await photo(s, cL, lowY, leftLowW, lowH, "Gambar pasangan");
    await photo(s, cL + leftLowW + g, lowY, cR - cL - leftLowW - g, lowH, "Gambar aktiviti JAINJ");

    // ---- conclusion, right
    const x0 = 7.05, wR = RX - x0;
    T(s, "KESIMPULAN", { x: x0, y: 0.47, w: 3, h: 0.3, fontFace: HEAD, fontSize: 11, bold: true, color: GOLD, charSpacing: 2, valign: "middle" });
    logos(s, { xr: RX, y: 0.38, h: 0.48 });
    T(s, [
      { text: "KE ARAH KELUARGA", options: { color: NAVY, breakLine: true } },
      { text: "SAKINAH, MAWADDAH", options: { color: GOLD, breakLine: true } },
      { text: "WA RAHMAH", options: { color: GOLD } },
    ], { x: x0, y: 1.0, w: wR, h: 1.4, fontFace: HEAD, fontSize: 27, bold: true, valign: "middle" });
    const pts = [
      "Kursus Pra Perkahwinan Islam sebagai medium persediaan menyeluruh kepada bakal pasangan",
      "Melahirkan pasangan yang lebih berilmu, matang dan bertanggungjawab",
      "Berkemahiran dalam menghadapi cabaran rumah tangga",
      "Memperkukuh institusi kekeluargaan Islam di Negeri Johor",
    ];
    let y = 2.62;
    const ph = [0.76, 0.76, 0.76, 0.76];
    for (let i = 0; i < pts.length; i++) {
      await iconImg(s, "LuCircleCheck", GOLD, x0, y + 0.04, 0.3);
      T(s, pts[i], { x: x0 + 0.45, y, w: wR - 0.45, h: ph[i] - 0.08, fontSize: 14.5, color: INK });
      y += ph[i];
    }
    const qy = 5.82;
    rrect(s, x0, qy, wR, 1.0, NAVY, { r: 0.14 });
    await iconImg(s, "LuQuote", "D9BE86", x0 + 0.22, qy + 0.3, 0.36);
    T(s, "Kerajaan Negeri Johor melalui JAINJ komited untuk terus menambah baik pelaksanaan Kursus Pra Perkahwinan Islam.",
      { x: x0 + 0.75, y: qy, w: wR - 0.95, h: 1.0, fontSize: 12.5, italic: true, color: "FFFFFF", valign: "middle" });
    footer(s, 7, x0, true);
  }
  await pres.writeFile({ fileName: OUTFILE });
  console.log("wrote", OUTFILE);
}

build().catch(e => { console.error(e); process.exit(1); });
