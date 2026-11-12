# Reference-style video editor

Scripts that cut a raw talking-head clip and style it like the Matoshree reference reels.

- `transcribe.py` – Whisper (large-v3) word-level transcript of `work/<name>16k.wav`.
- `gfx.py` – overlay graphics: magenta caption pills, white question cards (red keywords), logo, Instagram handle, footer, end card.
- `render.py` – reads `work/edit.json`, cuts/frames the raw clip, composites overlays frame by frame, treats and masters the audio to -14 LUFS, writes `out/final.mp4`.
- `fonts/` – Poppins (Latin) + Hind (Devanagari), SIL Open Font License.

Media (`raw/`, `ref/`, `work/`, `out/`) is git-ignored.
