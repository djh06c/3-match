class MusicManager {
    constructor() {
        this.intro = null;
        this.loop = null;
        this.started = false;

        this.normalVolume = 0.1;
        this.muffledVolume = 0.05;
        this.isMuffled = false;

        this.musicMuted = localStorage.getItem('musicMuted') === 'true';
    }

    start(scene) {
        // Undgå at starte musikken flere gange
        if (this.started) return;

        // Kontrollér at musikfilerne findes
        if (
            !scene.cache.audio.exists('musicIntro') ||
            !scene.cache.audio.exists('musicLoop')
        ) {
            console.warn('Music files are missing.');
            return;
        }

        const sound = scene.sound;

        this.intro = sound.add('musicIntro', {
            volume: this.normalVolume,
            loop: false
        });

        this.loop = sound.add('musicLoop', {
            volume: this.normalVolume,
            loop: true
        });

        this.updateMusicVolume();

        // Når introen er færdig, start loopet
        this.intro.once('complete', () => {
            if (this.started) {
                this.loop.play();
                this.updateMusicVolume();
            }
        });

        this.started = true;

        // Forsøg automatisk at starte musikken
        if (sound.locked) {
            sound.once('unlocked', () => {
                if (this.started && this.intro) {
                    this.intro.play();
                    this.updateMusicVolume();
                }
            });
        } else {
            this.intro.play();
            this.updateMusicVolume();
        }
    }

    updateMusicVolume() {
        const volume = this.musicMuted
            ? 0
            : this.isMuffled
                ? this.muffledVolume
                : this.normalVolume;

        this.intro?.setVolume(volume);
        this.loop?.setVolume(volume);
    }

    // Dæmp musikken i bestemte områder
    setMuffled(muffled) {
        this.isMuffled = muffled;
        this.updateMusicVolume();
    }

    toggleMusic() {
        this.musicMuted = !this.musicMuted;
        localStorage.setItem('musicMuted', String(this.musicMuted));
        this.updateMusicVolume();
        return this.musicMuted;
    }

    stop() {
        this.started = false;

        this.intro?.destroy();
        this.loop?.destroy();

        this.intro = null;
        this.loop = null;
    }
}

// Én fælles instans for hele spillet
export const musicManager = new MusicManager();