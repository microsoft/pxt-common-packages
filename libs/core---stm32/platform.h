#ifndef __PXT_PLATFORM_H
#define __PXT_PLATFORM_H

#include "Image.h"
#include "MultiButton.h"
#include "ZPin.h"
#include "ZTimer.h"
#include "ZSPI.h"
#include "ZI2C.h"
#include "ZSingleWireSerial.h"

#include "pinmap.h"

#define BOOTLOADER_START 0x08000000
#define BOOTLOADER_END 0x08004000

#ifdef STM32F4
#define SETTINGS_MAGIC_0 0x10476643
#define SETTINGS_MAGIC_1 0x2e9a5026

struct F4_Settings {
    uint32_t magic0;
    uint32_t magic1;
    int *configValues;
    uint32_t hseValue;
    const char *info_uf2;
    const char *manufacturer;
    const char *device;
    uint32_t reserved[16 - 7];
};

#define UF2_BINFO ((F4_Settings *)(BOOTLOADER_END - sizeof(F4_Settings)))
#define UF2_INFO_TXT UF2_BINFO->info_uf2
#define PXT_BOOTLOADER_CFG_ADDR (&(UF2_BINFO->configValues))
#define USB_HANDOVER 0

#define BOOT_RTC_SIGNATURE 0x71a21877
#define APP_RTC_SIGNATURE 0x24a22d12
#define POWER_DOWN_RTC_SIGNATURE 0x5019684f
#define QUICK_BOOT(v) (RTC->BKP0R = v ? APP_RTC_SIGNATURE : BOOT_RTC_SIGNATURE)
#else

#endif

#define PAGE_SIZE 1024 // not really

#define DEV_NUM_PINS 64

#ifdef STM32F1
#define DEV_PWM_PINS 0b111100000011101100001110111000111111001110LL
#else
#define DEV_PWM_PINS 0b111100000011100111111110111000111111101111LL
#endif

//               CCCCCCCCCCCCCCCCBBBBBBBBBBBBBBBBAAAAAAAAAAAAAAAA
//               fedcba9876543210fedcba9876543210fedcba9876543210
#define DEV_AIN_PINS 0b000011111100000000000000110000000011111111LL

// Codal doesn't yet distinguish between PWM and AIN
#define DEV_ANALOG_PINS (DEV_PWM_PINS | DEV_AIN_PINS)

#define CODAL_PIN ZPin
#define CODAL_TIMER ZTimer
#define CODAL_SPI ZSPI
#define CODAL_I2C ZI2C
#define CODAL_JACDAC_WIRE_SERIAL codal::ZSingleWireSerial

#define PERF_NOW() (TIM5->CNT)

#define IMAGE_BITS 4

// The parameters below needs tuning!

#ifdef JUST_FOR_DAL_D_TS_CPP_WILL_IGNORE
#define PA_0 0x00
#define PA_1 0x01
#define PA_2 0x02
#define PA_3 0x03
#define PA_4 0x04
#define PA_5 0x05
#define PA_6 0x06
#define PA_7 0x07
#define PA_8 0x08
#define PA_9 0x09
#define PA_10 0x0A
#define PA_11 0x0B
#define PA_12 0x0C
#define PA_13 0x0D
#define PA_14 0x0E
#define PA_15 0x0F

#define PB_0 0x10
#define PB_1 0x11
#define PB_2 0x12
#define PB_3 0x13
#define PB_4 0x14
#define PB_5 0x15
#define PB_6 0x16
#define PB_7 0x17
#define PB_8 0x18
#define PB_9 0x19
#define PB_10 0x1A
#define PB_11 0x1B
#define PB_12 0x1C
#define PB_13 0x1D
#define PB_14 0x1E
#define PB_15 0x1F

#define PC_0 0x20
#define PC_1 0x21
#define PC_2 0x22
#define PC_3 0x23
#define PC_4 0x24
#define PC_5 0x25
#define PC_6 0x26
#define PC_7 0x27
#define PC_8 0x28
#define PC_9 0x29
#define PC_10 0x2A
#define PC_11 0x2B
#define PC_12 0x2C
#define PC_13 0x2D
#define PC_14 0x2E
#define PC_15 0x2F

#define PD_0 0x30
#define PD_1 0x31
#define PD_2 0x32
#define PD_3 0x33
#define PD_4 0x34
#define PD_5 0x35
#define PD_6 0x36
#define PD_7 0x37
#define PD_8 0x38
#define PD_9 0x39
#define PD_10 0x3A
#define PD_11 0x3B
#define PD_12 0x3C
#define PD_13 0x3D
#define PD_14 0x3E
#define PD_15 0x3F
#endif

#endif