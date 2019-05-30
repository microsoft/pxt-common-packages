namespace jacdac {
    export class ActuatorService extends Host {
        stateLength: number;
        state: Buffer;

        constructor(name: string, deviceClass: number, stateLength: number, controlDataLength?: number) {
            super(name, deviceClass, controlDataLength);
            this.stateLength = stateLength;
            this.state = control.createBuffer(this.stateLength);
        }

        public handlePacket(packet: JDPacket): number {
            this.state = packet.data;
            return this.handleStateChanged();
        }

        protected handleStateChanged(): number {
            return jacdac.DEVICE_OK;
        }
    }

    export class ActuatorClient extends Client {
        protected state: Buffer;

        constructor(name: string, deviceClass: number, stateLength: number, controlDataLength?: number) {
            super(name, deviceClass, controlDataLength);
            this.state = control.createBuffer(stateLength);
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
            this.sendPacket(this.state)
        }
    }
}