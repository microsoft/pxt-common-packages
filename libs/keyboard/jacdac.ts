namespace jacdac {

    //% fixedInstances
    export class KeyboardService extends Host {
        constructor() {
            super("keyb", jd_class.KEYBOARD);
        }

        handlePacket(packet: JDPacket) {
            const data = packet.data;
            const [payload, ev0] = data.unpack("Ib");
            const ev: KeyboardKeyEvent = ev0;
            switch (packet.service_command) {
                case JDKeyboardCommand.Type:
                    keyboard.type(packet.data.toString());
                    break;
                case JDKeyboardCommand.Key: {
                    const key = String.fromCharCode(payload);
                    keyboard.key(key, ev);
                    break;
                }
                case JDKeyboardCommand.MediaKey: {
                    const key: KeyboardMediaKey = payload;
                    keyboard.mediaKey(key, ev);
                    break;
                }
                case JDKeyboardCommand.FunctionKey: {
                    const key: KeyboardFunctionKey = payload;
                    keyboard.functionKey(key, ev);
                    break;
                }
            }
        }
    }

    //% fixedInstance whenUsed block="keyboard service"
    export const keyboardService = new KeyboardService();
}