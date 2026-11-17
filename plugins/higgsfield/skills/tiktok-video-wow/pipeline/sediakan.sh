#!/usr/bin/env bash
# Sediakan alat untuk pipeline (sekali setiap sesi baharu). Guna: sediakan.sh <folder_projek> [ai]
#   tanpa 'ai' : pakej asas + font + model segmentasi (cukup untuk edit penuh tanpa gambar AI)
#   dengan 'ai': tambah PyTorch CPU + model Stable Diffusion/inpainting/LCM + Real-ESRGAN (~7 GB)
set -euo pipefail
P=$(mkdir -p "$1" && cd "$1" && pwd)
mkdir -p "$P/fonts" "$P/model"
pip install -q faster-whisper opencv-python-headless mediapipe scipy numpy pillow
command -v apt-get >/dev/null && (apt-get install -y -q libegl1 libgles2 >/dev/null 2>&1 \
  || (apt-get update -q >/dev/null && apt-get install -y -q libegl1 libgles2 >/dev/null)) || true
for w in Regular Medium SemiBold Bold ExtraBold; do
  [ -f "$P/fonts/Poppins-$w.ttf" ] || curl -sSL -o "$P/fonts/Poppins-$w.ttf" \
    "https://raw.githubusercontent.com/google/fonts/main/ofl/poppins/Poppins-$w.ttf"
done
[ -f "$P/model/selfie_multiclass_256x256.tflite" ] || curl -sSL -o "$P/model/selfie_multiclass_256x256.tflite" \
  "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_multiclass_256x256/float32/latest/selfie_multiclass_256x256.tflite"
if [ "${2:-}" = "ai" ]; then
  pip install -q torch torchvision --index-url https://download.pytorch.org/whl/cpu
  pip install -q diffusers transformers accelerate safetensors peft spandrel
  python3 -I - "$P/model" <<'PY'
import sys
from huggingface_hub import hf_hub_download, snapshot_download
m = sys.argv[1]
snapshot_download('SG161222/Realistic_Vision_V5.1_noVAE', local_dir=f'{m}/rv51',
                  allow_patterns=['model_index.json', 'scheduler/*', 'text_encoder/*', 'tokenizer/*', 'unet/*', 'vae/*'])
hf_hub_download('SG161222/Realistic_Vision_V5.1_noVAE', 'Realistic_Vision_V5.1_fp16-no-ema-inpainting.safetensors',
                local_dir=f'{m}/rv51_inpaint')
snapshot_download('stabilityai/sd-vae-ft-mse', local_dir=f'{m}/vae_mse', allow_patterns=['config.json', '*.safetensors'])
snapshot_download('latent-consistency/lcm-lora-sdv1-5', local_dir=f'{m}/lcm_lora', allow_patterns=['*.safetensors', '*.json'])
hf_hub_download('lllyasviel/Annotators', 'RealESRGAN_x4plus.pth', local_dir=f'{m}/esrgan')
PY
fi
echo "Sedia: $P (fonts/, model/)"
