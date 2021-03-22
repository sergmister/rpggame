import "phaser";

import { getItem } from "src/Items/itemutils";
import type GlobalPlayer from "src/GlobalPlayer";
import { GameKey } from "./GameScene";
import { DialogKey, DialogProps } from "./DialogScene";

export const ShopKey = "Shop";

export interface ShopProps {
  items: { name: string; price: number }[];
  callback?(retIndex?: number): void;
}

export class ShopScene extends Phaser.Scene {
  private centerX = 0;
  private centerY = 0;

  private container?: Phaser.GameObjects.Container;

  private player?: GlobalPlayer;

  private cords: { x: number; y: number; hover: boolean }[];

  private items: { name: string; price: number }[];

  callback?(retIndex?: number): void;

  constructor() {
    super({ key: ShopKey });

    this.cords = [];

    this.items = [];

    const slotWidth = 72;
    const slotHeight = 72;

    for (let j = 3; j >= 0; j--) {
      for (let i = 0; i < 5; i++) {
        this.cords.push({
          x: i * slotWidth - 2 * slotWidth,
          y: -j * slotHeight + 1.5 * slotHeight,
          hover: false,
        });
      }
    }
  }

  create(props: ShopProps) {
    this.items = props.items;
    this.callback = props.callback;

    this.player = this.registry.get("GlobalPlayer");

    this.container = this.add.container(this.centerX, this.centerY);

    this.draw();

    this.scale.addListener("resize", this.resizeCallback, this);
    this.resizeCallback();

    this.input.keyboard.once("keyup-ESC", () => {
      this.remove();
    });
  }

  private remove(retIndex?: number) {
    this.scale.removeListener("resize", this.resizeCallback, this);
    this.scene.stop(ShopKey);
    if (this.callback) {
      this.callback(retIndex);
    }
  }

  private draw() {
    if (this.container && this.player) {
      const slotWidth = 72;
      const slotHeight = 72;

      const background = this.add.graphics().setName("background");
      background.fillStyle(0x855e42, 1);
      background.fillRoundedRect(-200, -160, 2 * 200, 2 * 160, 24);
      background.lineStyle(2, 0x222222, 1);
      background.strokeRoundedRect(-200, -160, 2 * 200, 2 * 160, 24);
      this.container.add(background);

      for (let i = 0; i < 20; i++) {
        if (this.items[i]) {
          const cord = this.cords[i];

          const shopItem = this.add
            .sprite(
              cord.x,
              cord.y,
              "icons_shop",
              getItem(this.items[i].name).index
            )
            .setScale(2)
            .setName(`shopItem_${i}`)
            .setInteractive();

          shopItem.on("pointerover", () => {
            this.cords[i].hover = true;
            const descText = getItem(this.items[i].name).desription;
            if (descText) {
              setTimeout(() => {
                if (this.cords[i].hover) {
                  this.container!.add(
                    this.drawDescription(i, cord.x, cord.y, descText)
                  );
                }
              }, 250);
            }
          });

          shopItem.on("pointerout", () => {
            this.cords[i].hover = false;
            this.container!.remove(
              this.container!.getByName(`description_${i}`),
              true
            );
          });

          shopItem.on("pointerdown", () => {
            this.cords[i].hover = false;
            this.container!.remove(
              this.container!.getByName(`description_${i}`),
              true
            );
          });

          shopItem.on("pointerup", () => {
            if (this.player && this.items[i].name !== "null") {
              this.scene.launch(DialogKey, {
                text: `What would you like to do with the ${this.items[i].name}?`,
                options: ["Nothing", `Buy for ${this.items[i].price}`],
                callback: (ret: string) => {
                  if (ret.startsWith("Buy")) {
                    this.buyItem(i, this.items[i].name, this.items[i].price);
                  }
                },
              } as DialogProps);
            }
          });
          this.container.add(shopItem);

          const shopItemNumber = this.add
            .text(
              cord.x - slotWidth / 2 + 12,
              cord.y - slotHeight / 2 + 8,
              `${this.items[i].price}`,
              { color: "gold" }
            )
            .setName(`shopItemNumber_${i}`);
          this.container.add(shopItemNumber);
        }
      }
    }
  }

  private drawDescription(index: number, x: number, y: number, text: string) {
    const container = this.add
      .container(x, y - 120)
      .setName(`description_${index}`);

    const background = this.add.graphics().setName("background");
    background.fillStyle(0xcaa472, 0.94);
    background.fillRoundedRect(-160, -84, 2 * 160, 2 * 84, 12);
    container.add(background);

    const descriptionText = this.add
      .text(0, 0, text, {
        color: "black",
        fontSize: "18px",
        align: "center",
        wordWrap: {
          width: 312,
          useAdvancedWrap: true,
        },
      })
      .setOrigin(0.5, 0.5);
    container.add(descriptionText);

    return container;
  }

  private buyItem(index: number, name: string, price: number) {
    if (this.player) {
      if (this.player.state.gold >= price) {
        if (this.player.giveItem(name)) {
          this.player.setState({ gold: this.player.state.gold - price });
          this.remove(index);
          return;
        }
        this.scene.launch(DialogKey, {
          text: "No inventory space!",
        } as DialogProps);
      } else {
        this.scene.launch(DialogKey, {
          text: "Not enough gold!",
        } as DialogProps);
      }
    }
    this.remove();
  }

  private resizeCallback() {
    this.centerX = this.cameras.main.width / 2;
    this.centerY = (this.cameras.main.height / 10) * 4;

    this.container?.setPosition(this.centerX, this.centerY);
  }
}
