import React from "react";
import { useCurrentFrame } from "remotion";
import type { Unit } from "../data/hornbill";
import { exitProgress } from "../lib/anim";
import { COLORS } from "../lib/theme";
import { KineticText } from "./KineticText";
import { NumberReveal } from "./NumberReveal";

type Props = {
  unit: Unit;
  labelAt: number;
  priceAt: number;
  subAt?: number;
  sub?: string;
  exitAt?: number;
  size?: number;
};

/** Config label small → price huge in gold (overshoot + pulse) → qualifier slides underneath. */
export const PriceCard: React.FC<Props> = ({ unit, labelAt, priceAt, subAt, sub, exitAt, size = 250 }) => {
  const frame = useCurrentFrame();
  const exit = exitProgress(frame, exitAt, 7);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18, transform: `scale(${1 + exit * 0.3})` }}>
      <KineticText text={unit.config} delay={labelAt} from="left" size={110} exitAt={exitAt} exitTo="left" color={COLORS.white} />
      <NumberReveal
        value={unit.price.value}
        decimals={unit.price.decimals}
        prefix={unit.price.prefix}
        suffix={unit.price.suffix}
        delay={priceAt}
        size={size}
        suffixScale={0.5}
        pulseAt={priceAt + 20}
        exitAt={exitAt}
      />
      {sub && subAt !== undefined ? (
        <KineticText text={sub} delay={subAt} from="bottom" distance={120} size={56} weight={800} tracking={0.3} exitAt={exitAt} exitTo="bottom" color={COLORS.offWhite} />
      ) : null}
    </div>
  );
};
