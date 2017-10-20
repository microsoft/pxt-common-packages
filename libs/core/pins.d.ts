// This file here only temporarily - to be split into board packages

// Feather
declare namespace pins {
    //% fixedInstance shim=pxt::getPin(PIN_A0)
    const A0: PwmPin;
    //% fixedInstance shim=pxt::getPin(PIN_A1)
    const A1: PwmPin;
    //% fixedInstance shim=pxt::getPin(PIN_A2)
    const A2: PwmPin;
    //% fixedInstance shim=pxt::getPin(PIN_A3)
    const A3: PwmPin;
    //% fixedInstance shim=pxt::getPin(PIN_A4)
    const A4: PwmPin;
    //% fixedInstance shim=pxt::getPin(PIN_A5)
    const A5: PwmPin;
    //% fixedInstance shim=pxt::getPin(PIN_D0)
    const D0: PwmPin;
    //% fixedInstance shim=pxt::getPin(PIN_D1)
    const D1: PwmPin;
    //% fixedInstance shim=pxt::getPin(PIN_D0)
    const RX: PwmPin;
    //% fixedInstance shim=pxt::getPin(PIN_D1)
    const TX: PwmPin;

    //% fixedInstance shim=pxt::getPin(PIN_D5)
    const D5: DigitalPin;
    //% fixedInstance shim=pxt::getPin(PIN_D6)
    const D6: DigitalPin;
    //% fixedInstance shim=pxt::getPin(PIN_D9)
    const D9: PwmPin;
    //% fixedInstance shim=pxt::getPin(PIN_D10)
    const D10: DigitalPin;
    //% fixedInstance shim=pxt::getPin(PIN_D11)
    const D11: DigitalPin;
    //% fixedInstance shim=pxt::getPin(PIN_D12)
    const D12: DigitalPin;
    //% fixedInstance shim=pxt::getPin(PIN_D13)
    const D13: DigitalPin;
    //% fixedInstance shim=pxt::getPin(PIN_D13)
    const LED: DigitalPin;
    //% fixedInstance shim=pxt::getPin(PIN_MISO)
    const MISO: DigitalPin;
    //% fixedInstance shim=pxt::getPin(PIN_MOSI)
    const MOSI: DigitalPin;
    //% fixedInstance shim=pxt::getPin(PIN_SCK)
    const SCK: DigitalPin;
    //% fixedInstance shim=pxt::getPin(PIN_SCL)
    const SCL: DigitalPin;
    //% fixedInstance shim=pxt::getPin(PIN_SDA)
    const SDA: DigitalPin;
}

namespace config {
    export const PIN_A0 = DAL.PA02;
    export const PIN_A1 = DAL.PB08;
    export const PIN_A2 = DAL.PB09;
    export const PIN_A3 = DAL.PA04;
    export const PIN_A4 = DAL.PA05;
    export const PIN_A5 = DAL.PB02;
    export const PIN_D0 = DAL.PA11;
    export const PIN_D1 = DAL.PA10;
    export const PIN_RX = DAL.PA11;
    export const PIN_TX = DAL.PA10;
    export const PIN_D5 = DAL.PA15;
    export const PIN_D6 = DAL.PA20;
    export const PIN_D9 = DAL.PA07;
    export const PIN_D10 = DAL.PA18;
    export const PIN_D11 = DAL.PA16;
    export const PIN_D12 = DAL.PA19;
    export const PIN_D13 = DAL.PA17;
    export const PIN_LED = DAL.PA17;
    export const PIN_MISO = DAL.PA12;
    export const PIN_MOSI = DAL.PB10;
    export const PIN_SCK = DAL.PB11;
    export const PIN_SCL = DAL.PA23;
    export const PIN_SDA = DAL.PA22;
}

// Gemma
declare namespace pins {
    //% fixedInstance shim=pxt::getPin(PIN_D1)
    const D1: PwmPin;
    //% fixedInstance shim=pxt::getPin(PIN_D0)
    const D0: PwmPin;
    //% fixedInstance shim=pxt::getPin(PIN_D2)
    const D2: PwmPin;

    //% fixedInstance shim=pxt::getPin(PIN_D1)
    const A0: PwmPin;
    //% fixedInstance shim=pxt::getPin(PIN_D0)
    const A2: PwmPin;
    //% fixedInstance shim=pxt::getPin(PIN_D2)
    const A1: PwmPin;

    //% fixedInstance shim=pxt::getPin(PIN_D13)
    const D13: DigitalPin;
    //% fixedInstance shim=pxt::getPin(PIN_D13)
    const LED: DigitalPin;

    //% fixedInstance shim=pxt::getPin(PIN_D0)
    const SDA: DigitalPin;
    //% fixedInstance shim=pxt::getPin(PIN_D2)
    const SCL: DigitalPin;

    //% fixedInstance shim=pxt::getPin(PIN_D0)
    const TX: DigitalPin;
    //% fixedInstance shim=pxt::getPin(PIN_D2)
    const RX: DigitalPin;

}
namespace config {
    export const NUM_DOTSTARS = 1;
    export const PIN_DOTSTAR_DATA = DAL.PA00;
    export const PIN_DOTSTAR_CLOCK = DAL.PA01;

    export const PIN_D1 = DAL.PA02;
    export const PIN_D0 = DAL.PA04;
    export const PIN_D2 = DAL.PA05;
    export const PIN_A0 = DAL.PA02;
    export const PIN_A2 = DAL.PA04;
    export const PIN_A1 = DAL.PA05;
    export const PIN_D13 = DAL.PA17;
    export const PIN_LED = DAL.PA17;
    export const PIN_SDA = DAL.PA04;
    export const PIN_SCL = DAL.PA05;
    export const PIN_TX = DAL.PA04;
    export const PIN_RX = DAL.PA05;
}

