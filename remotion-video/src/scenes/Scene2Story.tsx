import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { bob, pop, tween } from "../anim";
import { BillIcon, CarIcon, CheckIcon, PhoneIcon, QuestionMark } from "../components/Icons";
import { Camera, Ground, SceneShell, Stage } from "../components/SceneShell";
import { Sfx } from "../components/Sfx";
import { addPose, LEG, POSES, Stickman } from "../components/Stickman";
import { faceTrack, poseTrack } from "../components/track";
import { PopWords } from "../components/Typography";
import { BODY, C, HEAD } from "../theme";
import { cue } from "../timing";

const S = 2;
const GROUND = 1300;

/** Wall calendar with page flips and gold date circles. */
const Calendar: React.FC<{ frame: number; drawAt: number; flips: number[]; circles: [number, number][] }> = ({
  frame,
  drawAt,
  flips,
  circles,
}) => {
  const x = 400;
  const y = 540;
  const w = 460;
  const h = 400;
  const draw = tween(frame, [drawAt, drawAt + 16], [0, 1]);
  const months = ["JAN", "FEB", "MAC", "APR"];
  const flipped = flips.filter((f) => frame >= f + 6).length;
  const flipping = flips.find((f) => frame >= f && frame < f + 6);
  const fp = flipping === undefined ? 0 : (frame - flipping) / 6;
  const cellW = w / 7;
  const cellH = 52;
  const cell = (n: number) => {
    const i = n - 1;
    return [x + (i % 7) * cellW + cellW / 2, y + 120 + Math.floor(i / 7) * cellH] as const;
  };
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={18}
        fill={C.bg}
        stroke={C.ink}
        strokeWidth={6}
        pathLength={1}
        strokeDasharray="1 1"
        strokeDashoffset={1 - draw}
      />
      <g opacity={tween(frame, [drawAt + 8, drawAt + 16], [0, 1])}>
        <rect x={x} y={y} width={w} height={80} rx={18} fill={C.blue} />
        <rect x={x} y={y + 50} width={w} height={30} fill={C.blue} />
        <text x={x + w / 2} y={y + 56} textAnchor="middle" fontFamily={HEAD} fontWeight={800} fontSize={44} fill={C.bg}>
          {months[Math.min(flipped, months.length - 1)]}
        </text>
        {[x + 90, x + w - 90].map((rx) => (
          <rect key={rx} x={rx - 8} y={y - 22} width={16} height={44} rx={8} fill={C.ink} />
        ))}
        {Array.from({ length: 28 }).map((_, i) => {
          const [cx, cy] = cell(i + 1);
          return (
            <text key={i} x={cx} y={cy + 30} textAnchor="middle" fontFamily={BODY} fontWeight={500} fontSize={26} fill={C.ink} opacity={0.75}>
              {i + 1}
            </text>
          );
        })}
        {circles.map(([n, at], k) => {
          const [cx, cy] = cell(n);
          const d = tween(frame, [at, at + 8], [0, 1]);
          return (
            <ellipse
              key={k}
              cx={cx}
              cy={cy + 21}
              rx={30}
              ry={24}
              fill="none"
              stroke={C.gold}
              strokeWidth={6}
              pathLength={1}
              strokeDasharray="1 1"
              strokeDashoffset={1 - d}
              transform={`rotate(-8 ${cx} ${cy + 21})`}
            />
          );
        })}
      </g>
      {/* the page being torn upward */}
      {flipping !== undefined && (
        <g transform={`translate(0 ${y}) scale(1 ${1 - fp}) translate(0 ${-y})`} opacity={1 - fp * 0.4}>
          <rect x={x} y={y} width={w} height={h} rx={18} fill={C.bg} stroke={C.ink} strokeWidth={6} />
          <rect x={x} y={y} width={w} height={80} rx={18} fill={C.blue} />
        </g>
      )}
    </g>
  );
};

/** One row in the monthly-commitments checklist. */
const Row: React.FC<{
  frame: number;
  at: number;
  y: number;
  label: string;
  icon?: (d: number) => React.ReactNode;
  checkAt?: number;
  unknown?: boolean;
  qScale?: number;
}> = ({ frame, at, y, label, icon, checkAt, unknown, qScale = 1 }) => {
  if (frame < at) return null;
  const s = pop(frame, at, 200, 12);
  const d = tween(frame, [at, at + 10], [0, 1]);
  const chk = checkAt === undefined ? 0 : tween(frame, [checkAt, checkAt + 8], [0, 1]);
  const x = 470;
  return (
    <g transform={`translate(${x + (1 - s) * 80} ${y})`} opacity={Math.min(1, s * 1.4)}>
      <rect
        x={0}
        y={-38}
        width={440}
        height={76}
        rx={20}
        fill={C.bg}
        stroke={C.ink}
        strokeWidth={5}
        strokeDasharray={unknown ? "14 12" : undefined}
      />
      {icon && <g transform="translate(46 0)">{icon(d)}</g>}
      {unknown ? (
        <rect x={84} y={-6} width={180} height={12} rx={6} fill={C.ink} opacity={0.15} />
      ) : (
        <text x={92} y={12} fontFamily={BODY} fontWeight={700} fontSize={36} fill={C.ink}>
          {label}
        </text>
      )}
      <g transform="translate(400 0)">
        {unknown ? (
          <g transform={`scale(${qScale})`}>
            <circle r={28} fill={C.gold} />
            <QuestionMark x={0} y={2} size={46} color={C.ink} />
          </g>
        ) : (
          <>
            <circle r={26} fill="none" stroke={C.ink} strokeWidth={4} opacity={0.3} />
            {chk > 0 && (
              <>
                <circle r={26 * Math.min(1, chk * 1.4)} fill={C.ink} />
                <CheckIcon size={40} draw={chk} color={C.gold} />
              </>
            )}
          </>
        )}
      </g>
    </g>
  );
};

export const Scene2Story: React.FC = () => {
  const live = useCurrentFrame();

  const fTapi = cue(S, "tapi,");
  const fKita = cue(S, "kita");
  const fKomit = cue(S, "komitmen");
  const fBulan = cue(S, "bulanan");
  const fTarikh1 = cue(S, "tarikh");
  const fTu = cue(S, "tu,");
  const fTarikh2 = cue(S, "tarikh", 1);
  const fNi = cue(S, "ni.");
  const fTapi2 = cue(S, "tapi", 1);
  const fSatu = cue(S, "satu");
  const fTj = cue(S, "tanggungjawab");
  const fLupa = cue(S, "terlupa");
  const fSemak = cue(S, "semak.");

  // freeze-frame: everything idles on a frozen clock for a beat after the scratch
  const freezeLen = 9;
  const frozen = live >= fLupa && live < fLupa + freezeLen;
  const frame = frozen ? fLupa : live;

  const idle = bob(frame, 26);
  let pose = poseTrack(frame, [
    [0, POSES.stand],
    [fTapi + 4, addPose(POSES.point, { rs: 40, re: 70, head: 14 }), 8],
    [fKomit, POSES.point, 8],
    [fTarikh1 + 6, POSES.hips, 8],
    [fTapi2, POSES.stand, 6],
    [fLupa + freezeLen, POSES.scratch, 5],
  ]);
  if (live >= fLupa + freezeLen) pose = addPose(pose, { re: Math.sin(live / 1.6) * 14, head: Math.sin(live / 9) * 4 });
  if (live >= fTarikh1 + 6 && live < fTapi2) pose = addPose(pose, { head: idle * 8 - 4 });
  const face = faceTrack(frame, [
    [0, "neutral"],
    [fTapi + 4, "confused"],
    [fKomit, "neutral"],
    [fTarikh1 + 6, "happy"],
    [fTapi2, "neutral"],
    [fSatu, "worried"],
    [fLupa, "shocked"],
    [fLupa + freezeLen, "confused"],
  ]);

  const qMarks =
    live >= fLupa + freezeLen ? (
      <g>
        {[
          [-62, -70, -14, 0],
          [64, -86, 12, 5],
          [6, -116, 0, 10],
        ].map(([qx, qy, r, delay], i) => {
          const s = pop(live, fLupa + freezeLen + delay, 200, 10);
          return <QuestionMark key={i} x={qx} y={qy - bob(live + i * 7, 18) * 6} size={46} rotate={r} scale={s} opacity={Math.min(1, s * 2)} />;
        })}
      </g>
    ) : null;

  const qGrow = live >= fLupa ? 1 + pop(live, fLupa, 220, 9) * 0.5 : 1;
  const cam = [
    { f: 0, x: 540, y: 960, s: 1 },
    { f: fKomit, x: 560, y: 930, s: 1.04 },
    { f: fTapi2, x: 560, y: 960, s: 1.0 },
    { f: fLupa, x: 600, y: 1100, s: 1.08 },
    { f: fLupa + 4, x: 560, y: 1060, s: 1.15 },
  ];
  return (
    <SceneShell id="s2" enter="whip" exit="zoom" zoomOrigin={[896, 1173]}>
      <AbsoluteFill>
        <Camera keys={cam} shake={[{ at: fLupa, amount: 16, dur: 8 }]}>
          <Stage>
            <Ground y={GROUND} at={0} x1={80} x2={1000} />
            <Calendar
              frame={frame}
              drawAt={2}
              flips={[fKomit, fKomit + 7, fBulan]}
              circles={[
                [5, fTarikh1],
                [12, fTu],
                [18, fTarikh2],
                [25, fNi],
              ]}
            />
            <Row frame={frame} at={fTarikh1} y={990} label="Kereta" icon={(d) => <CarIcon size={66} draw={d} />} checkAt={fTarikh1 + 8} />
            <Row frame={frame} at={fTu} y={1075} label="Telefon" icon={(d) => <PhoneIcon size={60} draw={d} />} checkAt={fTu + 8} />
            <Row frame={frame} at={fTarikh2} y={1160} label="Bil" icon={(d) => <BillIcon size={62} draw={d} />} checkAt={fTarikh2 + 8} />
            <Row frame={frame} at={fSatu} y={1245} label="" unknown qScale={qGrow} />
            <Stickman
              pose={pose}
              face={face}
              x={230}
              y={GROUND - LEG * 1.9}
              scale={1.9}
              frame={frame}
              look={live >= fLupa ? 0.4 : 0.8}
              headExtra={qMarks}
            />
          </Stage>
        </Camera>

        <div style={{ position: "absolute", top: 290, left: 80, right: 160, display: "flex", justifyContent: "center" }}>
          {live < fKita && <PopWords text="Tapi... pelik juga kan?" times={[fTapi, cue(S, "pelik"), cue(S, "juga"), cue(S, "kan...")]} size={84} out={fKita - 8} />}
          {live >= fKita && live < fTapi2 && (
            <PopWords text="Ingat semua *KOMITMEN" times={[fKita, cue(S, "ingat"), fKomit]} size={84} out={fTapi2 - 8} />
          )}
          {live >= fTapi2 && (
            <PopWords text="Tapi satu *TANGGUNGJAWAB..." times={[fTapi2, fSatu, fTj]} size={80} out={fLupa - 2} />
          )}
        </div>
        {/* freeze-frame flash */}
        {live >= fLupa && live < fLupa + 4 && <AbsoluteFill style={{ backgroundColor: C.bg, opacity: 0.55 * (1 - (live - fLupa) / 4) }} />}
      </AbsoluteFill>

      <Sfx name="swipe" at={0} />
      <Sfx name="paper" at={fKomit} />
      <Sfx name="paper" at={fKomit + 7} />
      <Sfx name="paper" at={fBulan} />
      <Sfx name="tick" at={fTarikh1 + 8} />
      <Sfx name="tick" at={fTu + 8} />
      <Sfx name="tick" at={fTarikh2 + 8} />
      <Sfx name="clock" at={fTapi2 - 4} />
      <Sfx name="pop" at={fSatu} />
      <Sfx name="scratch" at={fLupa - 2} />
      <Sfx name="whoosh" at={fSemak + 6} volume={0.3} />
    </SceneShell>
  );
};
