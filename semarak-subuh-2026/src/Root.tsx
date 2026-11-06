import { Composition } from "remotion";
import { SemarakSubuh, T } from "./SemarakSubuh";

export const RemotionRoot: React.FC = () => (
  <Composition id="SemarakSubuh2026" component={SemarakSubuh} durationInFrames={T.total} fps={T.fps} width={T.width} height={T.height} />
);
