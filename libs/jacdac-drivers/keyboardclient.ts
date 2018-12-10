enum JDKeyboardMediaKey {
    //% block="mute"
    Mute = 0,
    //% block="volume up"
    VolumeUp = 1,
    //% block="volume down"
    VolumeDown = 2,
    //% block="play pause"
    PlayPause = 3,
    //% block="stop"
    Stop = 4,
    //% block="previous track"
    PreviousTrack = 5,
    //% block="next track"
    NextTrack = 6,
    //% block="mail"
    Mail = 7,
    //% block="calculator"
    Calculator = 8,
    //% block="web search"
    WebSearch = 9,
    //% block="web home"
    WebHome = 10,
    //% block="web favourites"
    WebFavourites = 11,
    //% block="web refresh"
    WebRefresh = 12,
    //% block="web stop"
    WebStop = 13,
    //% block="web forward"
    WebForward = 14,
    //% block="web back"
    WebBack = 15,
}


enum JDKeyboardFunctionKey {
    //% block="F1"
    F1Key = 0,
    //% block="F2"
    F2Key = 1,
    //% block="F3"
    F3Key = 2,
    //% block="F4"
    F4Key = 3,
    //% block="F5"
    F5Key = 4,
    //% block="F6"
    F6Key = 5,
    //% block="F7"
    F7Key = 6,
    //% block="F8"
    F8Key = 7,
    //% block="F9"
    F9Key = 8,
    //% block="F0"
    F10Key = 9,
    //% block="F11"
    F11Key = 10,
    //% block="F12"
    F12Key = 11,

    //% block="print screen"
    PrintScreen = 12,
    //% block="scroll lock"
    ScrollLock = 13,
    //% block="pause"
    Pause = 14,
    //% block="insert"
    Insert = 15,
    //% block="home"
    Home = 16,
    //% block="page up"
    PageUp = 17,
    //% block="delete"
    DeleteForward = 18,
    //% block="end"
    End = 19,
    //% block="page down"
    PageDown = 20,

    //% block="right arrow"
    RightArrow = 21,
    //% block="left arrow"
    LeftArrow = 22,
    //% block="down arrow"
    DownArrow = 23,
    //% block="up arrow"
    UpArrow = 24,
}


enum JDKeyboardKeyEvent {
    //% block="press"
    Press = 0,
    //% block="up"
    Up = 1,
    //% block="down"
    Down = 2,
}
namespace jacdac {
    //% fixedInstances
    export class KeyboardClient extends Client {
        constructor() {
            super("keyb", jacdac.KEYBOARD_DEVICE_CLASS);
        }

        /**
        * Sends a sequence of keystrokes to the keyboard
        */
        //% blockId=jdkeyboardType block="%keyboard type %text"
        //% blockGap=8 weight=100
        //% text.shadowOptions.toString=true
        type(type: string) {
            const buf = control.createBuffer(DAL.JD_SERIAL_DATA_SIZE)
            buf[0] = JDKeyboardCommand.Type;
            let n = 0;
            while (n < type.length) {
                const chunk = type.substr(n, buf.length - 1);
                let i = 0;
                for (i = 0; i < chunk.length; ++i)
                    buf[i + 1] = chunk.charCodeAt(i);
                if (i != chunk.length)
                    buf[i] = 0;
                this.sendPacket(buf);
                n += chunk.length;
            }
        }

        /**
        * Sends a key command
        */
        //% blockId=jdkeyboardStandardKey block="%keyboard key %key|%event"
        //% blockGap=8 weight=99
        key(key: string, event: JDKeyboardKeyEvent) {
            const buf = control.createBuffer(3);
            buf[0] = JDKeyboardCommand.Key;
            buf[1] = key.charCodeAt(0);
            buf[2] = event;
        }

        /**
        * Sends a media key command
        */
        //% blockId=jdkeyboardMediaKey block="%keyboard media key %key|%event"
        //% blockGap=8
        mediaKey(key: JDKeyboardMediaKey, event: JDKeyboardKeyEvent) {
            const buf = control.createBuffer(3);
            buf[0] = JDKeyboardCommand.MediaKey;
            buf[1] = key;
            buf[2] = event;
        }

        /**
        *
        */
        //% blockId=keyboardFunctionKey block="%keyboard function key %key|%event"
        //% blockGap=8
        functionKey(key: JDKeyboardFunctionKey, event: JDKeyboardKeyEvent) {
            const buf = control.createBuffer(3);
            buf[0] = JDKeyboardCommand.FunctionKey;
            buf[1] = key;
            buf[2] = event;
        }
    }

    //% fixedInstance whenUsed block="keyboard"
    export const keyboardClient = new KeyboardClient();
}