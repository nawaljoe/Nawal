import React from "react";
import { Img, staticFile } from "remotion";

/** Original Fared Khalid / Johor brand plate (1449x2576 transparent PNG) — shown untouched, full-frame. */
export const Logo: React.FC = () => (
  <Img src={staticFile("logo.png")} style={{ position: "absolute", inset: 0, width: 1080, height: 1920 }} />
);
