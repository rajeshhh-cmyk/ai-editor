#!/usr/bin/env node
/**
 * Detects silence in a video and writes non-silent segments to a JSON file.
 * Usage: node scripts/detect-segments.mjs <path/to/video.mp4> [noise_db] [min_silence_sec]
 *
 * noise_db:        silence threshold, default -40dB  (louder = more aggressive)
 * min_silence_sec: minimum silence length to cut,    default 0.5s
 */
import { execSync } from "child_process";
import { writeFileSync, mkdirSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const INPUT = process.argv[2];
const NOISE_DB = process.argv[3] ?? "-40dB";
const MIN_SILENCE_SEC = process.argv[4] ?? "0.5";
const OUTPUT = resolve(__dirname, "../src/remotion/VideoEditor/segments.json");

if (!INPUT) {
  console.error(
    "Usage: node scripts/detect-segments.mjs <video.mp4> [noise_db] [min_silence_sec]"
  );
  process.exit(1);
}

console.log(`Probing: ${INPUT}`);

// --- probe duration + fps ---
const probeRaw = execSync(
  `npx remotion ffprobe -v quiet -print_format json -show_streams -show_format "${INPUT}"`,
  { encoding: "utf8" }
);
const probe = JSON.parse(probeRaw);
const videoStream = probe.streams.find((s) => s.codec_type === "video");
const totalDuration = parseFloat(probe.format.duration);

// r_frame_rate is a fraction like "30000/1001"
let fps = 30;
if (videoStream?.r_frame_rate) {
  const [num, den] = videoStream.r_frame_rate.split("/").map(Number);
  fps = Math.round((num / den) * 100) / 100;
}

console.log(`Duration: ${totalDuration.toFixed(2)}s  FPS: ${fps}`);
console.log(
  `Detecting silences (threshold: ${NOISE_DB}, min: ${MIN_SILENCE_SEC}s)...`
);

// --- silence detection ---
const ffmpegOut = execSync(
  `npx remotion ffmpeg -i "${INPUT}" -af "silencedetect=noise=${NOISE_DB}:d=${MIN_SILENCE_SEC}" -f null - 2>&1`,
  { encoding: "utf8", shell: true }
);

const starts = [...ffmpegOut.matchAll(/silence_start: ([\d.]+)/g)].map((m) =>
  parseFloat(m[1])
);
const ends = [...ffmpegOut.matchAll(/silence_end: ([\d.]+)/g)].map((m) =>
  parseFloat(m[1])
);

const silences = starts.map((s, i) => ({ start: s, end: ends[i] ?? totalDuration }));
console.log(`Found ${silences.length} silence(s).`);

// --- invert silences → keep segments ---
const segments = [];
let cursor = 0;
for (const { start, end } of silences) {
  if (start > cursor + 0.05) {
    segments.push({ start: +cursor.toFixed(4), end: +start.toFixed(4) });
  }
  cursor = end;
}
if (cursor < totalDuration - 0.05) {
  segments.push({ start: +cursor.toFixed(4), end: +totalDuration.toFixed(4) });
}

// --- write output ---
mkdirSync(dirname(OUTPUT), { recursive: true });
writeFileSync(OUTPUT, JSON.stringify({ fps, totalDuration, segments }, null, 2));

const totalKept = segments.reduce((s, seg) => s + (seg.end - seg.start), 0);
console.log(`\n✓ ${segments.length} segments → ${OUTPUT}`);
segments.forEach((s, i) =>
  console.log(
    `  [${i + 1}] ${s.start.toFixed(2)}s → ${s.end.toFixed(2)}s  (${(s.end - s.start).toFixed(2)}s)`
  )
);
console.log(`\n  Kept:    ${totalKept.toFixed(2)}s`);
console.log(`  Removed: ${(totalDuration - totalKept).toFixed(2)}s of silence`);
