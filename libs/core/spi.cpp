#include "pxt.h"
#include "ErrorNo.h"

namespace pins {
    static codal::SPI *spi = NULL;
    static void initSPI() {
        if (NULL == spi)
            spi = new CODAL_SPI(*LOOKUP_PIN(MOSI), *LOOKUP_PIN(MISO), *LOOKUP_PIN(SCK));
    }

    /**
    * Write to the SPI slave and return the response
    * @param value Data to be sent to the SPI slave
    */
    //% help=pins/spi-write weight=5 advanced=true
    //% blockId=spi_write block="spi write %value"
    int spiWrite(int value) {
        initSPI();
        return spi->write(value);
    }

    /**
    * Writes a given command to SPI bus, and afterwards reads the response.
    */
    //% help=pins/spi-transfer weight=4 advanced=true
    //% blockId=spi_transfer block="spi transfer %command into %response"
    void spiTransfer(Buffer command, Buffer response) {
        initSPI();
        spi->transfer(command->data, command->length, response->data, response->length);
    }

    /**
    * Sets the SPI frequency
    * @param frequency the clock frequency, eg: 1000000
    */
    //% help=pins/spi-frequency weight=4 advanced=true
    //% blockId=spi_frequency block="spi frequency %frequency"
    void spiFrequency(int frequency) {
        initSPI();
        spi->setFrequency(frequency);
    }

    /**
    * Sets the SPI mode and bits
    * @param mode the mode, eg: 3
    * @param bits the number of bits, eg: 8
    */
    //% help=pins/spi-mode weight=3 advanced=true
    //% blockId=spi_mode block="spi mode|mode %mode|bits %bits"
    void spiMode(int mode, int bits = 8) {
        initSPI();
        spi->setMode(mode, bits);        
    }
}
