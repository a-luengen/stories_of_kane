# Cowboy Iso Prototype

Isometric 2.5D pixel-art cowboy prototype: Vite + TypeScript + Three.js, all visuals procedural.

```
npm install
npm run dev        # http://localhost:5173  (?mode=sandbox | ?mode=wave skips the menu, &wave=N starts at wave N)
npm test           # horse, weapons, nav grid, NPCs, inventory, waves, economy, revive, map tests (vitest)
npm run build      # typecheck + production build
```

## Controls

| Key | Action |
| --- | --- |
| WASD | Move (screen-relative) / steer horse |
| Mouse | Aim · Left click (hold) shoot (draws the revolver first if holstered) |
| R | Reload (from ammo in your inventory) · rotate a held item in the inventory |
| 1 / 2 / 3 | Select weapon slot (again: holster) |
| I | Inventory (pauses the game) · Esc / I closes |
| B | Use a bandage (also right-click it in the inventory) |
| Esc | Pause menu (closes an open inventory / loot / shop screen first) |
| Enter | Wave mode: skip the break between waves |
| H | Holster the revolver (also happens after 30 s without shooting, and on death) |
| E | Use what you're aiming at: talk, trade, loot a corpse, pick up an item, mount a horse · always dismounts when riding |
| Shift | Sprint on foot / gallop on horse |
| P | Toggle pixelation (debug) |
| O / L | Toggle palette quantization / outlines |
| F3 | Debug overlay (horse heading, input, turn radius, speed, FPS, NPC states) |

## Layout

- `src/config.ts` – every tunable (game title, render, camera, player, items, wave mode, projectiles, npc, horse, targets)
- `src/core/` – `Engine` (renderer, input, pixel pass, HUD canvas, loop: lives for the whole app), `GameStateManager` (main menu → playing ⇄ paused → game over), `Session` (one playthrough: scene, player, horses, NPCs, items; disposed completely on exit), `dispose`
- `src/modes/` – `GameMode` interface, `SandboxMode`, `WaveMode`, `WaveDirector` (wave table / formula, spawning, intermission), `Economy`, `Revive`, `Merchant`, `records` (best wave)
- `src/ai/` – `NavGrid` (walkability grid + A*), `MountedAI` (riders circling the player; route driver for horses)
- `src/data/` – game data: `waves.ts`, `enemies.ts`, `economy.ts`, `shop.ts` (wave mode), `weapons.ts` (`WeaponDef`s shared by player and NPCs), `items.ts` (`ItemDef`s), `clothing.ts` (`ClothingRegistry`), `npcs.ts` (NPC definitions, default lines, name pools), `player.ts` (starting look and kit), `types.ts` (their shapes)
- `src/items/` – inventory logic, no rendering: `GridContainer`, `Equipment` (weapon + clothing slots), `transfer` (drag/drop, split, swap, pickup, take all), `ItemInstance`, `ItemDef` lookups; plus `IconRenderer` / `itemMeshes` (procedural item meshes → pixel icons)
- `src/render/CharacterRig.ts` – shared player/NPC skeleton; builds body + clothing from an `AppearanceConfig` and rebuilds in place
- `src/CameraRig.ts` – true iso ortho camera, pixel-grid snapping + sub-pixel upscale offset, shake
- `src/PixelPass.ts` – low-res colour / normal+depth targets → outlines, palette, integer upscale
- `src/entities/` – `Player`, `PlayerModel`, `Horse`, `HorseModel`, `HorseMotor` (pure movement model), `Weapon` (ammo / reload / scatter / falloff), `WeaponModel`, `Npc` (AI state machine), `NpcModel`, `NpcSystem` (provocation, witnesses, near misses), `Projectiles`, `Targets`, `Particles`, `MuzzleFlash`
- `src/Interaction.ts` – `Interactable` interface + aim-based target picking for E
- `src/world/` – `props` (shared ground / building / prop builders), `maps/sandbox`, `maps/waveOutpost`, `maps/menuDesert`, `Colliders` (circle/AABB, grid broadphase, swept 3D segment tests), `WorldItem`, `Tumbleweed`
- `src/ui/` – `Hud` + `WeaponBar` + `WaveHud` (drawn at low-res on the same pixel grid), `MainMenu`, `PauseMenu`, `GameOverScreen`, `menuWidgets`, `InventoryUI` (controller), `InventoryPanel` / `LootPanel` / `ShopPanel` (layouts), `CharacterPreview`, `widgets`, `DebugOverlay`, `PixelFont`
- `src/world/WorldItem.ts` – items dropped on the ground

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

## Items & inventory

- **Inventory (I)** pauses the whole game. Drag items between the 8×4 grid, the three weapon slots and the clothing slots around the character preview. R rotates the held item, Shift-drag splits a stack, dropping onto the same ammo merges, dropping onto one other item swaps (if it fits), invalid spots show red and snap back. Drag anything outside the panel to drop it on the ground.
- **Weapons** keep their loaded rounds on the item. Reload pulls from matching ammo stacks (smallest first); with none left the HUD says NO AMMO. NPCs reload from their own pockets and run once they're dry.
- **Looting:** E on a corpse opens a split view (paused). Drag across or press TAKE ALL. Corpses vanish when the NPC respawns (45 s), with anything left on them.
- **Adding an item:** add an entry to `ITEMS` in `src/data/items.ts`. Ammo stack limits live in `CONFIG.items.ammoMaxStack`. A weapon item points at a `WeaponDef` in `src/data/weapons.ts`. Clothing items are generated from `ClothingRegistry` (`src/data/clothing.ts`), so a new piece of clothing is one registry entry (any `kind` + colours). The icon and the ground mesh are generated from the item's procedural mesh.

## Game modes

The game opens on a title screen (live desert backdrop). **Sandbox** is the frontier town. It has two merchants: a gunsmith leaning on a porch post (guns, ammo, bandages) and a tailor by the big west building (clothes only). You start with $150 (`CONFIG.sandbox.startingDollars`) and earn more by selling to them; each buys only what they sell. Shops are data: `MERCHANT_SHOPS` in `data/shop.ts`, and any NPC with `shop: '<id>'` trades instead of talking. **Story** isn't available yet.

**Wave** takes place in an abandoned outpost ringed by canyon walls:

- **Waves:** outlaws (gunslingers, riflemen, shotgunners) come in through the passes in waves set by `data/waves.ts` (a formula takes over after the table). Each wave starts with a 5 s countdown, and the break after a wave lasts 25 s (Enter skips it).
- **Merchant:** between waves, trade with the merchant at the covered wagon. Earn dollars per kill and per cleared wave, buy guns, ammo, bandages and clothes, and sell anything for half its price.
- **Horses:** a horse arrives after wave 3. Mounted outlaws appear from wave 5; shoot the rider and the horse is yours to take for about 10 s before it bolts.
- **Healing and death:** bandages (B) are the only way to heal. One revive per run (the star by the health bar); the second death ends the run. The best wave reached is saved and shown on the menu.
