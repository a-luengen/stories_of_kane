import { CONFIG } from '../config';
import type { Engine } from '../core/Engine';
import { Session } from '../core/Session';
import { NPCS } from '../data/npcs';
import { buildSandboxMap } from '../world/maps/sandbox';
import { MERCHANT_SHOPS } from '../data/shop';
import { itemDef } from '../items/ItemDef';
import { drawWalletPlate } from '../ui/WaveHud';
import { Economy, type Purse } from './Economy';
import type { GameMode } from './GameMode';

/** The frontier town: free roaming, the four townsfolk, respawn on death. */
export class SandboxMode implements GameMode {
  readonly kind = 'sandbox' as const;
  session!: Session;
  private respawnLeft = -1;

  constructor(private engine: Engine) {}

  init(): void {
    this.session = new Session(
      this.engine,
      {
        map: buildSandboxMap,
        npcs: NPCS,
        regen: true,
        tutorial: 'WASD MOVE  CLICK SHOOT  R RELOAD  1-3 WEAPONS  E USE  I INVENTORY',
      },
      {
        onPlayerDeath: () => this.onPlayerDeath(),
        step: (dt) => this.step(dt),
        drawHud: (ctx, W) => drawWalletPlate(ctx, W, this.purse.dollars),
      },
    );
    this.openMerchants();
  }

  /** One pocket for the whole town: start with a little cash, earn more by selling. */
  readonly purse: Purse = { dollars: CONFIG.sandbox.startingDollars, earned: 0 };

  /** NPCs with a `shop` trade instead of talking; each sells (and buys) only their own kind of goods. */
  private openMerchants(): void {
    const s = this.session;
    for (const npc of s.npcs.npcs) {
      const shop = npc.def.shop ? MERCHANT_SHOPS[npc.def.shop] : undefined;
      if (!shop) continue;
      const economy = new Economy(shop.stock, this.purse);
      npc.onTrade = (n) =>
        s.openUi(() =>
          s.ui.openShop({
            economy,
            wave: () => Infinity,
            title: shop.title,
            merchantName: n.name,
            buys: (item) => shop.buys.includes(itemDef(item.defId).category),
          }),
        );
    }
  }

  onPlayerDeath(): void {
    this.respawnLeft = CONFIG.player.respawnTime;
  }

  /** Death → short pause → respawn at the start with everyone calmed down. */
  private step(dt: number): void {
    if (this.respawnLeft < 0) return;
    this.respawnLeft -= dt;
    if (this.respawnLeft <= 0) {
      this.respawnLeft = -1;
      this.session.revivePlayer(1, this.session.map.playerSpawn.clone());
      this.session.npcs.calmAll();
    }
  }

  update(dt: number): void {
    this.session.frame(dt);
  }

  render(dt: number): void {
    this.session.render(dt, true);
  }

  dispose(): void {
    this.session.dispose();
  }
}
