namespace jacdac {
    //% fixedInstances
    export class MouseService extends Host {
        constructor() {
            super("mous", jacdac.MOUSE_DEVICE_CLASS);
        }

        handlePacket(packet: JDPacket): number {
            const data = packet.data;
            const cmd: JDMouseCommand = data[0];
            switch (cmd) {
                case JDMouseCommand.Button:
                    const btns = data[1];
                    const down = !!data[2];
                    mouse.setButton(btns, down);
                    break;
                case JDMouseCommand.Move:
                    const x = data.getNumber(NumberFormat.Int8LE, 1);
                    const y = data.getNumber(NumberFormat.Int8LE, 2);
                    mouse.move(x, y);
                    break;
                case JDMouseCommand.TurnWheel:
                    const w = data.getNumber(NumberFormat.Int8LE, 1);
                    mouse.turnWheel(w);
                    break;
            }
            return jacdac.DEVICE_OK;
        }
    }

    //% fixedInstance whenUsed block="mouse service"
    export const mouseService = new MouseService();
}