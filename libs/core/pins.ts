/**
 * Control currents in Pins for analog/digital signals, servos, i2c, ...
 */
//% color=#A80000 weight=85 icon="\uf140" advanced=true
//% groups='["other", "Servo", "i2c"]'
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

    export function packIntoBuffer(format: string, buf: Buffer, offset: number, nums: number[]) {
        packUnpackCore(format, nums, buf, true, offset)
    }

    export function unpackBuffer(format: string, buf: Buffer, offset = 0) {
        let res: number[] = []
        packUnpackCore(format, res, buf, false, offset)
        return res
    }
}

// see http://msgpack.org/ for the spec
// it currently only implements numbers and their sequances
// once we handle any type and typeof expressions we can do more

namespace msgpack {
    function tagFormat(tag: number) {
        switch (tag) {
            case 0xCB: return NumberFormat.Float64BE
            case 0xCC: return NumberFormat.UInt8BE
            case 0xCD: return NumberFormat.UInt16BE
            case 0xCE: return NumberFormat.UInt32BE
            case 0xD0: return NumberFormat.Int8BE
            case 0xD1: return NumberFormat.Int16BE
            case 0xD2: return NumberFormat.Int32BE
            default:
                return null
        }
    }

    function packNumberCore(buf: Buffer, offset: number, num: number) {
        let tag = 0xCB
        if (num == (num << 0) || num == (num >>> 0)) {
            if (-31 <= num && num <= 127) {
                if (buf) buf[offset] = num
                return 1
            } else if (0 <= num) {
                if (num <= 0xff) {
                    tag = 0xCC
                } else if (num <= 0xffff) {
                    tag = 0xCD
                } else {
                    tag = 0xCE
                }
            } else {
                if (-0x7f <= num) {
                    tag = 0xD0
                } else if (-0x7fff <= num) {
                    tag = 0xD1
                } else {
                    tag = 0xD2
                }
            }
        }
        let fmt = tagFormat(tag)
        if (buf) {
            buf[offset] = tag
            buf.setNumber(fmt, offset + 1, num)
        }
        return pins.sizeOf(fmt) + 1
    }

    /**
     * Unpacks a buffer into a number array.
     */
    export function unpackNumberArray(buf: Buffer, offset = 0): number[] {
        let res: number[] = []

        while (offset < buf.length) {
            let fmt = tagFormat(buf[offset++])
            if (fmt === null) {
                let v = buf.getNumber(NumberFormat.Int8BE, offset - 1)
                if (-31 <= v && v <= 127)
                    res.push(v)
                else
                    return null
            } else {
                res.push(buf.getNumber(fmt, offset))
                offset += pins.sizeOf(fmt)
            }
            // padding at the end
            while (buf[offset] === 0xc1) offset++;
        }

        return res
    }

    /**
     * Pack a number array into a buffer.
     * @param nums the numbers to be packed
     */
    export function packNumberArray(nums: number[]): Buffer {
        let off = 0
        for (let n of nums) {
            off += packNumberCore(null, off, n)
        }
        let buf = pins.createBuffer(off)
        off = 0
        for (let n of nums) {
            off += packNumberCore(buf, off, n)
        }
        return buf
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