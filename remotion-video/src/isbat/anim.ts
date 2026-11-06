import { Easing, interpolate } from "remotion";
import data from "./timeline.json";

export const T = data;
export type Run = (string)[]; // [text, weight, color, boxColor?]
export type Line = {
  at: number;
  y: number;
  size: number;
  runs: Run[];
  pop?: boolean;
  glow?: boolean;
  tracking?: number;
};
export type Keyframe = (number | string)[]; // [time, value, ease?]

const C = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
/** 0..1 progress of time t through [t0, t0+d] */
export const prog = (t: number, t0: number, d: number) => clamp01((t - t0) / d);
export const easeOut3 = (x: number) => Easing.out(Easing.cubic)(clamp01(x));
export const easeInOut = (x: number) => Easing.inOut(Easing.sin)(clamp01(x));
export const easeBack = (x: number) => Easing.out(Easing.back(1.7))(clamp01(x));

/** Piecewise keyframes: [[t, value, ease?], ...] — ease belongs to the segment ending at that key. */
export const keyframes = (t: number, kfs: Keyframe[]): number => {
  if (kfs.length === 1 || t <= (kfs[0][0] as number)) return kfs[0][1] as number;
  for (let i = 1; i < kfs.length; i++) {
    const [t1, v1, ease] = kfs[i] as [number, number, string?];
    const [t0, v0] = kfs[i - 1] as [number, number];
    if (t <= t1) {
      return interpolate(t, [t0, t1], [v0, v1], {
        ...C,
        easing: ease === "out3" ? Easing.out(Easing.cubic) : Easing.linear,
      });
    }
  }
  return kfs[kfs.length - 1][1] as number;
};

/** Center track: [[t, cx, cy], ...] linear */
export const center = (t: number, track: number[][]): [number, number] => {
  if (track.length === 1) return [track[0][1], track[0][2]];
  const ts = track.map((k) => k[0]);
  return [
    interpolate(t, ts, track.map((k) => k[1]), C),
    interpolate(t, ts, track.map((k) => k[2]), C),
  ];
};

const W = T.width;
const H = T.height;

/** Transform that shows the ustaz footage cropped to the 3:4 content area (no blurred bars), zoomed on the face. */
export const ustazTransform = (z: number) => {
  const { contentTop: CT, contentBottom: CB, faceX, faceY } = T.source;
  const h = (CB - CT) / z;
  const w = (h * 9) / 16;
  const frac = 0.5 - 0.1 * clamp01((z - 1) / 0.25);
  const left = Math.max(0, Math.min(W - w, faceX - w / 2));
  const top = Math.max(CT, Math.min(CB - h, faceY - frac * h));
  const s = W / w;
  return `translate(${-left * s}px, ${-top * s}px) scale(${s})`;
};

/** Transform for b-roll: zoom z around (cx, cy), clamped to frame. */
export const brollTransform = (z: number, cx: number, cy: number) => {
  const w = W / z;
  const h = H / z;
  const left = Math.max(0, Math.min(W - w, cx - w / 2));
  const top = Math.max(0, Math.min(H - h, cy - h / 2));
  return `translate(${-left * z}px, ${-top * z}px) scale(${z})`;
};
