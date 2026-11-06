import torch, numpy as np, soundfile as sf, sys, time
from transformers import AutoProcessor, MusicgenForConditionalGeneration
torch.set_num_threads(4)
name = "facebook/musicgen-small"
proc = AutoProcessor.from_pretrained(name, cache_dir="/home/user/work/models/musicgen")
model = MusicgenForConditionalGeneration.from_pretrained(name, cache_dir="/home/user/work/models/musicgen").eval()
prompts = [
 "slow cinematic ambient underscore, warm sustained strings and soft wordless choir pad, reverent, spiritual, peaceful dawn, no drums, no percussion, 60 bpm",
 "calm atmospheric drone pad, gentle middle eastern string ensemble, long notes, soft reverb, contemplative documentary score, no drums, no percussion",
]
for i, p in enumerate(prompts):
    torch.manual_seed(7 + i)
    t = time.time()
    x = proc(text=[p], padding=True, return_tensors="pt")
    with torch.no_grad():
        audio = model.generate(**x, do_sample=True, guidance_scale=3.0, max_new_tokens=1500)
    sr = model.config.audio_encoder.sampling_rate
    sf.write(f"/home/user/work/music/bed_{i}.wav", audio[0, 0].numpy(), sr)
    print("done", i, round(time.time() - t), "s", flush=True)
