import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { bob, pop, tween } from "../anim";
import { BanknoteIcon, BookIcon, Burst, CoinIcon, FoodIcon, HouseIcon } from "../components/Icons";
import { Camera, Ground, SceneShell, Stage } from "../components/SceneShell";
import { Sfx } from "../components/Sfx";
import { addPose, LEG, POSES, SHIN, Stickman } from "../components/Stickman";
import { faceTrack, poseTrack } from "../components/track";
import { MaskReveal, PopWords, StrikeText } from "../components/Typography";
import { BODY, C, HEAD } from "../theme";
import { cue } from "../timing";

const S = 4;
const GROUND = 1300;
const SC = 1.8;
const A = { x: 280, y: GROUND - LEG * SC };
const B_SIT = { x: 790, y: GROUND - SHIN * SC };
const B_STAND = { x: 790, y: GROUND - LEG * SC };

/** Help travelling from giver to receiver along an arc, landing as an icon. */
const Gift: React.FC<{
  frame: number;
  at: number;
  to: [number, number];
  icon: (draw: number) => React.ReactNode;
}> = ({ frame, at, to, icon }) => {
  if (frame < at) return null;
  const t = tween(frame, [at, at + 16], [0, 1]);
  const from: [number, number] = [A.x + 70, A.y - 60];
  const x = from[0] + (to[0] - from[0]) * t;
  const y = from[1] + (to[1] - from[1]) * t - Math.sin(t * Math.PI) * 220;
  if (t < 1) return <CoinIcon x={x} y={y} size={70} rotate={t * 360} />;
  const s = pop(frame, at + 16, 200, 10);
  return (
    <g transform={`translate(${to[0]} ${to[1] + Math.sin(frame / 12 + to[0]) * 5}) scale(${s})`}>
      <circle r={64} fill={C.bg} stroke={C.ink} strokeWidth={5} />
      {icon(tween(frame, [at + 16, at + 26], [0, 1]))}
      <Burst x={0} y={0} r={80} t={(frame - at - 16) / 12} />
    </g>
  );
};

/** One of the rotating key words: AMANAH -> WAJIB -> ZAKAT */
const KeyWord: React.FC<{ frame: number; at: number; out: number; text: string; gold?: boolean }> = ({ frame, at, out, text, gold }) => {
  if (frame < at || frame > out + 12) return null;
  return (
    <MaskReveal at={at} out={out} dur={10}>
      <div
        style={{
          fontFamily: HEAD,
          fontWeight: 800,
          fontSize: 150,
          lineHeight: 1,
          color: gold ? C.gold : C.ink,
          textShadow: gold ? `0 8px 0 ${C.ink}` : undefined,
          letterSpacing: "0.02em",
          paddingBottom: 10,
        }}
      >
        {text}
      </div>
    </MaskReveal>
  );
};

export const Scene4Message: React.FC = () => {
  const frame = useCurrentFrame();
  const fJangan = cue(S, "jangan");
  const fSibuk = cue(S, "sibuk");
  const fTapi = cue(S, "tapi");
  const fLupa = cue(S, "terlupa");
  const fWajib = cue(S, "wajib");
  const fBila = cue(S, "bila");
  const fCukup = cue(S, "cukup");
  const fSyarat = cue(S, "syarat,");
  const fZakat = cue(S, "zakat");
  const fTunai = cue(S, "ditunaikan.");
  const fBukan = cue(S, "bukan");
  const fLebih = cue(S, "lebihan,");
  const fBukan2 = cue(S, "bukan", 1);
  const fSenang = cue(S, "senang.");

  const flick = Math.sin(frame / 2.1) * 14;
  let poseA = poseTrack(frame, [
    [0, POSES.count],
    [fLupa, POSES.stand, 6],
    [fBila, POSES.holdOut, 8],
    [fTunai, POSES.hips, 8],
  ]);
  if (frame < fLupa - 4) poseA = addPose(poseA, { re: flick, le: -flick * 0.6, head: bob(frame, 14) * 6 });
  const faceA = faceTrack(frame, [
    [0, "excited"],
    [fLupa, "shocked"],
    [fWajib, "calm"],
    [fTunai, "happy"],
  ]);

  const standUp = tween(frame, [fTunai, fTunai + 12], [0, 1]);
  let poseB = poseTrack(frame, [
    [0, POSES.sitSad],
    [fCukup + 12, addPose(POSES.sitSad, { head: -18, lean: -6, rs: 40, re: -40 }), 8],
    [fTunai + 2, POSES.tuck, 4],
    [fTunai + 12, POSES.cheer, 6],
  ]);
  if (frame > fTunai + 12) poseB = addPose(poseB, { ls: -bob(frame, 16) * 16, rs: bob(frame, 16) * 16 });
  const faceB = faceTrack(frame, [
    [0, "sad"],
    [fCukup + 12, "neutral"],
    [fZakat + 10, "happy"],
    [fTunai, "excited"],
  ]);
  const bx = B_SIT.x;
  const by = B_SIT.y + (B_STAND.y - B_SIT.y) * standUp - Math.sin(standUp * Math.PI) * 60;

  // split screen divider
  const divider = tween(frame, [fTapi, fTapi + 14], [0, 1]);
  const dimTop = tween(frame, [fBukan - 6, fBukan + 4], [0, 1]);

  const cam = [
    { f: 0, x: 300, y: 900, s: 1.6 },
    { f: fSibuk, x: 300, y: 890, s: 1.66 },
    { f: fTapi - 2, x: 300, y: 890, s: 1.66 },
    { f: fTapi + 16, x: 540, y: 960, s: 1.0 },
    { f: fBukan - 4, x: 540, y: 960, s: 1.0 },
    { f: fBukan + 10, x: 540, y: 1010, s: 1.06 },
  ];

  return (
    <SceneShell id="s4" enter="whip" exit="whip">
      <AbsoluteFill>
        <Camera keys={cam}>
          <Stage>
            <Ground y={GROUND} at={0} x1={60} x2={1020} />
            {/* divider: "split-screen" between the one who counts and the one who needs */}
            <path
              d="M540 560 V1290"
              pathLength={1}
              strokeDasharray="1 1"
              strokeDashoffset={1 - divider}
              stroke={C.blue}
              strokeWidth={6}
              strokeLinecap="round"
            />
            <rect x={545} y={560} width={460} height={740} fill={C.blue} opacity={0.07 * divider} />
            {/* pile of money on giver's side */}
            {[0, 1, 2].map((i) => (
              <BanknoteIcon key={i} x={150 + i * 26} y={1268 - i * 18} size={110} rotate={-6 + i * 5} />
            ))}
            <Stickman
              pose={poseA}
              face={faceA}
              x={A.x}
              y={A.y}
              scale={SC}
              frame={frame}
              look={frame >= fTapi ? 0.7 : 0}
              rightHand={frame < fLupa ? <BanknoteIcon size={56} rotate={-20 + flick} /> : null}
              leftHand={frame < fLupa ? <BanknoteIcon size={56} rotate={15} /> : null}
            />
            {/* simple crate the receiver sits on */}
            <g opacity={1 - standUp}>
              <path d={`M${B_SIT.x - 40} ${B_SIT.y + 8} H${B_SIT.x + 70} M${B_SIT.x - 30} ${B_SIT.y + 8} V${GROUND} M${B_SIT.x + 60} ${B_SIT.y + 8} V${GROUND}`} stroke={C.blue} strokeWidth={8} strokeLinecap="round" fill="none" />
            </g>
            <Stickman pose={poseB} face={faceB} x={bx} y={by} scale={SC} frame={frame} look={frame >= fCukup ? -0.6 : 0} />
            <Gift frame={frame} at={fCukup} to={[630, 620]} icon={(d) => <FoodIcon size={84} draw={d} />} />
            <Gift frame={frame} at={fSyarat} to={[790, 560]} icon={(d) => <BookIcon size={84} draw={d} />} />
            <Gift frame={frame} at={fZakat} to={[905, 640]} icon={(d) => <HouseIcon size={84} draw={d} />} />
          </Stage>
        </Camera>

        {/* headline area */}
        <div style={{ position: "absolute", top: 290, left: 80, right: 160, display: "flex", justifyContent: "center", opacity: 1 - dimTop }}>
          {frame < fTapi && <PopWords text="Sibuk *MENGIRA..." times={[fSibuk, cue(S, "mengira")]} size={96} out={fTapi - 6} />}
          <KeyWord frame={frame} at={fTapi + 2} out={fWajib - 8} text="AMANAH" />
          <KeyWord frame={frame} at={fWajib - 2} out={fZakat - 8} text="WAJIB" gold />
          <KeyWord frame={frame} at={fZakat - 2} out={fBukan - 8} text="ZAKAT" gold />
        </div>
        {frame >= fJangan && frame < fTapi && (
          <div style={{ position: "absolute", top: 1180, left: 580, rotate: "5deg", scale: `${pop(frame, fJangan + 8, 200, 10)}` }}>
            <span style={{ fontFamily: BODY, fontWeight: 700, fontSize: 48, color: C.blue }}>dapat berapa ni?</span>
          </div>
        )}
        {frame >= fBukan - 2 && (
          <div style={{ position: "absolute", top: 290, left: 80, right: 160, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <StrikeText text="Bukan tunggu ada lebihan" at={fBukan - 2} strikeAt={fLebih + 4} size={54} />
            <StrikeText text="Bukan tunggu rasa senang" at={fBukan2 - 2} strikeAt={fSenang + 2} size={54} />
          </div>
        )}
      </AbsoluteFill>

      <Sfx name="coin" at={6} volume={0.18} />
      <Sfx name="coin" at={20} volume={0.16} />
      <Sfx name="coin" at={fSibuk + 4} volume={0.18} />
      <Sfx name="whoosh" at={fTapi - 2} />
      <Sfx name="impact" at={fTapi + 4} volume={0.26} />
      <Sfx name="impact" at={fWajib} volume={0.3} />
      <Sfx name="whoosh" at={fCukup} volume={0.22} />
      <Sfx name="whoosh" at={fSyarat} volume={0.22} />
      <Sfx name="whoosh" at={fZakat} volume={0.22} />
      <Sfx name="impact" at={fZakat + 2} volume={0.3} />
      <Sfx name="pop" at={fTunai + 4} />
      <Sfx name="swipe" at={fBukan - 4} volume={0.2} />
      <Sfx name="impact" at={fLebih + 4} volume={0.22} />
      <Sfx name="impact" at={fSenang + 2} volume={0.22} />
    </SceneShell>
  );
};
