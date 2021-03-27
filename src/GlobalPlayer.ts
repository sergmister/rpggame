import { EE } from "src/main";
import type { HotbarData } from "src/Scenes/HotbarScene";

export interface GlobalPlayerState {
  name: string;
  currentMapID: string;
  maxHealth: number;
  health: number;
  xp: number;
  gold: number;
  items: string[];
  selectedItem: number;
}

/**
 * class that contains all the data and logic required for the player that is not for the graphics
 * this class is singleton and is only loaded once per game in the game scene
 */
export default class GlobalPlayer {
  state: GlobalPlayerState;

  constructor() {
    const state = localStorage.getItem("GlobalPlayerState");
    if (state) {
      this.state = JSON.parse(state);
    } else {
      this.state = {
        name: "storm",
        currentMapID: "intro",
        maxHealth: 100,
        health: 100,
        xp: 0,
        gold: 0,
        items: new Array<string>(20).fill("null"),
        selectedItem: 0,
      };
    }
  }

  // saves the state of the player to localStorage
  save() {
    localStorage.setItem("GlobalPlayerState", JSON.stringify(this.state));
  }

  // sets the updated state of the player and emits an event to notify listeners that need to update
  setState(state: Partial<GlobalPlayerState>) {
    Object.assign(this.state, state);
    EE.emit("updateGlobalPlayerState");
  }

  // returns the data needed to render the hotbar
  getHotbarData(): HotbarData {
    return {
      maxHealth: this.state.maxHealth,
      health: this.state.health,
      xp: this.state.xp,
      gold: this.state.gold,
      items: this.state.items.slice(0, 5),
      selectedItem: this.state.selectedItem,
    };
  }

  // gives the player an item
  // returns true if successful, else returns false
  giveItem(name: string): boolean {
    for (let i = 0; i < 20; i++) {
      if (this.state.items[i] === "null") {
        this.state.items[i] = name;
        this.setState({});
        return true;
      }
    }
    return false;
  }
}
