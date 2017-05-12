/*
The MIT License (MIT)

Copyright (c) 2013-2016 The MicroPython-on-micro:bit Developers, as listed
in the accompanying AUTHORS file

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

// Melodies from file microbitmusictunes.c https://github.com/bbcmicrobit/MicroPython

enum Melodies {
    //% block="power up" blockIdentity=music.builtInMelody
    PowerUp = 0,
    //% block="power down" blockIdentity=music.builtInMelody
    PowerDown,
    //% block="jump up" blockIdentity=music.builtInMelody
    JumpUp,
    //% block="jump down" blockIdentity=music.builtInMelody
    JumpDown,    
    //% block="ba ding" blockIdentity=music.builtInMelody
    BaDing,
    //% block="wawawawaa" blockIdentity=music.builtInMelody
    Wawawawaa
}

enum MusicEvent {
    //% block="melody note played"
    MelodyNotePlayed = 1,
    //% block="melody started"
    MelodyStarted = 2,
    //% block="melody ended"
    MelodyEnded = 3,
    //% block="melody repeated"
    MelodyRepeated = 4,
    //% block="background melody note played"
    BackgroundMelodyNotePlayed = MelodyNotePlayed | 0xf0,
    //% block="background melody started"
    BackgroundMelodyStarted = MelodyStarted | 0xf0,
    //% block="background melody ended"
    BackgroundMelodyEnded = MelodyEnded | 0xf0,
    //% block="background melody repeated"
    BackgroundMelodyRepeated = MelodyRepeated | 0xf0,
    //% block="background melody paused"
    BackgroundMelodyPaused = 5 | 0xf0,
    //% block="background melody resumed"
    BackgroundMelodyResumed = 6 | 0xf0
}

namespace music {
    const MICROBIT_MELODY_ID = 2000;
    let freqTable: number[];

    function initMelodies() {
        if (!freqTable)
            freqTable = [31, 33, 35, 37, 39, 41, 44, 46, 49, 52, 55, 58, 62, 65, 69, 73, 78, 82, 87, 92, 98, 104, 110, 117, 123, 131, 139, 147, 156, 165, 175, 185, 196, 208, 220, 233, 247, 262, 277, 294, 311, 330, 349, 370, 392, 415, 440, 466, 494, 523, 554, 587, 622, 659, 698, 740, 784, 831, 880, 932, 988, 1047, 1109, 1175, 1245, 1319, 1397, 1480, 1568, 1661, 1760, 1865, 1976, 2093, 2217, 2349, 2489, 2637, 2794, 2960, 3136, 3322, 3520, 3729, 3951, 4186]
    }

    export function getMelody(melody: Melodies): string[] {
        switch (melody) {
            case Melodies.BaDing:
                return ['b5:1', 'e6:3'];
            case Melodies.Wawawawaa:
                return ['e3:3', 'r:1', 'd#:3', 'r:1', 'd:4', 'r:1', 'c#:8'];
            case Melodies.JumpUp:
                return ['c5:1', 'd', 'e', 'f', 'g'];
            case Melodies.JumpDown:
                return ['g5:1', 'f', 'e', 'd', 'c'];
            case Melodies.PowerUp:
                return ['g4:1', 'c5', 'e', 'g:2', 'e:1', 'g:3'];
            case Melodies.PowerDown:
                return ['g5:1', 'd#', 'c', 'g4:2', 'b:1', 'c5:3'];
            default:
                return [];
        }
    }

    let currentMelody: Melody;
    let currentBackgroundMelody: Melody;

    /**
     * Gets the melody array of a built-in melody.
     * @param name the note name, eg: Note.C
     */
    //% weight=50 help=music/builtin-melody
    //% blockId=device_builtin_melody block="%melody"
    //% blockHidden=true
    export function builtInMelody(melody: Melodies): string[] {
        return getMelody(melody);
    }

    /**
 * Registers code to run on various melody events
 */
    //% blockId=melody_on_event block="on %value"
    //% help=music/on-event weight=59 advanced=true
    export function onEvent(value: MusicEvent, handler: Action) {
        control.onEvent(MICROBIT_MELODY_ID, value, handler);
    }

    /**
     * Starts playing a melody through.
     * Notes are expressed as a string of characters with this format: NOTE[octave][:duration]
     * @param melody the melody array to play, eg: ['g5:1']
     */
    //% help=music/begin-melody weight=60
    //% blockId=device_play_melody block="play melody %melody=device_builtin_melody"
    //% parts="headphone"
    export function playMelody(melodyArray: string[]) {
        startMelody(melodyArray, MelodyOptions.OnceInBackground);
    }

    /**
     * Starts playing a melody through.
     * Notes are expressed as a string of characters with this format: NOTE[octave][:duration]
     * @param melody the melody array to play, eg: ['g5:1']
     * @param options melody options, once / forever, in the foreground / background
     */
    //% help=music/begin-melody weight=60
    //% blockId=device_start_melody block="start melody %melody=device_builtin_melody| repeating %options"
    //% parts="headphone" advanced=true
    export function startMelody(melodyArray: string[], options: MelodyOptions = MelodyOptions.Once) {
        initMelodies();
        if (currentMelody != undefined) {
            if (((options & MelodyOptions.OnceInBackground) == 0)
                && ((options & MelodyOptions.ForeverInBackground) == 0)
                && currentMelody.background) {
                currentBackgroundMelody = currentMelody;
                currentMelody = null;
                control.raiseEvent(MICROBIT_MELODY_ID, MusicEvent.BackgroundMelodyPaused);
            }
            if (currentMelody)
                control.raiseEvent(MICROBIT_MELODY_ID, currentMelody.background ? MusicEvent.BackgroundMelodyEnded : MusicEvent.MelodyEnded);
            currentMelody = new Melody(melodyArray, options);
            control.raiseEvent(MICROBIT_MELODY_ID, currentMelody.background ? MusicEvent.BackgroundMelodyStarted : MusicEvent.MelodyStarted);
        } else {
            currentMelody = new Melody(melodyArray, options);
            control.raiseEvent(MICROBIT_MELODY_ID, currentMelody.background ? MusicEvent.BackgroundMelodyStarted : MusicEvent.MelodyStarted);
            // Only start the fiber once
            control.runInBackground(() => {
                while (currentMelody.hasNextNote()) {
                    playNextNote(currentMelody);
                    if (!currentMelody.hasNextNote() && currentBackgroundMelody) {
                        // Swap the background melody back
                        currentMelody = currentBackgroundMelody;
                        currentBackgroundMelody = null;
                        control.raiseEvent(MICROBIT_MELODY_ID, MusicEvent.MelodyEnded);
                        control.raiseEvent(MICROBIT_MELODY_ID, MusicEvent.BackgroundMelodyResumed);
                    }
                }
                control.raiseEvent(MICROBIT_MELODY_ID, currentMelody.background ? MusicEvent.BackgroundMelodyEnded : MusicEvent.MelodyEnded);
                currentMelody = null;
            })
        }
    }

    function playNextNote(melody: Melody): void {
        // cache elements
        let currNote = melody.nextNote();
        let currentPos = melody.currentPos;
        let currentDuration = melody.currentDuration;
        let currentOctave = melody.currentOctave;

        let note: number;
        let isrest: boolean = false;
        let beatPos: number;
        let parsingOctave: boolean = true;

        for (let pos = 0; pos < currNote.length; pos++) {
            let noteChar = currNote.charAt(pos);
            switch (noteChar) {
                case 'c': case 'C': note = 1; break;
                case 'd': case 'D': note = 3; break;
                case 'e': case 'E': note = 5; break;
                case 'f': case 'F': note = 6; break;
                case 'g': case 'G': note = 8; break;
                case 'a': case 'A': note = 10; break;
                case 'b': case 'B': note = 12; break;
                case 'r': case 'R': isrest = true; break;
                case '#': note++; break;
                case 'b': note--; break;
                case ':': parsingOctave = false; beatPos = pos; break;
                default: if (parsingOctave) currentOctave = parseInt(noteChar);
            }
        }
        if (!parsingOctave) {
            currentDuration = parseInt(currNote.substr(beatPos + 1, currNote.length - beatPos));
        }
        let beat = (60000 / music.tempo()) / 4;
        if (isrest) {
            rest(currentDuration * beat)
        } else {
            let keyNumber = note + (12 * (currentOctave - 1));
            let frequency = keyNumber >= 0 && keyNumber < freqTable.length ? freqTable[keyNumber] : 0;
            playTone(frequency, currentDuration * beat);
        }
        melody.currentDuration = currentDuration;
        melody.currentOctave = currentOctave;

        const repeating = melody.repeating && currentPos == melody.melodyArray.length - 1;
        melody.currentPos = repeating ? 0 : currentPos + 1;

        control.raiseEvent(MICROBIT_MELODY_ID, melody.background ? MusicEvent.BackgroundMelodyNotePlayed : MusicEvent.MelodyNotePlayed);
        if (repeating)
            control.raiseEvent(MICROBIT_MELODY_ID, melody.background ? MusicEvent.BackgroundMelodyRepeated : MusicEvent.MelodyRepeated);
    }

    class Melody {
        public melodyArray: string[];
        public currentDuration: number;
        public currentOctave: number;
        public currentPos: number;
        public repeating: boolean;
        public background: boolean;

        constructor(melodyArray: string[], options: MelodyOptions) {
            this.melodyArray = melodyArray;
            this.repeating = ((options & MelodyOptions.Forever) != 0);
            this.repeating = this.repeating ? true : ((options & MelodyOptions.ForeverInBackground) != 0)
            this.background = ((options & MelodyOptions.OnceInBackground) != 0);
            this.background = this.background ? true : ((options & MelodyOptions.ForeverInBackground) != 0);
            this.currentDuration = 4; //Default duration (Crotchet)
            this.currentOctave = 4; //Middle octave
            this.currentPos = 0;
        }

        hasNextNote() {
            return this.repeating || this.currentPos < this.melodyArray.length;
        }

        nextNote(): string {
            const currentNote = this.melodyArray[this.currentPos];
            return currentNote;
        }
    }
}