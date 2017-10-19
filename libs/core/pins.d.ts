// This file here only temporarily - to be split into board packages

// Feather
declare namespace pins {
    //% fixedInstance shim=pxt::getPin(PA02)
    const A0: PwmPin;
    //% fixedInstance shim=pxt::getPin(PB08)
    const A1: PwmPin;
    //% fixedInstance shim=pxt::getPin(PB09)
    const A2: PwmPin;
    //% fixedInstance shim=pxt::getPin(PA04)
    const A3: PwmPin;
    //% fixedInstance shim=pxt::getPin(PA05)
    const A4: PwmPin;
    //% fixedInstance shim=pxt::getPin(PB02)
    const A5: PwmPin;
    //% fixedInstance shim=pxt::getPin(PA11)
    const D0: PwmPin;
    //% fixedInstance shim=pxt::getPin(PA10)
    const D1: PwmPin;
    //% fixedInstance shim=pxt::getPin(PA11)
    const RX: PwmPin;
    //% fixedInstance shim=pxt::getPin(PA10)
    const TX: PwmPin;

    //% fixedInstance shim=pxt::getPin(PA15)
    const D5: DigitalPin;
    //% fixedInstance shim=pxt::getPin(PA20)
    const D6: DigitalPin;
    //% fixedInstance shim=pxt::getPin(PA07)
    const D9: PwmPin;
    //% fixedInstance shim=pxt::getPin(PA18)
    const D10: DigitalPin;
    //% fixedInstance shim=pxt::getPin(PA16)
    const D11: DigitalPin;
    //% fixedInstance shim=pxt::getPin(PA19)
    const D12: DigitalPin;
    //% fixedInstance shim=pxt::getPin(PA17)
    const D13: DigitalPin;
    //% fixedInstance shim=pxt::getPin(PA17)
    const LED: DigitalPin;
    //% fixedInstance shim=pxt::getPin(PA12)
    const MISO: DigitalPin;
    //% fixedInstance shim=pxt::getPin(PB10)
    const MOSI: DigitalPin;
    //% fixedInstance shim=pxt::getPin(PB11)
    const SCK: DigitalPin;
    //% fixedInstance shim=pxt::getPin(PA23)
    const SCL: DigitalPin;
    //% fixedInstance shim=pxt::getPin(PA22)
    const SDA: DigitalPin;
}


// Gemma
declare namespace pins {
    //% fixedInstance shim=pxt::getPin(PA02)
    const D1: PwmPin;
    //% fixedInstance shim=pxt::getPin(PA04)
    const D0: PwmPin;
    //% fixedInstance shim=pxt::getPin(PA05)
    const D2: PwmPin;

    //% fixedInstance shim=pxt::getPin(PA02)
    const A0: PwmPin;
    //% fixedInstance shim=pxt::getPin(PA04)
    const A2: PwmPin;
    //% fixedInstance shim=pxt::getPin(PA05)
    const A1: PwmPin;

    //% fixedInstance shim=pxt::getPin(PA17)
    const D13: DigitalPin;
    //% fixedInstance shim=pxt::getPin(PA17)
    const LED: DigitalPin;

    //% fixedInstance shim=pxt::getPin(PA04)
    const SDA: DigitalPin;
    //% fixedInstance shim=pxt::getPin(PA05)
    const SCL: DigitalPin;

    //% fixedInstance shim=pxt::getPin(PA04)
    const TX: DigitalPin;
    //% fixedInstance shim=pxt::getPin(PA05)
    const RX: DigitalPin;

}
namespace config {
    export const PIN_DOTSTAR_DATA = DAL.PA00;
    export const PIN_DOTSTAR_CLOCK = DAL.PA01;
    export const NUM_DOTSTARS = 1;
}


// Trinket
declare namespace pins {
    //% fixedInstance shim=pxt::getPin(PA08)
    const D0: PwmPin;
    //% fixedInstance shim=pxt::getPin(PA02)
    const D1: PwmPin;
    //% fixedInstance shim=pxt::getPin(PA09)
    const D2: PwmPin;
    //% fixedInstance shim=pxt::getPin(PA07)
    const D3: PwmPin;
    //% fixedInstance shim=pxt::getPin(PA06)
    const D4: PwmPin;

    //% fixedInstance shim=pxt::getPin(PA08)
    const A4: PwmPin;
    //% fixedInstance shim=pxt::getPin(PA02)
    const A0: PwmPin;
    //% fixedInstance shim=pxt::getPin(PA09)
    const A1: PwmPin;
    //% fixedInstance shim=pxt::getPin(PA07)
    const A3: PwmPin;
    //% fixedInstance shim=pxt::getPin(PA06)
    const A2: PwmPin;

    //% fixedInstance shim=pxt::getPin(PA17)
    const D13: DigitalPin;
    //% fixedInstance shim=pxt::getPin(PA17)
    const LED: DigitalPin;

    //% fixedInstance shim=pxt::getPin(PA08)
    const SDA: DigitalPin;
    //% fixedInstance shim=pxt::getPin(PA09)
    const SCL: DigitalPin;

    //% fixedInstance shim=pxt::getPin(PA07)
    const SCK: DigitalPin;
    //% fixedInstance shim=pxt::getPin(PA09)
    const MISO: DigitalPin;
    //% fixedInstance shim=pxt::getPin(PA06)
    const MOSI: DigitalPin;

    //% fixedInstance shim=pxt::getPin(PA07)
    const RX: DigitalPin;
    //% fixedInstance shim=pxt::getPin(PA06)
    const TX: DigitalPin;
}
namespace config {
    export const PIN_DOTSTAR_DATA = DAL.PA00;
    export const PIN_DOTSTAR_CLOCK = DAL.PA01;
    export const NUM_DOTSTARS = 1;
}
