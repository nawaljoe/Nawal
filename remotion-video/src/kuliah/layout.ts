import timeline from "./timeline.json";

export type Segment = (typeof timeline.segments)[number] & {
  overlapIn?: number;
};

export type PlacedSegment = Segment & {
  /** Start on the film timeline, in frames. */
  start: number;
  /** Length on the film timeline, in frames. */
  length: number;
  /** Frames this segment dissolves in over the previous one. */
  fadeIn: number;
};

export const FPS = timeline.fps;
export const sec = (s: number) => Math.round(s * FPS);

/**
 * Lays segments end to end, each one dissolving over the tail of the previous
 * one. Shared with scripts/bina_kapsyen.py, which repeats the same arithmetic.
 */
export const placeSegments = (): PlacedSegment[] => {
  const placed: PlacedSegment[] = [];
  let cursor = 0;
  timeline.segments.forEach((seg, i) => {
    const s = seg as Segment;
    const overlap = i === 0 ? 0 : (s.overlapIn ?? timeline.overlap);
    const start = i === 0 ? 0 : cursor - sec(overlap);
    const length = sec(s.to - s.from);
    placed.push({ ...s, start, length, fadeIn: sec(overlap) });
    cursor = start + length;
  });
  return placed;
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
