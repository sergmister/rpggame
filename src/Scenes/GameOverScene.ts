import "phaser";

export const GameOverKey = "GameOver";

export interface GameOverProps {
  win: boolean;
}

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: GameOverKey });
  }

  create(props: GameOverProps) {
    localStorage.clear();

    this.cameras.main.startFollow({ x: 400, y: 300 });

    this.cameras.main.setBackgroundColor(0x222222);

    this.add
      .text(400, 300, props.win ? "You Win!" : "You Lose!", {
        color: props.win ? "green" : "red",
        fontSize: "96px",
        fontStyle: "bold",
        align: "center",
      })
      .setOrigin(0.5, 0.5);
  }
}
