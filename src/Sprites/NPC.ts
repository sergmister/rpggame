import "phaser";
import { getItem } from "src/Items/itemutils";
import type BaseMap from "src/Maps/BaseMap";
import { DialogKey, DialogProps } from "src/Scenes/DialogScene";
import { GameOverKey } from "src/Scenes/GameOverScene";
import { ShopKey, ShopProps } from "src/Scenes/ShopScene";
import type { CharacterState } from "src/Sprites/Character";
import Character from "src/Sprites/Character";
import type Player from "src/Sprites/Player";
import type { NPCProperties, NPCSpeechSection } from "./spriteutils";

export interface NPCState extends CharacterState {
  talkTimer?: number;
  properties?: NPCProperties;
}

/**
 * class for an NPC
 */
export default class NPC extends Character {
  // speech information of the npc
  private speech: NPCSpeechSection[];

  // cooldown for how long to wait until this npc should talk with the player
  protected talkCooldown = 0;
  // talk timer, set to -1 to disable talking with the player
  protected talkTimer = 0;

  // cooldown for facing the player
  protected meetCooldown = 40;
  // meet timer, set to -1 to not face the player
  protected meetTimer = 0;
  // reference to the current meeting character
  protected meetChar?: Character;
  // coordinates of the meeting character on the first interaction, used for the meet timer
  protected meetCharX = 0;
  protected meetCharY = 0;

  // constructs npc from state
  constructor(
    scene: Phaser.Scene,
    texture: string,
    properties: NPCProperties,
    state: NPCState
  ) {
    super(scene, texture, state);

    this.talkTimer = state.talkTimer || this.talkTimer;

    this.speech = state.properties?.speech || properties.speech;

    this.setImmovable(true);
  }

  // runs every frame
  preUpdate(time: number, delta: number) {
    // talk timer decrementer
    if (this.talkTimer > 0) {
      this.talkTimer--;
    }
    // checks if currently meeting
    if (this.meetTimer > 0) {
      // checks if player reference is still valid
      if (this.meetChar) {
        // calculates distance to player from last location
        if (
          Math.hypot(
            Math.abs(this.meetChar.x - this.meetCharX),
            Math.abs(this.meetChar.y - this.meetCharY)
          ) > 32
        ) {
          // decrements if meeting character has moved away
          this.meetTimer--;
        }
      } else {
        // ends meeting if reference if invalid
        this.meetTimer = 0;
      }
    }
    // resets variables and animations at the end of the meeting
    if (this.meetTimer === 0) {
      this.meetChar = undefined;
      this.anims.play(this.last_dir, true);
    }
  }

  // returns the npc state
  getState(): NPCState {
    return {
      ...super.getState(),
      talkTimer: this.talkTimer,
      properties: { speech: this.speech },
    };
  }

  // called when another character touches this
  touched(char: Character) {
    // checks if the character is the player
    if (char.type === "player") {
      if (this.talkTimer === 0) {
        this.talkTimer = this.talkCooldown;
        this.meetTimer = this.meetCooldown;
        this.meetChar = char;
        this.meetCharX = char.x;
        this.meetCharY = char.y;
        this.faceDir(char.x, char.y);
        this.talk(char as Player);
      }
    }
  }

  // function to interact with the player
  async talk(player: Player) {
    // freezes player
    player.frozen = true;

    // list of speech sections to remove
    const toRemove: number[] = [];

    // loops through sections of the speech
    for (let [i, section] of this.speech.entries()) {
      let stopSpeech = false;
      let removeSection = false;

      // switch for possible speech section types
      switch (section.type) {
        case "message":
          stopSpeech = await this.talkMessage(section);
          break;
        case "gift":
          removeSection = await this.talkGift(section, player);
          if (removeSection) {
            toRemove.push(i);
          }
          break;
        case "teleport":
          await this.talkTeleport(section, player);
          break;
        case "shop":
          const boughtItem = await this.talkShop(section);
          // removes item from shop if it is purchased
          if (boughtItem !== undefined) {
            section.shopItems!.splice(boughtItem, 1);
          }
          break;
        case "challenge":
          [stopSpeech, removeSection] = await this.talkChallenge(
            section,
            player
          );
          if (removeSection) {
            this.speech[i] = {
              type: "message",
              message: "You have already defeated me, now go on!",
            };
          }
          break;
        case "win":
          this.talkWin(section, player);
          break;
      }

      if (stopSpeech) {
        break;
      }
    }

    // unfreezes player
    player.frozen = false;

    // removes flagged speech sections
    for (const i of toRemove.reverse()) {
      this.speech.splice(i, 1);
    }

    // removes ability to talk with player if there is no more speech sections
    if (this.speech.length === 0) {
      this.talkTimer = -1;
    }
  }

  // gives the user a dialog with a message
  private async talkMessage(section: NPCSpeechSection): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.scene.scene.launch(DialogKey, {
        text: section.message,
        delay: section.delay,
        callback: (ret, stop) => {
          resolve(stop || false);
        },
      } as DialogProps);
    });
  }

  // teleports the player to another world
  private async talkTeleport(section: NPCSpeechSection, player: Player) {
    // checks if players has the minimum required xp
    if (player.globalPlayer.state.xp >= (section.minxp || 0)) {
      (this.scene.registry.get("currentMap") as BaseMap).switchMap(
        section.message!
      );
    } else {
      return new Promise((resolve, reject) => {
        this.scene.scene.launch(DialogKey, {
          text: "Not enough XP!",
          callback: (ret, stop) => {
            resolve(stop || false);
          },
        } as DialogProps);
      });
    }

    return new Promise((r) => setTimeout(r, 200));
  }

  // launches the shop menu
  // returns the index of any item bought
  private async talkShop(
    section: NPCSpeechSection
  ): Promise<number | undefined> {
    return new Promise((resolve, reject) => {
      this.scene.scene.launch(ShopKey, {
        items: section.shopItems,
        callback: (ret) => {
          resolve(ret);
        },
      } as ShopProps);
    });
  }

  // function for fighting the player
  // returns a boolean for whether to stop the speech and a boolean for whether to remove the section
  private async talkChallenge(
    section: NPCSpeechSection,
    player: Player
  ): Promise<[boolean, boolean]> {
    // setting opponent stats
    let opponentHealth = section.challenge!.health!;
    let opponentPhysicalDamage = section.challenge!.physical_damage;
    let opponentMagicDamage = section.challenge!.magic_damage;
    let opponentPhysicalResistance =
      section.challenge!.physical_resistance || 0;
    let opponentMagicResistance = section.challenge!.magic_damage || 0;

    // setting player stats
    let playerHotbarItems = player.globalPlayer.state.items
      .slice(0, 5)
      .map((x) => getItem(x));
    let playerPhysicalResistance = playerHotbarItems
      .map((x) => x.properties?.physical_resistance || 0)
      .reduce((a, b) => a + b);
    let playerMagicResistance = playerHotbarItems
      .map((x) => x.properties?.magic_resistance || 0)
      .reduce((a, b) => a + b);

    // checks whether player has damage item, ending the fight if the player does not
    let playerHasDamageItem = false;
    playerHotbarItems.forEach((x) => {
      if (x.properties?.physical_damage || x.properties?.magic_damage) {
        playerHasDamageItem = true;
      }
    });
    if (!playerHasDamageItem) {
      await new Promise((resolve, reject) => {
        this.scene.scene.launch(DialogKey, {
          text: "You have no damage item in your hotbar!",
          callback: (ret, stop) => {
            resolve(stop || false);
          },
        } as DialogProps);
      });
      return [true, false];
    }

    // const win: boolean = await new Promise((resolve, reject) => {
    //   this.scene.scene.launch(BattleKey, {
    //     opponent: this,
    //     playerTextureKey: player.texture.key,
    //     opponentTextureKey: this.texture.key,
    //     callback: (win) => {
    //       resolve(win);
    //     },
    //     opponentHealth,
    //     opponentPhysicalDamage,
    //     opponentMagicDamage,
    //     opponentPhysicalResistance,
    //     opponentMagicResistance,
    //     playerPhysicalResistance,
    //     playerMagicResistance,
    //   } as BattleProps);
    // });

    // return [true, false];

    // loops every round of the fight
    while (true) {
      let opponentDamage = 0;
      let opponentDamageType = "";
      // selects random attack type
      if (Math.random() < 0.5 && opponentPhysicalDamage) {
        opponentDamage = this.resistanceFormula(
          opponentPhysicalDamage,
          playerPhysicalResistance
        );
        opponentDamageType = "physical";
      } else {
        opponentDamage = this.resistanceFormula(
          opponentMagicDamage!,
          playerMagicResistance
        );
        opponentDamageType = "magic";
      }

      await new Promise((resolve, reject) => {
        this.scene.scene.launch(DialogKey, {
          text: `Opponent did ${opponentDamage} ${opponentDamageType} damage!`,
          callback: (ret, stop) => {
            resolve(stop || false);
          },
        } as DialogProps);
      });

      // applies damage to player
      player.globalPlayer.setState({
        health: this.roundNum(
          player.globalPlayer.state.health - opponentDamage
        ),
      });

      // checks if player has died
      if (player.globalPlayer.state.health <= 0) {
        await new Promise((resolve, reject) => {
          this.scene.scene.launch(DialogKey, {
            text: "You died!",
            callback: (ret, stop) => {
              resolve(stop || false);
            },
          } as DialogProps);
        });
        this.scene.scene.launch(GameOverKey, { win: false });
        this.scene.scene.switch(GameOverKey);
        return [true, false];
      }

      let playerDamage = 0;
      let playerDamageType = "";

      // loops until the player has selected a damage item
      while (true) {
        await new Promise((resolve, reject) => {
          this.scene.scene.launch(DialogKey, {
            text: "Select an item from your hotbar then click to use the item.",
            callback: (ret, stop) => {
              resolve(stop || false);
            },
          } as DialogProps);
        });

        // gets the selected item from the hotbar
        const selectedItem = getItem(
          player.globalPlayer.state.items[
            player.globalPlayer.state.selectedItem
          ]
        );

        // checks if the item is a damage item
        if (selectedItem.properties?.physical_damage) {
          playerDamage = this.resistanceFormula(
            selectedItem.properties.physical_damage,
            opponentPhysicalResistance
          );
          playerDamageType = "physcial";
        } else if (selectedItem.properties?.magic_damage) {
          playerDamage = this.resistanceFormula(
            selectedItem.properties.magic_damage,
            opponentMagicResistance
          );
          playerDamageType = "magic";
        }

        // uses damage item if one is selected
        if (playerDamageType !== "") {
          await new Promise((resolve, reject) => {
            this.scene.scene.launch(DialogKey, {
              text: `You did ${playerDamage} ${playerDamageType} damage!\n\nOpponent has ${(opponentHealth = this.roundNum(
                opponentHealth - playerDamage
              ))} health.`,
              callback: (ret, stop) => {
                resolve(stop || false);
              },
            } as DialogProps);
          });
          break;
        }

        // checks if item is a health item
        if (
          selectedItem.properties?.health &&
          player.globalPlayer.state.health < player.globalPlayer.state.maxHealth
        ) {
          // gets the selected item from the hotbar
          player.globalPlayer.state.items[
            player.globalPlayer.state.items.findIndex(
              (x) => x === selectedItem.name
            )
          ] = "null";
          // applies health effects
          player.globalPlayer.setState({
            health: Math.min(
              player.globalPlayer.state.maxHealth,
              player.globalPlayer.state.health + selectedItem.properties.health
            ),
          });
        }
        if (selectedItem.properties?.max_health) {
          // gets the selected item from the hotbar
          player.globalPlayer.state.items[
            player.globalPlayer.state.items.findIndex(
              (x) => x === selectedItem.name
            )
          ] = "null";
          // applies health effects
          player.globalPlayer.setState({
            maxHealth:
              player.globalPlayer.state.maxHealth +
              selectedItem.properties.max_health,
            health:
              player.globalPlayer.state.health +
              selectedItem.properties.max_health,
          });
        }
      }

      // checks if the opponent has died
      if (opponentHealth <= 0) {
        section = {
          type: "message",
          message: "You have already defeated me, now go on.",
        };
        return [false, true];
      }
    }

    return [true, false];
  }

  // function for gifting the player
  // returns a boolean whether the gift was entirely taken
  private async talkGift(
    section: NPCSpeechSection,
    player: Player
  ): Promise<boolean> {
    let empty = true;

    await new Promise((resolve, reject) => {
      this.scene.scene.launch(DialogKey, {
        text: section.message,
        delay: section.delay,
        callback: (ret, stop) => {
          resolve(stop || false);
        },
      } as DialogProps);
    });

    // gives any gold
    if (section.gift!.gold) {
      player.globalPlayer.setState({
        gold: player.globalPlayer.state.gold + section.gift!.gold,
      });
      section.gift!.gold = undefined;
    }

    // gives any xp
    if (section.gift!.xp) {
      player.globalPlayer.setState({
        xp: player.globalPlayer.state.xp + section.gift!.xp,
      });
      section.gift!.xp = undefined;
    }

    // gives any xp
    if (section.gift!.item) {
      // checks if player has the inventory space required
      if (player.globalPlayer.giveItem(section.gift!.item)) {
        section.gift!.item = undefined;
      } else {
        empty = false;

        await new Promise((resolve, reject) => {
          this.scene.scene.launch(DialogKey, {
            text: `No inventory space to recive the ${section.gift!.item}.`,
            callback: (ret, stop) => {
              resolve(stop || false);
            },
          } as DialogProps);
        });
      }
    }

    return empty;
  }

  // ends the game with a player victory
  private async talkWin(section: NPCSpeechSection, player: Player) {
    // checks if player has required xp
    if (player.globalPlayer.state.xp >= (section.minxp || 0)) {
      // launches game over scene
      this.scene.scene.launch(GameOverKey, { win: true });
      this.scene.scene.switch(GameOverKey);
    } else {
      return new Promise((resolve, reject) => {
        this.scene.scene.launch(DialogKey, {
          text: "Not enough XP!",
          callback: (ret, stop) => {
            resolve(stop || false);
          },
        } as DialogProps);
      });
    }

    return new Promise((r) => setTimeout(r, 200));
  }

  // calculates damage after resistance
  private resistanceFormula(damage: number, resistance: number): number {
    return this.roundNum(damage * (40 / (40 + resistance)));
  }

  // rounds to the nearest tenth
  private roundNum(num: number): number {
    return Math.round(num * 10) / 10;
  }
}
