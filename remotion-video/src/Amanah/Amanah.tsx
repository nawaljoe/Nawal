import React from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  OffthreadVideo,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import { fonts } from "./fonts";
import { PopText } from "./PopText";
import {
  BRoll,
  INTRO_BROLL,
  INTRO_FRAMES,
  MAIN_FRAMES,
  OUTRO_FRAMES,
  OUTRO_XFADE,
  TIMELINE,
  TITLE_FRAMES,
} from "./script";

export const amanahSchema = z.object({
  music: z.boolean(),
});
type Props = z.infer<typeof amanahSchema>;

// Zon teks "lower third": muka dalam rakaman kebanyakannya pada y 350-1000
// (dikesan dengan YuNet), jadi teks diletak di bawah supaya tak tutup muka.
// Watermark FK ~y1530, UI kapsyen TikTok bermula ~y1550.
const TEXT_ZONE = { top: 1040, bottom: 1490 };
const XFADE = 8; // frame silang antara klip

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/* ───────────── Latar: rakaman lapangan penuh skrin ─────────────
   Klip dipapar tepat 1:1 (tanpa zoom) supaya logo & watermark yang sudah
   ada dalam klip asal jatuh tepat di bawah overlay logo — tiada logo berganda. */
const BRollClip: React.FC<{ b: BRoll }> = ({ b }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fadeIn = interpolate(frame, [0, XFADE], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ opacity: fadeIn }}>
      <OffthreadVideo
        src={staticFile(`broll/${b.src}`)}
        startFrom={Math.round(b.from * fps)}
        muted
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    </AbsoluteFill>
  );
};

const BRollBackground: React.FC = () => {
  const segs = [
    { b: INTRO_BROLL, start: 0, duration: INTRO_FRAMES },
    ...TIMELINE.map((c) => ({
      b: c.broll!,
      start: c.start,
      duration: c.duration,
    })),
  ];
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {segs.map((s, i) => (
        <Sequence
          key={i}
          from={Math.max(0, s.start - (i === 0 ? 0 : XFADE))}
          durationInFrames={s.duration + XFADE * 2}
          layout="none"
        >
          <BRollClip b={s.b} />
        </Sequence>
      ))}
      {/* muka kekal terang; jalur gelap di bawah untuk teks */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.30) 0%, rgba(0,0,0,0.12) 18%, rgba(0,0,0,0.10) 42%, rgba(0,0,0,0.55) 56%, rgba(0,0,0,0.78) 70%, rgba(0,0,0,0.78) 82%, rgba(0,0,0,0.55) 100%)",
        }}
      />
      {/* vignette */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.5) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

/* ───────────── Tajuk pembukaan ───────────── */
const IntroTitle: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const letters = "AMANAH".split("");
  const out = interpolate(
    frame,
    [TITLE_FRAMES - 12, TITLE_FRAMES],
    [0, 1],
    clamp,
  );
  const sub = spring({ frame: frame - 18, fps, config: { damping: 16 } });
  const line = interpolate(frame, [14, 40], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  return (
    <AbsoluteFill
      style={{
        top: TEXT_ZONE.top,
        height: TEXT_ZONE.bottom - TEXT_ZONE.top,
        justifyContent: "center",
        alignItems: "center",
        opacity: 1 - out,
        filter: `blur(${out * 10}px)`,
        transform: `scale(${1 + out * 0.08})`,
      }}
    >
      <div style={{ display: "flex" }}>
        {letters.map((l, i) => {
          const s = spring({
            frame: frame - 1 - i * 3,
            fps,
            config: { damping: 10, stiffness: 160, mass: 0.7 },
          });
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                fontFamily: fonts.serifUpright,
                fontWeight: 800,
                fontSize: 176,
                letterSpacing: 6,
                color: "#FFD27A",
                transform: `translateY(${(1 - s) * 70}px) scale(${0.3 + 0.7 * s})`,
                opacity: Math.min(1, s * 1.5),
                textShadow:
                  "0 0 40px rgba(255,180,80,0.5), 0 6px 24px rgba(0,0,0,0.7)",
              }}
            >
              {l}
            </span>
          );
        })}
      </div>
      <div
        style={{ display: "flex", alignItems: "center", gap: 22, marginTop: 4 }}
      >
        <div
          style={{
            width: 110 * line,
            height: 2,
            background: "linear-gradient(90deg, rgba(255,210,122,0), #FFD27A)",
          }}
        />
        <div
          style={{
            fontFamily: fonts.sans,
            fontWeight: 700,
            fontSize: 44,
            letterSpacing: 12,
            color: "white",
            opacity: sub,
            transform: `translateY(${(1 - sub) * 24}px)`,
            textShadow: "0 3px 14px rgba(0,0,0,0.7)",
          }}
        >
          SEORANG PEMIMPIN
        </div>
        <div
          style={{
            width: 110 * line,
            height: 2,
            background: "linear-gradient(90deg, #FFD27A, rgba(255,210,122,0))",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

/* label kecil di bawah logo selepas tajuk */
const HeaderPill: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({
    frame: frame - INTRO_FRAMES + 4,
    fps,
    config: { damping: 18 },
  });
  const out = interpolate(
    frame,
    [MAIN_FRAMES - 20, MAIN_FRAMES - 4],
    [0, 1],
    clamp,
  );
  return (
    <div
      style={{
        position: "absolute",
        top: 272,
        width: "100%",
        display: "flex",
        justifyContent: "center",
        opacity: s * (1 - out),
        transform: `translateY(${(1 - s) * -30}px)`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "12px 30px",
          borderRadius: 999,
          border: "1.5px solid rgba(255,210,122,0.7)",
          background: "rgba(10,10,14,0.45)",
          backdropFilter: "blur(6px)",
        }}
      >
        <span style={{ color: "#FFD27A", fontSize: 22 }}>✦</span>
        <span
          style={{
            fontFamily: fonts.sans,
            fontWeight: 700,
            fontSize: 28,
            letterSpacing: 6,
            color: "white",
          }}
        >
          AMANAH SEORANG PEMIMPIN
        </span>
        <span style={{ color: "#FFD27A", fontSize: 22 }}>✦</span>
      </div>
    </div>
  );
};

/* ───────────── Komposisi utama ───────────── */
export const Amanah: React.FC<Props> = ({ music }) => {
  const frame = useCurrentFrame();
  const fadeIn = interpolate(frame, [0, 3], [1, 0], clamp);
  const outroIn = interpolate(
    frame,
    [MAIN_FRAMES - OUTRO_XFADE, MAIN_FRAMES],
    [0, 1],
    clamp,
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <Sequence durationInFrames={MAIN_FRAMES} layout="none">
        <BRollBackground />

        <Sequence durationInFrames={TITLE_FRAMES} layout="none">
          <IntroTitle />
        </Sequence>
        <HeaderPill />

        {TIMELINE.map((c, i) => (
          <Sequence
            key={i}
            from={c.start}
            durationInFrames={c.duration}
            layout="none"
          >
            <AbsoluteFill
              style={{
                top: TEXT_ZONE.top,
                height: TEXT_ZONE.bottom - TEXT_ZONE.top,
                padding: "0 80px",
                justifyContent: "center",
              }}
            >
              <PopText
                text={c.text}
                duration={c.duration}
                fontSize={c.finale ? 66 : 62}
              />
            </AbsoluteFill>
          </Sequence>
        ))}

        {music && <Audio src={staticFile("audio/amanah-ambient.wav")} />}

        {/* overlay logo jenama (Johor + Maju Johor + watermark FK) */}
        <Img
          src={staticFile("brand/logo-overlay.png")}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
          }}
        />

        {/* grain filem halus */}
        <AbsoluteFill
          style={{
            backgroundImage: `url(${staticFile("fx/grain.png")})`,
            backgroundPosition: `${(frame * 137) % 512}px ${(frame * 251) % 512}px`,
            mixBlendMode: "overlay",
            opacity: 0.14,
          }}
        />
        <AbsoluteFill style={{ backgroundColor: "black", opacity: fadeIn }} />
      </Sequence>

      {/* Outro FK */}
      <Sequence
        from={MAIN_FRAMES - OUTRO_XFADE}
        durationInFrames={OUTRO_FRAMES}
        layout="none"
      >
        <AbsoluteFill style={{ opacity: outroIn }}>
          <OffthreadVideo
            src={staticFile("brand/fk-outro.mp4")}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
