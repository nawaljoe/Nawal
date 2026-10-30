import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import data from "./timeline.json";

// Sudut lengan [bahu, siku] dalam darjah; 0 = tergantung ke bawah.
export type Pose =
  | "rest"
  | "wave"
  | "open"
  | "point"
  | "chest"
  | "stop"
  | "thumb"
  | "think";

type Arms = { l: [number, number]; r: [number, number] };

const POSES: Record<Pose, Arms> = {
  rest: { l: [12, -6], r: [-12, 6] },
  wave: { l: [12, -6], r: [-128, -28] },
  open: { l: [58, 28], r: [-58, -28] },
  point: { l: [12, -6], r: [-150, -12] },
  chest: { l: [12, -6], r: [10, 102] },
  stop: { l: [12, -6], r: [-78, -52] },
  thumb: { l: [12, -6], r: [-22, -150] },
  think: { l: [-18, -134], r: [-12, 6] },
};

const mouthAt = (f: number) => {
  const m = data.mouth;
  const g = (i: number) => m[Math.max(0, Math.min(m.length - 1, i))] ?? 0;
  return (g(f - 1) + 2 * g(f) + g(f + 1)) / 4;
};

const Arm: React.FC<{
  x: number;
  angles: [number, number];
  sleeve: string;
  thumb?: boolean;
  palm?: boolean;
}> = ({ x, angles, sleeve, thumb, palm }) => (
  <g transform={`translate(${x} 318) rotate(${angles[0]})`}>
    <rect x={-25} y={-12} width={50} height={102} rx={25} fill={sleeve} />
    <g transform={`translate(0 82) rotate(${angles[1]})`}>
      <rect x={-22} y={-14} width={44} height={96} rx={22} fill={sleeve} />
      <rect x={-23} y={62} width={46} height={16} rx={8} fill="#f4e7c4" />
      <circle cx={0} cy={96} r={25} fill="#f2c39b" stroke="#c98d63" strokeWidth={3} />
      {thumb ? (
        <rect x={-8} y={108} width={16} height={30} rx={8} fill="#f2c39b" stroke="#c98d63" strokeWidth={3} />
      ) : null}
      {palm ? (
        <path d="M-14 112 v18 M-4 116 v20 M6 116 v20 M16 112 v16" stroke="#c98d63" strokeWidth={5} strokeLinecap="round" />
      ) : null}
    </g>
  </g>
);

export const Character: React.FC<{ schedule: { f: number; pose: Pose }[] }> = ({ schedule }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  let i = 0;
  while (i + 1 < schedule.length && schedule[i + 1].f <= frame) i++;
  const cur = schedule[i];
  const prev = schedule[Math.max(0, i - 1)];
  const t = spring({ frame: frame - cur.f, fps, config: { damping: 14, mass: 0.8 } });
  const mix = (a: number, b: number) => a + (b - a) * t;
  const A = POSES[prev.pose];
  const B = POSES[cur.pose];
  const wave = cur.pose === "wave" ? Math.sin(frame * 0.32) * 24 * t : 0;
  const l: [number, number] = [mix(A.l[0], B.l[0]), mix(A.l[1], B.l[1])];
  const r: [number, number] = [mix(A.r[0], B.r[0]), mix(A.r[1], B.r[1]) + wave];

  const m = mouthAt(frame);
  const blinkPhase = (frame + 37) % 104;
  const blink = blinkPhase < 6 ? Math.abs(Math.cos((blinkPhase / 6) * Math.PI)) : 1;
  const bob = Math.sin(frame / 16) * 6 + m * 3;
  const tilt =
    (cur.pose === "think" ? 7 * t : 0) + Math.sin(frame / 41) * 2.2 + (m - 0.3) * 1.5;
  const lookUp = cur.pose === "point" || cur.pose === "think" ? -5 * t : 0;
  const lookX = Math.sin(frame / 70) * 3;
  const enter = spring({ frame, fps, config: { damping: 13 } });

  const sleeve = "#1f9d74";
  const mouthRy = interpolate(m, [0, 1], [3, 26]);
  const mouthRx = interpolate(m, [0, 1], [22, 18]);

  return (
    <svg
      viewBox="0 0 400 560"
      width={560}
      height={784}
      style={{
        position: "absolute",
        left: 540 - 280,
        top: 1920 - 740,
        transform: `translateY(${(1 - enter) * 500 + bob}px)`,
        overflow: "visible",
      }}
    >
      <ellipse cx={200} cy={575} rx={170} ry={26} fill="rgba(0,0,0,0.18)" />
      {/* badan: baju melayu */}
      <path d="M78 330 Q200 280 322 330 L360 600 L40 600 Z" fill={sleeve} />
      <path d="M200 300 L200 470" stroke="#17805d" strokeWidth={4} />
      <circle cx={200} cy={360} r={6} fill="#f4d35e" />
      <circle cx={200} cy={400} r={6} fill="#f4d35e" />
      <circle cx={200} cy={440} r={6} fill="#f4d35e" />
      <path d="M150 304 Q200 350 250 304" fill="none" stroke="#f4e7c4" strokeWidth={10} strokeLinecap="round" />
      {/* sampin */}
      <path d="M52 500 Q200 470 348 500 L360 600 L40 600 Z" fill="#7a3fa0" />
      <path d="M60 530 L340 530 M56 560 L346 560" stroke="#f4d35e" strokeWidth={4} opacity={0.7} />

      <Arm x={86} angles={l} sleeve={sleeve} />

      {/* kepala */}
      <g transform={`rotate(${tilt} 200 290)`}>
        <rect x={176} y={270} width={48} height={40} fill="#e9b48a" />
        <circle cx={92} cy={200} r={22} fill="#f2c39b" />
        <circle cx={308} cy={200} r={22} fill="#f2c39b" />
        <circle cx={200} cy={190} r={112} fill="#f6cba3" />
        {/* songkok */}
        <path d="M102 132 Q104 64 200 60 Q296 64 298 132 Z" fill="#1d1d2b" />
        <rect x={100} y={118} width={200} height={22} rx={6} fill="#1d1d2b" />
        <path d="M120 82 Q200 66 280 82" stroke="#3a3a52" strokeWidth={6} fill="none" strokeLinecap="round" />
        {/* kening */}
        <path
          d={`M136 ${150 - m * 4} Q160 ${138 - m * 6} 184 ${148 - m * 4}`}
          stroke="#3b2a20"
          strokeWidth={8}
          fill="none"
          strokeLinecap="round"
        />
        <path
          d={`M216 ${148 - m * 4} Q240 ${138 - m * 6} 264 ${150 - m * 4}`}
          stroke="#3b2a20"
          strokeWidth={8}
          fill="none"
          strokeLinecap="round"
        />
        {/* mata */}
        <g transform={`translate(0 ${190 - 190 * blink}) scale(1 ${blink})`}>
          <ellipse cx={160} cy={190} rx={22} ry={26} fill="#fff" />
          <ellipse cx={240} cy={190} rx={22} ry={26} fill="#fff" />
          <circle cx={163 + lookX} cy={194 + lookUp} r={13} fill="#2b1d16" />
          <circle cx={243 + lookX} cy={194 + lookUp} r={13} fill="#2b1d16" />
          <circle cx={168 + lookX} cy={188 + lookUp} r={4.5} fill="#fff" />
          <circle cx={248 + lookX} cy={188 + lookUp} r={4.5} fill="#fff" />
        </g>
        <ellipse cx={128} cy={232} rx={18} ry={10} fill="#f39a8a" opacity={0.55} />
        <ellipse cx={272} cy={232} rx={18} ry={10} fill="#f39a8a" opacity={0.55} />
        <path d="M196 206 Q190 226 204 228" stroke="#d9946c" strokeWidth={5} fill="none" strokeLinecap="round" />
        {/* mulut: buka ikut kekuatan suara */}
        {m > 0.06 ? (
          <g>
            <ellipse cx={200} cy={258} rx={mouthRx} ry={mouthRy} fill="#7a2230" />
            <ellipse cx={200} cy={258 + mouthRy * 0.55} rx={mouthRx * 0.6} ry={mouthRy * 0.35} fill="#ef6f7b" />
            <rect x={200 - mouthRx * 0.7} y={258 - mouthRy} width={mouthRx * 1.4} height={Math.min(8, mouthRy * 0.6)} rx={3} fill="#fff" />
          </g>
        ) : (
          <path d="M176 252 Q200 274 224 252" stroke="#7a2230" strokeWidth={7} fill="none" strokeLinecap="round" />
        )}
      </g>

      <Arm x={314} angles={r} sleeve={sleeve} thumb={cur.pose === "thumb" && t > 0.5} palm={cur.pose === "stop" && t > 0.5} />
    </svg>
  );
};
