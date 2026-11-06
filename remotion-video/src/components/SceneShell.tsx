import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { EASE_IN, EASE_IN_OUT, tween } from "../anim";
import { C } from "../theme";
import { Background } from "./Background";

export type Enter = "whip" | "pop" | "none" | "flash";
export type Exit = "whip" | "zoom" | "none";

const T = 12; // transition length in frames (overlap = 2 * PAD = 12)

/**
 * Wraps a scene: whip-pan in/out with directional motion blur, or zoom-through.
 * Uses the scene Sequence's own duration so it works standalone too.
 */
export const SceneShell: React.FC<{
  id: string;
  enter?: Enter;
  exit?: Exit;
  children: React.ReactNode;
  /** focal point for the zoom-through exit, in px */
  zoomOrigin?: [number, number];
}> = ({ id, enter = "whip", exit = "whip", children, zoomOrigin = [540, 900] }) => {
  const frame = useCurrentFrame();
  const { durationInFrames, width } = useVideoConfig();
  const pin = tween(frame, [0, T], [0, 1], EASE_IN_OUT);
  const pout = tween(frame, [durationInFrames - T, durationInFrames], [0, 1], EASE_IN);

  let tx = 0;
  let blur = 0;
  let scale = 1;
  let opacity = 1;
  if (enter === "whip" && pin < 1) {
    tx += (1 - pin) * width * 1.05;
    blur = Math.max(blur, Math.sin(pin * Math.PI) * 60);
  }
  if (enter === "pop" && pin < 1) {
    scale *= interpolate(pin, [0, 1], [0.85, 1]);
    opacity *= pin;
  }
  if (enter === "flash" && pin < 1) {
    scale *= interpolate(pin, [0, 1], [1.25, 1]);
    opacity *= Math.min(1, pin * 2);
  }
  if (exit === "whip" && pout > 0) {
    tx -= pout * width * 1.05;
    blur = Math.max(blur, Math.sin(pout * Math.PI) * 60);
  }
  if (exit === "zoom" && pout > 0) {
    scale *= interpolate(pout, [0, 1], [1, 7]);
    opacity *= 1 - tween(pout, [0.6, 1], [0, 1]);
    blur = Math.max(blur, pout * 18);
  }
  const fid = `mb-${id}`;
  return (
    <AbsoluteFill>
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <defs>
          <filter id={fid} x="-20%" y="-5%" width="140%" height="110%">
            <feGaussianBlur stdDeviation={exit === "zoom" && pout > 0 ? `${blur} ${blur}` : `${blur} 0`} />
          </filter>
        </defs>
      </svg>
      <AbsoluteFill
        style={{
          translate: `${tx}px 0px`,
          scale: `${scale}`,
          transformOrigin: `${zoomOrigin[0]}px ${zoomOrigin[1]}px`,
          opacity,
          filter: blur > 0.5 ? `url(#${fid})` : undefined,
        }}
      >
        <Background parallax={frame * 0.8} />
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export type CamKey = { f: number; x?: number; y?: number; s?: number; r?: number };

/**
 * Camera: keyframed pan / zoom / roll applied to the stage. x/y are the
 * point (px) the camera looks at; s is zoom. Holds values between keys.
 */
export const Camera: React.FC<{
  keys: CamKey[];
  children: React.ReactNode;
  shake?: { at: number; amount?: number; dur?: number }[];
  style?: React.CSSProperties;
}> = ({ keys, children, shake = [], style }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const ks = keys.map((k) => ({ f: k.f, x: k.x ?? width / 2, y: k.y ?? height / 2, s: k.s ?? 1, r: k.r ?? 0 }));
  const val = (prop: "x" | "y" | "s" | "r") => {
    if (ks.length === 1) return ks[0][prop];
    const fs = ks.map((k) => k.f);
    const vs = ks.map((k) => k[prop]);
    return interpolate(frame, fs, vs, {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: EASE_IN_OUT,
    });
  };
  const s = val("s");
  let x = val("x");
  let y = val("y");
  for (const sh of shake) {
    const d = frame - sh.at;
    const dur = sh.dur ?? 10;
    if (d >= 0 && d < dur) {
      const a = (sh.amount ?? 14) * (1 - d / dur);
      x += Math.sin(d * 2.7) * a;
      y += Math.cos(d * 3.3) * a;
    }
  }
  return (
    <AbsoluteFill
      style={{
        transformOrigin: "0 0",
        translate: `${width / 2 - x * s}px ${height / 2 - y * s}px`,
        scale: `${s}`,
        rotate: `${val("r")}deg`,
        ...style,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/** Full-frame SVG stage in video pixel coordinates. */
export const Stage: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible", ...style }}>
    {children}
  </svg>
);

/** Ground line drawn with a hand-drawn reveal. */
export const Ground: React.FC<{ y: number; at?: number; x1?: number; x2?: number; color?: string }> = ({
  y,
  at = 0,
  x1 = 120,
  x2 = 960,
  color = C.ink,
}) => {
  const frame = useCurrentFrame();
  const d = tween(frame, [at, at + 14], [0, 1]);
  return (
    <path
      d={`M${x1} ${y} L${x2} ${y}`}
      pathLength={1}
      strokeDasharray="1 1"
      strokeDashoffset={1 - d}
      stroke={color}
      strokeWidth={6}
      strokeLinecap="round"
      opacity={0.9}
    />
  );
};
