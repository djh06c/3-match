
class MusicManager {
    constructor() {
        this.intro = null;
        this.loop = null;
        this.started = false;

        this.normalVolume = 0.3;
        this.muffledVolume = 0.1;
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

        // Når introen er færdig, start loopet
        this.intro.once('complete', () => {
            if (this.started) {
                this.loop.play();
            }
        });

        this.started = true;

        // Forsøg automatisk at starte musikken.
        // Hvis browseren blokerer lyd, starter den,
        // når Phasers Sound Manager bliver unlocked.
        if (sound.locked) {
            sound.once('unlocked', () => {
                if (this.started && this.intro) {
                    this.intro.play();
                }
            });
        } else {
            this.intro.play();
        }
    }

    // Dæmp musikken i bestemte områder
    setMuffled(muffled) {
        const volume = muffled
            ? this.muffledVolume
            : this.normalVolume;

        this.intro?.setVolume(volume);
        this.loop?.setVolume(volume);
    }

    // Stop musikken helt, hvis vi får brug for det
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
