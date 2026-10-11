# Cowboy Iso Prototype

Isometric 2.5D pixel-art cowboy prototype: Vite + TypeScript + Three.js, all visuals procedural.

```
npm install
npm run dev        # http://localhost:5173
npm test           # horse movement, weapons, nav grid, interaction and NPC behaviour tests (vitest)
npm run build      # typecheck + production build
```

## Controls

| Key | Action |
| --- | --- |
| WASD | Move (screen-relative) / steer horse |
| Mouse | Aim · Left click (hold) shoot (draws the revolver first if holstered) |
| R | Reload |
| H | Holster the revolver (also happens after 30 s without shooting, and on death) |
| E | Use what you're aiming at: talk to an NPC, mount the horse · always dismounts when riding |
| Shift | Sprint on foot / gallop on horse |
| P | Toggle pixelation (debug) |
| O / L | Toggle palette quantization / outlines |
| F3 | Debug overlay (horse heading, input, turn radius, speed, FPS, NPC states) |

## Layout

- `src/config.ts` – every tunable (render, camera, player, projectiles, npc, horse, targets)
- `src/data/` – game data: `weapons.ts` (`WeaponDef`s shared by player and NPCs), `npcs.ts` (NPC definitions, default lines, name pools), `types.ts` (their shapes)
- `src/Game.ts` – fixed 60 Hz simulation + interpolated rendering, wiring, occlusion fade
- `src/CameraRig.ts` – true iso ortho camera, pixel-grid snapping + sub-pixel upscale offset, shake
- `src/PixelPass.ts` – low-res colour / normal+depth targets → outlines, palette, integer upscale
- `src/entities/` – `Player`, `PlayerModel`, `Horse`, `HorseModel`, `HorseMotor` (pure movement model), `Weapon` (ammo / reload / scatter / falloff), `WeaponModel`, `Npc` (AI state machine), `NpcModel`, `NpcSystem` (provocation, witnesses, near misses), `Projectiles`, `Targets`, `Particles`, `MuzzleFlash`
- `src/Interaction.ts` – `Interactable` interface + aim-based target picking for E
- `src/world/` – `World` (map generation), `Colliders` (circle/AABB, grid broadphase, swept 3D segment tests), `NavGrid` (walkability grid + A* for NPCs)
- `src/ui/` – `Hud` (drawn at low-res on the same pixel grid), `DebugOverlay`, `PixelFont`

## Notes

- The low-res size is `window / k`, where `k` is the largest integer factor that fits 320×180. World units per pixel stay constant, so a larger window shows more world but pixels never get non-integer scaling.
- The cursor ray is cast into the world (targets, NPCs, buildings, props, ground); shots fly at that point plus a scatter that grows faster than linearly with distance.
- Shadows use hard compare (`BasicShadowMap`). Three's PCF jitters its samples with screen-space noise, and that makes shadow edges crawl under a pixel-snapped camera.
- Buildings between the camera and the player are dithered out (4×4 Bayer) and left out of the outline pass.

## NPCs

NPCs are defined in `src/data/npcs.ts`. Adding one is a data change only: give it an `outfit` (body, hair, shirt / vest / duster / dress, chaps, bandana, hat), a `weapon` (an id from `WEAPONS` or a full inline `WeaponDef`), `holster`, a `spawn` and a `routine` (`lean`, `idle`, `wander` or `patrol`). Leave out `name` for a random one.

- NPCs never start hostile. Being hit by the player, or (for `defendsOthers`) seeing the player hit someone within 12 units, provokes them. Armed NPCs draw, aim briefly (a red **!** shows) and fight at their weapon's preferred range; unarmed ones run, then hide by a building.
- Player bullets landing within 3 units make an NPC flinch and warn you, without turning hostile.
- They calm down once you've been out of range or out of sight for 60 s. After you die and respawn, everyone calms down at once. Dead NPCs respawn at home after 45 s.
- The debug overlay (F3) lists each NPC's state and calm timer.
