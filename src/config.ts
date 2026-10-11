// All gameplay and rendering tunables live here.
const DEG = Math.PI / 180;

export const CONFIG = {
  game: {
    /** Title on the main menu (placeholder). */
    title: 'Stories of Kane',
    /** localStorage key for the best wave reached. */
    bestWaveKey: 'dust-and-lead.bestWave',
  },

  sim: {
    fixedDt: 1 / 60,
    maxStepsPerFrame: 5,
  },

  render: {
    /** 
     * Base low-res size; 
     * actual size = window / largest integer factor that fits this base.
     * */
    baseWidth: 320,
    baseHeight: 180    ,
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
    maxHp: 100,
    /** Health regenerates after this long without taking damage (s)... */
    regenDelay: 5,
    /** ...at this rate (hp/s). */
    regenRate: 8,
    /** Seconds from death to respawn. */
    respawnTime: 3.5,
    /** The gun goes back in the holster after this long without shooting (s). */
    autoHolsterTime: 30,
    /** Crouching (C): slower, steadier, smaller. */
    crouch: {
      speedMul: 0.5,
      /** Spread × this while crouched and still… */
      spreadMul: 0.6,
      /** …and while crouch-walking (instead of the walking penalty). */
      movingSpreadMul: 0.8,
      /** Hitbox height × this when fully crouched. */
      hitboxScale: 0.6,
      /** Seconds to blend between standing and crouched. */
      blendTime: 0.2,
      /** Standing height checked overhead before getting up. */
      standHeight: 1.85,
    },
    /** How much lower the shoulders are when fully crouched. */
    crouchDrop: 0.35,
    /** Top of a crouched body (overhead check from here up to crouch.standHeight). */
    standHeightCrouched: 1.15,
    /** Weapon spread multipliers (the weapon's own spread is the standing-still value). */
    spreadMovingMul: 2.75,
    spreadMountedMul: 4.5,
    /** Extra spread multiplier per unit of horse speed. */
    spreadMountedPerSpeed: 0.225,
  },

  items: {
    /** Max rounds per ammo stack, by ammo type. */
    ammoMaxStack: {
      revolverAmmo: 50,
      rifleAmmo: 20,
      shotgunShells: 12,
    } as Record<string, number>,
    playerGrid: { w: 8, h: 4 },
    npcGrid: { w: 8, h: 4 },
    /** Holster + draw when switching weapon slots (s, total). */
    weaponSwapTime: 0.4,
  },

  sandbox: {
    /** Dollars in your pocket at the start (earn more by selling to the merchants). */
    startingDollars: 150,
  },

  wave: {
    /** The player's horse arrives at the start of the break after this wave. */
    horseUnlockWave: 3,
    mountedEnemiesFromWave: 5,
    countdown: 5,
    intermission: 25,
    /** "Wave cleared" banner time at the start of the break. */
    clearedBanner: 3,
    /** Seconds between enemy spawns. */
    spawnInterval: [1, 2] as [number, number],
    /** Corpses older than this many waves are removed at the start of a break. */
    corpseWaves: 2,
    /** Riderless horses wait this long before bolting off the map. */
    riderlessStay: 10,
    /** Spawn points closer than this to the player (or on screen) are avoided. */
    minSpawnDistance: 18,
    revive: { tokens: 1, slowMo: 0.3, slowMoTime: 1, getUpAfter: 2, hp: 0.5, knockbackRadius: 5, knockback: 3, invulnerable: 2 },
    /** Mounted enemies circle the player at about this distance. */
    orbitRadius: 9,
  },

  projectiles: {
    tracerLength: 1.6,
  },

  npc: {
    radius: 0.35,
    hp: 100,
    walkSpeed: 1.5,
    combatSpeed: 2.6,
    runSpeed: 4.8,
    /** Default weapon spread multiplier in NPC hands (see NpcDef.inaccuracy). */
    inaccuracy: 2.5,
    /** Default aim lag (s) behind a moving target (see NpcDef.reactionTime). */
    reactionTime: 0.3,
    /** Spread multiplier while the NPC moves. */
    movingSpreadMul: 1.6,
    talkRange: 2.8,
    /** Within this range an idle NPC stops and turns to face the player. */
    noticeRange: 4.5,
    /** Player bullets landing within this radius of an NPC make it flinch and warn. */
    nearMissRadius: 3,
    /** Seconds before the same NPC warns again. */
    warnCooldown: 2.5,
    /** Max distance from the victim at which a defender can witness a shooting. */
    witnessRange: 12,
    /** The player counts as "around" while within this range and in line of sight. */
    awarenessRange: 24,
    /** Seconds the player must stay away (out of range or out of sight) for an NPC to calm down. */
    calmTime: 60,
    /** Unarmed NPCs bolt again if the player comes this close to their hiding spot (in sight). */
    hideBreakRange: 8,
    respawnTime: 45,
    eyeHeight: 1.55,
    chestHeight: 1.2,
    speechTime: 3.2,
    talkTime: 4,
  },

  horse: {
    /** Tail chain (spring physics per segment). */
    tail: {
      segments: 5,
      length: 1.0,
      /** Spring of the first segment towards its pose (1/s²). */
      stiffness: 70,
      /** Spring of each further segment towards its parent (softer down the chain). */
      followStiffness: 120,
      damping: 9,
      /** Seconds between idle fly-swatting swishes. */
      swishInterval: [2, 6] as [number, number],
    },
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
