import "phaser";

export interface Item {
  name: string;
  index: number;
  desription?: string;
  properties?: {
    physical_damage?: number;
    magic_damage?: number;
    physical_resistance?: number;
    magic_resistance?: number;
    health?: number;
    max_health?: number;
  };
}

export const itemList: Item[] = [
  { name: "null", index: 15 },
  {
    name: "wooden sword",
    index: 80,
    desription: "wooden sword\n\nphysical damage: 10",
    properties: { physical_damage: 10 },
  },
  {
    name: "stone sword",
    index: 81,
    desription: "stone sword\n\nphysical damage: 20",
    properties: { physical_damage: 20 },
  },
  {
    name: "iron sword",
    index: 82,
    desription: "iron sword\n\nphysical damage: 30",
    properties: { physical_damage: 30 },
  },
  {
    name: "red orb",
    index: 288,
    desription: "red orb\n\nmagic damage: 10",
    properties: { magic_damage: 10 },
  },
  {
    name: "blue orb",
    index: 289,
    desription: "red orb\n\nmagic damage: 20",
    properties: { magic_damage: 20 },
  },
  {
    name: "green orb",
    index: 290,
    desription: "red orb\n\nmagic damage: 30",
    properties: { magic_damage: 30 },
  },
  {
    name: "leather chestplate",
    index: 118,
    desription: "lether chestplate\n\nphysical resistance: 10",
    properties: { physical_resistance: 10 },
  },
  {
    name: "leather helmet",
    index: 114,
    desription: "lether helmet\n\nphysical resistance: 10",
    properties: { physical_resistance: 10 },
  },
  {
    name: "iron chestplate",
    index: 116,
    desription: "iron chestplate\n\nphysical resistance: 20",
    properties: { physical_resistance: 20 },
  },
  {
    name: "iron helmet",
    index: 113,
    desription: "iron helmet\n\nphysical resistance: 20",
    properties: { physical_resistance: 20 },
  },
  {
    name: "red book",
    index: 209,
    desription: "red book\n\nmagic resistance: 10",
    properties: { magic_resistance: 10 },
  },
  {
    name: "blue book",
    index: 208,
    desription: "blue book\n\nmagic resistance: 20",
    properties: { magic_resistance: 20 },
  },
  {
    name: "red health potion",
    index: 144,
    desription: "health potion\n\nhealth: 20",
    properties: { health: 20 },
  },
  {
    name: "blue health potion",
    index: 145,
    desription: "health potion\n\nhealth: 40",
    properties: { health: 40 },
  },
  {
    name: "red max health potion",
    index: 148,
    desription: "health potion\n\nhealth: 10",
    properties: { max_health: 10 },
  },
  {
    name: "blue max health potion",
    index: 149,
    desription: "health potion\n\nhealth: 20",
    properties: { max_health: 20 },
  },
];

// function for getting an item from a string ID
export function getItem(name: string): Item {
  let item = itemList.find((x) => x.name === name);
  if (!item) {
    item = itemList[0];
  }
  return item;
}

export const itemRecipes: { in: string[]; out: string }[] = [
  { in: ["wooden sword", "wooden sword"], out: "stone sword" },
];
