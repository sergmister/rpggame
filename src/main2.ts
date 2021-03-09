import "phaser";

class MyScene extends Phaser.Scene {
  constructor() {
    super({ active: false, visible: false, key: "main" });
  }

  preload() {
    this.load.setBaseURL("http://labs.phaser.io");

    this.load.image("sky", "assets/skies/space3.png");
    this.load.image("logo", "assets/sprites/phaser3-logo.png");
    this.load.image("red", "assets/particles/red.png");
  }

  create() {
    this.add.image(400, 300, "sky");

    let particles = this.add.particles("red");

    let emitter = particles.createEmitter({
      speed: 100,
      scale: { start: 1, end: 0 },
      blendMode: "ADD",
    });

    let logo = this.physics.add.image(400, 100, "logo");

    logo.setVelocity(100, 200);
    logo.setBounce(1, 1);
    logo.setCollideWorldBounds(true);

    emitter.startFollow(logo);
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
      gravity: { y: 200 },
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
