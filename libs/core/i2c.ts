namespace pins {
    /**
     * Read one number from an I2C address.
     */
    //% help=pins/i2c-read-number weight=5 group="i2c" inlineInputMode="external"
    //% blockId=pins_i2c_readnumber block="i2c read number at address %address|of format %format|repeated %repeated"
    export function i2cReadNumber(address: number, format: NumberFormat, repeated?: boolean): number {
        const buf = pins.i2cReadBuffer(address, pins.sizeOf(format), repeated)
        if (!buf)
            return undefined
        return buf.getNumber(format, 0)
    }

    /**
     * Write one number to an I2C address.
     */
    //% help=pins/i2c-write-number weight=4 group="i2c"
    //% blockId=i2c_writenumber block="i2c write number|at address %address|with value %value|of format %format|repeated %repeated"
    export function i2cWriteNumber(address: number, value: number, format: NumberFormat, repeated?: boolean): void {
        const buf = control.createBuffer(pins.sizeOf(format))
        buf.setNumber(format, 0, value)
        pins.i2cWriteBuffer(address, buf, repeated)
    }

    export class I2CDevice {
        public address: number;
        private _hasError: boolean;
        constructor(address: number) {
            this.address = address
        }
        public readInto(buf: Buffer, repeat = false, start = 0, end: number = null) {
            if (end === null)
                end = buf.length
            if (start >= end)
                return
            let res = i2cReadBuffer(this.address, end - start, repeat)
            if (!res) {
                this._hasError = true
                return
            }
            buf.write(start, res)
        }
        public write(buf: Buffer, repeat = false) {
            let res = i2cWriteBuffer(this.address, buf, repeat)
            if (res) {
                this._hasError = true
            }
        }
        public begin(): I2CDevice {
            this._hasError = false;
            return this;
        }
        public end() {
        }
        public ok() {
            return !this._hasError
        }
    }
}