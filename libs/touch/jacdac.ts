namespace jacdac {
    export class TouchButtonHostDriver extends SensorHostDriver {
        private button: TouchButton;
        constructor(name: string, button: TouchButton) {
            super(name, jacdac.TOUCHBUTTON_DEVICE_CLASS);
            this.button = button;
            jacdac.BUTTON_EVENTS.forEach((ev, j) => {
                control.onEvent(this.button.id(), ev, () => {
                    this.raiseHostEvent(ev);
                })
            })
        }

        serializeState() {
            const buf = control.createBuffer(3);
            buf.setNumber(NumberFormat.UInt8LE, 0, this.button.isPressed() ? 0xff : 0);
            buf.setNumber(NumberFormat.UInt16LE, 1, this.button.value());
            return buf;
        }
    }
}