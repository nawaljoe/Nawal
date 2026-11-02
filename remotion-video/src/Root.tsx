import { Composition } from "remotion";
import { MyComposition } from "./Composition";
import {
  Bekal,
  BEKAL_TOTAL_S,
  BEKAL_FPS,
  bekalDefaultProps,
} from "./Bekal/Bekal";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <MyComposition />
      <Composition
        id="Bekal"
        component={Bekal}
        durationInFrames={Math.round(BEKAL_TOTAL_S * BEKAL_FPS)}
        fps={BEKAL_FPS}
        width={1080}
        height={1920}
        defaultProps={bekalDefaultProps}
      />
    </>
  );
};
