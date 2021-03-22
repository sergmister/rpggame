import "phaser";

import Character from "src/Sprites/Character";
import type { CharacterState } from "src/Sprites/Character";
import type GlobalPlayer from "src/GlobalPlayer";

type moveKeys = {
  up: Phaser.Input.Keyboard.Key;
  right: Phaser.Input.Keyboard.Key;
  down: Phaser.Input.Keyboard.Key;
  left: Phaser.Input.Keyboard.Key;
};

const { W, A, S, D } = Phaser.Input.Keyboard.KeyCodes;

// only state for a specific scene
export interface PlayerState extends CharacterState {}

export default class Player extends Character {
  globalPlayer: GlobalPlayer;

  private keys: moveKeys;

  // private goldTimer: Phaser.Time.TimerEvent;

  frozen = false;

  constructor(scene: Phaser.Scene, state: PlayerState) {
    super(scene, "Male_01-1", state);

    this.globalPlayer = this.scene.game.registry.get("GlobalPlayer");

    this.keys = this.scene.input.keyboard.addKeys({
      up: W,
      right: D,
      down: S,
      left: A,
    }) as moveKeys;

    // this.goldTimer = this.scene.time.addEvent({
    //   delay: 5000,
    //   callback: () => {
    //     this.globalPlayer.setState({ gold: this.globalPlayer.state.gold + 1 });
    //   },
    //   callbackScope: this,
    //   loop: true,
    // });
  }

  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);

    if (this.frozen) {
      this.setVelocity(0, 0);
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
    } else {
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

  getState(): PlayerState {
    return { ...super.getState() };
  }

  getPlayerState() {}

  destroy() {
    super.destroy();
  }
}
