# Cowboy Iso Prototype

Isometric 2.5D pixel-art cowboy prototype: Vite + TypeScript + Three.js, all visuals procedural.

```
npm install
npm run dev        # http://localhost:5173  (?mode=sandbox | ?mode=wave skips the menu, &wave=N starts at wave N)
npm test           # horse, weapons, nav grid, NPCs, inventory, waves, economy, revive, map tests (vitest)
npm run build      # typecheck + production build
npm run preview    # serve the build at http://localhost:4173/stories_of_kane/ (as on GitHub Pages)
```

Live at **https://a-luengen.github.io/stories_of_kane/**. Every push to `main` runs the tests, builds and
deploys there (`.github/workflows/deploy.yml`). One-time setup: repo Settings → Pages → Source:
**GitHub Actions**. The build's base path (`/stories_of_kane/`) is set in `vite.config.ts`.

## Controls

| Key | Action |
| --- | --- |
| WASD | Move (screen-relative) / steer horse |
| Mouse | Aim · Left click (hold) shoot (draws the revolver first if holstered) |
| R | Reload (from ammo in your inventory) · rotate a held item in the inventory |
| 1 / 2 / 3 | Select weapon slot (again: holster) |
| I | Inventory (pauses the game) · Esc / I closes · Tab / Q: the QUESTS tab (journal) |
| G | Use a bandage (also right-click it in the inventory) |
| B | Cover debug view: prop cover heights (green low / yellow medium / orange tall), hitboxes, bullet heights |
| Esc | Pause menu (closes an open inventory / loot / shop screen first) |
| Enter | Wave mode: skip the break between waves |
| H | Holster the revolver (also happens after 30 s without shooting, and on death) |
| E | Use what you're aiming at: talk, trade, loot a corpse, pick up an item, mount a horse · always dismounts when riding |
| C | Crouch / stand (on foot): half speed, steadier aim, smaller target · Shift stands you up into a sprint |
| Shift | Sprint on foot / gallop on horse |
| P | Toggle pixelation (debug) |
| O / L | Toggle palette quantization / outlines |
| 8 | Debug overlay (horse heading, input, turn radius, speed, FPS, NPC states) |
| M | World map (sandbox; pauses like the inventory). Mute is in the pause menu's sound settings |
| 9 | Sound debug: playing voices (bus, sample or synth, volume, distance) and rings at their sources |
| 0 | World debug (sandbox and story): reveal all places and trails, reset discovery, show exit zones, teleport to any place's exit |
| 7 | Quest debug (sandbox and story): current POI, loaded packs, each quest's state, step and counter, buttons to start / advance / fail / reset it, reset the quest save, validation errors |

## Quests

Quests are content, not code: the game bundle holds only the quest engine (`src/quests/`), and every quest lives in `public/quests/`.

- **Catalog** `public/quests/index.json`: id, title, giver (`<poi>:<npc>`), modes (`story` / `sandbox`), requirements (e.g. another quest completed), `storyStart`, pack version. Fetched when a playthrough starts and filtered to its mode; nothing else is fetched then. Wave mode has no quests.
- **Packs** `public/quests/<id>/quest.json` (plus optional `icons/*.png`): title, description, steps, rewards, fail conditions, items, NPCs, dialogs; all English text, right in the pack. Fetched only when needed — within 15 units of a giver on the giver's POI, when the quest starts, when a save with it active loads, and ahead of travel to a POI with its givers — then cached. A failed fetch shows a message and is tried again on the next trigger. Every pack is validated (`src/quests/validate.ts`, `formatVersion` 1); errors name the quest and the field, and every POI must exist in the mode's world.
- **Hooks** (optional) `src/quests/<id>/hooks.ts`: default-exports `(api: QuestApi) => QuestHooks`. Vite makes one chunk per quest, imported only with its pack. Hooks get a narrow API (state, flags, advance / fail, items, money, NPCs, dialogs, messages, events, POI, reveals), never engine internals.
- **World references** are global `<poiId>:<id>` (NPCs, containers, named areas): the same id on two POIs is two different things. Containers can carry a stable id (`ContainerSet.add(…, id)`, e.g. `kanes-crossing:chest-porch`); maps can name areas (`WorldData.areas`).
- **Runtime** (`QuestRuntime`, owned by the `QuestSystem` the playthrough carries, so it survives every POI switch): several quests at once, one current step each, done in order. Step types `talk`, `deliver`, `goto` (an area, optionally carrying an item, or arriving at a POI), `defeat` (listed quest NPCs or N of a group, counted), `collect` (N in your bags, counted). Game events (npcKilled, talkedTo, itemAdded / itemRemoved, areaEntered, poiEntered / poiLeft, poiDiscovered, containerOpened, dialogAction) carry their POI and go to every active quest. Fail conditions: a key NPC dies, a quest item is lost, a timer runs out (timers run in play on any POI and during the ride, not when paused, on the world map or in a panel). Rewards: money and items (what doesn't fit drops at your feet). Step setup (spawns, placed items) is per POI and applied once — on entering that POI, never twice — and restored after a reload.
- **Dialogs** (in the pack, `dialogs`): trees of nodes (speaker, text, mood — the mood drives the NPC's murmur) and choices. Choices can have conditions (quest / step state, items, money, flags, current POI, discovery) and actions (start quest, advance, deliver, give / take items and money, set flag, spawn, open shop, reveal POI / trail, end); failing choices are hidden, or greyed out with `showLocked`. A dialog belongs to `<poi>:<npc>` and is offered while its `if` holds (an offer: `{ quest, status: available }`; a step's lines: `{ status: active, step }`). `{npc}` in a text is the NPC's name.
- **Talking (E)** to an NPC with a quest dialog opens the dialog panel instead of the greeting, hint or shop, and pauses the game: the line types out while the NPC murmurs it (E / Space / click finishes it), choices by click or **1–9**, **Esc** leaves. One quest topic opens straight on it; several, or a merchant, open on a topic list (each quest, Trade, Goodbye). NPCs without quest dialog behave as before; a hint comes back once the dialog is over.
- **Quest items** (pack `items`) are registered when the pack loads: a procedural look from a small library (letter, key, pouch, box, badge, bottle, map, photo, star, ring) in the pack's colours, or a PNG from the pack's `icons/` as the inventory icon. Quest items can't be sold or put in containers; dropping one asks first (it may fail the quest) and it stays on that POI. When the quest ends they're removed everywhere — bags, containers, bodies, the ground, also on POIs that aren't loaded — unless `keepAfterQuest`.
- **Quest NPCs** (pack `npcs`): `<poi>:<id>`, a spawn point, optional `group` (for `defeat`), an `archetype` (gunslinger, rifleman, shotgunner: weapon, skill and a bandit look) and any NpcDef fields on top. Hostile ones hold their spot (a territory) instead of hunting you; they never respawn, count for the travel refusal like any hostile, and are stored with their POI's state (alive or dead) when you leave.
- **Step setup** (`setup`): `spawn` an NPC, or `placeItem` in a named container, on a named area or on an NPC's body. Applied when the step becomes current if you're on that POI, otherwise when you get there; never twice. Placed items carry their setup key, so picking one up is remembered and, after a reload, nothing comes back that was already taken or killed (loot of a killed NPC lies where it stood).
- **Journal** (the inventory's QUESTS tab; click a tab or press **Tab / Q** to switch, the game stays paused): on the left your quests — active, then completed and failed (click a heading to fold it); on the right the selected one: title, who gave it and where, the description, the steps so far (done ones ticked, the current one with its progress, later ones hidden), what to do next (highlighted, naming the place when it's elsewhere — never one you haven't heard of), rewards, the fail conditions that apply (with a running timer), and an **Abandon** button (asks first; the quest's items and people go). Wave mode has no QUESTS tab.
- **Messages** queue one after another (also across POI switches): quest started, progress ("Bandits 2/3", "Reached The Ridge", "Delivered: …"), the next objective with its POI (never naming a place you haven't heard of), complete with rewards, failed with the reason.
- **Saved** per mode in localStorage (`sok.quests.sandbox` / `sok.quests.story`, versioned): statuses, steps, counters, flags, timers, quest items held, per-POI quest data.
- `tests/bundle.test.ts` builds the game and checks that no quest text is in the bundle.
- **Adding a quest** is a folder in `public/quests/<id>/` (`quest.json`, optional `icons/`) and an entry in `public/quests/index.json` — plus, if it needs a script, `src/quests/<id>/hooks.ts`. No engine changes. Steps can also be `talk` with `"dialog": "<id>"` (done through that dialog's `advance` choice, not by saying hello); conditions include `any` (one of several).

### Story mode

- **Main menu → Story:** a new story when there's no save; otherwise **Continue** or **New Game** (which asks first: it wipes the story's quests and map). `?mode=story` continues (or starts) from the URL. The pause menu's restart continues from the save.
- **The world** (`STORY_WORLD` in `src/data/world.ts`): Kane's Crossing (start) and **The Ridge** (`world/maps/theRidge.ts`), a rocky outcrop east of town with a bandit camp (tents, a campfire, crates, boulders for cover), a lookout, and named areas `camp`, `camp-entrance`, `lookout`. It starts undiscovered; the trail runs from the east end of the main street to the camp's edge.
- **A new story** starts with $60 (`CONFIG.story`) and the catalog's `storyStart` quest. Its quests are the catalog's `story` quests; the sandbox offers only its own (`sandbox`), wave mode none.
- **Saved** as you go: quests (`sok.quests.story`, with the POI and the exit you last arrived through) and discovery (`sok.world.story`). Continue puts you back there. Money, bags (other than quest items) and containers aren't saved yet.
- **The example quests:**
  - *The Lost Letter* (story start; also in the sandbox): ask the tailor (branching dialog), find her letter in the chest on the porch across the street, hand it to the gunsmith. $40.
  - *Bounty on the Ridge* (after the letter): the gunsmith's job reveals the Ridge; ride there, Doyle's gang turns up at the camp (Bandits 0/3), take the wanted poster (PNG icon) from his body, bring it back. Fails if the gunsmith dies or you lose the poster. $120.
  - *Errand Against the Clock* (after the letter): the tailor's medicine for her brother Eli at the Ridge's lookout, against a 150 s clock that keeps running through the ride. Its `hooks.ts` checks the time left at the lookout: Eli thanks you differently, and adds $20 if you were quick. $60.

## Sound

- `src/audio/AudioEngine.ts` (owned by `Engine`, lives for the whole app) runs one Web Audio graph: master ← ui, master ← world ← effects / voices / ambience. It starts on the first click or key press (browsers block audio before that).
- Every sound is defined in `src/data/sounds.ts`: bus, volume, variation, limits (24 voices, per-sound caps and cooldowns) and a synthesized **recipe**. Recorded samples are optional: list them in `src/data/soundManifest.ts` and drop the files in `public/sounds/` (see its README). Until a sample loads — or if it's missing — the recipe plays, so the game sounds complete with an empty folder.
- `src/audio/SessionAudio.ts` is a session's sound layer: the player is the listener (volume falls off with distance, sounds pan by their screen-side, far sounds get duller). Gunshots carry across the map; beyond 25 units they arrive late (sound travels at `CONFIG.audio.soundSpeed`), muffled and with an echo. Bullets passing within 1.5 units of your head whizz on the side they passed. Draw, holster and reload sounds come from the guns' state, so NPCs make them too. Footsteps come from the walk cycle (a sound each time a foot lands; louder running, soft crouching) on dirt or on the wooden porches (`WorldData.floors`); NPC steps are quieter. Horses play a hoofbeat per hoof (four even beats at a walk, a rolling gallop), snort when mounted and now and then while standing. NPCs never speak words: each speech bubble is **murmured** (`src/audio/murmur.ts`): a formant voice shaped by the line — a syllable per vowel group, pauses at punctuation, questions rising — in that NPC's own voice (pitch from body type, a per-NPC offset and vowel timbre, all from a seed) and in the line's mood (greet relaxed, warn loud and clipped, hostile low and harsh, flee high and fast, calm slow and soft). The bubble lasts as long as the murmur. Containers creak / scrape / unlatch open (and thump shut when wave mode restocks them); the inventory, loot and shop screens give feedback for lifting, setting down, rotating, equipping (clothes rustle, guns click), unloading, coins and a buzz when something doesn't fit. Wave mode has countdown ticks, a bell at the start and a sting when a wave is cleared.
- Volumes (master, effects, voices, ambience) and Mute are in the pause menu and remembered. Pausing or opening an inventory holds the world sounds; UI sounds keep playing.

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
- The debug overlay (8) lists each NPC's state and calm timer.

## Items & inventory

- **Inventory (I)** pauses the whole game. Drag items between the 8×4 grid, the three weapon slots and the clothing slots around the character preview. R rotates the held item, Shift-drag splits a stack, dropping onto the same ammo merges, dropping onto one other item swaps (if it fits), invalid spots show red and snap back. Drag anything outside the panel to drop it on the ground.
- **Weapons** keep their loaded rounds on the item. Right-click a gun (grid, weapon slot or loot view) to unload it: the rounds top up matching ammo stacks, then fill free cells; what doesn't fit stays loaded. Reload pulls from matching ammo stacks (smallest first); with none left the HUD says NO AMMO. NPCs reload from their own pockets and run once they're dry.
- **Dual wielding:** a weapon slot holding a revolver or derringer shows a small **L** sub-slot; drop a second one in (or double-click it while that slot is selected). Both count as one slot: shots alternate right → left at the slower gun's interval × 0.6, each gun keeps its own magazine (HUD: `L 4/6 | R 2/6 | 37`), an empty gun lets the other fire at its own rate, and R reloads both in 1.5× the longer reload (`CONFIG.weapons`). Works standing, crouched and mounted; holstered, the second gun is tucked in the belt. From wave 6 (`CONFIG.wave.dualWieldFromWave`) some gunslingers carry two guns (`WaveSpec.dual`); NPC data takes `offHandWeapon`.
- **Double-click:** in the inventory, equips a gun (first free weapon slot) or clothing (what it replaces goes to the grid), and unequips a worn or slotted item. In the loot view it moves an item to the other side (stacks merge first). In a shop it buys; selling still takes a drag. When something doesn't fit, the grid flashes red ("No space").
- **Looting:** E on a corpse or container opens a split view (paused). Drag across, double-click, or TAKE ALL / R (R still rotates while dragging). A dying NPC drops their gun (a dual wielder both, separately, still loaded) on the ground beside the body; the pockets stay on the corpse. Corpses vanish when the NPC respawns (45 s), with anything left on them and their guns if nobody picked them up.
- **Containers:** barrels, crates, chests, ammo boxes (ammo only) and weapon crates (guns only) roll their loot from `src/data/lootTables.ts` when first opened. Crates and ammo boxes break after 4 revolver hits (`CONFIG.containers`); one nobody opened scatters half its loot. In wave mode every container shuts, is rebuilt and restocks after each wave.
- **Adding an item:** add an entry to `ITEMS` in `src/data/items.ts`. Ammo stack limits live in `CONFIG.items.ammoMaxStack`. A weapon item points at a `WeaponDef` in `src/data/weapons.ts`. Clothing items are generated from `ClothingRegistry` (`src/data/clothing.ts`), so a new piece of clothing is one registry entry (any `kind` + colours). The icon and the ground mesh are generated from the item's procedural mesh.

## Game modes

The game opens on a title screen (live desert backdrop). **Sandbox** is the frontier town. It has two merchants: a gunsmith leaning on a porch post (guns, ammo, bandages) and a tailor by the big west building (clothes only). You start with $150 (`CONFIG.sandbox.startingDollars`) and earn more by selling to them; each buys only what they sell. Shops are data: `MERCHANT_SHOPS` in `data/shop.ts`, and any NPC with `shop: '<id>'` trades instead of talking. **Story** (below) is the first version of the story; **Wave** is the survival mode.

### The sandbox world

The sandbox is a set of places (POIs) joined by trails: **Kane's Crossing** (the town), **Two Spurs Ranch** to the north and **Rattlesnake Gulch** to the east. The world is data (`src/data/world.ts`: POIs with their exits, trails between exits, world-map terrain; `validateWorld` checks it). Each place's map is loaded on demand (`src/world/poiMaps.ts`).

- **Two Spurs Ranch** (`world/maps/twoSpursRanch.ts`): a farmhouse with a porch, a walk-in barn (it fades when you're inside) with containers, a paddock where unsaddled horses graze and wander, a corral with a hand leaning on the fence, a saddled horse at the hitching rail you can ride, a windmill, troughs, hay, wagons, and a stream you cross on the plank bridge. Ride a horse that isn't yours to another place and it becomes yours (your old one stays where it was).
- **Rattlesnake Gulch** (`world/maps/rattlesnakeGulch.ts`): a dry canyon entered through narrow passes from the west trail (to town) and the north canyon trail (to the ranch). Inside: a dry riverbed, rock arches (they fade when they hide you), boulders, cacti, bleached bones and the abandoned mine. Four outlaws hold a tent camp around a campfire with a weapon crate, ammo boxes and a chest. They keep to their camp (`NpcDef.territory`): come within range and in sight, or land a shot near one of them, and the whole camp turns on you. A cleared camp stays cleared.
- **Exits:** a worn trail leads to each map edge, with a signpost naming the destination ("???" if you don't know it yet). Stand in the exit zone and press **E** to travel (also from the saddle). Not while someone's shooting at you.
- **Travel:** the screen fades, the next place loads in the background, and you arrive at the matching exit. Your horse comes along if you ride it or it stands within 6 units of the exit; otherwise it waits where you left it.
- **Places keep their state** while the page is open: containers, NPCs (the dead stay dead, frozen in time), items on the ground and loose horses are saved as plain data when you leave and restored when you return.
- **World map (M):** the terrain (drawn procedurally from `world.ts` like an old map), places you've visited (icon + name), places you've heard of ("?"), known trails (dashed where they lead somewhere you haven't been), a legend and a pulsing marker where you are. Hover a place for details; drag to pan.
- **Discovery:** arriving somewhere makes it visited and shows its trails to places you know; walking into an exit tells you of the place behind it ("Map updated: …"). Saved per mode in localStorage (`sok.world.sandbox`), so it survives reloads.
- **Map scraps:** 1×1 items; right-click one in any grid to study it. The place it shows goes on your map ("?") with its trails to places you've been, and the scrap is used up. One for the gulch lies in a chest on a town porch; one for the ranch is in the outlaws' chest in the gulch (`ItemDef.reveals`, `LootContainer.extras`).
- **Directions:** NPCs with `hints` (`NpcDef.hints: [{ poi, line }]`) tell you the way to a place you haven't been yet when you talk to them (E) instead of greeting you, and it goes on your map. The gunsmith points to the ranch, the rancher to the gulch.
- Every new place or trail shows a "Map updated: …" message.
- **The ride:** travelling fades into the world map, where a rider follows the trail (2–4 s) while the destination loads; "Arriving..." if it takes longer, E or a click skips once it's ready.
- **Fast travel** (pause menu → Gameplay, off by default, remembered): click a visited place on the world map to ride there along the shortest chain of known trails. Not during a fight.
- `src/core/Playthrough.ts` carries everything across maps: the player (bags, equipment, health), the purse, the horse, discovery and each place's saved state.

**Wave** takes place in an abandoned outpost ringed by canyon walls:

- **Waves:** outlaws (gunslingers, riflemen, shotgunners) come in through the passes in waves set by `data/waves.ts` (a formula takes over after the table). Each wave starts with a 5 s countdown, and the break after a wave lasts 25 s (Enter skips it).
- **Merchant:** between waves, trade with the merchant at the covered wagon. Earn dollars per kill and per cleared wave, buy guns, ammo, bandages and clothes, and sell anything for half its price.
- **Horses:** a horse arrives after wave 3. Mounted outlaws appear from wave 5; shoot the rider and the horse is yours to take for about 10 s before it bolts.
- **Healing and death:** bandages (G) are the only way to heal. One revive per run (the star by the health bar); the second death ends the run. The best wave reached is saved and shown on the menu.
