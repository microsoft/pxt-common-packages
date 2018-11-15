namespace jacdac {
    enum PinMode {
        SetAnalog,
        SetDigital,
        SetServo,
        ReadAnalog,
        ReadDigital
    }
    /**
         */
    export class PinDriver extends JacDacPairableDriver {
        private _pin: PwmPin; // might be null
        private _mode: PinMode;
        private _interval: number;

        constructor(pin: PwmPin = undefined) {
            super(!!pin, DAL.JD_DRIVER_CLASS_PIN);
            this._pin = pin;
            this._mode = PinMode.SetAnalog;
        }

        private sendPacket(mode: PinMode, value: number): boolean {
            if (!this.canSendPacket())
                return false;

            const pkg = control.createBuffer(4);
            pkg.setNumber(NumberFormat.UInt16LE, 0, mode);
            pkg.setNumber(NumberFormat.Int32LE, 2, value);

            jacdac.sendPacket(pkg, this.device.driverAddress);
            return true;
        }

        //%
        setAnalogValue(value: number) {
            this.sendPacket(PinMode.SetAnalog, value >> 0);
        }

        //%
        setDigitalValue(value: number) {
            this.sendPacket(PinMode.SetDigital, value >> 0);
        }

        //%
        setServoValue(value: number) {
            this.sendPacket(PinMode.SetServo, value >> 0);
        }

        protected isReadMode() {
            return this._mode == PinMode.ReadAnalog || this._mode == PinMode.ReadDigital;
        }

        protected handleHostPacket(packet: JDPacket): boolean {
            const mode = <PinMode>packet.getNumber(NumberFormat.UInt16LE, 0);
            const value = packet.getNumber(NumberFormat.Int32LE, 4);

            this._mode = mode;
            switch (this._mode) {
                case PinMode.SetAnalog:
                case PinMode.SetDigital:
                case PinMode.SetServo:
                    this._interval = -1; // this also stops streaming
                    switch (this._mode) {
                        case PinMode.SetAnalog:
                            this._pin.analogWrite(value);
                            break;
                        case PinMode.SetDigital:
                            this._pin.digitalWrite(!!value);
                            break;
                        case PinMode.SetServo:
                            this._pin.servoWrite(value);
                            break;
                    }
                    break;
                case PinMode.ReadAnalog:
                case PinMode.ReadDigital:
                    // start streaming...
                    this._mode = mode;
                    this._interval = value;
                    this.startStreaming();
                    break;
                default:
                    this.log(`unknown pin mode ${this._mode}`);
                    break;
            }
            return true;
        }

        protected startStreaming() {
            control.runInBackground(() => {
                while (this.isReadMode() && this._interval > 0) {
                    // send state to parent
                    switch (this._mode) {
                        case PinMode.ReadAnalog:
                            this.sendPacket(PinMode.ReadAnalog, this._pin.analogRead());
                            break;
                        case PinMode.ReadDigital:
                            this.sendPacket(PinMode.ReadDigital, this._pin.digitalRead() ? 1 : 0);
                            break;
                    }
                    pause(this._interval);
                }
            })
        }
    }
}