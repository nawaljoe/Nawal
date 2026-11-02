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
import {
  DAWN_FILTER,
  DawnOverlay,
  Grade,
  SUNSET_FILTER,
  SunsetOverlay,
} from "./grades";

export type ShotProps = {
  /** fail dalam public/, contoh "bekal/footage/bag.mp4" atau .jpg */
  src: string;
  /** saat mula & tamat dalam timeline */
  start: number;
  end: number;
  grade: Grade;
  /** saat untuk fade masuk (crossfade atas klip sebelumnya) */
  fadeIn?: number;
  /** saat tambahan selepas `end` supaya klip seterusnya boleh crossfade */
  tail?: number;
  /** kelajuan main, <1 = slow-mo */
  rate?: number;
  /** potong awal footage (saat) */
  trim?: number;
  /** zoom perlahan [mula, akhir] */
  zoom?: [number, number];
  /** kedudukan fokus objectPosition */
  position?: string;
  /** titik tengah zoom, contoh "50% 10%" untuk zoom ke bahagian atas */
  origin?: string;
  volume?: number;
  name?: string;
};

const ShotInner: React.FC<
  Omit<ShotProps, "start" | "end" | "name"> & { length: number }
> = ({
  src,
  grade,
  fadeIn = 0,
  rate = 1,
  trim = 0,
  zoom = [1, 1.05],
  position = "50% 50%",
  origin = "50% 50%",
  volume = 0,
  length,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const isImage = /\.(jpe?g|png|webp)$/i.test(src);
  const mediaStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    objectPosition: position,
    filter: grade === "sunset" ? SUNSET_FILTER : DAWN_FILTER,
  };

  return (
    <AbsoluteFill
      style={{
        opacity:
          fadeIn > 0
            ? interpolate(frame, [0, fadeIn * fps], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.bezier(0.33, 0, 0.67, 1),
              })
            : 1,
        overflow: "hidden",
        backgroundColor: "black",
      }}
    >
      <AbsoluteFill
        style={{
          transformOrigin: origin,
          scale: interpolate(frame, [0, length], zoom, {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          }),
        }}
      >
        {isImage ? (
          <Img src={staticFile(src)} style={mediaStyle} />
        ) : (
          <Video
            src={staticFile(src)}
            trimBefore={Math.round(trim * fps)}
            playbackRate={rate}
            volume={volume}
            muted={volume === 0}
            objectFit="cover"
            style={mediaStyle}
          />
        )}
      </AbsoluteFill>
      {grade === "sunset" ? <SunsetOverlay /> : <DawnOverlay />}
    </AbsoluteFill>
  );
};

export const Shot: React.FC<ShotProps> = ({
  start,
  end,
  tail = 0.6,
  name,
  ...rest
}) => {
  const { fps } = useVideoConfig();
  const from = Math.round(start * fps);
  const length = Math.round((end - start + tail) * fps);
  return (
    <Sequence
      name={name ?? rest.src}
      from={from}
      durationInFrames={length}
      layout="absolute-fill"
      premountFor={fps}
    >
      <ShotInner {...rest} length={length} />
    </Sequence>
  );
};
