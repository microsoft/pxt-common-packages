namespace jacdac {

    //% fixedInstances
    export class KeyboardService extends Host {
        constructor() {
            super("keyb", jd_class.KEYBOARD);
        }

        handlePacket(packet: JDPacket) {
            const data = packet.data;
            const payload = data.unpack("I")[0];
            switch (packet.service_command) {
                case JDKeyboardCommand.Type:
                    keyboard.type(packet.data.toString());
                    break;
                case JDKeyboardCommand.Key: {
                    const key = String.fromCharCode(payload);
                    const ev: KeyboardKeyEvent = packet.service_argument;
                    keyboard.key(key, ev);
                    break;
                }
                case JDKeyboardCommand.MediaKey: {
                    const key: KeyboardMediaKey = payload;
                    const ev: KeyboardKeyEvent = packet.service_argument;
                    keyboard.mediaKey(key, ev);
                    break;
                }
                case JDKeyboardCommand.FunctionKey: {
                    const key: KeyboardFunctionKey = payload;
                    const ev: KeyboardKeyEvent = packet.service_argument;
                    keyboard.functionKey(key, ev);
                    break;
                }
            }
        }
    }

    //% fixedInstance whenUsed block="keyboard service"
    export const keyboardService = new KeyboardService();
}