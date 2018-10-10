namespace jacdac {
    enum PinMode {
        SetAnalog,
        SetDigital,
        SetServo
    }
    /**
         */
    export class PinDriver extends JacDacDriver {
        private _pin: PwmOnlyPin; // might be null

        constructor(pin: PwmOnlyPin = undefined) {
            super(
                !!pin ? DriverType.PairableHostDriver : DriverType.PairedDriver, 
                DAL.JD_DRIVER_CLASS_PIN);
            this._pin = pin;
        }

        private sendPacket(mode: PinMode, value: number): boolean {
            if (!this.device.isPaired || !this.device.isConnected)
                return false;

            const pkg = control.createBuffer(4);
            pkg.setNumber(NumberFormat.UInt16LE, 0, mode);
            pkg.setNumber(NumberFormat.Int16LE, 2, value);

            jacdac.sendPacket(pkg, this.device.address);
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

        public handleControlPacket(pkt: Buffer): boolean {
            const cp = new ControlPacket(pkt);
            if (this.device.isPairedDriver && !this.device.isPaired) {
                jacdac.log("need to pair");
                if (cp.flags & DAL.CONTROL_JD_FLAGS_PAIRABLE) {
                    jacdac.sendPairing(cp.address, 
                        DAL.JD_DEVICE_FLAGS_REMOTE 
                        | DAL.JD_DEVICE_FLAGS_INITIALISED 
                        | DAL.JD_DEVICE_FLAGS_CP_SEEN, 
                        cp.serialNumber, 
                        cp.driverClass);
                }
            }
            return true;
        }
       
        public handlePacket(pkt: Buffer): boolean {
            if (this.device.isVirtualDriver
                || (this.device.isPaired && this.pairedInstanceAddress != this.device.address))
                return true;
        
            const mode = <PinMode>pkt.getNumber(NumberFormat.UInt16LE, 0);
            const value = pkt.getNumber(NumberFormat.Int16LE, 2);
            
            switch(mode) {
                case PinMode.SetAnalog:
                    this._pin.analogWrite(value); break;
                case PinMode.SetDigital:
                    this._pin.digitalWrite(!!value); break;
                case PinMode.SetServo:
                    this._pin.servoWrite(value); break;
                default:
                    jacdac.log(`unknown pin mode ${mode}`); break;
            }

            return true;
        }

    }
}