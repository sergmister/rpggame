import "phaser";

import { getItem } from "src/Items/itemutils";
import type GlobalPlayer from "src/GlobalPlayer";
import { GameKey } from "./GameScene";
import { DialogKey } from "./DialogScene";
import type { DialogProps } from "./DialogScene";

export const InventoryKey = "Inventory";

export class InventoryScene extends Phaser.Scene {
  private centerX = 0;
  private centerY = 0;

  private container?: Phaser.GameObjects.Container;

  private player?: GlobalPlayer;

  private cords: { x: number; y: number; hover: boolean }[];

  private isDragging = false;

  constructor() {
    super({ key: InventoryKey });

    this.cords = [];

    const slotWidth = 72;
    const slotHeight = 72;

    for (let j = 0; j < 4; j++) {
      for (let i = 0; i < 5; i++) {
        this.cords.push({
          x: i * slotWidth - 2 * slotWidth,
          y: -j * slotHeight + 1.5 * slotHeight,
          hover: false,
        });
      }
    }
  }

  create() {
    this.player = this.registry.get("GlobalPlayer");

    this.container = this.add.container(this.centerX, this.centerY);

    this.input.dragDistanceThreshold = 4;

    this.input.on(
      "dragstart",
      (pointer: any, gameObject: Phaser.GameObjects.Image) => {
        this.isDragging = true;

        gameObject.setTint(0xffff88);

        this.container!.bringToTop(gameObject);

        for (let i = 0; i < 20; i++) {
          this.container!.bringToTop(
            this.container!.getByName(`inventoryItemNumber_${i}`)
          );
        }
      }
    );

    this.input.on(
      "drag",
      (
        pointer: any,
        gameObject: Phaser.GameObjects.Image,
        dragX: number,
        dragY: number
      ) => {
        gameObject.x = dragX;
        gameObject.y = dragY;

        for (let i = 0; i < 20; i++) {
          const cord = this.cords[i];

          const otherObject = this.container!.getByName(
            `inventoryItem_${i}`
          ) as Phaser.GameObjects.Image;
          if (Math.hypot(cord.x - gameObject.x, cord.y - gameObject.y) < 32) {
            otherObject.setScale(2.25);
          } else {
            otherObject.setScale(2);
          }
        }
      }
    );

    this.input.on(
      "dragend",
      (pointer: any, gameObject: Phaser.GameObjects.Image) => {
        setTimeout(() => {
          this.isDragging = false;
        }, 100);

        gameObject.clearTint();
        const index = parseInt(gameObject.name.replace("inventoryItem_", ""));
        this.moveInventoryItem(
          gameObject,
          this.cords[index].x,
          this.cords[index].y
        );

        for (let i = 0; i < 20; i++) {
          const cord = this.cords[i];

          const otherObject = this.container!.getByName(
            `inventoryItem_${i}`
          ) as Phaser.GameObjects.Image;
          otherObject.setScale(2);
          if (Math.hypot(cord.x - gameObject.x, cord.y - gameObject.y) < 32) {
            this.swapInventoryItems(index, i);
          }
        }
      }
    );

    this.draw();

    this.scale.addListener("resize", this.resizeCallback, this);
    this.resizeCallback();

    this.input.keyboard.once("keyup-ESC", () => {
      this.scene.resume(GameKey);
      this.scale.removeListener("resize", this.resizeCallback, this);
      this.scene.stop(InventoryKey);
    });
  }

  private draw() {
    if (this.container && this.player) {
      const slotWidth = 72;
      const slotHeight = 72;

      const background = this.add.graphics().setName("background");
      background.fillStyle(0x444444, 0.5);
      background.fillRoundedRect(-200, -160, 2 * 200, 2 * 160, 24);
      this.container.add(background);

      for (let i = 0; i < 20; i++) {
        const cord = this.cords[i];

        const inventoryItem = this.add
          .sprite(
            cord.x,
            cord.y,
            "icons_inventory",
            getItem(this.player.state.items[i]).index
          )
          .setScale(2)
          .setName(`inventoryItem_${i}`)
          .setInteractive();

        inventoryItem.on("pointerover", () => {
          this.cords[i].hover = true;
          const descText = getItem(this.player!.state.items[i]).desription;
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

        inventoryItem.on("pointerout", () => {
          this.cords[i].hover = false;
          this.container!.remove(
            this.container!.getByName(`description_${i}`),
            true
          );
        });

        inventoryItem.on("pointerdown", () => {
          this.cords[i].hover = false;
          this.container!.remove(
            this.container!.getByName(`description_${i}`),
            true
          );
        });

        inventoryItem.on("pointerup", () => {
          if (!this.isDragging) {
            if (this.player && this.player.state.items[i] !== "null") {
              let options = ["Nothing", "Delete"];
              const item = getItem(this.player.state.items[i]);
              if (item.properties?.health || item.properties?.max_health) {
                options.push("Use");
              }
              this.scene.launch(DialogKey, {
                text: `What would you like to do with the ${this.player.state.items[i]}?`,
                options: options,
                callback: (ret: string) => {
                  if (ret === "Delete") {
                    this.player!.state.items[i] = "null";

                    this.player!.setState({});

                    this.updateDraw();
                  } else if (ret === "Use") {
                    if (
                      item.properties?.health &&
                      this.player!.state.health < this.player!.state.maxHealth
                    ) {
                      this.player!.state.items[
                        this.player!.state.items.findIndex(
                          (x) => x === item.name
                        )
                      ] = "null";
                      this.player!.setState({
                        health:
                          this.player!.state.health + item.properties.health,
                      });

                      this.updateDraw();
                    }
                    if (item.properties?.max_health) {
                      this.player!.state.items[
                        this.player!.state.items.findIndex(
                          (x) => x === item.name
                        )
                      ] = "null";
                      this.player!.setState({
                        maxHealth:
                          this.player!.state.maxHealth +
                          item.properties.max_health,
                        health:
                          this.player!.state.health +
                          item.properties.max_health,
                      });

                      this.updateDraw();
                    }
                  }
                },
              } as DialogProps);
            }
          }
        });

        this.input.setDraggable(inventoryItem);
        this.container.add(inventoryItem);

        const inventoryItemNumber = this.add
          .text(
            cord.x - slotWidth / 2 + 12,
            cord.y - slotHeight / 2 + 8,
            `${i + 1}`
          )
          .setName(`inventoryItemNumber_${i}`);
        this.container.add(inventoryItemNumber);
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

  private updateDraw() {
    if (this.player) {
      for (let i = 0; i < 20; i++) {
        (this.container!.getByName(
          `inventoryItem_${i}`
        ) as Phaser.GameObjects.Image).setFrame(
          getItem(this.player.state.items[i]).index
        );
      }
    }
  }

  private moveInventoryItem(
    object: Phaser.GameObjects.Image,
    x: number,
    y: number
  ) {
    this.tweens.add({
      targets: object,
      props: {
        x: x,
        y: y,
      },
      duration: 200,
    });
  }

  private swapInventoryItems(item1: number, item2: number) {
    if (this.player) {
      [this.player.state.items[item1], this.player.state.items[item2]] = [
        this.player.state.items[item2],
        this.player.state.items[item1],
      ];
      this.player.setState({});

      this.updateDraw();
    }
  }

  private resizeCallback() {
    this.centerX = this.cameras.main.width / 2;
    this.centerY = (this.cameras.main.height / 10) * 4;

    this.container?.setPosition(this.centerX, this.centerY);
  }
}
