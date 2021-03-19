import "phaser";

// genarics to the rescue?

export interface SpriteState {
  name: string;
  type: string;
  x: number;
  y: number;
}

export interface SpriteConstructor {
  new (scene: Phaser.Scene, state: SpriteState): Sprite;
}

export default abstract class Sprite extends Phaser.Physics.Arcade.Sprite {
  name: string;

  constructor(scene: Phaser.Scene, state: SpriteState, texture: string) {
    super(scene, state.x, state.y, texture);
    this.name = state.name;
    this.type = state.type;
  }

  touched(char: Sprite): void {}

  getState(): SpriteState {
    return {
      name: this.name,
      type: this.type,
      x: this.x,
      y: this.y,
    };
  }

  destroy() {
    super.destroy();
  }
}
