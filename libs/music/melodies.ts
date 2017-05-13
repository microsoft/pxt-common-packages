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
    Wawawawaa
}

namespace music {
    let _soundQueue: control.AnimationQueue;

    /**
     * Gets the melody array of a built-in melody.
     * @param name the note name, eg: Note.C
     */
    //% weight=50 help=music/sounds
    //% blockId=music_sounds block="%name"
    //% blockHidden=true
    //% name.fieldEditor="gridpicker"
    //% name.fieldOptions.width=220
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
            default:
                return '';
        }
    }

    function soundQueue(): control.AnimationQueue {
        if (!_soundQueue) _soundQueue = new control.AnimationQueue();
        return _soundQueue;
    }

    /**
     * Starts playing a sound without pausing.
     * Notes are expressed as a string of characters with this format: NOTE[octave][:duration]
     * @param sound the melody to play, eg: 'g5:1'
     */
    //% help=music/play-sound weight=61
    //% blockId=music_play_sound block="play sound %sound=music_sounds"
    //% parts="headphone" blockGap=8
    export function playSound(sound: string) {
        const queue = soundQueue();
        const melody = new Melody(sound);
        control.runInBackground(() => {
            queue.cancel();
            queue.runUntilDone(() => melody.playNextNote());
        })
        loops.pause(1);
    }


    /**
     * Plays a sound and waits until the sound is done
     * Notes are expressed as a string of characters with this format: NOTE[octave][:duration]
     * @param sound the melody to play, eg: 'g5:1'
     */
    //% help=music/play-sound-until-done weight=60
    //% blockId=music_play_sound_until_done block="play sound %sound=music_sounds|until done"
    //% parts="headphone" blockGap=8
    export function playSoundUntilDone(sound: string) {
        const queue = soundQueue();
        const melody = new Melody(sound);
        queue.runUntilDone(() => melody.playNextNote());
    }

    /**
     * Stops all sounds from playing.
     */
    //% help=music/stop-all-sounds weight=59
    //% blockId=music_stop_all_sounds block="stop all sounds"
    export function stopAllSounds() {
        const queue = soundQueue();
        queue.cancel();
        music.rest(1);
    }

    class Melody {
        static freqTable: number[];
        notes: string;
        duration: number;
        octave: number;
        pos: number;
        tempo: number;

        constructor(notes: string) {
            this.notes = notes;
            this.duration = 4; //Default duration (Crotchet)
            this.octave = 4; //Middle octave
            this.pos = 0;
            this.tempo = 120; // default tempo
            // TODO: use HEX literal
            if (!Melody.freqTable)
                Melody.freqTable = [31, 33, 35, 37, 39, 41, 44, 46, 49, 52, 55, 58, 62, 65, 69, 73, 78, 82, 87, 92, 98, 104, 110, 117, 123, 131, 139, 147, 156, 165, 175, 185, 196, 208, 220, 233, 247, 262, 277, 294, 311, 330, 349, 370, 392, 415, 440, 466, 494, 523, 554, 587, 622, 659, 698, 740, 784, 831, 880, 932, 988, 1047, 1109, 1175, 1245, 1319, 1397, 1480, 1568, 1661, 1760, 1865, 1976, 2093, 2217, 2349, 2489, 2637, 2794, 2960, 3136, 3322, 3520, 3729, 3951, 4186]
        }

        hasNextNote() {
            return this.pos < this.notes.length;
        }

        scanNextNote(): string {
            // eat space
            while (this.pos < this.notes.length) {
                const c = this.notes[this.pos];
                if (c != ' ' && c != '\r' && c != '\n' && c != '\t')
                    break;
                this.pos++;
            }

            // read note
            let note = "";
            while (this.pos < this.notes.length) {
                const c = this.notes[this.pos];
                if (c == ' ' || c == '\r' || c == '\n' || c == '\t')
                    break;
                note += c;
                this.pos++;
            }
            return note;
        }

        playNextNote(): boolean {
            let currNote = this.scanNextNote();
            if (!currNote)
                return false;

            enum Token {
                Note = 0,
                Octave = 1,
                Beat = 2,
                Tempo = 3
            }

            let note: number = 0;
            let isrest: boolean = false;
            let token: string = "";
            let tokenKind = Token.Note;
            const consumeToken = () => {
                if (token && tokenKind != Token.Note) {
                    const d = parseInt(token);
                    switch (tokenKind) {
                        case Token.Octave: this.octave = d; break;
                        case Token.Beat: this.duration = d; break;
                        case Token.Tempo: this.tempo = Math.max(1, d); break;
                    }
                    token = "";
                }
            }
            for (let i = 0; i < currNote.length; i++) {
                let noteChar = currNote.charAt(i);
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
                    case ':':
                        consumeToken();
                        tokenKind = Token.Beat;
                        break;
                    case '-':
                        consumeToken();
                        tokenKind = Token.Tempo;
                        break;
                    default:
                        if(tokenKind == Token.Note)
                            tokenKind = Token.Octave;
                        token += noteChar;
                        break;
                }
            }
            consumeToken();
            let beat = 15000 / this.tempo;
            if (isrest) {
                music.rest(this.duration * beat)
            } else {
                const keyNumber = note + (12 * (this.octave - 1));
                const frequency = Melody.freqTable[keyNumber] || 0;
                music.playTone(frequency, this.duration * beat);
            }

            return this.hasNextNote();
        }
    }
}