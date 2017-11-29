namespace music {
    /**
     * Get the frequency of a note.
     * @param name the note name, eg: Note.C
     */
    //% weight=1 help=music/note-frequency
    //% blockId=device_note block="%note"
    //% shim=TD_ID color="#FFFFFF" colorSecondary="#FFFFFF"
    //% note.fieldEditor="note" note.defl="262"
    //% note.fieldOptions.decompileLiterals=true
    //% useEnumVal=1
    //% weight=10 blockGap=8
    export function noteFrequency(name: Note): number {
        return name;
    }

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
}