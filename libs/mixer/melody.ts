enum MusicOutput {
    AutoDetect = 0,
    Buzzer = 1,
    HeadPhones = 2,
}

namespace music {
    //% whenUsed
    const freqs = hex`
        1f00210023002500270029002c002e003100340037003a003e004100450049004e00520057005c00620068006e00
        75007b0083008b0093009c00a500af00b900c400d000dc00e900f70006011501260137014a015d01720188019f01
        b801d201ee010b022a024b026e029302ba02e40210033f037003a403dc03170455049704dd0427057505c8052006
        7d06e0064907b8072d08a9082d09b9094d0aea0a900b400cfa0cc00d910e6f0f5a1053115b1272139a14d4152017
        8018f519801b231dde1e`

    //% shim=music::playInstructions
    function playInstructions(buf: Buffer) { }

    //% shim=music::forceOutput
    export function forceOutput(buf: MusicOutput) { }

    //% fixedInstances
    export class Melody {
        _text: string;
        _player: MelodyPlayer;

        constructor(text: string) {
            this._text = text
        }

        stop() {
            if (this._player) {
                this._player.stop()
                this._player = null
            }
        }

        private playCore(volume: number, loop: boolean) {
            this.stop()
            const p = new MelodyPlayer(this)
            control.runInParallel(() => {
                while (this._player == p) {
                    p.play(volume)
                    if (!loop)
                        break
                }
            })
        }

        /**
         * Start playing a sound in a loop and don't wait for it to finish.
         * @param sound the melody to play
         */
        //% help=music/play-sound
        //% blockId=music_loop_sound block="play sound %sound=music_sounds"
        //% parts="headphone"
        //% weight=95 blockGap=8
        loop(volume = 64) {
            this.playCore(volume, true)
        }

        /**
         * Start playing a sound and don't wait for it to finish.
         * @param sound the melody to play
         */
        //% help=music/play-sound
        //% blockId=music_play_sound block="play sound %sound=music_sounds"
        //% parts="headphone"
        //% weight=95 blockGap=8
        play(volume = 64) {
            this.playCore(volume, false)
        }


        /**
         * Play a sound and wait until the sound is done.
         * @param sound the melody to play
         */
        //% help=music/play-sound-until-done
        //% blockId=music_play_sound_until_done block="play sound %sound=music_sounds|until done"
        //% parts="headphone"
        //% weight=94 blockGap=8
        playUntilDone(volume = 64) {
            this.stop()
            new MelodyPlayer(this).play(volume)
        }
    }

    class MelodyPlayer {
        melody: Melody;

        constructor(m: Melody) {
            this.melody = m
            m._player = this
        }

        stop() {
            this.melody = null
        }

        play(volume: number) {
            if (!this.melody)
                return

            volume = Math.clamp(0, 255, volume)

            let notes = this.melody._text
            let pos = 0;
            let duration = 4; //Default duration (Crotchet)
            let octave = 4; //Middle octave
            let tempo = 120; // default tempo

            let hz = 0
            let ms = 0

            let envA = 0
            let envD = 0
            let envS = 255
            let envR = 0
            let soundWave = 1 // triangle
            let sndInstr = control.createBuffer(5 * 10)
            let sndInstrPtr = 0

            const addForm = (ms: number, beg: number, end: number) => {
                if (ms > 0) {
                    sndInstr.setNumber(NumberFormat.UInt8LE, sndInstrPtr, soundWave)
                    sndInstr.setNumber(NumberFormat.UInt8LE, sndInstrPtr + 1, 0)
                    sndInstr.setNumber(NumberFormat.UInt16LE, sndInstrPtr + 2, hz)
                    sndInstr.setNumber(NumberFormat.UInt16LE, sndInstrPtr + 4, ms)
                    sndInstr.setNumber(NumberFormat.UInt16LE, sndInstrPtr + 6, (beg * volume) >> 6)
                    sndInstr.setNumber(NumberFormat.UInt16LE, sndInstrPtr + 8, (end * volume) >> 6)
                    sndInstrPtr += 10
                }
                sndInstr.setNumber(NumberFormat.UInt8LE, sndInstrPtr, 0) // terminate
            }

            const scanNextNote = () => {
                if (!this.melody)
                    return ""

                // eat space
                while (pos < notes.length) {
                    const c = notes[pos];
                    if (c != ' ' && c != '\r' && c != '\n' && c != '\t')
                        break;
                    pos++;
                }

                // read note
                let note = "";
                while (pos < notes.length) {
                    const c = notes[pos];
                    if (c == ' ' || c == '\r' || c == '\n' || c == '\t')
                        break;
                    note += c;
                    pos++;
                }
                return note;
            }

            enum Token {
                Note,
                Octave,
                Beat,
                Tempo,
                Hz,
                Ms,
                WaveForm,
                EnvelopeA,
                EnvelopeD,
                EnvelopeS,
                EnvelopeR,
            }

            let token: string = "";
            let tokenKind = Token.Note;

            // [ABCDEFG] (\d+)  (:\d+)  (-\d+)
            // note      octave length  tempo
            // R (:\d+) - rest
            // !\d+,\d+ - sound at frequency with given length (Hz,ms); !\d+ and !\d+,:\d+ also possible
            // @\d+,\d+,\d+,\d+ - ADSR envelope - ms,ms,volume,ms; volume is 0-255
            // ~\d+ - wave form:
            //   1 - triangle
            //   2 - sawtooth
            //   3 - sine
            //   4 - noise
            //   11 - square 10%
            //   12 - square 20%
            //   ...
            //   15 - square 50%
            //

            const consumeToken = () => {
                if (token && tokenKind != Token.Note) {
                    const d = parseInt(token);
                    switch (tokenKind) {
                        case Token.Octave: octave = d; break;
                        case Token.Beat:
                            duration = Math.max(1, Math.min(16, d));
                            ms = -1;
                            break;
                        case Token.Tempo: tempo = Math.max(1, d); break;
                        case Token.Hz: hz = d; tokenKind = Token.Ms; break;
                        case Token.Ms: ms = d; break;
                        case Token.WaveForm: soundWave = Math.clamp(1, 15, d); break;
                        case Token.EnvelopeA: envA = d; tokenKind = Token.EnvelopeD; break;
                        case Token.EnvelopeD: envD = d; tokenKind = Token.EnvelopeS; break;
                        case Token.EnvelopeS: envS = Math.clamp(0, 255, d); tokenKind = Token.EnvelopeR; break;
                        case Token.EnvelopeR: envR = d; break;
                    }
                    token = "";
                }
            }

            while (true) {
                let currNote = scanNextNote();
                if (!currNote)
                    return;

                hz = -1;

                let note: number = 0;
                token = "";
                tokenKind = Token.Note;

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
                        case 'r': case 'R': hz = 0; break;
                        case '#': note++; break;
                        case 'b': note--; break; // doesn't do anything
                        case ',':
                            consumeToken();
                            break;
                        case '!':
                            tokenKind = Token.Hz;
                            break;
                        case '@':
                            consumeToken();
                            tokenKind = Token.EnvelopeA;
                            break;
                        case '~':
                            consumeToken();
                            tokenKind = Token.WaveForm;
                            break;
                        case ':':
                            consumeToken();
                            tokenKind = Token.Beat;
                            break;
                        case '-':
                            consumeToken();
                            tokenKind = Token.Tempo;
                            break;
                        default:
                            if (tokenKind == Token.Note)
                                tokenKind = Token.Octave;
                            token += noteChar;
                            break;
                    }
                }
                consumeToken();

                if (note && hz < 0) {
                    const keyNumber = note + (12 * (octave - 1));
                    hz = freqs.getNumber(NumberFormat.UInt16LE, keyNumber * 2) || 0;
                }

                let currMs = ms

                if (currMs < 0) {
                    const beat = 15000 / tempo;
                    currMs = duration * beat
                }

                if (hz <= 0) {
                    pause(currMs)
                } else {
                    sndInstrPtr = 0
                    addForm(envA, 0, 255)
                    addForm(envD, 255, envS)
                    addForm(currMs - (envA + envD), envS, envS)
                    addForm(envR, envS, 0)

                    playInstructions(sndInstr)
                }
            }
        }
    }

    //% fixedInstance whenUsed block="ba ding"
    export const baDing = new Melody('b5:1 e6:3')

    //% fixedInstance whenUsed block="wawawawaa"
    export const wawawawaa = new Melody('e3:3 r:1 d#:3 r:1 d:4 r:1 c#:8')

    //% fixedInstance whenUsed block="jump up"
    export const jumpUp = new Melody('c5:1 d e f g')

    //% fixedInstance whenUsed block="jump down"
    export const jumpDown = new Melody('g5:1 f e d c')

    //% fixedInstance whenUsed block="power up"
    export const powerUp = new Melody('g4:1 c5 e g:2 e:1 g:3')

    //% fixedInstance whenUsed block="power down"
    export const powerDown = new Melody('g5:1 d# c g4:2 b:1 c5:3')

    //% fixedInstance whenUsed block="magic wand"
    export const magicWand = new Melody('F#6:1-300 G# A# B C7# D# F F# G# A# B:6')
    //A#7:1-200 A:1 A#7:1 A:1 A#7:2

    //% fixedInstance whenUsed block="siren"
    export const siren = new Melody('a4 d5 a4 d5 a4 d5')
}
