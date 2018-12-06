namespace jacdac {
    export class SwitchHostDriver extends SensorHostDriver {
        constructor(name: string) {
            super(name, jacdac.SWITCH_DEVICE_CLASS);
            input.onSwitchMoved(SwitchDirection.Left, () => this.raiseHostEvent(SwitchDirection.Left));
            input.onSwitchMoved(SwitchDirection.Right, () => this.raiseHostEvent(SwitchDirection.Right));
        }

        serializeState() {
            const buf = control.createBuffer(1);
            buf.setNumber(NumberFormat.UInt8LE, 0, input.switchRight() ? 1 : 0);
            return buf;
        }
    }
}