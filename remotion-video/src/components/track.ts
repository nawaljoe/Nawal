import { interpolate } from "remotion";
import { EASE_IN_OUT } from "../anim";
import { Face, mixPose, Pose } from "./Stickman";

/**
 * Keyframed pose track: [[frame, pose, blendFrames?], ...]. Holds each pose
 * and blends into the next over `blend` frames (default 8) before its key.
 */
export const poseTrack = (frame: number, keys: [number, Pose, number?][]): Pose => {
  let cur = keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [f, p, blend = 8] = keys[i];
    if (frame >= f) {
      cur = p;
      continue;
    }
    if (frame > f - blend) {
      const t = interpolate(frame, [f - blend, f], [0, 1], { easing: EASE_IN_OUT });
      return mixPose(cur, p, t);
    }
    return cur;
  }
  return cur;
};

/** Step track for discrete values like faces. */
export const stepTrack = <T,>(frame: number, keys: [number, T][]): T => {
  let v = keys[0][1];
  for (const [f, val] of keys) if (frame >= f) v = val;
  return v;
};

export const faceTrack = (frame: number, keys: [number, Face][]) => stepTrack<Face>(frame, keys);

/** Smooth numeric track with easing between keys. */
export const numTrack = (frame: number, keys: [number, number][], easing = EASE_IN_OUT) =>
  keys.length === 1
    ? keys[0][1]
    : interpolate(
        frame,
        keys.map((k) => k[0]),
        keys.map((k) => k[1]),
        { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing },
      );
