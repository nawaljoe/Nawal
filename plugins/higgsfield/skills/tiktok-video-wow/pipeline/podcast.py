"""Suara gaya podcast: kurangkan gema lewat + nyah-bising + EQ + de-esser + kompresor + expander lembut.
Guna: podcast.py <input.wav 48k mono> <output.wav>"""
import os, subprocess, sys, wave
import numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from dereverb import dereverb  # noqa: E402

SR = 48000
w = wave.open(sys.argv[1]); x = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float64) / 32768
y = dereverb(x, SR, rt60=0.5, td=0.05, gmin_db=-10)
tmp = sys.argv[2] + '.dr.wav'
with wave.open(tmp, 'wb') as o:
    o.setnchannels(1); o.setsampwidth(2); o.setframerate(SR)
    o.writeframes(np.int16(np.clip(y, -1, 1) * 32767).tobytes())
chain = ("highpass=f=85,afftdn=nf=-30:nr=10,"
         "equalizer=f=280:t=q:w=1.1:g=-3.5,equalizer=f=140:t=q:w=1:g=1.5,equalizer=f=3800:t=q:w=1:g=2.5,"
         "deesser=i=0.35,acompressor=threshold=-24dB:ratio=3:attack=8:release=160:makeup=4,"
         "agate=threshold=0.012:ratio=1.8:attack=4:release=140:range=0.35")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", tmp, "-af", chain, "-ar", str(SR), "-ac", "1", sys.argv[2]], check=True)
os.remove(tmp)
