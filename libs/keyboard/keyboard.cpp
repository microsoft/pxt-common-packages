// https://github.com/lancaster-university/codal-core/blob/master/source/drivers/HIDKeyboard.cpp

#include "pxt.h"
#include "USB_HID_Keys.h"

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

enum class KeyboardModifierKey {
    //% block="CTRL"
    Control = KEY_MOD_LCTRL,
    //% block="SHIFT"
    Shift = KEY_MOD_LSHIFT,
    //% block="ALT"
    Alt = KEY_MOD_LALT,
    //% block="META"
    Meta = KEY_MOD_LMETA,
    //% block="Right CTRL"
    RightControl = KEY_MOD_RCTRL,
    //% block="Right SHIFT"
    RightShift = KEY_MOD_RSHIFT,
    //% block="Right ALT"
    RightAlt = KEY_MOD_RALT,
    //% block="Right META"
    RightMeta = KEY_MOD_RMETA
};

namespace keyboard {
    //% 
    void __type(String text) {
        if (NULL != text)
            pxt::keyboard.type(text->getUTF8Data(), text->getUTF8Size());
    }

    //%
    void __key(uint16_t ckey, KeyboardKeyEvent event) {
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

    //%
    void __mediaKey(KeyboardMediaKey key, KeyboardKeyEvent event) {
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

    //%
    void __functionKey(KeyboardFunctionKey key, KeyboardKeyEvent event) {
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

    //%
    void __modifierKey(KeyboardModifierKey modifier, KeyboardKeyEvent event) {
       const Key key = { .reg = KEYMAP_KEY_DOWN | KEYMAP_MODIFIER_KEY | (uint8_t)modifier };
        // send keys
        switch(event) {
            case KeyboardKeyEvent::Down:
                pxt::keyboard.keyDown(key);
                break;
            case KeyboardKeyEvent::Up:
                pxt::keyboard.keyUp(key);
                break;
            case KeyboardKeyEvent::Press:
                pxt::keyboard.press(key);
                break;
        };
    }
}