namespace pxsim {
    export enum PinFlags {
        Unused = 0,
        Digital = 0x0001,
        Analog = 0x0002,
        Input = 0x0004,
        Output = 0x0008,
        Touch = 0x0010
    }

    export class Pin {
        constructor(public id: number) { }
        touched = false;
        value = 0;
        period = 0;
        servoAngle = 0;
        mode = PinFlags.Unused;
        pitch = false;
        pull = 0; // PullDown
        eventMode = 0;

        setValue(value: number) {
            // value set from the simulator
            const old = this.value;
            this.value = value;
            const b = board();
            if (b && this.eventMode == DAL.DEVICE_PIN_EVENT_ON_EDGE && old != this.value)
                b.bus.queue(this.id, this.value > 0 ? DAL.DEVICE_PIN_EVT_RISE : DAL.DEVICE_PIN_EVT_FALL);
        }

        digitalReadPin(): number {
            this.mode = PinFlags.Digital | PinFlags.Input;
            return this.value > 100 ? 1 : 0;
        }

        digitalWritePin(value: number) {
            const b = board();
            this.mode = PinFlags.Digital | PinFlags.Output;
            const v = this.value;
            this.value = value > 0 ? 1023 : 0;
            runtime.queueDisplayUpdate();
        }

        setPull(pull: number) {
            this.pull = pull;
        }

        analogReadPin(): number {
            this.mode = PinFlags.Analog | PinFlags.Input;
            return this.value || 0;
        }

        analogWritePin(value: number) {
            const b = board();
            this.mode = PinFlags.Analog | PinFlags.Output;
            const v = this.value;
            this.value = Math.max(0, Math.min(1023, value));
            runtime.queueDisplayUpdate();
        }

        analogSetPeriod(micros: number) {
            this.mode = PinFlags.Analog | PinFlags.Output;
            this.period = micros;
            runtime.queueDisplayUpdate();
        }

        servoWritePin(value: number) {
            this.analogSetPeriod(20000);
            this.servoAngle = Math.max(0, Math.min(180, value));
            runtime.queueDisplayUpdate();
        }

        servoSetPulse(pinId: number, micros: number) {
            // TODO
        }

        isTouched(): boolean {
            this.mode = PinFlags.Touch | PinFlags.Analog | PinFlags.Input;
            return this.touched;
        }

        onEvent(ev: number, handler: RefAction) {
            const b = board();
            switch(ev) {
                case DAL.DEVICE_PIN_EVT_PULSE_HI:
                case DAL.DEVICE_PIN_EVT_PULSE_LO:
                    this.eventMode = DAL.DEVICE_PIN_EVENT_ON_PULSE;
                    break;
                case DAL.DEVICE_PIN_EVT_RISE:
                case DAL.DEVICE_PIN_EVT_FALL:
                    this.eventMode = DAL.DEVICE_PIN_EVENT_ON_EDGE;
                    break;
                default:
                    return;
            }
            b.bus.listen(this.id, ev, handler);
        }
    }

    export interface EdgeConnectorProps {
        pins: number[];
        servos?: { [name: string]: number; }
    }

    export class EdgeConnectorState {
        pins: Pin[];

        constructor(public props: EdgeConnectorProps) {
            this.pins = props.pins.map(id => id != undefined ? new Pin(id) : null);
        }

        public getPin(id: number) {
            return this.pins.filter(p => p && p.id == id)[0] || null
        }
    }

}