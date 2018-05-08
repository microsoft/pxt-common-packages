// Auto-generated. Do not edit.
declare namespace pins {

    /**
     * Write to the SPI slave and return the response
     * @param value Data to be sent to the SPI slave
     */
    //% help=pins/spi-write weight=5 advanced=true
    //% blockId=spi_write block="spi write %value" shim=pins::spiWrite
    function spiWrite(value: int32): int32;

    /**
     * Writes a given command to SPI bus, and afterwards reads the response.
     */
    //% help=pins/spi-transfer weight=4 advanced=true
    //% blockId=spi_transfer block="spi transfer %command into %response" shim=pins::spiTransfer
    function spiTransfer(command: Buffer, response: Buffer): void;

    /**
     * Sets the SPI frequency
     * @param frequency the clock frequency, eg: 1000000
     */
    //% help=pins/spi-frequency weight=4 advanced=true
    //% blockId=spi_frequency block="spi frequency %frequency" shim=pins::spiFrequency
    function spiFrequency(frequency: int32): void;

    /**
     * Sets the SPI mode and bits
     * @param mode the mode, eg: 3
     */
    //% help=pins/spi-mode weight=3 advanced=true
    //% blockId=spi_mode block="spi mode %mode" shim=pins::spiMode
    function spiMode(mode: int32): void;
}

// Auto-generated. Do not edit. Really.
