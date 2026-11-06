// Quality-check helper: render a contact sheet of frames from one composition.
// Usage: node scripts/stills.mjs <CompositionId> <out.png> <frame> [frame...]
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { execFileSync } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";

const [id, out, ...frames] = process.argv.slice(2);
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const composition = await selectComposition({ serveUrl, id });
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "stills-"));
const files = [];
for (const f of frames.map(Number)) {
  const file = path.join(tmp, `${String(f).padStart(5, "0")}.png`);
  await renderStill({ serveUrl, composition, frame: f, output: file, scale: 0.33, logLevel: "error" });
  files.push(file);
}
execFileSync("ffmpeg", [
  "-y", "-loglevel", "error",
  ...files.flatMap((f) => ["-i", f]),
  "-filter_complex", `${files.map((_, i) => `[${i}:v]`).join("")}hstack=inputs=${files.length}`,
  out,
]);
console.log(`wrote ${out} (${frames.join(", ")})`);
