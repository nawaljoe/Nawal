import React from "react";
import { useCurrentFrame } from "remotion";
import { pop, tween } from "../anim";
import { BODY, C, HEAD } from "../theme";

/** Word token: wrap a word in *asterisks* to draw it as a gold highlight pill. */
const tokens = (text: string) =>
  text.split(" ").map((w) => {
    const hl = w.startsWith("*");
    return { word: w.replace(/\*/g, ""), hl };
  });

/** A gold-on-charcoal pill used for highlight words (keeps gold legible). */
export const Pill: React.FC<{ children: React.ReactNode; pad?: number; radius?: number; style?: React.CSSProperties }> = ({
  children,
  pad = 0.18,
  radius = 0.22,
  style,
}) => (
  <span
    style={{
      background: C.ink,
      color: C.gold,
      padding: `${pad * 0.5}em ${pad}em ${pad * 0.35}em`,
      borderRadius: `${radius}em`,
      display: "inline-block",
      ...style,
    }}
  >
    {children}
  </span>
);

/**
 * Kinetic headline: words pop in one by one with overshoot.
 * `at` = local frame of the first word, `stagger` frames between words,
 * or `times` = one start frame per word (to follow the voice-over).
 */
export const PopWords: React.FC<{
  text: string;
  at?: number;
  stagger?: number;
  times?: number[];
  size?: number;
  color?: string;
  font?: "head" | "body";
  weight?: number;
  lineHeight?: number;
  align?: "center" | "left";
  out?: number; // local frame to start exiting
  style?: React.CSSProperties;
  maxWidth?: number;
}> = ({
  text,
  at = 0,
  stagger = 3,
  times,
  size = 96,
  color = C.ink,
  font = "head",
  weight = 800,
  lineHeight = 1.08,
  align = "center",
  out,
  style,
  maxWidth = 900,
}) => {
  const frame = useCurrentFrame();
  const t = tokens(text);
  const exit = out === undefined ? 0 : tween(frame, [out, out + 8], [0, 1]);
  return (
    <div
      style={{
        fontFamily: font === "head" ? HEAD : BODY,
        fontWeight: weight,
        fontSize: size,
        lineHeight,
        color,
        textAlign: align,
        maxWidth,
        textTransform: font === "head" ? "uppercase" : undefined,
        letterSpacing: font === "head" ? "-0.01em" : undefined,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: align === "center" ? "center" : "flex-start",
        columnGap: "0.26em",
        rowGap: "0.08em",
        opacity: 1 - exit,
        translate: `0 ${-exit * 40}px`,
        ...style,
      }}
    >
      {t.map((tok, i) => {
        const start = times ? times[Math.min(i, times.length - 1)] : at + i * stagger;
        const s = pop(frame, start, 190, 10);
        const vis = frame >= start;
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity: vis ? Math.min(1, s * 1.6) : 0,
              scale: `${0.3 + 0.7 * s}`,
              translate: `0 ${(1 - s) * 50}px`,
              rotate: `${(1 - s) * (i % 2 ? 8 : -8)}deg`,
            }}
          >
            {tok.hl ? <Pill>{tok.word}</Pill> : tok.word}
          </span>
        );
      })}
    </div>
  );
};

/** Animated masking: text slides up from behind a mask line. */
export const MaskReveal: React.FC<{
  children: React.ReactNode;
  at: number;
  dur?: number;
  out?: number;
  style?: React.CSSProperties;
}> = ({ children, at, dur = 14, out, style }) => {
  const frame = useCurrentFrame();
  const p = tween(frame, [at, at + dur], [0, 1]);
  const o = out === undefined ? 0 : tween(frame, [out, out + 10], [0, 1]);
  return (
    <div style={{ overflow: "hidden", paddingBottom: "0.06em", ...style }}>
      <div style={{ translate: `0 ${(1 - p) * 110 - o * 110}%`, opacity: p > 0 ? 1 : 0 }}>{children}</div>
    </div>
  );
};

/** Hand-drawn strike-through over a phrase. */
export const StrikeText: React.FC<{
  text: string;
  at: number;
  strikeAt: number;
  size?: number;
  color?: string;
}> = ({ text, at, strikeAt, size = 60, color = C.ink }) => {
  const frame = useCurrentFrame();
  const s = pop(frame, at, 190, 12);
  const k = tween(frame, [strikeAt, strikeAt + 9], [0, 1]);
  return (
    <div
      style={{
        position: "relative",
        display: "inline-block",
        fontFamily: BODY,
        fontWeight: 700,
        fontSize: size,
        color,
        opacity: frame >= at ? Math.min(1, s * 1.5) * (1 - k * 0.45) : 0,
        scale: `${0.5 + 0.5 * s}`,
        padding: "0 0.2em",
      }}
    >
      {text}
      <svg
        viewBox="0 0 100 20"
        preserveAspectRatio="none"
        style={{ position: "absolute", left: 0, top: "38%", width: "100%", height: "0.4em", overflow: "visible" }}
      >
        <path
          d="M0 12 Q30 4 55 10 T100 7"
          pathLength={1}
          strokeDasharray="1 1"
          strokeDashoffset={1 - k}
          stroke={C.gold}
          strokeWidth={12}
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </div>
  );
};
