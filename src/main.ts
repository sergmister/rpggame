import "phaser";
import { EventEmitter } from "eventemitter3";

import { MenuScene } from "src/Scenes/MenuScene";
import { GameScene } from "src/Scenes/GameScene";
import { HotbarScene } from "src/Scenes/HotbarScene";
import { DialogScene } from "src/Scenes/DialogScene";
import { InventoryScene } from "src/Scenes/InventoryScene";
import { ShopScene } from "src/Scenes/ShopScene";
import { InGameMenuScene } from "src/Scenes/InGameMenuScene";
import { GameOverScene } from "src/Scenes/GameOverScene";

export const EE = new EventEmitter();

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "gamediv",
  scale: {
    expandParent: false,
    mode: Phaser.Scale.RESIZE,
  },
  physics: {
    default: "arcade",
    arcade: {
      // debug: true,
    },
  },
  scene: [
    MenuScene,
    GameScene,
    HotbarScene,
    InventoryScene,
    ShopScene,
    DialogScene,
    InGameMenuScene,
    GameOverScene,
  ],
};

// runs the game with the config and the scenes
const game = new Phaser.Game(config);
