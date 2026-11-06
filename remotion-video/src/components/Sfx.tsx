import React from "react";
import { Audio } from "@remotion/media";
import { Sequence, staticFile } from "remotion";

export type SfxName =
  | "pop"
  | "whoosh"
  | "swipe"
  | "notification"
  | "cash"
  | "coin"
  | "tick"
  | "clock"
  | "scratch"
  | "impact"
  | "cine-hit"
  | "paper"
  | "shimmer"
  | "rise";

/** Default level per effect, all well under the voice-over (1.0). */
const LEVEL: Record<SfxName, number> = {
  pop: 0.32,
  whoosh: 0.28,
  swipe: 0.26,
  notification: 0.4,
  cash: 0.36,
  coin: 0.24,
  tick: 0.3,
  clock: 0.22,
  scratch: 0.42,
  impact: 0.4,
  "cine-hit": 0.5,
  paper: 0.3,
  shimmer: 0.3,
  rise: 0.22,
};

/** Play a synthesized sound effect at a local frame. */
export const Sfx: React.FC<{ name: SfxName; at: number; volume?: number }> = ({ name, at, volume }) => (
  <Sequence from={Math.max(0, Math.round(at))} name={`sfx:${name}`} layout="none">
    <Audio src={staticFile(`audio/sfx/${name}.wav`)} volume={volume ?? LEVEL[name]} />
  </Sequence>
);
