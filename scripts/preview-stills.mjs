// Usage: node scripts/preview-stills.mjs "$PWD" out/stills 3.2 12.6 43.9   (seconds)
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "path";
const [,, root, outDir, ...secs] = process.argv;
const serveUrl = await bundle({ entryPoint: path.join(root, "src/index.ts"), publicDir: path.join(root, "public") });
const browserExecutable = process.env.REMOTION_BROWSER ?? null;
const composition = await selectComposition({ serveUrl, id: "HornbillHeights", browserExecutable });
for (const s of secs) {
  const frame = Math.round(Number(s) * 30);
  await renderStill({ serveUrl, composition, frame, output: path.join(outDir, `s_${String(s).padStart(5, "0")}.jpg`), imageFormat: "jpeg", scale: 0.33, browserExecutable });
  console.log("rendered", s);
}
