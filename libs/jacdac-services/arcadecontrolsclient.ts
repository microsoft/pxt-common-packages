namespace jacdac {
    const INTERNAL_KEY_UP = 2050;
    const INTERNAL_KEY_DOWN = 2051;

    //% fixedInstances
    export class ArcadeControlsClient extends Client {
        constructor(requiredDevice: string = null) {
            super("apad", jd_class.ARCADE_CONTROLS, requiredDevice);
        }

        handlePacket(pkt: JDPacket) {
            if (pkt.service_command == CMD_EVENT) {
                const [evid, key] = pkt.data.unpack("II")
                let evsrc = 0
                if (evid == 1)
                    evsrc = INTERNAL_KEY_DOWN
                else if (evid == 2)
                    evsrc = INTERNAL_KEY_UP
                if (!evsrc) return
                control.raiseEvent(evsrc, key)
            }
        }
    }

    //% fixedInstance whenUsed block="arcade controls client"
    export const arcadeControlsClient = new ArcadeControlsClient();
}