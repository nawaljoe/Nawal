import React from "react";
import { Audio, interpolate, Sequence, staticFile } from "remotion";
import type { Timeline } from "../types";

/** Music bed with a volume envelope keyed to the speech (ducked under the ustaz, opens up between beats). */
export const MusicBed: React.FC<{ m: Timeline["music"] }> = ({ m }) => {
  const xs = m.env.map((p) => p[0]); const ys = m.env.map((p) => p[1]);
  return (
    <Sequence durationInFrames={m.to} name="Music bed">
      <Audio src={staticFile(m.src)} volume={(f) => interpolate(f, xs, ys, { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
    </Sequence>
  );
};

/** One-shot effects, each placed so its measured peak lands one frame after its picture. */
export const SfxTrack: React.FC<{ cues: Timeline["sfx"] }> = ({ cues }) => (
  <>
    {cues.map((c, i) => (
      <Sequence key={i} from={c.from} durationInFrames={330} name={`sfx ${c.src}`}>
        <Audio src={staticFile(c.src)} volume={c.vol} trimBefore={c.trimBefore ?? 0} />
      </Sequence>
    ))}
  </>
);
