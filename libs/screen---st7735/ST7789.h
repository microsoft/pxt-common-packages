#ifndef __PXT_ST7789_H
#define __PXT_ST7789_H

#include "ST7735.h"

namespace pxt {

/**
 * Sitronix ST7789 driver for 320x240 panels (e.g. Pimoroni Tufty 2350).
 *
 * Like ILI9341, every Arcade pixel is drawn as a 2x2 block in 16-bit color, so
 * CFG_DISPLAY_WIDTH/HEIGHT must be the physical panel size (320x240).
 * Set CFG_DISPLAY_CFG1 to 0xffffff: register 0xB1 is RGBCTRL on the ST7789, not
 * FRMCTR1 as on the ST7735, so it must not be written by configure().
 */
class ST7789 : public codal::ST7735 {
  public:
    ST7789(codal::ScreenIO &io, codal::Pin &cs, codal::Pin &dc);
    virtual int init() override;
};

} // namespace pxt

#endif
