import React from "react";
import { T, type Run } from "./anim";

export const FONT = "InterDisplay";
const WEIGHT: Record<string, number> = { semibold: 600, extrabold: 800, black: 900 };
const color = (c?: string) => (c ? (T.palette as Record<string, string>)[c] ?? c : undefined);

/** One line of styled runs, horizontally centred on the 1080 canvas, vertically centred on `y`. */
export const RunsLine: React.FC<{
  runs: Run[];
  size: number;
  y: number;
  tracking?: number;
  stroke?: number;
  shadow?: boolean;
  style?: React.CSSProperties;
}> = ({ runs, size, y, tracking = 0, stroke = 0, shadow = true, style }) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      width: T.width,
      top: y,
      height: 0,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      whiteSpace: "pre",
      fontFamily: FONT,
      fontSize: size,
      lineHeight: 1,
      letterSpacing: tracking,
      ...style,
    }}
  >
    {runs.map(([text, weight, fill, box], i) => (
      <span
        key={i}
        style={{
          fontWeight: WEIGHT[weight] ?? 800,
          color: color(fill),
          background: color(box),
          borderRadius: box ? size * 0.22 : 0,
          padding: box ? `${size * 0.1}px ${size * 0.18}px ${size * 0.06}px` : 0,
          margin: box ? `0 ${size * 0.1}px` : 0,
          WebkitTextStroke: stroke && !box ? `${stroke}px ${T.palette.navyDeep}` : undefined,
          paintOrder: "stroke fill",
          textShadow: shadow ? "0 4px 16px rgba(0,8,25,0.75)" : undefined,
          boxShadow: box && shadow ? "0 6px 18px rgba(0,8,25,0.45)" : undefined,
        }}
      >
        {text}
      </span>
    ))}
  </div>
);
