import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { bob, pop, tween } from "../anim";
import { BookIcon, Burst, CheckIcon, FoodIcon, ZakatIcon } from "../components/Icons";
import { Camera, Ground, SceneShell, Stage } from "../components/SceneShell";
import { Sfx } from "../components/Sfx";
import { addPose, LEG, POSES, Stickman } from "../components/Stickman";
import { faceTrack, poseTrack } from "../components/track";
import { Pill, PopWords } from "../components/Typography";
import { BODY, C, HEAD } from "../theme";
import { cue } from "../timing";

const S = 5;
const GROUND = 1300;

/** MAINJ identity: the official logo (public/brand/mainj-logo.png) with its name. */
export const MainjBadge: React.FC<{ frame: number; at: number }> = ({ frame, at }) => {
  const s = pop(frame, at, 170, 11);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        scale: `${0.4 + 0.6 * s}`,
        opacity: frame >= at ? Math.min(1, s * 2) : 0,
      }}
    >
      <div style={{ position: "relative", width: 300, height: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width={420} height={420} viewBox="-210 -210 420 420" style={{ position: "absolute", left: -60, top: -60 }}>
          <circle r={150} fill="none" stroke={C.gold} strokeWidth={4} opacity={0.5 * Math.min(1, s)} strokeDasharray="4 14" strokeLinecap="round" transform={`rotate(${frame * 0.6})`} />
          <Burst x={0} y={0} r={170} t={(frame - at) / 16} />
        </svg>
        <Img src={staticFile("brand/mainj-logo.png")} style={{ height: 276, position: "relative" }} />
      </div>
      <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 34, color: C.ink, marginTop: 10, letterSpacing: "0.03em" }}>
        MAJLIS AGAMA ISLAM NEGERI JOHOR
      </div>
    </div>
  );
};

/** Phone held up showing the zakat payment flow. */
const PayPhone: React.FC<{ frame: number; at: number; typeAt: number; pressAt: number; doneAt: number; outAt: number }> = ({
  frame,
  at,
  typeAt,
  pressAt,
  doneAt,
  outAt,
}) => {
  const s = pop(frame, at, 170, 12);
  const out = tween(frame, [outAt, outAt + 10], [0, 1]);
  if (frame < at || out >= 1) return null;
  const amount = "106.25";
  const typed = Math.max(0, Math.min(amount.length, Math.floor((frame - typeAt) / 2.5)));
  const press = frame >= pressAt && frame < pressAt + 6 ? 0.9 : 1;
  const done = pop(frame, doneAt, 200, 11);
  return (
    <div
      style={{
        position: "absolute",
        left: 470,
        top: 560,
        width: 380,
        height: 720,
        borderRadius: 56,
        border: `10px solid ${C.ink}`,
        background: C.bg,
        overflow: "hidden",
        translate: `${out * 700}px ${(1 - s) * 260}px`,
        rotate: `${(1 - s) * 12 + out * 15 + Math.sin(frame / 20) * 1.2}deg`,
        opacity: Math.min(1, s * 2),
        boxShadow: `14px 16px 0 rgba(41,41,41,0.12)`,
      }}
    >
      <div style={{ background: C.blue, padding: "40px 0 22px", textAlign: "center", fontFamily: BODY, fontWeight: 700, fontSize: 34, color: C.bg }}>
        Bayar Zakat
      </div>
      <div style={{ padding: "26px 30px", fontFamily: BODY }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, fontWeight: 700, fontSize: 30, color: C.ink }}>
          <Img src={staticFile("brand/mainj-logo.png")} style={{ height: 64 }} />
          MAINJ
        </div>
        <div style={{ fontWeight: 500, fontSize: 24, color: C.blue, marginTop: 26 }}>Zakat pendapatan</div>
        <div
          style={{
            marginTop: 8,
            border: `4px solid ${C.ink}`,
            borderRadius: 16,
            padding: "10px 16px",
            fontWeight: 700,
            fontSize: 44,
            color: C.ink,
            minHeight: 66,
          }}
        >
          RM {amount.slice(0, typed)}
          <span style={{ opacity: frame % 16 < 8 && typed < amount.length ? 1 : 0 }}>|</span>
        </div>
        <div
          style={{
            marginTop: 30,
            background: C.ink,
            color: C.gold,
            borderRadius: 18,
            padding: "18px 0",
            textAlign: "center",
            fontWeight: 700,
            fontSize: 36,
            scale: `${press}`,
          }}
        >
          TUNAIKAN
        </div>
        {frame >= doneAt && (
          <div style={{ marginTop: 30, display: "flex", alignItems: "center", gap: 16, scale: `${done}` }}>
            <svg width={70} height={70} viewBox="0 0 100 100">
              <circle cx={50} cy={50} r={48} fill={C.gold} />
              <g transform="translate(50 50)">
                <CheckIcon size={64} color={C.ink} draw={tween(frame, [doneAt, doneAt + 8], [0, 1])} />
              </g>
            </svg>
            <div style={{ fontWeight: 700, fontSize: 32, color: C.ink, lineHeight: 1.1 }}>
              Berjaya!
              <div style={{ fontWeight: 500, fontSize: 22, color: C.blue }}>Semoga berkat</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/** Clean end card. */
const EndCard: React.FC<{ frame: number; at: number; kira: number; bayar: number; berkat: number; mainjAt: number }> = ({
  frame,
  at,
  kira,
  bayar,
  berkat,
  mainjAt,
}) => {
  const wipe = tween(frame, [at, at + 14], [0, 1]);
  if (frame < at) return null;
  const w = (f: number) => pop(frame, f, 220, 10);
  return (
    <AbsoluteFill
      style={{
        backgroundColor: C.bg,
        clipPath: `circle(${wipe * 130}% at 50% 55%)`,
        alignItems: "center",
        paddingTop: 300,
      }}
    >
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(${C.blue} 2.2px, transparent 2.6px)`,
          backgroundSize: "60px 60px",
          opacity: 0.08,
        }}
      />
      <div>
        <PopWords text="Tunaikan zakat anda" at={at + 8} stagger={4} size={104} maxWidth={860} />
      </div>
      <div style={{ fontFamily: BODY, fontWeight: 500, fontSize: 44, color: C.blue, marginTop: 20, opacity: tween(frame, [mainjAt - 6, mainjAt], [0, 1]) }}>
        melalui
      </div>
      <div style={{ marginTop: 6 }}>
        <MainjBadge frame={frame} at={mainjAt} />
      </div>
      <div
        style={{
          fontFamily: BODY,
          fontWeight: 700,
          fontSize: 56,
          color: C.ink,
          marginTop: 34,
          opacity: tween(frame, [mainjAt + 10, mainjAt + 18], [0, 1]),
          translate: `0 ${(1 - tween(frame, [mainjAt + 10, mainjAt + 18], [0, 1])) * 30}px`,
        }}
      >
        Barakah Zakat <span style={{ color: C.blue }}>2026</span>
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 22, fontFamily: HEAD, fontWeight: 800, fontSize: 74, color: C.ink, alignItems: "center" }}>
        {[
          ["Kira.", kira],
          ["Bayar.", bayar],
          ["Berkat", berkat],
        ].map(([t, f], i) => (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity: frame >= (f as number) ? 1 : 0,
              scale: `${0.4 + 0.6 * w(f as number)}`,
              translate: `0 ${(1 - w(f as number)) * 40}px`,
            }}
          >
            {i === 2 ? <Pill>{t as string}</Pill> : t}
          </span>
        ))}
      </div>
    </AbsoluteFill>
  );
};

export const Scene5Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const fJom = cue(S, "jom!");
  const fTunai = cue(S, "tunaikan");
  const fZakat = cue(S, "zakat");
  const fMainj = cue(S, "mainj.");
  const fBersih = cue(S, "bersihkan");
  const fBantu = cue(S, "bantu");
  const fPerlu = cue(S, "memerlukan.");
  const fBarakah = cue(S, "barakah");
  const fKira = cue(S, "kira.");
  const fBayar = cue(S, "bayar.");
  const fBerkat = cue(S, "berkat.");
  const fEnd = fBarakah - 14;

  const idle = bob(frame, 22);
  let pose = poseTrack(frame, [
    [0, POSES.stand],
    [fJom, POSES.showPhone, 6],
    [fBersih, POSES.holdOut, 8],
    [fPerlu, POSES.cheer, 8],
  ]);
  pose = addPose(pose, { head: idle * 4 });
  const face = faceTrack(frame, [
    [0, "happy"],
    [fJom, "excited"],
    [fBersih, "happy"],
  ]);
  const friend = pop(frame, fBantu - 6, 170, 12);
  let poseB = poseTrack(frame, [
    [0, POSES.wave],
    [fPerlu, POSES.cheer, 8],
  ]);
  poseB = addPose(poseB, { re: Math.sin(frame / 4) * 18 * (frame < fPerlu ? 1 : 0), ls: -idle * 10 });
  const heroX = tween(frame, [fBersih, fBersih + 14], [300, 330]);

  const cam = [
    { f: 0, x: 540, y: 960, s: 1.04 },
    { f: fMainj, x: 560, y: 960, s: 1.06 },
    { f: fBersih + 10, x: 540, y: 980, s: 1.0 },
  ];

  return (
    <SceneShell id="s5" enter="whip" exit="none">
      <AbsoluteFill>
        <Camera keys={cam}>
          <Stage>
            <Ground y={GROUND} at={0} />
            <Stickman pose={pose} face={face} x={heroX} y={GROUND - LEG * 2.0} scale={2.0} frame={frame} />
            {frame >= fBantu - 6 && (
              <g transform={`translate(${780 + (1 - friend) * 300} 0)`}>
                <Stickman pose={poseB} face="happy" x={0} y={GROUND - LEG * 2.0} scale={2.0} frame={frame + 31} look={-0.6} />
              </g>
            )}
            {frame >= fBersih && (
              <g>
                <g transform={`translate(560 ${720 - bob(frame, 30) * 14}) scale(${pop(frame, fBersih + 4, 180, 10)})`}>
                  <ZakatIcon size={170} draw={tween(frame, [fBersih + 4, fBersih + 18], [0, 1])} />
                  <Burst x={0} y={0} r={120} t={(frame - fBersih - 4) / 14} />
                </g>
                <FoodIcon x={420} y={600} size={90} scale={pop(frame, fBantu + 4, 200, 10)} draw={tween(frame, [fBantu + 4, fBantu + 14], [0, 1])} />
                <BookIcon x={700} y={600} size={90} scale={pop(frame, fBantu + 9, 200, 10)} draw={tween(frame, [fBantu + 9, fBantu + 19], [0, 1])} />
              </g>
            )}
          </Stage>
          <PayPhone frame={frame} at={fJom - 2} typeAt={fTunai} pressAt={fMainj} doneAt={fMainj + 8} outAt={fBersih - 6} />
        </Camera>

        <div style={{ position: "absolute", top: 290, left: 80, right: 160, display: "flex", justifyContent: "center" }}>
          {frame < fBersih && <PopWords text="Jom, *TUNAIKAN *ZAKAT!" times={[fJom, fTunai, fZakat]} size={84} out={fBersih - 6} />}
          {frame >= fBersih && frame < fEnd && (
            <PopWords text="Bersihkan harta, bantu yang memerlukan" font="body" weight={700} size={60} times={[fBersih, cue(S, "harta"), fBantu, fBantu + 6, fPerlu]} />
          )}
        </div>

        <EndCard frame={frame} at={fEnd} kira={fKira} bayar={fBayar} berkat={fBerkat} mainjAt={fBarakah - 4} />
      </AbsoluteFill>

      <Sfx name="rise" at={fJom - 14} />
      <Sfx name="pop" at={fJom} />
      <Sfx name="pop" at={fTunai} volume={0.24} />
      <Sfx name="tick" at={fMainj} />
      <Sfx name="cash" at={fMainj + 8} volume={0.3} />
      <Sfx name="whoosh" at={fBersih - 6} volume={0.24} />
      <Sfx name="shimmer" at={fBersih + 4} volume={0.22} />
      <Sfx name="pop" at={fBantu - 4} />
      <Sfx name="whoosh" at={fEnd} />
      <Sfx name="cine-hit" at={fEnd + 4} volume={0.3} />
      <Sfx name="shimmer" at={fBarakah - 4} volume={0.34} />
      <Sfx name="pop" at={fKira} />
      <Sfx name="pop" at={fBayar} />
      <Sfx name="impact" at={fBerkat} volume={0.3} />
    </SceneShell>
  );
};
