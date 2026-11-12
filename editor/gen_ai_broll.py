"""Generate AI B-roll stills (SDXL-Turbo, CPU) for the top band. Usage: gen_ai_broll.py [name ...]"""
import os, sys, time, torch
from diffusers import AutoPipelineForText2Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "broll/ai")
os.makedirs(OUT, exist_ok=True)

STYLE = ("photorealistic, candid documentary photo, soft natural window light, clean modern Indian private hospital, "
         "warm gentle colours, shallow depth of field, 35mm lens, high detail")
SCENES = {
    "hook_a": "young Indian mother resting in a hospital bed after a caesarean delivery, holding her newborn baby wrapped "
              "in a white blanket, smiling Indian nurse in blue scrubs beside the bed, IV stand",
    "m1_a": "Indian nurse in blue scrubs supporting a young Indian new mother in a hospital gown as she walks slowly "
            "down a bright hospital corridor, holding her arm",
    "m1_b": "young Indian new mother in a hospital gown taking slow careful steps beside her hospital bed, holding the "
            "bed rail, nurse watching, recovery room",
    "m2_a": "young Indian new mother sitting up in a hospital bed drinking water from a glass, bowl of soup and a green "
            "coconut with straw on the bedside table",
    "m2_b": "close-up of a green tender coconut with a straw, a glass of water and a bowl of vegetable soup on a hospital "
            "bedside table, new mother blurred in background",
    "m3_a": "healthy Indian meal on a hospital tray: yellow dal, two rotis, green vegetable sabzi, fresh fruit bowl and "
            "salad, top-down view, steel bowls",
    "m3_b": "young Indian new mother in a hospital bed eating a balanced meal of roti, dal, vegetables and fruits from a "
            "tray, smiling",
    "m4_a": "Indian lady doctor in white coat explaining a medicine prescription to a young Indian new mother holding her "
            "newborn baby in a hospital room, tablets on the table",
    "m4_b": "young Indian mother breastfeeding her newborn baby in a hospital bed, covered with a soft shawl, peaceful, "
            "modest, medicine strips on bedside table",
}
NEG = "text, watermark, logo, letters, deformed hands, extra fingers, distorted face, cartoon, blurry, nsfw"


def main(names):
    torch.set_num_threads(os.cpu_count())
    pipe = AutoPipelineForText2Image.from_pretrained("stabilityai/sdxl-turbo", torch_dtype=torch.bfloat16,
                                                     variant="fp16")
    pipe.set_progress_bar_config(disable=True)
    for n in names:
        for seed in (1, 2):
            path = f"{OUT}/{n}_{seed}.png"
            if os.path.exists(path):
                continue
            t = time.time()
            g = torch.Generator().manual_seed(seed * 1000 + hash(n) % 997)
            im = pipe(prompt=f"{SCENES[n]}, {STYLE}", negative_prompt=NEG, num_inference_steps=4,
                      guidance_scale=0.0, width=1024, height=576, generator=g).images[0]
            im.save(path)
            print(f"{n}_{seed} {time.time() - t:.0f}s", flush=True)


if __name__ == "__main__":
    main(sys.argv[1:] or list(SCENES))
