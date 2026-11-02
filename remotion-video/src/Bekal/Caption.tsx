import React from "react";
import { lora, poppins } from "./fonts";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export type CaptionStyle = "warm" | "calm";

type Props = {
  text: string;
  /** perkataan yang ditonjolkan warna */
  highlight?: string;
  start: number;
  end: number;
  variant: CaptionStyle;
  /** kedudukan menegak (0 = atas, 1 = bawah) */
  y?: number;
  size?: number;
};

const CaptionInner: React.FC<Omit<Props, "start" | "end"> & { len: number }> = ({
  text,
  highlight,
  variant,
  y = 0.7,
  size,
  len,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const warm = variant === "warm";
  const inDur = warm ? 0.25 * fps : 0.7 * fps;
  const outDur = warm ? 0.15 * fps : 0.5 * fps;

  const words = text.split(" ");
  const hl = highlight?.toLowerCase();

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-start",
        alignItems: "center",
        paddingTop: `${y * 1920}px`,
      }}
    >
      <div
        style={{
          translate: "0 -50%",
          width: 1000,
          textAlign: "center",
          fontFamily: warm ? poppins : lora,
          fontWeight: warm ? 800 : 500,
          fontStyle: warm ? "normal" : "italic",
          fontSize: size ?? (warm ? 84 : 66),
          lineHeight: 1.15,
          letterSpacing: warm ? -1 : 0.5,
          color: "white",
          textShadow: warm
            ? "0 6px 24px rgba(90,30,0,0.65), 0 2px 4px rgba(0,0,0,0.5)"
            : "0 2px 18px rgba(5,10,30,0.9), 0 1px 3px rgba(0,0,0,0.6)",
          // latar gelap lembut supaya kapsyen tenang jelas di atas latar terang
          background: warm
            ? undefined
            : "radial-gradient(ellipse at center, rgba(8,16,40,0.6) 0%, rgba(8,16,40,0.35) 45%, rgba(8,16,40,0) 72%)",
          padding: warm ? undefined : "50px 20px",
          opacity: interpolate(
            frame,
            [0, inDur, len - outDur, len],
            [0, 1, 1, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          ),
          scale: warm
            ? interpolate(frame, [0, inDur], [0.82, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.bezier(0.34, 1.56, 0.64, 1),
                output: "perceptual-scale",
              })
            : 1,
          filter: warm
            ? undefined
            : `blur(${interpolate(frame, [0, inDur], [8, 0], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              })}px)`,
          marginTop: warm
            ? 0
            : interpolate(frame, [0, inDur + 10], [24, 0], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.bezier(0.16, 1, 0.3, 1),
              }),
        }}
      >
        {words.map((w, i) => {
          const isHl =
            hl && w.toLowerCase().replace(/[^a-z']/g, "").includes(hl);
          return (
            <span
              key={i}
              style={{
                color: isHl ? (warm ? "#FFC46B" : "#F3E3B5") : undefined,
              }}
            >
              {w}
              {i < words.length - 1 ? " " : ""}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const Caption: React.FC<Props> = ({ start, end, ...rest }) => {
  const { fps } = useVideoConfig();
  const len = Math.round((end - start) * fps);
  return (
    <Sequence
      name={`Kapsyen: ${rest.text}`}
      from={Math.round(start * fps)}
      durationInFrames={len}
      layout="absolute-fill"
    >
      <CaptionInner {...rest} len={len} />
    </Sequence>
  );
};
