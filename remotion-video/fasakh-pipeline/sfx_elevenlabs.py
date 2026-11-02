# Regenerate the SFX set with ElevenLabs Sound Effects (needs ELEVENLABS_API_KEY). Output overwrites sfx/*.wav with same names.
import os, json, urllib.request, subprocess, sys
KEY=os.environ.get("ELEVENLABS_API_KEY") or sys.exit("Set ELEVENLABS_API_KEY first")
P={
 "whoosh_soft":("soft airy cinematic whoosh, gentle, warm, subtle transition",0.9),
 "chime_soft":("gentle soft shimmering chime, calm, elegant, short reverb tail",2.4),
 "tick_soft":("soft subtle UI pop click, warm, quiet",0.5),
 "impact_soft":("deep soft cinematic sub boom, calm documentary intro, no distortion",1.8),
 "riser_soft":("short soft airy riser swelling up, gentle, cinematic",1.6),
 "swipe_soft":("soft paper card swipe swoosh, subtle",0.6),
}
os.makedirs("sfx",exist_ok=True)
for name,(text,dur) in P.items():
    req=urllib.request.Request("https://api.elevenlabs.io/v1/sound-generation",method="POST",
        data=json.dumps({"text":text,"duration_seconds":max(dur,0.5),"prompt_influence":0.5}).encode(),
        headers={"xi-api-key":KEY,"Content-Type":"application/json","Accept":"audio/mpeg"})
    mp3=f"sfx/{name}.mp3"; open(mp3,"wb").write(urllib.request.urlopen(req).read())
    subprocess.run(["ffmpeg","-v","error","-y","-i",mp3,"-ar","48000","-ac","2",f"sfx/{name}.wav"],check=True)
    print("ok",name)
