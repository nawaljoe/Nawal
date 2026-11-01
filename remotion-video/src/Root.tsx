import { Composition } from "remotion";
import { MyComposition } from "./Composition";
import { Amanah, amanahSchema } from "./Amanah/Amanah";
import { FPS, TOTAL_FRAMES } from "./Amanah/script";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <MyComposition />
      {/* Kata-kata motivasi: latar alam + teks pop-up + rakaman lapangan di bawah */}
      <Composition
        id="Amanah"
        component={Amanah}
        schema={amanahSchema}
        defaultProps={{ showBroll: true, music: true }}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={1080}
        height={1920}
      />
      {/* Versi tanpa rakaman: alam + teks sahaja */}
      <Composition
        id="AmanahAlam"
        component={Amanah}
        schema={amanahSchema}
        defaultProps={{ showBroll: false, music: true }}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={1080}
        height={1920}
      />
    </>
  );
};
