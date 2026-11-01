import React from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  OffthreadVideo,
  Sequence,
  interpolate,
  random,
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
  FINALE_START,
  HOOK_FRAMES,
  HOOK_LINE1,
  HOOK_LINE2,
  HOOK_LINE2_AT,
  INTRO_BROLL,
  INTRO_FRAMES,
  TIMELINE,
  TITLE_FRAMES,
  MAIN_FRAMES,
  OUTRO_FRAMES,
  OUTRO_XFADE,
} from "./script";

export const amanahSchema = z.object({
  showBroll: z.boolean(),
  music: z.boolean(),
});
type Props = z.infer<typeof amanahSchema>;

// Susun atur (1080x1920, zon selamat TikTok diambil kira)
const CARD = { x: 80, y: 960, w: 920, h: 640, r: 34 };
const TEXT_ZONE = { top: 330, bottom: 935 }; // logo jenama di atas (~y 160-250)

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/* ───────────── Latar alam ───────────── */
const NatureBackground: React.FC = () => {
  const frame = useCurrentFrame();
  const zoom = interpolate(frame, [0, MAIN_FRAMES], [1.0, 1.08]);
  // Cahaya matahari berdenyut perlahan (matahari di kiri, ~y 47%)
  const pulse = 0.85 + 0.15 * Math.sin(frame / 45);
  return (
    <AbsoluteFill style={{ backgroundColor: "#0d1020" }}>
      <AbsoluteFill
        style={{ transform: `scale(${zoom})`, transformOrigin: "30% 50%" }}
      >
        <OffthreadVideo
          src={staticFile("nature/sunset.mp4")}
          muted
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </AbsoluteFill>
      {/* glow matahari */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 8% 47%, rgba(255,170,80,${0.42 * pulse}) 0%, rgba(255,120,60,${0.16 * pulse}) 22%, rgba(0,0,0,0) 48%)`,
          mixBlendMode: "screen",
        }}
      />
      {/* gelapkan atas untuk bacaan teks, gelapkan bawah sedikit */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(8,10,28,0.62) 0%, rgba(8,10,28,0.35) 30%, rgba(8,10,28,0.05) 52%, rgba(0,0,0,0.0) 62%, rgba(0,0,0,0.35) 100%)",
        }}
      />
      <Particles />
      {/* vignette */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

/* habuk cahaya keemasan terapung */
const Particles: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ mixBlendMode: "screen" }}>
      {new Array(34).fill(0).map((_, i) => {
        const sx = random(`x${i}`) * width;
        const speed = 0.25 + random(`s${i}`) * 0.6;
        const size = 3 + random(`z${i}`) * 7;
        const y =
          (random(`y${i}`) * height - frame * speed * 1.4 + height * 4) %
          (height + 40);
        const x = sx + Math.sin(frame / (40 + random(`w${i}`) * 50) + i) * 26;
        const tw = 0.35 + 0.65 * Math.abs(Math.sin(frame / (25 + i) + i * 1.7));
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: size,
              height: size,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(255,226,160,1) 0%, rgba(255,190,90,0.6) 40%, rgba(255,170,60,0) 70%)",
              opacity: tw * 0.75,
              filter: size > 7 ? "blur(1.5px)" : undefined,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/* ───────────── Kad video (rakaman lapangan) ───────────── */
const BRollClip: React.FC<{ b: BRoll; duration: number }> = ({
  b,
  duration,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fadeIn = interpolate(frame, [0, 10], [0, 1], clamp);
  const push = interpolate(frame, [0, duration], [1.04, 1.12]);
  return (
    <AbsoluteFill style={{ opacity: fadeIn }}>
      <OffthreadVideo
        src={staticFile(`broll/${b.src}`)}
        startFrom={Math.round(b.from * fps)}
        muted
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: `50% ${(b.pos ?? 0.35) * 100}%`,
          transform: `scale(${push})`,
        }}
      />
    </AbsoluteFill>
  );
};

const BRollCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({
    frame: frame - 2,
    fps,
    config: { damping: 16, stiffness: 120 },
  });
  const leave = interpolate(
    frame,
    [FINALE_START - 6, FINALE_START + 18],
    [0, 1],
    {
      ...clamp,
      easing: Easing.inOut(Easing.cubic),
    },
  );
  const segs = [
    { b: INTRO_BROLL, start: 0, duration: INTRO_FRAMES },
    ...TIMELINE.filter((c) => c.broll).map((c) => ({
      b: c.broll!,
      start: c.start,
      duration: c.duration,
    })),
  ];
  return (
    <div
      style={{
        position: "absolute",
        left: CARD.x,
        top: CARD.y,
        width: CARD.w,
        height: CARD.h,
        borderRadius: CARD.r,
        overflow: "hidden",
        opacity: enter * (1 - leave),
        transform: `translateY(${(1 - enter) * 120 + leave * 60}px) scale(${0.94 + 0.06 * enter - leave * 0.06})`,
        boxShadow:
          "0 30px 80px rgba(0,0,0,0.55), 0 0 0 2px rgba(255,214,140,0.55), 0 0 40px rgba(255,170,80,0.25)",
        background: "#111",
      }}
    >
      {segs.map((s, i) => (
        <Sequence
          key={i}
          from={s.start}
          durationInFrames={s.duration + 10}
          layout="none"
        >
          <BRollClip b={s.b} duration={s.duration + 10} />
        </Sequence>
      ))}
      {/* tona hangat senada dengan senja */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(255,160,90,0.10), rgba(40,20,60,0.18))",
          mixBlendMode: "soft-light",
        }}
      />
      <AbsoluteFill
        style={{
          boxShadow: "inset 0 0 60px rgba(0,0,0,0.45)",
          borderRadius: CARD.r,
        }}
      />
    </div>
  );
};

/* ───────────── Hook (3 saat pertama) ───────────── */
const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  // "punch" zoom halus sepanjang hook
  const push = interpolate(frame, [0, HOOK_FRAMES], [1, 1.05]);
  return (
    <AbsoluteFill
      style={{
        top: TEXT_ZONE.top,
        height: TEXT_ZONE.bottom - TEXT_ZONE.top,
        padding: "0 70px",
        justifyContent: "center",
        gap: 34,
        transform: `scale(${push})`,
      }}
    >
      <PopText text={HOOK_LINE1} duration={HOOK_FRAMES} fontSize={92} />
      <PopText
        text={HOOK_LINE2}
        duration={HOOK_FRAMES}
        delay={HOOK_LINE2_AT}
        fontSize={58}
      />
    </AbsoluteFill>
  );
};

/* ───────────── Tajuk ───────────── */
const IntroTitle: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const letters = "AMANAH".split("");
  const out = interpolate(
    frame,
    [TITLE_FRAMES - 14, TITLE_FRAMES],
    [0, 1],
    clamp,
  );
  const sub = spring({ frame: frame - 26, fps, config: { damping: 16 } });
  const line = interpolate(frame, [20, 50], [0, 1], {
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
            frame: frame - 4 - i * 4,
            fps,
            config: { damping: 10, stiffness: 150, mass: 0.7 },
          });
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                fontFamily: fonts.serifUpright,
                fontWeight: 800,
                fontSize: 168,
                letterSpacing: 6,
                color: "#FFD27A",
                transform: `translateY(${(1 - s) * 70}px) scale(${0.3 + 0.7 * s})`,
                opacity: Math.min(1, s * 1.5),
                textShadow:
                  "0 0 40px rgba(255,180,80,0.55), 0 6px 22px rgba(0,0,0,0.6)",
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
            width: 120 * line,
            height: 2,
            background: "linear-gradient(90deg, rgba(255,210,122,0), #FFD27A)",
          }}
        />
        <div
          style={{
            fontFamily: fonts.sans,
            fontWeight: 700,
            fontSize: 42,
            letterSpacing: 12,
            color: "white",
            opacity: sub,
            transform: `translateY(${(1 - sub) * 24}px)`,
            textShadow: "0 3px 14px rgba(0,0,0,0.6)",
          }}
        >
          SEORANG PEMIMPIN
        </div>
        <div
          style={{
            width: 120 * line,
            height: 2,
            background: "linear-gradient(90deg, #FFD27A, rgba(255,210,122,0))",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

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
    [MAIN_FRAMES - 30, MAIN_FRAMES - 5],
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
          background: "rgba(10,12,30,0.35)",
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
export const Amanah: React.FC<Props> = ({ showBroll, music }) => {
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
        <NatureBackground />
        {showBroll && <BRollCard />}

        <Sequence durationInFrames={HOOK_FRAMES} layout="none">
          <Hook />
        </Sequence>
        <Sequence
          from={HOOK_FRAMES}
          durationInFrames={TITLE_FRAMES}
          layout="none"
        >
          <IntroTitle />
        </Sequence>
        <HeaderPill />

        {TIMELINE.map((c, i) => {
          const centered = c.finale || !showBroll;
          const zone = centered ? { top: 340, bottom: 1000 } : TEXT_ZONE;
          const fontSize = c.finale ? 70 : centered ? 66 : 60;
          return (
            <Sequence
              key={i}
              from={c.start}
              durationInFrames={c.duration}
              layout="none"
            >
              <AbsoluteFill
                style={{
                  top: zone.top,
                  height: zone.bottom - zone.top,
                  padding: "0 80px",
                  justifyContent: "center",
                }}
              >
                <PopText
                  text={c.text}
                  duration={c.duration}
                  fontSize={fontSize}
                />
              </AbsoluteFill>
            </Sequence>
          );
        })}

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
            backgroundImage: `url(${staticFile("nature/grain.png")})`,
            backgroundPosition: `${(frame * 137) % 512}px ${(frame * 251) % 512}px`,
            mixBlendMode: "overlay",
            opacity: 0.18,
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
