import Phaser from 'phaser';
import MainScene from './scenes/MainScene.js';
import MainMenuScene from './scenes/MainMenuScene.js';
import ProgressionScene from './scenes/ProgressionScene.js';

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
    MainScene,
    ProgressionScene
  ]
};



new Phaser.Game(config);
