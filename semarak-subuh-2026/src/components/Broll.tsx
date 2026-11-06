import React from "react";
import { AbsoluteFill, Img, OffthreadVideo, interpolate, staticFile, useCurrentFrame, Easing } from "remotion";
import { clamp } from "../theme";
import type { Broll } from "../types";

const F = 10; // dissolve length (frames)

/** Cutaway with a soft zoom-blur dissolve. Videos play in gentle slow motion (speed ramp ≤ 0.85x). */
export const BrollItem: React.FC<{ b: Broll }> = ({ b }) => {
  const f = useCurrentFrame();
  const dur = b.to - b.from;
  const e = Easing.inOut(Easing.cubic);
  const tin = b.holdIn ? 1 : interpolate(f, [0, F], [0, 1], { ...clamp, easing: e });
  const tout = b.holdOut ? 1 : interpolate(f, [dur - F, dur], [1, 0], { ...clamp, easing: e });
  const blur = (1 - tin) * 12 + (1 - tout) * 8;
  const wrap: React.CSSProperties = { opacity: Math.min(tin, tout), overflow: "hidden", backgroundColor: "#000", filter: blur > 0.3 ? `blur(${blur}px)` : undefined };
  if (b.kind === "video") {
    const sc = interpolate(f, [0, dur], [1.04, 1.1], clamp) + (1 - tin) * 0.06;
    return (
      <AbsoluteFill style={wrap}>
        <AbsoluteFill style={{ transform: `scale(${sc})` }}>
          <OffthreadVideo muted src={staticFile(b.src)} trimBefore={Math.round((b.at ?? 0) * 30)} playbackRate={b.rate ?? 1}
            style={{ width: 1080, height: 1920 }} />
        </AbsoluteFill>
      </AbsoluteFill>
    );
  }
  return <AbsoluteFill style={wrap}><KenBurnsPhoto src={b.src} fx={b.fx ?? 0.5} move={b.move ?? "push"} dur={dur} extraZoom={(1 - tin) * 0.06} /></AbsoluteFill>;
};

/** 3:2 still framed for 9:16 around a focus point, with a slow push/pull and a gentle drift. */
export const KenBurnsPhoto: React.FC<{ src: string; fx: number; move: "push" | "pull"; dur: number; extraZoom?: number; from?: number; to?: number }> = ({ src, fx, move, dur, extraZoom = 0, from = 1.02, to = 1.12 }) => {
  const f = useCurrentFrame();
  const W = 2880;
  const p = Easing.inOut(Easing.sin)(Math.min(1, Math.max(0, f / dur)));
  const cx = Math.min(W - 540, Math.max(540, fx * W));
  const x = -(cx - 540) + interpolate(p, [0, 1], [-36, 36]);
  const sc = (move === "pull" ? interpolate(p, [0, 1], [to, from]) : interpolate(p, [0, 1], [from, to])) + extraZoom;
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#000" }}>
      <Img src={staticFile(src)} style={{ position: "absolute", height: 1920, width: W, left: 0, top: 0, transform: `translateX(${x}px) scale(${sc})`, transformOrigin: `${cx}px 50%` }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 80% 70% at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.45) 100%)" }} />
    </AbsoluteFill>
  );
};
