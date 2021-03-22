import "phaser";

import type BaseMap from "src/Maps/BaseMap";

import type Sprite from "src/Sprites/Sprite";
import type { SpriteState } from "src/Sprites/Sprite";

import Player from "src/Sprites/Player";
import NPC from "src/Sprites/NPC";

export interface NPCSpeachSection {
  type: string;
  message?: string;
  minxp?: number;
  shopItems?: { name: string; price: number }[];
  gift?: {
    item?: string;
    gold?: number;
    xp?: number;
  };
  challenge?: {
    health: number;
    physical_damage?: number;
    magic_damage?: number;
    physical_resistance?: number;
    magic_resistance?: number;
  };
  delay?: number;
}

export interface NPCProperties {
  speach: NPCSpeachSection[];
}

export interface NPCData {
  type: string;
  texture: string;
  properties: NPCProperties;
}

const npclist: NPCData[] = [
  {
    type: "intro talker 1",
    texture: "Male_02-1",
    properties: {
      speach: [
        {
          type: "message",
          message:
            "Welcome traveller! Click to be teleported to the next world.",
        },
        {
          type: "teleport",
          message: "home",
        },
      ],
    },
  },
  {
    type: "home talker 1",
    texture: "Male_03-1",
    properties: {
      speach: [
        {
          type: "message",
          message: "Explore around!",
        },
      ],
    },
  },
  {
    type: "home talker 2",
    texture: "Male_04-1",
    properties: {
      speach: [
        {
          type: "message",
          message:
            "Welcome traveller! Click to be teleported to the next world.\n\nRequired XP: 25",
        },
        {
          type: "teleport",
          message: "desert",
          minxp: 25,
        },
      ],
    },
  },
  {
    type: "home gifter 1",
    texture: "Male_05-1",
    properties: {
      speach: [
        {
          type: "gift",
          message: "A magical gift for you my friend!",
          gift: {
            item: "red book",
            xp: 5,
          },
        },
        {
          type: "gift",
          message: "A leather helmet",
          gift: {
            item: "leather helmet",
          },
        },
      ],
    },
  },
  {
    type: "home shopkeeper 1",
    texture: "Male_06-1",
    properties: {
      speach: [
        {
          type: "message",
          message: "Welcome to the home shop!",
        },
        {
          type: "shop",
          shopItems: [
            { name: "leather chestplate", price: 2.5 },
            { name: "red max health potion", price: 2.5 },
            { name: "wooden sword", price: 10 },
            { name: "red health potion", price: 5 },
            { name: "red health potion", price: 5 },
          ],
        },
      ],
    },
  },
  {
    type: "home challenger 1",
    texture: "Enemy_01-1",
    properties: {
      speach: [
        {
          type: "message",
          message:
            "Hello, opponent!\n\nhealth: 50\nphysical damage: 18\nmagic damage: 18\nphysical resistance: 5\nmagic resistance: 5",
        },
        {
          type: "message",
          message:
            "The items in your hotbar will be used for the fight. (press e to open the your inventory, press 1, 2, 3, 4, 5 to select items)",
          delay: 500,
        },
        {
          type: "message",
          message:
            "Click to fight, or press escape to leave.\n\nhealth: 50\nphysical damage: 18\nmagic damage: 18\nphysical resistance: 5\nmagic resistance: 5",
        },
        {
          type: "challenge",
          challenge: {
            health: 50,
            physical_damage: 18,
            magic_damage: 18,
            physical_resistance: 5,
            magic_resistance: 5,
          },
        },
        {
          type: "message",
          message: "You have defeated me!\n\nWell done worthy opponent!",
        },
        {
          type: "gift",
          message: "You have recived 30 gold and 20 xp!",
          gift: {
            gold: 30,
            xp: 20,
          },
        },
      ],
    },
  },
  {
    type: "desert talker 1",
    texture: "Male_07-1",
    properties: {
      speach: [
        {
          type: "message",
          message:
            "Welcome traveller! Click to be teleported to the next world.\n\nRequired XP: 80",
        },
        {
          type: "teleport",
          message: "cave",
          minxp: 80,
        },
      ],
    },
  },
  {
    type: "desert shopkeeper 1",
    texture: "Male_08-1",
    properties: {
      speach: [
        {
          type: "message",
          message: "Welcome to the desert shop!",
        },
        {
          type: "shop",
          shopItems: [
            { name: "stone sword", price: 10 },
            { name: "blue orb", price: 10 },
            { name: "blue book", price: 10 },
            { name: "iron chestplate", price: 10 },
            { name: "blue health potion", price: 5 },
            { name: "blue health potion", price: 5 },
            { name: "blue health potion", price: 5 },
            { name: "red max health potion", price: 5 },
            { name: "red max health potion", price: 5 },
          ],
        },
      ],
    },
  },
  {
    type: "desert challenger 1",
    texture: "Enemy_04-1",
    properties: {
      speach: [
        {
          type: "message",
          message:
            "Hello, opponent!\n\nhealth: 50\nphysical damage: 30\nmagic damage: 10\nphysical resistance: 50\nmagic resistance: 10",
        },
        {
          type: "message",
          message:
            "Click to fight, or press escape to leave.\n\nhealth: 50\nphysical damage: 30\nmagic damage: 10\nphysical resistance: 50\nmagic resistance: 10",
        },
        {
          type: "challenge",
          challenge: {
            health: 60,
            physical_damage: 30,
            magic_damage: 10,
            physical_resistance: 50,
            magic_resistance: 10,
          },
        },
        {
          type: "message",
          message: "You have defeated me!\n\nWell done worthy opponent!",
        },
        {
          type: "gift",
          message: "You have recived 30 gold and 30 xp!",
          gift: {
            gold: 30,
            xp: 30,
          },
        },
      ],
    },
  },
  {
    type: "desert challenger 2",
    texture: "Enemy_02-1",
    properties: {
      speach: [
        {
          type: "message",
          message:
            "Hello, opponent!\n\nhealth: 50\nphysical damage: 5\nmagic damage: 25\nphysical resistance: 10\nmagic resistance: 40",
        },
        {
          type: "message",
          message:
            "Click to fight, or press escape to leave.\n\nhealth: 50\nphysical damage: 5\nmagic damage: 25\nphysical resistance: 10\nmagic resistance: 40",
        },
        {
          type: "challenge",
          challenge: {
            health: 50,
            physical_damage: 5,
            magic_damage: 25,
            physical_resistance: 10,
            magic_resistance: 40,
          },
        },
        {
          type: "message",
          message: "You have defeated me!\n\nWell done worthy opponent!",
        },
        {
          type: "gift",
          message: "You have recived 30 gold and 30 xp!",
          gift: {
            gold: 30,
            xp: 30,
          },
        },
      ],
    },
  },
  {
    type: "cave talker 1",
    texture: "Male_09-1",
    properties: {
      speach: [
        {
          type: "message",
          message: "Click win the game!\n\nRequired XP: 150",
        },
        {
          type: "win",
          minxp: 150,
        },
      ],
    },
  },
  {
    type: "cave gifter 1",
    texture: "Male_10-1",
    properties: {
      speach: [
        {
          type: "gift",
          message: "A iron sword for you!",
          gift: {
            item: "iron sword",
            xp: 5,
          },
        },
      ],
    },
  },
  {
    type: "cave shopkeeper 1",
    texture: "Male_11-1",
    properties: {
      speach: [
        {
          type: "message",
          message: "Welcome to the cave shop!",
        },
        {
          type: "shop",
          shopItems: [
            { name: "green orb", price: 10 },
            { name: "iron helmet", price: 10 },
            { name: "blue book", price: 10 },
            { name: "red health potion", price: 5 },
            { name: "blue health potion", price: 5 },
            { name: "blue health potion", price: 5 },
            { name: "blue health potion", price: 5 },
            { name: "blue max health potion", price: 10 },
          ],
        },
      ],
    },
  },
  {
    type: "cave challenger 1",
    texture: "Enemy_05-1",
    properties: {
      speach: [
        {
          type: "message",
          message:
            "Hello, opponent!\n\nhealth: 60\nphysical damage: 30\nmagic damage: 15\nphysical resistance: 60\nmagic resistance: 10",
        },
        {
          type: "message",
          message:
            "Click to fight, or press escape to leave.\n\nhealth: 60\nphysical damage: 30\nmagic damage: 15\nphysical resistance: 60\nmagic resistance: 10",
        },
        {
          type: "challenge",
          challenge: {
            health: 60,
            physical_damage: 30,
            magic_damage: 15,
            physical_resistance: 60,
            magic_resistance: 10,
          },
        },
        {
          type: "message",
          message: "You have defeated me!\n\nWell done worthy opponent!",
        },
        {
          type: "gift",
          message: "You have recived 30 gold and 30 xp!",
          gift: {
            gold: 30,
            xp: 30,
          },
        },
      ],
    },
  },
  {
    type: "cave challenger 2",
    texture: "Enemy_09-1",
    properties: {
      speach: [
        {
          type: "message",
          message:
            "Hello, opponent!\n\nhealth: 60\nphysical damage: 15\nmagic damage: 30\nphysical resistance: 10\nmagic resistance: 60",
        },
        {
          type: "message",
          message:
            "Click to fight, or press escape to leave.\n\nhealth: 60\nphysical damage: 15\nmagic damage: 30\nphysical resistance: 10\nmagic resistance: 60",
        },
        {
          type: "challenge",
          challenge: {
            health: 60,
            physical_damage: 15,
            magic_damage: 30,
            physical_resistance: 10,
            magic_resistance: 60,
          },
        },
        {
          type: "message",
          message: "You have defeated me!\n\nWell done worthy opponent!",
        },
        {
          type: "gift",
          message: "You have recived 30 gold and 30 xp!",
          gift: {
            gold: 30,
            xp: 30,
          },
        },
      ],
    },
  },
];

// function to load a sprite from the specifed sprite type and data
export function loadSprite(
  scene: Phaser.Scene,
  spriteState: SpriteState
): Sprite {
  if (spriteState.type === "player") {
    return new Player(scene, spriteState);
  }

  let npc = npclist.find((x) => x.type === spriteState.type)!;
  if (!npc) {
    console.warn(`No sprite for ${spriteState.type}`);
  }
  return new NPC(scene, npc.texture, npc.properties, spriteState);
}
