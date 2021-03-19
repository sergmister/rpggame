import "phaser";

import Character from "src/Sprites/Character";
import type { CharacterState } from "src/Sprites/Character";

export interface NPCState extends CharacterState {}

export default class NPC extends Character {
  constructor(scene: Phaser.Scene, state: CharacterState, texture?: string) {
    super(scene, state, texture || "intro");
  }
}
