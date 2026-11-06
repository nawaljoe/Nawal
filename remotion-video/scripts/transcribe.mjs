// Transcribe the voice-over with whisper.cpp (multilingual model, Malay).
// Usage: node scripts/transcribe.mjs <input16k.wav> <out.json>
import path from "path";
import fs from "fs";
import {
  downloadWhisperModel,
  installWhisperCpp,
  transcribe,
  toCaptions,
} from "@remotion/install-whisper-cpp";

const [input, out] = process.argv.slice(2);
const to = path.join(process.cwd(), "whisper.cpp");
const model = process.env.WHISPER_MODEL ?? "medium";
await installWhisperCpp({ to, version: "1.5.5" });
await downloadWhisperModel({ model, folder: to });
const whisperCppOutput = await transcribe({
  model,
  whisperPath: to,
  whisperCppVersion: "1.5.5",
  inputPath: input,
  tokenLevelTimestamps: true,
  language: "ms",
});
const { captions } = toCaptions({ whisperCppOutput });
fs.writeFileSync(out, JSON.stringify(captions, null, 2));
console.log(captions.map((c) => c.text).join(""));
