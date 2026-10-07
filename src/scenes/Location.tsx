import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { GlassCard } from "../components/GlassCard";
import { GradientOverlay } from "../components/GradientOverlay";
import { Icon } from "../components/icons";
import { KineticText } from "../components/KineticText";
import { MapNode, MapRoute } from "../components/MapRoute";
import { Media } from "../components/Media";
import { Particles } from "../components/Particles";
import { SceneShell } from "../components/SceneShell";
import { assets } from "../data/assets";
import { useScene } from "../lib/scene";
import { COLORS, FONT_FAMILY, SAFE } from "../lib/theme";

/** 03 — "ये है Magarpatta Riverview City। Pune–Solapur highway पर Manali Resort के पास।" */
export const Location: React.FC = () => {
  const { at, duration, copy } = useScene();
  const c = copy.location;
  const L = c.mapLabels;
  const mapStart = at("pune") - 3;
  const mapDur = duration - mapStart;

  // Schematic only — relative order follows the brochure location map (p.19), not to scale.
  const nodes: MapNode[] = [
    { x: 140, y: 1440, label: L.pune, kind: "city", labelSide: "below" },
    { x: 360, y: 1290, label: L.magarpatta, kind: "city", labelSide: "above" },
    { x: 620, y: 1110, label: "", kind: "city" },
    { x: 810, y: 930, label: L.dest, sub: L.destSub, kind: "dest" },
  ];
  const mid = { x: (nodes[1].x + nodes[2].x) / 2, y: (nodes[1].y + nodes[2].y) / 2 };
  const angle = (Math.atan2(nodes[2].y - nodes[1].y, nodes[2].x - nodes[1].x) * 180) / Math.PI;

  return (
    <SceneShell duration={duration} enter="whip-left" exit="cut">
      {/* A: aerial footage + name */}
      <Sequence durationInFrames={mapStart + 2} layout="none">
        <AbsoluteFill>
          <Media asset={assets.droneAerial} duration={mapStart} from={{ scale: 1.0 }} to={{ scale: 1.25, y: 40 }} />
          <GradientOverlay top={0.7} bottom={0.9} />
          <AbsoluteFill style={{ top: 980, alignItems: "center" }}>
            <KineticText text={c.intro} delay={at("yehHai")} from="bottom" distance={120} size={70} weight={800} exitAt={mapStart - 6} />
            <KineticText text={c.name1} delay={at("riverview")} from="left" size={140} exitAt={mapStart - 6} exitTo="left" />
            <KineticText text={c.name2} delay={at("riverview") + 7} from="right" size={128} exitAt={mapStart - 6} exitTo="right" />
          </AbsoluteFill>
        </AbsoluteFill>
      </Sequence>

      {/* B: schematic map */}
      <Sequence from={mapStart} layout="none">
        <SceneShell duration={mapDur} enter="whip-left" background="radial-gradient(circle at 70% 45%, #123D91 0%, #071C47 45%, #050B1A 100%)">
          <MapRoute
            nodes={nodes}
            drawFrom={at("pune") - mapStart}
            drawTo={at("manali") - mapStart + 4}
            roadLabel={L.road}
            roadLabelAt={{ x: mid.x + 60, y: mid.y + 90, angle }}
            pois={[{ x: 700, y: 760, label: L.resort, kind: "poi", labelSide: "left", at: at("manali") - mapStart }]}
            duration={mapDur}
          />
          <Particles seed="map" count={18} opacity={0.4} />
          <AbsoluteFill style={{ top: SAFE.top + 10, alignItems: "center" }}>
            <KineticText text={c.highway} delay={at("highway") - mapStart} from="top" distance={300} size={118} />
          </AbsoluteFill>
          <GlassCard
            delay={at("manali") - mapStart}
            from="bottom"
            tint="gold"
            style={{ left: 140, top: 1528, width: 800, height: 118, display: "flex", alignItems: "center", justifyContent: "center", gap: 22 }}
          >
            <Icon kind="road" size={64} />
            <div style={{ fontFamily: FONT_FAMILY, fontWeight: 900, fontSize: 52, color: COLORS.white, letterSpacing: "0.01em" }}>{c.near}</div>
          </GlassCard>
        </SceneShell>
      </Sequence>
    </SceneShell>
  );
};
