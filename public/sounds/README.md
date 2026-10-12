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
  the background (`import.meta.env.BASE_URL + 'sounds/' + file`, so it works on GitHub Pages under
  `/stories_of_kane/` too).
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
