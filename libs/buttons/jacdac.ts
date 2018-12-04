namespace jacdac {
    export class ButtonHostDriver extends SensorHostDriver {
        private button: Button;
        constructor(name: string, button: Button) {
            super(name, jacdac.BUTTON_DEVICE_CLASS);
            this.button = button;
            jacdac.BUTTON_EVENTS.forEach((ev, j) => {
                control.onEvent(this.button.id(), ev, () => {
                    this.raiseHostEvent(ev);
                })
            })
        }

        serializeState() {
            const buf = control.createBuffer(1);
            buf.setNumber(NumberFormat.UInt8LE, 0, this.button.isPressed() ? 0xff : 0);
            return buf;
        }
    }
}