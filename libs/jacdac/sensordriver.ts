namespace jacdac {
    export enum SensorState {
        Stopped = 0x01,
        Stopping = 0x02,
        Streaming = 0x04,
    }

    export enum SensorCommand {
        State,
        Event,
        StartStream,
        StopStream,
        LowThreshold,
        HighThreshold
    }

    export function bufferEqual(l: Buffer, r: Buffer): boolean {
        if (!l || !r) return !!l == !!r;
        if (l.length != r.length) return false;
        for (let i = 0; i < l.length; ++i) {
            if (l.getNumber(NumberFormat.UInt8LE, i) != r.getNumber(NumberFormat.UInt8LE, i))
                return false;
        }
        return true;
    }

    /**
     * JacDac service running on sensor and streaming data out
     */
    export class SensorService extends Service {
        static MAX_SILENCE = 500;
        private sensorState: SensorState;
        private _sendTime: number;
        private _sendState: Buffer;
        public streamingInterval: number; // millis

        constructor(name: string, deviceClass: number, controlLength = 0) {
            super(name, deviceClass, 1 + controlLength);
            this.sensorState = SensorState.Stopped;
            this._sendTime = 0;
            this.streamingInterval = 50;
        }

        public updateControlPacket() {
            // send streaming state in control package
            this.controlData.setNumber(NumberFormat.UInt8LE, 0, this.sensorState);
            const buf = this.sensorControlPacket();
            if (buf)
                this.controlData.write(1, buf);
        }

        protected sensorControlPacket(): Buffer {
            return undefined;
        }

        public handleControlPacket(pkt: Buffer): boolean {
            const cp = new ControlPacket(pkt);
            if (cp.data.getNumber(NumberFormat.UInt8LE, 0) == 0)
                this.stopStreaming();
            else
                this.startStreaming();
            return true;
        }

        public handlePacket(pkt: Buffer): boolean {
            const packet = new JDPacket(pkt);
            const command = packet.getNumber(NumberFormat.UInt8LE, 0);
            this.log(`hpkt ${command}`);
            switch (command) {
                case SensorCommand.StartStream:
                    const interval = packet.getNumber(NumberFormat.UInt32LE, 1);
                    if (interval)
                        this.streamingInterval = Math.max(20, interval);
                    this.startStreaming();
                    return true;
                case SensorCommand.StopStream:
                    this.stopStreaming();
                    return true;
                case SensorCommand.LowThreshold:                
                    this.setThreshold(true, packet.getNumber(NumberFormat.UInt32LE, 1));
                    return true;
                case SensorCommand.HighThreshold:
                    this.setThreshold(false, packet.getNumber(NumberFormat.UInt32LE, 1));
                    return true;
                default:
                    // let the user deal with it
                    return this.handleCustomCommand(command, packet);
            }
        }

        // override
        protected serializeState(): Buffer {
            return undefined;
        }

        // override
        protected setThreshold(low: boolean, value: number) {

        }

        protected handleCustomCommand(command: number, pkt: JDPacket) {
            return true;
        }

        protected raiseHostEvent(value: number) {
            const pkt = control.createBuffer(3);
            pkt.setNumber(NumberFormat.UInt8LE, 0, SensorCommand.Event);
            pkt.setNumber(NumberFormat.UInt16LE, 1, value);
            this.sendPacket(pkt);
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
                        if (this.isConnected
                            && (!this._sendState
                                || (control.millis() - this._sendTime > SensorService.MAX_SILENCE)
                                || !jacdac.bufferEqual(state, this._sendState))) {

                            // send state and record time
                            const pkt = control.createBuffer(state.length + 1);
                            pkt.setNumber(NumberFormat.UInt8LE, 0, SensorCommand.State);
                            pkt.write(1, state);
                            this.sendPacket(pkt);
                            this._sendState = state;
                            this._sendTime = control.millis();
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
                this.sensorState = SensorState.Stopping;
                pauseUntil(() => this.sensorState == SensorState.Stopped);
            }
        }
    }
}