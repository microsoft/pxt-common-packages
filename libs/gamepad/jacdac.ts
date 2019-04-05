namespace jacdac {
    //% fixedInstances
    export class GamepadService extends Host {
        constructor() {
            super("gpad", jacdac.GAMEPAD_DEVICE_CLASS);
        }

        handlePacket(pkt: Buffer): number {
            const packet = new JDPacket(pkt);
            const data = packet.data;
            const cmd: JDGamepadCommand = data[0];
            switch (cmd) {
                case JDGamepadCommand.Button:
                    gamepad.setButton(data[1], !!data[2]);
                    break;
                case JDGamepadCommand.Move:
                    const x = data.getNumber(NumberFormat.Int8LE, 2);
                    const y = data.getNumber(NumberFormat.Int8LE, 3);
                    gamepad.move(data[1], x, y)
                    break;
                case JDGamepadCommand.Throttle:
                    gamepad.setThrottle(data[1], data.getNumber(NumberFormat.Int8LE, 2));
                    break;
            }
            return jacdac.DEVICE_OK;
        }
    }

    //% fixedInstance whenUsed block="gamepad service"
    export const gamepadService = new GamepadService();
}