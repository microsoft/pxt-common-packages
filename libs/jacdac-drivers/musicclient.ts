namespace jacdac {
    //% fixedInstances
    export class MusicClient extends Client {
        constructor() {
            super("mus", jacdac.MUSIC_DEVICE_CLASS);
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
        
        static debugView(): DebugView {
            return new MusicDebugView();
        }
    }

    //% fixedInstance whenUsed block="music"
    export const musicClient = new MusicClient();

    class MusicDebugView extends DebugView {        
        constructor() {
            super("music", jacdac.MUSIC_DEVICE_CLASS);
        }

        renderPacket(device: JDDevice, packet: JDPacket) {
            const data = packet.data;
            const cmd = data[0];
            switch(cmd) {
                case JDMusicCommand.PlayTone:   
                    return `tone ${data.getNumber(NumberFormat.UInt32LE, 1)} ${data.getNumber(NumberFormat.UInt32LE, 5)}`;
                default:
                    return "";
            }
        }
    }
}