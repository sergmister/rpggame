import "phaser";

import { Character } from "src/sprites/Character";

export default class Intro extends Character {
  constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
    super(scene, x, y, texture);

    this.setImmovable(true);
  }
}
