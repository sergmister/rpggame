import "phaser";

// genarics to the rescue?

export interface SpriteState {
  name?: string;
  type: string;
  x: number;
  y: number;
}

/**
 * base class for a sprite
 */
export default class Sprite extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene, texture: string, state: SpriteState) {
    super(scene, state.x, state.y, texture);
    if (state.name) {
      this.name = state.name;
    }
    this.type = state.type;
  }

  touched(char: Sprite): void {}

  getState(): SpriteState {
    return {
      ...(this.name && { name: this.name }),
      ...{
        type: this.type,
        x: this.x,
        y: this.y,
      },
    };
  }

  destroy() {
    super.destroy();
  }
}
