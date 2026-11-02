import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";

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
 * Gred "premium sinematik" untuk babak bekal akhirat (rujukan: rupa podcast studio gelap).
 * Kesan: hitam pekat & kontras tinggi, highlight hangat keemasan, bayang teal gelap,
 * warna kaya tapi terkawal, vignette gelap yang kuat. Tiada kabus — kekal tajam.
 */
export const DAWN_FILTER =
  "contrast(1.3) brightness(0.82) saturate(1.15) sepia(0.2)";

export const DawnOverlay: React.FC<{ intensity?: number }> = ({
  intensity = 1,
}) => {
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: intensity }}>
      {/* split-tone: bayang teal gelap */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(8,38,48,0.55) 0%, rgba(10,30,40,0.35) 55%, rgba(6,20,28,0.6) 100%)",
          mixBlendMode: "soft-light",
        }}
      />
      {/* highlight hangat keemasan (macam lampu tungsten) */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at 60% 40%, rgba(255,176,96,0.30) 0%, rgba(255,150,70,0.10) 45%, rgba(0,0,0,0) 75%)",
          mixBlendMode: "soft-light",
        }}
      />
      {/* gelapkan atas & bawah supaya fokus ke tengah */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.15) 26%, rgba(0,0,0,0) 40%, rgba(0,0,0,0) 62%, rgba(0,0,0,0.55) 100%)",
        }}
      />
      {/* vignette gelap kuat */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 85% 70% at 50% 48%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.72) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

export type Grade = "sunset" | "dawn";
