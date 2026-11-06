import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";

/**
 * Client branding overlay (transparent 9:16 PNG): Johor crest + "Maju Johor"
 * at the top and the Fared Khalid watermark lower down. Sits above every scene.
 */
export const BrandOverlay: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <Img src={staticFile("brand/overlay-johor-fk.png")} style={{ width: "100%", height: "100%" }} />
  </AbsoluteFill>
);
