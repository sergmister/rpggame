import "phaser";

export const DialogKey = "Dialog";

export interface DialogProps {
  text: string;
  delay?: number;
  options?: string[];
  callback?(ret?: string, stop?: boolean): void;
}

export class DialogScene extends Phaser.Scene {
  private centerX = 0;
  private centerY = 0;

  private container?: Phaser.GameObjects.Container;

  private createTime?: number;

  private callback?(ret?: string, stop?: boolean): void;

  constructor() {
    super({ key: DialogKey });
  }

  create(props: DialogProps) {
    this.callback = props.callback;

    this.container = this.add.container();

    this.createTime = Date.now();

    this.scale.addListener("resize", this.resizeCallback, this);
    this.resizeCallback();

    this.input.on("pointerup", () => {
      const timeDiff = Date.now() - this.createTime!;
      if (!props.delay || timeDiff > props.delay) {
        if (!props.options) {
          this.remove(undefined);
        }
      }
    });

    this.input.keyboard.on("keyup-ESC", () => {
      const timeDiff = Date.now() - this.createTime!;
      if (!props.delay || timeDiff > props.delay) {
        if (!props.options) {
          this.remove(undefined, true);
        }
      }
    });

    this.draw(props.text, props.options);
  }

  private draw(text: string, options?: string[]) {
    const background = this.add.graphics().setName("background");
    background.fillStyle(0xcaa472, 1);
    background.fillRoundedRect(-320, -180, 2 * 320, 2 * 180, 24);
    background.lineStyle(2, 0x222222, 1);
    background.strokeRoundedRect(-320, -180, 2 * 320, 2 * 180, 24);
    this.container!.add(background);

    const textObject = this.add
      .text(0, options ? -164 : 0, text, {
        color: "#222222",
        fontSize: options ? "22px" : "24px",
        fontStyle: "bold",
        align: "center",
        wordWrap: {
          width: 628,
          useAdvancedWrap: true,
        },
      })
      .setOrigin(0.5, options ? 0 : 0.5);
    this.container!.add(textObject);

    if (options) {
      for (let i = 0; i < options.length; i++) {
        const optionBackground = this.add
          .rectangle(i * 156 - 2 * 156 + 4, -8, 148, 164, 0x222222, 0.25)
          .setOrigin(0, 0)
          .setInteractive();
        optionBackground.on("pointerover", () => {
          optionBackground.setAlpha(0.6);
        });
        optionBackground.on("pointerout", () => {
          optionBackground.setAlpha(1);
        });
        optionBackground.on("pointerup", () => {
          this.remove(options[i]);
        });
        this.container!.add(optionBackground);

        const optionText = this.add
          .text(i * 156 - 1.5 * 156 + 4, 0, options[i], {
            color: "black",
            align: "center",
            wordWrap: {
              width: 152,
              useAdvancedWrap: true,
            },
          })
          .setOrigin(0.5, 0);
        this.container!.add(optionText);
      }
    }
  }

  private remove(ret?: string, stop?: boolean) {
    this.scale.removeListener("resize", this.resizeCallback, this);
    this.scene.stop(DialogKey);
    if (this.callback) {
      this.callback(ret, stop);
    }
  }

  private resizeCallback() {
    this.centerX = this.cameras.main.width / 2;
    this.centerY = (this.cameras.main.height / 10) * 4;

    this.container?.setPosition(this.centerX, this.centerY);
  }
}
