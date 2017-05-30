namespace pxsim {
    export class CapacitiveSensorState {
        capacity: number[] = [];
        reading: boolean[] = [];
        mapping: Map<number>;

        constructor(mapping: Map<number>) {
            this.mapping = mapping;
        }

        private getCap(pinId: number): number {
            return this.mapping[pinId];
        }

        readCap(pinId: number, samples: number): number {
            let capId = this.getCap(pinId);
            return this.capacitiveSensor(capId, samples);
        }

        isReadingPin(pinId: number, pin: Pin) {
            let capId = this.getCap(pinId);
            return this.reading[capId];
        }

        isReading(capId: number) {
            return this.reading[capId];
        }

        startReading(pinId: number, pin: Pin) {
            let capId = this.getCap(pinId);
            this.reading[capId] = true;
            pin.mode = PinFlags.Analog | PinFlags.Input;
            pin.mode |= PinFlags.Analog;
        }

        capacitiveSensor(capId: number, samples: number): number {
            return this.capacity[capId] || 0;
        }

        reset(capId: number): void {
            this.capacity[capId] = 0;
            this.reading[capId] = false;
        }
    }
}

namespace pxsim.pxtcore {
    export function getTouchButton(buttonId: number): Button {
        // const state = board().buttonState;
        // if (buttonId < state.touchButtons.length && buttonId >= 0) {
        //     const pin = board().edgeConnectorState.getPin(state.touchPins[buttonId]) as pins.CPPin;
        //     pin.mode |= PinFlags.Analog;
        //     pins.markUsed(pin);
        //     return state.touchButtons[buttonId];
        // }
        // panic
        return undefined;
    }
}
