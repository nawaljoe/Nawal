// Jana index.html HyperFrames daripada timeline.json yang sama dengan projek Remotion.
// Guna: node scripts/build.mjs   (kemudian: npx hyperframes check / render)
import { readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
// node scripts/build.mjs [timeline.json] [output.html]
const SRC = process.argv[2] ?? join(here, "../../remotion-video/src/isbat/timeline.json");
const OUT = process.argv[3] ?? join(here, "../index.html");
const T = JSON.parse(readFileSync(SRC, "utf8"));
const inRanges = (t, r) => !!r?.some(([a, b]) => t >= a && t < b);
const W = T.width, H = T.height, FPS = T.fps;
const P = T.palette;
const col = (c) => (c ? P[c] ?? c : null);
const r3 = (x) => Math.round(x * 1000) / 1000;
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

/* ---------------- motion maths (identik dengan remotion-video/src/isbat/anim.ts) ---------------- */
const clamp01 = (x) => Math.max(0, Math.min(1, x));
const out3 = (x) => 1 - (1 - clamp01(x)) ** 3;
const keyframes = (t, k) => {
  if (k.length === 1 || t <= k[0][0]) return k[0][1];
  for (let i = 1; i < k.length; i++) {
    const [t1, v1, e] = k[i], [t0, v0] = k[i - 1];
    if (t <= t1) { const p = (t - t0) / (t1 - t0); return v0 + (v1 - v0) * (e === "out3" ? out3(p) : p); }
  }
  return k[k.length - 1][1];
};
const center = (t, tr) => {
  if (tr.length === 1) return [tr[0][1], tr[0][2]];
  if (t <= tr[0][0]) return [tr[0][1], tr[0][2]];
  for (let i = 1; i < tr.length; i++) if (t <= tr[i][0]) {
    const p = (t - tr[i - 1][0]) / (tr[i][0] - tr[i - 1][0]);
    return [tr[i - 1][1] + (tr[i][1] - tr[i - 1][1]) * p, tr[i - 1][2] + (tr[i][2] - tr[i - 1][2]) * p];
  }
  const l = tr[tr.length - 1]; return [l[1], l[2]];
};
const ustaz = (z) => {
  const { contentTop: CT, contentBottom: CB, faceX, faceY } = T.source;
  const h = (CB - CT) / z, w = (h * 9) / 16, frac = 0.5 - 0.1 * clamp01((z - 1) / 0.25);
  const left = Math.max(0, Math.min(W - w, faceX - w / 2)), top = Math.max(CT, Math.min(CB - h, faceY - frac * h));
  const s = W / w; return { x: -left * s, y: -top * s, scale: s };
};
const broll = (z, cx, cy) => {
  const w = W / z, h = H / z;
  const left = Math.max(0, Math.min(W - w, cx - w / 2)), top = Math.max(0, Math.min(H - h, cy - h / 2));
  return { x: -left * z, y: -top * z, scale: z };
};

/* ---------------- builders ---------------- */
const html = [];   // timed elements
const js = [];     // gsap timeline calls
let n = 0;
const id = (p) => `${p}-${++n}`;
const layer = (lid, start, dur, track, z, inner, origin = "540px 960px", extra = "") =>
  `<div id="${lid}" class="clip layer" data-start="${r3(start)}" data-duration="${r3(dur)}" data-track-index="${track}"${extra ? " " + extra : ""} style="z-index:${z};transform-origin:${origin}">${inner}</div>`;
const row = (y, size, runs, opts = {}, tracking = 0, extra = "") =>
  `<div class="row"${extra ? " " + extra : ""} style="top:${y}px;font-size:${size}px;letter-spacing:${tracking}px">${runsHTML(runs, size, opts)}</div>`;
const clip = (tag, attrs, start, dur, inner = "", extra = "") =>
  `<${tag} id="${attrs.id}" class="clip ${attrs.cls ?? ""}" data-start="${r3(start)}" data-duration="${r3(dur)}"${
    attrs.track != null ? ` data-track-index="${attrs.track}"` : ""} ${extra} style="${attrs.style ?? ""}">${inner}</${tag}>`;

const WEIGHT = { semibold: 600, extrabold: 800, black: 900 };
const runsHTML = (runs, size, { stroke = 0, shadow = true } = {}) =>
  runs.map(([text, weight, fill, box]) => {
    const st = [`font-weight:${WEIGHT[weight] ?? 800}`, `color:${col(fill)}`];
    if (box) st.push(`background:${col(box)}`, `border-radius:${r3(size * 0.22)}px`,
      `padding:${r3(size * 0.1)}px ${r3(size * 0.18)}px ${r3(size * 0.06)}px`, `margin:0 ${r3(size * 0.1)}px`);
    if (stroke && !box) st.push(`-webkit-text-stroke:${stroke}px ${P.navyDeep}`, "paint-order:stroke fill");
    if (shadow) st.push("text-shadow:0 4px 16px rgba(0,8,25,.75)");
    if (box && shadow) st.push("box-shadow:0 6px 18px rgba(0,8,25,.45)");
    return `<span style="${st.join(";")}">${esc(text)}</span>`;
  }).join("");
const lineStyle = (y, size, tracking = 0) =>
  `top:${y}px;font-size:${size}px;letter-spacing:${tracking}px`;

/* ---------------- footage (video = klip terus di bawah root; tiada wrapper bertimer) ---------------- */
const GRADE_U = "contrast(1.06) saturate(1.07) brightness(0.99)";
const GRADE_B = "contrast(1.06) saturate(0.98) brightness(0.96)";
const step = 2 / FPS;
let z = 1;
for (const s of T.shots) {
  const dur = s.end - s.start, vid = `shot-${s.id.replace(/[^\w-]/g, "_")}`;
  z = s.type === "endcard" ? 14 : s.type === "still" ? 12 : 10; // footage sentiasa di bawah overlay (z 40+)
  if (s.type === "endcard") {
    html.push(`<video id="${vid}" class="clip media" src="assets/broll.mp4" muted playsinline data-start="${s.start}" data-duration="${r3(dur)}" data-media-start="${s.mediaStart}" data-track-index="1" style="z-index:${z};opacity:0;transform:scale(1.15);transform-origin:50% 50%;filter:blur(18px) ${GRADE_B}"></video>`);
    html.push(layer("endcard-ov", s.start, dur, 2, z + 1, "", undefined, `data-layout-allow-overlap`).replace('style="', 'style="opacity:0;background:linear-gradient(180deg,rgba(6,22,52,.55) 0%,rgba(6,22,52,.80) 100%);'));
    js.push(`tl.to(["#${vid}","#endcard-ov"],{opacity:1,duration:${s.fadeIn ?? 0.3},ease:"sine.inOut"},${s.start});`);
    continue;
  }
  const grade = s.type === "broll" ? GRADE_B : GRADE_U;
  if (s.type === "still")
    html.push(`<img id="${vid}" class="clip media" src="assets/${s.src}" data-start="${s.start}" data-duration="${r3(dur)}" data-track-index="1" style="z-index:${z};filter:${grade}">`);
  else
    html.push(`<video id="${vid}" class="clip media" src="assets/${s.type === "ustaz" ? (s.src ?? "ustaz.mp4") : "broll.mp4"}" muted playsinline data-start="${s.start}" data-duration="${r3(dur)}" data-media-start="${s.mediaStart}" data-track-index="1" style="z-index:${z};filter:${grade}"></video>`);
  // laluan zoom/crop: disampel setiap 2 frame sebagai segmen linear => lengkung sama seperti Remotion
  const tf = (t) => (s.type === "broll" ? broll(keyframes(t, s.zoom), ...center(t, s.center)) : ustaz(keyframes(t, s.zoom)));
  const f0 = tf(s.start);
  js.push(`tl.set("#${vid}",{x:${r3(f0.x)},y:${r3(f0.y)},scale:${r3(f0.scale)},transformOrigin:"0 0"},${r3(s.start)});`);
  const K = Math.round(dur / step);
  for (let k = 1; k <= K; k++) {
    const t0 = r3(s.start + (k - 1) * step), t1 = r3(Math.min(s.end, s.start + k * step));
    const a = tf(t1), b = tf(t0);
    if (Math.abs(a.scale - b.scale) < 1e-4 && Math.abs(a.x - b.x) < 0.05 && Math.abs(a.y - b.y) < 0.05) continue;
    js.push(`tl.to("#${vid}",{x:${r3(a.x)},y:${r3(a.y)},scale:${r3(a.scale)},duration:${r3(t1 - t0 - 0.0005)},ease:"none"},${t0});`);
  }
}

/* ---------------- look overlays ---------------- */
html.push(layer("vignette", 0, T.duration, 2, 40, "").replace('style="', 'style="background:radial-gradient(ellipse 75% 60% at 50% 50%,rgba(0,0,0,0) 55%,rgba(0,0,0,.38) 100%);'));
html.push(layer("grad", 0, T.gradientUntil + 0.3, 2, 41, "").replace('style="', 'style="background:linear-gradient(180deg,rgba(6,22,52,.43) 0px,rgba(6,22,52,0) 360px,rgba(6,22,52,0) 980px,rgba(6,22,52,.69) 1920px);'));
js.push(`tl.to("#grad",{opacity:0,duration:0.3,ease:"none"},${T.gradientUntil});`);

/* ---------------- hook ---------------- */
const Hk = T.hook;
for (const l of Hk?.lines ?? []) {
  const i = id("hook");
  html.push(layer(i, l.at, Hk.end - l.at, 3, 60, row(l.y, l.size, l.runs, { stroke: l.pop ? 0 : 3 }), `540px ${l.y}px`));
  if (l.pop) js.push(`tl.fromTo("#${i}",{opacity:0,scale:0.7},{opacity:1,scale:1,duration:0.24,ease:"back.out(1.7)"},${l.at});`);
  else js.push(`tl.fromTo("#${i}",{opacity:0,y:30},{opacity:1,y:0,duration:0.22,ease:"power2.out"},${l.at});`);
  js.push(`tl.to("#${i}",{opacity:0,duration:0.16,ease:"none"},${Hk.exitAt});`);
}

/* ---------------- title stacks (tajuk atas b-roll) ---------------- */
(T.titles ?? []).forEach((B, k) => {
  if (B.overlay !== false) {
    html.push(layer(`ttl${k}-ov`, B.start, B.end - B.start, 3, 50, "").replace('style="', 'style="opacity:0;background:linear-gradient(180deg,rgba(6,22,52,.47) 0px,rgba(6,22,52,.47) 500px,rgba(6,22,52,.59) 1500px);'));
    js.push(`tl.to("#ttl${k}-ov",{opacity:1,duration:0.25,ease:"none"},${B.start});`, `tl.to("#ttl${k}-ov",{opacity:0,duration:0.13},${B.exitAt});`);
  }
  for (const l of B.lines) {
    const i = id("ttl");
    html.push(layer(i, l.at, B.end - l.at, 4, 60, row(l.y, l.size, l.runs, { stroke: l.size > 60 ? 2 : 0 }, l.tracking ?? 0), `540px ${l.y}px`));
    js.push(`tl.fromTo("#${i}",{opacity:0,y:26,scale:0.92},{opacity:1,y:0,scale:1,duration:0.25,ease:"power2.out"},${l.at});`,
      `tl.to("#${i}",{opacity:0,duration:0.13},${B.exitAt});`);
  }
});

/* ---------------- info panels (kad fakta) ---------------- */
(T.panels ?? []).forEach((Pn, k) => {
  const mid = (Pn.top + Pn.bottom) / 2;
  html.push(layer(`panel${k}`, Pn.start, Pn.end - Pn.start, 6, 75,
    `<div style="position:absolute;left:${(W - Pn.width) / 2}px;width:${Pn.width}px;top:${Pn.top}px;height:${Pn.bottom - Pn.top}px;border-radius:34px;background:rgba(11,42,91,.89);border:4px solid ${P.gold};box-shadow:0 18px 40px rgba(0,8,25,.45)"></div>`,
    `540px ${mid}px`, "data-layout-allow-overlap"));
  js.push(`tl.fromTo("#panel${k}",{scaleY:0},{scaleY:1,duration:0.32,ease:"power2.out"},${Pn.start});`, `tl.to("#panel${k}",{opacity:0,duration:0.18},${Pn.exitAt});`);
  (Pn.rules ?? []).forEach((ry, j) => {
    html.push(layer(`panel${k}-r${j}`, Pn.start + 0.2, Pn.end - Pn.start - 0.2, 7, 78,
      `<div style="position:absolute;left:${W / 2 - 130}px;width:260px;top:${ry - 2}px;height:4px;background:${P.gold}"></div>`, `540px ${ry}px`));
    js.push(`tl.fromTo("#panel${k}-r${j}",{scaleX:0},{scaleX:1,duration:0.3,ease:"power2.out"},${r3(Pn.start + 0.2)});`, `tl.to("#panel${k}-r${j}",{opacity:0,duration:0.18},${Pn.exitAt});`);
  });
  for (const l of Pn.lines) {
    const i = id("pl");
    html.push(layer(i, l.at, Pn.end - l.at, 7, 78, row(l.y, l.size, l.runs, { shadow: false }, l.tracking ?? 0, "data-layout-allow-overlap"), `540px ${l.y}px`));
    if (l.pop) js.push(`tl.fromTo("#${i}",{opacity:0,scale:0.7},{opacity:1,scale:1,duration:0.3,ease:"back.out(1.7)"},${l.at});`);
    else js.push(`tl.fromTo("#${i}",{opacity:0,y:14},{opacity:1,y:0,duration:0.3,ease:"power2.out"},${l.at});`);
    js.push(`tl.to("#${i}",{opacity:0,duration:0.18},${Pn.exitAt});`);
  }
});

/* ---------------- series tag ---------------- */
const S = T.seriesTag;
if (S) {
  const tagInner = `<div class="tag"><span style="font-weight:800;color:#fff;text-shadow:0 3px 12px rgba(0,8,25,.7)">${S.text}</span><span style="font-weight:900;color:${P.navyDeep};background:${P.gold};border-radius:8px;padding:6px 10px 3px">${S.badge}</span></div>`;
  const segs = []; let cur = S.start;
  for (const [h0, h1] of [...(S.hide ?? [])].sort((x, y) => x[0] - y[0])) { if (h0 > cur) segs.push([cur, h0]); cur = Math.max(cur, h1); }
  if (S.end > cur) segs.push([cur, S.end]);
  segs.forEach(([a0, a1], k) => html.push(layer(`tag-${k}`, a0, a1 - a0, 5, 70, tagInner)));
  js.push(`tl.fromTo("#tag-0",{opacity:0},{opacity:1,duration:0.3,ease:"none"},${S.start});`, `tl.to("#tag-${segs.length - 1}",{opacity:0,duration:0.19,ease:"none"},${r3(S.end - 0.19)});`);
}

/* ---------------- ISBAT reveal + card ---------------- */
const I = T.isbat;
if (I) {
const cardMid = (I.card.top + I.card.bottom) / 2;
html.push(layer("isbat-card", I.card.at, I.end - I.card.at, 6, 75,
  `<div style="position:absolute;left:${(W - I.card.width) / 2}px;width:${I.card.width}px;top:${I.card.top}px;height:${I.card.bottom - I.card.top}px;border-radius:34px;background:rgba(11,42,91,.89);border:4px solid ${P.gold};box-shadow:0 18px 40px rgba(0,8,25,.45)"></div>`,
  `540px ${cardMid}px`, "data-layout-allow-overlap"));
js.push(`tl.fromTo("#isbat-card",{scaleY:0},{scaleY:1,duration:0.32,ease:"power2.out"},${I.card.at});`, `tl.to("#isbat-card",{opacity:0,duration:0.15},${I.exitAt});`);
html.push(layer("isbat-glow", I.revealAt, I.moveAt - I.revealAt, 6, 76, row(I.bigY, I.bigSize, [["ISBAT", "black", "gold"]], { stroke: 6, shadow: false }, 0, "data-layout-allow-overlap"), `540px ${I.bigY}px`, "data-layout-allow-overlap").replace('style="', 'style="filter:blur(28px);'));
html.push(layer("isbat-word", I.revealAt, I.end - I.revealAt, 7, 77, row(I.bigY, I.bigSize, [["ISBAT", "black", "gold"]], { stroke: 6 }, 0, "data-layout-allow-overlap"), `540px ${I.bigY}px`));
js.push(
  `tl.fromTo("#isbat-glow",{opacity:0,scale:0.6},{opacity:0.55,scale:1,duration:0.24,ease:"back.out(1.7)"},${I.revealAt});`,
  `tl.fromTo("#isbat-word",{opacity:0,scale:0.6},{opacity:1,scale:1,duration:0.24,ease:"back.out(1.7)"},${I.revealAt});`,
  `tl.to("#isbat-word",{y:${I.labelY - I.bigY},scale:${I.labelScale},duration:0.38,ease:"sine.inOut"},${I.moveAt});`,
  `tl.to("#isbat-word",{opacity:0,duration:0.15},${I.exitAt});`);
html.push(layer("isbat-rule", I.ruleAt, I.end - 17.15, 7, 78,
  `<div style="position:absolute;left:${W / 2 - 130}px;width:260px;top:${I.ruleY - 2}px;height:4px;background:${P.gold}"></div>`, `540px ${I.ruleY}px`));
js.push(`tl.fromTo("#isbat-rule",{scaleX:0},{scaleX:1,duration:0.3,ease:"power2.out"},${I.ruleAt});`, `tl.to("#isbat-rule",{opacity:0,duration:0.15},${I.exitAt});`);
for (const l of I.lines) {
  const i = id("card");
  html.push(layer(i, l.at, I.end - l.at, 7, 78, row(l.y, l.size, l.runs, { shadow: false }, 0, "data-layout-allow-overlap"), `540px ${l.y}px`));
  js.push(`tl.fromTo("#${i}",{opacity:0,y:14},{opacity:1,y:0,duration:0.3,ease:"power2.out"},${l.at});`, `tl.to("#${i}",{opacity:0,duration:0.15},${I.exitAt});`);
}

}

/* ---------------- subtitles: satu klip setiap ayat; highlight perkataan = GSAP set "--on" ---------------- */
const SU = T.subtitles;
SU.chunks.forEach((c, ci) => {
  let a = c.start, b = c.end;
  for (const [h0, h1] of SU.hide ?? []) { if (a < h1 && b > h0) { if (a >= h0) a = h1; else b = Math.min(b, h0); } }
  if (b - a <= 0.001) return;
  const cid = `sub-${ci + 1}`;
  const spans = c.words.map(([w, , kind], i) => {
    const key = kind === "key";
    const on = i === 0 ? 1 : 0;
    return `<span id="${cid}-w${i}" style="--on:${on};color:color-mix(in srgb, ${key ? P.navyDeep : "#fff"} calc(var(--on) * 100%), ${key ? P.gold : "#fff"});` +
      `background:color-mix(in srgb, ${key ? P.gold : P.navy} calc(var(--on) * 100%), transparent);` +
      `-webkit-text-stroke:calc((1 - var(--on)) * 3px) ${P.navyDeep};paint-order:stroke fill">${esc(w)}</span>`;
  }).join("");
  html.push(layer(cid, a, b - a, 8, 80, `<div class="sub">${spans}</div>`, `540px ${SU.y}px`));
  js.push(`tl.fromTo("#${cid}",{opacity:0,scale:0.86},{opacity:1,scale:1,duration:0.16,ease:"back.out(1.7)"},${a});`);
  c.words.forEach(([, wt], i) => {
    if (i === 0) return;
    const at = r3(Math.max(c.start, wt - 0.02));
    if (at >= b) return;
    js.push(`tl.set("#${cid}-w${i - 1}",{"--on":0},${at});`, `tl.set("#${cid}-w${i}",{"--on":1},${at});`);
  });
});

/* ---------------- end card ---------------- */
const E = T.endCard;
if (E) {
for (const l of E.lines) {
  const i = id("end");
  const o = `540px ${l.y}px`;
  if (l.pop) {
    html.push(layer(`${i}-g`, l.at, T.duration - l.at, 9, 90, row(l.y, l.size, l.runs, { stroke: 4, shadow: false }, 0, "data-layout-allow-overlap"), o, "data-layout-allow-overlap").replace('style="', 'style="filter:blur(26px);'));
    html.push(layer(i, l.at, T.duration - l.at, 10, 91, row(l.y, l.size, l.runs, { stroke: 4 }, 0, "data-layout-allow-overlap"), o));
    const reps = Math.floor((T.duration - l.at - 0.3) / 1.43) - 1;
    js.push(`tl.fromTo("#${i}-g",{opacity:0,scale:0.7},{opacity:0.45,scale:1,duration:0.3,ease:"back.out(1.7)"},${l.at});`,
      `tl.fromTo("#${i}",{opacity:0,scale:0.7},{opacity:1,scale:1,duration:0.3,ease:"back.out(1.7)"},${l.at});`,
      `tl.to(["#${i}","#${i}-g"],{scale:1.012,duration:1.43,ease:"sine.inOut",yoyo:true,repeat:${reps}},${r3(l.at + 0.3)});`);
    continue;
  }
  html.push(layer(i, l.at, T.duration - l.at, 10, 91, row(l.y, l.size, l.runs, { stroke: l.size > 90 ? 2 : 0 }, l.tracking ?? 0), o));
  js.push(`tl.fromTo("#${i}",{opacity:0,y:${l.at >= E.ruleAt ? 24 : 34}},{opacity:1,y:0,duration:0.28,ease:"power2.out"},${l.at});`);
}
html.push(layer("end-rule", E.ruleAt, T.duration - E.ruleAt, 10, 91,
  `<div style="position:absolute;left:${W / 2 - 150}px;width:300px;top:${E.ruleY - 2.5}px;height:5px;background:${P.gold}"></div>`, `540px ${E.ruleY}px`));
js.push(`tl.fromTo("#end-rule",{scaleX:0},{scaleX:1,duration:0.4,ease:"power2.out"},${E.ruleAt});`);
}

/* ---------------- audio: setiap stem / SFX pada lorong sendiri ---------------- */
const A = T.audio;
const wavLen = (file) => (statSync(join(here, "../assets", file)).size - 44) / (48000 * 3 * 2);
const aud = (aid, file, start, vol, dur, track) =>
  `<audio id="${aid}" src="assets/${file}" data-start="${start}" data-duration="${r3(dur)}" data-volume="${vol}" data-track-index="${track}"></audio>`;
const audio = [
  aud("a-dialog", A.dialog.file, 0, A.dialog.volume, wavLen(A.dialog.file) - 0.01, 20),
  aud("a-music", A.music.file, 0, A.music.volume, T.duration, 21),
  aud("a-amb", A.ambience.file, 0, A.ambience.volume, T.duration, 22),
  ...A.sfx.map((s, k) => aud(`a-sfx-${k}`, s.file, s.at, s.volume, Math.min(wavLen(s.file) - 0.01, T.duration - s.at), 23 + k)),
];

/* ---------------- write ---------------- */
const out = `<!doctype html>
<!-- DIJANA oleh scripts/build.mjs daripada remotion-video/src/isbat/timeline.json — sunting data itu, bukan fail ini. -->
<html lang="ms" data-resolution="portrait">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=${W}, height=${H}" />
    <title>ISBAT Part 1</title>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
    <style>
      @font-face { font-family: "InterDisplay"; src: url("assets/fonts/InterDisplay-SemiBold.otf"); font-weight: 600; }
      @font-face { font-family: "InterDisplay"; src: url("assets/fonts/InterDisplay-ExtraBold.otf"); font-weight: 800; }
      @font-face { font-family: "InterDisplay"; src: url("assets/fonts/InterDisplay-Black.otf"); font-weight: 900; }
      :root { --navy: ${P.navy}; --navy-deep: ${P.navyDeep}; --gold: ${P.gold}; --ink: #fff; --font-display: "InterDisplay", sans-serif; }
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { width: ${W}px; height: ${H}px; overflow: hidden; background: #000; }
      #root { position: relative; width: ${W}px; height: ${H}px; overflow: hidden; font-family: var(--font-display); }
      .layer { position: absolute; left: 0; top: 0; width: ${W}px; height: ${H}px; pointer-events: none; }
      .media { position: absolute; left: 0; top: 0; width: ${W}px; height: ${H}px; object-fit: fill; }
      .row { position: absolute; left: 0; width: ${W}px; height: 0; display: flex; justify-content: center; align-items: center; white-space: pre; line-height: 1; }
      .tag { position: absolute; left: 70px; top: 205px; height: 0; display: flex; align-items: center; gap: 12px; font-size: 36px; line-height: 1; white-space: pre; }
      .sub { position: absolute; left: ${(W - SU.maxWidth) / 2}px; width: ${SU.maxWidth}px; top: ${SU.y}px; height: 0; display: flex; flex-wrap: wrap;
             justify-content: center; align-content: center; align-items: center; column-gap: ${r3(SU.size * 0.26)}px; row-gap: ${r3(SU.size * 0.12)}px;
             font-weight: 900; font-size: ${SU.size}px; line-height: 1.1; }
      .sub span { border-radius: ${r3(SU.size * 0.22)}px; padding: ${r3(SU.size * 0.08)}px ${r3(SU.size * 0.16)}px ${r3(SU.size * 0.04)}px; margin: 0 -${r3(SU.size * 0.16)}px;
                  text-shadow: 0 4px 16px rgba(0,8,25,.75); }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="${T.duration}" data-width="${W}" data-height="${H}" data-fps="${FPS}">
      ${html.join("\n      ")}
      ${audio.join("\n      ")}
    </div>
    <script>
      window.__timelines = window.__timelines || {};
      const tl = gsap.timeline({ paused: true });
      ${js.join("\n      ")}
      window.__timelines["main"] = tl;
      tl.seek(0);
    </script>
  </body>
</html>
`;
writeFileSync(OUT, out);
console.log(`${OUT}: ${html.length} clips, ${audio.length} audio, ${js.length} tweens`);
