import "phaser";

import { MenuKey, MenuProps, MenuScene } from "src/Scenes/MenuScene";
import {
  InGameMenuKey,
  InGameMenuProps,
  InGameMenuScene,
} from "src/Scenes/InGameMenuScene";

import { loadMap } from "src/Maps/maputils";

import type BaseMap from "src/Maps/BaseMap";

export const GameKey = "Game";

export interface GameProps {
  loadFromSave: boolean;
}

export class GameScene extends Phaser.Scene {
  currentMapID: string = "intro";
  currentMap?: BaseMap;

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

    this.cameras.main.setZoom(2);

    this.currentMap = loadMap(this, this.currentMapID);

    this.input.keyboard.on("keydown-M", () => {
      this.scene.switch(InGameMenuKey);
    });

    this.registry.set("gameScene", this);

    const timer = this.time.addEvent({
      delay: 5000,
      callback: this.saveGame,
      callbackScope: this,
      loop: true,
    });
  }

  update() {
    // console.log(1);
  }

  launchInGameMenu() {
    this.scene.run(InGameMenuKey);
  }

  saveGame() {
    this.currentMap?.save();
    console.log("saved game");
  }
}
