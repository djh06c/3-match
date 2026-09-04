import Phaser from 'phaser';
import MainScene from './scenes/MainScene.js';
import MainMenuScene from './scenes/MainMenuScene.js';

const config = {
  type: Phaser.AUTO,
  parent: 'game',
  width: 800,
  height: 700,
  backgroundColor: '#222222',
  pixelArt: true,
  scale: {
    mode: Phaser.Scale.NONE,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [
    MainMenuScene,
    MainScene
  ]
};



new Phaser.Game(config);