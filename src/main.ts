import { EventEmitter } from "eventemitter3";
import "phaser";
import { DialogScene } from "src/Scenes/DialogScene";
import { GameOverScene } from "src/Scenes/GameOverScene";
import { GameScene } from "src/Scenes/GameScene";
import { HotbarScene } from "src/Scenes/HotbarScene";
import { InGameMenuScene } from "src/Scenes/InGameMenuScene";
import { InventoryScene } from "src/Scenes/InventoryScene";
import { MenuScene } from "src/Scenes/MenuScene";
import { ShopScene } from "src/Scenes/ShopScene";
import { BattleScene } from "./Scenes/BattleScene";

export const EE = new EventEmitter();

// game configuration for phaser
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
    BattleScene,
    ShopScene,
    DialogScene,
    InGameMenuScene,
    GameOverScene,
  ],
};

// runs the game with the config and the scenes
const game = new Phaser.Game(config);
