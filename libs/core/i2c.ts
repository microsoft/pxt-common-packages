namespace pins {
    /**
     * Read one number from 7-bit I2C address.
     */
    //% help=pins/i2c-read-number blockGap=8 advanced=true
    //% blockId=pins_i2c_readnumber block="i2c read number|at address %address|of format %format=i2c_sizeof|repeated %repeat" weight=7
    export function i2cReadNumber(address: number, format: NumberFormat, repeated?: boolean): number {
        let buf = pins.i2cReadBuffer(address, pins.sizeOf(format), repeated)
        return buf.getNumber(format, 0)
    }

    /**
     * Write one number to a 7-bit I2C address.
     */
    //% help=pins/i2c-write-number blockGap=8 advanced=true
    //% blockId=i2c_writenumber block="i2c write number|at address %address|with value %value|of format %format=i2c_sizeof|repeated %repeat" weight=6
    export function i2cWriteNumber(address: number, value: number, format: NumberFormat, repeated?: boolean): void {
        let buf = createBuffer(pins.sizeOf(format))
        buf.setNumber(format, 0, value)
        pins.i2cWriteBuffer(address, buf, repeated)
    }
}