import "phaser";

import Character from "src/Sprites/Character";
import type { CharacterState } from "src/Sprites/Character";
import type Player from "src/Sprites/Player";
import { DialogKey, DialogProps } from "src/Scenes/DialogScene";
import type { NPCProperties, NPCSpeachSection } from "./spriteutils";
import type BaseMap from "src/Maps/BaseMap";
import { ShopKey, ShopProps } from "src/Scenes/ShopScene";
import { getItem } from "src/Items/itemutils";
import { GameOverKey, GameOverProps } from "src/Scenes/GameOverScene";

export interface NPCState extends CharacterState {
  talkTimer?: number;
  properties?: NPCProperties;
}

export default class NPC extends Character {
  private speach: NPCSpeachSection[];

  protected talkCooldown = 0;
  protected talkTimer = 0; //-1;

  protected meetCooldown = 40;
  protected meetTimer = 0;
  protected meetChar?: Character;
  protected meetCharX = 0;
  protected meetCharY = 0;

  constructor(
    scene: Phaser.Scene,
    texture: string,
    properties: NPCProperties,
    state: NPCState
  ) {
    super(scene, texture, state);

    this.talkTimer = state.talkTimer || this.talkTimer;

    this.speach = state.properties?.speach || properties.speach;

    this.setImmovable(true);
  }

  preUpdate(time: number, delta: number) {
    if (this.talkTimer > 0) {
      this.talkTimer--;
    }
    if (this.meetTimer > 0) {
      if (this.meetChar) {
        if (
          Math.hypot(
            Math.abs(this.meetChar.x - this.meetCharX),
            Math.abs(this.meetChar.y - this.meetCharY)
          ) > 32
        ) {
          this.meetTimer--;
        }
      } else {
        this.meetTimer = 0;
      }
    }
    if (this.meetTimer === 0) {
      this.meetChar = undefined;
      this.anims.play(this.last_dir, true);
    }
  }

  getState(): NPCState {
    return {
      ...super.getState(),
      talkTimer: this.talkTimer,
      properties: { speach: this.speach },
    };
  }

  touched(char: Character) {
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

  async talk(player: Player) {
    // replace frozen with pause scene?
    player.frozen = true;
    for (let i = 0; i < this.speach.length; i++) {
      let section = this.speach[i];
      let stopSpeach = false;
      switch (section.type) {
        case "message":
          stopSpeach = await this.talkMessage(section);
          break;
        case "gift":
          await this.talkGift(section, player);
          break;
        case "teleport":
          await this.talkTeleport(section, player);
          break;
        case "shop":
          const boughtItem = await this.talkShop(section);
          if (boughtItem !== undefined) {
            section.shopItems!.splice(boughtItem, 1);
          }
          break;
        case "challenge":
          let removeSection;
          [stopSpeach, removeSection] = await this.talkChallenge(
            section,
            player
          );
          if (removeSection) {
            this.speach[i] = {
              type: "message",
              message: "You have already defeated me, now go on!",
            };
          }
          break;
        case "win":
          this.talkWin(section, player);
          break;
      }
      if (stopSpeach) {
        break;
      }
    }
    player.frozen = false;
  }

  private async talkMessage(section: NPCSpeachSection): Promise<boolean> {
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

  private async talkTeleport(section: NPCSpeachSection, player: Player) {
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

  private async talkShop(
    section: NPCSpeachSection
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

  private async talkChallenge(
    section: NPCSpeachSection,
    player: Player
  ): Promise<[boolean, boolean]> {
    let opponentHealth = section.challenge!.health!;
    let opponentPhysicalDamage = section.challenge!.physical_damage;
    let opponentMagicDamage = section.challenge!.magic_damage;
    let opponentPhysicalResistance =
      section.challenge!.physical_resistance || 0;
    let opponentMagicResistance = section.challenge!.magic_damage || 0;

    let playerHotbarItems = player.globalPlayer.state.items
      .slice(0, 5)
      .map((x) => getItem(x));
    let playerPhysicalResistance = playerHotbarItems
      .map((x) => x.properties?.physical_resistance || 0)
      .reduce((a, b) => a + b);
    let playerMagicResistance = playerHotbarItems
      .map((x) => x.properties?.magic_resistance || 0)
      .reduce((a, b) => a + b);

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

    while (true) {
      let opponentDamage = 0;
      let opponentDamageType = "";
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

      player.globalPlayer.setState({
        health: this.roundNum(
          player.globalPlayer.state.health - opponentDamage
        ),
      });
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
      while (true) {
        await new Promise((resolve, reject) => {
          this.scene.scene.launch(DialogKey, {
            text: "Select an item from your hotbar then click to use the item.",
            callback: (ret, stop) => {
              resolve(stop || false);
            },
          } as DialogProps);
        });
        const selectedItem = getItem(
          player.globalPlayer.state.items[
            player.globalPlayer.state.selectedItem
          ]
        );
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

        if (
          selectedItem.properties?.health &&
          player.globalPlayer.state.health < player.globalPlayer.state.maxHealth
        ) {
          player.globalPlayer.state.items[
            player.globalPlayer.state.items.findIndex(
              (x) => x === selectedItem.name
            )
          ] = "null";
          player.globalPlayer.setState({
            health: Math.min(
              player.globalPlayer.state.maxHealth,
              player.globalPlayer.state.health + selectedItem.properties.health
            ),
          });
        }
        if (selectedItem.properties?.max_health) {
          player.globalPlayer.state.items[
            player.globalPlayer.state.items.findIndex(
              (x) => x === selectedItem.name
            )
          ] = "null";
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

  private async talkGift(section: NPCSpeachSection, player: Player) {
    await new Promise((resolve, reject) => {
      this.scene.scene.launch(DialogKey, {
        text: section.message,
        delay: section.delay,
        callback: (ret, stop) => {
          resolve(stop || false);
        },
      } as DialogProps);
    });
    if (section.gift!.gold) {
      player.globalPlayer.setState({
        gold: player.globalPlayer.state.gold + section.gift!.gold,
      });
      section.gift!.gold = undefined;
    }
    if (section.gift!.xp) {
      player.globalPlayer.setState({
        xp: player.globalPlayer.state.xp + section.gift!.xp,
      });
      section.gift!.xp = undefined;
    }
    if (section.gift!.item) {
      if (player.globalPlayer.giveItem(section.gift!.item)) {
        section.gift!.item = undefined;
      } else {
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
  }

  private talkWin(section: NPCSpeachSection, player: Player) {
    if (player.globalPlayer.state.xp >= (section.minxp || 0)) {
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

  private resistanceFormula(damage: number, resistance: number): number {
    return this.roundNum(damage * (40 / (40 + resistance)));
  }

  private roundNum(num: number): number {
    return Math.round(num * 10) / 10;
  }
}
