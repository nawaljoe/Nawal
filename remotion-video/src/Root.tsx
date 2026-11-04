import { Composition } from "remotion";
import { MyComposition } from "./Composition";
import { Kuliah, KULIAH_DURATION } from "./kuliah/Kuliah";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <MyComposition />
      <Composition
        id="Kuliah"
        component={Kuliah}
        durationInFrames={KULIAH_DURATION}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
