#include "pxt.h"
#include "ST7789.h"

#define ST7789_DELAY 0x80

// clang-format off
// Init sequence from Pimoroni's Tufty 2350 driver
// (https://github.com/pimoroni/badgeware-cpp/blob/main/board/tufty/st7789.cpp)
static const uint8_t st7789InitCmds[] = {
    0x01, ST7789_DELAY, 150,                  // SWRESET
    0x3A, 1, 0x05,                            // COLMOD: 16 bpp
    0xB2, 5, 0x0c, 0x0c, 0x00, 0x33, 0x33,    // PORCTRL
    0xC0, 1, 0x2c,                            // LCMCTRL
    0xC2, 1, 0x01,                            // VDVVRHEN
    0xC3, 1, 0x0f,                            // VRHS
    0xC4, 1, 0x20,                            // VDVS
    0xD0, 2, 0xa4, 0xa1,                      // PWCTRL1
    0xC6, 1, 0x0f,                            // FRCTRL2
    0xB0, 2, 0x00, 0xc0,                      // RAMCTRL: MSB first; fixes low-brightness green banding
    0xB7, 1, 0x35,                            // GCTRL
    0xBB, 1, 0x1b,                            // VCOMS
    0xE0, 14, 0xF0, 0x00, 0x06, 0x04, 0x05, 0x05, 0x31, 0x44, 0x48, 0x36, 0x12, 0x12, 0x2B, 0x34, // PGC
    0xE1, 14, 0xF0, 0x0B, 0x0F, 0x0F, 0x0D, 0x26, 0x31, 0x43, 0x47, 0x38, 0x14, 0x14, 0x2C, 0x32, // NGC
    0x21, 0,                                  // INVON (IPS panel)
    0x11, ST7789_DELAY, 100,                  // SLPOUT
    0x29, ST7789_DELAY, 10,                   // DISPON
    0, 0
};
// clang-format on

namespace pxt {

ST7789::ST7789(codal::ScreenIO &io, codal::Pin &cs, codal::Pin &dc) : codal::ST7735(io, cs, dc) {
    double16 = true;
}

int ST7789::init() {
    endCS();
    setData();

    fiber_sleep(10);
    sendCmdSeq(st7789InitCmds);

    return DEVICE_OK;
}

} // namespace pxt
