import { Composition } from "remotion";
import { MyComposition } from "./Composition";
import { INFOGRAFIK_FRAMES, Infografik } from "./sijil-halal/Infografik";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <MyComposition />
      <Composition
        id="SijilHalalInfografik"
        component={Infografik}
        durationInFrames={INFOGRAFIK_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
