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
function header(s, title, sub) {
  T(s, EYEBROW, { x: MX, y: 0.47, w: 7.5, h: 0.3, fontFace: HEAD, fontSize: 10, bold: true, color: GOLD, charSpacing: 2, valign: "middle" });
  logos(s, { xr: RX, y: 0.38, h: 0.48 });
  T(s, title, { x: MX, y: 0.92, w: 12.13, h: 0.58, fontFace: HEAD, fontSize: 26, bold: true, color: NAVY, valign: "middle" });
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
    header(s, "9 TAJUK UTAMA, PERSEDIAAN LEBIH MENYELURUH");
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

  // ======================= SLIDE 3 — BAHAGIAN 1 =======================
  {
    const s = pres.addSlide();
    bg(s, "bg_content.png");
    header(s, "PERSIAPAN MEMBINA RUMAH TANGGA");
    footer(s, 3);
    const top = 1.75, bot = 6.85;
    const leftW = 6.85;
    await photo(s, MX, top, leftW, 1.15, "Cadangan: Gambar peserta Kursus Pra Perkahwinan Islam");
    const cw = (leftW - 0.3) / 2, cy = top + 1.15 + 0.22, ch = bot - cy;
    const cards = [
      { n: 1, c: P.yellow, ic: "LuWallet", t: "PENGURUSAN KEWANGAN KELUARGA DAN TANGGUNGJAWAB NAFKAH",
        pts: ["Perancangan perbelanjaan", "Amalan menabung", "Pengurusan hutang", "Tanggungjawab nafkah", "Hak dan tanggungjawab suami isteri", "Kestabilan kewangan serta kesejahteraan keluarga"] },
      { n: 2, c: P.sage, ic: "LuMessagesSquare", t: "KOMUNIKASI SUAMI ISTERI",
        pts: ["Komunikasi yang berkesan", "Komunikasi dalam era digital", "Penggunaan media sosial dan teknologi secara beretika", "Penjagaan privasi", "Pembinaan kepercayaan", "Sikap saling memahami antara pasangan"] },
    ];
    for (let i = 0; i < 2; i++) {
      const c = cards[i];
      const x = MX + i * (cw + 0.3);
      rrect(s, x, cy, cw, ch, c.c.bg, { r: 0.16 });
      numBadge(s, c.n, x + 0.22, cy + 0.22, 0.5, c.c.deep);
      await iconImg(s, c.ic, c.c.deep, x + cw - 0.6, cy + 0.25, 0.4);
      T(s, c.t, { x: x + 0.22, y: cy + 0.82, w: cw - 0.44, h: 0.62, fontFace: HEAD, fontSize: 11.5, bold: true, color: c.c.deep, valign: "middle" });
      T(s, bullets(c.pts, 12, INK, 3), { x: x + 0.22, y: cy + 1.55, w: cw - 0.4, h: ch - 1.65 });
    }
    // ---- big card 3
    const x3 = MX + leftW + 0.3, w3 = RX - x3;
    const c3 = P.blue;
    rrect(s, x3, top, w3, bot - top, CARD, { r: 0.16, shadow: true, line: "D3DDE9" });
    numBadge(s, 3, x3 + 0.25, top + 0.25, 0.5, c3.deep);
    T(s, "PENGURUSAN KESIHATAN MENTAL", { x: x3 + 0.88, y: top + 0.25, w: w3 - 1.6, h: 0.5, fontFace: HEAD, fontSize: 14, bold: true, color: c3.deep, valign: "middle" });
    await iconImg(s, "LuBrain", c3.deep, x3 + w3 - 0.68, top + 0.28, 0.42);
    let y = top + 0.82;
    label(s, "TANDA-TANDA TEKANAN EMOSI", x3 + 0.25, y, 4, c3.deep);
    y += 0.27;
    const signs = [["Stres berlebihan", 1.6], ["Keresahan", 1.15], ["Kemurungan", 1.3]];
    let sx = x3 + 0.25;
    for (const [t, w] of signs) { chip(s, t, sx, y, w, 0.34, c3.bg, c3.deep, 11.5); sx += w + 0.12; }
    y += 0.4; sx = x3 + 0.25;
    for (const [t, w] of [["Mudah marah", 1.35], ["Gangguan tidur", 1.5]]) { chip(s, t, sx, y, w, 0.34, c3.bg, c3.deep, 11.5); sx += w + 0.12; }
    y += 0.48;
    label(s, "PENGURUSAN DAN BANTUAN", x3 + 0.25, y, 4, c3.deep);
    y += 0.27;
    const half = (w3 - 0.5 - 0.15) / 2;
    for (const [i, t] of ["Pengurusan emosi", "Sokongan pasangan"].entries()) {
      rrect(s, x3 + 0.25 + i * (half + 0.15), y, half, 0.36, "EEF2F7", { r: 0.08 });
      await iconImg(s, i === 0 ? "LuHeart" : "LuHeartHandshake", c3.deep, x3 + 0.36 + i * (half + 0.15), y + 0.07, 0.22);
      T(s, t, { x: x3 + 0.66 + i * (half + 0.15), y, w: half - 0.5, h: 0.36, fontSize: 12, bold: true, color: INK, valign: "middle" });
    }
    y += 0.42;
    T(s, "Saluran bantuan profesional:", { x: x3 + 0.25, y, w: 4, h: 0.22, fontSize: 11, italic: true, color: MUTED, valign: "middle" });
    y += 0.24;
    const help = ["Klinik Kesihatan dan hospital kerajaan", "Pegawai Psikologi", "Kaunselor Berdaftar", "Pakar Psikiatri"];
    for (let i = 0; i < 4; i++) {
      const hx = x3 + 0.25 + (i % 2) * (half + 0.15), hy = y + Math.floor(i / 2) * 0.42;
      await iconImg(s, "LuCircleCheck", c3.deep, hx, hy + 0.05, 0.18);
      T(s, help[i], { x: hx + 0.26, y: hy - 0.06, w: half - 0.26, h: 0.4, fontSize: 11.5, color: INK, valign: "middle" });
    }
    y += 0.8;
    await iconImg(s, "LuCircleCheck", c3.deep, x3 + 0.25, y + 0.05, 0.18);
    T(s, [
      { text: "Perkhidmatan MENTARI", options: { bold: true } },
      { text: " di bawah Kementerian Kesihatan Malaysia" },
    ], { x: x3 + 0.51, y: y - 0.02, w: w3 - 0.8, h: 0.42, fontSize: 11.5, color: INK, valign: "top" });
    // key message
    const qy = bot - 0.88;
    rrect(s, x3 + 0.15, qy, w3 - 0.3, 0.75, NAVY, { r: 0.1 });
    T(s, [
      { text: "Masalah kesihatan mental bukanlah tanda kelemahan diri", options: { bold: true, fontSize: 11.5, color: "FFFFFF", breakLine: true } },
      { text: "sebaliknya perlu dikenal pasti dan ditangani dengan sokongan serta bantuan yang bersesuaian", options: { fontSize: 9, color: "D6D8EE" } },
    ], { x: x3 + 0.32, y: qy, w: w3 - 0.64, h: 0.75, valign: "middle", lineSpacingMultiple: 1.05 });
  }

  // ======================= SLIDE 4 — BAHAGIAN 2 =======================
  {
    const s = pres.addSlide();
    bg(s, "bg_content.png");
    header(s, "MEMPERKUKUH INSTITUSI KEKELUARGAAN");
    footer(s, 4);
    const top = 1.75, bot = 6.85;
    const phW = 2.35, phX = RX - phW;
    await photo(s, phX, top, phW, bot - top, "Cadangan: Gambar keluarga atau program kekeluargaan");
    const areaW = phX - 0.3 - MX;
    const cw = (areaW - 0.3) / 2, ch = 2.5;
    const cards = [
      { n: 4, c: P.peach, ic: "LuHandshake", t: "PENGURUSAN KONFLIK DAN TEKANAN RUMAH TANGGA",
        pts: ["Pengawalan emosi", "Komunikasi berkesan", "Menyelesaikan perselisihan secara matang dan berhemah", "Menghadapi cabaran kehidupan berumah tangga", "Mengelakkan konflik daripada menjejaskan keharmonian keluarga"] },
      { n: 5, c: P.sage, ic: "LuUsers", t: "KEMAHIRAN KEIBUBAPAAN",
        pts: ["Tanggungjawab ibu bapa", "Mendidik dan membimbing anak-anak", "Pembentukan akhlak", "Pendidikan agama", "Pelaksanaan tanggungjawab bersama", "Membina keluarga yang sejahtera"] },
    ];
    for (let i = 0; i < 2; i++) {
      const c = cards[i];
      const x = MX + i * (cw + 0.3);
      rrect(s, x, top, cw, ch, CARD, { r: 0.16, shadow: true });
      await iconCircle(s, c.ic, c.c.bg, c.c.deep, x + 0.22, top + 0.2, 0.55);
      T(s, String(c.n).padStart(2, "0"), { x: x + cw - 0.8, y: top + 0.2, w: 0.6, h: 0.4, fontFace: HEAD, fontSize: 20, bold: true, color: c.c.mid, align: "right", valign: "middle" });
      T(s, c.t, { x: x + 0.9, y: top + 0.2, w: cw - 1.7, h: 0.55, fontFace: HEAD, fontSize: 11.5, bold: true, color: c.c.deep, valign: "middle" });
      T(s, bullets(c.pts, 11.5, INK, 2.5), { x: x + 0.22, y: top + 0.88, w: cw - 0.4, h: ch - 0.95 });
    }
    // card 6 (emphasis)
    const y6 = top + ch + 0.25, h6 = bot - y6, c6 = P.lav;
    rrect(s, MX, y6, areaW, h6, c6.bg, { r: 0.16 });
    await iconCircle(s, "LuBookOpen", c6.deep, "FFFFFF", MX + 0.22, y6 + 0.2, 0.55);
    T(s, "PEMANTAPAN AKIDAH DAN TANGGUNGJAWAB SUAMI ISTERI", { x: MX + 0.9, y: y6 + 0.2, w: areaW - 1.8, h: 0.55, fontFace: HEAD, fontSize: 12.5, bold: true, color: c6.deep, valign: "middle" });
    T(s, "06", { x: MX + areaW - 0.8, y: y6 + 0.2, w: 0.6, h: 0.4, fontFace: HEAD, fontSize: 20, bold: true, color: c6.mid, align: "right", valign: "middle" });
    const iy = y6 + 0.85, ih = h6 - 1.0;
    // col A akidah
    const aW = 3.1;
    rrect(s, MX + 0.22, iy, aW, ih, CARD, { r: 0.1 });
    T(s, "PEGANGAN", { x: MX + 0.37, y: iy + 0.1, w: aW - 0.3, h: 0.22, fontFace: HEAD, fontSize: 9, bold: true, color: GOLD, charSpacing: 1.5 });
    T(s, [
      { text: "Ahli Sunnah Wal Jamaah", options: { bold: true, fontSize: 12, color: c6.deep, breakLine: true } },
      { text: "aliran Al-Asya'irah dan", options: { fontSize: 11, color: INK, breakLine: true } },
      { text: "Al-Maturidiyyah", options: { fontSize: 11, color: INK, breakLine: true } },
      { text: "Asas pembentukan keluarga Islam", options: { fontSize: 10.5, italic: true, color: MUTED } },
    ], { x: MX + 0.37, y: iy + 0.36, w: aW - 0.3, h: ih - 0.42, lineSpacingMultiple: 1.05, paraSpaceAfter: 3 });
    // col B qawwam
    const bX = MX + 0.22 + aW + 0.2, bW = areaW - 0.44 - aW - 0.2;
    T(s, [
      { text: "KONSEP LELAKI SEBAGAI ", options: {} },
      { text: "QAWWAM", options: { color: c6.deep } },
    ], { x: bX, y: iy - 0.02, w: bW, h: 0.24, fontFace: HEAD, fontSize: 9.5, bold: true, color: GOLD, charSpacing: 1.5, valign: "middle" });
    const roles = [["LuCompass", "Memimpin"], ["LuHandCoins", "Memberikan nafkah"], ["LuShield", "Melindungi"], ["LuUsersRound", "Membimbing keluarga"]];
    const rw = (bW - 0.15) / 2, rh = 0.36;
    for (let i = 0; i < 4; i++) {
      const rx = bX + (i % 2) * (rw + 0.15), ry = iy + 0.3 + Math.floor(i / 2) * (rh + 0.08);
      rrect(s, rx, ry, rw, rh, CARD, { r: 0.08 });
      await iconImg(s, roles[i][0], c6.deep, rx + 0.12, ry + 0.07, 0.22);
      T(s, roles[i][1], { x: rx + 0.42, y: ry, w: rw - 0.5, h: rh, fontSize: 11.5, bold: true, color: INK, valign: "middle" });
    }
    T(s, "Memahami hak serta peranan masing-masing dalam institusi perkahwinan", { x: bX, y: iy + 1.13, w: bW, h: ih - 1.13, fontSize: 10.5, italic: true, color: c6.deep, valign: "middle" });
  }

  // ======================= SLIDE 5 — TIGA PENDEKATAN =======================
  {
    const s = pres.addSlide();
    bg(s, "bg_content.png");
    header(s, "PEMANTAPAN PELAKSANAAN DAN KEBERKESANAN KURSUS");
    footer(s, 5);
    const w1 = 3.5, w2 = 5.0, w3 = 12.13 - w1 - w2 - 0.6;
    const xs = [MX, MX + w1 + 0.3, MX + w1 + w2 + 0.6];
    const ws = [w1, w2, w3];
    const cols = [P.gold, P.blue, P.sage];
    const mY = 1.72, cardY = 2.35, bot = 6.85, ch = bot - cardY;
    // step markers + arrows
    for (let i = 0; i < 3; i++) {
      numBadge(s, i + 1, xs[i], mY, 0.48, i === 1 ? NAVY : cols[i].deep);
      T(s, "PENDEKATAN " + ["PERTAMA", "KEDUA", "KETIGA"][i], { x: xs[i] + 0.6, y: mY, w: 2.4, h: 0.48, fontFace: HEAD, fontSize: 10, bold: true, color: GOLD, charSpacing: 1.5, valign: "middle" });
      if (i < 2) line(s, xs[i] + 3.0, mY + 0.24, xs[i + 1] - 0.12, mY + 0.24, LINE, 1.25, { arrow: "triangle", dash: "dash" });
    }
    // ---- col 1
    {
      const x = xs[0], w = ws[0], c = cols[0];
      rrect(s, x, cardY, w, ch, CARD, { r: 0.16, shadow: true });
      await photo(s, x + 0.15, cardY + 0.15, w - 0.3, 1.12, "Cadangan: Gambar penceramah kursus");
      let y = cardY + 1.42;
      T(s, "PEMANTAPAN KOMPETENSI PENCERAMAH DAN KAEDAH PENYAMPAIAN", { x: x + 0.22, y, w: w - 0.44, h: 0.52, fontFace: HEAD, fontSize: 11.5, bold: true, color: c.deep, valign: "middle" });
      y += 0.62;
      await iconImg(s, "LuPresentation", c.deep, x + 0.22, y + 0.03, 0.26);
      T(s, "Latihan dan penyelarasan penyampaian modul", { x: x + 0.58, y, w: w - 0.8, h: 0.42, fontSize: 11.5, color: INK, valign: "middle" });
      y += 0.55;
      label(s, "KAEDAH PRAKTIKAL & INTERAKTIF", x + 0.22, y, w - 0.44, c.deep, 9);
      y += 0.3;
      const cw2 = (w - 0.44 - 0.12) / 2;
      ["Perbincangan", "Kajian kes", "Simulasi", "Perkongsian pengalaman"].forEach((t, i) => {
        chip(s, t, x + 0.22 + (i % 2) * (cw2 + 0.12), y + Math.floor(i / 2) * 0.44, cw2, 0.36, c.bg, c.deep, i === 3 ? 10 : 11);
      });
      y += 0.98;
      T(s, "Mengaplikasikan ilmu yang dipelajari dalam situasi sebenar kehidupan berumah tangga", { x: x + 0.22, y, w: w - 0.44, h: bot - y - 0.12, fontSize: 10.5, italic: true, color: MUTED, valign: "middle" });
    }
    // ---- col 2 SPPIM
    {
      const x = xs[1], w = ws[1], c = cols[1];
      rrect(s, x, cardY, w, ch, CARD, { r: 0.16, shadow: true, line: c.mid, lineW: 1.25 });
      let y = cardY + 0.2;
      T(s, "PENAMBAHBAIKAN KAEDAH PENILAIAN DAN PEMANTAUAN PESERTA", { x: x + 0.25, y, w: w - 0.5, h: 0.48, fontFace: HEAD, fontSize: 11.5, bold: true, color: c.deep, valign: "middle" });
      y += 0.6;
      // SPPIM anchor
      const aw = 1.75, ah = 0.98;
      rrect(s, x + 0.25, y, aw, ah, NAVY, { r: 0.12 });
      await iconImg(s, "LuDatabase", "D9BE86", x + 0.38, y + 0.14, 0.26);
      T(s, "SPPIM", { x: x + 0.7, y: y + 0.08, w: aw - 0.5, h: 0.4, fontFace: HEAD, fontSize: 18, bold: true, color: "FFFFFF", valign: "middle" });
      T(s, "Sistem Pengurusan Perkahwinan Islam", { x: x + 0.38, y: y + 0.5, w: aw - 0.26, h: 0.42, fontSize: 9.5, color: "D6D8EE", valign: "middle" });
      const rx = x + 0.25 + aw + 0.2, rw = w - 0.5 - aw - 0.2;
      T(s, "Pengurusan rekod:", { x: rx, y, w: rw, h: 0.24, fontSize: 10.5, italic: true, color: MUTED, valign: "middle" });
      chip(s, "Penyertaan", rx, y + 0.3, 1.2, 0.3, c.bg, c.deep, 10.5);
      chip(s, "Kehadiran", rx + 1.3, y + 0.3, 1.2, 0.3, c.bg, c.deep, 10.5);
      chip(s, "Penilaian peserta", rx, y + 0.66, 1.6, 0.3, c.bg, c.deep, 10.5);
      y += ah + 0.12;
      await iconImg(s, "LuClipboardCheck", c.deep, x + 0.25, y + 0.02, 0.24);
      T(s, [{ text: "Ujian penilaian", options: { bold: true } }, { text: " dilaksanakan bagi setiap tajuk" }], { x: x + 0.58, y, w: w - 0.8, h: 0.28, fontSize: 11.5, color: INK, valign: "middle" });
      y += 0.36;
      // 4 indicators — standout
      rrect(s, x + 0.15, y, w - 0.3, 1.72, "EEF2F8", { r: 0.12 });
      T(s, [{ text: "4 ", options: { color: NAVY, fontSize: 13 } }, { text: "INDIKATOR PEMANTAUAN", options: {} }], { x: x + 0.3, y: y + 0.08, w: w - 0.6, h: 0.3, fontFace: HEAD, fontSize: 10, bold: true, color: c.deep, charSpacing: 1.5, valign: "middle" });
      const inds = [["LuUsers", "Kadar penyertaan"], ["LuChartColumn", "Pencapaian penilaian"], ["LuLightbulb", "Tahap kefahaman"], ["LuSmile", "Kepuasan peserta"]];
      const tw = (w - 0.6 - 0.14) / 2, th = 0.56;
      for (let i = 0; i < 4; i++) {
        const tx = x + 0.3 + (i % 2) * (tw + 0.14), ty = y + 0.44 + Math.floor(i / 2) * (th + 0.1);
        rrect(s, tx, ty, tw, th, "FFFFFF", { r: 0.1, shadow: true });
        T(s, String(i + 1), { x: tx + 0.12, y: ty, w: 0.3, h: th, fontFace: HEAD, fontSize: 20, bold: true, color: GOLD, valign: "middle" });
        await iconImg(s, inds[i][0], NAVY, tx + 0.44, ty + 0.15, 0.26);
        T(s, inds[i][1], { x: tx + 0.8, y: ty, w: tw - 0.88, h: th, fontSize: 11.5, bold: true, color: NAVY, valign: "middle" });
      }
      y += 1.82;
      T(s, "Data penyertaan, pencapaian penilaian dan maklum balas peserta dijadikan asas pemantauan serta penambahbaikan berterusan", { x: x + 0.25, y, w: w - 0.5, h: bot - y - 0.1, fontSize: 10, italic: true, color: MUTED, valign: "middle" });
    }
    // ---- col 3
    {
      const x = xs[2], w = ws[2], c = cols[2];
      rrect(s, x, cardY, w, ch, CARD, { r: 0.16, shadow: true });
      let y = cardY + 0.2;
      await iconCircle(s, "LuNetwork", c.bg, c.deep, x + 0.22, y, 0.55);
      y += 0.66;
      T(s, "PENGUKUHAN MEKANISME RUJUKAN DAN KERJASAMA ANTARA AGENSI", { x: x + 0.22, y, w: w - 0.44, h: 0.72, fontFace: HEAD, fontSize: 11.5, bold: true, color: c.deep, valign: "middle" });
      y += 0.8;
      const pts = [
        "Bimbingan dan sokongan selepas mengikuti kursus",
        "Bimbingan dan sokongan selepas mendirikan rumah tangga",
        "Kerjasama strategik dengan agensi berkaitan mengikut keperluan pasangan",
      ];
      const ph = [0.52, 0.72, 0.72];
      for (const [k, p] of pts.entries()) {
        await iconImg(s, "LuArrowRight", c.deep, x + 0.22, y + 0.04, 0.2);
        T(s, p, { x: x + 0.52, y, w: w - 0.72, h: ph[k] - 0.05, fontSize: 11, color: INK });
        y += ph[k];
      }
      rrect(s, x + 0.15, bot - 0.82, w - 0.3, 0.66, c.bg, { r: 0.1 });
      T(s, "8", { x: x + 0.3, y: bot - 0.82, w: 0.5, h: 0.66, fontFace: HEAD, fontSize: 30, bold: true, color: c.deep, valign: "middle" });
      T(s, "agensi berkaitan", { x: x + 0.82, y: bot - 0.82, w: w - 1.1, h: 0.66, fontSize: 11, bold: true, color: c.deep, valign: "middle" });
    }
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

  // ======================= SLIDE 7 — PENUTUP =======================
  {
    const s = pres.addSlide();
    bg(s, "bg_cover.png");
    const phW = 5.35;
    await photo(s, 0, 0, phW, H, "Cadangan: Gambar keluarga sebagai visual utama");
    const x0 = phW + 0.55, wR = RX - x0;
    T(s, "KESIMPULAN", { x: x0, y: 0.47, w: 3, h: 0.3, fontFace: HEAD, fontSize: 10, bold: true, color: GOLD, charSpacing: 2, valign: "middle" });
    logos(s, { xr: RX, y: 0.38, h: 0.48 });
    T(s, [
      { text: "KE ARAH KELUARGA", options: { color: NAVY, breakLine: true } },
      { text: "SAKINAH, MAWADDAH", options: { color: GOLD, breakLine: true } },
      { text: "WA RAHMAH", options: { color: GOLD } },
    ], { x: x0, y: 1.05, w: wR, h: 1.55, fontFace: HEAD, fontSize: 30, bold: true, lineSpacingMultiple: 1.0, valign: "middle" });
    label(s, "MELAHIRKAN PASANGAN YANG LEBIH", x0, 2.85, wR, MUTED, 9.5);
    const outs = [
      ["LuBookOpen", "Berilmu", null, P.sage],
      ["LuSprout", "Matang", null, P.blue],
      ["LuShieldCheck", "Bertanggungjawab", null, P.peach],
      ["LuBadgeCheck", "Berkemahiran", "dalam menghadapi cabaran rumah tangga", P.lav],
    ];
    const tw = (wR - 0.2) / 2, th = 0.72;
    for (let i = 0; i < 4; i++) {
      const [ic, t, sub, c] = outs[i];
      const tx = x0 + (i % 2) * (tw + 0.2), ty = 3.17 + Math.floor(i / 2) * (th + 0.16);
      rrect(s, tx, ty, tw, th, CARD, { r: 0.12, shadow: true });
      await iconCircle(s, ic, c.bg, c.deep, tx + 0.14, ty + 0.12, 0.48);
      T(s, sub ? [
        { text: t, options: { bold: true, fontSize: 13, color: NAVY, breakLine: true } },
        { text: sub, options: { fontSize: 9.5, color: MUTED } },
      ] : t, { x: tx + 0.74, y: ty, w: tw - 0.84, h: th, fontSize: 13, bold: true, color: NAVY, valign: "middle" });
    }
    const y5 = 3.17 + 2 * (th + 0.16);
    rrect(s, x0, y5, wR, 0.72, P.gold.bg, { r: 0.12 });
    await iconCircle(s, "LuLandmark", P.gold.deep, "FFFFFF", x0 + 0.14, y5 + 0.12, 0.48);
    T(s, [
      { text: "SETERUSNYA", options: { fontFace: HEAD, bold: true, fontSize: 9, color: GOLD, charSpacing: 1.5, breakLine: true } },
      { text: "Memperkukuh institusi kekeluargaan Islam di Negeri Johor", options: { bold: true, fontSize: 12.5, color: P.gold.deep } },
    ], { x: x0 + 0.74, y: y5, w: wR - 0.9, h: 0.72, valign: "middle" });
    // commitment quote
    const qy = 5.95;
    rrect(s, x0, qy, wR, 0.9, NAVY, { r: 0.12 });
    await iconImg(s, "LuQuote", "D9BE86", x0 + 0.22, qy + 0.2, 0.34);
    T(s, "Kerajaan Negeri Johor melalui JAINJ komited untuk terus menambah baik pelaksanaan Kursus Pra Perkahwinan Islam.",
      { x: x0 + 0.72, y: qy, w: wR - 0.95, h: 0.9, fontSize: 12, italic: true, color: "FFFFFF", valign: "middle" });
    footer(s, 7, x0, true);
  }

  await pres.writeFile({ fileName: OUTFILE });
  console.log("wrote", OUTFILE);
}

build().catch(e => { console.error(e); process.exit(1); });
