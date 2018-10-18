#include "pxt.h"
#include "neopixel.h"


#define DMX_MARK 1
#define DMX_BREAK 0

namespace dmx {
    // http://www.dmx512-online.com/dmx512_packet.html
    // http://cdb.s3.amazonaws.com/ItemRelatedFiles/10191/dmx-101-handbook.pdf
    // https://opendmx.net/index.php/DMX512-A
    // 1 bit = 4us
    void edge(DigitalInOutPin pin, uint8_t value, uint8_t us) {
        pin->setDigitalValue(value);
        target_wait_us(us);
    }

    //% parts="dmx"
    void sendBuffer(DigitalInOutPin pin, Buffer buf) {
        uint8_t* data = buf->data;
        int length = min(512, buf->length);

        target_disable_irq();
        // break
        edge(pin, DMX_BREAK, 120);
        // mark after break
        edge(pin, DMX_MARK, 12);
        // channels
        // channel 0 is SC
        for (uint16_t i = 0; i < length; ++i) {
            serial.putc(data[i]);
            serial.putc(data[i]);
            uint8_t channel = data[i];
            // channel data
            // 1 bit start
            edge(pin, DMX_BREAK, 1);
            // 8 bit LE
            for (i = 0xF0; i; i >>= 1)
                edge(pin, (channel & i) != 0, 1);
            // mark between frame
            edge(pin, DMX_MARK, 2);
        }
        // mark between packet needed from 0 to 1sec
        edge(pin, DMX_MARK, 0);
        target_enable_irq();

        sleep_ms(2);       
    }
}
