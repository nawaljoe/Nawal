import json, subprocess, os, sys
from concurrent.futures import ThreadPoolExecutor
C=json.load(open("cuts.json")); K=C["keeps"]
os.makedirs("seg",exist_ok=True)
G="curves=all='0/0.02 0.25/0.21 0.5/0.50 0.78/0.83 1/0.97',colorbalance=rs=-0.03:bs=0.03:rh=0.05:gh=0.02:bh=-0.04,eq=saturation=1.1"
VF=(f"[0:v]hqdn3d=1.5:1.5:4:4,{G},format=gbrp[g];[1:v]format=gbrp[m];[g][m]blend=all_mode=multiply,"
    "colorchannelmixer=rr=1.12:gg=1.12:bb=1.12,scale=1080:1920:flags=lanczos,unsharp=5:5:0.45,format=yuv420p[v]")
def job(i):
    k=K[i]; a,b=k["src_start"],k["src_end"]; d=b-a
    v=f"seg/v{i:03d}.mp4"; w=f"seg/a{i:03d}.wav"
    subprocess.run(["ffmpeg","-v","error","-y","-ss",f"{a:.3f}","-i","src/video.mp4","-loop","1","-i","frames/relight_mask.png",
        "-t",f"{d:.3f}","-filter_complex",VF,"-map","[v]","-an","-r","30","-c:v","libx264","-preset","medium","-crf","14",v],check=True)
    fo=max(d-0.012,0)
    subprocess.run(["ffmpeg","-v","error","-y","-ss",f"{a:.3f}","-i","src/video.mp4","-t",f"{d:.3f}","-vn",
        "-af",f"afade=t=in:d=0.012,afade=t=out:st={fo:.3f}:d=0.012","-ar","48000","-ac","2","-c:a","pcm_s16le",w],check=True)
    return i
with ThreadPoolExecutor(2) as ex:
    for i in ex.map(job,range(len(K))): print("seg",i,flush=True)
open("seg/v.txt","w").write("".join(f"file 'v{i:03d}.mp4'\n" for i in range(len(K))))
open("seg/a.txt","w").write("".join(f"file 'a{i:03d}.wav'\n" for i in range(len(K))))
subprocess.run("ffmpeg -v error -y -f concat -safe 0 -i seg/v.txt -c copy base_video.mp4",shell=True,check=True)
subprocess.run("ffmpeg -v error -y -f concat -safe 0 -i seg/a.txt -c copy voice_raw.wav",shell=True,check=True)
print("DONE")
