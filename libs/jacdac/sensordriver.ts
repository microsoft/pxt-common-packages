namespace jacdac {
    export enum JacDacStreamingState {
        Stopped,
        Streaming,
        Stopping
    }

    export enum JacDacStreamingCommand {
        None,
        StartStream,
        StopStream,
        State
    }

    function bufferEqual(l: Buffer, r: Buffer): boolean {
        if (l.length != r.length) return false;
        for (let i = 0; i < l.length; ++i) {
            if (l.getNumber(NumberFormat.UInt8LE, i) != r.getNumber(NumberFormat.UInt8LE, i))
                return false;
        }
        return true;
    }

    const STREAMING_MAX_SILENCE = 500;
    export class JacDacStreamingPairableDriver extends JacDacPairableDriver {
        private _stateSerializer: () => Buffer;
        private _streamingState: JacDacStreamingState;
        public streamingInterval: number; // millis
        // virtual mode only
        protected _localTime: number;
        protected _sendTime: number;
        protected _sendState: Buffer;

        constructor(name: string, stateSerializer: () => Buffer, deviceClass: number) {
            super(name, !!stateSerializer, deviceClass);
            this._stateSerializer = stateSerializer;
            this._streamingState = JacDacStreamingState.Stopped;
            this.streamingInterval = 20;
        }

        public get state() {
            return this._sendState;
        }

        protected handleHostPacket(packet: JDPacket): boolean {
            const command = packet.getNumber(NumberFormat.UInt8LE, 0);
            this.log(`hpkt ${command}`);
            switch (command) {
                case JacDacStreamingCommand.StartStream:
                    const interval = packet.getNumber(NumberFormat.UInt32LE, 1);
                    this.startStreaming(interval);
                    return true;
                case JacDacStreamingCommand.StopStream:
                    this.stopStreaming();
                    return true;
                default:
                    // let the user deal with it
                    return this.handleHostCommand(command, packet);
            }
        }

        protected handleVirtualPacket(packet: JDPacket): boolean {
            const command = packet.getNumber(NumberFormat.UInt8LE, 0);
            this.log(`vpkt ${command}`)
            switch (command) {
                case JacDacStreamingCommand.State:
                    const time = packet.getNumber(NumberFormat.UInt32LE, 1);
                    const state = packet.data.slice(5);
                    const r = this.handleVirtualState(time, state);
                    this._sendTime = time;
                    this._sendState = state;
                    this._localTime = control.millis();
                    return r;
                default:
                    return this.handleVirtualCommand(command, packet);
            }
            return true;
        }

        // override
        protected handleHostCommand(command: number, pkt: JDPacket) {
            return true;
        }

        protected handleVirtualCommand(command: number, pkt: JDPacket) {
            return true;
        }

        protected handleVirtualState(time: number, state: Buffer) {
            return true;
        }

        protected startStreaming(interval: number = -1) {
            if (this._streamingState != JacDacStreamingState.Stopped
                || !this.device.isPairedDriver)
                return;

            this.log(`start streaming`);
            this._streamingState = JacDacStreamingState.Streaming;
            if (interval > 0)
                this.streamingInterval = Math.max(20, interval); // don't overstream
            control.runInBackground(() => {
                while (this._streamingState == JacDacStreamingState.Streaming) {
                    // run callback                    
                    const state = this._stateSerializer();
                    if (!!state) {
                        // did the state change?
                        if (!this._sendState
                            || (control.millis() - this._sendTime > STREAMING_MAX_SILENCE)
                            || !bufferEqual(state, this._sendState)) {

                            // send state and record time
                            const pkt = control.createBuffer(state.length + 4);
                            pkt.setNumber(NumberFormat.UInt8LE, 0, JacDacStreamingCommand.State);
                            pkt.setNumber(NumberFormat.UInt32LE, 1, control.millis());
                            pkt.write(5, state);
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
                this._streamingState = JacDacStreamingState.Stopped;
            })
        }

        protected stopStreaming() {
            this.log(`stop streaming`);
            this._streamingState = JacDacStreamingState.Stopping;
            pauseUntil(() => this._streamingState == JacDacStreamingState.Stopped);
        }
    }
}