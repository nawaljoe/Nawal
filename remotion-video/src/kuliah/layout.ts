import timeline from "./timeline.json";

export type TransitionType = "blur" | "glow" | "dip";

export type Segment = (typeof timeline.segments)[number] & {
  transition?: TransitionType;
  transitionSec?: number;
  /** Gain for the segment's own sound (1 = as mastered). */
  volume?: number;
  /** Ambient pad level under this segment (0 = silent). */
  ambient?: number;
  /** false hides the logo overlay and film look (glitch, FK outro). */
  logo?: boolean;
};

export type PlacedSegment = Segment & {
  /** Start on the film timeline, in frames. */
  start: number;
  /** Length on the film timeline, in frames. */
  length: number;
  /** How this shot comes in (the join before it). Half the transition plays on each side of the cut. */
  inType: TransitionType | null;
  inFrames: number;
  /** How this shot goes out (the join after it). */
  outType: TransitionType | null;
  outFrames: number;
};

export const FPS = timeline.fps;
export const sec = (s: number) => Math.round(s * FPS);

/**
 * Lays segments end to end with no overlap, so the ustaz's voice never plays
 * over itself. Transitions are "through" transitions: the outgoing shot
 * softens out and the incoming shot resolves in, meeting at the cut.
 * scripts/bina_kapsyen.py repeats the same arithmetic.
 */
export const placeSegments = (): PlacedSegment[] => {
  const segs = timeline.segments as Segment[];
  let cursor = 0;
  return segs.map((s, i) => {
    const next = segs[i + 1];
    const half = (x?: number) => sec((x ?? 0) / 2);
    const placed: PlacedSegment = {
      ...s,
      start: cursor,
      length: sec(s.to - s.from),
      inType: i === 0 ? null : (s.transition ?? null),
      inFrames: i === 0 ? 0 : half(s.transitionSec),
      outType: next?.transition ?? null,
      outFrames: next ? half(next.transitionSec) : 0,
    };
    cursor += placed.length;
    return placed;
  });
};

export const totalFrames = (): number => {
  const placed = placeSegments();
  const last = placed[placed.length - 1];
  return last.start + last.length;
};

export const segmentStart = (id: string): number => {
  const seg = placeSegments().find((s) => s.id === id);
  if (!seg) {
    throw new Error(`Unknown segment ${id}`);
  }
  return seg.start;
};

export { timeline };
