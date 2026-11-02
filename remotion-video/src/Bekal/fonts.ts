import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Font disimpan lokal dalam public/bekal/fonts supaya render tak bergantung pada internet.
export const poppins = "Poppins";
export const lora = "Lora";

loadFont({ family: poppins, url: staticFile("bekal/fonts/Poppins-600.woff2"), weight: "600" });
loadFont({ family: poppins, url: staticFile("bekal/fonts/Poppins-800.woff2"), weight: "800" });
loadFont({
  family: lora,
  url: staticFile("bekal/fonts/Lora-Italic.woff2"),
  weight: "400 700",
  style: "italic",
});
