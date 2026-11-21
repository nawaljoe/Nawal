// Renders decorative SVGs (pattern, mosque, icons) to transparent PNGs for the PPTX.
const { chromium } = require('playwright');
const path = require('path');
const TILE = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96' viewBox='0 0 96 96'%3E%3Cg fill='none' stroke='%23C8A45D' stroke-width='1.1'%3E%3Crect x='20' y='20' width='56' height='56'/%3E%3Crect x='20' y='20' width='56' height='56' transform='rotate(45 48 48)'/%3E%3Ccircle cx='48' cy='48' r='12'/%3E%3Cpath d='M0 48h8M88 48h8M48 0v8M48 88v8'/%3E%3C/g%3E%3C/svg%3E")`;
const ic = (stroke, body, vb='0 0 58 58') => `<svg viewBox="${vb}" width="100%" height="100%" fill="none" stroke="${stroke}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
const items = {
  pattern_corner: [1080,1350,`<div style="width:100%;height:100%;background-image:${TILE};background-size:96px;opacity:.28;-webkit-mask-image:radial-gradient(ellipse 520px 420px at 100% 0%,#000 0%,transparent 75%)"></div>`],
  pattern_cover: [1080,1350,`<div style="width:100%;height:100%;background-image:${TILE};background-size:96px;opacity:.10;-webkit-mask-image:linear-gradient(180deg,#000 0%,transparent 55%)"></div>`],
  pattern_band: [1080,330,`<div style="width:100%;height:100%;background-image:${TILE};background-size:96px;opacity:.08"></div>`],
  mosque_cover: [1080,250,`<svg viewBox="0 0 1080 300" width="1080" height="250" preserveAspectRatio="xMidYMax meet"><defs><linearGradient id="f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#123F70" stop-opacity="0"/><stop offset=".55" stop-color="#123F70" stop-opacity=".55"/><stop offset="1" stop-color="#123F70" stop-opacity=".9"/></linearGradient></defs><g fill="url(#f)" stroke="#C8A45D" stroke-opacity=".55" stroke-width="1.6"><path d="M120 300V120h34v180z"/><path d="M112 120h50l-6-12h-38z"/><path d="M122 108l15-46 15 46z"/><path d="M926 300V120h34v180z"/><path d="M918 120h50l-6-12h-38z"/><path d="M928 108l15-46 15 46z"/><path d="M210 300V214h170v86z"/><path d="M700 300V214h170v86z"/><path d="M240 214c0-34 25-52 55-64 30 12 55 30 55 64z"/><path d="M730 214c0-34 25-52 55-64 30 12 55 30 55 64z"/><path d="M380 300V190h320v110z"/><path d="M410 190c0-62 52-98 130-132 78 34 130 70 130 132z"/></g><g fill="none" stroke="#C8A45D" stroke-opacity=".55" stroke-width="1.6"><path d="M540 58V22"/><path d="M548 14a10 10 0 1 1-9-6 8 8 0 1 0 9 6z"/><path d="M295 150v-18M785 150v-18M137 62V44M943 62V44"/><path d="M430 300v-56a24 24 0 0 1 48 0v56M516 300v-66a24 24 0 0 1 48 0v66M602 300v-56a24 24 0 0 1 48 0v56"/><path d="M240 300v-40a16 16 0 0 1 32 0v40M300 300v-40a16 16 0 0 1 32 0v40M748 300v-40a16 16 0 0 1 32 0v40M808 300v-40a16 16 0 0 1 32 0v40"/><path d="M128 150h18M128 190h18M934 150h18M934 190h18"/><path d="M0 299.5h1080"/></g></svg>`],
  mosque_small: [190,150,`<svg viewBox="0 0 190 150" width="190" height="150" fill="none" stroke="#C8A45D" stroke-width="2" stroke-linejoin="round" style="opacity:.5"><path d="M20 150V56h14v94M18 56h18l-3-6H21zM22 50l5-22 5 22M156 150V56h14v94M154 56h18l-3-6h-12zM158 50l5-22 5 22"/><path d="M48 150V92h94v58"/><path d="M58 92c0-26 18-40 37-52 19 12 37 26 37 52z"/><path d="M95 40V22"/><path d="M83 150v-28a12 12 0 0 1 24 0v28"/></svg>`],
  ic_mosque: [56,56, ic('#071D3B','<path d="M8 50V30h40v20M14 30c0-9 6-14 14-18 8 4 14 9 14 18M28 12V5M4 50h48"/><path d="M24 50v-9a4 4 0 0 1 8 0v9"/>','0 0 56 56')],
  ic_shield: [64,64, `<svg viewBox="0 0 64 64" width="100%" height="100%" fill="none" stroke="#C8A45D" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M32 6l20 8v15c0 13-8.5 23-20 29C20.5 52 12 42 12 29V14z"/><path d="M23 32l7 7 12-14"/></svg>`],
  ic_fund: [64,64, ic('#071D3B','<rect x="8" y="24" width="42" height="26"/><path d="M22 24v-3h14v3"/><circle cx="29" cy="11" r="7"/><path d="M29 8v6M8 34h42"/>')],
  ic_network: [64,64, ic('#071D3B','<circle cx="29" cy="12" r="6"/><circle cx="11" cy="44" r="6"/><circle cx="47" cy="44" r="6"/><circle cx="29" cy="32" r="4"/><path d="M29 18v10M25.5 34.5L16 41M32.5 34.5L42 41"/>')],
  ic_people: [64,64, ic('#071D3B','<circle cx="18" cy="16" r="6"/><circle cx="40" cy="16" r="6"/><path d="M6 40c0-8 5-13 12-13s12 5 12 13M28 40c0-8 5-13 12-13s12 5 12 13"/><path d="M4 50h50"/>')],
};
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ deviceScaleFactor: 3 });
  for (const [name, [w, h, html]] of Object.entries(items)) {
    await p.setContent(`<html><body style="margin:0;background:transparent"><div id="a" style="width:${w}px;height:${h}px">${html}</div></body></html>`);
    await p.locator('#a').screenshot({ path: path.join(__dirname, 'assets', name + '.png'), omitBackground: true });
  }
  await b.close();
  console.log('ok', Object.keys(items).length);
})();
