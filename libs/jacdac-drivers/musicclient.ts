namespace jacdac {
    //% fixedInstances
    export class MusicClient extends Client {
        constructor() {
            super("mus", jacdac.MUSIC_DEVICE_CLASS);
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
            const buf = control.createBuffer(9);
            buf[0] = JDMusicCommand.PlayTone;
            buf.setNumber(NumberFormat.UInt32LE, 1, frequency);
            buf.setNumber(NumberFormat.UInt32LE, 5, ms);
            this.sendPacket(buf);
        }
    }

    //% fixedInstance whenUsed block="music client"
    export const musicClient = new MusicClient();
}