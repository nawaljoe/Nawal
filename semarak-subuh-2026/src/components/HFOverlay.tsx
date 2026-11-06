import React from "react";
import { OffthreadVideo, Sequence, staticFile } from "remotion";
import type { Overlay } from "../types";

/** A transparent motion-graphics plate rendered by HyperFrames (VP9 + alpha). */
export const HFOverlay: React.FC<{ o: Overlay }> = ({ o }) => (
  <Sequence from={o.from} durationInFrames={o.dur} name={`HyperFrames ${o.src}`}>
    <OffthreadVideo src={staticFile(o.src)} transparent muted style={{ width: 1080, height: 1920 }} />
  </Sequence>
);
