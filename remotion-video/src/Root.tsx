import { Composition } from "remotion";
import { MyComposition } from "./Composition";
import { IsbatPart1 } from "./isbat/IsbatPart1";
import timeline from "./isbat/timeline.json";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <MyComposition />
      <Composition
        id="IsbatPart1"
        component={IsbatPart1}
        durationInFrames={Math.round(timeline.duration * timeline.fps)}
        fps={timeline.fps}
        width={timeline.width}
        height={timeline.height}
      />
    </>
  );
};
