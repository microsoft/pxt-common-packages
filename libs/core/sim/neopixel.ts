
namespace pxsim {
    enum NeoPixelMode {
        RGB = 1,
        RGBW = 2,
        RGB_RGB = 3,
        DotStar = 4
    }

    export class CommonNeoPixelState {
        public buffer: Uint8Array;
        public mode: number = NeoPixelMode.RGB; // GRB
        public get length() {
            return this.buffer ? (this.buffer.length / this.stride) | 0 : 0;
        }

        public get stride() {
            return this.mode == NeoPixelMode.RGBW || this.mode == NeoPixelMode.DotStar ? 4 : 3;
        }

        public pixelColor(pixel: number): number[] {
            const offset = pixel * this.stride;
            // RBG
            switch (this.mode) {
                case NeoPixelMode.RGBW:
                    return [this.buffer[offset + 1], this.buffer[offset], this.buffer[offset + 2], this.buffer[offset + 3]];
                case NeoPixelMode.RGB_RGB:
                    return [this.buffer[offset], this.buffer[offset + 1], this.buffer[offset + 2]];
                case NeoPixelMode.DotStar:
                    return [this.buffer[offset + 3], this.buffer[offset + 2], this.buffer[offset + 1]];
                default:
                    return [this.buffer[offset + 1], this.buffer[offset + 0], this.buffer[offset + 2]];
            }
        }
    }

    export interface CommonNeoPixelStateConstructor {
        (pin: Pin): CommonNeoPixelState;
    }

    export interface LightBoard extends CommonBoard {
        // Do not laze allocate state
        tryGetNeopixelState(pinId: number): CommonNeoPixelState;
        neopixelState(pinId: number): CommonNeoPixelState;
    }

    export function neopixelState(pinId: number) {
        return (board() as LightBoard).neopixelState(pinId);
    }
}

namespace pxsim.light {
    // Currently only modifies the builtin pixels
    export function sendBuffer(pin: pins.DigitalInOutPin, clk: pins.DigitalInOutPin, mode: number, b: RefBuffer) {
        const state = neopixelState(pin.id);
        if (!state) return;
        state.mode = mode & 0xff; // TODO RGBW support
        state.buffer = b.data;

        runtime.queueDisplayUpdate();
    }
}

namespace pxsim {
    export function sendBufferAsm(buffer: RefBuffer, pin: DigitalPin) {
        const b = board();
        if (!b) return;
        const p = b.edgeConnectorState.getPin(pin);
        if (!p) return;
        const mode = NeoPixelMode.RGB; // RGB_RGB
        pxsim.light.sendBuffer(p, undefined, mode, buffer);
    }
}
