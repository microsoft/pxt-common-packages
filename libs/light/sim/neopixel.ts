
namespace pxsim {
    export class CommonNeoPixelState {
        public length = 10;
        private neopixels: [number, number, number][] = [];

        public pixelColor(pixel: number): [number, number, number] {
            return this.neopixels[pixel];
        }

        public setPixelColor(pixel: number, red: number, green: number, blue: number) {
            let a = this.neopixels[pixel];
            if (!a) a = this.neopixels[pixel] = [0, 0, 0];
            a[0] = red;
            a[1] = green;
            a[2] = blue;
        }
    }
}

namespace pxsim.light {
    // Currently only modifies the builtin pixels
    export function sendBuffer(pin: pins.DigitalPin, b: RefBuffer) {
        const state = neopixelState(pin.id);
        const stride = 3; // TODO RGBW support
        const numberOfPixels = b.data.length / stride;

        for (let i = 0; i < numberOfPixels; i++) {
            const offset = stride * i;

            const green = b.data[offset];
            const red = b.data[offset + 1];
            const blue = b.data[offset + 2];

            state.setPixelColor(i, red, green, blue);
        }

        runtime.queueDisplayUpdate();
    }

    export function defaultPin() {
        return (board() as LightBoard).defaultNeopixelPin();
    }
}
