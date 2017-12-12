#ifndef __PXT_PLATFORM_H
#define __PXT_PLATFORM_H

// This is specific for SAMD21, to be replaced in other Codal targets.

#include "CapTouchButton.h"
#include "Image.h"
#include "MbedTimer.h"
#include "MbedI2C.h"
#include "MbedPin.h"
#include "MultiButton.h"

#include "SAMD21DMAC.h"

// Analog Pins, all SAMD21: PA02-PA11 PB00-PB09 (some pins not connected)
// 2 ports times 32 pins in each
#define DEV_NUM_PINS 64
// pins marked with AIN and PTC in the data sheet
#define DEV_ANALOG_PINS 0x3ff00000ffcULL

#define PAGE_SIZE 256

#define PlatformDMAC SAMD21DMAC

/*
 * @param nominalValue The value (in SI units) of a nominal position.
 * @param nominalReading The raw reading from the sensor at the nominal position.
 * @param beta The Steinhart-Hart Beta constant for the device
 * @param seriesResistor The value (in ohms) of the resistor in series with the sensor.
 * @param zeroOffset Optional zero offset applied to all SI units (e.g. 273.15 for temperature
 * sensing in C vs Kelvin).
 */

#define TEMPERATURE_NOMINAL_VALUE 25
#define TEMPERATURE_NOMINAL_READING 10000
#define TEMPERATURE_BETA 3380
#define TEMPERATURE_SERIES_RESISTOR 10000
#define TEMPERATURE_ZERO_OFFSET 273.5

#define LIGHTSENSOR_SENSITIVITY 868 // codal has 912 now
#define LIGHTSENSOR_LOW_THRESHOLD 128
#define LIGHTSENSOR_HIGH_THRESHOLD 896


#ifdef JUST_FOR_DAL_D_TS_CPP_WILL_IGNORE
#define PA00 0
#define PA01 1
#define PA02 2
#define PA03 3
#define PA04 4
#define PA05 5
#define PA06 6
#define PA07 7
#define PA08 8
#define PA09 9
#define PA10 10
#define PA11 11
#define PA12 12
#define PA13 13
#define PA14 14
#define PA15 15
#define PA16 16
#define PA17 17
#define PA18 18
#define PA19 19
#define PA20 20
#define PA21 21
#define PA22 22
#define PA23 23
#define PA24 24
#define PA25 25
#define PA26 26
#define PA27 27
#define PA28 28
#define PA29 29
#define PA30 30
#define PA31 31
#define PB00 32
#define PB01 33
#define PB02 34
#define PB03 35
#define PB04 36
#define PB05 37
#define PB06 38
#define PB07 39
#define PB08 40
#define PB09 41
#define PB10 42
#define PB11 43
#define PB12 44
#define PB13 45
#define PB14 46
#define PB15 47
#define PB16 48
#define PB17 49
#define PB18 50
#define PB19 51
#define PB20 52
#define PB21 53
#define PB22 54
#define PB23 55
#define PB24 56
#define PB25 57
#define PB26 58
#define PB27 59
#define PB28 60
#define PB29 61
#define PB30 62
#define PB31 63
#endif

#endif
