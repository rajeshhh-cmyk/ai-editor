"""Edit plan for C2215 ("Cesarean section के बाद ये 4 गलती") -> work/edit.json.

Sections list source ranges (seconds in the raw clip) with hand-corrected caption chunks
(text, source start time). Range edges are snapped to the speech energy and internal pauses
are tightened, like the reference's fast jump-cut rhythm.
"""
import json, os
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WK = os.path.join(ROOT, "work")
DB = np.load(os.path.join(WK, "raw_db.npy"))  # 10 ms RMS in dBFS of raw audio
THR = -38.0
MAX_GAP = 0.30   # pauses longer than this are cut down
PAD = 0.10       # breath kept either side of a cut

B, R = "black", "red"
SECTIONS = [
    {"name": "hook",
     "card": {"lines": [[["Cesarean", B], ["section", B], ["के", B], ["बाद", B]],
                        [["ये", R], ["4", R], ["गलतियाँ", R], ["बिल्कुल", R], ["न", R], ["करें!", R]]], "size": 70},
     "ranges": [[1.0, 6.75]],
     "caps": [("Cesarean section के बाद", 1.10), ("ये चार गलती", 2.44), ("आप बिल्कुल मत करना,", 3.14),
              ("नहीं तो lifetime", 4.18), ("problem हो सकती है।", 5.34)]},
    {"name": "m1",
     "card": {"lines": [[["पहली", B], ["गलती:", B]], [["Complete", R], ["Bed", R], ["Rest", R]]], "size": 64},
     "ranges": [[11.2, 13.3], [17.40, 20.95], [25.25, 29.40]],
     "caps": [("पहली गलती,", 11.30), ("complete bed rest।", 12.04),
              ("Cesarean section के बाद", 17.45), ("थोड़ा बहुत चलना", 19.12), ("ज़रूरी है।", 20.16),
              ("इससे blood circulation", 25.30), ("बना रहता है", 26.64), ("और constipation भी", 27.44),
              ("नहीं होता है।", 28.66)]},
    {"name": "m2",
     "card": {"lines": [[["दूसरी", B], ["गलती:", B]], [["पानी", R], ["कम", B], ["पीना", B]]], "size": 64},
     "ranges": [[50.95, 59.0], [62.85, 68.45]],
     "caps": [("दूसरी गलती,", 51.0), ("पानी कम पीना।", 51.76),
              ("आप Cesarean section के बाद", 52.72), ("थोड़ा थोड़ा पानी,", 54.52), ("नारियल पानी, soup", 55.62),
              ("ऐसी चीज़ें लेना", 56.88), ("शुरू कर सकते हैं।", 57.92),
              ("पेट साफ रहता है,", 62.90), ("urine infection भी", 64.38), ("कम होता है", 65.66),
              ("और दूध बनने में", 66.32), ("भी मदद मिलती है।", 67.50)]},
    {"name": "m3",
     "card": {"lines": [[["तीसरी", B], ["गलती:", B]], [["कम", R], ["खाना", R], ["या", B], ["सिर्फ", B],
                                                       ["दाल-चावल", R], ["खाना", B]]], "size": 64},
     "ranges": [[71.75, 75.25], [83.90, 94.65]],
     "caps": [("तीसरी गलती,", 71.80), ("कम खाना खाना", 72.50), ("या सिर्फ दाल-चावल खाना।", 73.56),
              ("Cesarean section के बाद", 83.95), ("आपको एक proper diet", 85.12), ("लेनी चाहिए।", 86.36),
              ("आपको उसमें fruits,", 87.45), ("vegetables, fiber", 89.08), ("ये सब include करने चाहिए।", 90.66),
              ("इससे recovery", 92.38), ("अच्छी होती है।", 93.68)]},
    {"name": "m4",
     "card": {"lines": [[["चौथी", B], ["गलती:", B]], [["अपने", B], ["मन", B], ["से", B], ["painkiller", R],
                                                      ["या", B], ["दवाई", R], ["लेना", B]]], "size": 64},
     "ranges": [[97.80, 109.25]],
     "caps": [("चौथी गलती,", 97.85), ("अपने मन से", 98.60), ("कोई भी painkiller", 99.46),
              ("या दवाई ले लेना।", 100.48), ("जो भी आप दवाइयाँ लेते हैं", 101.90), ("वो दूध के ज़रिए", 103.42),
              ("बच्चे तक पहुँचती है,", 104.34), ("इसलिए बिना doctor के पूछे", 105.60), ("कोई भी दवाई", 107.26),
              ("अपने मन से मत लीजिए।", 108.02)]},
    {"name": "cta", "card": None,
     "ranges": [[118.15, 122.9]],
     "caps": [("Cesarean section recovery की", 118.20), ("free guide चाहिए", 120.10), ("तो comment कीजिए", 121.08),
              ("\"C SECTION\"", 122.0)]},
]
END_TAIL = [122.95, 125.2]  # silent speaker footage under the end card


def speech(t0, t1):
    i0, i1 = int(t0 * 100), int(t1 * 100)
    return DB[i0:i1] > THR


def split_range(s, e):
    """Snap to speech and cut internal pauses > MAX_GAP. Returns list of [s,e]."""
    sp = speech(s, e)
    idx = np.where(sp)[0]
    if len(idx) == 0:
        return [[s, e]]
    first, last = idx[0], idx[-1]
    out, cur = [], first
    run_start = None
    for i in range(first, last + 1):
        if not sp[i]:
            if run_start is None:
                run_start = i
        else:
            if run_start is not None and (i - run_start) / 100 > MAX_GAP:
                out.append([cur, run_start])
                cur = i
            run_start = None
    out.append([cur, last + 1])
    res = []
    for j, (a, b) in enumerate(out):
        # keep the hand-picked outer edges (quiet sibilant onsets/tails); only tighten inner pauses
        a_t = s if j == 0 else s + a / 100 - PAD - 0.04
        b_t = e if j == len(out) - 1 else s + b / 100 + PAD
        res.append([a_t, b_t])
    return res


def shots(a, b, cap_times, max_len=3.2):
    """Split a continuous piece into punch-in shots at caption boundaries (no time removed)."""
    cuts = [t for t in cap_times if a + 1.2 < t < b - 1.0]
    pieces, cur = [], a
    for t in cuts:
        if t - cur >= 1.4 and (b - cur) > max_len:
            pieces.append([cur, t]); cur = t
    pieces.append([cur, b])
    return pieces


def main():
    segs, caps, cards, flashes = [], [], [], []
    t_out = 0.0
    zoom_toggle = 0
    mapping = []  # (src_s, src_e, out_s)
    for sec in SECTIONS:
        sec_t0 = t_out
        cap_src = [t for _, t in sec["caps"]]
        first = True
        for rs, re_ in sec["ranges"]:
            for a0, b0 in split_range(rs, re_):
                if b0 - a0 < 0.12:
                    continue
                for a, b in shots(a0, b0, cap_src):
                    # punch-in on each section start, then alternate wide/close every cut
                    if first:
                        z = "close"; zoom_toggle = 1; first = False
                    else:
                        z = "wide" if zoom_toggle % 2 else "close"
                        zoom_toggle += 1
                    segs.append({"s": round(a, 3), "e": round(b, 3), "z": z})
                    mapping.append((a, b, t_out))
                    t_out += b - a
        sec_t1 = t_out
        # captions: map source time -> output time
        def m(ts):
            for a, b, o in mapping:
                if a - 0.001 <= ts < b:
                    return o + ts - a
            # in a cut gap: snap to next kept piece
            nxt = [o for a, b, o in mapping if a >= ts]
            return min(nxt) if nxt else t_out
        times = [max(sec_t0, m(t)) for _, t in sec["caps"]]
        for i, (txt, _) in enumerate(sec["caps"]):
            c0 = times[i]
            c1 = times[i + 1] if i + 1 < len(times) else sec_t1
            if c1 - c0 > 0.05:
                caps.append({"t0": round(c0, 3), "t1": round(c1, 3), "text": txt})
        if sec["card"]:
            cards.append(dict(sec["card"], t0=round(sec_t0 + (0.0 if sec["name"] == "hook" else 0.05), 3),
                              t1=round(sec_t1, 3)))
        if sec["name"] != "hook":
            flashes.append(round(sec_t0, 3))
    end_t0 = t_out
    segs.append({"s": END_TAIL[0], "e": END_TAIL[1], "z": "wide"})
    t_out += END_TAIL[1] - END_TAIL[0]
    ed = {"segments": segs, "captions": caps, "cards": cards, "flashes": flashes[:-1],  # no flash into CTA
          "end": {"t0": round(end_t0, 3), "dur": round(END_TAIL[1] - END_TAIL[0], 3)}}
    json.dump(ed, open(os.path.join(WK, "edit.json"), "w"), ensure_ascii=False, indent=1)
    print(f"segments={len(segs)} total={t_out:.2f}s speech={end_t0:.2f}s cards={len(cards)} caps={len(caps)}")
    for c in cards:
        print("card", c["t0"], c["t1"])
    print("flashes", ed["flashes"])


if __name__ == "__main__":
    main()
