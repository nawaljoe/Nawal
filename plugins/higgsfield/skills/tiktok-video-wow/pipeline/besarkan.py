"""Besarkan gambar 4x dengan Real-ESRGAN (tambah butiran sebenar, bukan sekadar regang piksel). Diproses ikut jubin.
Guna: besarkan.py <model.pth> <input.png> <output.png>"""
import sys

import cv2
import numpy as np
import torch
from spandrel import ModelLoader

torch.set_num_threads(4)
model = ModelLoader().load_from_file(sys.argv[1]).model.eval()
img = cv2.imread(sys.argv[2])[:, :, ::-1].astype(np.float32) / 255
H, W = img.shape[:2]
S, T, P = 4, 192, 16                     # skala, saiz jubin, tindihan
out = np.zeros((H * S, W * S, 3), np.float32)
wsum = np.zeros((H * S, W * S, 1), np.float32)
with torch.inference_mode():
    for y in range(0, H, T):
        for x in range(0, W, T):
            y0, x0 = max(0, y - P), max(0, x - P)
            y1, x1 = min(H, y + T + P), min(W, x + T + P)
            t = torch.from_numpy(np.ascontiguousarray(img[y0:y1, x0:x1].transpose(2, 0, 1)))[None]
            r = model(t)[0].clamp(0, 1).numpy().transpose(1, 2, 0)
            out[y0 * S:y1 * S, x0 * S:x1 * S] += r
            wsum[y0 * S:y1 * S, x0 * S:x1 * S] += 1
res = out / np.maximum(wsum, 1)
cv2.imwrite(sys.argv[3], np.uint8(np.clip(res[:, :, ::-1] * 255, 0, 255)))
print(sys.argv[3], res.shape)
