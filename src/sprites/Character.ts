import "phaser";

export class Character extends Phaser.Physics.Arcade.Sprite {
  private last_dir = "down";

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
    super(scene, x, y, texture, 1);

    this.anims.create({
      key: "idle_down",
      frames: [{ key: texture, frame: 1 }],
      frameRate: 10,
    });

    this.anims.create({
      key: "idle_left",
      frames: [{ key: texture, frame: 4 }],
      frameRate: 10,
    });

    this.anims.create({
      key: "idle_right",
      frames: [{ key: texture, frame: 7 }],
      frameRate: 10,
    });

    this.anims.create({
      key: "idle_up",
      frames: [{ key: texture, frame: 10 }],
      frameRate: 10,
    });

    this.anims.create({
      key: "down",
      frames: this.anims.generateFrameNumbers(texture, { frames: [0, 1, 2] }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers(texture, { frames: [3, 4, 5] }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers(texture, { frames: [6, 7, 8] }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "up",
      frames: this.anims.generateFrameNumbers(texture, { frames: [9, 10, 11] }),
      frameRate: 10,
      repeat: -1,
    });

    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);
  }
}
