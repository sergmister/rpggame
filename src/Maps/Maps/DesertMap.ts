import "phaser";

import BaseMap from "src/Maps/BaseMap";
import type { MapState } from "src/Maps/BaseMap";

export default class DesertMap extends BaseMap {
  constructor(scene: Phaser.Scene, id: string, state?: MapState) {
    super(scene, id, "tilemap_desert", state);
  }
}
