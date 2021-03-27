import "phaser";
import GlobalPlayer from "src/GlobalPlayer";
import type BaseMap from "src/Maps/BaseMap";
import { loadMap } from "src/Maps/maputils";
import { HotbarKey } from "src/Scenes/HotbarScene";
import { InGameMenuKey, InGameMenuProps } from "src/Scenes/InGameMenuScene";
import { InventoryKey } from "src/Scenes/InventoryScene";

export const GameKey = "Game";

export interface GameProps {
  loadFromSave: boolean;
}

/**
 * main scene for the game that renders the map and all the sprites
 */
export class GameScene extends Phaser.Scene {
  constructor() {
    // sets scene key for use by phaser
    super({ key: GameKey });
  }

  preload() {
    // loads assets for the game
    this.load.pack("main", "assets/loader_pack.json");
  }

  // creates the game scene
  create(props: GameProps) {
    // clears localStorage if new game was selected
    if (!props.loadFromSave) {
      localStorage.clear();
    }

    // creates global player singleton
    const player = new GlobalPlayer();
    this.registry.set("GlobalPlayer", player);

    this.cameras.main.setZoom(2);

    // sets and loads the current map
    const currentMap = loadMap(this, player.state.currentMapID);
    this.registry.set("currentMap", currentMap);

    // launches in game menu on 'm' key
    this.input.keyboard.on("keyup-M", () => {
      this.scene.sleep();
      this.scene.launch(InGameMenuKey, { game: this } as InGameMenuProps);
    });

    // launches inventory on 'e' key
    this.input.keyboard.on("keyup-E", () => {
      this.scene.launch(InventoryKey);
    });

    // const timer = this.time.addEvent({
    //   delay: 5000,
    //   callback: this.saveGame,
    //   callbackScope: this,
    //   loop: true,
    // });

    // launches hotbar scene
    this.scene.launch(HotbarKey);
  }

  // saves the game
  saveGame() {
    // saves global player state
    (this.registry.get("GlobalPlayer") as GlobalPlayer)?.save();
    // saves current map state
    (this.registry.get("currentMap") as BaseMap)?.save();
    console.log("saved game");
  }
}
