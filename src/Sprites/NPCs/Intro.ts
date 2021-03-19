import "phaser";

import type Character from "src/Sprites/Character";
import NPC from "src/Sprites/NPC";
import type { NPCState } from "src/Sprites/NPC";

export default class Intro extends NPC {
  // cooldown for talking with the player, set to -1 to only talk once
  private talkCooldown = -1;
  private talkTimer = 0;

  // timer for how long to wait before turning away from the player
  private meetCooldown = 40;
  private meetTimer = 0;
  private meetChar?: Character;
  private meetCharX = 0;
  private meetCharY = 0;

  constructor(scene: Phaser.Scene, state: NPCState, texture: string) {
    super(scene, state, texture);

    this.setImmovable(true);
  }

  preUpdate(time: number, delta: number) {
    if (this.talkTimer > 0) {
      this.talkTimer--;
    }
    if (this.meetTimer > 0) {
      // is it bad that we keep this refrence?
      // properly check if it is still active?
      if (this.meetChar) {
        if (
          Math.hypot(
            Math.abs(this.meetChar.x - this.meetCharX),
            Math.abs(this.meetChar.y - this.meetCharY)
          ) > 32
        ) {
          this.meetTimer--;
        }
      } else {
        this.meetTimer = 0;
      }
    }
    if (this.meetTimer === 0) {
      this.meetChar = undefined;
      this.anims.play(this.last_dir, true);
    }
  }

  touched(char: Character) {
    if (char.name === "player") {
      if (this.talkTimer === 0) {
        this.talkTimer = this.talkCooldown;
        this.meetTimer = this.meetCooldown;
        this.meetChar = char;
        this.meetCharX = char.x;
        this.meetCharY = char.y;
        this.faceDir(char.x, char.y);
      }
    }
  }
}
