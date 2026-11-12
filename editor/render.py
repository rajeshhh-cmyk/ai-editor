"""Render the final edit from edit.json.

edit.json:
{
  "segments": [{"s": src_start, "e": src_end, "z": "wide"|"close"}...],
  "captions": [{"t0": out_t, "t1": out_t, "text": "..."}...],
  "cards":    [{"t0":..,"t1":..,"lines":[[["text","black|red"],...],...],"size":60,"hook":bool}],
  "flashes":  [out_t,...],
  "end":      {"t0": out_t, "dur": 3.0}
}
"""
import json, subprocess, sys, os, math
import numpy as np
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import gfx

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, "raw/C2215.MP4")
WK = os.path.join(ROOT, "work")
os.makedirs(WK, exist_ok=True)
FPS = 30
W, H = 1080, 1920
ZOOM = {"wide": (1.0, 0.5, 0.40), "close": (1.30, 0.50, 0.36)}  # scale, cx, cy (face anchor)


def run(cmd):
    print(" ".join(cmd[:6]), "...", flush=True)
    subprocess.run(cmd, check=True)


def build_base(ed, preview=False):
    """Cut + per-segment framing -> base.mp4 (video only) and voice.wav."""
    segs = ed["segments"]
    fc = []
    vi, ai = [], []
    for i, sg in enumerate(segs):
        z, cx, cy = ZOOM[sg.get("z", "wide")]
        sw, sh = int(W * z) // 2 * 2, int(H * z) // 2 * 2
        x = int(min(max(sw * cx - W / 2, 0), sw - W))
        y = int(min(max(sh * cy - H * 0.40, 0), sh - H)) if z > 1 else 0
        fc.append(f"[0:v]trim={sg['s']:.3f}:{sg['e']:.3f},setpts=PTS-STARTPTS,fps={FPS},"
                  f"scale={sw}:{sh}:flags=lanczos,crop={W}:{H}:{x}:{y},setsar=1[v{i}]")
        d = sg['e'] - sg['s']
        fc.append(f"[0:a]atrim={sg['s']:.3f}:{sg['e']:.3f},asetpts=PTS-STARTPTS,"
                  f"afade=t=in:d=0.012,afade=t=out:st={max(d-0.015,0):.3f}:d=0.015[a{i}]")
        vi.append(f"[v{i}]"); ai.append(f"[a{i}]")
    fc.append("".join(vi) + f"concat=n={len(segs)}:v=1:a=0[vout]")
    fc.append("".join(ai) + f"concat=n={len(segs)}:v=0:a=1[acat]")
    # voice treatment: rumble cut, denoise, gentle de-mud, presence, compression
    fc.append("[acat]aformat=sample_fmts=fltp:sample_rates=48000:channel_layouts=mono,"
              "highpass=f=80,afftdn=nr=14:nf=-42:tn=1,"
              "equalizer=f=250:t=q:w=1.2:g=-2,equalizer=f=3500:t=q:w=1.5:g=2.5,"
              "acompressor=threshold=-20dB:ratio=3:attack=8:release=120:makeup=3[aout]")
    fcs = ";\n".join(fc)
    open(f"{WK}/base_filter.txt", "w").write(fcs)
    run(["ffmpeg", "-v", "error", "-y", "-i", RAW, "-filter_complex_script", f"{WK}/base_filter.txt",
         "-map", "[vout]", "-c:v", "libx264", "-preset", "veryfast" if preview else "medium",
         "-crf", "16", "-pix_fmt", "yuv420p", f"{WK}/base.mp4",
         "-map", "[aout]", "-c:a", "pcm_s16le", f"{WK}/voice.wav"])


# ---------- overlay compositing ----------

def ease_out_back(t, s=1.70158):
    t -= 1
    return t * t * ((s + 1) * t + s) + 1


def ease_out(t):
    return 1 - (1 - t) ** 3


class Layer:
    def __init__(self, img, x, y, t0, t1, anim="pop", pad=0):
        self.img, self.x, self.y, self.t0, self.t1, self.anim = img, x, y, t0, t1, anim
        self.arr = np.asarray(img).astype(np.float32)
        self.cache = {}

    def frame(self, t):
        """Return (rgba ndarray, x, y) or None for time t."""
        if t < self.t0 or t >= self.t1:
            return None
        k = t - self.t0
        if self.anim == "pop" and k < 0.18:
            s = 0.6 + 0.4 * ease_out_back(k / 0.18)
            key = round(s, 3)
            if key not in self.cache:
                w, h = max(1, int(self.img.width * s)), max(1, int(self.img.height * s))
                im = self.img.resize((w, h), Image.BILINEAR)
                a = np.asarray(im).astype(np.float32).copy()
                a[..., 3] *= min(1, k / 0.08)
                self.cache[key] = a
            a = self.cache[key]
            cx = self.x + self.img.width / 2
            cy = self.y + self.img.height / 2
            return a, int(cx - a.shape[1] / 2), int(cy - a.shape[0] / 2)
        if self.anim == "slide" and k < 0.25:  # card drops in from above
            p = ease_out(k / 0.25)
            a = self.arr.copy()
            a[..., 3] *= p
            return a, self.x, int(self.y - 60 * (1 - p))
        if self.anim == "fade" and k < 0.3:
            a = self.arr.copy(); a[..., 3] *= k / 0.3
            return a, self.x, self.y
        return self.arr, self.x, self.y


def blend(frame, a, x, y):
    h, w = a.shape[:2]
    x0, y0 = max(x, 0), max(y, 0)
    x1, y1 = min(x + w, W), min(y + h, H)
    if x1 <= x0 or y1 <= y0:
        return
    sub = a[y0 - y:y1 - y, x0 - x:x1 - x]
    al = sub[..., 3:4] / 255.0
    region = frame[y0:y1, x0:x1]
    region[:] = region * (1 - al) + sub[..., :3] * al


COLORS = {"black": gfx.BLACK, "red": gfx.RED}


def build_layers(ed, total):
    L = []
    # persistent brand elements
    lg = gfx.logo(270)
    L.append(Layer(lg, W - lg.width - 14, 14, 0, ed["end"]["t0"], anim=None))
    ft = gfx.footer()
    L.append(Layer(ft, (W - ft.width) // 2, 1808, 0, ed["end"]["t0"], anim=None))
    # instagram watermark: right side, sits below the card area
    hd = gfx.handle_tag()
    L.append(Layer(hd, W - hd.width - 34, 560, 0, ed["end"]["t0"], anim=None))
    for c in ed["cards"]:
        lines = [[(t, COLORS[col]) for t, col in ln] for ln in c["lines"]]
        img, pad = gfx.card(lines, size=c.get("size", 60))
        y = c.get("y", 235)
        L.append(Layer(img, (W - img.width) // 2, y - pad, c["t0"], c["t1"], anim="pop"))
    for cp in ed["captions"]:
        p = gfx.pill(cp["text"], size=46)
        L.append(Layer(p, (W - p.width) // 2, 1395, cp["t0"], cp["t1"], anim="pop"))
    return L


def flash_frame(frame, k):
    """Warm light-leak flash; k in [0,1] over its duration (peak at 0.5)."""
    amt = math.sin(math.pi * k)
    if amt <= 0:
        return
    yy = np.linspace(-1, 1, H)[:, None]
    xx = np.linspace(-1, 1, W)[None, :]
    g = np.clip(1.6 - 0.8 * np.sqrt((xx + 0.2) ** 2 + (yy + 0.1) ** 2), 0, 1)
    warm = np.stack([255 * np.ones_like(g), 200 + 55 * g, 120 + 135 * g], -1)
    a = (amt * (0.55 + 0.45 * g))[..., None]
    frame[:] = frame * (1 - a) + warm * a


def composite(ed, out_path, preview=False):
    info = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0",
                           f"{WK}/base.mp4"], capture_output=True, text=True).stdout
    total = float(info)
    layers = build_layers(ed, total)
    end_t0, end_dur = ed["end"]["t0"], ed["end"]["dur"]
    eh_grad, eh_white = gfx.end_handle(True), gfx.end_handle(False)
    eg = np.asarray(eh_grad).astype(np.float32)
    ew = np.asarray(eh_white).astype(np.float32)
    flash_d = 0.5
    dec = subprocess.Popen(["ffmpeg", "-v", "error", "-i", f"{WK}/base.mp4", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
                           stdout=subprocess.PIPE)
    enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
                            "-r", str(FPS), "-i", "-", "-c:v", "libx264", "-preset", "veryfast" if preview else "slow",
                            "-crf", "18", "-pix_fmt", "yuv420p", f"{WK}/comp.mp4"], stdin=subprocess.PIPE)
    n = 0
    fsz = W * H * 3
    while True:
        buf = dec.stdout.read(fsz)
        if len(buf) < fsz:
            break
        t = n / FPS
        fr = np.frombuffer(buf, np.uint8).reshape(H, W, 3).astype(np.float32)
        # colour grade: slight contrast + warmth + saturation, like the reference
        fr = (fr - 128) * 1.06 + 131
        fr[..., 0] *= 1.02
        fr[..., 2] *= 0.985
        lum = fr.mean(-1, keepdims=True)
        fr = lum + (fr - lum) * 1.10
        if t < end_t0:
            for ly in layers:
                r = ly.frame(t)
                if r is not None:
                    blend(fr, *r)
            for ft in ed["flashes"]:
                if ft - flash_d / 2 <= t < ft + flash_d / 2:
                    flash_frame(fr, (t - ft + flash_d / 2) / flash_d)
        else:
            k = t - end_t0
            dim = min(1, k / 0.35) * 0.62
            fr *= (1 - dim)
            a = eg if k < end_dur * 0.5 else ew
            s = 0.7 + 0.3 * ease_out_back(min(1, k / 0.35))
            im = (eh_grad if k < end_dur * 0.5 else eh_white)
            if s != 1:
                im = im.resize((int(im.width * s), int(im.height * s)), Image.BILINEAR)
                a = np.asarray(im).astype(np.float32).copy()
            a = a.copy() if a is eg or a is ew else a
            a[..., 3] *= min(1, k / 0.2)
            blend(fr, a, (W - a.shape[1]) // 2, 820 - a.shape[0] // 2 + 60)
        enc.stdin.write(np.clip(fr, 0, 255).astype(np.uint8).tobytes())
        n += 1
        if n % 300 == 0:
            print(f"  frame {n} ({t:.1f}s)", flush=True)
    enc.stdin.close(); enc.wait(); dec.wait()
    return total


def sfx(ed, total):
    """Synthesize subtle whooshes on card pop-ins/flashes and a soft boom on the end card."""
    sr = 48000
    out = np.zeros(int(sr * (total + 1)), np.float32)
    rng = np.random.default_rng(7)

    def whoosh(t, dur=0.45, gain=0.10):
        n = int(sr * dur)
        noise = rng.standard_normal(n).astype(np.float32)
        # sweep band-pass via moving average difference with changing width
        env = np.sin(np.linspace(0, np.pi, n)) ** 2
        k = np.linspace(40, 6, n).astype(int)
        cs = np.cumsum(np.concatenate([[0], noise]))
        idx = np.arange(n)
        lo = (cs[idx + 1] - cs[np.maximum(idx + 1 - k, 0)]) / k
        sig = (noise * 0.25 + lo) * env * gain
        i0 = int(sr * max(0, t - dur * 0.45))
        out[i0:i0 + n] += sig[:len(out) - i0]

    def boom(t, dur=1.4, gain=0.35):
        n = int(sr * dur)
        tt = np.arange(n) / sr
        f = 55 * np.exp(-tt * 1.5) + 38
        sig = np.sin(2 * np.pi * np.cumsum(f) / sr) * np.exp(-tt * 3.2) * gain
        i0 = int(sr * t)
        out[i0:i0 + n] += sig[:len(out) - i0]

    for c in ed["cards"]:
        whoosh(c["t0"])
    for f in ed["flashes"]:
        whoosh(f, 0.6, 0.12)
    boom(ed["end"]["t0"])
    pcm = (np.clip(out, -1, 1) * 32767).astype(np.int16)
    import wave
    w = wave.open(f"{WK}/sfx.wav", "wb"); w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr)
    w.writeframes(pcm.tobytes()); w.close()


def master(out_path, total):
    # voice -> loudness -14 LUFS / -1 dBTP like the reference, then add SFX underneath
    run(["ffmpeg", "-v", "error", "-y", "-i", f"{WK}/comp.mp4", "-i", f"{WK}/voice.wav", "-i", f"{WK}/sfx.wav",
         "-filter_complex",
         "[1:a]loudnorm=I=-14.5:TP=-1.5:LRA=7[v];[2:a]volume=1.0[s];"
         "[v][s]amix=inputs=2:normalize=0:duration=first,alimiter=limit=0.89,"
         "aformat=sample_rates=48000:channel_layouts=stereo[a]",
         "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "256k",
         "-movflags", "+faststart", "-t", f"{total:.3f}", out_path])


if __name__ == "__main__":
    ed = json.load(open(f"{WK}/edit.json"))
    preview = "--preview" in sys.argv
    out = sys.argv[1] if len(sys.argv) > 1 and not sys.argv[1].startswith("--") else f"{ROOT}/out/final.mp4"
    os.makedirs(os.path.dirname(out), exist_ok=True)
    if "--skip-base" not in sys.argv:
        build_base(ed, preview)
    total = composite(ed, out, preview)
    sfx(ed, total)
    master(out, total)
    print("done", out, total)
