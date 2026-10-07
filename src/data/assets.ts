// Asset manifest. Every scene asks for a ROLE, never a file path, so a missing
// asset can be dropped in later by editing one line here (see ASSETS.md).

export type MediaAsset = {
  kind: "video" | "image";
  src: string; // relative to /public
  source: string; // where it came from
  note?: string;
};

const v = (src: string, source: string, note?: string): MediaAsset => ({ kind: "video", src, source, note });
const i = (src: string, source: string, note?: string): MediaAsset => ({ kind: "image", src, source, note });

const WALK = "Hornbill walkthrough video (WhatsApp 12.14.44), 848x480, centre-cropped to 9:16";
const BRO = "Hornbill Heights e-Brochure";

export const assets = {
  // ---- footage (real) ----
  droneAerial: v("assets/footage/drone-aerial.mp4", `${WALK} @ 0:36.2–0:42.8`, "Aerial of Hornbill towers"),
  droneClose: v("assets/footage/drone-close.mp4", `${WALK} @ 1:51.0–1:53.6`, "Close drone pass of towers"),
  towersLowAngle: v("assets/footage/towers-lowangle.mp4", `${WALK} @ 0:43–0:46`),
  living: v("assets/footage/living.mp4", `${WALK} @ 0:47–0:52.8`, "Living / dining"),
  livingBalcony: v("assets/footage/living-balcony.mp4", `${WALK} @ 1:21–1:23`),
  kitchen: v("assets/footage/kitchen.mp4", `${WALK} @ 0:53–0:55.8`),
  bedroom: v("assets/footage/bedroom.mp4", `${WALK} @ 0:59–1:04`, "Bedroom-1"),
  masterBedroom: v("assets/footage/master-bedroom.mp4", `${WALK} @ 1:09–1:17`),
  balcony: v("assets/footage/balcony.mp4", `${WALK} @ 1:23.2–1:29.7`),
  hall: v("assets/footage/hall.mp4", `${WALK} @ 1:31–1:34.8`),

  // ---- brochure renders / photos ----
  towerFull: i("assets/brochure/tower-full.jpg", `${BRO} p.8`, "Artistic impression"),
  towerGate: i("assets/brochure/tower-gate.jpg", `${BRO} p.7`, "Tower + entrance gate render"),
  towerPair: i("assets/brochure/tower-pair.jpg", `${BRO} p.13`),
  cover: i("assets/brochure/cover.jpg", `${BRO} p.1`),
  magarpattaCity: i("assets/brochure/magarpatta-city.jpg", `${BRO} p.3`, "Actual photograph"),
  nandedCity: i("assets/brochure/nanded-city.jpg", `${BRO} p.4`),
  legacy: i("assets/brochure/legacy.jpg", `${BRO} p.2`),
  family: i("assets/brochure/family.jpg", `${BRO} p.9`),
  amenitiesTownship: i("assets/brochure/amenities-township.jpg", `${BRO} p.10`),
  amenitiesPodium: i("assets/brochure/amenities-podium.jpg", `${BRO} p.11`),
  openGym: i("assets/brochure/open-gym.jpg", `${BRO} p.12 (top)`),
  podium: i("assets/brochure/podium.jpg", `${BRO} p.12 (bottom)`),
  plan2Bhk: i("assets/brochure/plan-2bhk.jpg", `${BRO} p.15`),
  plan25Bhk: i("assets/brochure/plan-2-5bhk.jpg", `${BRO} p.14`),
  masterPlan: i("assets/brochure/master-plan.jpg", `${BRO} p.18`),
  locationMap: i("assets/maps/location-map.jpg", `${BRO} p.19`),

  // ---- brand / legal ----
  logoCard: i("assets/logos/hornbill-card.jpg", `${BRO} p.6`, "Logo on white"),
  reraQr: i("assets/logos/qr-rera.png", `${BRO} p.19`, "QR printed next to MahaRERA no."),
  developerStrip: i("assets/logos/developer-strip.jpg", `${BRO} p.19`),

  // ---- missing: drop the file in and set the path; scenes fall back meanwhile ----
  model3d: null as MediaAsset | null, // e.g. v("assets/3d/hornbill-model.mp4", "3D model render")
  townshipModel3d: null as MediaAsset | null,
  music: null as string | null, // e.g. "assets/audio/music.mp3"
} satisfies Record<string, MediaAsset | string | null>;

export type AssetRole = keyof typeof assets;
