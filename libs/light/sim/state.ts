namespace pxsim {
    export interface LightBoard extends CommonBoard {
        // Do not laze allocate state
        tryGetNeopixelState(pinId: number): CommonNeoPixelState;
        neopixelState(pinId: number): CommonNeoPixelState;

        defaultNeopixelPin(): Pin;
    }

    export function neopixelState(pinId: number) {
        return (board() as LightBoard).neopixelState(pinId);
    }
}