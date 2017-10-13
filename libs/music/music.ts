enum Note {
    //% blockIdentity=music.noteFrequency enumval=262
    C = 262,
    //% block=C#
    //% blockIdentity=music.noteFrequency enumval=277
    CSharp = 277,
    //% blockIdentity=music.noteFrequency enumval=294
    D = 294,
    //% blockIdentity=music.noteFrequency enumval=311
    Eb = 311,
    //% blockIdentity=music.noteFrequency enumval=330
    E = 330,
    //% blockIdentity=music.noteFrequency enumval=349
    F = 349,
    //% block=F#
    //% blockIdentity=music.noteFrequency enumval=370
    FSharp = 370,
    //% blockIdentity=music.noteFrequency enumval=392
    G = 392,
    //% block=G#
    //% blockIdentity=music.noteFrequency enumval=415
    GSharp = 415,
    //% blockIdentity=music.noteFrequency enumval=440
    A = 440,
    //% blockIdentity=music.noteFrequency enumval=466
    Bb = 466,
    //% blockIdentity=music.noteFrequency enumval=494
    B = 494,
    //% blockIdentity=music.noteFrequency enumval=131
    C3 = 131,
    //% block=C#3
    //% blockIdentity=music.noteFrequency enumval=139
    CSharp3 = 139,
    //% blockIdentity=music.noteFrequency enumval=147
    D3 = 147,
    //% blockIdentity=music.noteFrequency enumval=156
    Eb3 = 156,
    //% blockIdentity=music.noteFrequency enumval=165
    E3 = 165,
    //% blockIdentity=music.noteFrequency enumval=175
    F3 = 175,
    //% block=F#3
    //% blockIdentity=music.noteFrequency enumval=185
    FSharp3 = 185,
    //% blockIdentity=music.noteFrequency enumval=196
    G3 = 196,
    //% block=G#3
    //% blockIdentity=music.noteFrequency enumval=208
    GSharp3 = 208,
    //% blockIdentity=music.noteFrequency enumval=220
    A3 = 220,
    //% blockIdentity=music.noteFrequency enumval=233
    Bb3 = 233,
    //% blockIdentity=music.noteFrequency enumval=247
    B3 = 247,
    //% blockIdentity=music.noteFrequency enumval=262
    C4 = 262,
    //% block=C#4
    //% blockIdentity=music.noteFrequency enumval=277
    CSharp4 = 277,
    //% blockIdentity=music.noteFrequency enumval=294
    D4 = 294,
    //% blockIdentity=music.noteFrequency enumval=311
    Eb4 = 311,
    //% blockIdentity=music.noteFrequency enumval=330
    E4 = 330,
    //% blockIdentity=music.noteFrequency enumval=349
    F4 = 349,
    //% block=F#4
    //% blockIdentity=music.noteFrequency enumval=370
    FSharp4 = 370,
    //% blockIdentity=music.noteFrequency enumval=392
    G4 = 392,
    //% block=G#4
    //% blockIdentity=music.noteFrequency enumval=415
    GSharp4 = 415,
    //% blockIdentity=music.noteFrequency enumval=440
    A4 = 440,
    //% blockIdentity=music.noteFrequency enumval=466
    Bb4 = 466,
    //% blockIdentity=music.noteFrequency enumval=494
    B4 = 494,
    //% blockIdentity=music.noteFrequency enumval=523
    C5 = 523,
    //% block=C#5
    //% blockIdentity=music.noteFrequency enumval=555
    CSharp5 = 555,
    //% blockIdentity=music.noteFrequency enumval=587
    D5 = 587,
    //% blockIdentity=music.noteFrequency enumval=622
    Eb5 = 622,
    //% blockIdentity=music.noteFrequency enumval=659
    E5 = 659,
    //% blockIdentity=music.noteFrequency enumval=698
    F5 = 698,
    //% block=F#5
    //% blockIdentity=music.noteFrequency enumval=740
    FSharp5 = 740,
    //% blockIdentity=music.noteFrequency enumval=784
    G5 = 784,
    //% block=G#5
    //% blockIdentity=music.noteFrequency enumval=831
    GSharp5 = 831,
    //% blockIdentity=music.noteFrequency enumval=880
    A5 = 880,
    //% blockIdentity=music.noteFrequency enumval=932
    Bb5 = 932,
    //% blockIdentity=music.noteFrequency enumval=988
    B5 = 988,
}

enum BeatFraction {
    //% block=1
    Whole = 1,
    //% block="1/2"
    Half = 2,
    //% block="1/4"
    Quarter = 4,
    //% block="1/8"
    Eighth = 8,
    //% block="1/16"
    Sixteenth = 16,
    //% block="2"
    Double = 32,
    //% block="4",
    Breve = 64
}

namespace music {
    let beatsPerMinute: number;

    /**
    * Play a tone.
    * @param frequency pitch of the tone to play in Hertz (Hz)
    */
    //% help=music/ring-tone
    //% blockId=music_ring block="ring tone|at %note=device_note"
    //% parts="headphone" trackArgs=0
    //% blockNamespace=music inBasicCategory=true
    //% weight=75 blockGap=8
    export function ringTone(frequency: number) {
        playTone(frequency, 0);
    }

    /**
    * Rest, or play silence, for some time (in milleseconds).
    * @param ms rest duration in milliseconds (ms)
    */
    //% help=music/rest
    //% blockId=music_rest block="rest|for %duration=device_beat"
    //% parts="headphone" trackArgs=0
    //% blockNamespace=music
    //% weight=74
    export function rest(ms: number) {
        playTone(0, Math.max(ms, 20));
    }

    /**
     * Get the frequency of a note.
     * @param name the note name, eg: Note.C
     */
    //% weight=1 help=music/note-frequency
    //% blockId=device_note block="%note"
    //% shim=TD_ID color="#FFFFFF" colorSecondary="#FFFFFF"
    //% note.fieldEditor="note" note.defl="262"
    //% note.fieldOptions.editorColour="#D83B01" note.fieldOptions.decompileLiterals=true
    //% useEnumVal=1
    //% weight=10 blockGap=8
    export function noteFrequency(name: Note): number {
        return name;
    }

    function init() {
        if (!beatsPerMinute) beatsPerMinute = 120;
    }

    /**
     * Return the duration of a beat in milliseconds (the beat fraction).
     * @param fraction the fraction of the current whole note, eg: BeatFraction.Half
     */
    //% help=music/beat
    //% blockId=device_beat block="%fraction|beat"
    //% weight=9 blockGap=8
    export function beat(fraction?: BeatFraction): number {
        init();
        if (fraction == null) fraction = BeatFraction.Whole;
        let beat = 60000 / beatsPerMinute;
        switch (fraction) {
            case BeatFraction.Half: beat /= 2; break;
            case BeatFraction.Quarter: beat /= 4; break;
            case BeatFraction.Eighth: beat /= 8; break;
            case BeatFraction.Sixteenth: beat /= 16; break;
            case BeatFraction.Double: beat *= 2; break;
            case BeatFraction.Breve: beat *= 4; break;
        }
        return beat >> 0;
    }

    /**
     * Return the tempo in beats per minute (bpm).
     * Tempo is the speed (bpm = beats per minute) at which notes play. The larger the tempo value, the faster the notes will play.
     */
    //% help=music/tempo
    //% blockId=device_tempo block="tempo (bpm)"
    //% weight=64
    export function tempo(): number {
        init();
        return beatsPerMinute;
    }

    /**
     * Change the tempo up or down by some amount of beats per minute (bpm).
     * @param bpm The change in beats per minute to the tempo, eg: 20
     */
    //% help=music/change-tempo-by weight=37
    //% blockId=device_change_tempo block="change tempo by %value|(bpm)"
    //% weight=66 blockGap=8
    export function changeTempoBy(bpm: number): void {
        init();
        setTempo(beatsPerMinute + bpm);
    }

    /**
     * Set the tempo a number of beats per minute (bpm).
     * @param bpm The new tempo in beats per minute, eg: 120
     */
    //% help=music/set-tempo
    //% blockId=device_set_tempo block="set tempo to %value|(bpm)"
    //% bpm.min=4 bpm.max=400
    //% weight=65 blockGap=8
    export function setTempo(bpm: number): void {
        init();
        if (bpm > 0) {
            beatsPerMinute = Math.max(1, bpm >> 0);
        }
    }
}
