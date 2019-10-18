/**
 * Rotary encoders
 */
//% color="#03AA74" weight=87 icon="\uf021"
namespace encoders {

    /**
     * Gets the default rotary encoder if any
     */
    //% block="encoder" fixedInstance whenUsed
    export const defaultEncoder = encoders.createRotaryEncoder(undefined, undefined);
}