import "phaser";
import type { SpriteState } from "src/Sprites/Sprite";
import Sprite from "src/Sprites/Sprite";

export interface CharacterState extends SpriteState {
  last_dir?: string;
}

/**
 * base class for a character sprite
 */
export default abstract class Character extends Sprite {
  // last dir the character was facing
  protected last_dir;

  // constructs player from state
  constructor(scene: Phaser.Scene, texture: string, state: CharacterState) {
    super(scene, texture, state);

    this.last_dir = state.last_dir || "down";

    // creates animations for use by phaser

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

    this.anims.play(this.last_dir);

    // adds character to the scene and physics simulation
    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);
  }

  // run every frame
  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);
  }

  // called when character is touched by another character
  touched(char: Character): void {}

  // face towards a coordinate
  faceDir(x: number, y: number) {
    const dx = x - this.x;
    const dy = y - this.y;

    if (dx > 0) {
      if (Math.abs(dx) > Math.abs(dy)) {
        this.anims.play("right", true);
      } else if (dy < 0) {
        this.anims.play("up", true);
      } else {
        this.anims.play("down", true);
      }
    } else {
      if (Math.abs(dx) > Math.abs(dy)) {
        this.anims.play("left", true);
      } else if (dy < 0) {
        this.anims.play("up", true);
      } else {
        this.anims.play("down", true);
      }
    }
  }

  // returns character state
  getState(): CharacterState {
    return { ...super.getState(), ...{ last_dir: this.last_dir } };
  }
}
