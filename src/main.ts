import "phaser";

import { MenuScene } from "src/Scenes/MenuScene";
import { GameScene } from "src/Scenes/GameScene";
import { InGameMenuScene } from "src/Scenes/InGameMenuScene";

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
      debug: true,
    },
  },
  scene: [MenuScene, GameScene, InGameMenuScene],
};

const game = new Phaser.Game(config);
