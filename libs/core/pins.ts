/**
 * Control currents in Pins for analog/digital signals, servos, i2c, ...
 */
//% color=#A80000 weight=85 icon="\uf140" advanced=true
namespace pins {
    /**
     * Get the size in bytes of specified number format.
     */
    //%
    export function sizeOf(format: NumberFormat) {
        switch (format) {
            case NumberFormat.Int8LE:
            case NumberFormat.UInt8LE:
            case NumberFormat.Int8BE:
            case NumberFormat.UInt8BE:
                return 1;
            case NumberFormat.Int16LE:
            case NumberFormat.UInt16LE:
            case NumberFormat.Int16BE:
            case NumberFormat.UInt16BE:
                return 2;
            case NumberFormat.Int32LE:
            case NumberFormat.Int32BE:
            case NumberFormat.UInt32BE:
            case NumberFormat.UInt32LE:
            case NumberFormat.Float32BE:
            case NumberFormat.Float32LE:
                return 4;
            case NumberFormat.Float64BE:
            case NumberFormat.Float64LE:
                return 8;
        }
        return 0;
    }

    /**
     * Create a new buffer initalized to bytes from given array.
     * @param bytes data to initalize with
     */
    //%
    export function createBufferFromArray(bytes: number[]) {
        let buf = createBuffer(bytes.length)
        for (let i = 0; i < bytes.length; ++i)
            buf[i] = bytes[i]
        return buf
    }

    function getFormat(pychar: string, isBig: boolean) {
        switch (pychar) {
            case 'B':
                return NumberFormat.UInt8LE
            case 'b':
                return NumberFormat.Int8LE
            case 'H':
                return isBig ? NumberFormat.UInt16BE : NumberFormat.UInt16LE
            case 'h':
                return isBig ? NumberFormat.Int16BE : NumberFormat.Int16LE
            case 'I':
            case 'L':
                return isBig ? NumberFormat.UInt32BE : NumberFormat.UInt32LE
            case 'i':
            case 'l':
                return isBig ? NumberFormat.Int32BE : NumberFormat.Int32LE
            case 'f':
                return isBig ? NumberFormat.Float32BE : NumberFormat.Float32LE
            case 'd':
                return isBig ? NumberFormat.Float64BE : NumberFormat.Float64LE
            default:
                return null as NumberFormat
        }
    }

    function packUnpackCore(format: string, nums: number[], buf: Buffer, isPack: boolean, off = 0) {
        let isBig = false
        let idx = 0
        for (let i = 0; i < format.length; ++i) {
            switch (format[i]) {
                case ' ':
                case '<':
                case '=':
                    isBig = false
                    break
                case '>':
                case '!':
                    isBig = true
                    break
                case 'x':
                    off++
                    break
                default:
                    let fmt = getFormat(format[i], isBig)
                    if (fmt === null) {
                        control.fail("Not supported format character: " + format[i])
                    } else {
                        if (buf) {
                            if (isPack)
                                buf.setNumber(fmt, off, nums[idx++])
                            else
                                nums.push(buf.getNumber(fmt, off))
                        }

                        off += pins.sizeOf(fmt)
                    }
                    break
            }
        }
        return off
    }

    export function packedSize(format: string) {
        return packUnpackCore(format, null, null, true)
    }

    export function packBuffer(format: string, nums: number[]) {
        let buf = createBuffer(packedSize(format))
        packUnpackCore(format, nums, buf, true)
        return buf
    }

    export function unpackBuffer(format: string, buf: Buffer, offset = 0) {
        let res: number[] = []
        packUnpackCore(format, res, buf, false, offset)
        return res
    }
}


//% noRefCounting fixedInstances
interface DigitalPin {
    // methods filled from C++
}

//% noRefCounting fixedInstances
interface AnalogPin extends DigitalPin {
    // methods filled from C++
}

//% noRefCounting fixedInstances
interface PwmPin extends AnalogPin {
    // methods filled from C++
}

interface Buffer {
    [index: number]: number;
    // rest defined in buffer.cpp
}