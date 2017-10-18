// This file here only temporarily - to be split into board packages

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
    export const NUM_DOTSTARS = 1;
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
    export const NUM_DOTSTARS = 1;
}

