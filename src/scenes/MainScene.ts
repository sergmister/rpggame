import "phaser";

import type Character from "src/sprites/Character";
import Player from "src/sprites/characters/Player";
import Intro from "src/sprites/characters/Intro";

export const KEY = "MAIN";

export class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: KEY });
  }

  preload() {
    this.load.image("merged_pipo", "assets/Pipoya_RPG_Tileset/merged_pipo.png");
    this.load.tilemapTiledJSON("first", "assets/tilemaps/first.json");

    this.load.spritesheet(
      "player",
      "assets/Pipoya_RPG_Character_Sprites/Male/Male_01-1.png",
      {
        frameWidth: 32,
        frameHeight: 32,
        margin: 1,
        spacing: 2,
      }
    );

    this.load.spritesheet(
      "intro",
      "assets/Pipoya_RPG_Character_Sprites/Male/Male_02-1.png",
      {
        frameWidth: 32,
        frameHeight: 32,
        margin: 1,
        spacing: 2,
      }
    );
  }

  create() {
    const map = this.make.tilemap({ key: "first" });
    const tileset = map.addTilesetImage(
      "merged_pipo",
      "merged_pipo",
      32,
      32,
      1,
      2
    );

    this.add.image(400, 300, "merged_pipo");

    const layer1 = map.createLayer("ground", tileset);
    const layer2 = map.createLayer("middle", tileset);
    const layer3 = map.createLayer("above", tileset);
    const layerc = map.createLayer("collides", tileset).setVisible(false);
    const layero = map.getObjectLayer("objects");

    // layer3.setCollisionByProperty({ collides: "" });
    // layer3.setCollisionFromCollisionGroup(true);
    layerc.setCollisionByExclusion([-1]);

    let playerX = 0,
      playerY = 0;

    const characters: Character[] = [];

    layero.objects.forEach((obj) => {
      // we can have custom logic with custom properties
      if (obj.name == "player") {
        playerX = obj.x as number;
        playerY = obj.y as number;
      } else if (obj.name == "intro") {
        characters.push(
          new Intro(this, obj.x as number, obj.y as number, "intro")
        );
      }
    });

    const player = new Player(this, playerX, playerY, "player");
    characters.push(player);

    this.physics.add.collider(characters, layerc);
    this.physics.add.collider(characters, characters);

    this.cameras.main.startFollow(player);
    this.cameras.main.setZoom(2);
  }
}

/**
 * just one scene that switches out assets
 * store all game state in a single object
 */
