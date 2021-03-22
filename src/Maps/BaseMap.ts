import "phaser";

import { loadMap } from "src/Maps/maputils";
import { loadSprite } from "src/Sprites/spriteutils";

import type Sprite from "src/Sprites/Sprite";
import type { SpriteState } from "src/Sprites/Sprite";
import type Player from "src/Sprites/Player";

export interface MapState {
  id: string;
  spriteStates: SpriteState[];
  goldcoins: { x: number; y: number }[];
}

export interface MapConstructor {
  new (scene: Phaser.Scene, id: string, state?: MapState): BaseMap;
}

/**
 * an abstract that class that constains all the common logic and data for the maps
 */
export default abstract class BaseMap extends Phaser.Tilemaps.Tilemap {
  id: string;
  sprites: Phaser.GameObjects.Group;
  fences: Phaser.Physics.Arcade.StaticGroup;
  goldcoins: Phaser.Physics.Arcade.Group;
  colliders: Phaser.Physics.Arcade.Collider[];

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
    this.sprites = this.scene.add.group();
    this.fences = this.scene.physics.add.staticGroup();
    this.goldcoins = this.scene.physics.add.group();
    this.colliders = [];

    this.scene.game.registry.set("currentMap", this);

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

    if (state) {
      for (const spriteState of state.spriteStates) {
        this.sprites.add(loadSprite(this.scene, spriteState));
      }
      layero.objects.forEach((obj) => {
        if (obj.type === "fence") {
          const fence = this.scene.add.rectangle(obj.x!, obj.y!, 8, 8);
          this.fences.add(fence);
        }
      });
      for (const goldcoin of state.goldcoins) {
        this.goldcoins.add(
          this.scene.add.image(goldcoin.x, goldcoin.y, "goldcoin")
        );
      }
    } else {
      layero.objects.forEach((obj) => {
        switch (obj.type) {
          case "fence":
            const fence = this.scene.add.rectangle(obj.x!, obj.y!, 8, 8);
            this.fences.add(fence);
            break;
          case "gold":
            const goldcoin = this.scene.add.image(obj.x!, obj.y!, "goldcoin");
            this.goldcoins.add(goldcoin);
            break;
          default:
            this.sprites.add(
              loadSprite(this.scene, {
                name: obj.name,
                type: obj.type,
                x: obj.x || 0,
                y: obj.y || 0,
              })
            );
            break;
        }
      });
    }

    const player = this.sprites.getMatching("type", "player")[0] as Player;

    // filter out sprites based on collision property?
    const collider1 = this.scene.physics.add.collider(this.sprites, layerc);
    const collider2 = this.scene.physics.add.collider(
      this.sprites,
      this.fences
    );
    const collider3 = this.scene.physics.add.collider(
      this.sprites,
      this.sprites,
      (obj1, obj2) => {
        const sprite1 = obj1 as Sprite;
        const sprite2 = obj2 as Sprite;

        sprite1.touched(sprite2);
        sprite2.touched(sprite1);
      }
    );
    const collider4 = this.scene.physics.add.overlap(
      player,
      this.goldcoins,
      (obj1, obj2) => {
        const player = obj1 as Player;
        const goldcoin = obj2 as Sprite;

        this.goldcoins.remove(goldcoin, true, true);
        player.globalPlayer.setState({
          gold: player.globalPlayer.state.gold + 5,
        });
      }
    );

    this.colliders.push(collider1, collider2, collider3, collider4);

    this.scene.cameras.main.startFollow(player);
  }

  getState(): MapState {
    return {
      id: this.id,
      spriteStates: this.sprites
        .getChildren()
        .map((sprite) => (sprite as Sprite).getState()),
      goldcoins: this.goldcoins.getChildren().map((goldcoin) => ({
        x: (goldcoin as Phaser.GameObjects.Image).x,
        y: (goldcoin as Phaser.GameObjects.Image).y,
      })),
    };
  }

  save() {
    localStorage.setItem(`map_${this.id}`, JSON.stringify(this.getState()));
  }

  destroy() {
    this.sprites.destroy(true, true);
    this.fences.destroy(true, true);
    this.goldcoins.destroy(true, true);
    this.colliders.forEach((x) => {
      x.destroy();
    });
    super.destroy();
  }

  switchMap(id: string) {
    this.scene.game.registry.set("currentMap", null);
    this.save();
    const scene = this.scene;
    this.destroy();
    loadMap(scene, id);
  }
}
