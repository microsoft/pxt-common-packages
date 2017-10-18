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

#define CFG_BOARD_LAYOUT 100
#define CFG_BOARD_MODEL 101
#define CFG_BOARD_VERSION 102

#define BOARD_LAYOUT_ZERO 1
#define BOARD_LAYOUT_MKR 2
#define BOARD_LAYOUT_FEATHER 3
#define BOARD_LAYOUT_GEMMA 4
#define BOARD_LAYOUT_TRINKET 5
#define BOARD_LAYOUT_MINI_BREAKOUT 6
#define BOARD_LAYOUT_CIRCUIT_PLAYGROUND 7

// Zero layout
#define BOARD_MODEL_ADAFRUIT_METRO_M0_EXPRESS 1
#define BOARD_MODEL_ARDUINO_ZERO 2
#define BOARD_MODEL_ARDUINO_M0 3
#define BOARD_MODEL_SPARKFUN_SAMD21_DEV 3

// MKR
#define BOARD_MODEL_ARDUINO_MKR_ZERO 100
#define BOARD_MODEL_ARDUINO_MKR_WIFI_1000 101
#define BOARD_MODEL_ARDUINO_MKR_FOX_1200 102
#define BOARD_MODEL_ARDUINO_MKR_WAN_1300 103
#define BOARD_MODEL_ARDUINO_MKR_GSM_1400 104

// Feather
#define BOARD_MODEL_ADAFRUIT_FEATHER_M0_BASIC 200
#define BOARD_MODEL_ADAFRUIT_FEATHER_M0_WIFI 201
#define BOARD_MODEL_ADAFRUIT_FEATHER_M0_ADALOGGER 202
#define BOARD_MODEL_ADAFRUIT_FEATHER_M0_BLE 203
#define BOARD_MODEL_ADAFRUIT_FEATHER_M0_900MHZ 204
#define BOARD_MODEL_ADAFRUIT_FEATHER_M0_PYTHON 205

// Single boards
#define BOARD_MODEL_ADAFRUIT_GEMMA_M0 900
#define BOARD_MODEL_ADAFRUIT_TRINKET_M0 901
#define BOARD_MODEL_SPARKFUN_SAMD21_MINI 902


#define CFG_NUM_NEOPIXELS 200

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
Button *getButton(int id);
}

#define DEVICE_ID_BUTTON_SLIDE  3000
#define DEVICE_ID_MICROPHONE    3001

#define PINOP(op) name->op

#endif
