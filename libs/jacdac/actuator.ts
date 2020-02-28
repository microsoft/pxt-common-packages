namespace jacdac {
    export class ActuatorService extends Host {
        stateLength: number;
        state: Buffer;

        constructor(name: string, deviceClass: number, stateLength: number, controlDataLength?: number) {
            super(name, deviceClass, controlDataLength);
            this.stateLength = stateLength;
            this.state = control.createBuffer(this.stateLength);
        }

        public handlePacket(packet: JDPacket) {
            if (packet.service_command == CMD_SET_STATE) {
                this.state = packet.data;
                this.handleStateChanged();
            }
        }

        protected handleStateChanged(): void {
        }
    }

    export class ActuatorClient extends Client {
        protected state: Buffer;

        constructor(name: string, deviceClass: number, stateLength: number) {
            super(name, deviceClass);
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
            this.sendCmd(JDPacket.from(CMD_SET_STATE, 0, this.state))
        }
    }
}