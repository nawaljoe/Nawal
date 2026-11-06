export type Seg = { from: number; to: number; s0: number; s1: number };
export type Caption = { from: number; to: number; text: string; kw: string[] };
export type Broll = {
  from: number; to: number; kind: "video" | "photo"; src: string;
  at?: number; rate?: number; fx?: number; move?: "push" | "pull"; holdIn?: boolean; holdOut?: boolean;
};
export type Overlay = { src: string; from: number; dur: number };
export type Scene = {
  start: number; dur: number; transitionIn: [string, number] | null;
  overlays: Overlay[]; broll: Broll[]; captions: Caption[]; segs: Seg[];
};
export type Timeline = {
  fps: number; width: number; height: number; total: number; order: string[];
  scenes: Record<string, Scene>;
  openingVoice: { from: number; dur: number };
  sfx: { src: string; from: number; vol: number; trimBefore?: number }[];
  speech: [number, number][];
  music: { src: string; to: number; env: [number, number][] };
};
