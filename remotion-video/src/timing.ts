import data from "./timing.json";
import { FPS } from "./theme";

export type Word = {
  text: string;
  start: number;
  end: number;
  scene: number;
  hl: boolean;
};

export const TIMING = data as {
  tempo: number;
  scenes: { index: number; start: number; end: number; startFrame: number; endFrame: number }[];
  words: Word[];
};

export const TOTAL_FRAMES = 60 * FPS;

/** Frames of overlap given to each side of a scene for whip transitions. */
export const PAD = 6;

export const sceneSeq = (i: number) => {
  const s = TIMING.scenes[i - 1];
  const from = Math.max(0, s.startFrame - PAD);
  const to = Math.min(TOTAL_FRAMES, s.endFrame + PAD);
  return { from, durationInFrames: to - from };
};

const norm = (t: string) => t.toLowerCase().replace(/[^a-z0-9-]/g, "");

/**
 * Local frame (inside the scene's Sequence) at which a spoken word starts.
 * `nth` picks a later occurrence of the same word in that scene.
 */
export const cue = (scene: number, word: string, nth = 0, offset = 0) => {
  const hits = TIMING.words.filter((w) => w.scene === scene && norm(w.text) === norm(word));
  const w = hits[Math.min(nth, hits.length - 1)];
  if (!w) throw new Error(`Word "${word}" not found in scene ${scene}`);
  return Math.round(w.start * FPS) - sceneSeq(scene).from + offset;
};

/** Local frame at which a spoken word ends. */
export const cueEnd = (scene: number, word: string, nth = 0) => {
  const hits = TIMING.words.filter((w) => w.scene === scene && norm(w.text) === norm(word));
  const w = hits[Math.min(nth, hits.length - 1)];
  return Math.round(w.end * FPS) - sceneSeq(scene).from;
};
