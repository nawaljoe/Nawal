import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C } from "../theme";

/**
 * Paper background with a faint parallax dot grid. The grid drifts slowly
 * (and is offset by `parallax`) so the frame never feels static.
 */
export const Background: React.FC<{ parallax?: number }> = ({ parallax = 0 }) => {
  const frame = useCurrentFrame();
  const off = (frame * 0.6 + parallax) % 60;
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(${C.blue} 2.2px, transparent 2.6px)`,
          backgroundSize: "60px 60px",
          backgroundPosition: `${-off}px ${off * 0.5}px`,
          opacity: 0.1,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 50% 45%, transparent 55%, rgba(41,41,41,0.06) 100%)`,
        }}
      />
    </AbsoluteFill>
  );
};
