/**
 * Control currents in Pins for analog/digital signals, servos, i2c, ...
 */
//% color=#A80000 weight=85 icon="\uf140"
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
                return 4;
        }
        return 0;
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
