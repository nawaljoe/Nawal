// Ekstrak susun atur HTML -> JSON + aset (latar, ikon) untuk dibina jadi PPTX boleh sunting.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const OUT = process.argv[2];
fs.mkdirSync(OUT, { recursive: true });

const EXTRACT = () => {
  const items = [];
  const px = v => parseFloat(v) || 0;
  const col = s => {
    const m = (s || '').match(/rgba?\(([^)]+)\)/); if (!m) return null;
    const a = m[1].split(/[,\s\/]+/).filter(Boolean).map(Number);
    return { r: a[0], g: a[1], b: a[2], a: a.length > 3 ? a[3] : 1 };
  };
  const isInline = el => getComputedStyle(el).display === 'inline';
  const root = document.querySelector('.slide');

  function isTextBlock(el) {
    if (getComputedStyle(el).display === 'inline') return false;
    if (!el.textContent.trim()) return false;
    return [...el.childNodes].every(k => k.nodeType === 3 || (k.nodeType === 1 && (k.tagName === 'BR' || isInline(k))));
  }

  function boxItems(el, cs, r) {
    if (r.width < 1 || r.height < 1) return;
    const bgc = col(cs.backgroundColor), bgi = cs.backgroundImage;
    let fill = null;
    if (bgc && bgc.a > 0) fill = bgc;
    else if (bgi !== 'none' && !bgi.includes('url(')) {
      const t = [...bgi.matchAll(/rgba?\([^)]+\)/g)].map(m => col(m[0]));
      if (t.length) {
        if (t.length > 1 && !bgi.includes('repeating')) { const a = t[0], b = t[t.length - 1]; fill = { r: (a.r + b.r) / 2, g: (a.g + b.g) / 2, b: (a.b + b.b) / 2, a: 1 }; }
        else fill = t[0];
      }
    }
    const bw = [px(cs.borderTopWidth), px(cs.borderRightWidth), px(cs.borderBottomWidth), px(cs.borderLeftWidth)];
    const bc = [col(cs.borderTopColor), col(cs.borderRightColor), col(cs.borderBottomColor), col(cs.borderLeftColor)];
    const bs = [cs.borderTopStyle, cs.borderRightStyle, cs.borderBottomStyle, cs.borderLeftStyle];
    const has = bw.map((w, i) => w > 0 && bs[i] !== 'none');
    if (!fill && !has.some(Boolean)) return;
    const rs = cs.borderTopLeftRadius;
    let rad = 0, ell = false;
    if (rs.endsWith('%')) { if (parseFloat(rs) >= 50) ell = true; } else rad = px(rs);
    const uniform = has.every(Boolean) && bw.every(w => w === bw[0]) && bs.every(s => s === bs[0]);
    let x = r.left, y = r.top, w = r.width, h = r.height, line = null;
    if (uniform) {
      line = { w: bw[0], color: bc[0], dash: bs[0] === 'dashed' };
      x += bw[0] / 2; y += bw[0] / 2; w -= bw[0]; h -= bw[0];
    }
    if (fill || uniform) items.push({ t: 'rect', x, y, w, h, fill, line, rad, ell, rot: 0 });
    if (!uniform) {
      if (has[0]) items.push({ t: 'rect', x: r.left, y: r.top, w: r.width, h: bw[0], fill: bc[0], line: null, rad: 0, ell: false, rot: 0, topRound: rad });
      if (has[2]) items.push({ t: 'rect', x: r.left, y: r.bottom - bw[2], w: r.width, h: bw[2], fill: bc[2], line: null, rad: 0, ell: false, rot: 0 });
      if (has[3]) items.push({ t: 'rect', x: r.left, y: r.top, w: bw[3], h: r.height, fill: bc[3], line: null, rad: 0, ell: false, rot: 0 });
      if (has[1]) items.push({ t: 'rect', x: r.right - bw[1], y: r.top, w: bw[1], h: r.height, fill: bc[1], line: null, rad: 0, ell: false, rot: 0 });
    }
  }

  function pseudo(el, cs, r) {
    const ps = getComputedStyle(el, '::before');
    if (!ps.content || ps.content === 'none' || ps.content === 'normal') return;
    const bg0 = col(ps.backgroundColor);
    if ((!bg0 || bg0.a === 0) && ps.backgroundImage.includes('gradient')) {
      const t = [...ps.backgroundImage.matchAll(/rgba?\([^)]+\)/g)].map(m => col(m[0]));
      if (t.length >= 2) {
        const w = px(ps.width), h = px(ps.height), x = r.left + px(cs.paddingLeft), y = r.top + (r.height - h) / 2;
        items.push({ t: 'rect', x, y, w: w / 2, h, fill: t[0], line: null, rad: 0, ell: false, rot: 0 });
        items.push({ t: 'rect', x: x + w / 2, y, w: w / 2, h, fill: t[t.length - 1], line: null, rad: 0, ell: false, rot: 0 });
      }
      return;
    }
    const bg = bg0; if (!bg || bg.a === 0) return;
    const w = px(ps.width), h = px(ps.height); let x, y;
    if (ps.position === 'absolute') { x = r.left + px(cs.borderLeftWidth) + px(ps.left); y = r.top + px(cs.borderTopWidth) + px(ps.top); }
    else { x = r.left + px(cs.paddingLeft); y = r.top + (r.height - h) / 2; }
    let rot = 0; const m = ps.transform.match(/matrix\(([^)]+)\)/);
    if (m) { const v = m[1].split(',').map(Number); rot = Math.atan2(v[1], v[0]) * 180 / Math.PI; }
    items.push({ t: 'rect', x, y, w, h, fill: bg, line: null, rad: 0, ell: false, rot });
  }

  function collectRuns(nodes, out) {
    for (const n of nodes) {
      if (n.nodeType === 3) {
        const pe = n.parentElement, cs = getComputedStyle(pe);
        let t = n.textContent.replace(/[ \t\r\n\f]+/g, ' ');
        if (cs.textTransform === 'uppercase') t = t.toUpperCase();
        if (!t) continue;
        const fs = px(cs.fontSize), ls = cs.letterSpacing === 'normal' ? 0 : px(cs.letterSpacing);
        out.push({ text: t, size: fs, color: col(cs.color), bold: parseInt(cs.fontWeight) >= 700, italic: cs.fontStyle === 'italic',
          family: cs.fontFamily.split(',')[0].replace(/['"]/g, '').trim(), spc: ls });
      } else if (n.nodeType === 1) {
        if (n.tagName === 'BR') out.push({ br: true });
        else collectRuns([...n.childNodes], out);
      }
    }
  }

  function emitText(el, nodes, cs, r) {
    nodes = nodes.slice();
    while (nodes.length && nodes[0].nodeType === 3 && !nodes[0].textContent.trim()) nodes.shift();
    while (nodes.length && nodes[nodes.length - 1].nodeType === 3 && !nodes[nodes.length - 1].textContent.trim()) nodes.pop();
    if (!nodes.length) return;
    const flat = []; collectRuns(nodes, flat);
    // paragraf
    const paras = [[]];
    for (const f of flat) { if (f.br) paras.push([]); else paras[paras.length - 1].push(f); }
    for (const p of paras) {
      if (p.length) { p[0].text = p[0].text.replace(/^ +/, ''); p[p.length - 1].text = p[p.length - 1].text.replace(/ +$/, ''); }
    }
    const P = paras.filter(p => p.some(x => x.text));
    if (!P.length) return;
    const range = document.createRange(); range.setStartBefore(nodes[0]); range.setEndAfter(nodes[nodes.length - 1]);
    const rects = [...range.getClientRects()].filter(q => q.width > 0.5 && q.height > 0.5);
    if (!rects.length) return;
    const fsz = P[0][0].size;
    const lh = cs.lineHeight === 'normal' ? fsz * 1.2 : px(cs.lineHeight);
    rects.sort((a, b) => a.top - b.top);
    const lineTops = []; for (const q of rects) { if (!lineTops.length || q.top - lineTops[lineTops.length - 1] > lh * 0.5) lineTops.push(q.top); }
    const lines = lineTops.length;
    const left = Math.min(...rects.map(q => q.left));
    const cL = r.left + px(cs.borderLeftWidth) + px(cs.paddingLeft), cR = r.right - px(cs.borderRightWidth) - px(cs.paddingRight);
    const ta = cs.textAlign; const align = (ta === 'center') ? 'center' : (ta === 'right' || ta === 'end') ? 'right' : 'left';
    let x, w;
    if (align === 'left') { x = left; w = cR - left; } else { x = cL; w = cR - cL; }
    const y = rects[0].top + (rects[0].height - lh) / 2;
    const serif = /Caladea|serif/i.test(P[0][0].family);
    const slack = lines > 1 ? (serif ? 1.05 : 1.03) : 1;
    if (align === 'left') w = Math.max(w, 10) * slack;
    const tb = { x: left, y: rects[0].top, w: Math.max(...rects.map(q => q.right)) - left, h: Math.max(...rects.map(q => q.bottom)) - rects[0].top };
    items.push({ t: 'text', tb, x, y, w, h: lines * lh, align, lh, single: lines === 1, paras: P });
  }

  function walk(el) {
    const cs = getComputedStyle(el);
    if (cs.display === 'none') return;
    const tag = el.tagName.toLowerCase();
    if (tag === 'svg') {
      const r = el.getBoundingClientRect();
      if (el.classList.contains('ic')) {
        items.push({ t: 'icon', x: r.left, y: r.top, w: r.width, h: r.height, html: el.outerHTML, color: cs.color });
      } else {
        const groups = [];
        for (const c of [...el.children]) {
          const tg = c.tagName.toLowerCase();
          if (tg === 'circle' && groups.length) groups[groups.length - 1].push(c); else groups.push([c]);
        }
        for (const g of groups) {
          let x1 = 1e9, y1 = 1e9, x2 = -1e9, y2 = -1e9;
          for (const c of g) { const q = c.getBoundingClientRect(); x1 = Math.min(x1, q.left); y1 = Math.min(y1, q.top); x2 = Math.max(x2, q.right); y2 = Math.max(y2, q.bottom); }
          x1 -= 4; y1 -= 4; x2 += 4; y2 += 4;
          const w = x2 - x1, h = y2 - y1;
          items.push({ t: 'svggrp', x: x1, y: y1, w, h,
            html: `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="${x1} ${y1} ${w} ${h}">${g.map(c => c.outerHTML).join('')}</svg>` });
        }
      }
      return;
    }
    if (tag === 'img') {
      const r = el.getBoundingClientRect();
      items.push({ t: 'img', x: r.left, y: r.top, w: r.width, h: r.height, src: el.currentSrc.replace('file://', '') });
      return;
    }
    if (el.classList.contains('pattern')) return;
    const r = el.getBoundingClientRect();
    if (el !== root) { boxItems(el, cs, r); pseudo(el, cs, r); }
    const kids = [...el.childNodes];
    if (el !== root && isTextBlock(el)) { emitText(el, kids, cs, r); return; }
    let group = [];
    const flush = () => { if (group.some(g => g.textContent.trim())) emitText(el, group, cs, r); group = []; };
    for (const k of kids) {
      if (k.nodeType === 3 || (k.nodeType === 1 && (k.tagName === 'BR' || isInline(k)))) group.push(k);
      else { flush(); if (k.nodeType === 1) walk(k); }
    }
    flush();
  }
  walk(root);
  return items;
};

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1.5 });
  const ip = await b.newPage({ viewport: { width: 200, height: 200 }, deviceScaleFactor: 4 });
  const fp = await b.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1.5 });
  const rgb = c => `rgb(${c.r},${c.g},${c.b})`;
  const result = [];
  for (let n = 1; n <= 8; n++) {
    const url = 'file://' + path.join(__dirname, 'src', `slide-${n}.html`);
    await p.goto(url); await p.evaluate(() => document.fonts.ready);
    await p.addStyleTag({ content: '.slide > *:not(.pattern){visibility:hidden!important}' });
    await p.screenshot({ path: `${OUT}/bg-${n}.jpg`, type: 'jpeg', quality: 92 });
    await p.goto(url); await p.evaluate(() => document.fonts.ready);
    const items = await p.evaluate(EXTRACT);
    let k = 0;
    for (const it of items) {
      if (it.t === 'icon') {
        const colr = it.color; const w = Math.round(it.w), h = Math.round(it.h);
        const html = it.html.replace(/currentColor/g, colr);
        await ip.setViewportSize({ width: w, height: h });
        await ip.setContent(`<body style="margin:0;background:transparent">${html}</body>`);
        const f = `icon-${n}-${k++}.png`;
        await ip.screenshot({ path: `${OUT}/${f}`, omitBackground: true, clip: { x: 0, y: 0, width: w, height: h } });
        it.file = f; delete it.html;
      } else if (it.t === 'svggrp') {
        await fp.setViewportSize({ width: Math.ceil(it.w), height: Math.ceil(it.h) });
        await fp.setContent(`<body style="margin:0;background:transparent">${it.html}</body>`);
        const f = `conn-${n}-${k++}.png`;
        await fp.screenshot({ path: `${OUT}/${f}`, omitBackground: true, clip: { x: 0, y: 0, width: Math.ceil(it.w), height: Math.ceil(it.h) } });
        it.t = 'icon'; it.file = f; delete it.html;
      }
    }
    result.push({ n, bg: `bg-${n}.jpg`, items });
  }
  fs.writeFileSync(`${OUT}/layout.json`, JSON.stringify(result));
  await b.close();
  console.log('items per slide:', result.map(r => r.items.length).join(','));
})();
