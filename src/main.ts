import "phaser";

import { MainScene } from "src/scenes/MainScene";

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
  scene: [MainScene],
};

const game = new Phaser.Game(config);
