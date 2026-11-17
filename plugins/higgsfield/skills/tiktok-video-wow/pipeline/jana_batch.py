"""Jana banyak gambar B-roll realistik (AI) sekali gus: Realistic Vision V5.1 + LCM-LoRA (pantas pada CPU).
Guna: jana_batch.py <folder_model> <senarai.json> <folder_output>
senarai.json: [{"nama": "D1_taktegur", "prompt": "...", "seeds": [1, 2, 3]}, ...]"""
import json
import os
import sys
import time

import torch
from diffusers import AutoencoderKL, LCMScheduler, StableDiffusionPipeline

model, senarai, out = sys.argv[1], sys.argv[2], sys.argv[3]
os.makedirs(out, exist_ok=True)
NEG = ("cartoon, illustration, painting, 3d render, anime, deformed face, disfigured, extra fingers, mutated hands, "
       "bad anatomy, blurry, low quality, watermark, text, logo, revealing clothes, exposed hair, western clothes, man wearing hijab, man wearing headscarf, barefoot, holding hands, hand in hand, old, middle aged, hood, visible chest shape, tight fabric")
torch.set_num_threads(4)
vae = AutoencoderKL.from_pretrained(f"{model}/vae_mse", torch_dtype=torch.float32)
pipe = StableDiffusionPipeline.from_pretrained(f"{model}/rv51", vae=vae, torch_dtype=torch.float32, safety_checker=None,
                                               requires_safety_checker=False)
pipe.load_lora_weights(f"{model}/lcm_lora")
pipe.fuse_lora()
pipe.scheduler = LCMScheduler.from_config(pipe.scheduler.config)
pipe.set_progress_bar_config(disable=True)
for item in json.load(open(senarai)):
    for seed in item["seeds"]:
        t = time.time()
        img = pipe(item["prompt"], negative_prompt=NEG, width=512, height=768, num_inference_steps=7,
                   guidance_scale=1.6, generator=torch.Generator().manual_seed(seed)).images[0]
        f = os.path.join(out, f"{item['nama']}_s{seed}.png")
        img.save(f)
        print(f, f"{time.time() - t:.0f}s", flush=True)
