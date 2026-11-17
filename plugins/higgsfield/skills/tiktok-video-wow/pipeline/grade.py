"""Gred warna 'ambient soft premium': kontras lembut, hangat, bloom halus, cahaya tingkap, vignette."""
import cv2
import numpy as np

W, H = 1080, 1920


def _lut():
    x = np.arange(256) / 255.0
    s = x * x * (3 - 2 * x)
    y = 0.72 * x + 0.28 * s                                   # kontras lembut di tona tengah
    y = np.where(y > 0.78, 0.78 + (y - 0.78) * 0.7, y)        # gulung highlight (tingkap)
    y = 0.012 + 0.988 * y
    r, g, b = np.clip(y * 1.03, 0, 1), np.clip(y * 1.0, 0, 1), np.clip(y * 0.945, 0, 1)
    return [np.uint8(np.round(c * 255)) for c in (b, g, r)]


LUT = cv2.merge(_lut()).reshape(256, 1, 3)
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
_d = np.sqrt(((xx - W / 2) / (W * 0.62)) ** 2 + ((yy - H * 0.42) / (H * 0.62)) ** 2)
VIGNETTE = (1 - 0.26 * np.clip(_d - 0.42, 0, 1) ** 1.5)[..., None].astype(np.float32)
_l = np.clip(1 - np.sqrt(((xx - W * 0.35) / (W * 0.9)) ** 2 + ((yy - H * 0.08) / (H * 0.55)) ** 2), 0, 1) ** 2
LEAK = (_l[..., None] * np.float32([0.55, 0.78, 1.0]) * 0.06).astype(np.float32)   # BGR hangat
WARM = np.float32([0.80, 0.92, 1.0])


def grade(img):
    out = cv2.LUT(img, LUT).astype(np.float32) * (1 / 255)
    small = cv2.resize(out, (W // 4, H // 4), interpolation=cv2.INTER_AREA)
    lum = small.mean(axis=2, keepdims=True)
    bloom = cv2.GaussianBlur(np.clip(lum - 0.62, 0, 1) * 2.2 * WARM, (0, 0), 10)
    bloom = cv2.resize(bloom, (W, H), interpolation=cv2.INTER_LINEAR)
    out = 1 - (1 - out) * (1 - 0.11 * bloom) * (1 - LEAK)     # screen: bloom + cahaya tingkap
    g = out.mean(axis=2, keepdims=True)
    out = (g + (out - g) * 1.07) * VIGNETTE                   # tepu sedikit + vignette
    return np.uint8(np.clip(out * 255, 0, 255))


def grade_ringan(img):
    """Untuk B-roll: padankan warna & vignette sahaja, tanpa glow (kekal tajam)."""
    out = cv2.LUT(img, LUT).astype(np.float32) * (1 / 255)
    return np.uint8(np.clip(out * VIGNETTE * 255, 0, 255))
