namespace jacdac {

    //% fixedInstances
    export class KeyboardService extends Host {
        constructor() {
            super("keyb", jacdac.KEYBOARD_DEVICE_CLASS);
        }

        handlePacket(pkt: Buffer): boolean {
            const packet = new JDPacket(pkt);
            const data = packet.data;
            const cmd = data.getNumber(NumberFormat.UInt8LE, 0);
            switch (cmd) {
                case JDKeyboardCommand.Type: {
                    let s = "";
                    for (let i = 1; i < data.length; ++i) {
                        const c = data[i];
                        if (c)
                            s += String.fromCharCode(c);
                    }
                    keyboard.type(s);
                    break;
                }
                case JDKeyboardCommand.Key: {
                    const key = String.fromCharCode(data.getNumber(NumberFormat.UInt8LE, 1));
                    const ev: KeyboardKeyEvent = data.getNumber(NumberFormat.UInt8LE, 2);
                    keyboard.key(key, ev);
                    break;
                }
                case JDKeyboardCommand.MediaKey: {
                    const key: KeyboardMediaKey = data.getNumber(NumberFormat.UInt8LE, 1);
                    const ev: KeyboardKeyEvent = data.getNumber(NumberFormat.UInt8LE, 2);
                    keyboard.mediaKey(key, ev);
                    break;
                }
                case JDKeyboardCommand.FunctionKey: {
                    const key: KeyboardFunctionKey = data.getNumber(NumberFormat.UInt8LE, 1);
                    const ev: KeyboardKeyEvent = data.getNumber(NumberFormat.UInt8LE, 2);
                    keyboard.functionKey(key, ev);
                    break;
                }
            }
            return true;
        }
    }

    //% fixedInstance whenUsed block="keyboard service"
    export const keyboardService = new KeyboardService();
}