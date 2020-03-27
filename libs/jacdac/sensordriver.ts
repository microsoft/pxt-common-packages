namespace jacdac {
    /**
     * JacDac service running on sensor and streaming data out
     */
    export class SensorHost extends Host {
        public streamingInterval: number; // millis
        public isStreaming: boolean;
        protected lowThreshold: number
        protected highThreshold: number

        constructor(name: string, deviceClass: number) {
            super(name, deviceClass);
            this.streamingInterval = 100;
            this.isStreaming = false;
        }

        public handlePacket(packet: JDPacket) {
            this.log(`hpkt ${packet.service_command}`);
            this.stateUpdated = false
            this.lowThreshold = this.handleRegInt(packet, REG_LOW_THRESHOLD, this.lowThreshold)
            this.highThreshold = this.handleRegInt(packet, REG_HIGH_THRESHOLD, this.highThreshold)
            this.streamingInterval = this.handleRegInt(packet, REG_STREAMING_INTERVAL, this.streamingInterval)
            const newStr = this.handleRegBool(packet, REG_IS_STREAMING, this.isStreaming)
            this.setStreaming(newStr)

            switch (packet.service_command) {
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
        protected handleCalibrateCommand(pkt: JDPacket) {
        }

        protected handleCustomCommand(pkt: JDPacket) {
        }

        protected raiseHostEvent(value: number) {
            this.sendReport(JDPacket.packed(CMD_EVENT, "I", [value]))
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
                            this.sendReport(JDPacket.from(CMD_GET_REG | REG_READING, state))
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