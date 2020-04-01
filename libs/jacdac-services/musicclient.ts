namespace jacdac {
    //% fixedInstances
    export class MusicClient extends Client {
        constructor(requiredDevice: string = null) {
            super("mus", jd_class.MUSIC, requiredDevice);
        }

        /**
         * Play a tone through the speaker for some amount of time.
         * @param frequency pitch of the tone to play in Hertz (Hz), eg: 440
         * @param ms tone duration in milliseconds (ms), eg: 500
         */
        //% blockId=jdmusic_play_note block="play %music tone|at %note|for %duration"
        //% note.defl=440
        //% duration.defl=500
        //% weight=76 blockGap=8
        //% group="Music"
        playTone(frequency: number, ms: number): void {
            this.sendPackedCommand(
                JDMusicCommand.PlayTone, "II", [frequency, ms])
        }
    }

    //% fixedInstance whenUsed block="music client"
    export const musicClient = new MusicClient();
}