/**
 * Rotary encoders
 */
//% color="#03AA74" weight=87 icon="\uf021"
namespace encoders {

    let _defaultEncoder: RotaryEncoder;
    export function encoder(): RotaryEncoder {
        if (!_defaultEncoder) {
        }
        return _defaultEncoder;
    }
}