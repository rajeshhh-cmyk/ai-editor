/**
 * Transcribes public/avatar.mp4 with whisper.cpp (medium.en) and writes
 * word-level captions to public/captions.json in the @remotion/captions format.
 *
 *   npm run transcribe
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import {
  downloadWhisperModel,
  installWhisperCpp,
  toCaptions,
  transcribe,
} from "@remotion/install-whisper-cpp";

const MODEL = "medium.en";
const WHISPER_VERSION = "1.5.5";

const root = process.cwd();
const whisperPath = path.join(root, "whisper.cpp");
const input = path.join(root, "public", "avatar.mp4");
const wav16k = path.join(root, "whisper.cpp", "avatar-16k.wav");
const output = path.join(root, "public", "captions.json");

await installWhisperCpp({ to: whisperPath, version: WHISPER_VERSION });
await downloadWhisperModel({ model: MODEL, folder: whisperPath });

// whisper.cpp needs 16 kHz mono WAV.
execSync(`ffmpeg -loglevel error -y -i "${input}" -ar 16000 -ac 1 "${wav16k}"`, {
  stdio: "inherit",
});

const whisperCppOutput = await transcribe({
  model: MODEL,
  whisperPath,
  whisperCppVersion: WHISPER_VERSION,
  inputPath: wav16k,
  tokenLevelTimestamps: true,
});

const { captions } = toCaptions({ whisperCppOutput });

fs.writeFileSync(output, JSON.stringify(captions, null, 2));
console.log(`Wrote ${captions.length} captions to ${path.relative(root, output)}`);
for (const c of captions) {
  console.log(`${(c.startMs / 1000).toFixed(2).padStart(6)}s  ${c.text}`);
}
