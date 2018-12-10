// https://github.com/lancaster-university/codal-core/blob/master/source/drivers/HIDKeyboard.cpp

#include "hid.h"

namespace keyboard {
    /**
    * Sends a sequence of keystrokes to the keyboard
    */
    //% blockId=keyboardType block="keyboard type %text"
    //% blockGap=8 weight=100
    //% text.shadowOptions.toString=true
    void type(String text) {
        if (NULL != text)
            pxt::keyboard.type(text->data, text->length);
    }

    /**
    * Sends a key command
    */
    //% blockId=keyboardStandardKey block="keyboard key %key|%event"
    //% blockGap=8 weight=99
    void key(String key, KeyboardKeyEvent event) {
        if (!key->length) return;
        uint16_t ckey = key->data[0];
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