class AudioService {
    private backgroundMusic : HTMLAudioElement;
    private stopSound : HTMLAudioElement;
    private clickSound : HTMLAudioElement;

    constructor() {
        this.backgroundMusic = new Audio(require('../assets/sfx/background.mp3'));
        this.clickSound = new Audio(require('../assets/sfx/click.mp3'));
        this.stopSound = new Audio(require('../assets/sfx/stop.wav'));

        this.backgroundMusic.loop = true;
    }

    playBackgroundMusic() {
        this.backgroundMusic.volume = .3;
        this
            .backgroundMusic
            .play()
            .catch((error) => console.error("Error playing background music: ", error));
    }

    stopBackgroundMusic() {
        this
            .backgroundMusic
            .pause();
        this.backgroundMusic.currentTime = 0;
    }

    playStopSound() {
        this.stopSound.volume = 1;
        this.stopSound.currentTime = 0;
        this
            .stopSound
            .play()
            .catch((error) => console.error("Error playing stop sound: ", error));
    }

    playClickSound() {
        this.clickSound.volume = 1;
        this.clickSound.currentTime = 0;
        this
            .clickSound
            .play()
            .catch((error) => console.error("Error playing click sound: ", error));
    }
}

const audioService = new AudioService();
export default audioService;
