import { Easing, interpolate, spring } from "remotion";
import { FPS } from "./theme";

/** Clamped interpolate with an ease-out by default. */
export const tween = (
  frame: number,
  range: [number, number],
  out: [number, number],
  easing: (t: number) => number = Easing.bezier(0.16, 1, 0.3, 1),
) =>
  interpolate(frame, range, out, {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });

export const EASE_IN_OUT = Easing.bezier(0.65, 0, 0.35, 1);
export const EASE_IN = Easing.bezier(0.7, 0, 0.84, 0);

/** Snappy pop with overshoot (0 -> ~1.15 -> 1). */
export const pop = (frame: number, at: number, stiff = 170, damping = 11) =>
  spring({
    frame: frame - at,
    fps: FPS,
    config: { damping, stiffness: stiff, mass: 0.7 },
  });

/** Gentle settle without overshoot. */
export const settle = (frame: number, at: number, durationInFrames = 18) =>
  spring({
    frame: frame - at,
    fps: FPS,
    config: { damping: 200 },
    durationInFrames,
  });

/** Bounce loop (0..1..0) used for idle character motion. */
export const bob = (frame: number, period = 24, phase = 0) =>
  (Math.sin(((frame + phase) / period) * Math.PI * 2) + 1) / 2;

/** Ballistic jump height: 0 on ground, 1 at apex, for frames [at, at+dur]. */
export const jumpArc = (frame: number, at: number, dur: number) => {
  const t = (frame - at) / dur;
  if (t <= 0 || t >= 1) return 0;
  return 4 * t * (1 - t);
};

/** Squash amount around a landing/take-off moment. */
export const squashAt = (frame: number, at: number, amount = 0.18, width = 5) => {
  const d = Math.abs(frame - at);
  return d > width ? 0 : amount * (1 - d / width);
};

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
