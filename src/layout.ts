import { useVideoConfig } from "remotion";

/**
 * Shared layout metrics so every scene works in both the 9:16 Reel and the
 * 16:9 landscape composition.
 *
 * Portrait keeps a 120px top / 250px bottom safe area for Instagram UI.
 * Scene visuals live inside `stage`; captions sit below it.
 */
export type Layout = {
  portrait: boolean;
  width: number;
  height: number;
  /** Global size multiplier (1 in portrait). */
  s: number;
  /** Box (absolute px) reserved for scene visuals. */
  stage: { top: number; left: number; width: number; height: number };
  /** Vertical centre of the caption block, as a fraction of height. */
  captionY: number;
  captionMaxWidth: number;
  captionFontSize: number;
  safe: { top: number; bottom: number; side: number };
};

export const useLayout = (): Layout => {
  const { width, height } = useVideoConfig();
  const portrait = height >= width;

  if (portrait) {
    const safe = { top: 120, bottom: 250, side: 70 };
    return {
      portrait,
      width,
      height,
      s: 1,
      stage: { top: 190, left: safe.side, width: width - safe.side * 2, height: 1060 },
      captionY: 0.7,
      captionMaxWidth: 900,
      captionFontSize: 72,
      safe,
    };
  }

  const safe = { top: 60, bottom: 90, side: 110 };
  return {
    portrait,
    width,
    height,
    s: 0.72,
    stage: { top: 120, left: safe.side, width: width - safe.side * 2, height: 680 },
    captionY: 0.84,
    captionMaxWidth: 1400,
    captionFontSize: 60,
    safe,
  };
};
