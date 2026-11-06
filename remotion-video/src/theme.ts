import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

/** The four-colour palette. Nothing outside these (plus alpha) is used. */
export const C = {
  bg: "#F5F1E8", // warm off-white
  ink: "#292929", // charcoal: characters + type
  blue: "#53758A", // muted blue: secondary elements
  gold: "#C5A45D", // soft gold: highlights only
} as const;

export const FPS = 30;
export const W = 1080;
export const H = 1920;

// Fonts are bundled locally (SIL OFL, from @fontsource) so renders never
// depend on network access to Google Fonts.
export const HEAD = "Montserrat";
export const BODY = "Poppins";
loadFont({ family: HEAD, url: staticFile("fonts/montserrat-latin-800-normal.woff2"), weight: "800" });
loadFont({ family: BODY, url: staticFile("fonts/poppins-latin-500-normal.woff2"), weight: "500" });
loadFont({ family: BODY, url: staticFile("fonts/poppins-latin-700-normal.woff2"), weight: "700" });

/** TikTok safe zone (px in a 1080x1920 frame). */
export const SAFE = { top: 200, bottom: 420, left: 80, right: 160 };
