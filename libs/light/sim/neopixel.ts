
namespace pxsim {
    enum NeoPixelMode {
        RGB = 1,
        RGBW = 2,
        RGB_RGB = 3
    }

    export class CommonNeoPixelState {
        public buffer: Uint8Array;
        public mode: number = NeoPixelMode.RGB; // GRB
        public get length() {
            const stride = this.mode == NeoPixelMode.RGBW ? 4 : 3;
            return this.buffer ? (this.buffer.length / stride) >> 0 : 0;
        }

        public pixelColor(pixel: number): number[] {
            const stride = this.mode == 3 ? 4 : 3;
            const offset = pixel * stride;
            switch (this.mode) {
                case NeoPixelMode.RGBW:
                    return [this.buffer[offset + 1], this.buffer[offset], this.buffer[offset + 2], this.buffer[offset + 3]];
                case NeoPixelMode.RGB_RGB:
                    return [this.buffer[offset], this.buffer[offset + 1], this.buffer[offset + 2]];
                default:
                    return [this.buffer[offset + 1], this.buffer[offset + 0], this.buffer[offset + 2]];
            }
        }
    }
}

namespace pxsim.light {
    // Currently only modifies the builtin pixels
    export function sendBuffer(pin: pins.DigitalPin, mode: number, b: RefBuffer) {
        const state = neopixelState(pin.id);
        state.mode = mode; // TODO RGBW support
        state.buffer = b.data;
        runtime.queueDisplayUpdate();
    }

    export function defaultPin() {
        return (board() as LightBoard).defaultNeopixelPin();
    }
}
