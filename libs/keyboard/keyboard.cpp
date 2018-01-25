// https://github.com/lancaster-university/codal-core/blob/master/source/drivers/HIDKeyboard.cpp

#include "pxt.h"

namespace keyboard {
    /**
    * Sends a sequence of keystrokes to the keyboard
    */
    //% blockId=keyboardType block="keyboard type %text"
    void type(String text) {
        ManagedString s(text)
        pxt::keyboard.type(s);
    }
}