// This file here only temporarily - to be split into board packages

// Zero
// Arduino M0 (but not Zero) has D2 and D4 swapped
declare namespace pins {
    //% fixedInstance shim=pxt::getPin(2)
    const A0: PwmPin;
    //% fixedInstance shim=pxt::getPin(40)
    const A1: PwmPin;
    //% fixedInstance shim=pxt::getPin(41)
    const A2: PwmPin;
    //% fixedInstance shim=pxt::getPin(4)
    const A3: PwmPin;
    //% fixedInstance shim=pxt::getPin(5)
    const A4: PwmPin;
    //% fixedInstance shim=pxt::getPin(34)
    const A5: PwmPin;

    //% fixedInstance shim=pxt::getPin(11)
    const D0: PwmPin;
    //% fixedInstance shim=pxt::getPin(10)
    const D1: PwmPin;
    //% fixedInstance shim=pxt::getPin(14)
    const D2: DigitalPin;
    //% fixedInstance shim=pxt::getPin(9)
    const D3: PwmPin;
    //% fixedInstance shim=pxt::getPin(8)
    const D4: PwmPin;
    //% fixedInstance shim=pxt::getPin(15)
    const D5: DigitalPin;
    //% fixedInstance shim=pxt::getPin(20)
    const D6: DigitalPin;
    //% fixedInstance shim=pxt::getPin(21)
    const D7: DigitalPin;

    //% fixedInstance shim=pxt::getPin(6)
    const D8: PwmPin;
    //% fixedInstance shim=pxt::getPin(7)
    const D9: PwmPin;
    //% fixedInstance shim=pxt::getPin(18)
    const D10: DigitalPin;
    //% fixedInstance shim=pxt::getPin(16)
    const D11: DigitalPin;
    //% fixedInstance shim=pxt::getPin(19)
    const D12: DigitalPin;
    //% fixedInstance shim=pxt::getPin(17)
    const D13: DigitalPin;
    //% fixedInstance shim=pxt::getPin(17)
    const LED: DigitalPin;
    //% fixedInstance shim=pxt::getPin(35)
    const RX: PwmPin;
    //% fixedInstance shim=pxt::getPin(27)
    const TX: DigitalPin;
    //% fixedInstance shim=pxt::getPin(12)
    const MISO: DigitalPin;
    //% fixedInstance shim=pxt::getPin(42)
    const MOSI: DigitalPin;
    //% fixedInstance shim=pxt::getPin(43)
    const SCK: DigitalPin;
    //% fixedInstance shim=pxt::getPin(23)
    const SCL: DigitalPin;
    //% fixedInstance shim=pxt::getPin(22)
    const SDA: DigitalPin;

    // TODO only checked the following two for Metro M0
    //% fixedInstance shim=pxt::getPin(31)
    const RXLED: DigitalPin;
    //% fixedInstance shim=pxt::getPin(27)
    const TXLED: DigitalPin;
    //% fixedInstance shim=pxt::getPin(30)
    const NEOPIXEL: DigitalPin;
}


// CPX
declare namespace pins {
    // pin-pads
    //% fixedInstance shim=pxt::getPin(2)
    const A0: PwmPin;
    //% fixedInstance shim=pxt::getPin(5)
    const A1: PwmPin;
    //% fixedInstance shim=pxt::getPin(6)
    const A2: PwmPin;
    //% fixedInstance shim=pxt::getPin(7)
    const A3: PwmPin;

    //% fixedInstance shim=pxt::getPin(35)
    const A4: PwmPin;
    //% fixedInstance shim=pxt::getPin(34)
    const A5: PwmPin;
    //% fixedInstance shim=pxt::getPin(41)
    const A6: PwmPin;
    //% fixedInstance shim=pxt::getPin(40)
    const A7: PwmPin;

    // Define aliases, as Digital Pins

    //% fixedInstance shim=pxt::getPin(35)
    const SCL: DigitalPin;
    //% fixedInstance shim=pxt::getPin(34)
    const SDA: DigitalPin;
    //% fixedInstance shim=pxt::getPin(41)
    const RX: DigitalPin;
    //% fixedInstance shim=pxt::getPin(40)
    const TX: DigitalPin;

    // Aliases for built-in components

    //% fixedInstance shim=pxt::getPin(28)
    const D4: DigitalPin; // A
    //% fixedInstance shim=pxt::getPin(14)
    const D5: DigitalPin; // B
    //% fixedInstance shim=pxt::getPin(15)
    const D7: DigitalPin; // Slide
    //% fixedInstance shim=pxt::getPin(55)
    const D8: DigitalPin; // Neopixel
    //% fixedInstance shim=pxt::getPin(8)
    const A10: PwmPin; // mic
    //% fixedInstance shim=pxt::getPin(11)
    const A8: PwmPin; // light
    //% fixedInstance shim=pxt::getPin(9)
    const A9: PwmPin;
}
namespace config {
    export const PIN_FLASH_MISO = 16;
    export const PIN_FLASH_MOSI = 20;
    export const PIN_FLASH_SCK = 21;
    export const PIN_FLASH_CS = 54;
    export const PIN_MIC_DATA = 8;
    export const PIN_MIC_CLOCK = 10;
    export const PIN_BTN_A = 28;
    export const PIN_BTN_B = 14;
    export const PIN_BTN_SLIDE = 15;
    export const PIN_NEOPIXEL = 55;
    export const PIN_SPEAKER_AMP = 30;
    export const PIN_MICROPHONE = 8;
    export const PIN_LIGHT = 11;
    export const PIN_ACCELEROMETER_SDA = 0;
    export const PIN_ACCELEROMETER_SCL = 1;
    export const PIN_ACCELEROMETER_INT = 13;
    export const PIN_LED = 17;
    export const PIN_TEMPERATURE = 9;
    export const PIN_IR_OUT = 23;
    export const PIN_IR_IN = 12;
    export const NUM_NEOPIXELS = 10;
}


// Feather
declare namespace pins {
    //% fixedInstance shim=pxt::getPin(2)
    const A0: PwmPin;
    //% fixedInstance shim=pxt::getPin(40)
    const A1: PwmPin;
    //% fixedInstance shim=pxt::getPin(41)
    const A2: PwmPin;
    //% fixedInstance shim=pxt::getPin(4)
    const A3: PwmPin;
    //% fixedInstance shim=pxt::getPin(5)
    const A4: PwmPin;
    //% fixedInstance shim=pxt::getPin(34)
    const A5: PwmPin;
    //% fixedInstance shim=pxt::getPin(11)
    const D0: PwmPin;
    //% fixedInstance shim=pxt::getPin(10)
    const D1: PwmPin;
    //% fixedInstance shim=pxt::getPin(11)
    const RX: PwmPin;
    //% fixedInstance shim=pxt::getPin(10)
    const TX: PwmPin;

    //% fixedInstance shim=pxt::getPin(15)
    const D5: DigitalPin;
    //% fixedInstance shim=pxt::getPin(20)
    const D6: DigitalPin;
    //% fixedInstance shim=pxt::getPin(7)
    const D9: PwmPin;
    //% fixedInstance shim=pxt::getPin(18)
    const D10: DigitalPin;
    //% fixedInstance shim=pxt::getPin(16)
    const D11: DigitalPin;
    //% fixedInstance shim=pxt::getPin(19)
    const D12: DigitalPin;
    //% fixedInstance shim=pxt::getPin(17)
    const D13: DigitalPin;
    //% fixedInstance shim=pxt::getPin(17)
    const LED: DigitalPin;
    //% fixedInstance shim=pxt::getPin(12)
    const MISO: DigitalPin;
    //% fixedInstance shim=pxt::getPin(42)
    const MOSI: DigitalPin;
    //% fixedInstance shim=pxt::getPin(43)
    const SCK: DigitalPin;
    //% fixedInstance shim=pxt::getPin(23)
    const SCL: DigitalPin;
    //% fixedInstance shim=pxt::getPin(22)
    const SDA: DigitalPin;
}


// Gemma
declare namespace pins {
    //% fixedInstance shim=pxt::getPin(2)
    const D1: PwmPin;
    //% fixedInstance shim=pxt::getPin(4)
    const D0: PwmPin;
    //% fixedInstance shim=pxt::getPin(5)
    const D2: PwmPin;

    //% fixedInstance shim=pxt::getPin(2)
    const A0: PwmPin;
    //% fixedInstance shim=pxt::getPin(4)
    const A2: PwmPin;
    //% fixedInstance shim=pxt::getPin(5)
    const A1: PwmPin;

    //% fixedInstance shim=pxt::getPin(17)
    const D13: DigitalPin;
    //% fixedInstance shim=pxt::getPin(17)
    const LED: DigitalPin;

    //% fixedInstance shim=pxt::getPin(4)
    const SDA: DigitalPin;
    //% fixedInstance shim=pxt::getPin(5)
    const SCL: DigitalPin;

    //% fixedInstance shim=pxt::getPin(4)
    const TX: DigitalPin;
    //% fixedInstance shim=pxt::getPin(5)
    const RX: DigitalPin;

}
namespace config {
    export const PIN_DOTSTAR_DATA = 0;
    export const PIN_DOTSTAR_CLOCK = 1;
    export const NUM_DOTSTAR = 1;
}


// Trinket
declare namespace pins {
    //% fixedInstance shim=pxt::getPin(8)
    const D0: PwmPin;
    //% fixedInstance shim=pxt::getPin(2)
    const D1: PwmPin;
    //% fixedInstance shim=pxt::getPin(9)
    const D2: PwmPin;
    //% fixedInstance shim=pxt::getPin(7)
    const D3: PwmPin;
    //% fixedInstance shim=pxt::getPin(6)
    const D4: PwmPin;

    //% fixedInstance shim=pxt::getPin(8)
    const A4: PwmPin;
    //% fixedInstance shim=pxt::getPin(2)
    const A0: PwmPin;
    //% fixedInstance shim=pxt::getPin(9)
    const A1: PwmPin;
    //% fixedInstance shim=pxt::getPin(7)
    const A3: PwmPin;
    //% fixedInstance shim=pxt::getPin(6)
    const A2: PwmPin;

    //% fixedInstance shim=pxt::getPin(17)
    const D13: DigitalPin;
    //% fixedInstance shim=pxt::getPin(17)
    const LED: DigitalPin;

    //% fixedInstance shim=pxt::getPin(8)
    const SDA: DigitalPin;
    //% fixedInstance shim=pxt::getPin(9)
    const SCL: DigitalPin;

    //% fixedInstance shim=pxt::getPin(7)
    const SCK: DigitalPin;
    //% fixedInstance shim=pxt::getPin(9)
    const MISO: DigitalPin;
    //% fixedInstance shim=pxt::getPin(6)
    const MOSI: DigitalPin;

    //% fixedInstance shim=pxt::getPin(7)
    const RX: DigitalPin;
    //% fixedInstance shim=pxt::getPin(6)
    const TX: DigitalPin;
}
namespace config {
    export const PIN_DOTSTAR_DATA = 0;
    export const PIN_DOTSTAR_CLOCK = 1;
    export const NUM_DOTSTAR = 1;
}

