import { Composition } from "remotion";
import { MyComposition } from "./Composition";
import { Amanah, amanahSchema } from "./Amanah/Amanah";
import { FPS, TOTAL_FRAMES } from "./Amanah/script";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <MyComposition />
      {/* Kata-kata motivasi: rakaman lapangan penuh skrin + teks pop-up + logo + outro FK */}
      <Composition
        id="Amanah"
        component={Amanah}
        schema={amanahSchema}
        defaultProps={{ music: true }}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={1080}
        height={1920}
      />
    </>
  );
};
