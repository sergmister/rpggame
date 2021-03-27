import "phaser";
import type GlobalPlayer from "src/GlobalPlayer";
import type BaseMap from "src/Maps/BaseMap";
import type { MapConstructor, MapState } from "src/Maps/BaseMap";
import CaveMap from "src/Maps/Maps/CaveMap";
import DesertMap from "src/Maps/Maps/DesertMap";
import HomeMap from "src/Maps/Maps/HomeMap";
import IntroMap from "src/Maps/Maps/IntroMap";
import ForestMap from "./Maps/ForestMap";

// list of map ids and their corresponding classes
const maplist: { id: string; class: MapConstructor }[] = [
  { id: "home", class: HomeMap },
  { id: "intro", class: IntroMap },
  { id: "forest", class: ForestMap },
  { id: "desert", class: DesertMap },
  { id: "cave", class: CaveMap },
];

// function to load a map from an ID string
export function loadMap(scene: Phaser.Scene, id: string): BaseMap {
  // finds map by id
  let map = maplist.find((x) => x.id === id);
  if (!map) {
    map = maplist[0];
  }

  // checks localStorage contains saved map state
  const mapStateString = localStorage.getItem(`map_${map.id}`);

  // loads map from state if saved state was found
  if (mapStateString) {
    const mapState: MapState = JSON.parse(mapStateString);
    return new map.class(scene, map.id, mapState);
  }

  // sets global player current map id for save state
  (scene.registry.get("GlobalPlayer") as GlobalPlayer).state.currentMapID =
    map.id;

  // loads map without saved state
  return new map.class(scene, map.id);
}
