# White & Gold AI Solutions — Explainer Reel

Vertical (9:16) motion-graphics explainer built with [Remotion](https://remotion.dev), synced word-for-word to the voiceover. Black, white and gold only.

| Composition | Size | Use |
| --- | --- | --- |
| `WhiteGoldAd` | 1080×1920 @ 30fps | Instagram / TikTok Reel |
| `WhiteGoldAd16x9` | 1920×1080 @ 30fps | YouTube / LinkedIn (same scenes, landscape layout) |

Duration is read from `public/voiceover.mp3` via `calculateMetadata`, so it always matches the audio exactly (currently 44.12s / 1324 frames).

## Commands

```bash
npm install
npx remotion studio                                                        # preview
npx remotion render WhiteGoldAd out/white-gold-ad.mp4 --codec=h264 --crf=18
npx remotion render WhiteGoldAd16x9 out/white-gold-ad-16x9.mp4 --codec=h264 --crf=18
```

## Captions

`public/captions.json` holds word-level timestamps in the `@remotion/captions` `Caption` format.

- **Primary:** `npm run transcribe` (`scripts/transcribe.ts`) installs whisper.cpp, downloads `medium.en` and transcribes the voiceover.
- **Fallback:** `python3 scripts/align.py` force-aligns the known script (`scripts/voiceover-script.txt`) to the audio with PocketSphinx (`pip install pocketsphinx`). Use it when Hugging Face model downloads are unavailable. The committed `captions.json` was made this way.

If you change the voiceover, regenerate captions and then retime `src/timeline.ts`.

## Retiming

All scene boundaries (`SCENES`) and word cues (`CUES`) are in **`src/timeline.ts`**, in absolute frames. Each scene starts exactly on its `from` frame, and the outgoing scene overlaps it by `TRANSITION_FRAMES`. Website and phone for the end card are in `CONTACT` in the same file.

## Structure

```
src/
  Root.tsx            compositions (9:16 + 16:9)
  WhiteGoldAd.tsx     audio, background, scene TransitionSeries, logo, captions
  timeline.ts         SCENES / CUES / CONTACT
  theme.ts            colors, gradient, glow, fonts, spring presets
  layout.ts           portrait/landscape metrics + safe areas
  anim.ts             spring/interpolate helpers
  components/         Background, Captions, IconRing, GoldText, LogoLockup, BrandLogo, Stage
  scenes/             Scene1Hook … Scene8CTA
scripts/
  transcribe.ts       whisper.cpp → public/captions.json
  align.py            PocketSphinx forced-alignment fallback
```
