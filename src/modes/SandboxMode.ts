import { CONFIG } from '../config';
import type { Engine } from '../core/Engine';
import { SANDBOX_WORLD } from '../data/world';
import { FrontierMode } from './FrontierMode';

/** The sandbox: the whole frontier to roam (town, ranch, canyon), with its few quests. */
export class SandboxMode extends FrontierMode {
  constructor(engine: Engine) {
    super(engine, { kind: 'sandbox', world: SANDBOX_WORLD, startingDollars: CONFIG.sandbox.startingDollars });
  }
}
