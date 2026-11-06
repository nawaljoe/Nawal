import React from "react";
import { useCurrentFrame } from "remotion";
import { pop } from "../anim";
import { TIMING, Word } from "../timing";
import { BODY, C, FPS } from "../theme";

/** Group the spoken words into short caption lines (max ~4 words / 22 chars). */
const buildLines = (words: Word[]) => {
  const lines: Word[][] = [];
  let cur: Word[] = [];
  const len = (ws: Word[]) => ws.reduce((n, w) => n + w.text.length + 1, 0);
  words.forEach((w, i) => {
    const prev = words[i - 1];
    const newScene = prev && prev.scene !== w.scene;
    const gap = prev ? w.start - prev.end : 0;
    if (cur.length && (newScene || gap > 0.35 || cur.length >= 4 || len(cur) + w.text.length > 22)) {
      lines.push(cur);
      cur = [];
    }
    cur.push(w);
    if (/[.?!]$/.test(w.text)) {
      lines.push(cur);
      cur = [];
    }
  });
  if (cur.length) lines.push(cur);
  return lines;
};

const LINES = buildLines(TIMING.words);

/**
 * Word-by-word subtitles that follow the voice-over, sitting inside the
 * TikTok safe zone. Highlight words (KOMITMEN, ZAKAT, WAJIB, MAINJ...) use
 * Poppins Bold in gold on a charcoal pill.
 * Pass `offsetFrames` when rendered inside a scene Sequence.
 */
export const Subtitles: React.FC<{ offsetFrames?: number; y?: number; hideAfter?: number }> = ({
  offsetFrames = 0,
  y = 1395,
  hideAfter = 55.4,
}) => {
  const frame = useCurrentFrame() + offsetFrames;
  const t = frame / FPS;
  if (t > hideAfter) return null; // end card carries its own text
  const idx = LINES.findIndex((l, i) => {
    const next = LINES[i + 1];
    const end = next ? Math.min(next[0].start - 0.02, l[l.length - 1].end + 0.6) : l[l.length - 1].end + 0.6;
    return t >= l[0].start - 0.08 && t < end;
  });
  if (idx < 0) return null;
  const line = LINES[idx];
  const lineIn = pop(frame, Math.round((line[0].start - 0.08) * FPS), 220, 14);
  return (
    <div
      style={{
        position: "absolute",
        left: 80,
        right: 160,
        top: y,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          columnGap: 16,
          rowGap: 6,
          padding: "14px 26px",
          borderRadius: 22,
          background: "rgba(245,241,232,0.94)",
          boxShadow: "0 0 0 3px rgba(41,41,41,0.08)",
          fontFamily: BODY,
          fontWeight: 500,
          fontSize: 54,
          lineHeight: 1.18,
          color: C.ink,
          scale: `${0.92 + 0.08 * lineIn}`,
          opacity: Math.min(1, lineIn * 2),
        }}
      >
        {line.map((w, i) => {
          const on = t >= w.start - 0.04;
          const s = pop(frame, Math.round((w.start - 0.04) * FPS), 260, 12);
          const speaking = t >= w.start - 0.04 && t < w.end + 0.05;
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                opacity: on ? 1 : 0.28,
                scale: on ? `${1 + (speaking ? 0.06 : 0) * s}` : "1",
                translate: `0 ${on ? (1 - s) * 8 : 0}px`,
                ...(w.hl
                  ? {
                      fontWeight: 700,
                      color: C.gold,
                      background: C.ink,
                      borderRadius: 12,
                      padding: "0 12px",
                    }
                  : {}),
              }}
            >
              {w.text}
            </span>
          );
        })}
      </div>
    </div>
  );
};
