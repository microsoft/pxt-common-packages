namespace jacdac {
    //% fixedInstances
    export class MusicService extends Host {
        constructor() {
            super("mus", jd_class.MUSIC);
        }

        handlePacket(packet: JDPacket) {
            const data = packet.data;
            switch (packet.service_command) {
                case JDMusicCommand.PlayTone:
                    const [freq, duration]  = data.unpack("II")
                    music.playTone(freq, duration);
                    break;
            }
        }
    }

    //% fixedInstance whenUsed block="music service"
    export const musicService = new MusicService();
}