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
    F1Key = KEY_F1,  
    //% block="F2"
    F2Key = KEY_F2,
    //% block="F3"
    F3Key = KEY_F3,
    //% block="F4"
    F4Key = KEY_F4, 
    //% block="F5"
    F5Key = KEY_F5,
    //% block="F6"
    F6Key = KEY_F6,
    //% block="F7"
    F7Key = KEY_F7,
    //% block="F8"
    F8Key = KEY_F8,
    //% block="F9"
    F9Key = KEY_F9,
    //% block="F0"
    F10Key = KEY_F10,
    //% block="F11"
    F11Key = KEY_F11,
    //% block="F12"
    F12Key = KEY_F12,
    //% block="F13"
    F13Key = KEY_F13,
    //% block="F14"
    F14Key = KEY_F14,
    //% block="F15"
    F15Key = KEY_F15,
    //% block="F16"
    F16Key = KEY_F16,
    //% block="F17"
    F17Key = KEY_F17,
    //% block="F18"
    F18Key = KEY_F18,
    //% block="F19"
    F19Key = KEY_F19,
    //% block="F20"
    F20Key = KEY_F20,
    //% block="F21"
    F21Key = KEY_F21,
    //% block="F22"
    F22Key = KEY_F22,
    //% block="F23"
    F23Key = KEY_F23,
    //% block="F24"
    F24Key = KEY_F24,


    //% block="print screen"
    PrintScreen = KEY_SYSRQ,
    //% block="scroll lock"
    ScrollLock = KEY_SCROLLLOCK,
    //% block="pause"
    Pause = KEY_PAUSE,
    //% block="insert"
    Insert = KEY_INSERT,
    //% block="home"
    Home = KEY_HOME,
    //% block="page up"
    PageUp = KEY_PAGEUP,
    //% block="delete"
    DeleteForward = KEY_DELETE,
    //% block="end"
    End = KEY_END,
    //% block="page down"
    PageDown = KEY_PAGEDOWN,

    //% block="right arrow"
    RightArrow = KEY_RIGHT,
    //% block="left arrow"
    LeftArrow = KEY_LEFT,
    //% block="down arrow"
    DownArrow = KEY_DOWN,
    //% block="up arrow"
    UpArrow = KEY_UP
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
        codal::FunctionKey ckey = (codal::FunctionKey)key;
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
    void __modifierKey(uint16_t modifier, KeyboardKeyEvent event) {
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