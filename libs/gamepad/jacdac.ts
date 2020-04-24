namespace jacdac {
    //% fixedInstances
    export class GamepadService extends Host {
        constructor() {
            super("gpad", jd_class.GAMEPAD);
        }

        handlePacket(packet: JDPacket) {
            const data = packet.data;
            const cmd: JDGamepadCommand = data[0];
            switch (packet.service_command) {
                case JDGamepadCommand.Button:
                    gamepad.setButton(data[0], !!data[1]);
                    break;
                case JDGamepadCommand.Move: {
                    const [idx, x, y] = data.unpack("Bbb");
                    gamepad.move(idx, x, y)
                    break;
                }
                case JDGamepadCommand.Throttle: {
                    const [idx, val] = data.unpack("Bb");
                    gamepad.setThrottle(idx, val);
                    break;
                }
            }
        }
    }

    //% fixedInstance whenUsed block="gamepad service"
    export const gamepadService = new GamepadService();
}