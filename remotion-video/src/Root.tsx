import React from "react";
import { Composition, Folder } from "remotion";
import { Scene1Hook } from "./scenes/Scene1Hook";
import { Scene2Story } from "./scenes/Scene2Story";
import { Scene3Twist } from "./scenes/Scene3Twist";
import { Scene4Message } from "./scenes/Scene4Message";
import { Scene5Cta } from "./scenes/Scene5Cta";
import { FPS, H, W } from "./theme";
import { sceneSeq, TOTAL_FRAMES } from "./timing";
import { ZakatVideo } from "./ZakatVideo";

const scenes: [string, React.FC][] = [
  ["Scene1-Hook", Scene1Hook],
  ["Scene2-Storyline", Scene2Story],
  ["Scene3-Twist", Scene3Twist],
  ["Scene4-Message", Scene4Message],
  ["Scene5-CTA", Scene5Cta],
];

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="ZakatVideo"
      component={ZakatVideo}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={W}
      height={H}
    />
    <Folder name="Scenes">
      {scenes.map(([id, c], i) => (
        <Composition key={id} id={id} component={c} durationInFrames={sceneSeq(i + 1).durationInFrames} fps={FPS} width={W} height={H} />
      ))}
    </Folder>
  </>
);
