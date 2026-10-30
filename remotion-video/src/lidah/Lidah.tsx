import React, { useEffect, useState } from "react";
import {
  AbsoluteFill,
  Audio,
  continueRender,
  delayRender,
  interpolate,
  interpolateColors,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Character, Pose } from "./Character";
import data from "./timeline.json";

type Word = { w: string; f: number };
type Seg = { id: string; start: number; frames: number; words: Word[] };

const SEGS = data.segments as Seg[];
export const TOTAL_FRAMES = data.totalFrames;
const seg = (id: string) => SEGS.find((s) => s.id === id)!;
const end = (id: string) => seg(id).start + seg(id).frames;
const norm = (w: string) => w.toLowerCase().replace(/[^a-z'-]/g, "");
const wf = (id: string, w: string, nth = 0) => {
  const hits = seg(id).words.filter((x) => norm(x.w) === norm(w));
  return (hits[nth] ?? hits[0])?.f ?? seg(id).start;
};

const SANS = "Baloo2, sans-serif";
const ARAB = "Amiri, serif";
const INK = "#20263a";

const SCENES = [
  { id: "tajuk", from: 0, to: seg("amanah").start - 10, bg: ["#7fe3cf", "#23857f"] },
  { id: "amanah", from: seg("amanah").start - 10, to: seg("ayat").start - 10, bg: ["#ffd978", "#f08c3c"] },
  { id: "ayat", from: seg("ayat").start - 10, to: seg("hadis").start - 10, bg: ["#a8dcff", "#3a74c9"] },
  { id: "hadis", from: seg("hadis").start - 10, to: seg("kotor").start - 10, bg: ["#c3f2c9", "#2f9a62"] },
  { id: "kotor", from: seg("kotor").start - 10, to: seg("tanya0").start - 10, bg: ["#ffbca6", "#d9534f"] },
  { id: "tanya", from: seg("tanya0").start - 10, to: seg("jaga").start - 10, bg: ["#dccbff", "#7254d0"] },
  { id: "jaga", from: seg("jaga").start - 10, to: seg("penutup").start - 10, bg: ["#8ce6d6", "#24867c"] },
  { id: "penutup", from: seg("penutup").start - 10, to: TOTAL_FRAMES, bg: ["#ffe8ad", "#e3962f"] },
];

const SCHEDULE: { f: number; pose: Pose }[] = [
  { f: 0, pose: "rest" },
  { f: 16, pose: "wave" },
  { f: wf("tajuk", "Hindari") - 6, pose: "open" },
  { f: seg("amanah").start, pose: "point" },
  { f: seg("ayat").start, pose: "chest" },
  { f: seg("hadis").start, pose: "open" },
  { f: wf("hadis", "Sesiapa"), pose: "point" },
  { f: seg("kotor").start, pose: "stop" },
  { f: wf("kotor", "Sebaliknya"), pose: "thumb" },
  { f: seg("tanya0").start, pose: "think" },
  { f: seg("tanya5").start, pose: "chest" },
  { f: seg("jaga").start, pose: "point" },
  { f: seg("penutup").start, pose: "open" },
  { f: end("penutup") + 6, pose: "wave" },
];

const useFonts = () => {
  const [handle] = useState(() => delayRender("fonts"));
  useEffect(() => {
    const faces = [
      new FontFace("Baloo2", `url(${staticFile("lidah/fonts/baloo-2-latin-800-normal.woff2")})`, { weight: "800" }),
      new FontFace("Baloo2", `url(${staticFile("lidah/fonts/baloo-2-latin-600-normal.woff2")})`, { weight: "600" }),
      new FontFace("Amiri", `url(${staticFile("lidah/fonts/amiri-arabic-700-normal.woff2")})`, { weight: "700" }),
    ];
    Promise.all(faces.map((f) => f.load()))
      .then((loaded) => {
        loaded.forEach((f) => document.fonts.add(f));
        continueRender(handle);
      })
      .catch((e) => {
        console.error(e);
        continueRender(handle);
      });
  }, [handle]);
};

const usePop = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (at: number, damping = 11) => spring({ frame: frame - at, fps, config: { damping } });
};

/* ---------------- latar ---------------- */

const Star: React.FC<{ x: number; y: number; s: number; o: number; rot: number }> = ({ x, y, s, o, rot }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={o}>
    <rect x={-30} y={-30} width={60} height={60} fill="none" stroke="#fff" strokeWidth={5} />
    <rect x={-30} y={-30} width={60} height={60} fill="none" stroke="#fff" strokeWidth={5} transform="rotate(45)" />
  </g>
);

const Background: React.FC = () => {
  const frame = useCurrentFrame();
  let i = 0;
  while (i + 1 < SCENES.length && SCENES[i + 1].from <= frame) i++;
  const prev = SCENES[Math.max(0, i - 1)];
  const t = interpolate(frame, [SCENES[i].from, SCENES[i].from + 24], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const top = interpolateColors(t, [0, 1], [prev.bg[0], SCENES[i].bg[0]]);
  const bot = interpolateColors(t, [0, 1], [prev.bg[1], SCENES[i].bg[1]]);
  const stars = Array.from({ length: 18 }, (_, k) => {
    const x = (k * 263) % 1080;
    const y = ((k * 397 + 120) % 2100) - ((frame * (0.6 + (k % 4) * 0.25)) % 2100);
    return { x, y: y < -100 ? y + 2100 : y, s: 0.5 + (k % 5) * 0.25, o: 0.1 + (k % 3) * 0.05, rot: frame * (k % 2 ? 0.4 : -0.3) + k * 20 };
  });
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${top} 0%, ${bot} 100%)` }}>
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        {stars.map((s, k) => (
          <Star key={k} {...s} />
        ))}
        <circle cx={540} cy={2350} r={900} fill="rgba(255,255,255,0.16)" />
        <circle cx={540} cy={2420} r={860} fill="rgba(255,255,255,0.14)" />
      </svg>
    </AbsoluteFill>
  );
};

/* ---------------- bahan umum ---------------- */

const SceneShell: React.FC<{ from: number; to: number; children: React.ReactNode }> = ({ from, to, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < from || frame >= to) return null;
  const inn = spring({ frame: frame - from, fps, config: { damping: 14 } });
  const out = interpolate(frame, [to - 12, to], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill
      style={{
        opacity: Math.min(inn * 1.4, 1) * out,
        transform: `translateY(${(1 - inn) * 120 + (1 - out) * -60}px) scale(${0.92 + inn * 0.08})`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

const Card: React.FC<{ top: number; height?: number; bg?: string; border?: string; children: React.ReactNode }> = ({
  top,
  height,
  bg = "#fffaf0",
  border = "#ffffff",
  children,
}) => (
  <div
    style={{
      position: "absolute",
      left: 60,
      right: 60,
      top,
      height,
      background: bg,
      borderRadius: 48,
      border: `8px solid ${border}`,
      boxShadow: "0 24px 0 rgba(0,0,0,0.12), 0 30px 60px rgba(0,0,0,0.18)",
      padding: "44px 48px",
      boxSizing: "border-box",
      fontFamily: SANS,
      color: INK,
    }}
  >
    {children}
  </div>
);

const Chip: React.FC<{ color: string; children: React.ReactNode; style?: React.CSSProperties }> = ({
  color,
  children,
  style,
}) => (
  <div
    style={{
      display: "inline-block",
      background: color,
      color: "#fff",
      fontFamily: SANS,
      fontWeight: 800,
      fontSize: 40,
      padding: "8px 30px 2px",
      borderRadius: 999,
      ...style,
    }}
  >
    {children}
  </div>
);

/** Teks yang kata-katanya menyala mengikut suara (karaoke). */
const Karaoke: React.FC<{
  id: string;
  fromWord: string;
  text: string;
  size: number;
  on?: string;
  off?: string;
  weight?: number;
}> = ({ id, fromWord, text, size, on = INK, off = "rgba(32,38,58,0.28)", weight = 800 }) => {
  const frame = useCurrentFrame();
  const words = seg(id).words;
  const k = Math.max(0, words.findIndex((w) => norm(w.w) === norm(fromWord)));
  return (
    <div style={{ fontFamily: SANS, fontWeight: weight, fontSize: size, lineHeight: 1.18 }}>
      {text.split(" ").map((w, i) => {
        const at = words[Math.min(k + i, words.length - 1)].f;
        const lit = interpolate(frame, [at - 2, at + 4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return (
          <span key={i} style={{ color: interpolateColors(lit, [0, 1], [off, on]) }}>
            {w}{" "}
          </span>
        );
      })}
    </div>
  );
};

const Arabic: React.FC<{ text: string; from: number; size: number; color: string }> = ({ text, from, size, color }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ direction: "rtl", textAlign: "center", fontFamily: ARAB, fontWeight: 700, fontSize: size, lineHeight: 1.75, color }}>
      {text.split(" ").map((w, i) => {
        const o = interpolate(frame, [from + i * 6, from + i * 6 + 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return (
          <span key={i} style={{ opacity: o, display: "inline-block", transform: `translateY(${(1 - o) * 24}px)` }}>
            {w}&nbsp;
          </span>
        );
      })}
    </div>
  );
};

/** Kapsyen bawah: kumpulan kata yang sedang dibaca. */
const Caption: React.FC<{ ids: string[] }> = ({ ids }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = ids.map(seg).find((x) => frame >= x.start - 4 && frame < x.start + x.frames + 8);
  if (!s) return null;
  const chunks: Word[][] = [];
  let cur: Word[] = [];
  for (const w of s.words) {
    const len = cur.reduce((n, x) => n + x.w.length + 1, 0);
    if (cur.length && len + w.w.length > 22) {
      chunks.push(cur);
      cur = [];
    }
    cur.push(w);
  }
  if (cur.length) chunks.push(cur);
  let c = 0;
  while (c + 1 < chunks.length && chunks[c + 1][0].f - 2 <= frame) c++;
  const chunk = chunks[c];
  const p = spring({ frame: frame - (chunk[0].f - 4), fps, config: { damping: 12 } });
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 1100, textAlign: "center", transform: `scale(${0.85 + p * 0.15})` }}>
      <div
        style={{
          display: "inline-block",
          background: "rgba(20,24,40,0.78)",
          borderRadius: 30,
          padding: "14px 34px 4px",
          fontFamily: SANS,
          fontWeight: 800,
          fontSize: 64,
          maxWidth: 960,
        }}
      >
        {chunk.map((w, i) => (
          <span key={i} style={{ color: w.f <= frame ? "#ffe066" : "#ffffff" }}>
            {w.w}{" "}
          </span>
        ))}
      </div>
    </div>
  );
};

/* ---------------- babak ---------------- */

const SceneTajuk: React.FC = () => {
  const frame = useCurrentFrame();
  const pop = usePop();
  const h = wf("tajuk", "Hindari");
  const lines: [string, string, number][] = [
    ["HINDARI", "#ffffff", h - 4],
    ["KATA-KATA", "#ffe066", wf("tajuk", "kata-kata") - 4],
    ["KOTOR", "#ff6b6b", wf("tajuk", "kotor") - 4],
  ];
  const bubble = pop(30, 9);
  const ban = interpolate(frame, [h + 30, h + 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <>
      <div style={{ position: "absolute", top: 150, width: "100%", textAlign: "center" }}>
        <Chip color="rgba(20,24,40,0.55)" style={{ transform: `scale(${pop(6)})` }}>
          ☾ Peringatan Akhlak
        </Chip>
      </div>
      <svg width={420} height={330} viewBox="0 0 420 330" style={{ position: "absolute", left: 330, top: 260, transform: `scale(${bubble}) rotate(${Math.sin(frame / 9) * 3}deg)` }}>
        <path d="M40 30 H380 Q410 30 410 60 V200 Q410 230 380 230 H170 L110 300 L120 230 H40 Q10 230 10 200 V60 Q10 30 40 30 Z" fill="#fff" stroke={INK} strokeWidth={8} />
        <text x={210} y={165} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={110} fill="#d64545">
          #@!%
        </text>
        <circle cx={210} cy={130} r={150} fill="none" stroke="#e03131" strokeWidth={22} strokeDasharray={943} strokeDashoffset={943 * (1 - ban)} />
        <line x1={104} y1={236} x2={316} y2={24} stroke="#e03131" strokeWidth={22} strokeLinecap="round" opacity={ban > 0.6 ? 1 : 0} />
      </svg>
      <div style={{ position: "absolute", top: 600, width: "100%", textAlign: "center", fontFamily: SANS, fontWeight: 800 }}>
        {lines.map(([w, c, at]) => {
          const s = pop(at, 8);
          return (
            <div
              key={w}
              style={{
                fontSize: w === "KATA-KATA" ? 140 : 160,
                lineHeight: 1,
                color: c,
                WebkitTextStroke: `10px ${INK}`,
                paintOrder: "stroke fill",
                textShadow: "0 12px 0 rgba(0,0,0,0.2)",
                transform: `scale(${s}) rotate(${(1 - s) * -12}deg)`,
              }}
            >
              {w}
            </div>
          );
        })}
      </div>
    </>
  );
};

const SceneAmanah: React.FC = () => {
  const frame = useCurrentFrame();
  const pop = usePop();
  const s0 = seg("amanah").start;
  const points: [string, string, number][] = [
    ["🗣", "Jaga tutur kata", wf("amanah", "menjaga")],
    ["📖", "Setiap perkataan akan dipertanggungjawabkan", wf("amanah", "dipertanggungjawabkan") - 30],
  ];
  return (
    <Card top={150} height={900}>
      <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
        <svg width={220} height={240} viewBox="0 0 220 240" style={{ transform: `scale(${pop(s0)}) rotate(${Math.sin(frame / 12) * 4}deg)`, flexShrink: 0 }}>
          <path d="M110 10 L200 45 V120 Q200 195 110 232 Q20 195 20 120 V45 Z" fill="#ffd166" stroke={INK} strokeWidth={8} />
          <path d="M110 170 C40 125 60 70 110 100 C160 70 180 125 110 170 Z" fill="#ef476f" stroke={INK} strokeWidth={6} transform={`translate(110 125) scale(${1 + Math.sin(frame / 6) * 0.05}) translate(-110 -125)`} />
        </svg>
        <div style={{ fontWeight: 800, fontSize: 92, lineHeight: 1.02 }}>
          <div style={{ transform: `translateX(${(1 - pop(wf("amanah", "Lidah"))) * 400}px)` }}>Lidah</div>
          <div style={{ fontSize: 56, color: "#888", transform: `translateX(${(1 - pop(wf("amanah", "adalah"))) * 400}px)` }}>adalah</div>
          <div style={{ color: "#e07a00", fontSize: 108, transform: `scale(${pop(wf("amanah", "amanah"), 7)})`, transformOrigin: "left center" }}>AMANAH</div>
        </div>
      </div>
      <div style={{ marginTop: 50 }}>
        {points.map(([icon, text, at]) => {
          const p = pop(at);
          return (
            <div
              key={text}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 26,
                background: "#fff1d6",
                borderRadius: 30,
                padding: "26px 30px 18px",
                marginBottom: 26,
                fontWeight: 800,
                fontSize: 54,
                lineHeight: 1.1,
                opacity: p,
                transform: `translateY(${(1 - p) * 60}px)`,
              }}
            >
              <span style={{ fontSize: 66 }}>{icon}</span>
              {text}
            </div>
          );
        })}
      </div>
    </Card>
  );
};

const Notebook: React.FC<{ from: number }> = ({ from }) => {
  const frame = useCurrentFrame();
  const lines = [0, 1, 2, 3].map((i) =>
    interpolate(frame, [from + i * 40, from + i * 40 + 36], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
  );
  const active = lines.findIndex((l) => l < 1);
  const li = active === -1 ? 3 : active;
  const penX = 40 + 120 * lines[li];
  const penY = 52 + li * 30;
  return (
    <svg width={220} height={200} viewBox="0 0 220 200">
      <rect x={14} y={14} width={190} height={170} rx={16} fill="#fff" stroke={INK} strokeWidth={6} />
      <rect x={14} y={14} width={30} height={170} rx={10} fill="#3a74c9" />
      {lines.map((l, i) => (
        <line key={i} x1={60} y1={52 + i * 30} x2={60 + 120 * l} y2={52 + i * 30} stroke="#3a74c9" strokeWidth={8} strokeLinecap="round" />
      ))}
      <g transform={`translate(${penX + 20} ${penY - 6 + Math.sin(frame / 2) * 3}) rotate(35)`}>
        <rect x={-8} y={-70} width={16} height={64} rx={4} fill="#f4a261" stroke={INK} strokeWidth={4} />
        <path d="M-8 -6 L0 10 L8 -6 Z" fill={INK} />
      </g>
    </svg>
  );
};

const SceneAyat: React.FC = () => {
  const pop = usePop();
  const s0 = seg("ayat").start;
  const tr = wf("ayat", "Tidak");
  return (
    <Card top={140} height={930} bg="#fdf3d8" border="#d4a017">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontWeight: 800, fontSize: 58, lineHeight: 1.05 }}>
          <div style={{ opacity: pop(s0) }}>Allah SWT</div>
          <div style={{ color: "#b07a00", opacity: pop(wf("ayat", "berfirman")) }}>berfirman:</div>
        </div>
        <div style={{ transform: `scale(${pop(s0 + 8)})` }}>
          <Notebook from={tr} />
        </div>
      </div>
      <div style={{ marginTop: 10, borderTop: "4px dashed #d4a017", borderBottom: "4px dashed #d4a017", padding: "10px 0 0" }}>
        <Arabic text="مَا يَلْفِظُ مِنْ قَوْلٍ إِلَّا لَدَيْهِ رَقِيبٌ عَتِيدٌ" from={s0 + 20} size={76} color="#5a3d00" />
      </div>
      <div style={{ marginTop: 26, opacity: pop(tr - 12) }}>
        <Karaoke
          id="ayat"
          fromWord="Tidak"
          size={50}
          weight={600}
          text="“Tidak ada sesuatu perkataan yang dilafazkannya melainkan ada di sisinya malaikat pengawas yang sentiasa bersedia mencatat.”"
        />
      </div>
      <div style={{ marginTop: 26, textAlign: "right" }}>
        <Chip color="#b07a00" style={{ transform: `scale(${pop(wf("ayat", "Surah"))})` }}>
          Surah Qaf, 50:18
        </Chip>
      </div>
    </Card>
  );
};

const Lantern: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <svg width={120} height={230} viewBox="0 0 120 230" style={{ transform: `rotate(${Math.sin(frame / 18) * 8}deg)`, transformOrigin: "60px 0px" }}>
      <line x1={60} y1={0} x2={60} y2={60} stroke="#c9a227" strokeWidth={5} />
      <path d="M40 60 H80 L92 84 H28 Z" fill="#c9a227" />
      <path d="M30 84 H90 Q100 140 60 190 Q20 140 30 84 Z" fill="#ffd166" stroke="#c9a227" strokeWidth={6} />
      <ellipse cx={60} cy={130} rx={14} ry={24} fill="#fff6d1" opacity={0.6 + Math.sin(frame / 5) * 0.3} />
      <path d="M50 190 H70 L60 214 Z" fill="#c9a227" />
    </svg>
  );
};

const SceneHadis: React.FC = () => {
  const pop = usePop();
  const s0 = seg("hadis").start;
  const baik = wf("hadis", "baik");
  const diam = wf("hadis", "diam");
  return (
    <>
      <Card top={170} height={900} bg="#effbf1" border="#2f9a62">
        <div style={{ fontWeight: 800, fontSize: 56, lineHeight: 1.05, paddingRight: 120 }}>
          <span style={{ opacity: pop(s0) }}>Rasulullah SAW </span>
          <span style={{ color: "#1f7a4a", opacity: pop(wf("hadis", "bersabda")) }}>bersabda:</span>
        </div>
        <div style={{ marginTop: 16, borderTop: "4px dashed #2f9a62", borderBottom: "4px dashed #2f9a62" }}>
          <Arabic text="مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الْآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ" from={s0 + 20} size={66} color="#14532d" />
        </div>
        <div style={{ marginTop: 22, opacity: pop(wf("hadis", "Sesiapa") - 12) }}>
          <Karaoke
            id="hadis"
            fromWord="Sesiapa"
            size={52}
            weight={600}
            text="“Sesiapa yang beriman kepada Allah dan hari akhirat, hendaklah dia berkata yang baik atau diam.”"
          />
        </div>
        <div style={{ display: "flex", gap: 24, marginTop: 28 }}>
          <Chip color="#2f9a62" style={{ transform: `scale(${pop(baik, 8)})` }}>
            ✓ Berkata baik
          </Chip>
          <Chip color="#555b70" style={{ transform: `scale(${pop(diam, 8)})` }}>
            🤐 atau diam
          </Chip>
        </div>
        <div style={{ marginTop: 24, textAlign: "right", opacity: pop(wf("hadis", "Riwayat")) }}>
          <span style={{ fontWeight: 600, fontSize: 40, color: "#1f7a4a" }}>— Riwayat al-Bukhari dan Muslim</span>
        </div>
      </Card>
      <div style={{ position: "absolute", right: 90, top: 70 }}>
        <Lantern />
      </div>
    </>
  );
};

const SceneKotor: React.FC = () => {
  const frame = useCurrentFrame();
  const pop = usePop();
  const sebaliknya = wf("kotor", "Sebaliknya");
  const bukan = wf("kotor", "bukan");
  const bubbles: [string, string, number, number, number][] = [
    ["#@!%", "Kata kotor", wf("kotor", "kotor") - 4, 90, 210],
    ["&*!#", "Makian", wf("kotor", "makian") - 4, 560, 170],
    ["%$#!", "Penghinaan", wf("kotor", "penghinaan") - 4, 120, 520],
    ["💢", "Menyakitkan hati", wf("kotor", "menyakitkan") - 4, 560, 480],
  ];
  const flip = pop(sebaliknya, 12);
  const stamp = pop(bukan, 9);
  const good = pop(wf("kotor", "kematangan") - 6, 10);
  return (
    <>
      {bubbles.map(([sym, label, at, x, y], i) => {
        const p = pop(at, 8);
        const shake = frame < sebaliknya ? Math.sin(frame * 1.3 + i) * 4 : 0;
        return (
          <div key={label} style={{ position: "absolute", left: x, top: y, width: 420, transform: `scale(${p * (1 - flip)}) rotate(${shake}deg)` }}>
            <svg width={420} height={260} viewBox="0 0 420 260">
              <path d="M30 20 H390 Q410 20 410 40 V170 Q410 190 390 190 H140 L80 250 L95 190 H30 Q10 190 10 170 V40 Q10 20 30 20 Z" fill="#fff" stroke={INK} strokeWidth={8} />
              <text x={210} y={135} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={88} fill="#c92a2a">
                {sym}
              </text>
            </svg>
            <div style={{ textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: 44, color: "#fff", WebkitTextStroke: `6px ${INK}`, paintOrder: "stroke fill", marginTop: -14 }}>
              {label}
            </div>
          </div>
        );
      })}
      {frame >= bukan && frame < sebaliknya + 20 ? (
        <div
          style={{
            position: "absolute",
            left: 90,
            right: 90,
            top: 400,
            textAlign: "center",
            transform: `scale(${(2 - stamp) * (1 - flip)}) rotate(-8deg)`,
            opacity: stamp,
            border: "14px solid #e03131",
            borderRadius: 30,
            background: "rgba(255,255,255,0.92)",
            padding: "20px 10px 6px",
            fontFamily: SANS,
            fontWeight: 800,
            fontSize: 78,
            lineHeight: 1.05,
            color: "#e03131",
          }}
        >
          BUKAN tanda
          <br />
          berani atau kuat!
        </div>
      ) : null}
      {frame >= sebaliknya ? (
        <Card top={200} height={820} bg="#fff">
          <div style={{ display: "flex", justifyContent: "center", gap: 40, transform: `scale(${flip})` }}>
            {[0, 1, 2].map((k) => (
              <svg key={k} width={150} height={140} viewBox="0 0 150 140" style={{ transform: `translateY(${Math.sin(frame / 8 + k) * 10}px)` }}>
                <path d="M75 128 C10 80 10 20 55 22 Q70 24 75 40 Q80 24 95 22 C140 20 140 80 75 128 Z" fill={["#ef476f", "#ffd166", "#06d6a0"][k]} stroke={INK} strokeWidth={6} />
              </svg>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 30, fontWeight: 800, fontSize: 64, lineHeight: 1.1, opacity: pop(wf("kotor", "mengawal") - 6) }}>
            Orang yang mampu
            <br />
            <span style={{ color: "#2f9a62" }}>mengawal lisannya</span>
          </div>
          <div style={{ textAlign: "center", marginTop: 26, fontWeight: 600, fontSize: 48, color: "#666", opacity: pop(wf("kotor", "menunjukkan") - 4) }}>
            menunjukkan
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 24 }}>
            <Chip color="#7254d0" style={{ fontSize: 56, transform: `scale(${good})` }}>
              Kematangan
            </Chip>
            <Chip color="#2f9a62" style={{ fontSize: 56, transform: `scale(${pop(wf("kotor", "akhlak") - 4, 10)})` }}>
              Akhlak baik
            </Chip>
          </div>
        </Card>
      ) : null}
    </>
  );
};

const QUESTIONS = [
  "Adakah kata-kata ini benar?",
  "Adakah ia bermanfaat?",
  "Adakah ia menyakiti orang lain?",
  "Sanggupkah aku jika ia didengari ibu bapa dan orang yang aku hormati?",
  "Sanggupkah aku mempertanggungjawabkannya di hadapan Allah?",
];

const SceneTanya: React.FC = () => {
  const frame = useCurrentFrame();
  const pop = usePop();
  const s0 = seg("tanya0").start;
  return (
    <Card top={110} height={960} bg="#fbf8ff" border="#7254d0">
      <div style={{ fontWeight: 800, fontSize: 56, lineHeight: 1.05, opacity: pop(s0) }}>
        Sebelum berkata-kata, <span style={{ color: "#7254d0" }}>tanya diri:</span>
      </div>
      <div style={{ marginTop: 26 }}>
        {QUESTIONS.map((q, i) => {
          const sg = seg(`tanya${i + 1}`);
          const p = pop(sg.start - 4, 12);
          const tick = pop(sg.start + sg.frames - 10, 9);
          const active = frame >= sg.start - 4 && frame < sg.start + sg.frames + 8;
          return (
            <div
              key={q}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 22,
                padding: "16px 20px 10px",
                marginBottom: 14,
                borderRadius: 26,
                background: active ? "#ece4ff" : "transparent",
                opacity: p,
                transform: `translateX(${(1 - p) * -200}px)`,
              }}
            >
              <div style={{ position: "relative", width: 70, height: 70, flexShrink: 0 }}>
                <div style={{ width: 70, height: 70, borderRadius: 18, border: "6px solid #7254d0", boxSizing: "border-box", background: "#fff" }} />
                <svg width={80} height={80} viewBox="0 0 80 80" style={{ position: "absolute", left: 2, top: -12 }}>
                  <path d="M12 42 L32 62 L72 14" fill="none" stroke="#2f9a62" strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={100} strokeDashoffset={100 * (1 - tick)} />
                </svg>
              </div>
              <div style={{ fontWeight: 800, fontSize: i >= 3 ? 44 : 50, lineHeight: 1.12 }}>{q}</div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

const ThoughtMarks: React.FC<{ from: number; to: number }> = ({ from, to }) => {
  const frame = useCurrentFrame();
  if (frame < from || frame >= to) return null;
  return (
    <>
      {[0, 1, 2].map((k) => {
        const t = ((frame - from + k * 25) % 75) / 75;
        return (
          <div
            key={k}
            style={{
              position: "absolute",
              left: 700 + k * 70,
              top: 1300 - t * 160,
              opacity: Math.sin(t * Math.PI),
              fontFamily: SANS,
              fontWeight: 800,
              fontSize: 90 - k * 14,
              color: "#fff",
              WebkitTextStroke: `6px ${INK}`,
              paintOrder: "stroke fill",
            }}
          >
            ?
          </div>
        );
      })}
    </>
  );
};

const SceneJaga: React.FC = () => {
  const frame = useCurrentFrame();
  const pop = usePop();
  const s = seg("jaga");
  const words = ["Jaga", "lidah", "sebelum", "lidah", "menjadi", "sebab", "penyesalan."];
  return (
    <div style={{ position: "absolute", left: 70, right: 70, top: 260, textAlign: "center", fontFamily: SANS, fontWeight: 800 }}>
      <svg width={200} height={200} viewBox="0 0 200 200" style={{ transform: `scale(${pop(s.start)}) rotate(${Math.sin(frame / 10) * 5}deg)` }}>
        <circle cx={100} cy={100} r={90} fill="#fff" stroke={INK} strokeWidth={8} />
        <path d="M50 105 Q100 150 150 105 Q100 125 50 105 Z" fill="#ef476f" stroke={INK} strokeWidth={6} />
        <rect x={70} y={70} width={60} height={46} rx={10} fill="#ffd166" stroke={INK} strokeWidth={6} />
        <path d="M82 70 V56 Q100 32 118 56 V70" fill="none" stroke={INK} strokeWidth={8} />
      </svg>
      <div style={{ marginTop: 30, fontSize: 112, lineHeight: 1.08 }}>
        {words.map((w, i) => {
          const at = s.words[i]?.f ?? s.start;
          const p = pop(at - 3, 9);
          const hot = i < 2 || i === 6;
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                marginRight: 26,
                color: hot ? "#ffe066" : "#fff",
                WebkitTextStroke: `9px ${INK}`,
                paintOrder: "stroke fill",
                transform: `scale(${p}) translateY(${(1 - p) * 40}px)`,
              }}
            >
              {w}
            </span>
          );
        })}
      </div>
    </div>
  );
};

const Leaf: React.FC<{ spin: number }> = ({ spin }) => (
  <svg width={90} height={90} viewBox="0 0 90 90" style={{ transform: `rotate(${spin}deg)`, flexShrink: 0 }}>
    <path d="M12 78 Q10 14 80 10 Q78 76 12 78 Z" fill="#43aa5b" stroke="#1d5e2c" strokeWidth={5} />
    <path d="M14 76 Q40 46 70 20" stroke="#1d5e2c" strokeWidth={4} fill="none" />
  </svg>
);

const ScenePenutup: React.FC = () => {
  const frame = useCurrentFrame();
  const pop = usePop();
  const rows: [string, string, number][] = [
    ["Berkata baik adalah", "SEDEKAH", wf("penutup", "Berkata")],
    ["Diam daripada keburukan adalah", "IBADAH", wf("penutup", "Diam")],
    ["Menjaga lisan adalah tanda", "KETAKWAAN", wf("penutup", "Menjaga")],
  ];
  const bye = pop(end("penutup") + 4, 10);
  return (
    <Card top={260} height={720}>
      {rows.map(([a, b, at], i) => {
        const p = pop(at - 4, 11);
        return (
          <div key={b} style={{ display: "flex", alignItems: "center", gap: 26, marginBottom: 36, opacity: p, transform: `translateX(${(1 - p) * 300}px)` }}>
            <Leaf spin={Math.sin(frame / 14 + i) * 10} />
            <div style={{ lineHeight: 1.05 }}>
              <div style={{ fontWeight: 600, fontSize: 48, color: "#555" }}>{a}</div>
              <div style={{ fontWeight: 800, fontSize: 84, color: ["#e07a00", "#2f9a62", "#7254d0"][i] }}>{b}</div>
            </div>
          </div>
        );
      })}
      <div style={{ textAlign: "center", marginTop: 20, transform: `scale(${bye})` }}>
        <Chip color={INK} style={{ fontSize: 50 }}>
          Jaga lidah, jaga diri 🌙
        </Chip>
      </div>
    </Card>
  );
};

/* ---------------- komposisi ---------------- */

const SCENE_VIEWS: Record<string, React.FC> = {
  tajuk: SceneTajuk,
  amanah: SceneAmanah,
  ayat: SceneAyat,
  hadis: SceneHadis,
  kotor: SceneKotor,
  tanya: SceneTanya,
  jaga: SceneJaga,
  penutup: ScenePenutup,
};

export const HindariKataKotor: React.FC = () => {
  useFonts();
  return (
    <AbsoluteFill style={{ backgroundColor: "#23857f", overflow: "hidden" }}>
      <Background />
      {SCENES.map((s) => {
        const View = SCENE_VIEWS[s.id];
        return (
          <SceneShell key={s.id} from={s.from} to={s.to}>
            <View />
          </SceneShell>
        );
      })}
      <Character schedule={SCHEDULE} />
      <ThoughtMarks from={seg("tanya0").start} to={seg("tanya5").start} />
      <Caption ids={["tajuk", "amanah", "kotor"]} />
      <Audio src={staticFile("lidah/suara.wav")} />
    </AbsoluteFill>
  );
};
