# Cowboy Iso Prototype

Isometric 2.5D pixel-art cowboy prototype: Vite + TypeScript + Three.js, all visuals procedural.

```
npm install
npm run dev        # http://localhost:5173
npm test           # horse movement acceptance tests (vitest)
npm run build      # typecheck + production build
```

## Controls

| Key | Action |
| --- | --- |
| WASD | Move (screen-relative) / steer horse |
| Mouse | Aim · Left click (hold) shoot |
| R | Reload |
| E | Mount / dismount horse (when close) |
| Shift | Sprint on foot / gallop on horse |
| P | Toggle pixelation (debug) |
| O / L | Toggle palette quantization / outlines |
| H | Horse debug overlay (heading, input, turn radius, speed, FPS) |

## Layout

- `src/config.ts` – every tunable (render, camera, player, revolver, horse, targets)
- `src/Game.ts` – fixed 60 Hz simulation + interpolated rendering, wiring, occlusion fade
- `src/CameraRig.ts` – true iso ortho camera, pixel-grid snapping + sub-pixel upscale offset, shake
- `src/PixelPass.ts` – low-res colour / normal+depth targets → outlines, palette, integer upscale
- `src/entities/` – `Player`, `PlayerModel`, `Horse`, `HorseModel`, `HorseMotor` (pure movement model), `Projectiles`, `Targets`, `Particles`, `MuzzleFlash`
- `src/world/` – `World` (map generation), `Colliders` (circle/AABB, grid broadphase, swept 3D segment tests)
- `src/ui/` – `Hud` (drawn at low-res on the same pixel grid), `DebugOverlay`, `PixelFont`

## Notes

- The low-res size is `window / k`, where `k` is the largest integer factor that fits 320×180. World units per pixel stay constant, so a larger window shows more world but pixels never get non-integer scaling.
- The cursor ray hits a ground-parallel plane at `revolver.aimPlaneHeight` (1.0 by default, ≈ bottle/dummy height), not y = 0, so you can aim directly at targets. Set it to 0 for pure ground picking.
- Shadows use hard compare (`BasicShadowMap`). Three's PCF jitters its samples with screen-space noise, and that makes shadow edges crawl under a pixel-snapped camera.
- Buildings between the camera and the player are dithered out (4×4 Bayer) and left out of the outline pass.
