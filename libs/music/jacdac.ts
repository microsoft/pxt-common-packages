namespace jacdac {
    //% fixedInstances
    export class MusicService extends Host {
        constructor() {
            super("mus", jacdac.MUSIC_DEVICE_CLASS);
        }

        handlePacket(pkt: Buffer): boolean {
            const packet = new JDPacket(pkt);
            const data = packet.data;
            const cmd: JDMusicCommand = data[0];
            switch(cmd) {
                case JDMusicCommand.PlayTone:
                    const freq = data.getNumber(NumberFormat.UInt32LE, 1);
                    const duration = data.getNumber(NumberFormat.UInt32LE, 5);
                    music.playTone(freq, duration);
                    break;
            }
            return true;
        }
    }

    //% fixedInstance whenUsed block="music service"
    export const musicService = new MusicService();
}