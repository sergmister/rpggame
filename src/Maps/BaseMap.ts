import "phaser";
import { loadMap } from "src/Maps/maputils";
import type Player from "src/Sprites/Player";
import type Sprite from "src/Sprites/Sprite";
import type { SpriteState } from "src/Sprites/Sprite";
import { loadSprite } from "src/Sprites/spriteutils";

export interface MapState {
  id: string;
  spriteStates: SpriteState[];
  goldCoins: { x: number; y: number }[];
}

export interface MapConstructor {
  new (scene: Phaser.Scene, id: string, state?: MapState): BaseMap;
}

/**
 * an abstract that class that contains all the common logic and data for the maps
 */
export default abstract class BaseMap extends Phaser.Tilemaps.Tilemap {
  id: string;
  sprites: Phaser.GameObjects.Group;
  fences: Phaser.Physics.Arcade.StaticGroup;
  goldCoins: Phaser.Physics.Arcade.Group;
  colliders: Phaser.Physics.Arcade.Collider[];

  // constructs map from state
  constructor(scene: Phaser.Scene, id: string, key: string, state?: MapState) {
    // gets data for the tilemap for phaser
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
    this.goldCoins = this.scene.physics.add.group();
    this.colliders = [];

    // sets the current map for access by game scene when the game is saved
    this.scene.game.registry.set("currentMap", this);

    // creates tilemap

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

    // creates collision layer
    layerc.setCollisionByExclusion([-1]);

    // checks if state was provided
    if (state) {
      // loads sprites from state
      for (const spriteState of state.spriteStates) {
        this.sprites.add(loadSprite(this.scene, spriteState));
      }

      // loads objects from state
      layero.objects.forEach((obj) => {
        if (obj.type === "fence") {
          const fence = this.scene.add.rectangle(obj.x!, obj.y!, 8, 8);
          this.fences.add(fence);
        }
      });
      for (const goldCoin of state.goldCoins) {
        this.goldCoins.add(
          this.scene.add.image(goldCoin.x, goldCoin.y, "goldcoin")
        );
      }
    } else {
      // loads objects from tilemap
      layero.objects.forEach((obj) => {
        switch (obj.type) {
          case "fence":
            const fence = this.scene.add.rectangle(obj.x!, obj.y!, 8, 8);
            this.fences.add(fence);
            break;
          case "gold":
            const goldCoin = this.scene.add.image(obj.x!, obj.y!, "goldcoin");
            this.goldCoins.add(goldCoin);
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

    // creates reference to player sprite
    const player = this.sprites.getMatching("type", "player")[0] as Player;

    // creates physics between sprites and collision tilemap layer
    const collider1 = this.scene.physics.add.collider(this.sprites, layerc);
    const collider2 = this.scene.physics.add.collider(
      this.sprites,
      this.fences
    );
    // calls touched when sprites collide
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
    // picks up gold coin on contact with player
    const collider4 = this.scene.physics.add.overlap(
      player,
      this.goldCoins,
      (obj1, obj2) => {
        const player = obj1 as Player;
        const goldCoin = obj2 as Sprite;

        this.goldCoins.remove(goldCoin, true, true);
        player.globalPlayer.setState({
          gold: player.globalPlayer.state.gold + 5,
        });
      }
    );

    this.colliders.push(collider1, collider2, collider3, collider4);

    // camera follows the player
    this.scene.cameras.main.startFollow(player);
  }

  // returns object representing the map state
  getState(): MapState {
    return {
      id: this.id,
      spriteStates: this.sprites
        .getChildren()
        .map((sprite) => (sprite as Sprite).getState()),
      goldCoins: this.goldCoins.getChildren().map((goldCoin) => ({
        x: (goldCoin as Phaser.GameObjects.Image).x,
        y: (goldCoin as Phaser.GameObjects.Image).y,
      })),
    };
  }

  // saves map state to localStorage
  save() {
    localStorage.setItem(`map_${this.id}`, JSON.stringify(this.getState()));
  }

  // destroys the map removing all created objects
  destroy() {
    this.sprites.destroy(true, true);
    this.fences.destroy(true, true);
    this.goldCoins.destroy(true, true);
    this.colliders.forEach((x) => {
      x.destroy();
    });
    super.destroy();
  }

  // switches the map
  switchMap(id: string) {
    // removes global current map reference
    this.scene.game.registry.set("currentMap", null);
    // saves state
    this.save();
    const scene = this.scene;
    // destroys this map
    this.destroy();
    // load new map
    loadMap(scene, id);
  }
}
