import "phaser";

class MyScene extends Phaser.Scene {
  private platforms?: Phaser.Physics.Arcade.StaticGroup;
  private player?: Phaser.Physics.Arcade.Sprite;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private stars?: Phaser.Physics.Arcade.Group;

  private score = 0;
  private scoreText?: Phaser.GameObjects.Text;

  private bombs?: Phaser.Physics.Arcade.Group;

  private gameOver = false;

  constructor() {
    super({ active: false, visible: false, key: "main" });
  }

  preload() {
    this.load.image("sky", "assets/sky.png");
    this.load.image("ground", "assets/platform.png");
    this.load.image("star", "assets/star.png");
    this.load.image("bomb", "assets/bomb.png");
    this.load.spritesheet("dude", "assets/dude.png", {
      frameWidth: 32,
      frameHeight: 48,
    });
  }

  create() {
    this.add.image(400, 300, "sky");

    this.platforms = this.physics.add.staticGroup();

    // typescript no like
    this.platforms.create(400, 568, "ground").setScale(2).refreshBody();

    (this.platforms.create(600, 400, "ground") as Phaser.Physics.Arcade.Sprite)
      .setScale(2)
      .refreshBody();
    // platforms.create(50, 250, "ground");
    // platforms.add(this.add.sprite(50, 250, "ground").setScale(1));
    // image cannot be animated
    this.platforms.add(this.add.image(50, 250, "ground"));
    this.platforms.create(750, 220, "ground");

    this.player = this.physics.add
      .sprite(100, 450, "dude")
      .setBounce(0.2)
      .setCollideWorldBounds(true);

    // this.player = new Phaser.Physics.Arcade.Sprite(this, 100, 450, "dude");
    // this.add.existing(this.player);
    // this.physics.add.existing(this.player);

    this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers("dude", { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "turn",
      frames: [{ key: "dude", frame: 4 }],
      frameRate: 20,
    });

    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers("dude", { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1,
    });

    // added to global grvity
    // this.player.body.gravity.set(0, 300);

    this.physics.add.collider(this.player, this.platforms);

    this.cursors = this.input.keyboard.createCursorKeys();

    this.stars = this.physics.add.group({
      key: "star",
      repeat: 11,
      setXY: { x: 12, y: 0, stepX: 70 },
    });

    this.stars.children.iterate((child) => {
      (child as Phaser.Physics.Arcade.Image).setBounce(
        Phaser.Math.FloatBetween(0.4, 0.8)
      );
    });

    this.physics.add.collider(this.stars, this.platforms);
    this.physics.add.overlap(
      this.player,
      this.stars,
      this.handleCollectStar,
      undefined,
      this
    );

    this.scoreText = this.add.text(16, 16, `Score: ${this.score}`, {
      fontSize: "32px",
      color: "white",
    });

    this.bombs = this.physics.add.group();

    this.physics.add.collider(this.bombs, this.platforms);
    this.physics.add.collider(
      this.player,
      this.bombs,
      this.handleHitBomb,
      undefined,
      this
    );
  }

  update() {
    if (!this.cursors || !this.player) {
      return;
    }
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
      this.player.anims.play("left", true);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
      this.player.anims.play("right", true);
    } else {
      this.player.setVelocityX(0);
      this.player.anims.play("turn", false);
    }
    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-330);
    }
  }

  private handleCollectStar(
    player: Phaser.GameObjects.GameObject,
    star: Phaser.GameObjects.GameObject
  ) {
    (star as Phaser.Physics.Arcade.Image).disableBody(true, true);

    this.score += 10;
    this.scoreText?.setText(`Score: ${this.score}`);

    if (this.stars?.countActive(true) === 0) {
      this.stars.children.iterate(function (child) {
        (child as Phaser.Physics.Arcade.Image).enableBody(
          true,
          (child as Phaser.Physics.Arcade.Image).x,
          0,
          true,
          true
        );
      });

      const x =
        (player as Phaser.Physics.Arcade.Image).x < 400
          ? Phaser.Math.Between(400, 800)
          : Phaser.Math.Between(0, 400);

      // const bomb: Phaser.Physics.Arcade.Sprite = this.bombs?.create(x, 16, "bomb");
      (this.bombs?.create(x, 16, "bomb") as Phaser.Physics.Arcade.Image)
        .setBounce(1)
        .setCollideWorldBounds(true)
        .setVelocity(Phaser.Math.Between(-200, 200), 20);
    }
  }

  private handleHitBomb(
    plyer: Phaser.GameObjects.GameObject,
    bomb: Phaser.GameObjects.GameObject
  ) {
    this.physics.pause();

    this.player?.setTint(0xff0000);
    this.player?.anims.play("turn");

    this.gameOver = true;
  }
}

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: "gamediv",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 300 },
      debug: false,
    },
  },
  scene: [MyScene],
};

const game = new Phaser.Game(config);
//window.addEventListener("load", () => new Phaser.Game(config));

/**
 * add some form of save and load functionality - localstorage? - autosave
 * resoltion / aspect ratio agnostic
 * tiled to make maps - procedural generation for some parts?
 * event emitter?
 * lodash for easing? build into phaser?
 * puzzle / strategy parts?
 * unique? - something that makes it worthwhile to play over other rpg games?
 * lighten up phaser a bit?
 */
