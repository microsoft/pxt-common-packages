namespace pxsim {
    export interface LightBoard extends CommonBoard {
        neopixelState: CommonNeoPixelState;

        defaultNeopixelPin(): Pin;
    }

    export function neopixelState() {
        return (board() as LightBoard).neopixelState;
    }
}