import { Composition } from "remotion";
import { MyComposition } from "./Composition";
import { HindariKataKotor, TOTAL_FRAMES } from "./lidah/Lidah";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <MyComposition />
      <Composition
        id="HindariKataKotor"
        component={HindariKataKotor}
        durationInFrames={TOTAL_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
