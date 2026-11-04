import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Fonts live in public/fonts so renders don't depend on reaching Google Fonts.
export const serif = "Cormorant Garamond";
export const arabic = "Amiri";
export const sans = "Inter";

const faces: Parameters<typeof loadFont>[0][] = [
  { family: serif, url: staticFile("fonts/cormorant-500.woff2"), weight: "500" },
  { family: serif, url: staticFile("fonts/cormorant-600.woff2"), weight: "600" },
  {
    family: serif,
    url: staticFile("fonts/cormorant-500-italic.woff2"),
    weight: "500",
    style: "italic",
  },
  { family: arabic, url: staticFile("fonts/amiri-arabic.woff2"), weight: "400" },
  { family: sans, url: staticFile("fonts/inter.woff2"), weight: "400 500" },
];
faces.forEach((face) => loadFont(face));

export const palette = {
  ink: "#f6efe2",
  gold: "#e3c287",
  muted: "rgba(246, 239, 226, 0.78)",
  ground: "#07090c",
};
