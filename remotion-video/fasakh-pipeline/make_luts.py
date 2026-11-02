import numpy as np, sys, os
N=33
out=sys.argv[1]
g=np.linspace(0,1,N)
def smooth_s(x,amt):  # gentle S-curve around 0.5
    return x+amt*(x-0.5)*(1-np.abs(2*x-1))*0.9
def rolloff(x,knee=0.8):  # highlight shoulder
    y=x.copy(); m=x>knee
    y[m]=knee+(1-knee)*np.tanh((x[m]-knee)/(1-knee)*1.2)/np.tanh(1.2)
    return y
def lift(x,l): return l+(1-l)*x
def sat(rgb,s,blue_tame=0.0):
    lum=(0.2126*rgb[...,0]+0.7152*rgb[...,1]+0.0722*rgb[...,2])[...,None]
    o=lum+(rgb-lum)*s
    if blue_tame:
        # reduce saturation of cyan/blue-dominant pixels (very saturated baju)
        b=np.clip((rgb[...,2]-rgb[...,0])*2,0,1)[...,None]
        o=lum+(o-lum)*(1-blue_tame*b)
    return o
def grade(rgb,expo=0,contrast=0,lift_=0,warm=0,tint=0,s=1,blue_tame=0,split=0):
    x=np.clip(rgb*(2**expo),0,1)
    x=rolloff(x)
    x=smooth_s(x,contrast)
    x=lift(x,lift_)
    x=sat(x,s,blue_tame)
    lum=(0.2126*x[...,0]+0.7152*x[...,1]+0.0722*x[...,2])[...,None]
    # warm highlights / slightly cool shadows (split tone)
    hi=lum**1.5; sh=(1-lum)**2
    x=x+np.array([warm,warm*0.35,-warm])*hi + np.array([-split*0.3,split*0.1,split])*sh
    x=x+np.array([tint*0.5,-tint,tint*0.5])
    return np.clip(x,0,1)
C={
 "A_warm_cinematic":dict(expo=0.18,contrast=0.18,lift_=0.025,warm=0.045,s=0.95,blue_tame=0.18,split=0.015),
 "B_soft_premium":dict(expo=0.28,contrast=0.10,lift_=0.03,warm=0.03,s=0.92,blue_tame=0.22,split=0.0),
 "C_rich_contrast":dict(expo=0.12,contrast=0.30,lift_=0.01,warm=0.05,s=1.0,blue_tame=0.12,split=0.02),
 "E_premium":dict(expo=0.0,contrast=0.24,lift_=0.015,warm=0.04,s=0.96,blue_tame=0.22,split=0.02),
 "F_premium":dict(expo=0.0,contrast=0.30,lift_=0.012,warm=0.055,s=1.04,blue_tame=0.06,split=0.025),
 "D_clean_bright":dict(expo=0.35,contrast=0.12,lift_=0.02,warm=0.015,s=0.97,blue_tame=0.15,split=0.0),
}
R,G_,B=np.meshgrid(g,g,g,indexing='ij')
os.makedirs(out,exist_ok=True)
for name,p in C.items():
    # .cube order: R fastest, then G, then B
    rgb=np.stack([R,G_,B],-1)
    o=grade(rgb,**p)
    with open(f"{out}/{name}.cube","w") as f:
        f.write(f'TITLE "{name}"\nLUT_3D_SIZE {N}\n')
        for b in range(N):
            for gg in range(N):
                for r in range(N):
                    v=o[r,gg,b]; f.write(f"{v[0]:.6f} {v[1]:.6f} {v[2]:.6f}\n")
print("ok")
