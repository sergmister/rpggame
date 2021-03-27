import "phaser";
import type GlobalPlayer from "src/GlobalPlayer";
import { getItem } from "../Items/itemutils";
import { EE } from "../main";
import type NPC from "../Sprites/NPC";

export const BattleKey = "Battle";

export interface BattleProps {
  opponent: NPC;
  playerTextureKey: string;
  opponentTextureKey: string;
  callback(win: boolean): void;
  opponentHealth: number;
  opponentPhysicalDamage: number;
  opponentMagicDamage: number;
  opponentPhysicalResistance: number;
  opponentMagicResistance: number;
  playerPhysicalResistance: number;
  playerMagicResistance: number;
}

export class BattleScene extends Phaser.Scene {
  private centerX = 0;
  private centerY = 0;

  private container?: Phaser.GameObjects.Container;

  private globalPlayer?: GlobalPlayer;

  private callback?(win: boolean): void;

  private selectedItemHover = false;

  constructor() {
    super({ key: BattleKey });
  }

  create(props: BattleProps) {
    this.callback = props.callback;

    this.globalPlayer = this.registry.get("GlobalPlayer");

    this.container = this.add.container();

    this.scale.addListener("resize", this.resizeCallback, this);
    this.resizeCallback();

    this.input.keyboard.on("keyup-ESC", () => {
      this.remove(false);
    });

    this.draw(
      props.playerTextureKey,
      props.opponentTextureKey,
      props.opponentHealth,
      props.opponentPhysicalDamage,
      props.opponentMagicDamage,
      props.opponentPhysicalResistance,
      props.opponentMagicResistance,
      props.playerPhysicalResistance,
      props.playerMagicResistance
    );

    EE.on(
      "updateGlobalPlayerState",
      () => {
        this.updateDraw();
      },
      this
    );
  }

  private async draw(
    playerTextureKey: string,
    opponentTextureKey: string,
    opponentHealth: number,
    opponentPhysicalDamage: number,
    opponentMagicDamage: number,
    opponentPhysicalResistance: number,
    opponentMagicResistance: number,
    playerPhysicalResistance: number,
    playerMagicResistance: number
  ) {
    const backgroundWidth = 480;
    const backgroundHeight = 320;

    const background = this.add.graphics().setName("background");
    background.fillStyle(0xeaecee, 1);
    background.fillRoundedRect(
      -backgroundWidth,
      -backgroundHeight,
      2 * backgroundWidth,
      2 * backgroundHeight,
      24
    );
    background.lineStyle(2, 0x222222, 1);
    background.strokeRoundedRect(
      -backgroundWidth,
      -backgroundHeight,
      2 * backgroundWidth,
      2 * backgroundHeight,
      24
    );
    this.container!.add(background);

    const playerX = -180;
    const playerY = -80;
    const opponentX = 180;
    const opponentY = -160;

    const playerBackground = this.add
      .ellipse(playerX, playerY + 44, 124, 80, 0xb2babb, 0.5)
      .setName("playerBackground");
    this.container!.add(playerBackground);

    const opponentBackground = this.add
      .ellipse(opponentX, opponentY + 44, 124, 80, 0xb2babb, 0.5)
      .setName("opponentBackground");
    this.container!.add(opponentBackground);

    const playerImage = this.add
      .image(playerX, playerY, playerTextureKey, 7)
      .setName("playerImage")
      .setScale(3);
    this.container!.add(playerImage);

    const opponentImage = this.add
      .image(opponentX, opponentY, opponentTextureKey, 4)
      .setName("opponentImage")
      .setScale(3);
    this.container!.add(opponentImage);

    const opponentInfoX = 220;
    const opponentInfoY = 180;

    const opponentPhysicalDamageText = this.add
      .text(
        opponentInfoX,
        opponentInfoY,
        `Physical Damage: ${opponentPhysicalDamage}`,
        {
          color: "black",
          fontSize: "24px",
          fontStyle: "bold",
        }
      )
      .setName("opponentPhysicalDamageText")
      .setOrigin(0.5, 0.5);
    this.container!.add(opponentPhysicalDamageText);

    const opponentMagicDamageText = this.add
      .text(
        opponentInfoX,
        opponentInfoY + 30,
        `Magic Damage: ${opponentMagicDamage}`,
        {
          color: "black",
          fontSize: "24px",
          fontStyle: "bold",
        }
      )
      .setName("opponentMagicDamageText")
      .setOrigin(0.5, 0.5);
    this.container!.add(opponentMagicDamageText);

    const opponentPhysicalResistanceText = this.add
      .text(
        opponentInfoX,
        opponentInfoY + 60,
        `Physical Resistance: ${opponentPhysicalResistance}`,
        {
          color: "black",
          fontSize: "24px",
          fontStyle: "bold",
        }
      )
      .setName("opponentPhysicalResistanceText")
      .setOrigin(0.5, 0.5);
    this.container!.add(opponentPhysicalResistanceText);

    const opponentMagicResistanceText = this.add
      .text(
        opponentInfoX,
        opponentInfoY + 90,
        `Magic Resistance: ${opponentMagicResistance}`,
        {
          color: "black",
          fontSize: "24px",
          fontStyle: "bold",
        }
      )
      .setName("opponentMagicResistanceText")
      .setOrigin(0.5, 0.5);
    this.container!.add(opponentMagicResistanceText);

    const playerInfoX = -220;
    const playerInfoY = 180;

    const playerPhysicalDamageText = this.add
      .text(
        playerInfoX,
        playerInfoY,
        `Physical Damage: ${
          getItem(
            this.globalPlayer!.state.items[
              this.globalPlayer!.state.selectedItem
            ]
          ).properties?.physical_damage || 0
        }`,
        {
          color: "black",
          fontSize: "24px",
          fontStyle: "bold",
        }
      )
      .setName("playerPhysicalDamageText")
      .setOrigin(0.5, 0.5);
    this.container!.add(playerPhysicalDamageText);

    const playerMagicDamageText = this.add
      .text(
        playerInfoX,
        playerInfoY + 30,
        `Magic Damage: ${
          getItem(
            this.globalPlayer!.state.items[
              this.globalPlayer!.state.selectedItem
            ]
          ).properties?.magic_damage || 0
        }`,
        {
          color: "black",
          fontSize: "24px",
          fontStyle: "bold",
        }
      )
      .setName("playerMagicDamageText")
      .setOrigin(0.5, 0.5);
    this.container!.add(playerMagicDamageText);

    const playerPhysicalResistanceText = this.add
      .text(
        playerInfoX,
        playerInfoY + 60,
        `Physical Resistance: ${playerPhysicalResistance}`,
        {
          color: "black",
          fontSize: "24px",
          fontStyle: "bold",
        }
      )
      .setName("playerPhysicalResistanceText")
      .setOrigin(0.5, 0.5);
    this.container!.add(playerPhysicalResistanceText);

    const playerMagicResistanceText = this.add
      .text(
        playerInfoX,
        playerInfoY + 90,
        `Magic Resistance: ${playerMagicResistance}`,
        {
          color: "black",
          fontSize: "24px",
          fontStyle: "bold",
        }
      )
      .setName("playerMagicResistanceText")
      .setOrigin(0.5, 0.5);
    this.container!.add(playerMagicResistanceText);

    const selectedItemX = -220;
    const selectedItemY = 120;

    const selectedItem = this.add
      .sprite(
        selectedItemX,
        selectedItemY,
        "icons_inventory",
        getItem(
          this.globalPlayer!.state.items[this.globalPlayer!.state.selectedItem]
        ).index
      )
      .setScale(2)
      .setName("selectedItem")
      .setInteractive();
    this.container!.add(selectedItem);

    selectedItem.on("pointerover", () => {
      this.selectedItemHover = true;
      const descText = getItem(
        this.globalPlayer!.state.items[this.globalPlayer!.state.selectedItem]
      ).desription;
      if (descText) {
        setTimeout(() => {
          if (this.selectedItemHover) {
            this.container!.add(
              this.getDescription(selectedItemX, selectedItemY, descText)
            );
          }
        }, 250);
      }
    });

    selectedItem.on("pointerout", () => {
      this.selectedItemHover = false;
      this.container!.remove(this.container!.getByName("description"), true);
      this.container!.remove(this.container!.getByName("description"), true);
    });
  }

  private updateDraw() {
    const selectedItem = this.container!.getByName(
      "selectedItem"
    ) as Phaser.GameObjects.Image;

    selectedItem.setFrame(
      getItem(
        this.globalPlayer!.state.items[this.globalPlayer!.state.selectedItem]
      ).index
    );

    const playerPhysicalDamageText = this.container!.getByName(
      "playerPhysicalDamageText"
    ) as Phaser.GameObjects.Text;

    playerPhysicalDamageText.setText(
      `Physical Damage: ${
        getItem(
          this.globalPlayer!.state.items[this.globalPlayer!.state.selectedItem]
        ).properties?.physical_damage || 0
      }`
    );

    const playerMagicDamageText = this.container!.getByName(
      "playerMagicDamageText"
    ) as Phaser.GameObjects.Text;

    playerMagicDamageText.setText(
      `Magic Damage: ${
        getItem(
          this.globalPlayer!.state.items[this.globalPlayer!.state.selectedItem]
        ).properties?.magic_damage || 0
      }`
    );
  }

  private getDescription(x: number, y: number, text: string) {
    const container = this.add.container(x, y - 120).setName("description");

    const background = this.add.graphics();
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

  private battle() {}

  private remove(win: boolean) {
    this.scale.removeListener("resize", this.resizeCallback, this);
    this.scene.stop();
    if (this.callback) {
      this.callback(win);
    }
  }

  private resizeCallback() {
    this.centerX = this.cameras.main.width / 2;
    this.centerY = (this.cameras.main.height / 10) * 4;

    this.container?.setPosition(this.centerX, this.centerY);
  }
}
