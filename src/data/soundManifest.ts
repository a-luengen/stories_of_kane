/**
 * Recorded samples: sound id → 2–4 variant files under `public/sounds/` (paths relative to that
 * folder). One variant is picked at random per play. A sound listed here still needs an entry in
 * SOUNDS (data/sounds.ts): its recipe is played whenever no variant has loaded — a missing or
 * undecodable file just falls back (with one warning), so the folder may be empty.
 *
 * Adding a sample: drop the file(s) into public/sounds/ and list them here (see
 * public/sounds/README.md). Prefer .ogg, with an .mp3 variant if Safari matters.
 */
export const SAMPLES: Record<string, string[]> = {
  // Empty lists play the synthesized recipe. Suggested names once you have recordings:
  'gun.revolver': [], // 'weapons/revolver_1.ogg', 'weapons/revolver_2.ogg', 'weapons/revolver_3.ogg'
  'gun.rifle': [], // 'weapons/rifle_1.ogg', 'weapons/rifle_2.ogg'
  'gun.shotgun': [], // 'weapons/shotgun_1.ogg', 'weapons/shotgun_2.ogg'
  'gun.derringer': [], // 'weapons/derringer_1.ogg', 'weapons/derringer_2.ogg'
  'impact.dirt': [], // 'impacts/dirt_1.ogg' … 'impacts/dirt_3.ogg'
  'impact.wood': [], // 'impacts/wood_1.ogg' … 'impacts/wood_3.ogg'
  'impact.rock': [], // 'impacts/rock_1.ogg' … 'impacts/rock_3.ogg'
  'impact.metal': [], // 'impacts/metal_1.ogg', 'impacts/metal_2.ogg'
  'impact.cactus': [], // 'impacts/cactus_1.ogg', 'impacts/cactus_2.ogg'
  'impact.flesh': [], // 'impacts/flesh_1.ogg' … 'impacts/flesh_3.ogg'
  'step.dirt': [], // 'steps/dirt_1.ogg' … 'steps/dirt_4.ogg'
  'step.wood': [], // 'steps/wood_1.ogg' … 'steps/wood_4.ogg'
  'hoof.dirt': [], // 'horses/hoof_1.ogg' … 'horses/hoof_4.ogg'
};
