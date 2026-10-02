# White & Gold AI Solutions — Avatar Reel

A 1080×1920 Reel built with [Remotion](https://remotion.dev). The talking AI-avatar video is the base layer, with motion graphics, karaoke subtitles and animated icons laid over and around the presenter. Black, white and gold only.

- Composition: `WhiteGoldAvatar` (30fps). Duration is read from `public/avatar.mp4` with `@remotion/media-parser` (61.44s → 1843 frames).
- `public/avatar.mp4` is an H.264 re-encode of the supplied HEVC file, so the video plays in Chrome and Studio. Its audio is the voiceover.

```bash
npm install
npx remotion studio
npx remotion render WhiteGoldAvatar out/white-gold-avatar.mp4 --codec=h264 --crf=18
```

## Timing

`src/scenes.config.ts` derives every cue, scene and avatar-mode switch from the word timestamps in `public/captions.json` (`word("ready to buy")`, `word("Comment", 2)` …). It doesn't use fixed times.

Avatar modes (`MODES`): `full`, `top` (gold-bordered card with graphics below) and `hidden` (graphics only, with the video still mounted for audio). There is no `pip` mode.

## Captions

- `npm run transcribe`: whisper.cpp `medium.en` → `public/captions.json`
- `python3 scripts/align.py`: fallback that force-aligns `scripts/voiceover-script.txt` to the audio with PocketSphinx. The committed captions were made this way, because the whisper model host was blocked in the build environment.
