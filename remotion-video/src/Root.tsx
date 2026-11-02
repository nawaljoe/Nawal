import { Composition } from "remotion";
import { MyComposition } from "./Composition";
import { Fasakh, FASAKH_DURATION_S } from "./fasakh/Fasakh";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <MyComposition />
      <Composition
        id="Fasakh"
        component={Fasakh}
        durationInFrames={FASAKH_DURATION_S * 30}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
