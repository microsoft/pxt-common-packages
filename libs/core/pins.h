#ifndef __PXT_PINS_H
#define __PXT_PINS_H

// these define keys for getConfig() function
#define CFG_PIN_ACCELEROMETER_INT 1
#define CFG_PIN_ACCELEROMETER_SCL 2
#define CFG_PIN_ACCELEROMETER_SDA 3
#define CFG_PIN_BTN_A 4
#define CFG_PIN_BTN_B 5
#define CFG_PIN_BTN_SLIDE 6
#define CFG_PIN_DOTSTAR_CLOCK 7
#define CFG_PIN_DOTSTAR_DATA 8
#define CFG_PIN_FLASH_CS 9
#define CFG_PIN_FLASH_MISO 10
#define CFG_PIN_FLASH_MOSI 11
#define CFG_PIN_FLASH_SCK 12
#define CFG_PIN_LED 13
#define CFG_PIN_LIGHT 14
#define CFG_PIN_MICROPHONE 15
#define CFG_PIN_MIC_CLOCK 16
#define CFG_PIN_MIC_DATA 17
#define CFG_PIN_MISO 18
#define CFG_PIN_MOSI 19
#define CFG_PIN_NEOPIXEL 20
#define CFG_PIN_RX 21
#define CFG_PIN_RXLED 22
#define CFG_PIN_SCK 23
#define CFG_PIN_SCL 24
#define CFG_PIN_SDA 25
#define CFG_PIN_SPEAKER_AMP 26
#define CFG_PIN_TEMPERATURE 27
#define CFG_PIN_TX 28
#define CFG_PIN_TXLED 29
#define CFG_PIN_IR_OUT 30
#define CFG_PIN_IR_IN 31

#define CFG_PIN_A0 100
#define CFG_PIN_A1 101
#define CFG_PIN_A2 102
#define CFG_PIN_A3 103
#define CFG_PIN_A4 104
#define CFG_PIN_A5 105
#define CFG_PIN_A6 106
#define CFG_PIN_A7 107
#define CFG_PIN_A8 108
#define CFG_PIN_A9 109
#define CFG_PIN_A10 110
#define CFG_PIN_A11 111
#define CFG_PIN_A12 112
#define CFG_PIN_A13 113
#define CFG_PIN_A14 114
#define CFG_PIN_A15 115

#define CFG_PIN_D0 150
#define CFG_PIN_D1 151
#define CFG_PIN_D2 152
#define CFG_PIN_D3 153
#define CFG_PIN_D4 154
#define CFG_PIN_D5 155
#define CFG_PIN_D6 156
#define CFG_PIN_D7 157
#define CFG_PIN_D8 158
#define CFG_PIN_D9 159
#define CFG_PIN_D10 160
#define CFG_PIN_D11 161
#define CFG_PIN_D12 162
#define CFG_PIN_D13 163
#define CFG_PIN_D14 164
#define CFG_PIN_D15 165

#define CFG_NUM_NEOPIXELS 200
#define CFG_NUM_DOTSTARS 201

#define BUTTON_ACTIVE_HIGH_PULL_DOWN (ACTIVE_HIGH | 0x10)
#define BUTTON_ACTIVE_HIGH_PULL_UP (ACTIVE_HIGH | 0x20)
#define BUTTON_ACTIVE_HIGH_PULL_NONE (ACTIVE_HIGH | 0x30)
#define BUTTON_ACTIVE_LOW_PULL_DOWN (ACTIVE_LOW | 0x10)
#define BUTTON_ACTIVE_LOW_PULL_UP (ACTIVE_LOW | 0x20)
#define BUTTON_ACTIVE_LOW_PULL_NONE (ACTIVE_LOW | 0x30)

#define PIN(name) ((PinName)pxt::getConfig(CFG_PIN_##name, -1))
#define LOOKUP_PIN(name) pxt::lookupPin(PIN(name))

// Analog Pins, all SAMD21: PA02-PA11 PB00-PB09 (some pins not connected)
// 2 ports times 32 pins in each
#define DEV_NUM_PINS 64
// pins marked with AIN and PTC in the data sheet
#define DEV_ANALOG_PINS 0x3ff00000ffcULL

typedef codal::mbed::Pin DevicePin;

typedef DevicePin *DigitalPin;
typedef DevicePin *AnalogPin;
typedef DevicePin *PwmPin;
typedef Button *Button_;

/**
* User interaction on buttons
*/
enum class ButtonEvent {
    //% block="click"
    Click = DEVICE_BUTTON_EVT_CLICK,
    //% block="double click"
    DoubleClick = DEVICE_BUTTON_EVT_DOUBLE_CLICK,
    //% block="long click"
    LongClick = DEVICE_BUTTON_EVT_LONG_CLICK,
    //% block="up"
    Up = DEVICE_BUTTON_EVT_UP,
    //% block="down"
    Down = DEVICE_BUTTON_EVT_DOWN,
    //% block="hold"
    Hold = DEVICE_BUTTON_EVT_HOLD
};

namespace pxt {
DevicePin *getPin(int id);
DevicePin *lookupPin(int pinName);
Button *getButtonByPin(int pin, int flags);
AbstractButton *getButton(int id, int flags);
MultiButton *getMultiButton(int id, int pinA, int pinB, int flags);
CodalComponent *lookupComponent(int id);
}

#define PINOP(op) name->op

#endif
