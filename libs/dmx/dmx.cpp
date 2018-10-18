#include "pxt.h"
#include "neopixel.h"


#define DMX_MARK 1
#define DMX_BREAK 0

/**
 * Functions to operate colored LEDs.
 */
//% weight=100 color="#0078d7" icon="\uf00a"
namespace dmx {
    // http://www.dmx512-online.com/dmx512_packet.html
    // http://cdb.s3.amazonaws.com/ItemRelatedFiles/10191/dmx-101-handbook.pdf
    // https://opendmx.net/index.php/DMX512-A
    // 1 bit = 4us
    void edge(DigitalInOutPin pin, uint value, uint us) {
        pin->setDigitalValue(value);
        target_wait_us(us);
    }

    //% parts="dmx"
    void sendBuffer(DigitalInOutPin pin, Buffer buf) {
        const uint8_t* data = buf-> data;
        uint16_t length = min(512, buf->length);

        // break
        edge(pin, DMX_BREAK, 120);
        // mark after break
        edge(pin, DMX_MARK, 12);
        // start code
        edge(pin, DMX_BREAK, 9);
        edge(pin, DMX_MARK, 2);
        // channels
        for (uint16_t i = 1; i < length; ++i) {
            uint8_t channel = data[i];
            // mark between frame
            edge(pin, DMX_MARK, 2);
            // channel data
            // 1 bit start
            edge(pin, DMX_BREAK, 1);
            // 8 bit LE
            for (i = 0xF0; i; i >>= 1)
                edge(pin, (channel & i) != 0, 1);
            // 2 stop bits
            edge(pin, DMX_MARK, 2);
        }
        // mark between packet needed from 0 to 1sec
        edge(pin, DMX_MARK, 0);
        sleep_ms(1);        
    }
}
