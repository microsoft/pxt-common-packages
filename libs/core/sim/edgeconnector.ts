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
            switch (ev) {
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

    export class SerialDevice {
        private baudRate: number;
        private rxBuffer: RefBuffer;
        private txBuffer: RefBuffer;

        constructor(public tx: pins.DigitalInOutPin, public rx: pins.DigitalInOutPin, private id: number) {
            this.baudRate = 115200;
            this.setRxBufferSize(64);
            this.setTxBufferSize(64);
        }

        setTxBufferSize(size: number) {
            this.txBuffer = control.createBuffer(size);
        }

        setRxBufferSize(size: number) {
            this.rxBuffer = control.createBuffer(size);
        }

        read(): number {
            return -1;
        }

        readBuffer(): RefBuffer {
            const buf = control.createBuffer(0);
            return buf;
        }

        writeBuffer(buffer: any) {
        }

        setBaudRate(rate: number) {
            this.baudRate = rate;
        }

        redirect(tx: pins.DigitalInOutPin, rx: pins.DigitalInOutPin, rate: number) {
            this.tx = tx;
            this.rx = rx;
            this.baudRate = rate;
        }

        onEvent(event: number, handler: RefAction) {
            pxsim.control.internalOnEvent(this.id, event, handler);
        }

        onDelimiterReceived(delimiter: number, handler: RefAction): void {
            // TODO
        }
    }

    export class SPI {
        frequency: number;
        mode: number;

        constructor(public mosi: pins.DigitalInOutPin, public miso: pins.DigitalInOutPin, public sck: pins.DigitalInOutPin) {
            this.frequency = 250000;
            this.mode = 0;
        }

        write(value: number) {
            return 0;
        }

        transfer(command: RefBuffer, response: RefBuffer) {
        }

        setFrequency(frequency: number) {
            this.frequency = frequency;
        }

        setMode(mode: number) {
            this.mode = mode;
        }
    }

    export class I2C {
        constructor(public sda: pins.DigitalInOutPin, public scl: pins.DigitalInOutPin) {

        }
        readBuffer(address: number, size: number, repeat?: boolean): RefBuffer {
            return control.createBuffer(0);
        }

        writeBuffer(address: number, buf: RefBuffer, repeat?: boolean): number {
            return 0;
        }
    }

    export interface EdgeConnectorProps {
        pins: number[];
        servos?: {
            [name: string]: number;
        }
    }

    export class EdgeConnectorState {
        pins: Pin[];
        private _i2cs: I2C[] = [];
        private _spis: SPI[] = [];
        private _serials: SerialDevice[] = [];

        constructor(public props: EdgeConnectorProps) {
            this.pins = props.pins.map(id => id != undefined ? new Pin(id) : null);
        }

        public getPin(id: number) {
            return this.pins.filter(p => p && p.id == id)[0] || null
        }

        createI2C(sda: pins.DigitalInOutPin, scl: pins.DigitalInOutPin) {
            let ser = this._i2cs.filter(s => s.sda == sda && s.scl == scl)[0];
            if (!ser)
                this._i2cs.push(ser = new I2C(sda, scl));
            return ser;
        }

        createSPI(mosi: pins.DigitalInOutPin, miso: pins.DigitalInOutPin, sck: pins.DigitalInOutPin) {
            let ser = this._spis.filter(s => s.mosi == mosi && s.miso == miso && s.sck == sck)[0];
            if (!ser)
                this._spis.push(ser = new SPI(mosi, miso, sck));
            return ser;
        }

        createSerialDevice(tx: pins.DigitalInOutPin, rx: pins.DigitalInOutPin, id: number): SerialDevice {
            let ser = this._serials.filter(s => s.tx == tx && s.rx == rx)[0];
            if (!ser)
                this._serials.push(ser = new SerialDevice(tx, rx, id));
            return ser;
        }
    }

}