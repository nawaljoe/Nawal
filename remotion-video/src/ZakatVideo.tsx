import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, interpolate, Sequence, staticFile } from "remotion";
import { Background } from "./components/Background";
import { Subtitles } from "./components/Subtitles";
import { Scene1Hook } from "./scenes/Scene1Hook";
import { Scene2Story } from "./scenes/Scene2Story";
import { Scene3Twist } from "./scenes/Scene3Twist";
import { Scene4Message } from "./scenes/Scene4Message";
import { Scene5Cta } from "./scenes/Scene5Cta";
import { FPS } from "./theme";
import { sceneSeq, TIMING } from "./timing";

/** 1 while the voice-over is speaking, 0 in pauses (smoothed). */
const voAt = (t: number) =>
  TIMING.words.some((w) => t > w.start - 0.18 && t < w.end + 0.3) ? 1 : 0;
const voEnvelope = (frame: number) => {
  let acc = 0;
  for (let k = -6; k <= 6; k++) acc += voAt((frame + k) / FPS);
  return acc / 13;
};

/** Background score level: ducked under the voice, lifted for the end card. */
const musicVolume = (frame: number) => {
  const duck = voEnvelope(frame);
  const base = interpolate(duck, [0, 1], [0.4, 0.2]);
  const intro = interpolate(frame, [0, 8], [0.6, 1], { extrapolateRight: "clamp" });
  return base * intro;
};

export const ZakatVideo: React.FC = () => {
  const s = [1, 2, 3, 4, 5].map(sceneSeq);
  return (
    <AbsoluteFill>
      <Background />
      <Sequence name="1 Hook" from={s[0].from} durationInFrames={s[0].durationInFrames}>
        <Scene1Hook />
      </Sequence>
      <Sequence name="2 Storyline" from={s[1].from} durationInFrames={s[1].durationInFrames}>
        <Scene2Story />
      </Sequence>
      <Sequence name="3 Twist" from={s[2].from} durationInFrames={s[2].durationInFrames}>
        <Scene3Twist />
      </Sequence>
      <Sequence name="4 Message" from={s[3].from} durationInFrames={s[3].durationInFrames}>
        <Scene4Message />
      </Sequence>
      <Sequence name="5 CTA" from={s[4].from} durationInFrames={s[4].durationInFrames}>
        <Scene5Cta />
      </Sequence>
      <Subtitles />
      <Audio name="Voice-over" src={staticFile("audio/vo.wav")} volume={1} />
      <Audio name="Music" src={staticFile("audio/music.wav")} volume={musicVolume} />
    </AbsoluteFill>
  );
};
