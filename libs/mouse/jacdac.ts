namespace jacdac {
    //% fixedInstances
    export class MouseService extends Host {
        constructor() {
            super("mous", jd_class.MOUSE);
        }

        handlePacket(packet: JDPacket) {
            const data = packet.data
            switch (packet.service_command) {
                case JDMouseCommand.Button:
                    const btns = data[0];
                    const down = !!data[1];
                    mouse.setButton(btns, down);
                    break;
                case JDMouseCommand.Move:
                    const [x, y] = data.unpack("bb")
                    mouse.move(x, y);
                    break;
                case JDMouseCommand.TurnWheel:
                    const [w] = data.unpack("b")
                    mouse.turnWheel(w);
                    break;
            }
        }
    }

    //% fixedInstance whenUsed block="mouse service"
    export const mouseService = new MouseService();
}