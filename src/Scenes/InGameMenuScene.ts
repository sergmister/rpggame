import "phaser";

import { GameKey, GameProps, GameScene } from "src/Scenes/GameScene";

export const InGameMenuKey = "InGameMenu";

export interface InGameMenuProps {
  game: GameScene;
}

/**
 * menu scene displayed during the game
 */
export class InGameMenuScene extends Phaser.Scene {
  gameScene?: GameScene;

  constructor() {
    super({ key: InGameMenuKey });
  }

  create() {
    this.gameScene = this.registry.get("gameScene");

    this.cameras.main.startFollow({ x: 400, y: 300 });

    this.cameras.main.setBackgroundColor(0x222222);

    const saveGameButton = this.add
      .text(400, 240, "Save Game", {
        color: "lightblue",
        fontSize: "48px",
        backgroundColor: "darkgreen",
      })
      .setOrigin(0.5, 0.5)
      .setInteractive();

    saveGameButton.on("pointerover", () => {
      this.tweens.add({
        targets: saveGameButton,
        props: {
          scale: 0.96,
        },
        ease: "Power1",
        duration: 100,
        repeat: 0,
      });
    });

    saveGameButton.on("pointerout", () => {
      this.tweens.add({
        targets: saveGameButton,
        props: {
          scale: 1,
        },
        ease: "Linear",
        duration: 100,
        repeat: 0,
      });
    });

    saveGameButton.on("pointerup", () => {
      this.saveGame();
    });

    const resumeGameButton = this.add
      .text(400, 360, "Resume", {
        color: "lightblue",
        fontSize: "48px",
        backgroundColor: "darkgreen",
      })
      .setOrigin(0.5, 0.5)
      .setInteractive();

    resumeGameButton.on("pointerover", () => {
      this.tweens.add({
        targets: resumeGameButton,
        props: {
          scale: 0.96,
        },
        ease: "Power1",
        duration: 100,
        repeat: 0,
      });
    });

    resumeGameButton.on("pointerout", () => {
      this.tweens.add({
        targets: resumeGameButton,
        props: {
          scale: 1,
        },
        ease: "Linear",
        duration: 100,
        repeat: 0,
      });
    });

    resumeGameButton.on("pointerup", () => {
      this.resumeGame();
    });
  }

  saveGame() {
    this.gameScene?.saveGame();
  }

  resumeGame() {
    this.scene.switch(GameKey);
  }
}
