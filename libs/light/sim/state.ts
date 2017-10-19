namespace pxsim {
    export interface LightBoard extends CommonBoard {
        neopixelState(pinId: number): CommonNeoPixelState;

        defaultNeopixelPin(): Pin;
    }

    export function neopixelState(pinId: number) {
        return (board() as LightBoard).neopixelState(pinId);
    }
}