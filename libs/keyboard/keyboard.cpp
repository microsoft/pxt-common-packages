// https://github.com/lancaster-university/codal-core/blob/master/source/drivers/HIDKeyboard.cpp

#include "pxt.h"

enum class KeyboardMediaKey
{
    Mute,
    VolumeUp,
    VolumeDown,
    PlayPause,
    Stop,
    PreviousTrack,
    NextTrack,
    Mail,
    Calculator,
    WebSearch,
    WebHome,
    WebFavourites,
    WebRefresh,
    WebStop,
    WebForward,
    WebBack
};

enum class KeyboardFunctionKey
{
    F1Key,  
    F2Key,
    F3Key,
    F4Key, 
    F5Key,
    F6Key,
    F7Key,
    F8Key,
    F9Key,
    F10Key,
    F11Key,
    F12Key,

    PrintScreen,
    ScrollLock,
    CapsLock,
    NumLock,
    Insert,
    Home,
    PageUp,
    PageDown,

    RightArrow,
    LeftArrow,
    DownArrow,
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
    //% blockGap=8
    void type(String text) {
        if (NULL != text)
            pxt::keyboard.type(text->data, text->length);
    }

    /**
    * Sends a media key command
    */
    //% blockId=keyboardMediaKey block="keyboard media key %key|%event"
    //% blockGap=8
    void mediaKey(KeyboardMediaKey key, KeyboardKeyEvent event) {
        codal::MediaKey ckey = (codal::MediaKey)(codal::MediaKey::Mute + key)
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
    //% blockId=keyboardMediaKey block="keyboard function key %key|%event"
    //% blockGap=8
    void functionKey(KeyboardFunctionKey key, KeyboardKeyEvent event) {
        codal::FunctionKey ckey = (codal::FunctionKey)(codal::FunctionKey::F1Key + key)
        switch(event) {
            case KeyboardKeyEvent::Down:
                pxt::keyboard.keyDown((codal::FunctionKey)key);
                break;
            case KeyboardKeyEvent::Up:
                pxt::keyboard.keyUp((codal::FunctionKey)key);
                break;
            case KeyboardKeyEvent::Press:
                pxt::keyboard.press((codal::FunctionKey)key);
                break;
        }
    }
}