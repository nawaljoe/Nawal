import React from "react";
import { AbsoluteFill, Audio, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { TransitionSeries, linearTiming, type TransitionPresentation } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { cssBlurSlide, cssLinearBlur } from "./components/CssTransitions";
import { Easing } from "remotion";
import timelineJson from "./data/timeline.json";
import type { Scene, Timeline } from "./types";
import { C, clamp, fontCss } from "./theme";
import { Logo } from "./components/Logo";
import { KeywordCaptions } from "./components/KeywordCaptions";
import { PunchFootage } from "./components/PunchFootage";
import { BrollItem, KenBurnsPhoto } from "./components/Broll";
import { HFOverlay } from "./components/HFOverlay";
import { LightLeakOverlay } from "./components/LightLeakOverlay";
import { MusicBed, SfxTrack } from "./components/Sound";

export const T = timelineJson as unknown as Timeline;

const Grade: React.FC = () => (
  // shared lens vignette, keeps every shot in the same cinematic frame
  <AbsoluteFill style={{ pointerEvents: "none", background: "radial-gradient(ellipse 95% 75% at 50% 42%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.38) 100%), linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0) 14%, rgba(0,0,0,0) 70%, rgba(0,0,0,0.3) 100%)" }} />
);

const Layers: React.FC<{ s: Scene }> = ({ s }) => (
  <>
    {s.broll.map((b, i) => (
      <Sequence key={i} from={b.from} durationInFrames={Math.max(1, b.to - b.from)} name={`broll ${b.src}`}>
        <BrollItem b={b} />
      </Sequence>
    ))}
    <Grade />
    <KeywordCaptions captions={s.captions} />
    {s.overlays.map((o, i) => <HFOverlay key={i} o={o} />)}
  </>
);

const SpeakerScene: React.FC<{ id: string }> = ({ id }) => {
  const s = T.scenes[id];
  return (
    <AbsoluteFill style={{ backgroundColor: C.black }}>
      <PunchFootage src={`scenes/${id}.mp4`} segs={s.segs} />
      <Layers s={s} />
    </AbsoluteFill>
  );
};

/** SCENE 1 — dawn aerial, quick lift from 35% exposure, ustaz's own line under the statement. */
const OpeningScene: React.FC = () => {
  const f = useCurrentFrame(); const s = T.scenes["s1_open"];
  const lift = interpolate(f, [0, 12], [0.35, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  return (
    <AbsoluteFill style={{ backgroundColor: C.black }}>
      <AbsoluteFill style={{ filter: `brightness(${lift})` }}>
        <KenBurnsPhoto src="photos/p43.jpg" fx={0.42} move="push" dur={s.dur} from={1.0} to={1.14} />
      </AbsoluteFill>
      <Grade />
      {s.overlays.map((o, i) => <HFOverlay key={i} o={o} />)}
      <Sequence from={T.openingVoice.from} durationInFrames={T.openingVoice.dur} name="ustaz: ...yang tidak terhitung">
        <Audio src={staticFile("voice/opening.wav")} />
      </Sequence>
    </AbsoluteFill>
  );
};

/** SCENE 2 — programme title over the congregation (slow motion). */
const TitleScene: React.FC = () => {
  const s = T.scenes["s2_title"];
  return (
    <AbsoluteFill style={{ backgroundColor: C.black }}>
      <BrollItem b={{ from: 0, to: s.dur, kind: "video", src: "broll/b03.mp4", at: 0.4, rate: 0.75, holdIn: true, holdOut: true }} />
      <Grade />
      {s.overlays.map((o, i) => <HFOverlay key={i} o={o} />)}
    </AbsoluteFill>
  );
};

/** SCENE 6b — the three keywords together over the whole jemaah. */
const ClosingScene: React.FC = () => {
  const s = T.scenes["s7_closing"];
  return (
    <AbsoluteFill style={{ backgroundColor: C.black }}>
      <KenBurnsPhoto src="photos/p42.jpg" fx={0.5} move="push" dur={s.dur} from={1.04} to={1.12} />
      <Grade />
      {s.overlays.map((o, i) => <HFOverlay key={i} o={o} />)}
    </AbsoluteFill>
  );
};

/** Original Fared Khalid outro, untouched (first 6.5 s: the logo build and its hold). */
const OutroScene: React.FC = () => {
  const s = T.scenes["s8_outro"];
  return (
    <AbsoluteFill style={{ backgroundColor: "#fff" }}>
      <OffthreadVideo src={staticFile("outro.mp4")} style={{ width: 1080, height: 1920 }}
        volume={(f) => interpolate(f, [0, 12, s.dur - 18, s.dur], [0, 0.75, 0.75, 0], clamp)} />
    </AbsoluteFill>
  );
};

const SCENE: Record<string, React.FC> = {
  s1_open: OpeningScene, s2_title: TitleScene,
  s3_puasa: () => <SpeakerScene id="s3_puasa" />, s4_sabar: () => <SpeakerScene id="s4_sabar" />,
  s5_maaf: () => <SpeakerScene id="s5_maaf" />, s6_tutup: () => <SpeakerScene id="s6_tutup" />,
  s7_closing: ClosingScene, s8_outro: OutroScene,
};

function presentation(kind: string): TransitionPresentation<Record<string, unknown>> {
  if (kind === "linearBlur") return cssLinearBlur() as unknown as TransitionPresentation<Record<string, unknown>>;
  if (kind === "blurSlide") return cssBlurSlide() as unknown as TransitionPresentation<Record<string, unknown>>;
  return fade() as unknown as TransitionPresentation<Record<string, unknown>>;
}

export const SemarakSubuh: React.FC = () => {
  const f = useCurrentFrame();
  const outroStart = T.scenes["s8_outro"].start;
  const logoOp = interpolate(f, [outroStart, outroStart + (T.scenes["s8_outro"].transitionIn?.[1] ?? 15)], [1, 0], clamp);
  const items: React.ReactNode[] = [];
  T.order.forEach((id) => {
    const s = T.scenes[id]; const Comp = SCENE[id];
    if (s.transitionIn) {
      const [kind, d] = s.transitionIn;
      if (kind === "lightleak") items.push(<TransitionSeries.Overlay key={`t-${id}`} durationInFrames={d}><LightLeakOverlay /></TransitionSeries.Overlay>);
      else items.push(<TransitionSeries.Transition key={`t-${id}`} presentation={presentation(kind)} timing={linearTiming({ durationInFrames: d, easing: Easing.inOut(Easing.cubic) })} />);
    }
    items.push(<TransitionSeries.Sequence key={id} durationInFrames={s.dur} name={id}><Comp /></TransitionSeries.Sequence>);
  });
  return (
    <AbsoluteFill style={{ backgroundColor: C.black }}>
      <style>{fontCss}</style>
      <TransitionSeries>{items}</TransitionSeries>
      <AbsoluteFill style={{ opacity: logoOp }}><Logo /></AbsoluteFill>
      <MusicBed m={T.music} />
      <SfxTrack cues={T.sfx} />
    </AbsoluteFill>
  );
};
