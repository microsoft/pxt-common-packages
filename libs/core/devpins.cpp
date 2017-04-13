#include "pxt.h"

DevPins *io;

DevPins::DevPins()
    : PIN_AD(A0), PIN_AD(A1), PIN_AD(A2), PIN_AD(A3), PIN_AD(A4), PIN_AD(A5), PIN_AD(A6),
      PIN_AD(A7), PIN_AD(A8), PIN_AD(A9), PIN_AD(A10), PIN_AD(A11), PIN_D(D0), PIN_D(D1), PIN_D(D2),
      PIN_D(D3), PIN_D(D4), PIN_D(D5), PIN_D(D6), PIN_D(D7), PIN_D(D8), PIN_D(D9), PIN_D(D10),
      PIN_D(D11), PIN_D(D12), PIN_D(D13), PIN_D(LED), PIN_D(LEDRX), PIN_D(LEDTX),
      i2c((PinName)PIN_SDA, (PinName)PIN_SCL)
      {}
