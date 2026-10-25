namespace pxsim.encoders {
    const ROT_EV_CHANGED = 0x2233;

    export function createRotaryEncoder(pinA: Pin, pinB: Pin): RotaryEncoder {
        return new RotaryEncoder(pinA, pinB, 0);
    }

    export class RotaryEncoder {
        constructor(
            public pinA: Pin,
            public pinB: Pin,
            public position: number) {
        }

        get id() {
            return this.pinA.id;
        }

        onChanged(handler: RefAction) {
            pxsim.control.internalOnEvent(this.id, ROT_EV_CHANGED, handler);
        }
    }
}

namespace pxsim.RotaryEncoderMethods {
    export function onChanged(encoder: pxsim.encoders.RotaryEncoder, handler: RefAction): void {
        encoder.onChanged(handler);
    }

    export function position(encoder: pxsim.encoders.RotaryEncoder): number {
        return encoder.position;
    }

}