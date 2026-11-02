# Soft, vibe-safe SFX synthesised from scratch (48 kHz stereo). Replace with ElevenLabs takes via sfx_elevenlabs.py when a key is available.
import numpy as np, wave, sys, os
SR=48000; rng=np.random.default_rng(7); out=sys.argv[1]
def save(name,x):
    x=x/ (np.max(np.abs(x))+1e-9)*0.89
    if x.ndim==1: x=np.stack([x,x],1)
    w=wave.open(f"{out}/{name}.wav","wb"); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((x*32767).astype(np.int16).tobytes()); w.close()
def t(d): return np.arange(int(SR*d))/SR
def lp(x,fc):  # one-pole low-pass, fc may be array
    fc=np.broadcast_to(fc,x.shape); y=np.zeros_like(x); a=0.0
    k=1-np.exp(-2*np.pi*fc/SR)
    for i in range(len(x)): a+=k[i]*(x[i]-a); y[i]=a
    return y
def hp(x,fc): return x-lp(x,fc)
def stereo_widen(x,ms=7):
    d=int(SR*ms/1000); r=np.r_[np.zeros(d),x[:-d]]; return np.stack([x,r],1)
# 1. soft air whoosh (0.9s) — noise through a sweeping low-pass, bell envelope
T=t(0.9); n=rng.standard_normal(len(T))
env=np.sin(np.pi*np.clip(T/0.9,0,1))**2.2
fc=400+3800*np.sin(np.pi*T/0.9)**1.5
w=hp(lp(n,fc),180)*env
save("whoosh_soft",stereo_widen(w))
# 2. shimmer chime (2.4s) — soft bell partials, slow decay, gentle detune
T=t(2.4); x=np.zeros_like(T)
for f,a,dec in [(880,1,1.6),(1320,0.5,1.2),(1760,0.35,0.9),(2640,0.18,0.6),(3520,0.08,0.4)]:
    for det in (-1.5,1.5): x+=a*np.sin(2*np.pi*(f+det)*T)*np.exp(-T/dec)
x*=np.minimum(T/0.012,1)
save("chime_soft",stereo_widen(x,11))
# 3. tick (checklist pop) — short warm blip
T=t(0.25); x=np.sin(2*np.pi*(1200*np.exp(-T*9))*T)*np.exp(-T*28)+0.4*np.sin(2*np.pi*600*T)*np.exp(-T*35)
x*=np.minimum(T/0.002,1); save("tick_soft",x)
# 4. low cinematic impact (1.8s) — sub thump + airy tail
T=t(1.8); f=48+60*np.exp(-T*12)
sub=np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-T*2.6)
air=lp(rng.standard_normal(len(T)),900)*np.exp(-T*3.5)*0.25
x=(sub+air)*np.minimum(T/0.004,1); save("impact_soft",stereo_widen(x,4))
# 5. riser (1.6s) — swelling filtered noise + rising tone
T=t(1.6); n=rng.standard_normal(len(T)); env=(T/1.6)**2.5
x=hp(lp(n,300+5000*(T/1.6)**2),250)*env + 0.25*np.sin(2*np.pi*np.cumsum(220+440*(T/1.6)**2)/SR)*env
x*=np.minimum((1.6-T)/0.03,1); save("riser_soft",stereo_widen(x,9))
# 6. page swipe (0.5s) for cards
T=t(0.5); n=rng.standard_normal(len(T)); env=np.sin(np.pi*T/0.5)**3
x=hp(lp(n,2500+3000*T/0.5),600)*env; save("swipe_soft",stereo_widen(x,5))
print("ok")
