import { continueRender, delayRender, staticFile } from "remotion";

// Font disimpan lokal (public/fonts) supaya render tak perlukan internet.
const FACES: [string, string, FontFaceDescriptors][] = [
  ["Montserrat", "fonts/Montserrat.woff2", { weight: "100 900", style: "normal" }],
  ["Playfair Display", "fonts/PlayfairDisplay.woff2", { weight: "400 900", style: "normal" }],
  ["Playfair Display", "fonts/PlayfairDisplay-Italic.woff2", { weight: "400 900", style: "italic" }],
];

if (typeof document !== "undefined") {
  const handle = delayRender("Memuat font lokal");
  Promise.all(
    FACES.map(([family, file, desc]) => {
      const face = new FontFace(family, `url(${staticFile(file)}) format("woff2")`, desc);
      return face.load().then((f) => document.fonts.add(f));
    }),
  )
    .then(() => continueRender(handle))
    .catch((err) => {
      console.error(err);
      continueRender(handle);
    });
}

export const fonts = {
  sans: "Montserrat, sans-serif",
  serif: "'Playfair Display', serif",
  serifUpright: "'Playfair Display', serif",
};
