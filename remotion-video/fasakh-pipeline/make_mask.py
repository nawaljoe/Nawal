# Relight mask (720x1280): multiply layer. 1.0 = untouched; <1 darkens.
import numpy as np, sys
from PIL import Image
W,H=720,1280
y,x=np.mgrid[0:H,0:W].astype(np.float32)
# soft elliptical pool of light centred on face/upper body
cx,cy=360,600
d=np.sqrt(((x-cx)/360)**2+((y-cy)/600)**2)
pool=np.clip(1-(d-0.30)/0.85,0,1); pool=pool*pool*(3-2*pool)
m=0.66+0.34*pool
# extra darkening for bright cabinets at the top
top=np.clip((y-0)/380,0,1); top=top*top*(3-2*top)
m*=0.80+0.20*top
# slight bottom fade (desk edge)
bot=np.clip((H-y)/260,0,1); m*=0.82+0.18*bot
Image.fromarray((np.clip(m,0,1)*255).astype(np.uint8)).convert("RGB").save(sys.argv[1])
