const pptxgen = require("pptxgenjs");
const React = require("react");
const RDS = require("react-dom/server");
const sharp = require("sharp");
const fi = require("react-icons/fi");
const path = require("path");

const HF = "Poppins", BF = "Inter";
const C = {
  bg: "F5EFE3", navy: "1B2A6B", gold: "B8903A", goldDk: "8A6A22", ink: "23262E", mute: "6B6558",
  white: "FFFFFF", sand: "EADFC8",
  sage: "D5E3D0", blue: "D3DFEE", peach: "F6D9C4", yellow: "F7EBBE", lav: "E1DAF0", gdPastel: "EBD9A8",
};
const FOOT = "SOALAN LISAN A182  ·  BELANJAWAN JOHOR 2027";

async function icon(name, color = "1B2A6B") {
  const svg = RDS.renderToStaticMarkup(React.createElement(fi[name], { color: "#" + color, size: 256, strokeWidth: 1.4 }));
  const buf = await sharp(Buffer.from(svg)).resize(256, 256).png().toBuffer();
  return "image/png;base64," + buf.toString("base64");
}

const shadow = () => ({ type: "outer", color: "000000", opacity: 0.08, blur: 8, offset: 2, angle: 90 });

(async () => {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE"; // 13.33 x 7.5
  pres.title = "Soalan Lisan A182 – Penambahbaikan Modul Kursus Pra Perkahwinan Islam Johor";
  pres.author = "Pejabat YB Pengerusi JK Hal Ehwal Agama Islam Johor";

  const IC = {};
  for (const n of ["FiDollarSign", "FiMessageCircle", "FiHeart", "FiUsers", "FiSmile", "FiBookOpen", "FiHome", "FiImage", "FiShare2", "FiCheckCircle", "FiAward"])
    IC[n] = await icon(n);
  IC.gold = await icon("FiImage", "B8903A");
  IC.white = {};
  IC.whiteShare = await icon("FiShare2", "FFFFFF");

  // ---------- helpers ----------
  function base(slide, n) {
    slide.background = { color: C.bg };
    // subtle geometry
    slide.addShape(pres.ShapeType.ellipse, { x: -1.6, y: 5.3, w: 4.2, h: 4.2, fill: { color: C.sand, transparency: 55 }, line: { color: C.sand, transparency: 100, width: 0 } });
    slide.addShape(pres.ShapeType.ellipse, { x: 11.2, y: -1.8, w: 3.6, h: 3.6, fill: { color: C.sand, transparency: 60 }, line: { color: C.sand, transparency: 100, width: 0 } });
    // logos pill
    const H = 0.46, ws = [H * 448 / 218, H * 276 / 219, H * 183 / 211], gap = 0.28, pad = 0.3;
    const tot = ws.reduce((a, b) => a + b, 0) + gap * 2;
    const W = tot + pad * 2, px = 12.733 - W, py = 0.36;
    slide.addShape(pres.ShapeType.roundRect, { x: px, y: py, w: W, h: 0.68, fill: { color: C.white }, line: { color: C.sand, width: 0.75 }, rectRadius: 0.34, shadow: shadow(), objectName: "Logo strip" });
    let x = px + pad;
    ["logo_belanjawan", "logo_johor", "logo_majujohor"].forEach((f, i) => {
      slide.addImage({ path: path.join(__dirname, f + ".png"), x, y: py + 0.11, w: ws[i], h: H, altText: f, objectName: "Logo " + (i + 1) });
      x += ws[i] + gap;
    });
    // footer
    slide.addText(FOOT, { x: 0.6, y: 7.1, w: 6, h: 0.25, fontFace: BF, fontSize: 9, color: C.mute, charSpacing: 1.5, margin: 0, isTextBox: true });
    slide.addText(String(n).padStart(2, "0") + " / 07", { x: 11.2, y: 7.1, w: 1.53, h: 0.25, fontFace: BF, fontSize: 9, color: C.mute, align: "right", margin: 0, isTextBox: true });
  }
  function head(slide, kicker, title) {
    if (kicker) slide.addText(kicker, { x: 0.6, y: 0.4, w: 8.6, h: 0.28, fontFace: BF, fontSize: 11, bold: true, color: C.gold, charSpacing: 2, margin: 0, isTextBox: true, objectName: "Kicker" });
    slide.addText(title, { x: 0.6, y: 0.7, w: 8.7, h: 0.85, fontFace: HF, fontSize: 24, bold: true, color: C.navy, valign: "top", margin: 0, isTextBox: true, objectName: "Tajuk" });
  }
  function card(slide, x, y, w, h, fill, name) {
    slide.addShape(pres.ShapeType.roundRect, { x, y, w, h, fill: { color: fill }, line: { color: fill, width: 0 }, rectRadius: 0.18, shadow: shadow(), objectName: name || "Kad" });
  }
  function photo(slide, x, y, w, h, caption, name) {
    slide.addShape(pres.ShapeType.roundRect, { x, y, w, h, fill: { color: "EFE6D3" }, line: { color: C.gold, width: 1, dashType: "dash" }, rectRadius: 0.14, objectName: name || "Ruang gambar" });
    const s = Math.min(0.42, h * 0.3);
    slide.addImage({ data: IC.gold, x: x + w / 2 - s / 2, y: y + h / 2 - s - 0.12, w: s, h: s, objectName: "Ikon gambar" });
    slide.addText([
      { text: "[LETAK GAMBAR DI SINI]", options: { bold: true, fontSize: 10, color: C.goldDk, breakLine: true } },
      { text: caption, options: { fontSize: 9, color: C.mute } },
    ], { x: x + 0.1, y: y + h / 2 + 0.02, w: w - 0.2, h: Math.min(0.7, h / 2 - 0.05), align: "center", valign: "top", fontFace: BF, margin: 0, isTextBox: true, objectName: "Teks ruang gambar" });
  }
  function badge(slide, x, y, d, txt, fill = C.navy, color = C.white, size = 14) {
    slide.addShape(pres.ShapeType.ellipse, { x, y, w: d, h: d, fill: { color: fill }, line: { color: fill, width: 0 } });
    slide.addText(txt, { x, y, w: d, h: d, align: "center", valign: "middle", fontFace: HF, fontSize: size, bold: true, color, margin: 0, isTextBox: true });
  }
  function iconCircle(slide, x, y, d, ic) {
    slide.addShape(pres.ShapeType.ellipse, { x, y, w: d, h: d, fill: { color: C.white }, line: { color: C.white, width: 0 } });
    slide.addImage({ data: ic, x: x + d * 0.25, y: y + d * 0.25, w: d * 0.5, h: d * 0.5 });
  }
  function bullets(slide, items, x, y, w, h, size = 12, color = C.ink) {
    slide.addText(items.map((t, i) => ({ text: t, options: { bullet: { indent: 12 }, breakLine: i < items.length - 1, paraSpaceAfter: 4 } })), {
      x, y, w, h, fontFace: BF, fontSize: size, color, valign: "top", margin: 0, isTextBox: true,
    });
  }
  function line(slide, x1, y1, x2, y2, color = C.gold, width = 1.25) {
    const o = { x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.abs(x2 - x1) || 0.001, h: Math.abs(y2 - y1) || 0.001, line: { color, width } };
    if ((x2 - x1) * (y2 - y1) < 0) o.flipV = true;
    slide.addShape(pres.ShapeType.line, o);
  }
  const lab = (slide, t, x, y, w, color = C.goldDk) =>
    slide.addText(t, { x, y, w, h: 0.26, fontFace: BF, fontSize: 10.5, bold: true, color, charSpacing: 1.2, margin: 0, isTextBox: true });

  // =============== SLIDE 1 — COVER ===============
  {
    const s = pres.addSlide(); base(s, 1);
    s.addShape(pres.ShapeType.roundRect, { x: 0.6, y: 0.45, w: 2.75, h: 0.36, fill: { color: C.navy }, line: { color: C.navy, width: 0 }, rectRadius: 0.18 });
    s.addText("BELANJAWAN JOHOR 2027", { x: 0.6, y: 0.45, w: 2.75, h: 0.36, align: "center", valign: "middle", fontFace: BF, fontSize: 10.5, bold: true, color: C.white, charSpacing: 1.5, margin: 0, isTextBox: true });
    s.addText("SOALAN LISAN", { x: 0.6, y: 1.35, w: 6.8, h: 0.35, fontFace: BF, fontSize: 14, bold: true, color: C.goldDk, charSpacing: 4, margin: 0, isTextBox: true });
    s.addText("A182", { x: 0.55, y: 1.6, w: 6.8, h: 1.5, fontFace: HF, fontSize: 96, bold: true, color: C.gold, margin: 0, valign: "middle", isTextBox: true, objectName: "Nombor A182" });
    s.addText("PENAMBAHBAIKAN MODUL KURSUS PRA PERKAHWINAN ISLAM NEGERI JOHOR", { x: 0.6, y: 3.25, w: 6.9, h: 1.95, fontFace: HF, fontSize: 30, bold: true, color: C.navy, valign: "top", margin: 0, isTextBox: true, objectName: "Tajuk utama" });
    s.addText([
      { text: "YB Datuk Mohamad Najib bin Samuri", options: { bold: true, fontSize: 16, color: C.ink, breakLine: true } },
      { text: "ADUN Parit Yaani", options: { fontSize: 14, color: C.mute, breakLine: true } },
      { text: " ", options: { fontSize: 8, breakLine: true } },
      { text: "Sidang DUN Johor  ·  Belanjawan 2027", options: { fontSize: 13, color: C.ink, breakLine: true } },
      { text: "23 November 2026", options: { fontSize: 13, bold: true, color: C.navy } },
    ], { x: 0.6, y: 5.4, w: 6.9, h: 1.5, fontFace: BF, valign: "top", margin: 0, isTextBox: true, objectName: "Maklumat" });
    photo(s, 7.9, 1.45, 4.83, 5.4, "Gambar YB Fared ketika Sidang DUN", "Ruang gambar utama");
  }

  // =============== SLIDE 2 — MBKPPI ===============
  {
    const s = pres.addSlide(); base(s, 2);
    head(s, "PENGENALAN MBKPPI VERSI 5", "9 TAJUK UTAMA, PERSEDIAAN LEBIH MENYELURUH");
    // left info card
    card(s, 0.6, 1.65, 3.85, 3.95, C.white, "Kad maklumat");
    s.addText("MODUL BERSEPADU KURSUS PRA PERKAHWINAN ISLAM (MBKPPI) VERSI 5", { x: 0.85, y: 1.85, w: 3.35, h: 0.75, fontFace: HF, fontSize: 11.5, bold: true, color: C.navy, valign: "top", margin: 0, isTextBox: true });
    bullets(s, ["Dilancarkan pada 22 Oktober 2026.", "Oleh YB Pengerusi Jawatankuasa Hal Ehwal Agama Islam Negeri Johor.", "Jabatan Agama Islam Negeri Johor (JAINJ)."], 0.85, 2.65, 3.35, 1.1, 11);
    s.addShape(pres.ShapeType.roundRect, { x: 0.85, y: 3.8, w: 3.35, h: 1.6, fill: { color: C.yellow }, line: { color: C.yellow, width: 0 }, rectRadius: 0.12 });
    s.addText("“Memastikan bakal pasangan bukan sahaja mempunyai kefahaman mengenai hukum-hakam perkahwinan, malah turut dilengkapi dengan ilmu pengetahuan, kemahiran dan persediaan praktikal dalam mengurus kehidupan berkeluarga.”",
      { x: 0.98, y: 3.86, w: 3.1, h: 1.48, fontFace: BF, fontSize: 9.5, italic: true, color: C.ink, valign: "middle", margin: 0, isTextBox: true, objectName: "Objektif" });
    photo(s, 0.6, 5.8, 3.85, 1.15, "Gambar pelaksanaan Kursus Pra Perkahwinan Islam", "Ruang gambar kursus");

    // mind map
    const hub = { x: 8.67, y: 3.2, d: 2.0 };
    const nodes = [
      ["1", "Tasawwur Islam", C.sage, 5.95, 2.0],
      ["2", "Perkahwinan dan Majlis Akad Nikah", C.blue, 5.95, 3.2],
      ["3", "Prosedur Perkahwinan", C.peach, 5.95, 4.4],
      ["4", "Tanggungjawab Suami Isteri", C.yellow, 11.4, 2.0],
      ["5", "Komunikasi Suami Isteri", C.lav, 11.4, 3.2],
      ["6", "Pengurusan Kewangan", C.gdPastel, 11.4, 4.4],
      ["7", "Pengurusan Kesihatan", C.sage, 6.1, 5.85],
      ["8", "Pengurusan Stres dan Konflik", C.blue, 8.67, 5.85],
      ["9", "Pembubaran Perkahwinan", C.peach, 11.24, 5.85],
    ];
    const NW = 2.4, NH = 0.85;
    nodes.forEach(([n, t, f, cx, cy]) => line(s, hub.x, hub.y, cx, cy));
    s.addShape(pres.ShapeType.ellipse, { x: hub.x - hub.d / 2 - 0.1, y: hub.y - hub.d / 2 - 0.1, w: hub.d + 0.2, h: hub.d + 0.2, fill: { color: C.bg }, line: { color: C.gold, width: 1.25 } });
    s.addShape(pres.ShapeType.ellipse, { x: hub.x - hub.d / 2, y: hub.y - hub.d / 2, w: hub.d, h: hub.d, fill: { color: C.navy }, line: { color: C.navy, width: 0 }, shadow: shadow() });
    s.addText([
      { text: "MBKPPI", options: { fontSize: 20, bold: true, color: C.white, breakLine: true } },
      { text: "VERSI 5", options: { fontSize: 16, bold: true, color: "E3C77A" } },
    ], { x: hub.x - hub.d / 2, y: hub.y - 0.5, w: hub.d, h: 1.0, align: "center", valign: "middle", fontFace: HF, margin: 0, isTextBox: true, objectName: "Nod pusat" });
    nodes.forEach(([n, t, f, cx, cy]) => {
      const x = cx - NW / 2, y = cy - NH / 2;
      s.addShape(pres.ShapeType.roundRect, { x, y, w: NW, h: NH, fill: { color: f }, line: { color: C.white, width: 1.5 }, rectRadius: 0.2, shadow: shadow(), objectName: "Cabang " + n });
      badge(s, x + 0.12, cy - 0.2, 0.4, n, C.navy, C.white, 12);
      s.addText(t, { x: x + 0.62, y: y + 0.05, w: NW - 0.72, h: NH - 0.1, fontFace: BF, fontSize: 12, bold: true, color: C.ink, valign: "middle", margin: 0, isTextBox: true });
    });
  }

  // =============== SLIDE 3 — BAHAGIAN 1 ===============
  {
    const s = pres.addSlide(); base(s, 3);
    head(s, "PENAMBAHBAIKAN MODUL  ·  BAHAGIAN 1", "PERSIAPAN MEMBINA RUMAH TANGGA");
    const Y = 1.65, H = 5.3;
    const cols = [
      { x: 0.6, w: 3.5, f: C.sage, n: "1", ic: IC.FiDollarSign, t: "PENGURUSAN KEWANGAN KELUARGA DAN TANGGUNGJAWAB NAFKAH",
        b: ["Perancangan perbelanjaan", "Amalan menabung", "Pengurusan hutang", "Tanggungjawab nafkah", "Hak dan tanggungjawab suami isteri", "Kestabilan kewangan serta kesejahteraan keluarga"], cap: "Gambar program kewangan keluarga" },
      { x: 4.35, w: 3.5, f: C.blue, n: "2", ic: IC.FiMessageCircle, t: "KOMUNIKASI SUAMI ISTERI",
        b: ["Komunikasi yang berkesan", "Komunikasi dalam era digital", "Penggunaan media sosial dan teknologi secara beretika", "Penjagaan privasi", "Pembinaan kepercayaan", "Sikap saling memahami antara pasangan"], cap: "Gambar peserta kursus" },
    ];
    cols.forEach((c) => {
      card(s, c.x, Y, c.w, H, c.f, "Kad kategori " + c.n);
      badge(s, c.x + 0.25, Y + 0.25, 0.46, c.n, C.navy, C.white, 15);
      lab(s, "KATEGORI " + c.n, c.x + 0.82, Y + 0.35, 1.6);
      iconCircle(s, c.x + c.w - 0.8, Y + 0.22, 0.52, c.ic);
      s.addText(c.t, { x: c.x + 0.25, y: Y + 0.9, w: c.w - 0.5, h: 0.62, fontFace: HF, fontSize: 12, bold: true, color: C.navy, valign: "top", margin: 0, isTextBox: true });
      bullets(s, c.b, c.x + 0.25, Y + 1.7, c.w - 0.5, 2.2, 12);
      photo(s, c.x + 0.25, Y + H - 1.45, c.w - 0.5, 1.2, c.cap);
    });
    // card 3 — larger
    const x = 8.1, w = 4.63;
    card(s, x, Y, w, H, C.peach, "Kad kategori 3");
    badge(s, x + 0.25, Y + 0.25, 0.46, "3", C.navy, C.white, 15);
    lab(s, "KATEGORI 3", x + 0.82, Y + 0.35, 1.6);
    iconCircle(s, x + w - 0.8, Y + 0.22, 0.52, IC.FiHeart);
    s.addText("PENGURUSAN KESIHATAN MENTAL", { x: x + 0.25, y: Y + 0.9, w: w - 0.5, h: 0.32, fontFace: HF, fontSize: 12, bold: true, color: C.navy, margin: 0, isTextBox: true });
    lab(s, "TANDA-TANDA TEKANAN EMOSI", x + 0.25, Y + 1.3, 3.5);
    bullets(s, ["Stres berlebihan", "Keresahan", "Kemurungan"], x + 0.25, Y + 1.58, 1.95, 0.75, 12);
    bullets(s, ["Mudah marah", "Gangguan tidur"], x + 2.3, Y + 1.58, 1.95, 0.75, 12);
    lab(s, "PENGURUSAN DAN BANTUAN", x + 0.25, Y + 2.3, 3.5);
    bullets(s, ["Pengurusan emosi", "Sokongan pasangan", "Klinik Kesihatan dan hospital kerajaan", "Pegawai Psikologi", "Kaunselor Berdaftar", "Pakar Psikiatri", "Perkhidmatan MENTARI di bawah Kementerian Kesihatan Malaysia"], x + 0.25, Y + 2.58, w - 0.5, 1.95, 12);
    s.addShape(pres.ShapeType.roundRect, { x: x + 0.25, y: Y + 4.65, w: w - 0.5, h: 0.52, fill: { color: C.navy }, line: { color: C.navy, width: 0 }, rectRadius: 0.14, objectName: "Mesej penting" });
    s.addText("Masalah kesihatan mental bukanlah tanda kelemahan diri.", { x: x + 0.4, y: Y + 4.65, w: w - 0.8, h: 0.52, fontFace: BF, fontSize: 12, bold: true, italic: true, color: C.white, align: "center", valign: "middle", margin: 0, isTextBox: true });
  }

  // =============== SLIDE 4 — BAHAGIAN 2 ===============
  {
    const s = pres.addSlide(); base(s, 4);
    head(s, "PENAMBAHBAIKAN MODUL  ·  BAHAGIAN 2", "MEMPERKUKUH INSTITUSI KEKELUARGAAN");
    // Kategori 6 — large
    const x = 0.6, Y = 1.65, w = 5.4, H = 5.3;
    card(s, x, Y, w, H, C.lav, "Kad kategori 6");
    badge(s, x + 0.25, Y + 0.25, 0.5, "6", C.navy, C.white, 16);
    lab(s, "KATEGORI 6", x + 0.88, Y + 0.38, 1.6);
    iconCircle(s, x + w - 0.85, Y + 0.22, 0.56, IC.FiHome);
    s.addText("PEMANTAPAN AKIDAH DAN TANGGUNGJAWAB SUAMI ISTERI", { x: x + 0.3, y: Y + 0.95, w: w - 0.6, h: 0.62, fontFace: HF, fontSize: 13.5, bold: true, color: C.navy, valign: "top", margin: 0, isTextBox: true });
    const chip = (t, yy) => {
      s.addShape(pres.ShapeType.roundRect, { x: x + 0.3, y: yy, w: w - 0.6, h: 0.42, fill: { color: C.white }, line: { color: C.white, width: 0 }, rectRadius: 0.12 });
      s.addText(t, { x: x + 0.45, y: yy, w: w - 0.9, h: 0.42, fontFace: BF, fontSize: 12, bold: true, color: C.ink, valign: "middle", margin: 0, isTextBox: true });
    };
    chip("Pegangan Ahli Sunnah Wal Jamaah", Y + 1.68);
    chip("Aliran Al-Asya'irah dan Al-Maturidiyyah", Y + 2.18);
    s.addText("Asas pembentukan keluarga Islam", { x: x + 0.3, y: Y + 2.68, w: w - 0.6, h: 0.3, fontFace: BF, fontSize: 12, color: C.ink, margin: 0, isTextBox: true });
    s.addText("Konsep lelaki sebagai qawwam", { x: x + 0.3, y: Y + 3.1, w: w - 0.6, h: 0.34, fontFace: HF, fontSize: 14, bold: true, color: C.navy, margin: 0, isTextBox: true });
    lab(s, "TANGGUNGJAWAB QAWWAM", x + 0.3, Y + 3.45, 3.5);
    ["Memimpin", "Memberikan nafkah", "Melindungi", "Membimbing keluarga"].forEach((t, i) => {
      const tx = x + 0.3 + (i % 2) * 2.4, ty = Y + 3.75 + Math.floor(i / 2) * 0.5;
      s.addShape(pres.ShapeType.roundRect, { x: tx, y: ty, w: 2.3, h: 0.42, fill: { color: C.navy }, line: { color: C.navy, width: 0 }, rectRadius: 0.12 });
      s.addText(t, { x: tx, y: ty, w: 2.3, h: 0.42, fontFace: BF, fontSize: 12, bold: true, color: C.white, align: "center", valign: "middle", margin: 0, isTextBox: true });
    });
    s.addText("Turut menekankan hak serta peranan masing-masing dalam institusi perkahwinan.", { x: x + 0.3, y: Y + 4.78, w: w - 0.6, h: 0.42, fontFace: BF, fontSize: 11, italic: true, color: C.mute, valign: "top", margin: 0, isTextBox: true });

    // Kategori 4
    const rx = 6.25, rw = 6.48;
    card(s, rx, 1.65, rw, 2.3, C.peach, "Kad kategori 4");
    badge(s, rx + 0.25, 1.85, 0.42, "4", C.navy, C.white, 14);
    lab(s, "KATEGORI 4", rx + 0.8, 1.94, 1.6);
    iconCircle(s, rx + rw - 0.8, 1.82, 0.5, IC.FiUsers);
    s.addText("PENGURUSAN KONFLIK DAN TEKANAN RUMAH TANGGA", { x: rx + 0.25, y: 2.38, w: rw - 0.5, h: 0.3, fontFace: HF, fontSize: 12.5, bold: true, color: C.navy, margin: 0, isTextBox: true });
    bullets(s, ["Pengawalan emosi", "Komunikasi berkesan", "Menyelesaikan perselisihan secara matang dan berhemah"], rx + 0.25, 2.8, 2.9, 1.1, 12);
    bullets(s, ["Menghadapi cabaran kehidupan berumah tangga", "Mengelakkan konflik daripada menjejaskan keharmonian keluarga"], rx + 3.3, 2.8, 2.95, 1.1, 12);
    // Kategori 5
    card(s, rx, 4.2, rw, 2.75, C.yellow, "Kad kategori 5");
    badge(s, rx + 0.25, 4.4, 0.42, "5", C.navy, C.white, 14);
    lab(s, "KATEGORI 5", rx + 0.8, 4.49, 1.6);
    s.addText("KEMAHIRAN KEIBUBAPAAN", { x: rx + 0.25, y: 4.93, w: 3.6, h: 0.3, fontFace: HF, fontSize: 12.5, bold: true, color: C.navy, margin: 0, isTextBox: true });
    bullets(s, ["Tanggungjawab ibu bapa", "Mendidik dan membimbing anak-anak", "Pembentukan akhlak", "Pendidikan agama", "Pelaksanaan tanggungjawab bersama", "Membina keluarga yang sejahtera"], rx + 0.25, 5.35, 3.7, 1.5, 12);
    photo(s, rx + rw - 2.5, 4.4, 2.25, 2.35, "Gambar program kekeluargaan");
  }

  // =============== SLIDE 5 — TIGA PENDEKATAN ===============
  {
    const s = pres.addSlide(); base(s, 5);
    head(s, "TIGA PENDEKATAN UTAMA", "PEMANTAPAN PELAKSANAAN DAN KEBERKESANAN KURSUS");
    const Y = 1.65, H = 5.3;
    const b1 = { x: 0.6, w: 3.3 }, b2 = { x: 4.3, w: 4.9 }, b3 = { x: 9.6, w: 3.13 };
    // arrows
    [[3.9, 4.3], [9.2, 9.6]].forEach(([a, b]) => {
      s.addShape(pres.ShapeType.chevron, { x: a + 0.02, y: Y + H / 2 - 0.28, w: b - a - 0.04, h: 0.56, fill: { color: C.gold }, line: { color: C.gold, width: 0 } });
    });
    const header = (b, n, f, kicker) => {
      card(s, b.x, Y, b.w, H, f, "Blok pendekatan " + n);
      badge(s, b.x + 0.25, Y + 0.25, 0.55, n, C.navy, C.white, 18);
      lab(s, "PENDEKATAN " + n, b.x + 0.95, Y + 0.4, 2);
    };
    // 1
    header(b1, "1", C.sage);
    s.addText("PEMANTAPAN KOMPETENSI PENCERAMAH DAN KAEDAH PENYAMPAIAN", { x: b1.x + 0.25, y: Y + 0.98, w: b1.w - 0.5, h: 0.8, fontFace: HF, fontSize: 12, bold: true, color: C.navy, valign: "top", margin: 0, isTextBox: true });
    bullets(s, ["Latihan dan penyelarasan penyampaian modul", "Perbincangan", "Kajian kes", "Simulasi", "Perkongsian pengalaman", "Mengaplikasikan ilmu dalam situasi sebenar kehidupan berumah tangga"], b1.x + 0.25, Y + 1.75, b1.w - 0.5, 2.2, 12);
    photo(s, b1.x + 0.25, Y + H - 1.2, b1.w - 0.5, 0.95, "Gambar penceramah / pelaksanaan kursus");
    // 2
    header(b2, "2", C.blue);
    s.addText("PENAMBAHBAIKAN KAEDAH PENILAIAN DAN PEMANTAUAN PESERTA", { x: b2.x + 0.25, y: Y + 0.98, w: b2.w - 0.5, h: 0.5, fontFace: HF, fontSize: 12, bold: true, color: C.navy, valign: "top", margin: 0, isTextBox: true });
    const ax = b2.x + 0.25, aw = b2.w - 0.5;
    s.addShape(pres.ShapeType.roundRect, { x: ax, y: Y + 1.55, w: aw, h: 1.3, fill: { color: C.navy }, line: { color: C.navy, width: 0 }, rectRadius: 0.16, shadow: shadow(), objectName: "Jangkar SPPIM" });
    s.addText([
      { text: "SPPIM", options: { fontFace: HF, fontSize: 26, bold: true, color: "E3C77A", breakLine: true } },
      { text: "Sistem Pengurusan Perkahwinan Islam", options: { fontFace: BF, fontSize: 10, color: C.white } },
    ], { x: ax + 0.2, y: Y + 1.6, w: 1.75, h: 1.2, valign: "middle", margin: 0, isTextBox: true });
    bullets(s, ["Rekod penyertaan", "Kehadiran", "Penilaian peserta", "Ujian penilaian bagi setiap tajuk"], ax + 2.15, Y + 1.7, aw - 2.3, 1.05, 11, C.white);
    lab(s, "EMPAT INDIKATOR PEMANTAUAN", ax, Y + 3.0, aw, C.navy);
    ["Kadar penyertaan", "Pencapaian penilaian", "Tahap kefahaman", "Kepuasan peserta"].forEach((t, i) => {
      const tw = (aw - 0.12) / 2, tx = ax + (i % 2) * (tw + 0.12), ty = Y + 3.3 + Math.floor(i / 2) * 0.7;
      s.addShape(pres.ShapeType.roundRect, { x: tx, y: ty, w: tw, h: 0.6, fill: { color: C.white }, line: { color: C.white, width: 0 }, rectRadius: 0.14, shadow: shadow(), objectName: "Indikator " + (i + 1) });
      s.addText(String(i + 1), { x: tx + 0.1, y: ty, w: 0.45, h: 0.6, fontFace: HF, fontSize: 24, bold: true, color: C.gold, valign: "middle", align: "center", margin: 0, isTextBox: true });
      s.addText(t, { x: tx + 0.6, y: ty, w: tw - 0.65, h: 0.6, fontFace: BF, fontSize: 11.5, bold: true, color: C.ink, valign: "middle", margin: 0, isTextBox: true });
    });
    s.addText("Data penyertaan, pencapaian penilaian dan maklum balas peserta dijadikan asas pemantauan serta penambahbaikan berterusan.", { x: ax, y: Y + 4.7, w: aw, h: 0.5, fontFace: BF, fontSize: 10.5, italic: true, color: C.ink, valign: "top", margin: 0, isTextBox: true });
    // 3
    header(b3, "3", C.peach);
    s.addText("PENGUKUHAN MEKANISME RUJUKAN DAN KERJASAMA ANTARA AGENSI", { x: b3.x + 0.25, y: Y + 0.98, w: b3.w - 0.5, h: 0.95, fontFace: HF, fontSize: 12, bold: true, color: C.navy, valign: "top", margin: 0, isTextBox: true });
    bullets(s, ["Bimbingan dan sokongan selepas mengikuti kursus", "Bimbingan selepas mendirikan rumah tangga", "Kerjasama strategik dengan agensi berkaitan mengikut keperluan pasangan"], b3.x + 0.25, Y + 2.1, b3.w - 0.5, 2.0, 12);
    s.addShape(pres.ShapeType.ellipse, { x: b3.x + b3.w / 2 - 0.55, y: Y + H - 1.4, w: 1.1, h: 1.1, fill: { color: C.navy }, line: { color: C.navy, width: 0 } });
    s.addImage({ data: IC.whiteShare, x: b3.x + b3.w / 2 - 0.28, y: Y + H - 1.13, w: 0.56, h: 0.56 });
  }

  // =============== SLIDE 6 — EKOSISTEM ===============
  {
    const s = pres.addSlide(); base(s, 6);
    head(s, "EKOSISTEM KERJASAMA ANTARA AGENSI", "SOKONGAN BERTERUSAN MELALUI KERJASAMA STRATEGIK");
    const cat = { kel: [C.sage, "Kekeluargaan"], und: [C.blue, "Perundangan"], kes: [C.lav, "Kesihatan mental"], kew: [C.yellow, "Kewangan"], keb: [C.peach, "Kebajikan"] };
    const ag = [
      ["1", "BAHAGIAN PEMBANGUNAN KELUARGA JAINJ", "Program pasca perkahwinan  ·  Pengukuhan hubungan suami isteri  ·  Khidmat nasihat berkaitan masalah rumah tangga", "kel"],
      ["2", "YAYASAN PEMBANGUNAN KELUARGA DARUL TA'ZIM (YPKDT)", "Bimbingan dan pembangunan institusi keluarga", "kel"],
      ["3", "JABATAN KEHAKIMAN SYARIAH NEGERI JOHOR (JKSNJ)", "Khidmat berkaitan undang-undang keluarga Islam  ·  Penyelesaian konflik rumah tangga", "und"],
      ["4", "LEMBAGA PENDUDUK DAN PEMBANGUNAN KELUARGA NEGARA (LPPKN)", "Khidmat runding cara  ·  Pendidikan kekeluargaan", "kel"],
      ["5", "JABATAN KESIHATAN NEGERI JOHOR", "Rujukan berkaitan kesihatan mental  ·  Bantuan profesional", "kes"],
      ["6", "MAJLIS AGAMA ISLAM NEGERI JOHOR (MAINJ)", "Bantuan kewangan dan kebajikan kepada pasangan yang memenuhi syarat kelayakan", "keb"],
      ["7", "JABATAN KEBAJIKAN MASYARAKAT (JKM)", "Bantuan kebajikan  ·  Perlindungan sosial", "keb"],
      ["8", "AGENSI KAUNSELING DAN PENGURUSAN KREDIT (AKPK)", "Pendidikan kewangan  ·  Khidmat nasihat pengurusan hutang", "kew"],
    ];
    const hub = { x: 6.667, y: 3.6, d: 2.0 };
    const CW = 4.35, CH = 1.2, GAP = 0.15, Y0 = 1.65;
    const pos = (i) => {
      const left = i < 4, r = i % 4;
      return { x: left ? 0.6 : 12.733 - CW, y: Y0 + r * (CH + GAP), left };
    };
    // connectors first
    ag.forEach((a, i) => {
      const p = pos(i);
      line(s, hub.x, hub.y, p.left ? p.x + CW : p.x, p.y + CH / 2, C.gold, 1.25);
    });
    // cards
    ag.forEach((a, i) => {
      const p = pos(i), [f] = cat[a[3]];
      s.addShape(pres.ShapeType.roundRect, { x: p.x, y: p.y, w: CW, h: CH, fill: { color: f }, line: { color: C.white, width: 1.25 }, rectRadius: 0.16, shadow: shadow(), objectName: "Agensi " + a[0] });
      badge(s, p.x + 0.14, p.y + 0.14, 0.36, a[0], C.navy, C.white, 11);
      s.addText(a[1], { x: p.x + 0.62, y: p.y + 0.08, w: CW - 0.75, h: 0.46, fontFace: HF, fontSize: 9.5, bold: true, color: C.navy, valign: "middle", margin: 0, isTextBox: true });
      s.addText(a[2], { x: p.x + 0.2, y: p.y + 0.58, w: CW - 0.4, h: 0.55, fontFace: BF, fontSize: 10.5, color: C.ink, valign: "top", margin: 0, isTextBox: true });
    });
    // hub
    s.addShape(pres.ShapeType.ellipse, { x: hub.x - hub.d / 2 - 0.1, y: hub.y - hub.d / 2 - 0.1, w: hub.d + 0.2, h: hub.d + 0.2, fill: { color: C.bg }, line: { color: C.gold, width: 1.25 } });
    s.addShape(pres.ShapeType.ellipse, { x: hub.x - hub.d / 2, y: hub.y - hub.d / 2, w: hub.d, h: hub.d, fill: { color: C.navy }, line: { color: C.navy, width: 0 }, shadow: shadow() });
    s.addText([
      { text: "JAINJ", options: { fontFace: HF, fontSize: 24, bold: true, color: "E3C77A", breakLine: true } },
      { text: "Jabatan Agama Islam Negeri Johor", options: { fontFace: BF, fontSize: 9.5, color: C.white } },
    ], { x: hub.x - 0.85, y: hub.y - 0.7, w: 1.7, h: 1.4, align: "center", valign: "middle", margin: 0, isTextBox: true, objectName: "Hab JAINJ" });
    // legend + photo (bottom centre)
    photo(s, 5.17, 4.95, 3.0, 1.0, "Gambar aktiviti JAINJ / program kekeluargaan");
    s.addShape(pres.ShapeType.roundRect, { x: 5.17, y: 6.08, w: 3.0, h: 0.87, fill: { color: C.white }, line: { color: C.sand, width: 0.75 }, rectRadius: 0.12, objectName: "Legenda" });
    Object.values(cat).forEach(([f, t], i) => {
      const lx = 5.3 + (i % 2) * 1.5, ly = 6.14 + Math.floor(i / 2) * 0.25;
      s.addShape(pres.ShapeType.ellipse, { x: lx, y: ly + 0.04, w: 0.15, h: 0.15, fill: { color: f }, line: { color: C.gold, width: 0.5 } });
      s.addText(t, { x: lx + 0.22, y: ly, w: 1.25, h: 0.23, fontFace: BF, fontSize: 9.5, color: C.ink, margin: 0, valign: "middle", isTextBox: true });
    });
  }

  // =============== SLIDE 7 — PENUTUP ===============
  {
    const s = pres.addSlide(); base(s, 7);
    photo(s, 0.6, 1.4, 5.3, 5.55, "Gambar keluarga", "Ruang gambar keluarga");
    s.addText("PENUTUP", { x: 6.4, y: 1.45, w: 6.3, h: 0.28, fontFace: BF, fontSize: 11, bold: true, color: C.gold, charSpacing: 2, margin: 0, isTextBox: true });
    s.addText("KE ARAH KELUARGA SAKINAH, MAWADDAH WA RAHMAH", { x: 6.4, y: 1.8, w: 6.33, h: 1.55, fontFace: HF, fontSize: 30, bold: true, color: C.navy, valign: "top", margin: 0, isTextBox: true, objectName: "Tajuk penutup" });
    const out = ["Pasangan yang lebih berilmu", "Matang", "Bertanggungjawab", "Berkemahiran dalam menghadapi cabaran rumah tangga", "Memperkukuh institusi kekeluargaan Islam di Negeri Johor"];
    out.forEach((t, i) => {
      const y = 3.5 + i * 0.52;
      s.addShape(pres.ShapeType.roundRect, { x: 6.4, y, w: 6.33, h: 0.44, fill: { color: [C.sage, C.blue, C.peach, C.yellow, C.lav][i] }, line: { color: C.white, width: 1 }, rectRadius: 0.22, objectName: "Hasil " + (i + 1) });
      badge(s, 6.46, y + 0.05, 0.34, String(i + 1), C.navy, C.white, 11);
      s.addText(t, { x: 6.95, y, w: 5.65, h: 0.44, fontFace: BF, fontSize: 12.5, bold: true, color: C.ink, valign: "middle", margin: 0, isTextBox: true });
    });
    s.addShape(pres.ShapeType.roundRect, { x: 6.4, y: 6.2, w: 6.33, h: 0.75, fill: { color: C.navy }, line: { color: C.navy, width: 0 }, rectRadius: 0.14, objectName: "Kenyataan penutup" });
    s.addText("“Kerajaan Negeri Johor melalui JAINJ komited untuk terus menambah baik pelaksanaan Kursus Pra Perkahwinan Islam.”", { x: 6.6, y: 6.2, w: 5.93, h: 0.75, fontFace: BF, fontSize: 11.5, italic: true, color: C.white, valign: "middle", margin: 0, isTextBox: true });
  }

  await pres.writeFile({ fileName: path.join(__dirname, "Infografik_A182_Kursus_Pra_Perkahwinan.pptx") });
  console.log("done");
})();
