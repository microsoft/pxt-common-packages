namespace jacdac {
    export class ActuatorService extends Host {
        stateLength: number;
        state: Buffer;
        enabled = true;

        constructor(name: string, deviceClass: number, stateLength: number, controlDataLength?: number) {
            super(name, deviceClass, controlDataLength);
            this.stateLength = stateLength;
            this.state = control.createBuffer(this.stateLength);
        }

        public handlePacket(packet: JDPacket) {
            switch (packet.service_command) {
                case CMD_SET_STATE:
                    this.state = packet.data;
                    this.handleStateChanged();
                    break
                case CMD_GET_STATE:
                    this.sendReport(JDPacket.from(REP_STATE, 0, this.state))
                    break
                case CMD_SET_ENABLED:
                    if (packet.service_argument == 0)
                        this.enabled = false;
                    else if (packet.service_argument == 1)
                        this.enabled = true;
                    this.handleStateChanged();
                    break
                case CMD_GET_ENABLED:
                    JDPacket.onlyHeader(REP_ENABLED, this.enabled ? 1 : 0)
                    break
            }
        }

        protected handleStateChanged(): void {
            // if not responding to 'enabled' bit, make sure to set it to true here
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