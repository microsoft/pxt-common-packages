namespace jacdac {
    export class ActuatorService extends Service {
        state: Buffer;

        constructor(name: string, deviceClass: number, stateLength: number, controlDataLength?: number) {
            super(name, deviceClass, controlDataLength);
            this.state = control.createBuffer(stateLength);
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

    export class ActuatorClient extends Client {
        protected state: Buffer;

        constructor(name: string, deviceClass: number, stateLength: number, controlDataLength?: number) {
            super(name, deviceClass, controlDataLength);
            this.state = control.createBuffer(stateLength);
            this.onDriverEvent(JacDacDriverEvent.Connected, () => this.notifyChange());
        }

        protected notifyChange() {
            this.sendPacket(this.state)
        }
    }
}