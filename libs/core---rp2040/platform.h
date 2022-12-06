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

#define UF2_INFO_TXT "UF2 Bootloader v1.0\nModel: Raspberry Pi RP2\nBoard-ID: RPI-RP2"

typedef uint8_t PinName;

// XIP range in 0x1000_0000 ~ 0x1100_0000
#define PXT_IS_READONLY(v) (isTagged(v) || ((uintptr_t)v & 0x10000000))

#define P0 0
#define P1 1
#define P2 2
#define P3 3
#define P4 4
#define P5 5
#define P6 6
#define P7 7
#define P8 8
#define P9 9
#define P10 10
#define P11 11
#define P12 12
#define P13 13
#define P14 14
#define P15 15
#define P16 16
#define P17 17
#define P18 18
#define P19 19
#define P20 20
#define P21 21
#define P22 22
#define P23 23
#define P24 24
#define P25 25
#define P26 26
#define P27 27
#define P28 28
#define P29 29
#define P30 30

#endif