import "phaser";

import type Sprite from "src/Sprites/Sprite";
import type { SpriteState, SpriteConstructor } from "src/Sprites/Sprite";

import Player from "src/Sprites/Player";
import NPC from "src/Sprites/NPC";
import Intro from "src/Sprites/NPCs/Intro";

const spritelist: { type: string; class: SpriteConstructor }[] = [
  { type: "npc", class: NPC },
  { type: "player", class: Player },
  { type: "intro", class: Intro },
];

export function loadSprite(
  scene: Phaser.Scene,
  spriteState: SpriteState
): Sprite {
  let sprite = spritelist.find((x) => x.type === spriteState.type);
  if (!sprite) {
    sprite = spritelist[0];
  }

  return new sprite.class(scene, spriteState);
}
