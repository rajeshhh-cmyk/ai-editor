# Hornbill Heights ad — asset manifest

Scenes ask for a **role** (e.g. `assets.droneAerial`), never a file path. Roles are defined in
`src/data/assets.ts`. To swap or add an asset, drop the file into `public/assets/...` and edit that one line.

## Supplied inputs and how they were used

| Input | What it is | Used? |
|---|---|---|
| `WhatsApp_Audio_…12.14.26.mpeg` (66.4 s) | Hindi voiceover | **Yes**, as the timing authority → `public/assets/audio/vo.mp3` |
| `WhatsApp_Video_…12.14.44.mp4` (848×480, 122 s) | Hornbill Heights walkthrough: brochure animation, drone, sample flat, end card | **Yes**, cut into 10 clips (below) |
| `WhatsApp_Video_…12.14.44ghj.mp4` (1280×720, 108 s) | **Flamingo Park** sample-flat walkthrough (a different Riverview City project) | **No.** Showing another project's interiors as Hornbill would misrepresent the property. It is also not the ~84 s vertical reference ad. |
| `Hornbill_Heights_e-Brochure.pdf` (19 pp.) | Brand source of truth | **Yes**, rendered at 200 dpi and cropped (below) |

## Footage (from the Hornbill walkthrough, centre-cropped to 9:16, lanczos-upscaled)

The source is 848×480, so a 9:16 crop is only 270 px wide before upscaling. It reads fine on a phone
under the overlays, but it is soft. **Native 4K or vertical footage is the biggest quality upgrade available.**
The crop also drops the burnt-in room labels and the corner logo.

| Role | File | Source timecode |
|---|---|---|
| droneAerial | footage/drone-aerial.mp4 | 0:36.2–0:42.8 |
| towersLowAngle | footage/towers-lowangle.mp4 | 0:43–0:46 |
| living | footage/living.mp4 | 0:47–0:52.8 |
| kitchen | footage/kitchen.mp4 | 0:53–0:55.8 (spare) |
| bedroom | footage/bedroom.mp4 | 0:59–1:04 |
| masterBedroom | footage/master-bedroom.mp4 | 1:09–1:17 |
| livingBalcony | footage/living-balcony.mp4 | 1:21–1:23 (spare) |
| balcony | footage/balcony.mp4 | 1:23.2–1:29.7 |
| hall | footage/hall.mp4 | 1:31–1:34.8 |
| droneClose | footage/drone-close.mp4 | 1:51–1:53.6 |

## Brochure crops

| Role | Page | Used in |
|---|---|---|
| towerFull | p.8 render | Hook background, 3D-reveal fallback |
| towerGate | p.7 render with entrance gate | "A complete city inside one gate" |
| towerPair | p.13 render | End card background |
| magarpattaCity / nandedCity | p.3 / p.4 photos | Hook city cards |
| plan2Bhk / plan25Bhk | p.15 / p.14 | Space beats (floor-plan proof) |
| amenitiesPodium, openGym, podium | p.11, p.12 | Lifetime-maintenance proof flips |
| masterPlan | p.18 | "Monthly maintenance hassle" backdrop |
| logoCard | p.6 | Logo moment, end card |
| reraQr, developerStrip | p.19 | Price and end-card legal strip |
| cover, legacy, family, amenitiesTownship, locationMap | various | Cropped and available, currently unused |

## Missing (scene architecture already supports them)

| Role | Expected | Current fallback |
|---|---|---|
| `model3d` | Pre-rendered 3D building video (mp4 / ProRes / PNG-sequence video) | Brochure render p.8 run through the same `BuildingReveal` push-in |
| `townshipModel3d` | Township model fly-over | Blue-tinted low-angle tower footage behind the amenity ring |
| `music` | Licensed music bed | None; VO only. Set `assets.music` to a path and it mixes in at `audio.musicVolume` |
| Sound effects | Whooshes, impacts | None |
| Native vertical / 4K footage | Drone + sample flat | Upscaled 848×480 crops |

## Facts on screen and where they come from

| Claim | Source |
|---|---|
| Magarpatta City, Nanded City, third township, budget, 500 acre integrated, highway touch, school / hospital / IT offices / mall / bank / police / fire station, complete city inside one gate, extra half room = home office, all inclusive, one-time lifetime maintenance, Phase I sold out, Phase II, Get Quote / free site visit | Voiceover |
| 2 BHK 900 sq ft* / 2.5 BHK 1,100 sq ft* | VO; footnotes show the exact brochure total carpet incl. balcony: 898.26 / 1,096.96 sq ft |
| ₹81.15 L* / ₹1.02 Cr* (onwards) | VO + brief |
| 20+ amenities, 2 & 2.5 BHK | Brochure p.6 |
| MahaRERA P52100053795 | Brochure p.19 + brief |
| RERA possession Dec 2027 | Brief (not in the brochure; please confirm) |
| Pune → Magarpatta → Riverview City along Pune–Solapur road | Brochure location map p.19 (drawn as a schematic, not to scale) |

## Voiceover cue sheet

Word-aligned with Whisper (small). Edit `cues` in `src/data/hornbill.ts` to re-time for a new VO.

| t (s) | Line |
|---|---|
| 0.24 | Magarpatta City देखी, Nanded City देखी। |
| 3.58 | अब Magarpatta Group की तीसरी township, आपके budget में। |
| 7.56 | ये है Magarpatta Riverview City। |
| 9.98 | Pune–Solapur highway पर Manali Resort के पास। |
| 13.36 | 500 acre की integrated township, highway touch। |
| 17.18 | School, hospital, IT offices, mall, bank और police, fire station भी, सब township के अंदर। |
| 24.10 | एक पूरा शहर, एक गेट के अंदर। |
| 26.80 | यहाँ के Hornbill Heights में 2BHK के 900 sq ft carpet और 2.5BHK के 1100 sq ft। |
| 34.00 | इस budget में इतना carpet बहुत कम मिलता है। |
| 37.34 | Extra half room, मतलब आपका home office। |
| 40.46 | Price? 2BHK 81.15 lakh से, 2.5BHK 1.02 crore से। |
| 47.88 | All inclusive, one-time lifetime maintenance के साथ। |
| 51.36 | मतलब हर महीने maintenance भरने का झंझट ही ख़त्म। |
| 54.92 | Phase 1 के towers already sold out हो चुके हैं। |
| 58.60 | Phase 2 में घर अभी पक्का कीजिए। |
| 61.12 | नीचे Get Quote पर click करिए, form भरिए और अपनी free site visit schedule कीजिए। |
