#!/bin/bash
# Instalasi otomatis untuk sesi Claude Code di cloud:
# Node.js 22+ & npm, Python 3 & pip/uv, FFprobe, yt-dlp, ElevenLabs (SDK Python & Node),
# serta dependensi proyek remotion-video.
set -euo pipefail

# Hanya jalan di sesi cloud (bukan di komputer lokal)
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-.}"
export PATH="$HOME/.local/bin:$PATH"
log() { echo "[session-start] $*" >&2; }

# --- Node.js 22+ dan npm (cek saja; image cloud sudah menyediakannya) ---
node_major=$(node -p 'process.versions.node.split(".")[0]' 2>/dev/null || echo 0)
if [ "$node_major" -lt 22 ]; then
  log "PERINGATAN: Node.js 22+ diperlukan, ditemukan: $(node --version 2>/dev/null || echo 'tidak ada')"
fi

# --- Python 3, pip, uv ---
command -v python3 >/dev/null || { log "PERINGATAN: python3 tidak ditemukan"; }
if ! command -v uv >/dev/null; then
  log "Memasang uv..."
  python3 -m pip install --quiet --break-system-packages uv
fi

# --- FFprobe / FFmpeg ---
if ! command -v ffprobe >/dev/null; then
  log "Memasang ffmpeg (termasuk ffprobe)..."
  apt-get update -qq && DEBIAN_FRONTEND=noninteractive apt-get install -y -qq ffmpeg
fi

# --- yt-dlp ---
if ! command -v yt-dlp >/dev/null; then
  log "Memasang yt-dlp..."
  uv tool install --quiet yt-dlp
fi

# --- ElevenLabs SDK Python ---
if ! python3 -c 'import elevenlabs' 2>/dev/null; then
  log "Memasang ElevenLabs SDK (Python)..."
  python3 -m pip install --quiet --break-system-packages elevenlabs
fi

# --- ElevenLabs SDK Node (global) ---
npm_root=$(npm root -g)
if [ ! -d "$npm_root/@elevenlabs/elevenlabs-js" ]; then
  log "Memasang ElevenLabs SDK (Node)..."
  npm install -g --silent --no-fund --no-audit @elevenlabs/elevenlabs-js
fi

# --- Dependensi proyek remotion-video (hanya jika package.json/lock berubah) ---
if [ -f remotion-video/package.json ]; then
  hashes=remotion-video/node_modules/.session-start.sha256
  if ! sha256sum --check --status "$hashes" 2>/dev/null; then
    rm -f "$hashes"
    log "Memasang dependensi remotion-video..."
    (cd remotion-video && npm install --no-fund --no-audit --silent)
    sha256sum .claude/hooks/session-start.sh remotion-video/package.json remotion-video/package-lock.json \
      2>/dev/null > "$hashes" || rm -f "$hashes"
  fi
fi

# --- Variabel lingkungan untuk sesi ---
if [ -n "${CLAUDE_ENV_FILE:-}" ]; then
  {
    echo "export PATH=\"\$HOME/.local/bin:\$PATH\""
    echo "export NODE_PATH=\"$npm_root\${NODE_PATH:+:\$NODE_PATH}\""
  } >> "$CLAUDE_ENV_FILE"
fi

if [ -z "${ELEVENLABS_API_KEY:-}" ]; then
  log "Catatan: ELEVENLABS_API_KEY belum diatur. Tambahkan sebagai secret di pengaturan environment."
fi
