import React from "react";
import { random } from "remotion";

type LayerFn = (muted: boolean, style?: React.CSSProperties) => React.ReactNode;

/**
 * Digital glitch: RGB-style split in gold/white tones plus horizontal slice
 * offsets. Renders the base layer (with audio) always, and muted copies only
 * while active, so the voiceover is never doubled.
 */
export const Glitch: React.FC<{ frame: number; end: number; layer: LayerFn; start?: number }> = ({
  frame,
  end,
  layer,
  start = 0,
}) => {
  const active = frame >= start && frame < end;
  const t = frame - start;
  const r = (k: string) => random(`glitch-${k}-${t}`);
  const intensity = active ? 1 - t / (end - start) : 0;

  return (
    <>
      {layer(false)}
      {active ? (
        <>
          {/* gold channel */}
          <div style={{ position: "absolute", inset: 0, mixBlendMode: "screen", opacity: 0.55 * intensity }}>
            {layer(true, {
              transform: `translateX(${(r("gx") * 24 + 8) * intensity}px)`,
              filter: "sepia(1) saturate(4) hue-rotate(-12deg) brightness(1.1)",
            })}
          </div>
          {/* white channel */}
          <div style={{ position: "absolute", inset: 0, mixBlendMode: "screen", opacity: 0.35 * intensity }}>
            {layer(true, {
              transform: `translateX(${-(r("wx") * 24 + 8) * intensity}px)`,
              filter: "grayscale(1) brightness(1.4)",
            })}
          </div>
          {/* horizontal slice offsets */}
          {[0, 1, 2].map((i) => {
            const top = r(`st${i}`) * 85;
            const h = 3 + r(`sh${i}`) * 9;
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  inset: 0,
                  clipPath: `inset(${top}% 0 ${100 - top - h}% 0)`,
                  transform: `translateX(${(r(`sx${i}`) - 0.5) * 120 * intensity}px)`,
                }}
              >
                {layer(true)}
              </div>
            );
          })}
        </>
      ) : null}
    </>
  );
};
