// Generates background, photo placeholders, icons (PNG) for the deck
const sharp = require("sharp");
const React = require("react");
const RDS = require("react-dom/server");
const lu = require("react-icons/lu");
const path = require("path");
const fs = require("fs");

const OUT = path.join(__dirname, "gen");
fs.mkdirSync(OUT, { recursive: true });

function iconSvg(name, color, size, stroke = 1.6) {
  const C = lu[name];
  if (!C) throw new Error("icon missing " + name);
  return RDS.renderToStaticMarkup(
    React.createElement(C, { size, color: "#" + color, strokeWidth: stroke })
  );
}

async function iconPng(name, color, stroke = 1.6) {
  const svg = iconSvg(name, color, 256, stroke);
  const buf = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + buf.toString("base64");
}

// Subtle 8-point-star geometric pattern (Islamic motif), very faint
function starPattern(cx, cy, r, color, op) {
  const sq = (rot) => {
    const pts = [];
    for (let i = 0; i < 4; i++) {
      const a = ((rot + i * 90 + 45) * Math.PI) / 180;
      pts.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`);
    }
    return `<polygon points="${pts.join(" ")}" fill="none" stroke="#${color}" stroke-opacity="${op}" stroke-width="2"/>`;
  };
  return sq(0) + sq(45) + `<circle cx="${cx}" cy="${cy}" r="${(r * 0.42).toFixed(1)}" fill="none" stroke="#${color}" stroke-opacity="${op}" stroke-width="2"/>`;
}

async function background(file, corner) {
  const W = 2667, H = 1500;
  let pattern = "";
  const step = 150;
  for (let gx = 0; gx < 7; gx++) {
    for (let gy = 0; gy < 5; gy++) {
      const x = corner === "br" ? W - gx * step - 20 : corner === "bl" ? gx * step + 20 : W - gx * step - 20;
      const y = corner === "tr" ? gy * step + 20 : H - gy * step - 20;
      const d = Math.sqrt(gx * gx + gy * gy);
      const op = Math.max(0, 0.11 - d * 0.022);
      if (op > 0.005) pattern += starPattern(x, y, 62, "A8894F", op.toFixed(3));
    }
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#FCF9F3"/>
      <stop offset="0.55" stop-color="#F8F2E7"/>
      <stop offset="1" stop-color="#F2E9D9"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  ${pattern}
</svg>`;
  await sharp(Buffer.from(svg)).png().toFile(path.join(OUT, file));
}

// Photo placeholder with text baked in, so replacing the image in Canva removes everything
async function placeholder(file, wIn, hIn, hint) {
  const S = 200;
  const W = Math.round(wIn * S), H = Math.round(hIn * S);
  const m = Math.min(W, H);
  const iconSize = Math.round(Math.min(m * 0.18, 120));
  const fs1 = Math.round(Math.max(16, Math.min((W - 60) / 15, H / 6, 46)));
  const fs2 = Math.round(fs1 * 0.62);
  const blockH = iconSize + 20 + fs1 + 14 + fs2 * 2.4;
  const top = (H - blockH) / 2;
  const icon = iconSvg("LuImagePlus", "9C7F4E", iconSize, 1.3).replace(
    "<svg ",
    `<svg x="${(W - iconSize) / 2}" y="${top}" `
  );
  // wrap hint to two lines if long
  const words = hint.split(" ");
  const maxChars = Math.floor((W - 70) / (fs2 * 0.6));
  const lines = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > maxChars) { lines.push(cur.trim()); cur = w; }
    else cur += " " + w;
  }
  if (cur.trim()) lines.push(cur.trim());
  const hintSvg = lines.slice(0, 3).map((l, i) =>
    `<text x="${W / 2}" y="${top + iconSize + 20 + fs1 + 18 + fs2 * (i + 0.9) * 1.25}" font-family="Inter" font-size="${fs2}" fill="#8A7653" text-anchor="middle">${l}</text>`
  ).join("");
  let hatch = "";
  for (let i = -H; i < W; i += 28) hatch += `<line x1="${i}" y1="${H}" x2="${i + H}" y2="0" stroke="#E6D9C1" stroke-width="2"/>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <rect width="${W}" height="${H}" fill="#EFE5D2"/>
  ${hatch}
  <rect x="18" y="18" width="${W - 36}" height="${H - 36}" fill="none" stroke="#C4AA7A" stroke-width="3" stroke-dasharray="14 10"/>
  ${icon}
  <text x="${W / 2}" y="${top + iconSize + 20 + fs1 * 0.85}" font-family="Montserrat" font-weight="700" font-size="${fs1}" fill="#6E5730" text-anchor="middle" letter-spacing="1">[LETAK GAMBAR DI SINI]</text>
  ${hintSvg}
</svg>`;
  await sharp(Buffer.from(svg)).png().toFile(path.join(OUT, file));
}

async function logos(srcDir) {
  for (const f of ["logo_belanjawan.png", "logo_jata.png", "logo_maju.png"]) {
    const im = sharp(path.join(srcDir, f));
    const md = await im.metadata();
    await im.resize(md.width * 3, md.height * 3, { kernel: "lanczos3" }).png().toFile(path.join(OUT, f));
  }
}

module.exports = { iconPng, background, placeholder, logos, OUT };
