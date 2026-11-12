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
# split layout: (scale, crop-x, push-down) -> face sits low (~y 1200) under the B-roll band, as in the reference
SPLIT = {"split": (1.30, 190, 300), "splitc": (1.50, 225, 175)}
BAND_H = 640          # B-roll band height (top ~1/3 of frame)
CARD_Y = 560          # headline card top in split layout (straddles the band edge)
CAP_Y = 1420          # caption pill top
ENHANCE = "unsharp=5:5:0.55:5:5:0.0,eq=contrast=1.04:brightness=0.012:saturation=1.06"


def run(cmd):
    print(" ".join(cmd[:6]), "...", flush=True)
    subprocess.run(cmd, check=True)


def build_base(ed, preview=False):
    """Cut + per-segment framing -> base.mp4 (video only) and voice.wav."""
    segs = ed["segments"]
    sd = f"{WK}/shots"
    os.makedirs(sd, exist_ok=True)
    vlist, alist = [], []
    # one shot at a time (input seeking) keeps memory low on the 4K-bitrate source
    for i, sg in enumerate(segs):
        zk = sg.get("z", "wide")
        if zk in SPLIT:
            z, x, push = SPLIT[zk]
            sw, sh = int(W * z) // 2 * 2, int(H * z) // 2 * 2
            frame_vf = f"scale={sw}:{sh}:flags=lanczos,crop={W}:{H - push}:{x}:0,pad={W}:{H}:0:{push}"
        else:
            z, cx, cy = ZOOM[zk]
            sw, sh = int(W * z) // 2 * 2, int(H * z) // 2 * 2
            x = int(min(max(sw * cx - W / 2, 0), sw - W))
            y = int(min(max(sh * cy - H * 0.40, 0), sh - H)) if z > 1 else 0
            frame_vf = f"scale={sw}:{sh}:flags=lanczos,crop={W}:{H}:{x}:{y}"
        d = sg['e'] - sg['s']
        nfr = round(d * FPS)
        run(["ffmpeg", "-v", "error", "-y", "-ss", f"{sg['s']:.3f}", "-i", RAW, "-t", f"{d:.3f}",
             "-vf", f"fps={FPS},{frame_vf},{ENHANCE},setsar=1",
             "-frames:v", str(nfr), "-an", "-c:v", "libx264", "-preset", "veryfast" if preview else "medium",
             "-crf", "14", "-pix_fmt", "yuv420p", f"{sd}/{i:03d}.mp4"])
        # audio cut to exactly the frame count so A/V never drifts
        da = nfr / FPS
        run(["ffmpeg", "-v", "error", "-y", "-ss", f"{sg['s']:.3f}", "-i", RAW, "-t", f"{da:.4f}", "-vn",
             "-af", f"aformat=sample_rates=48000:channel_layouts=mono,afade=t=in:d=0.012,"
                    f"afade=t=out:st={max(da-0.015,0):.4f}:d=0.015,apad=whole_dur={da:.4f}",
             "-c:a", "pcm_s16le", f"{sd}/{i:03d}.wav"])
        vlist.append(f"file '{sd}/{i:03d}.mp4'"); alist.append(f"file '{sd}/{i:03d}.wav'")
    open(f"{sd}/v.txt", "w").write("\n".join(vlist)); open(f"{sd}/a.txt", "w").write("\n".join(alist))
    run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", f"{sd}/v.txt", "-c", "copy", f"{WK}/base.mp4"])
    # voice treatment: rumble cut, denoise, gentle de-mud, presence, compression
    run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", f"{sd}/a.txt", "-af",
         "highpass=f=80,afftdn=nr=14:nf=-42:tn=1,"
         "equalizer=f=250:t=q:w=1.2:g=-2,equalizer=f=3500:t=q:w=1.5:g=2.5,"
         "acompressor=threshold=-20dB:ratio=3:attack=8:release=120:makeup=3",
         "-c:a", "pcm_s16le", f"{WK}/voice.wav"])


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


def in_split(ed, t):
    return any(m["t0"] <= t < m["t1"] for m in ed.get("split", []))


def full_windows(ed):
    """Complement of split windows within [0, end)."""
    out, cur = [], 0.0
    for m in sorted(ed.get("split", []), key=lambda m: m["t0"]):
        if m["t0"] > cur:
            out.append((cur, m["t0"]))
        cur = max(cur, m["t1"])
    if cur < ed["end"]["t0"]:
        out.append((cur, ed["end"]["t0"]))
    return out


def build_layers(ed, total):
    L = []
    end = ed["end"]["t0"]
    ft = gfx.footer()
    L.append(Layer(ft, (W - ft.width) // 2, 1808, 0, end, anim=None))
    # instagram watermark: left above the caption in split layout, right side in full-frame (as reference)
    hd = gfx.handle_tag()
    for m in ed.get("split", []):
        L.append(Layer(hd, 40, 1255, m["t0"], m["t1"], anim="fade"))
    for a, b in full_windows(ed):
        L.append(Layer(hd, W - hd.width - 34, 560, a, b, anim="fade"))
    for c in ed["cards"]:
        lines = [[(t, COLORS[col]) for t, col in ln] for ln in c["lines"]]
        img, pad = gfx.card(lines, size=c.get("size", 60))
        y = c.get("y", CARD_Y)
        L.append(Layer(img, (W - img.width) // 2, y - pad, c["t0"], c["t1"], anim="pop"))
    for cp in ed["captions"]:
        p = gfx.pill(cp["text"], size=46)
        L.append(Layer(p, (W - p.width) // 2, CAP_Y, cp["t0"], cp["t1"], anim="pop"))
    return L


# ---------- B-roll band ----------
BR_W, BR_H = int(W * 1.12) // 2 * 2, int(BAND_H * 1.12) // 2 * 2   # oversize for Ken Burns


def prep_broll(ed, preview=False):
    """Render each scheduled B-roll piece to a band-sized clip (enhanced, 30 fps)."""
    bd = f"{WK}/broll"; os.makedirs(bd, exist_ok=True)
    k = 0
    for w in ed.get("broll", []):
        for c in w["clips"]:
            src = os.path.join(ROOT, "broll", c["file"])
            dur = c["t1"] - c["t0"] + 0.6
            fy = c.get("fy", 0.5)
            # fill the band: scale to cover, crop around the chosen vertical focus
            vf = (f"scale={BR_W}:{BR_H}:force_original_aspect_ratio=increase:flags=lanczos,"
                  f"crop={BR_W}:{BR_H}:(iw-{BR_W})/2:(ih-{BR_H})*{fy},{ENHANCE},fps={FPS},setsar=1")
            out = f"{bd}/{k:02d}.mp4"
            if src.lower().endswith((".jpg", ".png")):
                cmd = ["ffmpeg", "-v", "error", "-y", "-loop", "1", "-i", src, "-t", f"{dur:.3f}"]
            else:
                cmd = ["ffmpeg", "-v", "error", "-y", "-ss", f"{c['ss']:.2f}", "-stream_loop", "3", "-i", src,
                       "-t", f"{dur:.3f}"]
            run(cmd + ["-vf", vf, "-an", "-c:v", "libx264", "-preset", "veryfast", "-crf", "15",
                       "-pix_fmt", "yuv420p", out])
            c["path"] = out
            k += 1


class ClipReader:
    def __init__(self, path):
        self.p = subprocess.Popen(["ffmpeg", "-v", "quiet", "-i", path, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
                                  stdout=subprocess.PIPE)
        self.last = None

    def next(self):
        buf = self.p.stdout.read(BR_W * BR_H * 3)
        if len(buf) == BR_W * BR_H * 3:
            self.last = np.frombuffer(buf, np.uint8).reshape(BR_H, BR_W, 3)
        return self.last

    def close(self):
        self.p.kill()


class Band:
    """Top B-roll band: slides down on entry, Ken Burns push per clip, crossfades between clips, slides up on exit."""
    def __init__(self, ed):
        self.wins = ed.get("broll", [])
        self.readers = {}

    def _clip_frame(self, c, t, i):
        key = c["path"]
        if key not in self.readers:
            self.readers[key] = ClipReader(key)
        fr = self.readers[key].next()
        p = min(1, max(0, (t - c["t0"]) / max(0.1, c["t1"] - c["t0"])))
        zin = i % 2 == 0                              # alternate push-in / pull-out
        s = 1.0 + 0.11 * (p if zin else 1 - p)        # crop scale inside the 12% oversize
        cw, ch = int(BR_W / (1.12 / s) / s * 1.0), 0
        cw = int(W * 1.12 / s); ch = int(BAND_H * 1.12 / s)
        cw = min(cw, BR_W); ch = min(ch, BR_H)
        x0 = (BR_W - cw) // 2; y0 = (BR_H - ch) // 2
        im = Image.fromarray(fr[y0:y0 + ch, x0:x0 + cw]).resize((W, BAND_H), Image.BILINEAR)
        return np.asarray(im).astype(np.float32)

    def draw(self, frame, t):
        for w in self.wins:
            if not (w["t0"] <= t < w["t1"]):
                continue
            clips = w["clips"]
            band = None
            for i, c in enumerate(clips):
                if c["t0"] <= t < c["t1"] + (0.3 if i < len(clips) - 1 else 0):
                    f = self._clip_frame(c, t, i)
                    if band is None:
                        band = f
                    else:  # crossfade into the next clip
                        a = min(1, (t - c["t0"]) / 0.3)
                        band = band * (1 - a) + f * a
            if band is None:
                return
            if t >= clips[-1]["t0"] and len(clips) > 1:
                pass
            # entry: content punches in (zoom 1.08 -> 1) out of a white flash; exit is a hard cut on the shot change
            # (sliding the band would reveal the black pad above the pushed-down speaker)
            k_in = t - w["t0"]
            if k_in < 0.3 and w["t0"] > 0:
                p = ease_out(k_in / 0.3)
                z = 1.08 - 0.08 * p
                ch, cw = int(BAND_H / z), int(W / z)
                y0, x0 = (BAND_H - ch) // 2, (W - cw) // 2
                band = np.asarray(Image.fromarray(band[y0:y0 + ch, x0:x0 + cw].astype(np.uint8)).resize(
                    (W, BAND_H), Image.BILINEAR)).astype(np.float32)
                band = band * p + 255 * (1 - p)
            frame[0:BAND_H] = band
            sh = np.linspace(0.45, 0, 18)[:, None, None]
            frame[BAND_H:BAND_H + 18] *= (1 - sh)
            return


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
    # snap split/B-roll windows to the real cut frames (each shot is rounded to whole frames)
    bounds, acc = [0.0], 0
    for sg in ed["segments"]:
        acc += round((sg["e"] - sg["s"]) * FPS); bounds.append(acc / FPS)
    snap = lambda x: min(bounds, key=lambda b: abs(b - x))
    for m in ed.get("split", []):
        m["t0"], m["t1"] = snap(m["t0"]), snap(m["t1"])
    for w in ed.get("broll", []):
        w["t0"], w["t1"] = snap(w["t0"]), snap(w["t1"])
        w["clips"][0]["t0"] = w["t0"]; w["clips"][-1]["t1"] = w["t1"]
    for c in ed["cards"]:
        c["t1"] = snap(c["t1"])
    ed["end"]["t0"] = snap(ed["end"]["t0"])
    layers = build_layers(ed, total)
    band = Band(ed)
    lg = gfx.logo(270)
    logo_l = Layer(lg, W - lg.width - 14, 14, 0, ed["end"]["t0"], anim=None)
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
            band.draw(fr, t)
            for ly in layers + [logo_l]:
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
         "[1:a]loudnorm=I=-14.5:TP=-1.5:LRA=7,aresample=48000[v];[2:a]volume=1.0[s];"
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
    prep_broll(ed, preview)
    total = composite(ed, out, preview)
    sfx(ed, total)
    master(out, total)
    print("done", out, total)
