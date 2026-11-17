"""Lukis semula sebahagian gambar (inpainting) - contoh: labuhkan tudung, wajah & latar kekal.
Guna: inpaint.py <folder_model> <tugas.json> <folder_output>
tugas.json: [{"nama": "...", "gambar": "...png", "poligon": [[x,y],...], "prompt": "...", "seeds": [..]}]"""
import json
import os
import sys
import time

import numpy as np
import torch
from diffusers import AutoencoderKL, LCMScheduler, StableDiffusionInpaintPipeline
from PIL import Image, ImageDraw, ImageFilter

model, tugas, out = sys.argv[1], sys.argv[2], sys.argv[3]
os.makedirs(out, exist_ok=True)
NEG = ("cartoon, illustration, deformed, extra fingers, mutated hands, bad anatomy, blurry, low quality, "
       "tight clothes, exposed neck, exposed chest, exposed hair, short hijab, cleavage, visible chest shape, body contour, breasts, tight fabric, form fitting")
torch.set_num_threads(4)
vae = AutoencoderKL.from_pretrained(f"{model}/vae_mse", torch_dtype=torch.float32)
pipe = StableDiffusionInpaintPipeline.from_single_file(
    f"{model}/rv51_inpaint/Realistic_Vision_V5.1_fp16-no-ema-inpainting.safetensors", vae=vae,
    torch_dtype=torch.float32, safety_checker=None, requires_safety_checker=False)
pipe.load_lora_weights(f"{model}/lcm_lora")
pipe.fuse_lora()
pipe.scheduler = LCMScheduler.from_config(pipe.scheduler.config)
pipe.set_progress_bar_config(disable=True)
for t in json.load(open(tugas)):
    img = Image.open(t["gambar"]).convert("RGB")
    mask = Image.new("L", img.size, 0)
    ImageDraw.Draw(mask).polygon([tuple(p) for p in t["poligon"]], fill=255)
    for cx, cy, rx, ry in t.get("kecuali_elips", []):   # wajah: jangan disentuh langsung
        ImageDraw.Draw(mask).ellipse([cx - rx, cy - ry, cx + rx, cy + ry], fill=0)
    mask = mask.filter(ImageFilter.GaussianBlur(6))
    for seed in t["seeds"]:
        s = time.time()
        res = pipe(t["prompt"], negative_prompt=NEG, image=img, mask_image=mask, width=img.width, height=img.height,
                   num_inference_steps=8, guidance_scale=1.6, strength=1.0,
                   generator=torch.Generator().manual_seed(seed)).images[0]
        # kekalkan piksel asal di luar topeng (wajah & latar tak berubah langsung)
        m = np.asarray(mask, dtype=np.float32)[..., None] / 255
        res = Image.fromarray(np.uint8(np.asarray(res) * m + np.asarray(img) * (1 - m)))
        f = os.path.join(out, f"{t['nama']}_s{seed}.png")
        res.save(f)
        print(f, f"{time.time() - s:.0f}s", flush=True)
