import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, montserrat, playfair } from "./theme";

const fadeInOut = (frame: number, dur: number, inF = 12, outF = 12) =>
  interpolate(frame, [0, inF, dur - outF, dur], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

/** Small gold pill near the top: names the part of the talk we are in. */
export const SectionChip: React.FC<{ kicker: string; label: string; dur: number }> = ({ kicker, label, dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 20, stiffness: 160 } });
  const o = fadeInOut(frame, dur, 10, 18);
  const sweep = interpolate(frame, [8, 38], [-120, 120], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div
      style={{
        position: "absolute",
        top: 292,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        opacity: o,
        transform: `translateY(${interpolate(s, [0, 1], [-30, 0])}px)`,
      }}
    >
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          gap: 18,
          padding: "16px 34px",
          borderRadius: 999,
          background: C.glass,
          border: "2px solid rgba(242,196,109,0.75)",
          boxShadow: "0 10px 40px rgba(0,0,0,0.35)",
          backdropFilter: "blur(6px)",
          fontFamily: montserrat,
        }}
      >
        <span style={{ color: C.gold, fontWeight: 800, fontSize: 26, letterSpacing: "0.2em" }}>{kicker}</span>
        <span style={{ width: 2, height: 30, background: "rgba(242,196,109,0.6)" }} />
        <span style={{ color: C.ink, fontWeight: 700, fontSize: 36 }}>{label}</span>
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(100deg, transparent 30%, rgba(255,236,190,0.35) 50%, transparent 70%)",
            transform: `translateX(${sweep}%)`,
          }}
        />
      </div>
    </div>
  );
};

/** Glass card in the upper third (over the cabinets), used for definitions. */
export const InfoCard: React.FC<{ kicker: string; title: React.ReactNode; body: React.ReactNode; dur: number }> = ({
  kicker,
  title,
  body,
  dur,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 22, stiffness: 140 } });
  const o = fadeInOut(frame, dur, 12, 18);
  const rule = interpolate(frame, [10, 34], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  return (
    <div
      style={{
        position: "absolute",
        top: 288,
        left: 90,
        right: 90,
        padding: "30px 42px 34px",
        borderRadius: 34,
        background: "linear-gradient(160deg, rgba(18,20,28,0.80), rgba(10,12,16,0.66))",
        border: "1.5px solid rgba(242,196,109,0.45)",
        boxShadow: "0 30px 80px rgba(0,0,0,0.45)",
        fontFamily: montserrat,
        opacity: o,
        transform: `translateY(${interpolate(s, [0, 1], [40, 0])}px) scale(${interpolate(s, [0, 1], [0.96, 1])})`,
      }}
    >
      <div style={{ color: C.gold, fontWeight: 800, fontSize: 26, letterSpacing: "0.22em" }}>{kicker}</div>
      <div style={{ color: C.ink, fontWeight: 900, fontSize: 56, marginTop: 8, lineHeight: 1.05 }}>{title}</div>
      <div
        style={{
          height: 4,
          width: `${rule * 100}%`,
          margin: "16px 0 14px",
          borderRadius: 2,
          background: `linear-gradient(90deg, ${C.gold}, rgba(242,196,109,0))`,
        }}
      />
      <div style={{ color: "rgba(255,255,255,0.92)", fontWeight: 600, fontSize: 34, lineHeight: 1.28 }}>{body}</div>
    </div>
  );
};

/** Grounds for fasakh — items tick in one by one, timed to the ustaz. */
export const Checklist: React.FC<{
  items: { text: string; at: number }[];
  dur: number;
  title: string;
  /** [start, end] in frames (relative) where the card moves to centre stage while the ustaz reads. */
  focus?: [number, number][];
}> = ({ items, dur, title, focus = [] }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 22, stiffness: 140 } });
  const o = fadeInOut(frame, dur, 12, 20);
  const f = Math.max(
    0,
    ...focus.map(([a, b]) =>
      interpolate(frame, [a, a + 14, b - 12, b], [0, 1, 1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.inOut(Easing.cubic),
      }),
    ),
  );
  return (
    <div
      style={{
        position: "absolute",
        top: 282,
        left: 90,
        right: 90,
        padding: "24px 36px 16px",
        transformOrigin: "50% 0%",
        borderRadius: 34,
        background: "linear-gradient(160deg, rgba(18,20,28,0.82), rgba(10,12,16,0.68))",
        border: "1.5px solid rgba(242,196,109,0.45)",
        boxShadow: "0 30px 80px rgba(0,0,0,0.45)",
        fontFamily: montserrat,
        opacity: o,
        transform: `translateY(${interpolate(s, [0, 1], [40, 0]) + 330 * f}px) scale(${1 + 0.16 * f})`,
      }}
    >
      <div style={{ color: C.gold, fontWeight: 800, fontSize: 26, letterSpacing: "0.2em" }}>SEKSYEN 53</div>
      <div style={{ color: C.ink, fontWeight: 900, fontSize: 42, margin: "4px 0 8px" }}>{title}</div>
      {items.map((it, i) => {
        const f = frame - Math.round(it.at * fps);
        const p = spring({ frame: f, fps, config: { damping: 16, stiffness: 200 } });
        const shown = f >= 0;
        const tick = interpolate(f, [4, 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 22,
              padding: "9px 0",
              borderTop: i ? "1px solid rgba(255,255,255,0.10)" : "none",
              opacity: shown ? interpolate(p, [0, 1], [0, 1]) : 0.0,
              transform: `translateX(${shown ? interpolate(p, [0, 1], [-30, 0]) : -30}px)`,
            }}
          >
            <div
              style={{
                flex: "0 0 44px",
                height: 44,
                borderRadius: 22,
                border: `3px solid ${C.gold}`,
                background: `rgba(242,196,109,${0.9 * tick})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24">
                <path
                  d="M4 12.5l5 5L20 6.5"
                  fill="none"
                  stroke="#1A1408"
                  strokeWidth="3.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="26"
                  strokeDashoffset={26 * (1 - tick)}
                />
              </svg>
            </div>
            <div style={{ color: C.ink, fontWeight: 700, fontSize: 33, lineHeight: 1.2 }}>{it.text}</div>
          </div>
        );
      })}
    </div>
  );
};

/** Closing title over a darkened frame. */
export const EndCard: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - 4, fps, config: { damping: 24, stiffness: 110 } });
  const dim = interpolate(frame, [0, 24], [0, 0.62], { extrapolateRight: "clamp" });
  const sub = interpolate(frame, [26, 44], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const glint = interpolate(frame, [20, 60], [-60, 160], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: `rgba(6,7,10,${dim})` }} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", fontFamily: montserrat }}>
        <div style={{ textAlign: "center", transform: `scale(${interpolate(s, [0, 1], [1.12, 1])})`, opacity: s }}>
          <div style={{ color: C.gold, fontWeight: 800, fontSize: 30, letterSpacing: "0.32em" }}>ADA JALAN</div>
          <div
            style={{
              position: "relative",
              overflow: "hidden",
              fontFamily: playfair,
              fontStyle: "italic",
              fontWeight: 700,
              fontSize: 168,
              color: C.gold,
              lineHeight: 1.1,
              margin: "6px 0 4px",
              textShadow: "0 10px 50px rgba(0,0,0,0.6)",
            }}
          >
            Cerai Fasakh
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(100deg, transparent 35%, rgba(255,245,220,0.55) 50%, transparent 65%)",
                transform: `translateX(${glint}%)`,
                mixBlendMode: "screen",
              }}
            />
          </div>
          <div style={{ opacity: sub, color: C.ink, fontWeight: 700, fontSize: 42, lineHeight: 1.35 }}>
            Mohon perintah pembubaran
            <br />
            di Mahkamah Syariah
          </div>
          <div
            style={{
              opacity: sub,
              marginTop: 54,
              color: "rgba(255,255,255,0.75)",
              fontWeight: 600,
              fontSize: 32,
              letterSpacing: "0.06em",
            }}
          >
            Kongsikan kepada yang memerlukan
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Podcast-style finish: firm vignette and a caption floor — no haze or glow. */
export const LightLayer: React.FC = () => (
  <>
    <AbsoluteFill
      style={{
        background: "radial-gradient(ellipse 760px 1150px at 50% 44%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.5) 100%)",
      }}
    />
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0) 18%, rgba(0,0,0,0) 62%, rgba(0,0,0,0.42) 82%, rgba(0,0,0,0.58) 100%)",
      }}
    />
  </>
);

/** Blurred, dimmed footage behind a popup — hides the ustaz looking down at his notes. */
export const FocusBackdrop: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, 10, dur - 10, dur], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill
      style={{
        backdropFilter: `blur(${18 * p}px)`,
        WebkitBackdropFilter: `blur(${18 * p}px)`,
        background: `rgba(8,9,12,${0.5 * p})`,
      }}
    />
  );
};

/** Podcast "key point" popup: blurred backdrop + solid charcoal card, gold accent line. */
export const KeyPopup: React.FC<{
  dur: number;
  kicker: string;
  lines: string[];
  accent: string;
  accentDelay?: number; // frames
}> = ({ dur, kicker, lines, accent, accentDelay = 8 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 20, stiffness: 170 } });
  const out = interpolate(frame, [dur - 10, dur], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const acc = spring({ frame: frame - accentDelay, fps, config: { damping: 18, stiffness: 160 } });
  const bar = interpolate(frame, [6, 26], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  return (
    <>
      <FocusBackdrop dur={dur} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: out }}>
        <div
          style={{
            width: 900,
            padding: "46px 56px 52px",
            borderRadius: 28,
            background: "#121418",
            border: "1.5px solid rgba(242,196,109,0.55)",
            boxShadow: "0 40px 100px rgba(0,0,0,0.6)",
            fontFamily: montserrat,
            opacity: s,
            transform: `translateY(${interpolate(s, [0, 1], [60, 0])}px) scale(${interpolate(s, [0, 1], [0.94, 1])})`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 54 * bar, height: 4, background: C.gold, borderRadius: 2 }} />
            <div style={{ color: C.gold, fontWeight: 800, fontSize: 28, letterSpacing: "0.24em" }}>{kicker}</div>
          </div>
          <div style={{ marginTop: 22, color: C.ink, fontWeight: 800, fontSize: 60, lineHeight: 1.12 }}>
            {lines.map((l, i) => (
              <div key={i}>{l}</div>
            ))}
          </div>
          <div
            style={{
              marginTop: 10,
              color: C.gold,
              fontWeight: 900,
              fontSize: 72,
              lineHeight: 1.08,
              opacity: acc,
              transform: `translateY(${interpolate(acc, [0, 1], [24, 0])}px)`,
            }}
          >
            {accent}
          </div>
        </div>
      </AbsoluteFill>
    </>
  );
};

/** Name super for the speaker — podcast lower third. */
export const LowerThird: React.FC<{ dur: number; name: string; role: string; org: string }> = ({ dur, name, role, org }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 22, stiffness: 150 } });
  const out = interpolate(frame, [dur - 14, dur], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const bar = interpolate(frame, [0, 14], [0, 1], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const t2 = spring({ frame: frame - 6, fps, config: { damping: 22, stiffness: 150 } });
  return (
    <div
      style={{
        position: "absolute",
        left: 56,
        top: 1112,
        display: "flex",
        gap: 22,
        opacity: out,
        fontFamily: montserrat,
      }}
    >
      <div style={{ width: 7, borderRadius: 4, background: C.gold, transform: `scaleY(${bar})`, transformOrigin: "50% 0%" }} />
      <div
        style={{
          padding: "18px 30px 20px 24px",
          borderRadius: 14,
          background: "linear-gradient(90deg, rgba(12,13,16,0.86), rgba(12,13,16,0.62))",
          clipPath: `inset(0 ${100 - 100 * s}% 0 0)`,
        }}
      >
        <div style={{ color: C.ink, fontWeight: 800, fontSize: 44, lineHeight: 1.1 }}>{name}</div>
        <div
          style={{
            marginTop: 8,
            color: "rgba(255,255,255,0.86)",
            fontWeight: 600,
            fontSize: 25,
            lineHeight: 1.3,
            whiteSpace: "pre-line",
            opacity: t2,
          }}
        >
          {role}
        </div>
        <div style={{ marginTop: 4, color: C.gold, fontWeight: 700, fontSize: 25, opacity: t2 }}>{org}</div>
      </div>
    </div>
  );
};
