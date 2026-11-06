import { Composition } from "remotion";
import { MyComposition } from "./Composition";
import { IsbatVideo, type Timeline } from "./isbat/IsbatVideo";
import part1 from "./isbat/timeline.json";
import penuh from "./isbat/timeline_penuh.json";

const comps: { id: string; tl: Timeline }[] = [
  { id: "IsbatPart1", tl: part1 as unknown as Timeline },
  { id: "IsbatPenuh", tl: penuh as unknown as Timeline },
];

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <MyComposition />
      {comps.map(({ id, tl }) => (
        <Composition
          key={id}
          id={id}
          component={IsbatVideo}
          defaultProps={{ timeline: tl }}
          durationInFrames={Math.round(tl.duration * tl.fps)}
          fps={tl.fps}
          width={tl.width}
          height={tl.height}
        />
      ))}
    </>
  );
};
