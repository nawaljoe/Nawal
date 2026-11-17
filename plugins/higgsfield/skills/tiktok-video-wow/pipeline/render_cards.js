// Render kad B-roll kepada jujukan PNG (RGBA) pada 30fps.
// Guna: node render_cards.js <config.json> <folder_output> [preview]
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const [cfgPath, outDir, mode] = process.argv.slice(2);
const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
const FPS = 30;

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  await page.goto('file://' + path.join(__dirname, 'cards.html'));
  // font Poppins dari <folder_projek>/fonts (folder induk kepada folder output kad)
  const fonts = path.resolve(outDir, '..', 'fonts');
  const faces = [[400, 'Regular'], [500, 'Medium'], [600, 'SemiBold'], [700, 'Bold'], [800, 'ExtraBold']]
    .map(([w, n]) => `@font-face { font-family: P; font-weight: ${w}; src: url(file://${fonts}/Poppins-${n}.ttf); }`).join('\n');
  await page.addStyleTag({ content: faces });
  await page.evaluate(() => document.fonts.ready);
  for (const [name, draft] of Object.entries(cfg.drafts)) {
    if (draft.title) {  // tajuk statik sepanjang video
      fs.mkdirSync(path.join(outDir, name), { recursive: true });
      await page.evaluate(lines => window.renderCard('titlebar', 1, 2, { lines }), draft.title);
      await page.screenshot({ path: path.join(outDir, name, 'title.png'), omitBackground: true });
    }
    for (const [i, card] of draft.cards.entries()) {
      const dir = path.join(outDir, name, String(i));
      fs.mkdirSync(dir, { recursive: true });
      if (card.clip) {  // klip video sebenar: hanya label statik diperlukan
        await page.evaluate(c => window.renderCard('label', 1, 2, c), card);
        await page.screenshot({ path: path.join(dir, 'label.png'), omitBackground: true });
        console.log(name, i, 'label klip', card.clip);
        continue;
      }
      const n = Math.round(card.d * FPS);
      const frames = mode === 'preview' ? [Math.round(n * 0.25), Math.round(n * 0.7)] : [...Array(n).keys()];
      for (const f of frames) {
        await page.evaluate(([c, t]) => window.renderCard(c.type, t, c.d, c), [card, f / FPS]);
        await page.screenshot({ path: path.join(dir, `f_${String(f).padStart(4, '0')}.png`), omitBackground: true });
      }
      console.log(name, i, card.type, frames.length, 'frame');
    }
  }
  await browser.close();
})();
