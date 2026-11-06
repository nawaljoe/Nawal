import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, clamp } from "../theme";
import type { Caption } from "../types";

/**
 * Mobile-size Malay subtitles: max two lines, warm white, selected keywords in antique gold.
 * Anchored to the bottom of the 9:16 safe band (y ≤ 1330) so platform UI never covers them
 * and they sit well below the speaker's face. One group at a time, blur-in / hard-kill exit.
 */
export const KeywordCaptions: React.FC<{ captions: Caption[] }> = ({ captions }) => {
  const f = useCurrentFrame();
  const cur = captions.find((c) => f >= c.from && f < c.to);
  if (!cur) return null;
  const tin = interpolate(f, [cur.from, cur.from + 5], [0, 1], clamp);
  const tout = interpolate(f, [cur.to - 4, cur.to], [1, 0], clamp);
  const parts = splitKeywords(cur.text, cur.kw);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, width: 1080, top: 1060, height: 262, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
        <div style={{
          maxWidth: 920, textAlign: "center", padding: "12px 28px 14px", borderRadius: 18,
          background: "rgba(11,11,12,0.46)", border: "1px solid rgba(201,164,92,0.22)",
          fontFamily: "SS-Montserrat", fontWeight: 600, fontSize: 54, lineHeight: 1.22, letterSpacing: 0.2, textWrap: "balance",
          color: C.white, textShadow: "0 2px 10px rgba(0,0,0,0.6)",
          opacity: Math.min(tin, tout), filter: `blur(${(1 - tin) * 6}px)`,
        }}>
          {parts.map((p, i) => (
            <span key={i} style={{ color: p.kw ? C.goldLight : C.white }}>{p.t}</span>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

function splitKeywords(text: string, kws: string[]) {
  const out: { t: string; kw: boolean }[] = [];
  let rest = text;
  while (rest.length) {
    let best = -1, len = 0;
    for (const k of kws) {
      const i = rest.toLowerCase().indexOf(k.toLowerCase());
      if (i >= 0 && (best < 0 || i < best)) { best = i; len = k.length; }
    }
    if (best < 0) { out.push({ t: rest, kw: false }); break; }
    if (best > 0) out.push({ t: rest.slice(0, best), kw: false });
    out.push({ t: rest.slice(best, best + len), kw: true });
    rest = rest.slice(best + len);
  }
  return out;
}
