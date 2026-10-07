import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

const weights = ["500", "600", "700", "800", "900"] as const;

export const fontsReady = Promise.all(
  weights.flatMap((weight) => [
    loadFont({ family: "Inter", url: staticFile(`fonts/inter-latin-${weight}-normal.woff2`), weight }),
    loadFont({ family: "InterExt", url: staticFile(`fonts/inter-latin-ext-${weight}-normal.woff2`), weight }),
    loadFont({
      family: "Noto Sans Devanagari",
      url: staticFile(`fonts/noto-sans-devanagari-devanagari-${weight}-normal.woff2`),
      weight,
    }),
  ]),
);
