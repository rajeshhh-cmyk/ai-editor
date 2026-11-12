import sys, json, wave, numpy as np
def load(f):
    w=wave.open(f); a=np.frombuffer(w.readframes(w.getnframes()),dtype=np.int16).astype(np.float32)/32768; return a
from faster_whisper import WhisperModel
m = WhisperModel("large-v3", device="cpu", compute_type="int8", cpu_threads=4)
for name in sys.argv[1:]:
    segs, info = m.transcribe(load(f"work/{name}16k.wav"), language="hi", word_timestamps=True, beam_size=5, vad_filter=False)
    out=[]
    for s in segs:
        out.append({"start":s.start,"end":s.end,"text":s.text,"words":[{"s":w.start,"e":w.end,"w":w.word} for w in s.words]})
        print(f"[{name}] {s.start:7.2f}-{s.end:7.2f} {s.text}", flush=True)
    json.dump(out, open(f"work/{name}_transcript.json","w"), ensure_ascii=False, indent=1)
