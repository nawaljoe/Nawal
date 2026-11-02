import React from "react";
import { Video } from "@remotion/media";
import {
  AbsoluteFill,
  Img,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { SUNSET_FILTER, SunsetOverlay } from "./grades";

/** Bilangan frame yang dijana oleh scripts/bekal-bagkey.py */
export const BAG_FRAMES = 102;

/**
 * Shot POV: tangan pegang beg bekal (latar dibuang) di depan,
 * timelapse perjalanan masuk bangunan pejabat di belakang.
 */
const BawaInner: React.FC<{ length: number; bgRate: number }> = ({
  length,
  bgRate,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const idx = Math.min(BAG_FRAMES - 1, frame);
  // langkah berjalan: beg terbuai sedikit ikut rentak (150 BPM = 0.4s satu langkah)
  const step = (frame / fps / 0.4) * Math.PI;
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
      <AbsoluteFill style={{ filter: SUNSET_FILTER }}>
        {/* latar: timelapse jalan ke bangunan, sedikit kabur untuk kedalaman */}
        <AbsoluteFill
          style={{
            filter: "blur(2px)",
            scale: interpolate(frame, [0, length], [1.08, 1.16], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          <Video
            src={staticFile("bekal/footage/walk_nolift.mp4")}
            playbackRate={bgRate}
            muted
            objectFit="cover"
            style={{ width: "100%", height: "100%" }}
          />
        </AbsoluteFill>
        {/* depan: tangan + beg bekal */}
        <Img
          src={staticFile(`bekal/footage/bagkey/bag_${String(idx).padStart(3, "0")}.png`)}
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            translate: `${Math.sin(step / 2) * 6}px ${Math.abs(Math.sin(step)) * -12 + 40}px`,
            rotate: `${Math.sin(step / 2) * 0.8}deg`,
            filter: "drop-shadow(0 20px 30px rgba(40,15,0,0.35))",
          }}
        />
      </AbsoluteFill>
      <SunsetOverlay />
    </AbsoluteFill>
  );
};

export const BawaShot: React.FC<{
  start: number;
  end: number;
  tail?: number;
  bgRate: number;
}> = ({ start, end, tail = 0.4, bgRate }) => {
  const { fps } = useVideoConfig();
  const length = Math.round((end - start + tail) * fps);
  return (
    <Sequence
      name="1b. Bawa bekal ke pejabat (POV)"
      from={Math.round(start * fps)}
      durationInFrames={length}
      layout="absolute-fill"
      premountFor={fps}
    >
      <BawaInner length={length} bgRate={bgRate} />
    </Sequence>
  );
};
