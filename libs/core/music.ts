enum Note {
    //% blockIdentity=music.noteFrequency
    C = 262,
    //% block=C#
    //% blockIdentity=music.noteFrequency
    CSharp = 277,
    //% blockIdentity=music.noteFrequency
    D = 294,
    //% blockIdentity=music.noteFrequency
    Eb = 311,
    //% blockIdentity=music.noteFrequency
    E = 330,
    //% blockIdentity=music.noteFrequency
    F = 349,
    //% block=F#
    //% blockIdentity=music.noteFrequency
    FSharp = 370,
    //% blockIdentity=music.noteFrequency
    G = 392,
    //% block=G#
    //% blockIdentity=music.noteFrequency
    GSharp = 415,
    //% blockIdentity=music.noteFrequency
    A = 440,
    //% blockIdentity=music.noteFrequency
    Bb = 466,
    //% blockIdentity=music.noteFrequency
    B = 494,
    //% blockIdentity=music.noteFrequency
    C3 = 131,
    //% block=C#3
    //% blockIdentity=music.noteFrequency
    CSharp3 = 139,
    //% blockIdentity=music.noteFrequency
    D3 = 147,
    //% blockIdentity=music.noteFrequency
    Eb3 = 156,
    //% blockIdentity=music.noteFrequency
    E3 = 165,
    //% blockIdentity=music.noteFrequency
    F3 = 175,
    //% block=F#3
    //% blockIdentity=music.noteFrequency
    FSharp3 = 185,
    //% blockIdentity=music.noteFrequency
    G3 = 196,
    //% block=G#3
    //% blockIdentity=music.noteFrequency
    GSharp3 = 208,
    //% blockIdentity=music.noteFrequency
    A3 = 220,
    //% blockIdentity=music.noteFrequency
    Bb3 = 233,
    //% blockIdentity=music.noteFrequency
    B3 = 247,
    //% blockIdentity=music.noteFrequency
    C4 = 262,
    //% block=C#4
    //% blockIdentity=music.noteFrequency
    CSharp4 = 277,
    //% blockIdentity=music.noteFrequency
    D4 = 294,
    //% blockIdentity=music.noteFrequency
    Eb4 = 311,
    //% blockIdentity=music.noteFrequency
    E4 = 330,
    //% blockIdentity=music.noteFrequency
    F4 = 349,
    //% block=F#4
    //% blockIdentity=music.noteFrequency
    FSharp4 = 370,
    //% blockIdentity=music.noteFrequency
    G4 = 392,
    //% block=G#4
    //% blockIdentity=music.noteFrequency
    GSharp4 = 415,
    //% blockIdentity=music.noteFrequency
    A4 = 440,
    //% blockIdentity=music.noteFrequency
    Bb4 = 466,
    //% blockIdentity=music.noteFrequency
    B4 = 494,
    //% blockIdentity=music.noteFrequency
    C5 = 523,
    //% block=C#5
    //% blockIdentity=music.noteFrequency
    CSharp5 = 555,
    //% blockIdentity=music.noteFrequency
    D5 = 587,
    //% blockIdentity=music.noteFrequency
    Eb5 = 622,
    //% blockIdentity=music.noteFrequency
    E5 = 659,
    //% blockIdentity=music.noteFrequency
    F5 = 698,
    //% block=F#5
    //% blockIdentity=music.noteFrequency
    FSharp5 = 740,
    //% blockIdentity=music.noteFrequency
    G5 = 784,
    //% block=G#5
    //% blockIdentity=music.noteFrequency
    GSharp5 = 831,
    //% blockIdentity=music.noteFrequency
    A5 = 880,
    //% blockIdentity=music.noteFrequency
    Bb5 = 932,
    //% blockIdentity=music.noteFrequency
    B5 = 989,
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

/**
 * Generation of music tones.
 */
//% color=#D83B01 weight=98 icon="\uf025"
namespace music {
    let beatsPerMinute: number = 120;

    /**
     * Gets the frequency of a note.
     * @param name the note name, eg: Note.C
     */
    //% weight=50 help=music/note-frequency
    //% blockId=device_note block="%note"
    //% shim=TD_ID
    export function noteFrequency(name: Note): number {
        return name;
    }

    /**
     * Returns the duration of a beat in milli-seconds
     */
    //% help=music/beat weight=49
    //% blockId=device_beat block="%fraction|beat"
    export function beat(fraction?: BeatFraction): number {
        if (fraction == null) fraction = BeatFraction.Whole;
        let beat = 60000 / beatsPerMinute;
        switch (fraction) {
            case BeatFraction.Half: return beat / 2;
            case BeatFraction.Quarter: return beat / 4;
            case BeatFraction.Eighth: return beat / 8;
            case BeatFraction.Sixteenth: return beat / 16;
            case BeatFraction.Double: return beat * 2;
            case BeatFraction.Breve: return beat * 4;
            default: return beat;
        }
    }

    /**
     * Returns the tempo in beats per minute. Tempo is the speed (bpm = beats per minute) at which notes play. The larger the tempo value, the faster the notes will play.
     */
    //% help=music/tempo weight=40
    //% blockId=device_tempo block="tempo (bpm)" blockGap=8
    export function tempo(): number {
        return beatsPerMinute;
    }

    /**
     * Change the tempo by the specified amount
     * @param bpm The change in beats per minute to the tempo, eg: 20
     */
    //% help=music/change-tempo-by weight=39
    //% blockId=device_change_tempo block="change tempo by (bpm)|%value" blockGap=8
    export function changeTempoBy(bpm: number): void {
        setTempo(beatsPerMinute + bpm);
    }

    /**
     * Sets the tempo to the specified amount
     * @param bpm The new tempo in beats per minute, eg: 120
     */
    //% help=music/set-tempo weight=38
    //% blockId=device_set_tempo block="set tempo to (bpm)|%value"
    export function setTempo(bpm: number): void {
        if (bpm > 0) {
            beatsPerMinute = Math.max(1, bpm);
        }
    }
}
