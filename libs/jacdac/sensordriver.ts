namespace jacdac {
    /**
     * JacDac service running on sensor and streaming data out
     */
    export class SensorHost extends Host {
        public streamingInterval: number; // millis
        public isStreaming: boolean;

        constructor(name: string, deviceClass: number, controlLength = 0) {
            super(name, deviceClass, controlLength);
            this.streamingInterval = 100;
            this.isStreaming = false;
        }

        public handlePacket(packet: JDPacket) {
            this.log(`hpkt ${packet.service_command}`);
            const [val] = packet.data.unpack("i")
            switch (packet.service_command) {
                case CMD_SET_STREAMING:
                    if (packet.service_argument == 1) {
                        if (val)
                            this.streamingInterval = Math.max(20, val);
                        this.startStreaming();
                    } else if (packet.service_argument == 0) {
                        this.stopStreaming();
                    }
                    break
                case CMD_GET_STREAMING:
                    this.sendReport(JDPacket.packed(
                        REP_STREAMING,
                        this.isStreaming ? 1 : 0,
                        "i", [this.streamingInterval]))
                    break
                case CMD_SET_THRESHOLD:
                    switch (packet.service_argument) {
                        case ARG_LOW_THRESHOLD:
                            this.setThreshold(true, val);
                            break
                        case ARG_HIGH_THRESHOLD:
                            this.setThreshold(false, val);
                            break
                    }
                    break
                case CMD_CALIBRATE:
                    this.handleCalibrateCommand(packet);
                    break
                default:
                    // let the user deal with it
                    this.handleCustomCommand(packet);
                    break
            }
        }

        // override
        protected serializeState(): Buffer {
            return undefined;
        }

        // override
        protected setThreshold(low: boolean, value: number) {

        }

        // override
        protected handleCalibrateCommand(pkt: JDPacket) {
        }

        protected handleCustomCommand(pkt: JDPacket) {
        }

        protected raiseHostEvent(value: number) {
            this.sendReport(JDPacket.onlyHeader(REP_EVENT, value))
        }

        public setStreaming(on: boolean) {
            if (on) this.startStreaming();
            else this.stopStreaming();
        }

        private startStreaming() {
            if (this.isStreaming)
                return;

            this.log(`start`);
            this.isStreaming = true;
            control.runInBackground(() => {
                while (this.isStreaming) {
                    // run callback                    
                    const state = this.serializeState();
                    if (!!state) {
                        // did the state change?
                        if (this.isConnected()) {
                            // send state and record time
                            this.sendReport(JDPacket.from(REP_STATE, 0, state))
                        }
                    }
                    // check streaming interval value
                    if (this.streamingInterval < 0)
                        break;
                    // waiting for a bit
                    pause(this.streamingInterval);
                }
                this.isStreaming = false
                this.log(`stopped`);
            })
        }

        private stopStreaming() {
            if (this.isStreaming) {
                this.log(`stopping`)
                this.isStreaming = null
                pauseUntil(() => this.isStreaming === false);
            }
        }
    }
}