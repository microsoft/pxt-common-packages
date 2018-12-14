namespace jacdac {
    //% fixedInstances
    export class MusicClient extends Client {
        constructor() {
            super("mus", jacdac.MUSIC_DEVICE_CLASS);
        }

        /**
         * Set the output volume of the sound synthesizer.
         * @param volume the volume 0...256, eg: 128
         */
        //% blockId=synth_set_volume block="set %music volume %volume"
        //% volume.min=0 volume.max=256
        //% help=music/set-volume
        //% weight=70
        //% group="Music"
        setVolume(volume: number): void {
            const buf = control.createBuffer(2);
            buf[0] = JDMusicCommand.SetVolume;
            buf[1] = volume;
            this.sendPacket(buf);
        }

        /**
         * Play a tone through the speaker for some amount of time.
         * @param frequency pitch of the tone to play in Hertz (Hz), eg: Note.C
         * @param ms tone duration in milliseconds (ms), eg: BeatFraction.Half
         */
        //% help=music/play-tone
        //% blockId=music_play_note block="play %music tone|at %note=device_note|for %duration=device_beat"
        //% blockNamespace=music
        //% weight=76 blockGap=8
        //% group="Music"
        playTone(frequency: int32, ms: int32): void {
            const buf = control.createBuffer(9);
            buf[0] = JDMusicCommand.PlayTone;
            buf.setNumber(NumberFormat.UInt32LE, 1, frequency);
            buf.setNumber(NumberFormat.UInt32LE, 5, ms);
            this.sendPacket(buf);
        }
    }

    //% fixedInstance whenUsed block="music"
    export const musicClient = new MusicClient();
}