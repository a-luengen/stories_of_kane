# Sound samples

The game sounds complete **without any files here**: every sound has a synthesized recipe
(`src/data/sounds.ts`). Recorded samples are optional and replace the synthesized version of a
sound automatically once they load.

## How it works

- `src/data/soundManifest.ts` maps a **sound id** to 2–4 **variant files** in this folder, e.g.

  ```ts
  'gun.revolver': ['weapons/revolver_1.ogg', 'weapons/revolver_2.ogg', 'weapons/revolver_3.ogg'],
  ```

- After the player's first click / key press the game fetches and decodes every listed file in
  the background (`import.meta.env.BASE_URL + 'sounds/' + file`, so it works wherever the game is
  served from).
- Each play picks a random loaded variant (never the same one twice in a row) and adds a little
  pitch / volume variation.
- Until a sound's files have loaded — or if none of them can be fetched or decoded — its
  synthesized recipe plays instead, and the console shows **one** warning for that sound.

## Formats

- **`.ogg` (Vorbis)**, mono, 44.1 or 48 kHz, is the default. Safari can't decode Ogg: if Safari
  matters, list an `.mp3` copy as well (a variant that fails to decode is simply skipped).
- `.mp3` and `.wav` work everywhere; keep `.wav` for very short sounds only (file size).
- Trim silence at the start (gunshots and footsteps must start on the transient) and normalise
  to about −1 dBFS peak. Keep files mono: panning and distance are applied by the game.
- Suggested length: gunshots 0.5–1.5 s (the game adds the distant echo itself), impacts and
  footsteps 0.1–0.4 s.

## Sounds waiting for recordings

Every id in `soundManifest.ts` with an empty list plays its synthesized recipe. Suggested file
names are in the comment next to each id. For the animals:

| Sound id | Suggested files | What it is |
|---|---|---|
| `cow.moo` | `animals/cow_moo_1.ogg` … `_3` | A cow mooing, 1–2 s |
| `pig.oink` | `animals/pig_oink_1.ogg` … `_3` | A few grunts / oinks, under 1 s |
| `chicken.cluck` | `animals/chicken_cluck_1.ogg` … `_3` | Clucking, under 1 s |
| `dog.bark` | `animals/dog_bark_1.ogg` … `_3` | One or two barks, under 1 s |
| `cat.meow` | `animals/cat_meow_1.ogg` … `_3` | A meow, under 1 s |
| `cat.purr` | `animals/cat_purr_1.ogg` | Purring, about 2 s (as long as the petting) |
| `bison.grunt` | `animals/bison_grunt_1.ogg`, `_2` | A deep grunt, under 1 s |
| `bison.stampede` | `animals/stampede_1.ogg` | A herd galloping past, 3–4 s |
| `bear.growl` | `animals/bear_growl_1.ogg`, `_2` | A low growl, about 1 s |
| `bear.roar` | `animals/bear_roar_1.ogg`, `_2` | A grizzly's roar, 1–2 s (its warning) |
| `bear.swipe` | `animals/bear_swipe_1.ogg` | A paw swipe and the blow |
| `wolf.growl` | `animals/wolf_growl_1.ogg`, `_2` | A snarl, about 1 s |
| `wolf.bite` | `animals/wolf_bite_1.ogg`, `_2` | Jaws snapping |
| `wolf.howl` | `animals/wolf_howl_1.ogg`, `_2` | A howl, 2–3 s |
| `wolf.yelp` | `animals/wolf_yelp_1.ogg`, `_2` | A hurt yelp (wolves use it instead of `animal.hit`) |
| `snake.rattle` | `animals/snake_rattle_1.ogg` | The rattle, about 1 s (repeats while it warns) |
| `snake.hiss` | `animals/snake_hiss_1.ogg` | A hiss |
| `snake.strike` | `animals/snake_strike_1.ogg` | A strike |
| `animal.hit` | `animals/hit_1.ogg`, `animals/hit_2.ogg` | A pained squeal; the game pitches it down for cows, up for chickens |
| `animal.death` | `animals/death_1.ogg`, `animals/death_2.ogg` | A dying bawl and a thud; pitched per species too |

Pick recordings of a mid-sized animal (a pig or a calf) for `animal.hit` and `animal.death`, since
they get pitched up and down from there.

## Adding a sample to an existing sound

1. Put the file(s) in a subfolder here, e.g. `public/sounds/weapons/revolver_1.ogg`.
2. List them under the sound's id in `src/data/soundManifest.ts`.
3. Add a line per file to `CREDITS.md` (source, author, license).
4. Reload. Press **F4** in game: the voice list shows `sample <file>` instead of `synth`.

## Adding a new sound

1. Add a **recipe** to `RECIPES` in `src/data/sounds.ts` (tone and noise layers with an
   envelope and an optional filter). This is what plays without samples.
2. Add a **definition** to `SOUNDS` with the same file: its `bus` (`effects`, `voices`,
   `ambience`, `ui`), `volume`, variation (`pitchVar`, `volVar`), limits (`maxConcurrent`,
   `cooldown`) and, for world sounds, how far it carries (`ref`, `maxDistance`).
3. Optionally list sample files for it in `soundManifest.ts` (see above).
4. Trigger it from the system that owns the event (e.g. the session's sound layer), with
   `audio.play('my.sound', { pos })` for positioned sounds.

## Licensing

Only **CC0** or royalty-free files whose license allows redistribution in an open repository.
Every file must be listed in `CREDITS.md`.
