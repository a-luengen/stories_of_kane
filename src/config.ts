// All gameplay and rendering tunables live here.
const DEG = Math.PI / 180;

export const CONFIG = {
  sim: {
    fixedDt: 1 / 60,
    maxStepsPerFrame: 5,
  },

  render: {
    /** Base low-res size; actual size = window / largest integer factor that fits this base. */
    baseWidth: 320,
    baseHeight: 180,
    /** World units covered by one low-res pixel (constant zoom regardless of window size). */
    unitsPerPixel: 1 / 11,
    pixelate: true,
    outlines: true,
    paletteQuantize: true,
    /** Render one extra pixel border and shift the upscale by the sub-pixel camera remainder. */
    subpixelCamera: true,
    /** Depth difference (world units) to a farther neighbour that triggers an outline. */
    depthEdgeThreshold: 0.32,
    /** Brightness boost on convex crease edges (normal discontinuities). */
    normalEdgeHighlight: 0.22,
    outlineDarken: 0.4,
    outlineColor: 0x2b1d14,
    skyColor: 0x9cc6dc,
    shadowMapSize: 2048,
    /** Half-extent of the shadow camera around the player. */
    shadowExtent: 26,
    /** Direction *towards* the sun (late afternoon, low and warm). */
    sunDirection: [-0.64, 0.59, 0.48] as [number, number, number],
    sunColor: 0xffd29a,
    sunIntensity: 2.6,
    skyLightColor: 0xa9d0ea,
    groundLightColor: 0xb07a4a,
    hemiIntensity: 1.25,
  },

  camera: {
    distance: 80,
    near: 1,
    far: 220,
    followSharpness: 7,
    /** Fraction of the aim offset the camera leads towards. */
    aimLead: 0.18,
    maxAimLead: 3.2,
  },

  shake: {
    shotTrauma: 0.28,
    impactTrauma: 0.08,
    maxOffset: 0.32, // world units at trauma 1
    decay: 2.8,
  },

  player: {
    radius: 0.35,
    walkSpeed: 4.3,
    sprintSpeed: 6.9,
    acceleration: 38,
    deceleration: 30,
    mountRange: 2.6,
  },

  revolver: {
    magazine: 6,
    fireCooldown: 0.3,
    reloadTime: 1.5,
    bulletSpeed: 72,
    bulletRange: 46,
    /** Base spread angles; the scatter radius at distance d is d·tan(spread)·(1 + d·spreadGrowth). */
    spreadStanding: 0.8 * DEG,
    spreadMoving: 2.2 * DEG,
    spreadMounted: 3.6 * DEG,
    /** Extra spread per unit of horse speed (radians). */
    spreadMountedPerSpeed: 0.18 * DEG,
    /** How fast inaccuracy compounds with distance (per world unit). 0 = purely angular spread. */
    spreadGrowth: 0.1,
    tracerLength: 1.6,
  },

  horse: {
    canterSpeed: 7.5,
    gallopSpeed: 12.5,
    /** Base acceleration (units/s²) before ease-in/ease-out shaping; ~2s standstill → gallop. */
    acceleration: 14,
    /** Base coast deceleration (units/s²); ~1.5s gallop → 0. */
    decay: 13.2,
    brakeDecel: 24,
    turnRateSlow: 4.2, // rad/s
    turnRateGallop: 1.25, // rad/s
    pivotSpeed: 1.2,
    pivotTurnRate: 3.4, // rad/s
    brakeAngle: 150 * DEG,
    /** Fraction of speed lost per second while turning at the maximum rate. */
    turnSpeedLoss: 0.32,
    /** Below pivotSpeed the horse pivots in place until within this angle of the target. */
    pivotAlignAngle: 20 * DEG,
    stopEpsilon: 0.05,
    radius: 0.75,
    /** Fraction of the normal-component speed loss applied on collisions (1 = physical). */
    collisionSpeedLoss: 1.0,
  },

  targets: {
    bottleRespawn: 3.5,
    dummyHp: 5,
    dummyRespawn: 4,
  },

  world: {
    size: 100,
    seed: 1337,
  },
};

export type HorseTuning = typeof CONFIG.horse;
