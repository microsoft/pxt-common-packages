namespace jacdac {
    export class ActuatorService extends Host {
        state: Buffer;
        intensity: number;

        constructor(name: string, deviceClass: number, stateLength: number) {
            super(name, deviceClass);
            this.state = control.createBuffer(stateLength);
            this.intensity = 0
        }

        public handlePacket(packet: JDPacket) {
            this.stateUpdated = false

            this.intensity = this.handleRegInt(packet, REG_INTENSITY, this.intensity)
            this.state = this.handleRegBuffer(packet, REG_VALUE, this.state)

            if (this.stateUpdated)
                this.handleStateChanged();
            else
                this.handleCustomCommand(packet)
        }

        protected handleCustomCommand(pkt: JDPacket): void { }

        protected handleStateChanged(): void { }
    }

    export class ActuatorClient extends Client {
        protected state: Buffer;

        constructor(name: string, deviceClass: number, stateLength: number, requiredDevice: string) {
            super(name, deviceClass, requiredDevice);
            this.state = Buffer.create(stateLength);
            // TODO
            // this.onDriverEvent(JDDriverEvent.Connected, () => this.notifyChange());
        }

        protected ensureState(length: number) {
            if (length > this.state.length) {
                const b = control.createBuffer(length);
                b.write(0, this.state);
                this.state = b;
            }
        }

        protected notifyChange() {
            this.sendCommand(JDPacket.from(CMD_SET_REG | REG_VALUE, this.state))
        }
    }
}