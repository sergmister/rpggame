import "phaser";

import { GameKey, GameProps, GameScene } from "src/Scenes/GameScene";

export const MenuKey = "Menu";

export interface MenuProps {}

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: MenuKey });
  }

  init(props: MenuProps) {}

  create() {
    this.cameras.main.startFollow({ x: 400, y: 300 });

    this.cameras.main.setBackgroundColor(0x222222);

    const newGameButton = this.add
      .text(400, 240, "New Game", {
        color: "lightblue",
        fontSize: "48px",
        backgroundColor: "darkgreen",
      })
      .setOrigin(0.5, 0.5)
      .setInteractive();

    newGameButton.on("pointerover", () => {
      this.tweens.add({
        targets: newGameButton,
        props: {
          scale: 0.96,
        },
        ease: "Power1",
        duration: 100,
        repeat: 0,
      });
    });

    newGameButton.on("pointerout", () => {
      this.tweens.add({
        targets: newGameButton,
        props: {
          scale: 1,
        },
        ease: "Linear",
        duration: 100,
        repeat: 0,
      });
    });

    newGameButton.once("pointerup", () => {
      this.newGame();
    });

    const loadGameButton = this.add
      .text(400, 360, "Load Game", {
        color: "lightblue",
        fontSize: "48px",
        backgroundColor: "darkgreen",
      })
      .setOrigin(0.5, 0.5)
      .setInteractive();

    loadGameButton.on("pointerover", () => {
      this.tweens.add({
        targets: loadGameButton,
        props: {
          scale: 0.96,
        },
        ease: "Power1",
        duration: 100,
        repeat: 0,
      });
    });

    loadGameButton.on("pointerout", () => {
      this.tweens.add({
        targets: loadGameButton,
        props: {
          scale: 1,
        },
        ease: "Linear",
        duration: 100,
        repeat: 0,
      });
    });

    loadGameButton.once("pointerup", () => {
      this.loadGame();
    });
  }

  update() {}

  newGame() {
    this.scene.start(GameKey, {
      loadFromSave: false,
    } as GameProps);
  }

  loadGame() {
    this.scene.start(GameKey, {
      loadFromSave: true,
    } as GameProps);
  }
}
