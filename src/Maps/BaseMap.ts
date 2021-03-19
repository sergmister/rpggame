import "phaser";

import { loadMap } from "src/Maps/maputils";
import { loadSprite } from "src/Sprites/spriteutils";

import type Sprite from "src/Sprites/Sprite";
import type { SpriteState } from "src/Sprites/Sprite";
import type Player from "src/Sprites/Player";

export interface MapState {
  id: string;
  spriteStates: SpriteState[];
}

export interface MapConstructor {
  new (scene: Phaser.Scene, id: string, state?: MapState): BaseMap;
}

export default abstract class BaseMap extends Phaser.Tilemaps.Tilemap {
  id: string;
  sprites: Sprite[];

  // loading is done in the constructor
  constructor(scene: Phaser.Scene, id: string, key: string, state?: MapState) {
    let tilemapData = scene.cache.tilemap.get(key);
    if (!tilemapData) {
      console.warn("No map data found for key " + key);
    }
    super(
      scene,
      Phaser.Tilemaps.Parsers.Parse(
        key,
        tilemapData["format"],
        tilemapData["data"],
        32,
        32,
        false
      )
    );
    this.id = id;
    this.sprites = [];

    const tileset = this.addTilesetImage(
      "merged_pipo",
      "merged_pipo",
      32,
      32,
      1,
      2
    );

    const layer1 = this.createLayer("ground", tileset);
    const layer2 = this.createLayer("middle", tileset);
    const layer3 = this.createLayer("above", tileset);
    const layerc = this.createLayer("collides", tileset).setVisible(false);
    const layero = this.getObjectLayer("objects");

    layerc.setCollisionByExclusion([-1]);

    // the player is just a normal game object
    // custom info for the player is stored seperately and managed by GameScene
    // need to make stuff for game objects like we did for maps

    // don't save state that doesn't change like certain properties?
    // still have to remember whether the sprite still exists
    if (state) {
      for (const spriteState of state.spriteStates) {
        this.sprites.push(loadSprite(this.scene, spriteState));
      }
    } else {
      layero.objects.forEach((obj) => {
        this.sprites.push(
          loadSprite(this.scene, {
            name: obj.name,
            type: obj.type,
            x: obj.x || 0,
            y: obj.y || 0,
          })
        );
      });
    }

    const player = this.sprites.find((x) => x.type === "player") as Player;

    // filter out sprites based on collision property?
    this.scene.physics.add.collider(this.sprites, layerc);
    this.scene.physics.add.collider(
      this.sprites,
      this.sprites,
      (obj1, obj2) => {
        const sprite1 = obj1 as Sprite;
        const sprite2 = obj2 as Sprite;

        sprite1.touched(sprite2);
        sprite2.touched(sprite1);
      }
    );

    this.scene.cameras.main.startFollow(player);
  }

  // autosaving?
  // onunload? remember to clear any events in the stop method
  getState(): MapState {
    return {
      id: this.id,
      spriteStates: this.sprites.map((sprite) => sprite.getState()),
    };
  }

  save() {
    localStorage.setItem(`map_${this.id}`, JSON.stringify(this.getState()));
  }

  destroy() {
    super.destroy();
    this.sprites.forEach((sprite) => sprite.destroy());
  }

  switchMap(id: string) {
    this.save();
    this.destroy();
    loadMap(this.scene, id);
  }
}
