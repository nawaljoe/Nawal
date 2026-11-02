import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

/**
 * Gred warna "sunset / golden hour" untuk babak bekal dunia.
 * Kesan: kuning keemasan, oren-pink di atas, cahaya matahari dari kanan atas,
 * vignette hangat, dan "light leak" yang bergerak perlahan.
 */
export const SUNSET_FILTER =
  "sepia(0.42) saturate(1.65) contrast(1.14) brightness(0.92) hue-rotate(-10deg)";

export const SunsetOverlay: React.FC<{ intensity?: number }> = ({
  intensity = 1,
}) => {
  const frame = useCurrentFrame();
  const drift = Math.sin(frame / 45) * 4;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: intensity }}>
      {/* Tona hangat: oren di atas, magenta lembut di bawah */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(255,110,30,0.75) 0%, rgba(255,160,70,0.4) 45%, rgba(130,35,85,0.6) 100%)",
          mixBlendMode: "overlay",
        }}
      />
      {/* Cahaya matahari terbenam dari kanan atas */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${86 + drift}% ${10 + drift / 2}%, rgba(255,228,165,0.95) 0%, rgba(255,165,75,0.55) 18%, rgba(255,120,60,0) 52%)`,
          mixBlendMode: "screen",
        }}
      />
      {/* Light leak menyerong, bergerak perlahan */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(${118 + drift}deg, rgba(255,90,40,0) 30%, rgba(255,150,80,0.3) 48%, rgba(255,90,40,0) 66%)`,
          mixBlendMode: "screen",
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0) 55%, rgba(40,10,0,0.45) 100%)",
        }}
      />
      {/* Vignette hangat */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 50%, rgba(45,12,0,0.6) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

/**
 * Gred "subuh tenang" untuk babak bekal akhirat.
 * Kesan: kurang saturasi, kontras lembut, biru fajar ke ungu lembut,
 * kabus cahaya halus dan vignette lembut.
 */
export const DAWN_FILTER =
  "saturate(0.72) contrast(0.9) brightness(1.04) sepia(0.06)";

export const DawnOverlay: React.FC<{ intensity?: number }> = ({
  intensity = 1,
}) => {
  const frame = useCurrentFrame();
  const breathe = interpolate(Math.sin(frame / 60), [-1, 1], [0.05, 0.11]);
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: intensity }}>
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(60,100,170,0.55) 0%, rgba(120,140,200,0.25) 50%, rgba(150,120,180,0.35) 100%)",
          mixBlendMode: "soft-light",
        }}
      />
      {/* Kabus cahaya fajar dari atas */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(220,232,255,0.45) 0%, rgba(220,232,255,0) 60%)",
          mixBlendMode: "screen",
        }}
      />
      <AbsoluteFill
        style={{ backgroundColor: `rgba(225,235,255,${breathe})` }}
      />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(8,14,35,0.4) 100%)",
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 55%, rgba(8,14,35,0.55) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

export type Grade = "sunset" | "dawn";
