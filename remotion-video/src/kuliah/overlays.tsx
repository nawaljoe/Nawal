import { createTikTokStyleCaptions, type Caption } from "@remotion/captions";
import React, { useMemo } from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { arabic, palette, sans, serif } from "./fonts";

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;
const calm = Easing.bezier(0.33, 0, 0.2, 1);

/** 0 → 1 → 0 envelope over a clip of `dur` frames, with soft edges. */
const envelope = (frame: number, dur: number, edge: number) =>
  interpolate(frame, [0, edge, dur - edge, dur], [0, 1, 1, 0], {
    ...clamp,
    easing: calm,
  });

export const ChapterCard: React.FC<{
  label: string;
  title: string;
  dur: number;
}> = ({ label, title, dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const o = envelope(frame, dur, Math.round(0.9 * fps));
  const rise = interpolate(frame, [0, 1.4 * fps], [26, 0], {
    ...clamp,
    easing: calm,
  });
  const blur = interpolate(frame, [0, 1.2 * fps], [12, 0], clamp);
  const rule = interpolate(frame, [0.3 * fps, 1.5 * fps], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });

  return (
    <AbsoluteFill style={{ opacity: o }}>
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(7,9,12,0) 36%, rgba(7,9,12,0.7) 58%, rgba(7,9,12,0.82) 100%)",
        }}
      />
      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          alignItems: "center",
          paddingBottom: 470,
          translate: `0px ${rise}px`,
          filter: `blur(${blur}px)`,
        }}
      >
        <div
          style={{
            fontFamily: sans,
            fontWeight: 500,
            fontSize: 30,
            letterSpacing: "0.34em",
            textTransform: "uppercase",
            color: palette.gold,
          }}
        >
          {label}
        </div>
        <div
          style={{
            width: 240,
            height: 2,
            background: palette.gold,
            opacity: 0.85,
            margin: "34px 0 22px",
            scale: `${rule} 1`,
          }}
        />
        <div
          style={{
            fontFamily: serif,
            fontWeight: 600,
            fontSize: 176,
            lineHeight: 1,
            color: palette.ink,
            textShadow: "0 6px 40px rgba(0,0,0,0.45)",
          }}
        >
          {title}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const QuoteCard: React.FC<{
  arabicText: string | null;
  text: string;
  source: string | null;
  dur: number;
}> = ({ arabicText, text, source, dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const o = envelope(frame, dur, Math.round(1.0 * fps));
  const textIn = interpolate(frame, [0.6 * fps, 2.0 * fps], [0, 1], {
    ...clamp,
    easing: calm,
  });

  return (
    <AbsoluteFill style={{ opacity: o }}>
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(7,9,12,0) 26%, rgba(7,9,12,0.76) 48%, rgba(7,9,12,0.88) 100%)",
        }}
      />
      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          alignItems: "center",
          padding: "0 84px 470px",
          textAlign: "center",
        }}
      >
        {arabicText ? (
          <div
            style={{
              fontFamily: arabic,
              fontSize: arabicText.length > 50 ? 50 : 58,
              lineHeight: 1.7,
              color: palette.gold,
              direction: "rtl",
              marginBottom: 34,
            }}
          >
            {arabicText}
          </div>
        ) : null}
        <div
          style={{
            opacity: textIn,
            translate: `0px ${(1 - textIn) * 16}px`,
            fontFamily: serif,
            fontStyle: "italic",
            fontWeight: 500,
            fontSize: arabicText ? 48 : 58,
            lineHeight: 1.32,
            color: palette.ink,
            whiteSpace: "pre-line",
          }}
        >
          {arabicText ? `“${text}”` : text}
        </div>
        {source ? (
          <div
            style={{
              opacity: textIn,
              marginTop: 30,
              fontFamily: sans,
              fontSize: 28,
              letterSpacing: "0.12em",
              color: palette.muted,
            }}
          >
            {source}
          </div>
        ) : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Opening hook: lines build up over the ustaz's soundbite. */
export const HookText: React.FC<{
  lines: { at: number; text: string; tone: string }[];
}> = ({ lines }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(7,9,12,0) 34%, rgba(7,9,12,0.72) 56%, rgba(7,9,12,0.85) 100%)",
          opacity: interpolate(frame, [0, 0.5 * fps], [0, 1], clamp),
        }}
      />
      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          alignItems: "center",
          padding: "0 80px 470px",
          textAlign: "center",
          gap: 26,
        }}
      >
        {lines.map((l) => {
          const local = frame - l.at * fps;
          const o = interpolate(local, [0, 0.7 * fps], [0, 1], {
            ...clamp,
            easing: calm,
          });
          const gold = l.tone === "gold";
          return (
            <div
              key={l.text}
              style={{
                opacity: o,
                translate: `0px ${(1 - o) * 22}px`,
                filter: `blur(${(1 - o) * 10}px)`,
                fontFamily: serif,
                fontWeight: gold ? 500 : 600,
                fontStyle: gold ? "italic" : "normal",
                fontSize: gold ? 74 : 80,
                lineHeight: 1.08,
                color: gold ? palette.gold : palette.ink,
                whiteSpace: "pre-line",
                textShadow: "0 6px 36px rgba(0,0,0,0.55)",
              }}
            >
              {l.text}
            </div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Word captions from ElevenLabs Scribe; renders nothing while the list is empty. */
export const Captions: React.FC<{
  captions: Caption[];
  hiddenRanges: [number, number][];
}> = ({ captions, hiddenRanges }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { pages } = useMemo(
    () =>
      createTikTokStyleCaptions({
        captions,
        combineTokensWithinMilliseconds: 1400,
      }),
    [captions],
  );
  const ms = (frame / fps) * 1000;
  const page = pages.find(
    (p) => ms >= p.startMs && ms < p.startMs + p.durationMs,
  );
  if (!page || hiddenRanges.some(([a, b]) => frame >= a && frame < b)) {
    return null;
  }
  const pageIn = interpolate(ms - page.startMs, [0, 220], [0, 1], clamp);

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        padding: "0 90px 470px",
      }}
    >
      <div
        style={{
          opacity: pageIn,
          textAlign: "center",
          fontFamily: serif,
          fontWeight: 600,
          fontSize: 68,
          lineHeight: 1.18,
          textShadow: "0 4px 24px rgba(0,0,0,0.7)",
        }}
      >
        {page.tokens.map((t) => {
          const active = ms >= t.fromMs && ms < t.toMs;
          const spoken = ms >= t.fromMs;
          return (
            <span
              key={t.fromMs}
              style={{
                color: active ? palette.gold : palette.ink,
                opacity: spoken ? 1 : 0.55,
              }}
            >
              {t.text}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/** Film look: vignette, soft warm light and moving grain. */
export const FilmLook: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = Math.sin(frame / 140) * 60;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 70% 45% at ${20 + drift / 10}% 8%, rgba(255,196,128,0.16) 0%, rgba(255,196,128,0) 70%)`,
          mixBlendMode: "screen",
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 85% 70% at 50% 45%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.42) 100%)",
        }}
      />
      <svg
        width="100%"
        height="100%"
        style={{ position: "absolute", opacity: 0.05, mixBlendMode: "overlay" }}
      >
        <filter id="grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.85"
            numOctaves="2"
            seed={frame % 24}
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
    </AbsoluteFill>
  );
};
