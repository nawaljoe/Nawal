#!/usr/bin/env python3
"""Jernihkan suara secara lokal dengan DeepFilterNet3 (tanpa ElevenLabs).

Pakai:  python3 jernihkan_dfn.py <masuk.wav 48kHz mono> <keluar.wav> [had_redaman_dB] [folder_model]
Model:  config.ini + model.safetensors daripada https://huggingface.co/fal/DeepFilterNet3
Butuh:  pip install deepfilternet safetensors soundfile torch torchaudio
"""
import sys
import types

# torchaudio>=2.9 membuang torchaudio.backend; DeepFilterNet cuma perlukan namanya.
_backend = types.ModuleType("torchaudio.backend")
_common = types.ModuleType("torchaudio.backend.common")
_common.AudioMetaData = type("AudioMetaData", (), {})
_backend.common = _common
sys.modules.setdefault("torchaudio.backend", _backend)
sys.modules.setdefault("torchaudio.backend.common", _common)

import soundfile as sf  # noqa: E402
import torch  # noqa: E402
from df.enhance import enhance, init_df  # noqa: E402
from safetensors.torch import load_file  # noqa: E402


def main() -> None:
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    masuk, keluar = sys.argv[1], sys.argv[2]
    atten = float(sys.argv[3]) if len(sys.argv) > 3 and sys.argv[3] else None
    model_dir = sys.argv[4] if len(sys.argv) > 4 else "DeepFilterNet3"

    model, state, _ = init_df(model_base_dir=model_dir, epoch="none", log_level="ERROR", log_file=None)
    missing, unexpected = model.load_state_dict(load_file(f"{model_dir}/model.safetensors"), strict=False)
    if missing or unexpected:
        sys.exit(f"Berat model tidak sepadan: {missing} {unexpected}")
    model.eval()

    audio, fs = sf.read(masuk, dtype="float32", always_2d=True)
    if fs != state.sr():
        sys.exit(f"Audio mesti {state.sr()} Hz, bukan {fs} Hz")
    with torch.no_grad():
        hasil = enhance(model, state, torch.from_numpy(audio.T.copy()), atten_lim_db=atten)
    sf.write(keluar, hasil.numpy().T, fs)
    print(f"Selesai: {keluar}")


if __name__ == "__main__":
    main()
