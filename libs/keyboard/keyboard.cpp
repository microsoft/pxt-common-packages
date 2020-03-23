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
    UpArrow = KEY_UP,
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
        codal::FunctionKey ckey = (codal::FunctionKey)(int)key;
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
    void __comboKey(int reg, int modifier, KeyboardKeyEvent event) {
        codal::Key ckey[] = {        
            { 
            .reg = KEYMAP_KEY_DOWN | reg,
            .modifier = modifier 
            },
        };
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