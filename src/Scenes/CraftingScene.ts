import "phaser";

import type { Item } from "src/Items/itemutils";
import type GlobalPlayer from "src/GlobalPlayer";

export const CraftingKey = "Shop";

export class CraftingScene extends Phaser.Scene {
  private centerX = 0;
  private centerY = 0;

  private container?: Phaser.GameObjects.Container;

  private player?: GlobalPlayer;

  constructor() {
    super({ key: CraftingKey });
  }

  private resizeCallback() {
    this.centerX = this.cameras.main.width / 2;
    this.centerY = this.cameras.main.height / 2;

    this.container?.setPosition(this.centerX, this.centerY);
  }
}
