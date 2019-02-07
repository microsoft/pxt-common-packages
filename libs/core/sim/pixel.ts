namespace pxsim {
    export interface PixelBoard extends CommonBoard {
        pixelPin: Pin;
    }

    export function pixelPin(): Pin {
        return (board() as PixelBoard).pixelPin;
    }
}
