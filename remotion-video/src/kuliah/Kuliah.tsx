import type { Caption } from "@remotion/captions";
import { Audio, Video } from "@remotion/media";
import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import captionsJson from "./captions.json";
import "./fonts";
import { palette } from "./fonts";
import {
  placeSegments,
  sec,
  segmentStart,
  timeline,
  totalFrames,
  type PlacedSegment,
} from "./layout";
import { Captions, ChapterCard, FilmLook, QuoteCard } from "./overlays";

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

export const KULIAH_DURATION = totalFrames();

/** One shot: dissolves in over the previous shot with a slow push-in. */
const Shot: React.FC<{ seg: PlacedSegment; index: number }> = ({
  seg,
  index,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, Math.max(1, seg.fadeIn)], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.sin),
  });
  const close = seg.framing === "close";
  const card = seg.framing === "card";
  // close-ups sit the ustaz in the upper third, so push towards his face
  const [z0, z1] = card ? [1, 1] : close ? [1.1, 1.17] : [1.02, 1.08];
  const zoom = interpolate(
    frame,
    [0, seg.length],
    index % 2 === 0 ? [z0, z1] : [z1, z0],
    clamp,
  );

  return (
    <AbsoluteFill style={{ opacity, overflow: "hidden" }}>
      <Video
        src={staticFile(seg.src)}
        trimBefore={sec(seg.from)}
        muted
        objectFit="cover"
        style={{
          width: "100%",
          height: "100%",
          scale: String(zoom),
          transformOrigin: close ? "50% 26%" : "50% 42%",
        }}
      />
    </AbsoluteFill>
  );
};

/** The ustaz's cleaned voice for one segment, with short crossfades at the joins. */
const Voice: React.FC<{ seg: PlacedSegment }> = ({ seg }) => {
  if (!seg.audio) {
    return null;
  }
  const edgeIn = sec(0.25);
  const edgeOut = sec(0.35);
  return (
    <Audio
      src={staticFile(seg.audio)}
      trimBefore={sec(seg.from)}
      volume={(f) =>
        interpolate(
          f,
          [0, edgeIn, seg.length - edgeOut, seg.length],
          [0, 1, 1, 0],
          clamp,
        )
      }
    />
  );
};

const BRoll: React.FC<{ src: string; from: number; dur: number }> = ({
  src,
  from,
  dur,
}) => {
  const frame = useCurrentFrame();
  const edge = sec(0.6);
  const opacity = interpolate(frame, [0, edge, dur - edge, dur], [0, 1, 1, 0], {
    ...clamp,
    easing: Easing.inOut(Easing.sin),
  });
  const zoom = interpolate(frame, [0, dur], [1.04, 1.1], clamp);
  return (
    <AbsoluteFill style={{ opacity, overflow: "hidden" }}>
      <Video
        src={staticFile(src)}
        trimBefore={sec(from)}
        muted
        objectFit="cover"
        style={{ width: "100%", height: "100%", scale: String(zoom) }}
      />
    </AbsoluteFill>
  );
};

/** Soft ambient pad: present under the title cards, far below the voice during the talk. */
const Ambient: React.FC<{ voiceFrom: number; voiceTo: number }> = ({
  voiceFrom,
  voiceTo,
}) => {
  const end = KULIAH_DURATION;
  return (
    <Audio
      src={staticFile("audio/ambient.m4a")}
      volume={(f) =>
        interpolate(
          f,
          [0, sec(1.5), voiceFrom, voiceFrom + sec(2), voiceTo - sec(1), voiceTo + sec(1), end - sec(1.5), end],
          [0, 1, 1, 0.45, 0.45, 1, 1, 0],
          clamp,
        )
      }
    />
  );
};

export const Kuliah: React.FC = () => {
  const segments = placeSegments();
  const speech = segments.filter((s) => s.audio);
  const voiceFrom = speech[0].start;
  const lastVoice = speech[speech.length - 1];
  const voiceTo = lastVoice.start + lastVoice.length;

  const quoteWindows: [number, number][] = [
    ...timeline.quotes,
    ...timeline.chapters,
  ].map((q) => {
    const a = segmentStart(q.seg) + sec(q.at);
    return [a, a + sec(q.dur)];
  });

  return (
    <AbsoluteFill style={{ backgroundColor: palette.ground }}>
      {segments.map((seg, i) => (
        <Sequence
          key={seg.id}
          name={`Shot ${seg.id}`}
          from={seg.start}
          durationInFrames={seg.length}
        >
          <Shot seg={seg} index={i} />
        </Sequence>
      ))}

      {timeline.broll.map((b) => (
        <Sequence
          key={`${b.seg}-${b.src}-${b.at}`}
          name={`B-roll ${b.src}`}
          from={segmentStart(b.seg) + sec(b.at)}
          durationInFrames={sec(b.dur)}
        >
          <BRoll src={b.src} from={b.from} dur={sec(b.dur)} />
        </Sequence>
      ))}

      <FilmLook />

      {timeline.chapters.map((c) => (
        <Sequence
          key={c.title}
          name={`Bab ${c.title}`}
          from={segmentStart(c.seg) + sec(c.at)}
          durationInFrames={sec(c.dur)}
        >
          <ChapterCard label={c.label} title={c.title} dur={sec(c.dur)} />
        </Sequence>
      ))}

      {timeline.quotes.map((q) => (
        <Sequence
          key={`${q.seg}-${q.at}`}
          name={`Petikan ${q.seg}`}
          from={segmentStart(q.seg) + sec(q.at)}
          durationInFrames={sec(q.dur)}
        >
          <QuoteCard
            arabicText={q.arabic}
            text={q.text}
            source={q.source}
            dur={sec(q.dur)}
          />
        </Sequence>
      ))}

      <Captions
        captions={captionsJson as Caption[]}
        hiddenRanges={quoteWindows}
      />

      {segments.map((seg) => (
        <Sequence
          key={`voice-${seg.id}`}
          name={`Suara ${seg.id}`}
          from={seg.start}
          durationInFrames={seg.length}
          layout="none"
        >
          <Voice seg={seg} />
        </Sequence>
      ))}
      <Ambient voiceFrom={voiceFrom} voiceTo={voiceTo} />
    </AbsoluteFill>
  );
};
