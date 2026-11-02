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
export const Checklist: React.FC<{ items: { text: string; at: number }[]; dur: number; title: string }> = ({
  items,
  dur,
  title,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 22, stiffness: 140 } });
  const o = fadeInOut(frame, dur, 12, 20);
  return (
    <div
      style={{
        position: "absolute",
        top: 282,
        left: 90,
        right: 90,
        padding: "24px 36px 16px",
        borderRadius: 34,
        background: "linear-gradient(160deg, rgba(18,20,28,0.82), rgba(10,12,16,0.68))",
        border: "1.5px solid rgba(242,196,109,0.45)",
        boxShadow: "0 30px 80px rgba(0,0,0,0.45)",
        fontFamily: montserrat,
        opacity: o,
        transform: `translateY(${interpolate(s, [0, 1], [40, 0])}px)`,
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
  const tail = interpolate(frame, [dur - 30, dur], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const glint = interpolate(frame, [20, 60], [-60, 160], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ opacity: tail }}>
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

/** Premium light: slow warm key glow + edge falloff, layered over the graded footage. */
export const LightLayer: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = Math.sin(frame / 140) * 40;
  const breathe = 0.13 + 0.03 * Math.sin(frame / 90);
  return (
    <>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 620px 720px at ${560 + drift}px 820px, rgba(255,214,160,${breathe}) 0%, rgba(255,200,140,0) 70%)`,
          mixBlendMode: "screen",
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 820px 1200px at 50% 46%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.38) 100%)",
        }}
      />
      <AbsoluteFill
        style={{
          background: `linear-gradient(115deg, rgba(255,190,120,0) 30%, rgba(255,190,120,${0.05 + 0.02 * Math.sin(frame / 70)}) 45%, rgba(255,190,120,0) 60%)`,
          mixBlendMode: "screen",
        }}
      />
      {/* Caption floor: soft dark gradient so captions read on the desk */}
      <AbsoluteFill
        style={{
          background: "linear-gradient(180deg, rgba(0,0,0,0) 62%, rgba(0,0,0,0.42) 82%, rgba(0,0,0,0.55) 100%)",
        }}
      />
    </>
  );
};
