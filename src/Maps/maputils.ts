import "phaser";

import type BaseMap from "src/Maps/BaseMap";
import type { MapState, MapConstructor } from "src/Maps/BaseMap";

import IntroMap from "src/Maps/Maps/IntroMap";
import HomeMap from "src/Maps/Maps/HomeMap";

const maplist: { id: string; class: MapConstructor }[] = [
  { id: "home", class: HomeMap },
  { id: "intro", class: IntroMap },
];

export function loadMap(scene: Phaser.Scene, id: string): BaseMap {
  let map = maplist.find((x) => x.id === id);
  if (!map) {
    map = maplist[0];
  }

  const mapStateString = localStorage.getItem(`map_${map.id}`);

  if (mapStateString) {
    const mapState: MapState = JSON.parse(mapStateString);
    return new map.class(scene, map.id, mapState);
  }
  return new map.class(scene, map.id);
}
