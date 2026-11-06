import React from "react";
import { interpolate, Solid, useCurrentFrame, useVideoConfig } from "remotion";
import { lightLeak } from "@remotion/effects/light-leak";

/** Warm dawn light leak over a cut (gold hue, low seed variance). Used once: dawn sky -> congregation. */
export const LightLeakOverlay: React.FC<{ seed?: number; hueShift?: number }> = ({ seed = 3, hueShift = 18 }) => {
  const frame = useCurrentFrame();
  const { durationInFrames, height, width } = useVideoConfig();
  return (
    <Solid width={width} height={height} style={{ opacity: 0.32, mixBlendMode: "screen" }}
      effects={[lightLeak({ seed, hueShift, progress: interpolate(frame, [0, durationInFrames - 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) })]} />
  );
};
