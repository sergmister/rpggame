import "phaser";

import { EE } from "src/main";

import { getItem } from "src/Items/itemutils";
import type GlobalPlayer from "src/GlobalPlayer";

export interface HotbarData {
  maxHealth: number;
  health: number;
  xp: number;
  gold: number;
  items: string[];
  selectedItem: number;
}

type numKeys = {
  one: Phaser.Input.Keyboard.Key;
  two: Phaser.Input.Keyboard.Key;
  three: Phaser.Input.Keyboard.Key;
  four: Phaser.Input.Keyboard.Key;
  five: Phaser.Input.Keyboard.Key;
};

export const HotbarKey = "Hotbar";

/**
 * renders the hotbar for the player
 */
export class HotbarScene extends Phaser.Scene {
  private centerX = 0;
  private centerY = 0;

  private container?: Phaser.GameObjects.Container;

  private player?: GlobalPlayer;

  private prevHotbarData?: HotbarData;

  private keys?: numKeys;

  constructor() {
    super({ key: HotbarKey });
  }

  create() {
    this.player = this.registry.get("GlobalPlayer");

    this.container = this.add.container(this.centerX, this.centerY);

    this.draw(this.player?.getHotbarData());

    this.scale.on("resize", this.resizeCallback, this);
    this.resizeCallback();

    EE.on(
      "updateGlobalPlayerState",
      () => {
        this.updateDraw(this.player?.getHotbarData());
      },
      this
    );

    const { ONE, TWO, THREE, FOUR, FIVE } = Phaser.Input.Keyboard.KeyCodes;
    this.keys = this.input.keyboard.addKeys({
      one: ONE,
      two: TWO,
      three: THREE,
      four: FOUR,
      five: FIVE,
    }) as numKeys;
  }

  update() {
    if (!this.keys) return;
    let selected = this.player?.state.selectedItem;
    switch (true) {
      case this.keys.one.isDown:
        selected = 0;
        break;
      case this.keys.two.isDown:
        selected = 1;
        break;
      case this.keys.three.isDown:
        selected = 2;
        break;
      case this.keys.four.isDown:
        selected = 3;
        break;
      case this.keys.five.isDown:
        selected = 4;
        break;
    }

    if (selected !== this.player?.state.selectedItem) {
      this.player?.setState({ selectedItem: selected });
    }
  }

  private draw(hotbarData: HotbarData | undefined) {
    if (this.container) {
      this.container.removeAll(true);
      if (hotbarData) {
        this.prevHotbarData = hotbarData;

        const slotWidth = 72;
        const slotHeight = 72;

        const background = this.add.graphics().setName("background");
        background.fillStyle(0x444444, 0.5);
        background.fillRoundedRect(-268, -72, 2 * 268, 120, 24);
        this.container.add(background);

        for (let i = 0; i < 5; i++) {
          const hotbarItem = this.add
            .image(
              slotWidth * i - slotWidth * 2,
              2,
              "icons_inventory",
              getItem(hotbarData.items[i]).index
            )
            .setScale(i === hotbarData.selectedItem ? 2.25 : 2)
            .setName(`hotbarItem_${i}`);
          this.container.add(hotbarItem);

          const hotbarItemNumber = this.add
            .text(
              slotWidth * i - slotWidth * 2 - slotWidth / 2 + 12,
              8 - slotHeight / 2,
              `${i + 1}`
            )
            .setName(`hotbarItemNumber_${i}`);
          this.container.add(hotbarItemNumber);
        }

        const HPText = this.add
          .text(-164, -64, "HP:", {
            fontSize: "24px",
            color: "black",
            fontStyle: "bold",
          })
          .setName("HPText");
        this.container.add(HPText);

        const healthBarX = -120;
        const healthBarY = -62;
        const health = Math.max(
          0,
          Math.min(1, hotbarData.health / hotbarData.maxHealth)
        );
        const healthBar = this.add.graphics().setName("healthBar");
        healthBar.fillStyle(0x000000, 1);
        healthBar.fillRect(healthBarX, healthBarY, 284, 24);
        healthBar.fillStyle(
          this.rgbToHex(255 * (1 - health), 255 * health, 0),
          1
        );
        healthBar.fillRect(healthBarX + 2, healthBarY + 2, 280 * health, 20);
        this.container.add(healthBar);

        const healthBarText = this.add
          .text(
            healthBarX + 284 / 2,
            healthBarY + 24 / 2,
            `${Math.round(hotbarData.health)}/${Math.round(
              hotbarData.maxHealth
            )}`,
            {
              color: "blue",
            }
          )
          .setOrigin(0.5, 0.5)
          .setName("healthBarText");
        this.container.add(healthBarText);

        const xpHeader = this.add
          .text(-256, -50, "XP", {
            fontSize: "20px",
            color: "lightgreen",
            fontStyle: "bold",
          })
          .setName("xpHeader");
        this.container.add(xpHeader);

        const goldHeader = this.add
          .text(-256, -8, "Gold", {
            fontSize: "20px",
            color: "gold",
            fontStyle: "bold",
          })
          .setName("goldHeader");
        this.container.add(goldHeader);

        const xpText = this.add
          .text(-256, -30, `${hotbarData.xp}`, {
            fontSize: "18px",
            color: "lightgreen",
            fontStyle: "bold",
          })
          .setName("xpText");
        this.container.add(xpText);

        const goldText = this.add
          .text(-256, 12, `${hotbarData.gold}`, {
            fontSize: "18px",
            color: "gold",
            fontStyle: "bold",
          })
          .setName("goldText");
        this.container.add(goldText);
      }
    }
  }

  private updateDraw(hotbarData: HotbarData | undefined) {
    if (this.container) {
      if (hotbarData && this.prevHotbarData) {
        if (
          hotbarData.health !== this.prevHotbarData.health ||
          hotbarData.maxHealth !== this.prevHotbarData.maxHealth
        ) {
          const healthBarX = -120;
          const healthBarY = -62;
          const health = Math.max(
            0,
            Math.min(1, hotbarData.health / hotbarData.maxHealth)
          );

          const healthBar = this.container.getByName(
            "healthBar"
          ) as Phaser.GameObjects.Graphics;
          const healthBarText = this.container.getByName(
            "healthBarText"
          ) as Phaser.GameObjects.Text;

          healthBar.clear();
          healthBar.fillStyle(0x000000, 1);
          healthBar.fillRect(healthBarX, healthBarY, 284, 24);
          healthBar.fillStyle(
            this.rgbToHex(255 * (1 - health), 255 * health, 0),
            1
          );
          healthBar.fillRect(healthBarX + 2, healthBarY + 2, 280 * health, 20);

          healthBarText.setText(
            `${Math.round(hotbarData.health)}/${Math.round(
              hotbarData.maxHealth
            )}`
          );
        }

        if (hotbarData.gold !== this.prevHotbarData.gold) {
          const goldText = this.container.getByName(
            "goldText"
          ) as Phaser.GameObjects.Text;

          goldText.setText(`${hotbarData.gold}`);
        }

        if (hotbarData.xp !== this.prevHotbarData.xp) {
          const xpText = this.container.getByName(
            "xpText"
          ) as Phaser.GameObjects.Text;

          xpText.setText(`${hotbarData.xp}`);
        }

        for (let i = 0; i < 5; i++) {
          const hotbarItem = this.container.getByName(
            `hotbarItem_${i}`
          ) as Phaser.GameObjects.Image;

          hotbarItem.setFrame(getItem(hotbarData.items[i]).index);
        }

        for (let i = 0; i < 5; i++) {
          const hotbarItem = this.container.getByName(
            `hotbarItem_${i}`
          ) as Phaser.GameObjects.Image;
          hotbarItem.setScale(i === hotbarData.selectedItem ? 2.25 : 2);
        }
      }
    }
  }

  private resizeCallback() {
    this.centerX = this.cameras.main.width / 2;
    this.centerY = this.cameras.main.height - 60;

    this.container?.setPosition(this.centerX, this.centerY);
  }

  private rgbToHex(r: number, g: number, b: number) {
    return (r << 16) + (g << 8) + b;
  }
}
