import React from "react";
import { C } from "../theme";

/**
 * Reusable minimalist stickman.
 *
 * Coordinates are local SVG units with the hip at (0, 0); feet rest at y = LEG.
 * Angles are degrees, 0 = pointing straight down, +90 = pointing to the
 * viewer's right, 180 = straight up. "l" limbs are on the viewer's left.
 * Elbow/knee angles are relative to the upper limb.
 */
export type Pose = {
  lean: number; // torso tilt (+ = right)
  head: number; // head tilt relative to torso
  ls: number;
  le: number;
  rs: number;
  re: number;
  lh: number;
  lk: number;
  rh: number;
  rk: number;
};

export type Face =
  | "neutral"
  | "happy"
  | "excited"
  | "confused"
  | "shocked"
  | "calm"
  | "sad"
  | "proud"
  | "worried";

export const TORSO = 96;
export const UPPER_ARM = 50;
export const FOREARM = 46;
export const THIGH = 60;
export const SHIN = 58;
export const LEG = THIGH + SHIN;
export const HEAD_R = 38;
const NECK_GAP = 8;

export const POSES = {
  stand: { lean: 0, head: 0, ls: -14, le: -6, rs: 14, re: 6, lh: -9, lk: 0, rh: 9, rk: 0 },
  cheer: { lean: 0, head: -6, ls: -125, le: -30, rs: 125, re: 30, lh: -18, lk: 20, rh: 18, rk: -20 },
  tuck: { lean: 0, head: 0, ls: -70, le: -60, rs: 70, re: 60, lh: -40, lk: 70, rh: 40, rk: -70 },
  count: { lean: 4, head: 8, ls: -18, le: 128, rs: 22, re: -122, lh: -9, lk: 0, rh: 9, rk: 0 },
  sit: { lean: -4, head: 0, ls: 30, le: 60, rs: 46, re: 50, lh: 90, lk: -90, rh: 84, rk: -86 },
  sitBored: { lean: 6, head: 14, ls: 40, le: 116, rs: 60, re: 40, lh: 90, lk: -90, rh: 84, rk: -86 },
  sitCount: { lean: 4, head: 10, ls: 52, le: 70, rs: 70, re: 40, lh: 90, lk: -90, rh: 84, rk: -86 },
  scratch: { lean: -3, head: -10, ls: -14, le: -6, rs: 150, re: 104, lh: -9, lk: 0, rh: 9, rk: 0 },
  point: { lean: 0, head: 6, ls: -14, le: -6, rs: 96, re: -6, lh: -9, lk: 0, rh: 9, rk: 0 },
  hips: { lean: 0, head: -4, ls: -40, le: 92, rs: 40, re: -92, lh: -12, lk: 0, rh: 12, rk: 0 },
  showPhone: { lean: -2, head: -8, ls: -14, le: -6, rs: 128, re: 40, lh: -9, lk: 0, rh: 9, rk: 0 },
  doa: { lean: 0, head: 6, ls: -45, le: 205, rs: 45, re: -205, lh: -9, lk: 0, rh: 9, rk: 0 },
  holdOut: { lean: 4, head: 6, ls: -14, le: -6, rs: 62, re: 24, lh: -9, lk: 0, rh: 9, rk: 0 },
  slump: { lean: 8, head: 22, ls: -4, le: -2, rs: 6, re: 2, lh: -6, lk: 0, rh: 6, rk: 0 },
  sitSad: { lean: 10, head: 18, ls: 20, le: 40, rs: 34, re: 30, lh: 90, lk: -90, rh: 84, rk: -86 },
  receive: { lean: -2, head: -6, ls: -60, le: 60, rs: 60, re: -60, lh: -9, lk: 0, rh: 9, rk: 0 },
  wave: { lean: -2, head: -6, ls: -14, le: -6, rs: 150, re: 20, lh: -9, lk: 0, rh: 9, rk: 0 },
} satisfies Record<string, Pose>;

export const mixPose = (a: Pose, b: Pose, t: number): Pose => {
  const o = {} as Pose;
  (Object.keys(a) as (keyof Pose)[]).forEach((k) => {
    o[k] = a[k] + (b[k] - a[k]) * t;
  });
  return o;
};

export const addPose = (a: Pose, d: Partial<Pose>): Pose => {
  const o = { ...a };
  (Object.keys(d) as (keyof Pose)[]).forEach((k) => {
    o[k] = a[k] + (d[k] ?? 0);
  });
  return o;
};

const rad = (d: number) => (d * Math.PI) / 180;
const vec = (deg: number, len: number) => [Math.sin(rad(deg)) * len, Math.cos(rad(deg)) * len] as const;

export type Joints = ReturnType<typeof joints>;

/** Compute every joint position for a pose (hip at origin). */
export const joints = (p: Pose) => {
  const [nx, ny] = vec(180 + p.lean, TORSO);
  const neck = [nx, ny] as const;
  const [sx, sy] = vec(180 + p.lean, TORSO - NECK_GAP);
  const shoulder = [sx, sy] as const;
  const [hx, hy] = vec(180 + p.lean + p.head, HEAD_R + 6);
  const head = [nx + hx, ny + hy] as const;
  const limb = (o: readonly [number, number], a1: number, l1: number, a2: number, l2: number) => {
    const [x1, y1] = vec(a1, l1);
    const mid = [o[0] + x1, o[1] + y1] as const;
    const [x2, y2] = vec(a1 + a2, l2);
    const end = [mid[0] + x2, mid[1] + y2] as const;
    return { mid, end, angle: a1 + a2 };
  };
  const la = limb(shoulder, p.ls + p.lean, UPPER_ARM, p.le, FOREARM);
  const ra = limb(shoulder, p.rs + p.lean, UPPER_ARM, p.re, FOREARM);
  const ll = limb([0, 0], p.lh, THIGH, p.lk, SHIN);
  const rl = limb([0, 0], p.rh, THIGH, p.rk, SHIN);
  return { neck, shoulder, head, la, ra, ll, rl };
};

const FaceArt: React.FC<{ face: Face; blink: boolean; look: number }> = ({ face, blink, look }) => {
  const ink = { stroke: C.ink, strokeWidth: 4.5, strokeLinecap: "round" as const, fill: "none" };
  const ex = 13;
  const ey = -4;
  const lx = look * 6;
  const eye = (x: number) => {
    if (blink) return <path key={x} d={`M${x - 6 + lx} ${ey} h12`} {...ink} />;
    switch (face) {
      case "happy":
      case "proud":
        return <path key={x} d={`M${x - 7 + lx} ${ey + 2} q7 -9 14 0`} {...ink} />;
      case "calm":
        return <path key={x} d={`M${x - 7 + lx} ${ey - 1} q7 7 14 0`} {...ink} />;
      case "shocked":
        return <circle key={x} cx={x + lx} cy={ey} r={6.5} fill={C.bg} stroke={C.ink} strokeWidth={3.5} />;
      case "excited":
        return (
          <g key={x}>
            <circle cx={x + lx} cy={ey} r={7} fill={C.ink} />
            <circle cx={x + lx + 2.5} cy={ey - 2.5} r={2.2} fill={C.bg} />
          </g>
        );
      default:
        return <circle key={x} cx={x + lx} cy={ey} r={4.6} fill={C.ink} />;
    }
  };
  const mouth = () => {
    switch (face) {
      case "happy":
        return <path d={`M${-12 + lx} 12 q12 13 24 0`} {...ink} />;
      case "excited":
        return <path d={`M${-13 + lx} 10 q13 20 26 0 z`} fill={C.ink} stroke={C.ink} strokeWidth={3} strokeLinejoin="round" />;
      case "proud":
        return <path d={`M${-10 + lx} 13 q12 8 20 -3`} {...ink} />;
      case "confused":
        return <path d={`M${-11 + lx} 16 q5 -6 10 0 t10 -2`} {...ink} />;
      case "shocked":
        return <ellipse cx={lx} cy={16} rx={6} ry={8} fill={C.ink} />;
      case "calm":
        return <path d={`M${-8 + lx} 13 q8 6 16 0`} {...ink} />;
      case "sad":
        return <path d={`M${-10 + lx} 18 q10 -9 20 0`} {...ink} />;
      case "worried":
        return <path d={`M${-10 + lx} 16 h20`} {...ink} />;
      default:
        return <path d={`M${-8 + lx} 14 h16`} {...ink} />;
    }
  };
  const brows = () => {
    switch (face) {
      case "confused":
        return (
          <>
            <path d={`M${-ex - 7 + lx} -18 l12 3`} {...ink} />
            <path d={`M${ex - 6 + lx} -22 q6 -5 12 0`} {...ink} />
          </>
        );
      case "shocked":
        return (
          <>
            <path d={`M${-ex - 6 + lx} -22 q6 -5 12 0`} {...ink} />
            <path d={`M${ex - 6 + lx} -22 q6 -5 12 0`} {...ink} />
          </>
        );
      case "sad":
      case "worried":
        return (
          <>
            <path d={`M${-ex - 6 + lx} -15 l12 -5`} {...ink} />
            <path d={`M${ex - 6 + lx} -20 l12 5`} {...ink} />
          </>
        );
      default:
        return null;
    }
  };
  return (
    <g>
      {eye(-ex)}
      {eye(ex)}
      {brows()}
      {mouth()}
    </g>
  );
};

export type StickmanProps = {
  pose: Pose;
  face?: Face;
  /** Hip position in the parent SVG. */
  x: number;
  y: number;
  scale?: number;
  /** + squashes (wider/shorter), - stretches (taller/thinner); pivot at feet. */
  squash?: number;
  rotate?: number;
  frame?: number;
  /** Horizontal look direction of the eyes, -1..1 */
  look?: number;
  color?: string;
  strokeWidth?: number;
  /** Drawn at the right / left hand, rotated with the forearm when `alignToArm`. */
  rightHand?: React.ReactNode;
  leftHand?: React.ReactNode;
  alignToArm?: boolean;
  opacity?: number;
  /** Extra decoration drawn in head space (e.g. sweat drop, question marks). */
  headExtra?: React.ReactNode;
};

export const Stickman: React.FC<StickmanProps> = ({
  pose,
  face = "neutral",
  x,
  y,
  scale = 2.4,
  squash = 0,
  rotate = 0,
  frame = 0,
  look = 0,
  color = C.ink,
  strokeWidth = 5.5,
  rightHand,
  leftHand,
  alignToArm = false,
  opacity = 1,
  headExtra,
}) => {
  const j = joints(pose);
  const blink = frame % 97 > 92 && face !== "shocked";
  const line = {
    stroke: color,
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    fill: "none",
  };
  const P = (pt: readonly [number, number]) => `${pt[0].toFixed(2)} ${pt[1].toFixed(2)}`;
  const sx = 1 + squash * 0.7;
  const sy = 1 - squash;
  const handItem = (node: React.ReactNode, arm: typeof j.ra) =>
    node ? (
      <g transform={`translate(${P(arm.end)}) rotate(${alignToArm ? -arm.angle : 0})`}>{node}</g>
    ) : null;

  return (
    <g
      opacity={opacity}
      transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale}) translate(0 ${LEG}) scale(${sx} ${sy}) translate(0 ${-LEG})`}
    >
      {/* legs */}
      <path d={`M0 0 L${P(j.ll.mid)} L${P(j.ll.end)}`} {...line} />
      <path d={`M0 0 L${P(j.rl.mid)} L${P(j.rl.end)}`} {...line} />
      {/* torso */}
      <path d={`M0 0 L${P(j.neck)}`} {...line} />
      {/* arms */}
      <path d={`M${P(j.shoulder)} L${P(j.la.mid)} L${P(j.la.end)}`} {...line} />
      <path d={`M${P(j.shoulder)} L${P(j.ra.mid)} L${P(j.ra.end)}`} {...line} />
      {/* head */}
      <g transform={`translate(${P(j.head)}) rotate(${pose.lean + pose.head})`}>
        <circle r={HEAD_R} fill={C.bg} stroke={color} strokeWidth={strokeWidth} />
        <FaceArt face={face} blink={blink} look={look} />
        {headExtra}
      </g>
      {handItem(leftHand, j.la)}
      {handItem(rightHand, j.ra)}
    </g>
  );
};
