import { musicManager } from '../audio/MusicManager.js';

export function createMusicToggleButton(scene) {
    const button = scene.add.image(12, 12, musicManager.musicMuted ? 'musicOff' : 'musicOn')
        .setOrigin(0, 0)
        .setScale(1.5)
        .setDepth(1000)
        .setScrollFactor(0)
        .setInteractive({ useHandCursor: true });

    function refreshIcon() {
        button.setTexture(
            musicManager.musicMuted ? 'musicOff' : 'musicOn'
        );
    }

    button.on('pointerdown', () => {
        musicManager.toggleMusic();
        refreshIcon();
    });

    button.on('pointerover', () => {
        button.setAlpha(0.8);
    });

    button.on('pointerout', () => {
        button.setAlpha(1);
    });

    return button;
}