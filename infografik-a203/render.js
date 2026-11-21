// Render each .slide section to PNG. Usage: node render.js [scale]
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const scale = Number(process.argv[2] || 2);
  const out = path.join(__dirname, 'output');
  require('fs').mkdirSync(out, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 1400 }, deviceScaleFactor: scale });
  await page.goto('file://' + path.join(__dirname, 'slides.html'), { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const fam = await page.evaluate(() => [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family + ' ' + f.weight));
  console.log('fonts loaded:', fam.join(', '));
  const n = await page.locator('section.slide').count();
  for (let i = 0; i < n; i++) {
    const f = path.join(out, `A203_slaid_${String(i + 1).padStart(2, '0')}.png`);
    await page.locator('section.slide').nth(i).screenshot({ path: f });
    console.log('wrote', f);
  }
  await browser.close();
})();
