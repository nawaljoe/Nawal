import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { bob, jumpArc, pop, squashAt, tween } from "../anim";
import { BagIcon, BanknoteIcon, BillIcon, Burst, CarIcon, CheckIcon, FoodIcon } from "../components/Icons";
import { Camera, Ground, SceneShell, Stage } from "../components/SceneShell";
import { Sfx } from "../components/Sfx";
import { addPose, LEG, POSES, Stickman } from "../components/Stickman";
import { faceTrack, poseTrack } from "../components/track";
import { Pill, PopWords } from "../components/Typography";
import { BODY, C } from "../theme";
import { cue } from "../timing";

const S = 1;
const GROUND = 1300;
const SCALE = 2.2;

/** Phone lying on the desk, with the "GAJI MASUK" notification. */
const DeskPhone: React.FC<{ frame: number; buzzAt: number; hideAt: number }> = ({ frame, buzzAt, hideAt }) => {
  const d = frame - buzzAt;
  const buzz = d >= 0 && d < 16 ? Math.sin(d * 2.4) * 7 * (1 - d / 16) : 0;
  const card = pop(frame, buzzAt + 2, 200, 11);
  const glow = d >= 0 ? Math.max(0, 1 - d / 20) : 0;
  const gone = tween(frame, [hideAt, hideAt + 8], [0, 1]);
  return (
    <g>
      <g transform={`translate(${770 + buzz} 1098) rotate(${buzz * 0.6})`}>
        <rect x={-46} y={-14} width={92} height={22} rx={8} fill={C.ink} />
        <rect x={-38} y={-10} width={76} height={6} rx={3} fill={glow > 0 ? C.gold : C.blue} opacity={0.4 + glow * 0.6} />
      </g>
      {d >= 0 && gone < 1 && (
        <g transform={`translate(770 ${930 - card * 30 - gone * 60}) scale(${(0.3 + 0.7 * card) * (1 - gone * 0.4)})`} opacity={Math.min(1, card * 1.5) * (1 - gone)}>
          <rect x={-200} y={-74} width={400} height={128} rx={30} fill={C.bg} stroke={C.ink} strokeWidth={6} />
          <path d="M-14 54 L0 76 L14 54" fill={C.bg} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
          <rect x={-14} y={48} width={28} height={8} fill={C.bg} />
          <circle cx={-148} cy={-10} r={30} fill={C.gold} />
          <text x={-148} y={2} textAnchor="middle" fontFamily={BODY} fontWeight={700} fontSize={30} fill={C.ink}>
            RM
          </text>
          <text x={-100} y={-24} fontFamily={BODY} fontWeight={700} fontSize={36} fill={C.ink}>
            GAJI MASUK
          </text>
          <text x={-100} y={22} fontFamily={BODY} fontWeight={500} fontSize={32} fill={C.blue}>
            + RM 4,250.00
          </text>
        </g>
      )}
    </g>
  );
};

/** Banknotes bursting out of the phone in exaggerated arcs. */
const MoneyBurst: React.FC<{ frame: number; at: number }> = ({ frame, at }) => {
  const notes = [
    [-420, -520, -30], [-250, -640, 20], [-80, -700, -12], [90, -660, 34],
    [240, -560, -22], [-330, -380, 40], [160, -420, -40], [-160, -460, 14],
  ];
  return (
    <g>
      {notes.map(([dx, dy, rot], i) => {
        const t0 = at + i * 2;
        const t = (frame - t0) / 34;
        if (t <= 0) return null;
        const tt = Math.min(t, 1);
        // up fast, then gravity; settle into a pile around the hero's hands
        const x = 770 + dx * tt;
        const y = 1080 + dy * Math.sin(tt * Math.PI * 0.62) + 260 * tt * tt;
        const fade = tween(frame, [t0 + 60, t0 + 72], [1, 0]);
        return (
          <BanknoteIcon
            key={i}
            x={x}
            y={y}
            size={130}
            rotate={rot + tt * rot * 3}
            draw={Math.min(1, t * 5)}
            opacity={fade}
          />
        );
      })}
    </g>
  );
};

/** Plan icon in a round badge, popping in on its spoken word. */
const PlanBadge: React.FC<{
  frame: number;
  at: number;
  x: number;
  y: number;
  icon: (draw: number) => React.ReactNode;
  tidy: number; // 0..1 slide into the plan row
  tx: number;
  ty: number;
  checkAt: number;
}> = ({ frame, at, x, y, icon, tidy, tx, ty, checkAt }) => {
  if (frame < at) return null;
  const s = pop(frame, at, 200, 10);
  const draw = tween(frame, [at, at + 12], [0, 1]);
  const px = x + (tx - x) * tidy;
  const py = y + (ty - y) * tidy;
  const sc = (0.4 + 0.6 * s) * (1 - 0.32 * tidy);
  const float = Math.sin((frame + x) / 14) * 6 * (1 - tidy);
  const chk = tween(frame, [checkAt, checkAt + 8], [0, 1]);
  return (
    <g transform={`translate(${px} ${py + float}) scale(${sc})`}>
      <circle r={92} fill={C.bg} stroke={C.ink} strokeWidth={6} />
      {icon(draw)}
      <Burst x={0} y={0} r={110} t={(frame - at) / 12} />
      {chk > 0 && (
        <g transform="translate(70 -70)">
          <circle r={34} fill={C.ink} />
          <CheckIcon size={44} draw={chk} color={C.gold} />
        </g>
      )}
    </g>
  );
};

export const Scene1Hook: React.FC = () => {
  const frame = useCurrentFrame();

  const fGaji = cue(S, "gaji");
  const fBuzz = fGaji - 6;
  const fJump = cue(S, "masuk") + 2;
  const fLand = fJump + 18;
  const fBurst = cue(S, "kita");
  const fCount = cue(S, "cepat-cepat");
  const fCar = cue(S, "kereta");
  const fBil = cue(S, "bil");
  const fShop = cue(S, "shopping");
  const fFood = cue(S, "makan");
  const fPlan = cue(S, "semua");
  const fDone = cue(S, "rancang");

  // --- hero motion: sitting -> jump -> stand / count -> proud
  const sittingHip = { x: 470, y: GROUND - 128 };
  const standHip = { x: 400, y: GROUND - LEG * SCALE };
  const air = jumpArc(frame, fJump, fLand - fJump);
  const progress = tween(frame, [fJump, fLand], [0, 1]);
  const hx = frame < fJump ? sittingHip.x : sittingHip.x + (standHip.x - sittingHip.x) * progress;
  const hy = frame < fJump ? sittingHip.y : sittingHip.y + (standHip.y - sittingHip.y) * progress - air * 210;
  const squash =
    squashAt(frame, fJump - 2, 0.16, 4) + squashAt(frame, fLand, 0.22, 6) - (air > 0.2 ? air * 0.12 : 0);

  const countFlick = Math.sin(frame / 2.2) * 14;
  const idle = bob(frame, 20);
  let pose = poseTrack(frame, [
    [0, POSES.sitBored],
    [fBuzz + 4, addPose(POSES.sitBored, { head: -16, lean: -6 }), 4],
    [fJump, POSES.tuck, 4],
    [fJump + 6, POSES.cheer, 6],
    [fLand + 2, POSES.cheer, 2],
    [fCount, POSES.count, 8],
    [fPlan, POSES.hips, 8],
  ]);
  if (frame >= fCount && frame < fPlan - 8) pose = addPose(pose, { re: countFlick, le: -countFlick * 0.6, head: idle * 6 });
  if (frame >= fLand && frame < fCount) pose = addPose(pose, { ls: -idle * 18, rs: idle * 18 });
  const face = faceTrack(frame, [
    [0, "neutral"],
    [fBuzz + 4, "shocked"],
    [fJump, "excited"],
    [fPlan, "proud"],
  ]);
  const sitting = frame < fJump;

  // --- tidy the icons into a "plan" row at the end
  const tidy = tween(frame, [fPlan, fPlan + 14], [0, 1]);
  const row = (i: number) => 300 + i * 160;
  const rowY = 500;

  const cam = [
    { f: 0, x: 600, y: 1040, s: 1.28 },
    { f: fBuzz, x: 600, y: 1030, s: 1.32 },
    { f: fJump + 4, x: 560, y: 960, s: 1.08 },
    { f: fCar, x: 540, y: 930, s: 1.0 },
    { f: fFood + 12, x: 540, y: 950, s: 1.02 },
    { f: fPlan + 10, x: 540, y: 960, s: 1.0 },
  ];

  return (
    <SceneShell id="s1" enter="none" exit="whip">
      <AbsoluteFill>
        <Camera keys={cam} shake={[{ at: fBuzz, amount: 6, dur: 12 }, { at: fLand, amount: 10, dur: 10 }]}>
          <Stage>
            <Ground y={GROUND} at={0} />
            {/* desk + stool */}
            <g opacity={1 - tween(frame, [fCar - 6, fCar + 6], [0, 1])} transform={`translate(${tween(frame, [fCar - 6, fCar + 6], [0, 420])} 0)`}>
              <path d={`M600 1110 H940 M630 1110 V${GROUND} M910 1110 V${GROUND}`} stroke={C.ink} strokeWidth={8} strokeLinecap="round" fill="none" />
              <DeskPhone frame={frame} buzzAt={fBuzz} hideAt={fBurst - 2} />
            </g>
            <g opacity={sitting ? 1 : 1 - tween(frame, [fJump, fJump + 8], [0, 1])}>
              <path d={`M400 ${GROUND - 120} H520 M460 ${GROUND - 120} V${GROUND}`} stroke={C.blue} strokeWidth={8} strokeLinecap="round" fill="none" />
            </g>
            <MoneyBurst frame={frame} at={fBurst} />
            <Stickman
              pose={pose}
              face={face}
              x={hx}
              y={hy}
              scale={SCALE}
              squash={squash}
              frame={frame}
              look={sitting ? 0.6 : 0.2}
              rightHand={frame >= fCount && frame < fPlan ? <BanknoteIcon size={60} rotate={-20 + countFlick} /> : null}
              leftHand={frame >= fCount && frame < fPlan ? <BanknoteIcon size={60} rotate={15} /> : null}
            />
            {/* plan icons */}
            <PlanBadge frame={frame} at={fCar} x={760} y={620} tx={row(0)} ty={rowY} checkAt={fDone} tidy={tidy} icon={(d) => <CarIcon size={120} draw={d} />} />
            <PlanBadge frame={frame} at={fBil} x={860} y={880} tx={row(1)} ty={rowY} checkAt={fDone + 3} tidy={tidy} icon={(d) => <BillIcon size={110} draw={d} />} />
            <PlanBadge frame={frame} at={fShop} x={720} y={1110} tx={row(2)} ty={rowY} checkAt={fDone + 6} tidy={tidy} icon={(d) => <BagIcon size={110} draw={d} />} />
            <PlanBadge frame={frame} at={fFood} x={190} y={1000} tx={row(3)} ty={rowY} checkAt={fDone + 9} tidy={tidy} icon={(d) => <FoodIcon size={120} draw={d} />} />
          </Stage>
        </Camera>

        {/* kinetic typography */}
        <div style={{ position: "absolute", top: 230, left: 80, right: 160, display: "flex", justifyContent: "center" }}>
          {frame < fBuzz + 2 && (
            <PopWords
              text="Pernah tak korang perasan?"
              at={0}
              times={[cue(S, "pernah"), cue(S, "tak"), cue(S, "korang"), cue(S, "perasan?")]}
              size={92}
              out={fBuzz - 6}
            />
          )}
          {frame >= fBuzz + 2 && frame < fCar - 2 && (
            <div style={{ textAlign: "center" }}>
              <PopWords text="*GAJI *MASUK!" at={fBuzz + 2} stagger={4} size={140} out={fCar - 10} />
            </div>
          )}
          {frame >= fCar - 2 && frame < fPlan && (
            <PopWords text="Nak bayar..." at={fCar - 2} size={80} out={fPlan - 8} style={{ color: C.blue }} />
          )}
          {frame >= fPlan && (
            <PopWords text="Semua dah rancang." times={[fPlan, cue(S, "dah"), fDone]} size={88} />
          )}
        </div>
        {frame >= fCount && frame < fCar && (
          <div style={{ position: "absolute", top: 760, left: 560, rotate: "-6deg", scale: `${pop(frame, fCount, 200, 10)}` }}>
            <Pill style={{ fontFamily: BODY, fontWeight: 700, fontSize: 54 }}>kira, kira, kira!</Pill>
          </div>
        )}
      </AbsoluteFill>

      {/* sound design */}
      <Sfx name="notification" at={fBuzz} />
      <Sfx name="pop" at={fBuzz + 2} />
      <Sfx name="whoosh" at={fJump - 2} volume={0.22} />
      <Sfx name="cash" at={fBurst} />
      <Sfx name="coin" at={fBurst + 8} />
      <Sfx name="coin" at={fCount + 6} volume={0.18} />
      <Sfx name="coin" at={fCount + 16} volume={0.16} />
      <Sfx name="pop" at={fCar} />
      <Sfx name="pop" at={fBil} />
      <Sfx name="pop" at={fShop} />
      <Sfx name="pop" at={fFood} />
      <Sfx name="swipe" at={fPlan} volume={0.2} />
      <Sfx name="tick" at={fDone} />
      <Sfx name="tick" at={fDone + 6} volume={0.24} />
      <Sfx name="tick" at={fDone + 9} volume={0.2} />
    </SceneShell>
  );
};
