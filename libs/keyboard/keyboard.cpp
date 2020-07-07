// https://github.com/lancaster-university/codal-core/blob/master/source/drivers/HIDKeyboard.cpp

#include "pxt.h"
#include "USB_HID_Keys.h"

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
    void __flush() {
        pxt::keyboard.flush();
    }

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
    void __mediaKey(uint16_t key, KeyboardKeyEvent event) {
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
    void __functionKey(uint16_t key, KeyboardKeyEvent event) {
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