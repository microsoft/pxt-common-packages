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
        constructor(requiredDevice: string = null) {
            super("keyb", jd_class.KEYBOARD, requiredDevice);
        }

        /**
        * Sends a sequence of keystrokes to the keyboard
        */
        //% blockId=jdkeyboardType block="%keyboard type %text"
        //% blockGap=8 weight=100
        //% text.shadowOptions.toString=true
        //% group="Keyboard"
        type(type: string) {
            const bufs = Buffer.chunkedFromUTF8(type, JD_SERIAL_MAX_PAYLOAD_SIZE)
            for (let buf of bufs)
                this.sendCommand(JDPacket.from(JDKeyboardCommand.Type, buf))
        }

        /**
        * Sends a key command
        */
        //% blockId=jdkeyboardStandardKey block="%keyboard key %key|%event"
        //% blockGap=8 weight=99
        //% group="Keyboard"
        key(key: string, event: JDKeyboardKeyEvent) {
            this.sendPackedCommand(JDKeyboardCommand.Key, "HH", [event, key.charCodeAt(0)])
        }

        /**
        * Sends a media key command
        */
        //% blockId=jdkeyboardMediaKey block="%keyboard media key %key|%event"
        //% blockGap=8
        //% group="Keyboard"
        mediaKey(key: JDKeyboardMediaKey, event: JDKeyboardKeyEvent) {
            this.sendPackedCommand(JDKeyboardCommand.MediaKey, "HH", [event, key])
        }

        /**
        *
        */
        //% blockId=keyboardFunctionKey block="%keyboard function key %key|%event"
        //% blockGap=8
        //% group="Keyboard"
        functionKey(key: JDKeyboardFunctionKey, event: JDKeyboardKeyEvent) {
            this.sendPackedCommand(JDKeyboardCommand.FunctionKey, "HH", [event, key])
        }
    }

    //% fixedInstance whenUsed block="keyboard client"
    export const keyboardClient = new KeyboardClient();
}