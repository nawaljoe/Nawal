import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import captions from "./captions.json";
import { C, montserrat } from "./theme";

type Word = { t: string; s: number; e: number };
type Page = { s: number; e: number; words: Word[] };

const PAGES = captions as Page[];

// Words that get the gold "keyword" treatment even when not being spoken.
const KEYWORDS = new Set([
  "fasakh",
  "talak",
  "nafkah",
  "mahkamah",
  "syariah",
  "kemudaratan",
  "mudarat",
  "perceraian",
  "pembubaran",
  "syarat-syarat",
  "menganiaya",
  "menyakiti",
  "menderita",
  "batin",
  "53",
]);

export const Captions: React.FC<{ hideBefore: number; hideRanges: [number, number][] }> = ({
  hideBefore,
  hideRanges,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  if (t < hideBefore) return null;
  if (hideRanges.some(([a, b]) => t >= a && t < b)) return null;

  // Keep a page on screen until the next one starts (max 0.6s linger) so captions never flicker.
  const idx = PAGES.findIndex((p, i) => {
    const next = PAGES[i + 1];
    const end = next ? Math.min(next.s, p.e + 0.6) : p.e + 0.8;
    return t >= p.s - 0.05 && t < end;
  });
  if (idx < 0) return null;
  const page = PAGES[idx];
  if (page.s < hideBefore) return null;

  const enterF = Math.round((page.s - 0.05) * fps);
  const pop = spring({ frame: frame - enterF, fps, config: { damping: 18, stiffness: 220, mass: 0.6 } });

  return (
    <div
      style={{
        position: "absolute",
        left: 70,
        right: 70,
        top: 1370,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "baseline",
        columnGap: 18,
        rowGap: 4,
        fontFamily: montserrat,
        fontWeight: 800,
        fontSize: 64,
        lineHeight: 1.18,
        textAlign: "center",
        opacity: interpolate(pop, [0, 1], [0, 1]),
        transform: `translateY(${interpolate(pop, [0, 1], [18, 0])}px) scale(${interpolate(pop, [0, 1], [0.94, 1])})`,
      }}
    >
      {page.words.map((w, i) => {
        const active = t >= w.s - 0.04 && t < w.e + 0.02;
        const spoken = t >= w.s - 0.04;
        const key = KEYWORDS.has(w.t.toLowerCase());
        const color = active ? C.gold : key && spoken ? C.gold : C.ink;
        return (
          <span
            key={i}
            style={{
              color,
              opacity: spoken ? 1 : 0.55,
              display: "inline-block",
              transform: active ? "scale(1.06)" : "scale(1)",
              textShadow:
                "0 4px 18px rgba(0,0,0,0.75), 0 0 2px rgba(0,0,0,0.9), 0 2px 0 rgba(0,0,0,0.35)",
              WebkitTextStroke: "1.5px rgba(0,0,0,0.25)",
            }}
          >
            {w.t}
          </span>
        );
      })}
    </div>
  );
};
