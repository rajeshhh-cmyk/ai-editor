# Hornbill Heights — 9:16 performance ad (Remotion)

A 1080×1920 / 30 fps / ~68 s Instagram Reels / Shorts ad for **Hornbill Heights, Magarpatta Riverview City**.
It is cut to the supplied Hindi voiceover. The brochure is the brand source of truth (royal blue + gold); the
reference ad supplies only the editing language: fast kinetic type, oversized gold numbers, glass cards, whips and zoom cuts.

```
npm install
npm run dev                      # Remotion Studio
npm run render                   # → out/hornbill-heights.mp4
node scripts/preview-stills.mjs "$PWD" out/stills 3.2 12.6 43.9   # quick stills at given seconds
```

In a container with a pre-installed Chromium, set `REMOTION_BROWSER=/path/to/headless_shell`.

## Story

HOOK → 3D BUILDING → LOCATION → TOWNSHIP → COMPLETE CITY → WALKTHROUGH (2 / 2.5 BHK + floor plans)
→ HOME OFFICE → PRICE → ALL-INCLUSIVE / LIFETIME MAINTENANCE (brochure proof) → PHASE I SOLD OUT → PHASE II CTA END CARD

## Structure

```
src/
  Root.tsx                       composition (duration derived from data)
  compositions/HornbillHeights.tsx   scene order, whip overlays, VO track
  data/hornbill.ts               property facts, on-screen copy, VO cues, scene windows
  data/assets.ts                 asset manifest (roles → files; missing roles = null)
  scenes/                        Hook, BuildingReveal, Location, Township, CompleteCity,
                                 Walkthrough, HomeOffice, PriceReveal, AllInclusive, PhaseOne, EndCard
  components/                    KineticText, NumberReveal, PriceCard, GlassCard, ImageParallax, Media,
                                 MapRoute, AmenityIcon, BuildingReveal, BrochurePage, CTAButton, EndCard,
                                 LegalStrip, GradientOverlay, Particles, SceneShell,
                                 WhipTransition, ZoomCut, BlurWipe, VerticalSwipe
  lib/                           theme (colours, fonts, safe areas), anim helpers, scene timing hook
```

## Making Version B / C

* **New copy or facts:** edit `copy` / `property` in `src/data/hornbill.ts`. Words in `[brackets]` render gold.
* **New voiceover:** replace `public/assets/audio/vo.mp3`, then update `cues` (absolute seconds) and the
  `scenes` windows. Every animation inside a scene is keyed to those cues, and total duration follows the last scene.
* **New assets:** see [ASSETS.md](ASSETS.md). Set `assets.model3d` to a rendered 3D building video and the reveal uses it.
* A whole new variant can be a second object of type `AdData` passed as `defaultProps` to another `<Composition>`.

Safe areas: key information stays between y = 269 and y = 1651 (top and bottom 14% kept clear).
