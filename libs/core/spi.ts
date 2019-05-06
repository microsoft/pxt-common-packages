namespace pins {

    let _spi: SPI;
    /**
    * Gets the default SPI driver
    */
    //%
    export function spi() {
        if (!_spi) {
            const mosi = pins.pinByCfg(DAL.CFG_PIN_MOSI);
            const miso = pins.pinByCfg(DAL.CFG_PIN_MISO);
            const sck = pins.pinByCfg(DAL.CFG_PIN_SCK);
            _spi = pins.createSPI(mosi, miso, sck);
        }
        return _spi;
    }

    /**
     * Write to the SPI slave and return the response
     * @param value Data to be sent to the SPI slave
     */
    //% help=pins/spi-write weight=5 advanced=true
    //% blockId=spi_write block="spi write %value"
    export function spiWrite(value: number) {
        return spi().write(value);
    }

    /**
     * Writes a given command to SPI bus, and afterwards reads the response.
     */
    //% help=pins/spi-transfer weight=4 advanced=true
    //% blockId=spi_transfer block="spi transfer %command into %response"
    export function spiTransfer(command: Buffer, response: Buffer) {
        spi().transfer(command, response);
    }

    /**
     * Sets the SPI frequency
     * @param frequency the clock frequency, eg: 1000000
     */
    //% help=pins/spi-frequency weight=4 advanced=true
    //% blockId=spi_frequency block="spi frequency %frequency"
    export function spiFrequency(frequency: number) {
        spi().setFrequency(frequency);
    }

    /**
     * Sets the SPI mode and bits
     * @param mode the mode, eg: 3
     */
    //% help=pins/spi-mode weight=3 advanced=true
    //% blockId=spi_mode block="spi mode %mode"
    export function spiMode(mode: number) {
        spi().setMode(mode);
    }
}