const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const scale = parseFloat(process.argv[2] || '2');
  const outDir = process.argv[3] || path.join(__dirname);
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: scale });
  for (let n = 1; n <= 5; n++) {
    await p.goto('file://' + path.join(__dirname, 'src', `slide-${n}.html`));
    await p.evaluate(() => document.fonts.ready);
    // semakan limpahan teks
    const issues = await p.evaluate(() => {
      const out = [];
      document.querySelectorAll('.c2,.c3,.pil,.ag,.end,.hub,.core,.ind').forEach(el => {
        if (el.scrollHeight > el.clientHeight + 1 || el.scrollWidth > el.clientWidth + 1)
          out.push(el.className + ' overflow ' + el.scrollHeight + '>' + el.clientHeight);
      });
      return out;
    });
    if (issues.length) console.log('slide', n, issues);
    await p.screenshot({ path: path.join(outDir, `slide-${n}.png`) });
  }
  await b.close();
})();
