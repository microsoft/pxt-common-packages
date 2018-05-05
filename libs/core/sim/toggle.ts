
namespace pxsim {
    export class ToggleState {
        constructor (private pin: Pin) { }
        toggle() {
            const on = !!this.pin.value;
            this.pin.digitalWritePin(on ? 0 : 1);            
        }

        on() {
            return this.pin.value > 0;
        }
    }

    export interface ToggleStateConstructor {
        (pin: Pin): ToggleState;
    }
}
