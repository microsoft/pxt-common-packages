#include "pxt.h"
#include "devpins.h"

namespace pins {
    /**
    * Write to the SPI slave and return the response
    * @param value Data to be sent to the SPI slave
    */
    //% help=pins/spi-write weight=5 advanced=true
    //% blockId=spi_write block="spi write %value"
    int spiWrite(int value) {
        return io->spi.write(value);
    }
}