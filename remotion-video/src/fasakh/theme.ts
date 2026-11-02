// Fonts bundled locally (no network fetch at render time).
import "@fontsource/montserrat/latin-600.css";
import "@fontsource/montserrat/latin-700.css";
import "@fontsource/montserrat/latin-800.css";
import "@fontsource/montserrat/latin-900.css";
import "@fontsource/playfair-display/latin-700-italic.css";

export const montserrat = "'Montserrat', sans-serif";
export const playfair = "'Playfair Display', serif";

export const C = {
  gold: "#F2C46D",
  goldDeep: "#C9973F",
  ink: "#FFFFFF",
  night: "rgba(10,12,16,0.72)",
  glass: "rgba(14,16,22,0.58)",
};

export const FPS = 30;
export const sec = (s: number) => Math.round(s * FPS);
