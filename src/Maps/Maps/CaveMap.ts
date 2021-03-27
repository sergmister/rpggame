import "phaser";
import type { MapState } from "src/Maps/BaseMap";
import BaseMap from "src/Maps/BaseMap";

export default class CaveMap extends BaseMap {
  constructor(scene: Phaser.Scene, id: string, state?: MapState) {
    super(scene, id, "tilemap_cave", state);
  }
}
