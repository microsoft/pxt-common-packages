#ifndef __PXT_PLATFORM_H
#define __PXT_PLATFORM_H

#include "Image.h"
#include "Timer.h"

#include "RP2040.h"
#include "RP2040Pin.h"
#include "RP2040Spi.h"
#include "RP2040I2C.h"
#include "RP2040PWM.h"

#define IMAGE_BITS 4

#define PAGE_SIZE 256
#define DEV_NUM_PINS 30

// all pins with pwm output
#define DEV_PWM_PINS 0x3FFFFFFF
// 26~29 has adc input
#define DEV_AIN_PINS 0x3C000000

// Codal doesn't yet distinguish between PWM and AIN
#define DEV_ANALOG_PINS (DEV_PWM_PINS | DEV_AIN_PINS)

#define CODAL_PIN RP2040Pin
#define CODAL_SPI RP2040SPI
#define CODAL_I2C RP2040I2C
#define CODAL_TIMER Timer

typedef uint8_t PinName;


#endif