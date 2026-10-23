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

#if defined(PICO_RP2350) && PICO_RP2350
// RP2350B has 48 GPIOs (RP2350A only 30); all can be PWM outputs
#define DEV_NUM_PINS 48
#define DEV_PWM_PINS 0xFFFFFFFFFFFFULL
#if defined(PICO_RP2350A) && PICO_RP2350A
// 26~29 has adc input
#define DEV_AIN_PINS 0x3C000000ULL
#else
// 40~47 has adc input
#define DEV_AIN_PINS 0xFF0000000000ULL
#endif
#else
#define DEV_NUM_PINS 30

// all pins with pwm output
#define DEV_PWM_PINS 0x3FFFFFFF
// 26~29 has adc input
#define DEV_AIN_PINS 0x3C000000
#endif

// Codal doesn't yet distinguish between PWM and AIN
#define DEV_ANALOG_PINS (DEV_PWM_PINS | DEV_AIN_PINS)

#define CODAL_PIN RP2040Pin
#define CODAL_SPI RP2040SPI
#define CODAL_I2C RP2040I2C
#define CODAL_TIMER Timer

#if defined(PICO_RP2350) && PICO_RP2350
#define UF2_INFO_TXT "UF2 Bootloader v1.0\nModel: Raspberry Pi RP2350\nBoard-ID: RP2350"
#else
#define UF2_INFO_TXT "UF2 Bootloader v1.0\nModel: Raspberry Pi RP2\nBoard-ID: RPI-RP2"
#endif

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

#if defined(PICO_RP2350) && PICO_RP2350
#define P31 31
#define P32 32
#define P33 33
#define P34 34
#define P35 35
#define P36 36
#define P37 37
#define P38 38
#define P39 39
#define P40 40
#define P41 41
#define P42 42
#define P43 43
#define P44 44
#define P45 45
#define P46 46
#define P47 47
#endif

#endif