import { staticFile } from "remotion";

// Fared Khalid identity — gold is an accent only.
export const C = {
  black: "#0b0b0c",
  charcoal: "#18181b",
  gold: "#c9a45c",
  goldLight: "#e6cd94",
  white: "#f5efe2",
};

export const fontCss = `
@font-face { font-family: 'SS-Montserrat'; src: url(${staticFile("fonts/Montserrat-600.woff2")}) format('woff2'); font-weight: 100 900; }
@font-face { font-family: 'SS-Cinzel'; src: url(${staticFile("fonts/Cinzel-700.woff2")}) format('woff2'); font-weight: 400 900; }`;

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
