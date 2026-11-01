import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { EXIT, STAGGER } from "./script";
import { fonts } from "./fonts";

type Token = { word: string; hl: boolean };

// "*amanah,*" -> { word: "amanah,", hl: true }
const tokenize = (text: string): Token[] =>
  text
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => {
      const hl = w.startsWith("*");
      return { word: w.replace(/\*/g, ""), hl };
    });

export const PopText: React.FC<{
  text: string;
  duration: number;
  fontSize: number;
  align?: "center" | "left";
  delay?: number; // frame sebelum perkataan pertama muncul (ruang tetap ditempah)
}> = ({ text, duration, fontSize, align = "center", delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tokens = tokenize(text);

  const exitT = interpolate(frame, [duration - EXIT, duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: align === "center" ? "center" : "flex-start",
        alignItems: "baseline",
        columnGap: fontSize * 0.28,
        rowGap: fontSize * 0.12,
        opacity: 1 - exitT,
        transform: `translateY(${-exitT * 30}px)`,
        filter: `blur(${exitT * 8}px)`,
      }}
    >
      {tokens.map((t, i) => {
        const local = frame - delay - i * STAGGER;
        const s = spring({
          frame: local,
          fps,
          config: { damping: 11, stiffness: 170, mass: 0.6 },
        });
        const op = interpolate(local, [0, 5], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const blur = interpolate(local, [0, 7], [10, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        // Perkataan disorot: kilauan lembut selepas muncul
        const glow = t.hl
          ? interpolate(local, [6, 18, 40], [0, 1, 0.55], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })
          : 0;

        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity: op,
              transform: `translateY(${(1 - s) * 46}px) scale(${0.35 + 0.65 * s})`,
              transformOrigin: "50% 80%",
              filter: `blur(${blur}px)`,
              fontFamily: t.hl ? fonts.serif : fonts.sans,
              fontStyle: t.hl ? "italic" : "normal",
              fontWeight: t.hl ? 700 : 700,
              fontSize: t.hl ? fontSize * 1.14 : fontSize,
              lineHeight: 1.18,
              color: t.hl ? "#FFD27A" : "#FFFFFF",
              textShadow: t.hl
                ? `0 0 ${18 + glow * 26}px rgba(255,190,90,${0.35 + glow * 0.45}), 0 4px 16px rgba(0,0,0,0.55)`
                : "0 3px 14px rgba(0,0,0,0.6), 0 1px 3px rgba(0,0,0,0.5)",
              letterSpacing: t.hl ? 0.5 : -0.3,
            }}
          >
            {t.word}
          </span>
        );
      })}
    </div>
  );
};
