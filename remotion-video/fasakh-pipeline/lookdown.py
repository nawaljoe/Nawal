# Detect when the ustaz looks down (reading notes) using MediaPipe Face Landmarker blendshapes + head pitch.
import subprocess, json, sys, numpy as np, mediapipe as mp
from mediapipe.tasks import python as mpt
from mediapipe.tasks.python import vision
VID, MODEL, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
FPS=10; W,H=540,960
opts=vision.FaceLandmarkerOptions(base_options=mpt.BaseOptions(model_asset_path=MODEL),running_mode=vision.RunningMode.VIDEO,
    output_face_blendshapes=True,output_facial_transformation_matrixes=True,num_faces=1)
lm=vision.FaceLandmarker.create_from_options(opts)
p=subprocess.Popen(["ffmpeg","-v","error","-i",VID,"-vf",f"fps={FPS},scale={W}:{H}","-f","rawvideo","-pix_fmt","rgb24","-"],stdout=subprocess.PIPE)
rows=[];i=0
while True:
    buf=p.stdout.read(W*H*3)
    if len(buf)<W*H*3: break
    img=mp.Image(image_format=mp.ImageFormat.SRGB,data=np.frombuffer(buf,np.uint8).reshape(H,W,3))
    r=lm.detect_for_video(img,int(i*1000/FPS))
    t=i/FPS
    if r.face_blendshapes:
        b={c.category_name:c.score for c in r.face_blendshapes[0]}
        M=np.array(r.facial_transformation_matrixes[0])
        pitch=float(np.degrees(np.arctan2(-M[2,1],M[2,2])))
        rows.append([t,b["eyeLookDownLeft"],b["eyeLookDownRight"],b["eyeBlinkLeft"],b["eyeBlinkRight"],pitch])
    else: rows.append([t,np.nan,np.nan,np.nan,np.nan,np.nan])
    i+=1
np.save(OUT,np.array(rows)); print("frames",i)
