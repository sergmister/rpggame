import "phaser";

import type BaseMap from "src/Maps/BaseMap";
import type { MapState, MapConstructor } from "src/Maps/BaseMap";

import IntroMap from "src/Maps/Maps/IntroMap";
import HomeMap from "src/Maps/Maps/HomeMap";
import DesertMap from "src/Maps/Maps/DesertMap";
import CaveMap from "src/Maps/Maps/CaveMap";

import type GlobalPlayer from "src/GlobalPlayer";

const maplist: { id: string; class: MapConstructor }[] = [
  { id: "home", class: HomeMap },
  { id: "intro", class: IntroMap },
  { id: "desert", class: DesertMap },
  { id: "cave", class: CaveMap },
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

  (scene.registry.get("GlobalPlayer") as GlobalPlayer).state.currentMapID = id;

  return new map.class(scene, map.id);
}
