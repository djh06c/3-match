import Phaser from 'phaser';
import MainScene from './scenes/MainScene.js';

const config = {
  type: Phaser.AUTO,
  parent: 'game',
  width: 800,
  height: 700,
  backgroundColor: '#222222',
  pixelArt: true,
  scene: [MainScene]
};

new Phaser.Game(config);