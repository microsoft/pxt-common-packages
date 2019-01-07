// https://github.com/lancaster-university/codal-core/blob/master/source/drivers/HIDKeyboard.cpp

#include "pxt.h"

enum class KeyboardMediaKey
{
    //% block="mute"
    Mute,
    //% block="volume up"
    VolumeUp,
    //% block="volume down"
    VolumeDown,
    //% block="play pause"
    PlayPause,
    //% block="stop"
    Stop,
    //% block="previous track"
    PreviousTrack,
    //% block="next track"
    NextTrack,
    //% block="mail"
    Mail,
    //% block="calculator"
    Calculator,
    //% block="web search"
    WebSearch,
    //% block="web home"
    WebHome,
    //% block="web favourites"
    WebFavourites,
    //% block="web refresh"
    WebRefresh,
    //% block="web stop"
    WebStop,
    //% block="web forward"
    WebForward,
    //% block="web back"
    WebBack
};

enum class KeyboardFunctionKey
{
    //% block="F1"
    F1Key,  
    //% block="F2"
    F2Key,
    //% block="F3"
    F3Key,
    //% block="F4"
    F4Key, 
    //% block="F5"
    F5Key,
    //% block="F6"
    F6Key,
    //% block="F7"
    F7Key,
    //% block="F8"
    F8Key,
    //% block="F9"
    F9Key,
    //% block="F0"
    F10Key,
    //% block="F11"
    F11Key,
    //% block="F12"
    F12Key,

    //% block="print screen"
    PrintScreen,
    //% block="scroll lock"
    ScrollLock,
    //% block="pause"
    Pause,
    //% block="insert"
    Insert,
    //% block="home"
    Home,
    //% block="page up"
    PageUp,
    //% block="delete"
    DeleteForward,
    //% block="end"
    End,
    //% block="page down"
    PageDown,

    //% block="right arrow"
    RightArrow,
    //% block="left arrow"
    LeftArrow,
    //% block="down arrow"
    DownArrow,
    //% block="up arrow"
    UpArrow,
};

enum class KeyboardKeyEvent {
    //% block="press"
    Press,
    //% block="up"
    Up,
    //% block="down"
    Down
};

namespace keyboard {
    /**
    * Sends a sequence of keystrokes to the keyboard
    */
    //% blockId=keyboardType block="keyboard type %text"
    //% blockGap=8 weight=100
    //% text.shadowOptions.toString=true
    void type(String text) {
        if (NULL != text)
            pxt::keyboard.type(text->getUTF8Data(), text->getUTF8Size());
    }

    /**
    * Sends a key command
    */
    //% blockId=keyboardStandardKey block="keyboard key %key|%event"
    //% blockGap=8 weight=99
    void key(String key, KeyboardKeyEvent event) {
        if (!key->getUTF8Size()) return;
        uint16_t ckey = key->getUTF8Data()[0];
        switch(event) {
            case KeyboardKeyEvent::Down:
                pxt::keyboard.keyDown(ckey);
                break;
            case KeyboardKeyEvent::Up:
                pxt::keyboard.keyUp(ckey);
                break;
            case KeyboardKeyEvent::Press:
                pxt::keyboard.press(ckey);
                break;
        }
    }

    /**
    * Sends a media key command
    */
    //% blockId=keyboardMediaKey block="keyboard media key %key|%event"
    //% blockGap=8
    void mediaKey(KeyboardMediaKey key, KeyboardKeyEvent event) {
        codal::MediaKey ckey = (codal::MediaKey)((int)codal::MediaKey::Mute + (int)key);
        switch(event) {
            case KeyboardKeyEvent::Down:
                pxt::keyboard.keyDown(ckey);
                break;
            case KeyboardKeyEvent::Up:
                pxt::keyboard.keyUp(ckey);
                break;
            case KeyboardKeyEvent::Press:
                pxt::keyboard.press(ckey);
                break;
        }
    }

    /**
    *
    */
    //% blockId=keyboardFunctionKey block="keyboard function key %key|%event"
    //% blockGap=8
    void functionKey(KeyboardFunctionKey key, KeyboardKeyEvent event) {
        codal::FunctionKey ckey = (codal::FunctionKey)((int)codal::FunctionKey::F1Key + (int)key);
        switch(event) {
            case KeyboardKeyEvent::Down:
                pxt::keyboard.keyDown(ckey);
                break;
            case KeyboardKeyEvent::Up:
                pxt::keyboard.keyUp(ckey);
                break;
            case KeyboardKeyEvent::Press:
                pxt::keyboard.press(ckey);
                break;
        }
    }
}