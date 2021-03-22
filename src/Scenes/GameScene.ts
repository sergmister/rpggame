import "phaser";

import {
  InGameMenuKey,
  InGameMenuProps,
  InGameMenuScene,
} from "src/Scenes/InGameMenuScene";
import { HotbarKey, HotbarScene } from "src/Scenes/HotbarScene";
import { InventoryKey, InventoryScene } from "src/Scenes/InventoryScene";

import { loadMap } from "src/Maps/maputils";

import type BaseMap from "src/Maps/BaseMap";
import GlobalPlayer from "src/GlobalPlayer";

export const GameKey = "Game";

export interface GameProps {
  loadFromSave: boolean;
}

/**
 * main scene for the game that renders the map and all the sprites
 */
export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: GameKey });
  }

  preload() {
    this.load.pack("main", "assets/loader_pack.json");
  }

  create(props: GameProps) {
    if (!props.loadFromSave) {
      localStorage.clear();
    }

    const player = new GlobalPlayer();
    this.registry.set("GlobalPlayer", player);

    this.cameras.main.setZoom(2);

    const currentMap = loadMap(this, player.state.currentMapID);
    this.registry.set("currentMap", currentMap);

    this.input.keyboard.on("keyup-M", () => {
      this.scene.switch(InGameMenuKey);
    });

    this.input.keyboard.on("keyup-E", () => {
      this.scene.pause(GameKey);
      this.scene.launch(InventoryKey);
    });

    this.registry.set("gameScene", this);

    // const timer = this.time.addEvent({
    //   delay: 5000,
    //   callback: this.saveGame,
    //   callbackScope: this,
    //   loop: true,
    // });

    this.scene.launch(HotbarKey);
  }

  launchInGameMenu() {
    this.scene.run(InGameMenuKey);
  }

  saveGame() {
    (this.registry.get("GlobalPlayer") as GlobalPlayer)?.save();
    (this.registry.get("currentMap") as BaseMap)?.save();
    console.log("saved game");
  }
}
