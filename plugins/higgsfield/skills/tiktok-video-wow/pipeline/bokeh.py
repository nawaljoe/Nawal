"""Kabur latar belakang (portrait mode) guna segmentasi MediaPipe + konvolusi ternormal (tiada halo)."""
import os

import cv2
import mediapipe as mp
import numpy as np
from mediapipe.tasks.python import BaseOptions, vision

# model segmentasi: $MODEL_SEGMEN, atau model/ dalam folder projek (direktori semasa)
MODEL = os.environ.get("MODEL_SEGMEN") or os.path.join(os.getcwd(), "model", "selfie_multiclass_256x256.tflite")


class Bokeh:
    # Kawasan meja (koordinat frame asal 1080x1920, kamera statik) yang kekal tajam
    MEJA = [
        [(815, 1265), (1080, 1235), (1080, 1920), (815, 1920)],          # meja kanan
        [(0, 1795), (1080, 1780), (1080, 1920), (0, 1920)],              # tepi meja depan
        [(0, 1480), (70, 1480), (70, 1920), (0, 1920)],                  # laci kiri
    ]

    def __init__(self, strength=5.0):
        opts = vision.ImageSegmenterOptions(base_options=BaseOptions(model_asset_path=MODEL),
                                            running_mode=vision.RunningMode.IMAGE, output_confidence_masks=True)
        self.seg = vision.ImageSegmenter.create_from_options(opts)
        self.strength = strength
        self.prev = None
        keep = np.zeros((1920 // 4, 1080 // 4), np.float32)
        for poly in self.MEJA:
            cv2.fillPoly(keep, [np.int32(np.array(poly) / 4)], 1.0)
        self.keep = cv2.GaussianBlur(keep, (0, 0), 5)

    def reset(self):
        self.prev = None

    def mask(self, img):
        rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        res = self.seg.segment(mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb))
        person = 1.0 - res.confidence_masks[0].numpy_view().astype(np.float32)   # kelas 0 = latar
        person = cv2.resize(person, (img.shape[1] // 4, img.shape[0] // 4), interpolation=cv2.INTER_LINEAR)
        if self.prev is not None:                       # lancarkan antara frame (elak kelip)
            person = 0.55 * person + 0.45 * self.prev
        self.prev = person
        m = np.clip((person - 0.35) / 0.3, 0, 1)
        m = cv2.GaussianBlur(cv2.dilate(m, np.ones((3, 3), np.uint8)), (0, 0), 0.8)
        if m.shape == self.keep.shape:
            m = np.maximum(m, self.keep)
        return cv2.resize(m, (img.shape[1], img.shape[0]), interpolation=cv2.INTER_LINEAR)

    def __call__(self, img):
        m = self.mask(img)
        h, w = img.shape[:2]
        sw, sh = w // 4, h // 4
        small = cv2.resize(img, (sw, sh), interpolation=cv2.INTER_AREA).astype(np.float32)
        bg = 1 - cv2.resize(m, (sw, sh), interpolation=cv2.INTER_AREA)
        num = cv2.GaussianBlur(small * bg[..., None], (0, 0), self.strength)
        den = cv2.GaussianBlur(bg, (0, 0), self.strength)
        blur = cv2.resize(num / np.maximum(den, 1e-3)[..., None], (w, h), interpolation=cv2.INTER_LINEAR)
        m3 = m[..., None]
        out = img.astype(np.float32) * m3 + blur * (1 - m3)
        return np.uint8(np.clip(out, 0, 255)), m3
