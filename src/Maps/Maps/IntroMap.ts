import "phaser";
import type { MapState } from "src/Maps/BaseMap";
import BaseMap from "src/Maps/BaseMap";

export default class IntroMap extends BaseMap {
  constructor(scene: Phaser.Scene, id: string, state?: MapState) {
    super(scene, id, "tilemap_intro", state);
  }
}
