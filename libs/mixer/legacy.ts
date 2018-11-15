//% deprecated=true hidden=true
enum Sounds {
    //% block="power up"
    PowerUp,
    //% block="power down"
    PowerDown,
    //% block="jump up"
    JumpUp,
    //% block="jump down"
    JumpDown,
    //% block="ba ding"
    BaDing,
    //% block="wawawawaa"
    Wawawawaa,
    //% block="magic wand"
    MagicWand,
    //% block="siren"
    Siren
}

namespace music {
    /**
     * Get the melody string for a built-in melody.
     * @param name the note name, eg: Note.C
     */
    //% help=music/sounds
    //% blockId=music_sounds block="%name"
    //% blockHidden=true
    //% name.fieldEditor="gridpicker"
    //% name.fieldOptions.width=285
    //% name.fieldOptions.columns=3
    export function sounds(name: Sounds): string {
        switch (name) {
            case Sounds.BaDing:
                return 'b5:1 e6:3';
            case Sounds.Wawawawaa:
                return 'e3:3 r:1 d#:3 r:1 d:4 r:1 c#:8';
            case Sounds.JumpUp:
                return 'c5:1 d e f g';
            case Sounds.JumpDown:
                return 'g5:1 f e d c';
            case Sounds.PowerUp:
                return 'g4:1 c5 e g:2 e:1 g:3';
            case Sounds.PowerDown:
                return 'g5:1 d# c g4:2 b:1 c5:3';
            case Sounds.MagicWand:
                return 'F#6:1-300 G# A# B C7# D# F F# G# A# B:6'; //A#7:1-200 A:1 A#7:1 A:1 A#7:2
            case Sounds.Siren:
                return 'a4 d5 a4 d5 a4 d5';
            default:
                return '';
        }
    }

    let currMelody: Melody

    /**
     * Start playing a sound and don't wait for it to finish.
     * Notes are expressed as a string of characters with this format: NOTE[octave][:duration]
     * @param sound the melody to play
     */
    //% help=music/play-sound
    //% blockId=music_play_sound block="play sound %sound=music_sounds"
    //% parts="headphone"
    //% weight=95 blockGap=8
    //% deprecated=true hidden=true
    export function playSound(sound: string) {
        stopAllSounds();
        currMelody = new Melody(sound);
        currMelody.play();
        pause(1);
    }


    /**
     * Play a sound and wait until the sound is done.
     * Notes are expressed as a string of characters with this format: NOTE[octave][:duration]
     * @param sound the melody to play
     */
    //% help=music/play-sound-until-done
    //% blockId=music_play_sound_until_done block="play sound %sound=music_sounds|until done"
    //% parts="headphone"
    //% weight=94 blockGap=8
    //% deprecated=true hidden=true
    export function playSoundUntilDone(sound: string) {
        stopAllSounds();
        currMelody = new Melody(sound);
        currMelody.playUntilDone();
    }

    /**
     * Stop all sounds from playing.
     */
    //% help=music/stop-all-sounds
    //% blockId=music_stop_all_sounds block="stop all sounds"
    //% weight=93
    //% deprecated=true hidden=true
    export function stopAllSounds() {
        if (currMelody) {
            currMelody.stop();
            currMelody = null;
        }
        //music.rest(1);
    }
}