# 👋 Hai, saya Nawal

### 🛠️ Kemahiran Saya / My Skills:
- **Bahasa Pengaturcaraan:** HTML, CSS, JavaScript, Python
- **Teknologi & Alatan:** GitHub, Claude AI, ChatGPT, Higgsfield AI (video & gambar AI)
- **Kemahiran Lain:** Reka Bentuk Grafik, Prompt Engineering

### 🔌 Plugin Claude Code
- **higgsfield** — jana gambar & video Higgsfield AI terus (jika connector Higgsfield disambung), atau tulis prompt siap tampal.
  Sambung connector: claude.ai → Settings → Connectors → *Add custom connector* → URL `https://mcp.higgsfield.ai/mcp`.
- **tiktok-video-wow** (dalam plugin `higgsfield`) — kaji video mentah dan hasilkan pelan suntingan TikTok (hook, timeline, CapCut, babak Higgsfield).
- **efek-video** (dalam plugin `higgsfield`) — katalog 20 efek: orbit, chat take over, frame escape, snap zoom, checklist pop, headline storm, zoom portal, growth curve, studio reveal, b-roll overlay, paper cutout, dolly zoom, magazine cover, liquid glass, zoom through cut, green screen, frame break, digital zoom, phone mockup, checklist — langkah CapCut, prompt Higgsfield & resipi ffmpeg.
- **edit-temubual-tiktok** (plugin `temubual-tiktok`) — sunting video temu bual mentah jadi TikTok premium gaya podcast: transkrip Whisper BM, buang "aaa/emm" & gagap, beep + kad soalan pop-up, warna studio cerah, kulit licin, kapsyen kinetik, infografik, kesan bunyi, logo & outro FK. Contoh penuh: `tiktok-sijil-halal/`.
- **infografik-johor-pptx** (plugin `infografik-kerajaan`) — bina slaid infografik premium Kerajaan Negeri Johor daripada dokumen sumber (navy/emas, logo Belanjawan Johor): PNG 4:5 atau PPTX 16:9 boleh sunting, jadual sebenar, ruang gambar, potret bulat, kod QR, serta PPTX satu-slaid yang boleh diimport & disunting dalam Canva. Contoh penuh: `infografik-a203/`.
- **hyperframes** — plugin rasmi [HyperFrames oleh HeyGen](https://github.com/heygen-com/hyperframes): tulis HTML, render jadi video (animasi GSAP, kapsyen, suara latar). Diambil terus dari repo HeyGen, jadi sentiasa versi terkini. Guna dengan `/hyperframes:hyperframes`.

Pasang dalam Claude Code:

```
/plugin install higgsfield --marketplace nawaljoe/Nawal
/plugin install temubual-tiktok --marketplace nawaljoe/Nawal
/plugin install infografik-kerajaan --marketplace nawaljoe/Nawal
/plugin install hyperframes --marketplace nawaljoe/Nawal
```

### ⚙️ Instalasi Otomatis (sesi Claude Code cloud)
Setiap sesi cloud menjalankan `.claude/hooks/session-start.sh` yang memastikan alat berikut tersedia:
Node.js 22+ & npm, Python 3 & pip/uv, FFprobe/FFmpeg, yt-dlp, ElevenLabs SDK (Python & Node), serta dependensi `remotion-video`.
Untuk ElevenLabs, tambahkan `ELEVENLABS_API_KEY` sebagai secret di pengaturan environment.

---
*Profil ini dibina khas untuk rujukan pembantu AI saya (Claude).*
