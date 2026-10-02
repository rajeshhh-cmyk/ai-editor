"""
Fallback caption generator: forced-aligns the known voiceover script to
public/voiceover.mp3 with PocketSphinx and writes public/captions.json in the
@remotion/captions `Caption` format.

Use this when whisper.cpp models can't be downloaded (scripts/transcribe.ts is
the primary path). Requires: pip install pocketsphinx, ffmpeg.

    python3 scripts/align.py
"""
import json
import re
import subprocess
from pathlib import Path

from pocketsphinx import Decoder

ROOT = Path(__file__).resolve().parent.parent
AUDIO = ROOT / "public" / "voiceover.mp3"
SCRIPT = ROOT / "scripts" / "voiceover-script.txt"
OUT = ROOT / "public" / "captions.json"
FRAME_MS = 10  # PocketSphinx frame rate is 100 fps

# How display tokens are pronounced, when it differs from the token itself.
SPOKEN = {
    "24/7": ["twenty", "four", "seven"],
    "&": ["and"],
    "ai-powered": ["ai", "powered"],
    "follow-ups": ["follow", "ups"],
}


def spoken_words(token: str) -> list[str]:
    key = re.sub(r"[^\w/&'\-]", "", token).lower()
    return SPOKEN.get(key, [key])


def main() -> None:
    tokens = SCRIPT.read_text().split()
    spoken = [spoken_words(t) for t in tokens]
    flat = [w for ws in spoken for w in ws]

    pcm = subprocess.run(
        ["ffmpeg", "-loglevel", "error", "-i", str(AUDIO), "-ar", "16000", "-ac", "1", "-f", "s16le", "-"],
        check=True,
        capture_output=True,
    ).stdout

    decoder = Decoder(samprate=16000, bestpath=False, loglevel="ERROR")
    decoder.set_align_text(" ".join(flat))
    decoder.start_utt()
    decoder.process_raw(pcm, full_utt=True)
    decoder.end_utt()
    if decoder.hyp() is None:
        raise SystemExit("PocketSphinx could not align the script to the audio")

    # Second pass refines word boundaries with phone-level alignment.
    decoder.set_alignment()
    decoder.start_utt()
    decoder.process_raw(pcm, full_utt=True)
    decoder.end_utt()

    aligned = [
        seg for seg in decoder.get_alignment()
        if seg.name not in ("<s>", "</s>", "<sil>") and not seg.name.startswith("[")
    ]
    names = [re.sub(r"\(\d+\)$", "", seg.name) for seg in aligned]
    if names != flat:
        raise SystemExit(f"Alignment mismatch:\n{names}\n{flat}")

    captions = []
    i = 0
    for token, ws in zip(tokens, spoken):
        segs = aligned[i : i + len(ws)]
        i += len(ws)
        start = segs[0].start * FRAME_MS
        end = (segs[-1].start + segs[-1].duration) * FRAME_MS
        captions.append(
            {
                "text": " " + token,
                "startMs": start,
                "endMs": end,
                "timestampMs": (start + end) // 2,
                "confidence": None,
            }
        )

    OUT.write_text(json.dumps(captions, indent=2))
    print(f"Wrote {len(captions)} captions to {OUT.relative_to(ROOT)}")
    for c in captions:
        print(f"{c['startMs'] / 1000:7.2f} {c['endMs'] / 1000:7.2f} {c['text']}")


if __name__ == "__main__":
    main()
