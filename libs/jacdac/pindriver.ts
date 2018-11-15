namespace jacdac {
    enum PinMode {
        SetAnalog,
        SetDigital,
        SetServo
    }
    /**
         */
    export class PinDriver extends JacDacPairableDriver {
        private _pin: PwmOnlyPin; // might be null

        constructor(pin: PwmOnlyPin = undefined) {
            super(!!pin, DAL.JD_DRIVER_CLASS_PIN);
            this._pin = pin;
        }

        private sendPacket(mode: PinMode, value: number): boolean {
            if (!this.canSendPacket())
                return false;

            const pkg = control.createBuffer(4);
            pkg.setNumber(NumberFormat.UInt16LE, 0, mode);
            pkg.setNumber(NumberFormat.Int16LE, 2, value);

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
       
        protected handleHostPacket(packet: JDPacket): boolean {        
            const mode = <PinMode>packet.getNumber(NumberFormat.UInt16LE, 0);
            const value = packet.getNumber(NumberFormat.Int16LE, 2);
            
            switch(mode) {
                case PinMode.SetAnalog:
                    this._pin.analogWrite(value); break;
                case PinMode.SetDigital:
                    this._pin.digitalWrite(!!value); break;
                case PinMode.SetServo:
                    this._pin.servoWrite(value); break;
                default:
                    this.log(`unknown pin mode ${mode}`); break;
            }
            return true;
        }
    }
}