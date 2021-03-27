import "phaser";

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
  // constructor to load the sprite based of a state
  constructor(scene: Phaser.Scene, texture: string, state: SpriteState) {
    super(scene, state.x, state.y, texture);
    if (state.name) {
      this.name = state.name;
    }
    this.type = state.type;
  }

  // function called when one sprite touched another
  touched(char: Sprite): void {}

  // returns the state of the sprite in an object
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

  // destroys the sprite
  destroy() {
    super.destroy();
  }
}
