
namespace pxsim {
    export class CommonNeoPixelState {
        public length = 10;
        public power = 0; // mA
        public maxPower = 0; // mA
        public totalPower = 0; // mAh
        public forecastPower = 0; // mAh
        private _firstPower = -1; // hours
        private _lastPower = -1; // hours
        private neopixels: [number, number, number][] = [];
        private brightness: number = 20;

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

        public setBrightness(brightness: number) {
            this.brightness = brightness;
        }

        public getBrightness(): number {
            return this.brightness;
        }

        public rotate(offset: number = 1, reverse?: boolean) {
            for (let i = 0; i < offset; i++) {
                if (reverse)
                    this.neopixels.unshift(this.neopixels.pop());
                else
                    this.neopixels.push(this.neopixels.shift());
            }
        }

        public clearPixels() {
            this.neopixels = [];
        }

        public updatePower() {
            let p = 0;
            this.neopixels.forEach(pixel => p += pixel[0] + pixel[1] + pixel[2]);
            this.power = this.neopixels.length * 0.47 /* static energy cost per neopixel */
                + p * 0.040621679; /* mA per bit */
            this.maxPower = Math.max(this.power, this.maxPower);
            const now = U.now() / 1000 / 3600; // hours
            if (this._lastPower < 0) {
                this._firstPower = this._lastPower = now;
                this.totalPower = this.power;
                this.forecastPower = 0;
            } else {
                this.totalPower += this.power * (now - this._lastPower);
                this._lastPower = now;
                this.forecastPower = this.totalPower / (now - this._firstPower);
            }
        }
    }
}

namespace pxsim.light {
    const MIN_POWER_LOG = 25;
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
        state.updatePower(); // compute power
        if (state.maxPower > MIN_POWER_LOG) { // auto-chart anything when power gets high
            const name = pin == defaultPin() ? `lights` : `lights on ${pin.id}`;
            runtime.board.writeSerial(`${name} (mA): ${Math.round(state.power)}\r\n`)
        }
    }

    export function defaultPin() {
        return (board() as LightBoard).defaultNeopixelPin();
    }
}
