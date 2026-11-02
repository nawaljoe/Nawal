# Calm podcast bed, synthesised (no samples, no licence issues): warm pad + soft felt-piano arpeggio + sub, long reverb.
import numpy as np, wave, sys
SR=44100; DUR=float(sys.argv[2]); OUT=sys.argv[1]
rng=np.random.default_rng(3)
N=int(SR*DUR); L=np.zeros(N); R=np.zeros(N)
bpm=68; beat=60/bpm; bar=4*beat; chord_len=2*bar
def hz(m): return 440*2**((m-69)/12)
# Fmaj7, Am7, Dm9, Bbmaj7 (voiced around middle register)
CH=[[53,57,60,64],[57,60,64,67],[50,57,60,64,65],[46,57,62,65]]
ROOT=[41,45,38,46]
def env_adsr(n,a,r):
    e=np.ones(n); ai=min(int(a*SR),n//2); ri=min(int(r*SR),n-ai)
    e[:ai]=np.linspace(0,1,ai)**2; e[-ri:]*=np.linspace(1,0,ri)**2; return e
from scipy.signal import lfilter
def onepole(x,fc):
    a=np.exp(-2*np.pi*fc/SR); return lfilter([1-a],[1,-a],x)
t_all=np.arange(N)/SR
pos=0.0; ci=0
while pos<DUR:
    notes=CH[ci%4]; n0=int(pos*SR); n=min(int((chord_len+1.5)*SR),N-n0)
    if n<=0: break
    tt=np.arange(n)/SR; e=env_adsr(n,1.8,2.2)
    for m in notes:
        f=hz(m)
        for det,pan in ((-0.12,0.3),(0.12,0.7)):
            s=np.sin(2*np.pi*(f+det)*tt)+0.25*np.sin(2*np.pi*2*(f+det)*tt)+0.08*np.sin(2*np.pi*3*(f+det)*tt)
            s*=e*0.05*(1+0.15*np.sin(2*np.pi*0.13*tt+m))
            L[n0:n0+n]+=s*(1-pan); R[n0:n0+n]+=s*pan
    # sub root
    f=hz(ROOT[ci%4]); s=np.sin(2*np.pi*f*tt)*e*0.06
    L[n0:n0+n]+=s; R[n0:n0+n]+=s
    # felt piano arpeggio: sparse eighths, gentle velocity
    pattern=[0,2,1,3,2,1,3,2]
    for b in range(int(chord_len/(beat/2))):
        if rng.random()<0.35: continue
        m=notes[pattern[b%8]%len(notes)]+12
        st=n0+int(b*beat/2*SR); ln=int(2.2*SR)
        if st+ln>N: continue
        tp=np.arange(ln)/SR; f=hz(m); vel=0.035+0.02*rng.random()
        tone=sum(a*np.sin(2*np.pi*f*k*tp)*np.exp(-tp*(2.2+1.6*k)) for k,a in [(1,1),(2,0.35),(3,0.12),(4,0.05)])
        tone*=np.minimum(tp/0.006,1)*vel
        pan=0.35+0.3*rng.random()
        L[st:st+ln]+=tone*(1-pan); R[st:st+ln]+=tone*pan
    pos+=chord_len; ci+=1
# warm low-pass (felt), then synthetic hall reverb
L=onepole(L,3200); R=onepole(R,3200)
irn=int(2.8*SR); ti=np.arange(irn)/SR
def ir(seed):
    g=np.random.default_rng(seed).standard_normal(irn)*np.exp(-ti*2.4)
    return onepole(g,4500)
def conv(x,h):
    n=len(x)+len(h)-1; nf=1<<(n-1).bit_length()
    return np.fft.irfft(np.fft.rfft(x,nf)*np.fft.rfft(h,nf),nf)[:len(x)]
wl=conv(L,ir(1)); wr=conv(R,ir(2))
wl/=np.max(np.abs(wl))+1e-9; wr/=np.max(np.abs(wr))+1e-9
dl=L/np.max(np.abs(L)); dr=R/np.max(np.abs(R))
L=0.62*dl+0.5*wl; R=0.62*dr+0.5*wr
fade=np.minimum(np.minimum(t_all/2.0,1),np.minimum((DUR-t_all)/4.0,1))
L*=fade; R*=fade
m=max(np.max(np.abs(L)),np.max(np.abs(R))); L/=m/0.8; R/=m/0.8
w=wave.open(OUT,"wb"); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((np.stack([L,R],1)*32767).astype(np.int16).tobytes()); w.close(); print("ok")
