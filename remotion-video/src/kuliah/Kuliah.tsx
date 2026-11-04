import type { Caption } from "@remotion/captions";
import { Audio, Video } from "@remotion/media";
import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
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
import {
  Captions,
  ChapterCard,
  FilmLook,
  HookText,
  QuoteCard,
} from "./overlays";

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

export const KULIAH_DURATION = totalFrames();

/** 0 at rest → 1 right at the cut, for the head and the tail of a shot. */
const edgeAmount = (frame: number, seg: PlacedSegment) => {
  const ease = Easing.inOut(Easing.sin);
  const head =
    seg.inFrames > 0
      ? interpolate(frame, [0, seg.inFrames], [1, 0], { ...clamp, easing: ease })
      : 0;
  const tail =
    seg.outFrames > 0
      ? interpolate(frame, [seg.length - seg.outFrames, seg.length], [0, 1], {
          ...clamp,
          easing: ease,
        })
      : 0;
  return head >= tail
    ? { t: head, type: seg.inType }
    : { t: tail, type: seg.outType };
};

const transitionLook = (t: number, type: string | null) => {
  if (!type || t <= 0) {
    return { opacity: 1, filter: "none", extraZoom: 0 };
  }
  if (type === "dip") {
    return { opacity: 1 - t, filter: `blur(${t * 6}px)`, extraZoom: t * 0.02 };
  }
  if (type === "glow") {
    return {
      opacity: 1 - t * 0.15,
      filter: `blur(${t * 12}px) brightness(${1 + t * 0.55}) saturate(${1 - t * 0.25})`,
      extraZoom: t * 0.04,
    };
  }
  // blur: a soft focus pull through the cut
  return {
    opacity: 1 - t * 0.3,
    filter: `blur(${t * 20}px) brightness(${1 + t * 0.06})`,
    extraZoom: t * 0.035,
  };
};

/** One shot with a gentle push-in; its head and tail carry the transition. */
const Shot: React.FC<{ seg: PlacedSegment; index: number }> = ({
  seg,
  index,
}) => {
  const frame = useCurrentFrame();
  const { t, type } = edgeAmount(frame, seg);
  const look = transitionLook(t, type);
  const close = seg.framing === "close";
  const card = seg.framing === "card";
  // keep zoom small so the picture stays sharp
  const [z0, z1] = card ? [1, 1] : close ? [1.0, 1.05] : [1.0, 1.035];
  const zoom =
    interpolate(frame, [0, seg.length], index % 2 === 0 ? [z0, z1] : [z1, z0], clamp) +
    look.extraZoom;

  return (
    <AbsoluteFill style={{ opacity: look.opacity, overflow: "hidden" }}>
      <Video
        src={staticFile(seg.src)}
        trimBefore={sec(seg.from)}
        muted
        objectFit="cover"
        style={{
          width: "100%",
          height: "100%",
          scale: String(zoom),
          filter: look.filter,
          transformOrigin: close ? "50% 28%" : "50% 42%",
        }}
      />
    </AbsoluteFill>
  );
};

/** Warm light leak that blooms across a "glow" cut. */
const LightLeak: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const mid = dur / 2;
  const o = interpolate(frame, [0, mid, dur], [0, 1, 0], {
    ...clamp,
    easing: Easing.inOut(Easing.sin),
  });
  const sweep = interpolate(frame, [0, dur], [-20, 120], clamp);
  return (
    <AbsoluteFill
      style={{
        opacity: o,
        mixBlendMode: "screen",
        background: `radial-gradient(ellipse 60% 45% at ${sweep}% 35%, rgba(255,214,150,0.95) 0%, rgba(255,170,90,0.45) 40%, rgba(255,150,80,0) 75%), radial-gradient(ellipse 80% 60% at 50% 50%, rgba(255,236,205,0.55) 0%, rgba(255,236,205,0) 70%)`,
      }}
    />
  );
};

/** The ustaz's cleaned voice for one segment; clips butt-join, so only click-free micro fades. */
const Voice: React.FC<{ seg: PlacedSegment }> = ({ seg }) => {
  if (!seg.audio) {
    return null;
  }
  const edgeIn = sec(0.08);
  const edgeOut = sec(0.15);
  const gain = seg.volume ?? 1;
  return (
    <Audio
      src={staticFile(seg.audio)}
      trimBefore={sec(seg.from)}
      volume={(f) =>
        interpolate(
          f,
          [0, edgeIn, seg.length - edgeOut, seg.length],
          [0, gain, gain, 0],
          clamp,
        )
      }
    />
  );
};

/** Cutaway over the talk: resolves in from soft focus and dissolves back out. */
const BRoll: React.FC<{ src: string; from: number; dur: number }> = ({
  src,
  from,
  dur,
}) => {
  const frame = useCurrentFrame();
  const edge = sec(0.7);
  const ease = Easing.inOut(Easing.sin);
  const opacity = interpolate(frame, [0, edge, dur - edge, dur], [0, 1, 1, 0], {
    ...clamp,
    easing: ease,
  });
  const blur = interpolate(frame, [0, edge, dur - edge, dur], [14, 0, 0, 14], {
    ...clamp,
    easing: ease,
  });
  const zoom = interpolate(frame, [0, dur], [1.0, 1.04], clamp);
  return (
    <AbsoluteFill style={{ opacity, overflow: "hidden" }}>
      <Video
        src={staticFile(src)}
        trimBefore={sec(from)}
        muted
        objectFit="cover"
        style={{
          width: "100%",
          height: "100%",
          scale: String(zoom),
          filter: blur > 0.05 ? `blur(${blur}px)` : "none",
        }}
      />
    </AbsoluteFill>
  );
};

/**
 * Soft ambient pad. Each segment sets its own level (full under title cards,
 * low under the ustaz, silent under clips that bring their own sound); the
 * level glides between segments instead of jumping.
 */
const Ambient: React.FC<{ segments: PlacedSegment[] }> = ({ segments }) => {
  const ramp = sec(0.6);
  const xs: number[] = [];
  const ys: number[] = [];
  segments.forEach((seg) => {
    const level = seg.ambient ?? 0.3;
    const a = seg.start + Math.min(ramp, Math.floor(seg.length / 3));
    const b = seg.start + seg.length - Math.min(ramp, Math.floor(seg.length / 3));
    xs.push(a, b);
    ys.push(level, level);
  });
  return (
    <Audio
      src={staticFile("audio/ambient.m4a")}
      volume={(f) => interpolate(f, xs, ys, clamp)}
    />
  );
};

/** Johor crest, Maju Johor and FK watermark over every branded stretch of the film. */
const LogoOverlay: React.FC<{ dur: number; fadeIn: boolean }> = ({
  dur,
  fadeIn,
}) => {
  const frame = useCurrentFrame();
  const edge = sec(0.4);
  const opacity = interpolate(
    frame,
    [0, edge, dur - edge, dur],
    [fadeIn ? 0 : 1, 1, 1, 0],
    clamp,
  );
  return (
    <AbsoluteFill style={{ opacity, pointerEvents: "none" }}>
      <Img
        src={staticFile("brand/logo-overlay.png")}
        style={{ width: "100%", height: "100%" }}
      />
    </AbsoluteFill>
  );
};

/** Contiguous stretches of segments that carry the logo (not the glitch or the FK outro). */
const brandedRanges = (segments: PlacedSegment[]): [number, number][] => {
  const ranges: [number, number][] = [];
  segments.forEach((seg) => {
    if (seg.logo === false) {
      return;
    }
    const last = ranges[ranges.length - 1];
    if (last && last[1] === seg.start) {
      last[1] = seg.start + seg.length;
    } else {
      ranges.push([seg.start, seg.start + seg.length]);
    }
  });
  return ranges;
};

export const Kuliah: React.FC = () => {
  const segments = placeSegments();
  const branded = brandedRanges(segments);

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

      {segments
        .filter((seg) => seg.inType === "glow")
        .map((seg) => {
          const prev = segments[segments.indexOf(seg) - 1];
          const dur = prev.outFrames + seg.inFrames;
          return (
            <Sequence
              key={`leak-${seg.id}`}
              name={`Cahaya ${seg.id}`}
              from={seg.start - prev.outFrames}
              durationInFrames={dur}
            >
              <LightLeak dur={dur} />
            </Sequence>
          );
        })}

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

      {branded.map(([a, b]) => (
        <Sequence key={`look-${a}`} name="Rupa filem" from={a} durationInFrames={b - a}>
          <FilmLook />
        </Sequence>
      ))}

      <Sequence
        name="Hook"
        from={segmentStart(timeline.hook.seg)}
        durationInFrames={placeSegments().find((x) => x.id === timeline.hook.seg)!.length}
      >
        <HookText
          kicker={timeline.hook.kicker}
          place={timeline.hook.place}
          lines={timeline.hook.lines}
        />
      </Sequence>

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
      <Ambient segments={segments} />

      {branded.map(([a, b]) => (
        <Sequence key={`logo-${a}`} name="Logo" from={a} durationInFrames={b - a}>
          <LogoOverlay dur={b - a} fadeIn={a > 0} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
