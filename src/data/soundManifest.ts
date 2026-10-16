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
  'gun.magnum': [], // 'weapons/magnum_1.ogg', 'weapons/magnum_2.ogg'
  'gun.sawed_off': [], // 'weapons/sawed_off_1.ogg', 'weapons/sawed_off_2.ogg'
  'impact.dirt': [], // 'impacts/dirt_1.ogg' … 'impacts/dirt_3.ogg'
  'impact.wood': [], // 'impacts/wood_1.ogg' … 'impacts/wood_3.ogg'
  'impact.rock': [], // 'impacts/rock_1.ogg' … 'impacts/rock_3.ogg'
  'impact.metal': [], // 'impacts/metal_1.ogg', 'impacts/metal_2.ogg'
  'impact.cactus': [], // 'impacts/cactus_1.ogg', 'impacts/cactus_2.ogg'
  'impact.flesh': [], // 'impacts/flesh_1.ogg' … 'impacts/flesh_3.ogg'
  'step.dirt': [], // 'steps/dirt_1.ogg' … 'steps/dirt_4.ogg'
  'step.wood': [], // 'steps/wood_1.ogg' … 'steps/wood_4.ogg'
  'hoof.dirt': [], // 'horses/hoof_1.ogg' … 'horses/hoof_4.ogg'
  'cow.moo': [], // 'animals/cow_moo_1.ogg' … 'animals/cow_moo_3.ogg'
  'pig.oink': [], // 'animals/pig_oink_1.ogg' … 'animals/pig_oink_3.ogg'
  'chicken.cluck': [], // 'animals/chicken_cluck_1.ogg' … 'animals/chicken_cluck_3.ogg'
  'dog.bark': [], // 'animals/dog_bark_1.ogg' … 'animals/dog_bark_3.ogg'
  'cat.meow': [], // 'animals/cat_meow_1.ogg' … 'animals/cat_meow_3.ogg'
  'cat.purr': [], // 'animals/cat_purr_1.ogg' (about 2 s)
  'bison.grunt': [], // 'animals/bison_grunt_1.ogg', 'animals/bison_grunt_2.ogg'
  'bison.stampede': [], // 'animals/stampede_1.ogg' (3–4 s)
  'bear.growl': [], // 'animals/bear_growl_1.ogg', 'animals/bear_growl_2.ogg'
  'bear.roar': [], // 'animals/bear_roar_1.ogg', 'animals/bear_roar_2.ogg'
  'bear.swipe': [], // 'animals/bear_swipe_1.ogg'
  'wolf.growl': [], // 'animals/wolf_growl_1.ogg', 'animals/wolf_growl_2.ogg'
  'wolf.bite': [], // 'animals/wolf_bite_1.ogg', 'animals/wolf_bite_2.ogg'
  'wolf.howl': [], // 'animals/wolf_howl_1.ogg', 'animals/wolf_howl_2.ogg'
  'wolf.yelp': [], // 'animals/wolf_yelp_1.ogg', 'animals/wolf_yelp_2.ogg'
  'snake.rattle': [], // 'animals/snake_rattle_1.ogg' (about 1 s)
  'snake.hiss': [], // 'animals/snake_hiss_1.ogg'
  'snake.strike': [], // 'animals/snake_strike_1.ogg'
  'animal.hit': [], // 'animals/hit_1.ogg', 'animals/hit_2.ogg' (played pitched per species)
  'animal.death': [], // 'animals/death_1.ogg', 'animals/death_2.ogg' (played pitched per species)
};
