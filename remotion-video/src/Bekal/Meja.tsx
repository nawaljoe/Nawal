import React from "react";
import { Video } from "@remotion/media";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { SUNSET_FILTER, SunsetOverlay } from "./grades";

/** Bilangan frame yang dijana oleh scripts/bekal-ghost.py */
export const GHOST_FRAMES = 49;
/** Indeks frame lapisan hantu bila setiap bungkusan "mendarat" (untuk bunyi pop) */
export const GHOST_LANDINGS = [10, 24, 41, 47];

/** Makanan tambahan (PNG lut sinar), contoh sandwich/mi goreng/nasi goreng dari Seedance/Nano Banana */
export type MakananTambahan = {
  /** fail dalam public/, contoh "bekal/makanan/nasi_goreng.png" */
  src: string;
  /** kedudukan tengah (piksel dalam bingkai 1080×1920) */
  x: number;
  y: number;
  /** lebar dalam piksel */
  width: number;
  rotate?: number;
  /** saat (relatif kepada babak meja) bila makanan mendarat */
  at: number;
};

type Props = {
  /** saat (relatif) bila tangan "orang lain" mula muncul */
  ghostStart: number;
  /** kelajuan lapisan hantu (<1 = lebih perlahan) */
  ghostSpeed: number;
  length: number;
  tambahan: MakananTambahan[];
};

const GhostLayers: React.FC<{ ghostStart: number; ghostSpeed: number }> = ({
  ghostStart,
  ghostSpeed,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - ghostStart * fps;
  if (local < 0) return null;
  const idx = Math.min(GHOST_FRAMES - 1, Math.floor(local * ghostSpeed));
  const n = String(idx).padStart(3, "0");
  const handsDone = local * ghostSpeed > GHOST_FRAMES + 2;
  return (
    <>
      {/* makanan diletak orang lain — padat */}
      <Img
        src={staticFile(`bekal/footage/ghost/solid_${n}.png`)}
        style={{ position: "absolute", width: "100%", height: "100%" }}
      />
      {/* tangan orang lain — kabur & pudar macam hantu */}
      {handsDone ? null : (
        <Img
          src={staticFile(`bekal/footage/ghost/hand_${n}.png`)}
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            opacity: 0.6,
            filter: "blur(3px)",
          }}
        />
      )}
    </>
  );
};

const ExtraItem: React.FC<{ item: MakananTambahan }> = ({ item }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const land = item.at * fps;
  const trailStart = land - 0.45 * fps;
  if (frame < trailStart) return null;
  const base: React.CSSProperties = {
    position: "absolute",
    left: item.x - item.width / 2,
    top: item.y - item.width / 2,
    width: item.width,
    rotate: `${item.rotate ?? 0}deg`,
  };
  if (frame < land) {
    // jejak hantu: makanan meluncur masuk dari bawah, kabur & pudar
    const p = interpolate(frame, [trailStart, land], [0, 1], {
      easing: Easing.bezier(0.2, 0.8, 0.2, 1),
    });
    return (
      <Img
        src={staticFile(item.src)}
        style={{
          ...base,
          translate: `0 ${(1 - p) * 420}px`,
          opacity: 0.25 + 0.3 * p,
          filter: "blur(7px)",
        }}
      />
    );
  }
  return (
    <Img
      src={staticFile(item.src)}
      style={{
        ...base,
        scale: interpolate(frame, [land, land + 0.25 * fps], [1.12, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.34, 1.56, 0.64, 1),
        }),
        filter: "drop-shadow(0 18px 22px rgba(60,30,10,0.35))",
      }}
    />
  );
};

/**
 * Babak meja: orang pertama letak makanan (klip sebenar),
 * kemudian tangan-tangan "orang lain" yang kabur & pudar datang menambah bekal.
 */
export const MejaScene: React.FC<Props> = ({
  ghostStart,
  ghostSpeed,
  length,
  tambahan,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        backgroundColor: "black",
        opacity: interpolate(frame, [0, 0.12 * fps], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
      }}
    >
      <AbsoluteFill
        style={{
          filter: SUNSET_FILTER,
          scale: interpolate(frame, [0, length], [1.03, 1.1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        <Video
          src={staticFile("bekal/footage/food1_fast.mp4")}
          trimBefore={Math.round(0.15 * fps)}
          playbackRate={0.85}
          muted
          objectFit="cover"
          style={{ width: "100%", height: "100%" }}
        />
        <GhostLayers ghostStart={ghostStart} ghostSpeed={ghostSpeed} />
        {tambahan.map((it, i) => (
          <ExtraItem key={i} item={it} />
        ))}
      </AbsoluteFill>
      <SunsetOverlay />
    </AbsoluteFill>
  );
};

export const MejaShot: React.FC<
  Omit<Props, "length"> & { start: number; end: number; tail?: number }
> = ({ start, end, tail = 0.4, ...rest }) => {
  const { fps } = useVideoConfig();
  const length = Math.round((end - start + tail) * fps);
  return (
    <Sequence
      name="2b. Meja: tangan-tangan meletak bekal"
      from={Math.round(start * fps)}
      durationInFrames={length}
      layout="absolute-fill"
      premountFor={fps}
    >
      <MejaScene {...rest} length={length} />
    </Sequence>
  );
};
