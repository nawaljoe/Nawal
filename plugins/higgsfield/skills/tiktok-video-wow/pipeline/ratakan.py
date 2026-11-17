"""Ratakan bayang kain di satu kawasan (buang lekuk badan): kecerahan dilicinkan kuat, tekstur halus dikekalkan sedikit.
Guna: ratakan.py <input.png> <output.png> <poligon_json> [kekuatan=0.85]"""
import json
import sys

import cv2
import numpy as np

src, out, poly = sys.argv[1], sys.argv[2], json.loads(sys.argv[3])
k = float(sys.argv[4]) if len(sys.argv) > 4 else 0.85
img = cv2.imread(src)
lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB).astype(np.float32)
L = lab[:, :, 0]
mask = np.zeros(L.shape, np.float32)
cv2.fillPoly(mask, [np.int32(poly)], 1.0)
mask = cv2.GaussianBlur(mask, (0, 0), 9)
# purata kecerahan dalam kawasan sahaja (supaya tepi luar tak 'bocor' masuk)
num = cv2.GaussianBlur(L * mask, (0, 0), 28)
den = cv2.GaussianBlur(mask, (0, 0), 28)
smooth = num / np.maximum(den, 1e-3)
flat = np.full_like(L, (L * mask).sum() / max(mask.sum(), 1))
base = 0.6 * smooth + 0.4 * flat                       # kecerahan hampir sekata
detail = L - cv2.GaussianBlur(L, (0, 0), 2.0)          # tekstur kain halus
newL = base + 0.45 * detail
lab[:, :, 0] = L * (1 - k * mask) + newL * (k * mask)
res = cv2.cvtColor(np.clip(lab, 0, 255).astype(np.uint8), cv2.COLOR_LAB2BGR)
cv2.imwrite(out, res)
print(out)
