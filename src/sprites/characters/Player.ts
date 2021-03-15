import "phaser";

import { Character } from "src/sprites/Character";

export default class Player extends Character {
  private keys: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
    super(scene, x, y, texture);

    const { LEFT, RIGHT, UP, DOWN } = Phaser.Input.Keyboard.KeyCodes;
    // this.keys  = this.scene.input.keyboard.addKeys({
    //   left: LEFT,
    //   right: RIGHT,
    //   up: UP,
    //   down: DOWN,
    // });

    this.keys = this.scene.input.keyboard.createCursorKeys();
  }

  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);

    let x = 0,
      y = 0;

    if (this.keys.down.isDown) {
      y += 1;
    }
    if (this.keys.up.isDown) {
      y -= 1;
    }
    if (this.keys.left.isDown) {
      x -= 1;
    }
    if (this.keys.right.isDown) {
      x += 1;
    }

    let dSum = Math.max(1, Math.hypot(x, y));

    x = x / dSum;
    y = y / dSum;

    this.setVelocity(32 * 10 * x, 32 * 10 * y);

    if (y > 0) {
      this.anims.play("down", true);
      this.last_dir = "down";
    } else if (y < 0) {
      this.anims.play("up", true);
      this.last_dir = "up";
    } else if (x < 0) {
      this.anims.play("left", true);
      this.last_dir = "left";
    } else if (x > 0) {
      this.anims.play("right", true);
      this.last_dir = "right";
    } else {
      switch (this.last_dir) {
        case "down":
          this.anims.play("idle_down", true);
          break;
        case "up":
          this.anims.play("idle_up", true);
          break;
        case "left":
          this.anims.play("idle_left", true);
          break;
        case "right":
          this.anims.play("idle_right", true);
          break;
      }
    }
  }
}
