namespace jacdac {
    export class ActuatorHostDriver extends Driver {
        state: Buffer;

        constructor(name: string, deviceClass: number, stateLength: number, controlDataLength?: number) {
            super(name, DriverType.HostDriver, deviceClass, controlDataLength);
            this.state = control.createBuffer(stateLength);
            jacdac.addDriver(this);
        }

        public handlePacket(pkt: Buffer): boolean {
            const packet = new JDPacket(pkt);
            this.state = packet.data;
            return this.handleStateChanged();
        }

        protected handleStateChanged(): boolean {
            return true;
        }
    }

    export class ActuatorVirtualDriver extends Driver {
        protected state: Buffer;

        constructor(name: string, deviceClass: number, stateLength: number, controlDataLength?: number) {
            super(name, DriverType.VirtualDriver, deviceClass, controlDataLength);
            this.state = control.createBuffer(stateLength);
            jacdac.addDriver(this);
            this.onDriverEvent(JacDacDriverEvent.Connected, () => this.notifyChange());
        }

        protected notifyChange() {
            this.sendPacket(this.state)
        }
    }
}