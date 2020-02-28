namespace jacdac {
    export enum SensorState {
        None = 0,
        Stopped = 0x01,
        Stopping = 0x02,
        Streaming = 0x04,
    }

    /**
     * JacDac service running on sensor and streaming data out
     */
    export class SensorHost extends Host {
        public streamingInterval: number; // millis

        constructor(name: string, deviceClass: number, controlLength = 0) {
            super(name, deviceClass, 1 + controlLength);
            this.sensorState = SensorState.Stopped;
            this.streamingInterval = 100;
        }

        get sensorState(): SensorState {
            return this.controlData[0];
        }

        set sensorState(value: SensorState) {
            this.controlData[0] = value;
        }

        public updateControlPacket() {
            // send streaming state in control package
            const buf = this.sensorControlPacket();
            if (buf)
                this.controlData.write(1, buf);
        }

        protected sensorControlPacket(): Buffer {
            return undefined;
        }

        public handlePacket(packet: JDPacket) {
            this.log(`hpkt ${packet.service_command}`);
            const val = packet.data.getNumber(NumberFormat.Int32LE, 0)
            switch (packet.service_command) {
                case CMD_START_STREAM:
                    if (val)
                        this.streamingInterval = Math.max(20, val);
                    this.startStreaming();
                    break
                case CMD_STOP_STREAM:
                    this.stopStreaming();
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
            this.sendResponse(
                JDPacket.onlyHeader(RESP_EVENT, value))
        }

        public setStreaming(on: boolean) {
            if (on) this.startStreaming();
            else this.stopStreaming();
        }

        private startStreaming() {
            if (this.sensorState != SensorState.Stopped)
                return;

            this.log(`start`);
            this.sensorState = SensorState.Streaming;
            control.runInBackground(() => {
                while (this.sensorState == SensorState.Streaming) {
                    // run callback                    
                    const state = this.serializeState();
                    if (!!state) {
                        // did the state change?
                        if (this.isConnected()) {
                            // send state and record time
                            this.sendResponse(
                                JDPacket.from(RESP_MY_STATE, 0, state))
                        }
                    }
                    // check streaming interval value
                    if (this.streamingInterval < 0)
                        break;
                    // waiting for a bit
                    pause(this.streamingInterval);
                }
                this.sensorState = SensorState.Stopped;
                this.log(`stopped`);
            })
        }

        private stopStreaming() {
            if (this.sensorState == SensorState.Streaming) {
                this.log(`stopping`)
                this.sensorState = SensorState.Stopping;
                pauseUntil(() => this.sensorState == SensorState.Stopped);
            }
        }
    }
}