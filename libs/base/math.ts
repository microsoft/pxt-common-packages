namespace Math {
    //% blockIdentity="Math._constant"
    //% block="π"
    export const PI = 3.141592653589793;
    //% blockIdentity="Math._constant"
    //% block="e"
    export const E = 2.718281828459045;
    //% blockIdentity="Math._constant"
    //% block="ln(2)"
    export const LN2 = 0.6931471805599453;
    //% blockIdentity="Math._constant"
    //% block="ln(10)"
    export const LN10 = 2.302585092994046;
    //% blockIdentity="Math._constant"
    //% block="log₂(e)"
    export const LOG2E = 1.4426950408889634;
    //% blockIdentity="Math._constant"
    //% block="log₁₀(e)"
    export const LOG10E = 0.4342944819032518;
    //% blockIdentity="Math._constant"
    //% block="√½"
    export const SQRT1_2 = 0.7071067811865476;
    //% blockIdentity="Math._constant"
    //% block="√2"
    export const SQRT2 = 1.4142135623730951;

    /**
     * Re-maps a number from one range to another. That is, a value of ``from low`` would get mapped to ``to low``, a value of ``from high`` to ``to high``, values in-between to values in-between, etc.
     * @param value value to map in ranges
     * @param fromLow the lower bound of the value's current range
     * @param fromHigh the upper bound of the value's current range, eg: 1023
     * @param toLow the lower bound of the value's target range
     * @param toHigh the upper bound of the value's target range, eg: 4
     */
    //% help=math/map weight=10 blockGap=8
    //% blockId=math_map block="map %value|from low %fromLow|high %fromHigh|to low %toLow|high %toHigh"
    //% inlineInputMode=inline
    export function map(value: number, fromLow: number, fromHigh: number, toLow: number, toHigh: number): number {
        return ((value - fromLow) * (toHigh - toLow)) / (fromHigh - fromLow) + toLow;
    }

    /**
     * Constrains a number to be within a range
     * @param x the number to constrain, all data types
     * @param y the lower end of the range, all data types
     * @param z the upper end of the range, all data types
     */
    //% help=math/constrain weight=11 blockGap=8
    //% blockId="math_constrain_value" block="constrain %value|between %low|and %high"
    export function constrain(value: number, low: number, high: number): number {
        return value < low ? low : value > high ? high : value;
    }

    const b_m16: number[] = [0, 49, 49, 41, 90, 27, 117, 10]
    /**
     * Returns the sine of an input angle. This is an 8-bit approximation.
     * @param theta input angle from 0-255
     */
    //% help=math/isin weight=11 advanced=true blockGap=8
    export function isin(theta: number) {
        //reference: based on FASTLed's sin approximation method: [https://github.com/FastLED/FastLED](MIT)
        let offset = theta;
        if( theta & 0x40 ) {
            offset = 255 - offset;
        }
        offset &= 0x3F; // 0..63

        let secoffset  = offset & 0x0F; // 0..15
        if( theta & 0x40) secoffset++;

        let section = offset >> 4; // 0..3
        let s2 = section * 2;

        let b = b_m16[s2];
        let m16 = b_m16[s2+1];
        let mx = (m16 * secoffset) >> 4;

        let y = mx + b;
        if( theta & 0x80 ) y = -y;

        y += 128;

        return y;
    }

    /**
     * Returns the cosine of an input angle. This is an 8-bit approximation.
     * @param theta input angle from 0-255
     */
    //% help=math/icos weight=10 advanced=true blockGap=8
    export function icos(theta: number) {
        return isin(theta + 16384);
    }

    //% shim=TD_ID
    //% block="$MEMBER"
    //% constantShim
    //% weight=0
    //% help=math/constant
    export function _constant(MEMBER: number): number {
        return MEMBER;
    }
}

namespace Number {
    export const EPSILON = 2.220446049250313e-16;
}