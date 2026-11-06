import React from "react";
import { AbsoluteFill, OffthreadVideo, interpolate, staticFile, useCurrentFrame, Easing } from "remotion";
import { clamp } from "../theme";
import type { Seg } from "../types";

/** The graded speaker clip. Each spoken piece gets its own framing (alternating punch-in) plus a slow
 *  push inside the piece, so jump cuts read as intentional camera moves. Transform on a wrapper only. */
export const PunchFootage: React.FC<{ src: string; segs: Seg[] }> = ({ src, segs }) => {
  const f = useCurrentFrame();
  const seg = segs.find((s) => f >= s.from && f < s.to) ?? segs[segs.length - 1];
  const p = interpolate(f, [seg.from, seg.to], [0, 1], { ...clamp, easing: Easing.inOut(Easing.sin) });
  const sc = seg.s0 + (seg.s1 - seg.s0) * p;
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#000" }}>
      <AbsoluteFill style={{ transform: `scale(${sc})`, transformOrigin: "50% 36%" }}>
        <OffthreadVideo src={staticFile(src)} style={{ width: 1080, height: 1920 }} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
