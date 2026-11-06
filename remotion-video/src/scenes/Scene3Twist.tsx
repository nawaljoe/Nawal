import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { bob, pop, settle, tween } from "../anim";
import { BanknoteIcon, Burst, ChartIcon, ScaleIcon, ShopIcon, ZakatIcon } from "../components/Icons";
import { Camera, Ground, SceneShell, Stage } from "../components/SceneShell";
import { Sfx } from "../components/Sfx";
import { addPose, LEG, POSES, Stickman } from "../components/Stickman";
import { faceTrack, numTrack, poseTrack } from "../components/track";
import { MaskReveal, PopWords } from "../components/Typography";
import { BODY, C, HEAD } from "../theme";
import { cue } from "../timing";

const S = 3;
const GROUND = 1300;

/** The ZAKAT word: letters rise out of a mask, then the word docks as a header. */
const ZakatTitle: React.FC<{ frame: number; at: number; dockAt: number }> = ({ frame, at, dockAt }) => {
  const dock = settle(frame, dockAt, 20);
  const letters = "ZAKAT".split("");
  const top = 520 + (290 - 520) * dock;
  const size = 260 + (150 - 260) * dock;
  const line = tween(frame, [at + 10, at + 24], [0, 1]);
  return (
    <div style={{ position: "absolute", top, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ display: "flex", overflow: "hidden", padding: "0 20px 24px" }}>
        {letters.map((l, i) => {
          const p = tween(frame, [at + i * 2, at + i * 2 + 12], [0, 1]);
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                fontFamily: HEAD,
                fontWeight: 800,
                fontSize: size,
                lineHeight: 1,
                color: C.gold,
                textShadow: `0 ${10 - dock * 4}px 0 ${C.ink}`,
                letterSpacing: "0.02em",
                translate: `0 ${(1 - p) * 120}%`,
              }}
            >
              {l}
            </span>
          );
        })}
      </div>
      <svg width={600 - dock * 240} height={20} viewBox="0 0 600 20" style={{ marginTop: -10 }}>
        <path d="M10 10 Q300 0 590 10" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - line} stroke={C.ink} strokeWidth={8} strokeLinecap="round" fill="none" />
      </svg>
    </div>
  );
};

/** Soft rays of rezeki from above. */
const Rays: React.FC<{ frame: number; at: number; out: number }> = ({ frame, at, out }) => {
  const a = tween(frame, [at, at + 14], [0, 1]) * (1 - tween(frame, [out, out + 12], [0, 1]));
  if (a <= 0) return null;
  return (
    <g opacity={a * 0.85}>
      {Array.from({ length: 9 }).map((_, i) => {
        const ang = ((i - 4) / 4) * 0.55;
        const len = 300 + Math.sin(frame / 8 + i) * 30;
        const x0 = 540 + Math.sin(ang) * 120;
        const y0 = 520 + Math.cos(ang) * 40;
        return (
          <line
            key={i}
            x1={x0}
            y1={y0}
            x2={x0 + Math.sin(ang) * len * a}
            y2={y0 + Math.cos(ang) * len * a}
            stroke={C.gold}
            strokeWidth={i % 2 ? 4 : 7}
            strokeLinecap="round"
            strokeDasharray={i % 2 ? "2 18" : undefined}
          />
        );
      })}
    </g>
  );
};

export const Scene3Twist: React.FC = () => {
  const frame = useCurrentFrame();
  const fZakat = cue(S, "zakat.");
  const fKita = cue(S, "kita");
  const fRezeki = cue(S, "rezeki");
  const fAllah = cue(S, "allah.");
  const fSyukur = cue(S, "bersyukur");
  const fPendapatan = cue(S, "pendapatan");
  const fNiaga = cue(S, "perniagaan");
  const fTapi = cue(S, "tapi,");
  const fTj = cue(S, "tanggungjawab");
  const fHarta = cue(S, "harta");

  const heroScale = numTrack(frame, [
    [fKita - 2, 1.5],
    [fKita + 14, 2.1],
    [fHarta, 2.1],
    [fHarta + 14, 1.6],
  ]);
  const idle = bob(frame, 30);
  let pose = poseTrack(frame, [
    [0, POSES.stand],
    [fKita + 6, POSES.holdOut, 10],
    [fSyukur, POSES.doa, 10],
    [fTapi, POSES.holdOut, 8],
    [fHarta, addPose(POSES.holdOut, { head: -14 }), 10],
  ]);
  pose = addPose(pose, { head: idle * 3 });
  const face = faceTrack(frame, [
    [0, "shocked"],
    [fZakat + 30, "neutral"],
    [fRezeki, "happy"],
    [fSyukur, "calm"],
    [fTapi, "neutral"],
    [fTj, "worried"],
    [fHarta + 20, "calm"],
  ]);

  // the note in hand turns into the zakat symbol
  const morph = tween(frame, [fTj, fTj + 8], [0, 1]);
  const zk = pop(frame, fTj + 6, 200, 10);
  const handItem =
    frame >= fKita + 6 && (frame < fSyukur - 4 || frame >= fTapi) ? (
      morph < 1 ? (
        <BanknoteIcon size={70} y={-20} rotate={-10 + morph * 180} scale={1 - morph} />
      ) : (
        <g>
          <ZakatIcon size={78} y={-34} scale={zk} />
          <Burst x={0} y={-34} r={46} t={(frame - fTj - 6) / 12} />
        </g>
      )
    ) : null;

  // money descending from the rays into the hero's hands
  const fall = (k: number) => {
    const t0 = fRezeki + 4 + k * 7;
    const t = tween(frame, [t0, t0 + 22], [0, 1]);
    const gone = tween(frame, [t0 + 22, t0 + 26], [1, 0]);
    if (t <= 0 || gone <= 0) return null;
    return <BanknoteIcon key={k} x={560 + Math.sin(t * 6 + k) * 40} y={560 + t * 420} size={90} rotate={Math.sin(t * 5 + k) * 25} opacity={gone} />;
  };

  const tilt = frame < fHarta ? -22 : -22 + 22 * settle(frame, fHarta + 6, 24) + Math.sin((frame - fHarta) / 3) * 6 * Math.max(0, 1 - (frame - fHarta) / 30);
  const scaleIn = pop(frame, fHarta, 180, 12);
  const sideIcons = 1 - tween(frame, [fTapi, fTapi + 10], [0, 0.75]);

  const cam = [
    { f: 0, x: 540, y: 960, s: 1.0 },
    { f: fKita, x: 540, y: 960, s: 1.06 },
    { f: fKita + 16, x: 540, y: 960, s: 1.0 },
    { f: fTapi, x: 540, y: 960, s: 1.0 },
    { f: fTapi + 14, x: 570, y: 1000, s: 1.08 },
    { f: fHarta - 2, x: 570, y: 1000, s: 1.08 },
    { f: fHarta + 12, x: 540, y: 960, s: 1.0 },
  ];

  return (
    <SceneShell id="s3" enter="flash" exit="whip">
      <AbsoluteFill>
        <Camera keys={cam} shake={[{ at: fZakat, amount: 12, dur: 12 }]}>
          <Stage>
            <Ground y={GROUND} at={4} />
            <Rays frame={frame} at={fRezeki - 4} out={fTapi} />
            {[0, 1, 2].map(fall)}
            {frame >= fPendapatan && (
              <g opacity={sideIcons}>
                <ChartIcon x={210} y={860} size={230} draw={tween(frame, [fPendapatan, fPendapatan + 16], [0, 1])} scale={pop(frame, fPendapatan, 200, 12)} />
              </g>
            )}
            {frame >= fNiaga && (
              <g opacity={sideIcons}>
                <ShopIcon x={860} y={860} size={220} draw={tween(frame, [fNiaga, fNiaga + 16], [0, 1])} scale={pop(frame, fNiaga, 200, 12)} />
              </g>
            )}
            {frame >= fHarta && (
              <g transform={`translate(540 600) scale(${scaleIn})`}>
                <ScaleIcon size={340} tilt={tilt} draw={tween(frame, [fHarta, fHarta + 14], [0, 1])} />
              </g>
            )}
            <Stickman
              pose={pose}
              face={face}
              x={540}
              y={GROUND - LEG * heroScale}
              scale={heroScale}
              frame={frame}
              rightHand={handItem}
            />
          </Stage>
        </Camera>

        <ZakatTitle frame={frame} at={fZakat - 2} dockAt={fKita} />
        <div style={{ position: "absolute", top: 500, left: 80, right: 160, display: "flex", justifyContent: "center" }}>
          {frame >= fRezeki - 2 && frame < fPendapatan && (
            <MaskReveal at={fRezeki - 2} out={fPendapatan - 10}>
              <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 52, color: C.blue, textAlign: "center" }}>
                Rezeki daripada <span style={{ color: C.ink }}>Allah</span>
              </div>
            </MaskReveal>
          )}
          {frame >= fPendapatan && frame < fTapi && (
            <PopWords text="Bersyukur bila maju" font="body" weight={700} size={52} color={C.blue} times={[fPendapatan - 6, fPendapatan, fNiaga + 12]} out={fTapi - 8} />
          )}
          {frame >= fTj && frame < fHarta && (
            <PopWords text="*TANGGUNGJAWAB?" size={76} times={[fTj]} out={fHarta - 6} />
          )}
        </div>
        {frame >= fHarta &&
          [
            ["REZEKI", 411, C.ink],
            ["TANGGUNGJAWAB", 669, C.blue],
          ].map(([t, x, col]) => (
            <div
              key={t}
              style={{
                position: "absolute",
                top: 772,
                left: (x as number) - 200,
                width: 400,
                textAlign: "center",
                fontFamily: BODY,
                fontWeight: 700,
                fontSize: 32,
                color: col as string,
                opacity: tween(frame, [fHarta + 8, fHarta + 16], [0, 1]),
              }}
            >
              {t}
            </div>
          ))}
      </AbsoluteFill>

      <Sfx name="cine-hit" at={fZakat - 3} />
      <Sfx name="whoosh" at={fKita - 2} volume={0.22} />
      <Sfx name="shimmer" at={fRezeki - 4} volume={0.2} />
      <Sfx name="coin" at={fAllah} volume={0.16} />
      <Sfx name="pop" at={fPendapatan} />
      <Sfx name="pop" at={fNiaga} />
      <Sfx name="impact" at={fTapi} volume={0.28} />
      <Sfx name="whoosh" at={fTj - 2} volume={0.2} />
      <Sfx name="pop" at={fTj + 6} />
      <Sfx name="impact" at={fHarta + 6} volume={0.34} />
    </SceneShell>
  );
};
