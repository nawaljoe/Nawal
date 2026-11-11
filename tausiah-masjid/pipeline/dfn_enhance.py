import sys, types
# torchaudio>=2.9 dropped torchaudio.backend; DeepFilterNet only needs the type name
m = types.ModuleType("torchaudio.backend.common"); m.AudioMetaData = object
sys.modules["torchaudio.backend"] = types.ModuleType("torchaudio.backend")
sys.modules["torchaudio.backend.common"] = m
import torch, soundfile as sf, numpy as np
from df.enhance import init_df, enhance
src, out, atten = sys.argv[1], sys.argv[2], float(sys.argv[3])
model, state, _ = init_df()
x, sr = sf.read(src, dtype="float32")
assert sr == state.sr(), (sr, state.sr())
a = torch.from_numpy(x[None, :])
y = enhance(model, state, a, atten_lim_db=atten if atten > 0 else None)
sf.write(out, y.squeeze(0).numpy(), sr, subtype="FLOAT")
print("ok", out)
