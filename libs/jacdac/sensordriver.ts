namespace jacdac {
    export enum StreamingState {
        Stopped,
        Streaming,
        Stopping
    }

    export enum StreamingCommand {
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
    /**
     * JacDac service running on sensor and streaming data out
     */
    export class StreamingHostDriver extends PairableDriver {
        private _stateSerializer: () => Buffer;
        private _streamingState: StreamingState;
        private _sendTime: number;
        private _sendState: Buffer;
        public streamingInterval: number; // millis

        constructor(name: string, stateSerializer: () => Buffer, deviceClass: number) {
            super(name, true, deviceClass);
            this._stateSerializer = stateSerializer;
            this._streamingState = StreamingState.Stopped;
            this.streamingInterval = 50;
            jacdac.addDriver(this);
        }

        protected handleHostPacket(packet: JDPacket): boolean {
            const command = packet.getNumber(NumberFormat.UInt8LE, 0);
            this.log(`hpkt ${command}`);
            switch (command) {
                case StreamingCommand.StartStream:
                    const interval = packet.getNumber(NumberFormat.UInt32LE, 1);
                    if (interval)
                        this.streamingInterval = Math.max(20, interval);
                    this.startStreaming();
                    return true;
                case StreamingCommand.StopStream:
                    this.stopStreaming();
                    return true;
                default:
                    // let the user deal with it
                    return this.handleHostCommand(command, packet);
            }
        }

        // override
        protected handleHostCommand(command: number, pkt: JDPacket) {
            return true;
        }

        public startStreaming() {
            if (this._streamingState != StreamingState.Stopped)
                return;

            this.log(`start`);
            this._streamingState = StreamingState.Streaming;
            control.runInBackground(() => {
                while (this._streamingState == StreamingState.Streaming) {
                    // run callback                    
                    const state = this._stateSerializer();
                    if (!!state) {
                        // did the state change?
                        if (!this._sendState
                            || (control.millis() - this._sendTime > STREAMING_MAX_SILENCE)
                            || !bufferEqual(state, this._sendState)) {

                            // send state and record time
                            const pkt = control.createBuffer(state.length + 4);
                            pkt.setNumber(NumberFormat.UInt8LE, 0, StreamingCommand.State);
                            pkt.setNumber(NumberFormat.UInt32LE, 1, control.millis());
                            pkt.write(5, state);
                            if (this.canSendPacket())
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
                this._streamingState = StreamingState.Stopped;
            })
        }

        public stopStreaming() {
            if (this._streamingState == StreamingState.Streaming) {
                this.log(`stop`);
                this._streamingState = StreamingState.Stopping;
                pauseUntil(() => this._streamingState == StreamingState.Stopped);
            }
        }
    }

    export class StreamingVirtualDriver extends PairableDriver {
        // virtual mode only
        protected _localTime: number;
        protected _lastHostTime: number;
        protected _lastState: Buffer;
        onStateChanged: () => void;

        constructor(name: string, deviceClass: number) {
            super(name, false, deviceClass);
            this._lastState = control.createBuffer(0);
            jacdac.addDriver(this);
        }

        public get state() {
            return this._lastState;
        }

        protected handleVirtualPacket(packet: JDPacket): boolean {
            const command = packet.getNumber(NumberFormat.UInt8LE, 0);
            this.log(`vpkt ${command}`)
            switch (command) {
                case StreamingCommand.State:
                    const time = packet.getNumber(NumberFormat.UInt32LE, 1);
                    const state = packet.data.slice(5);
                    const changed = !bufferEqual(this._lastState, state);
                    const r = this.handleVirtualState(time, state);
                    this._lastHostTime = time;
                    this._lastState = state;
                    this._localTime = control.millis();
                    if (changed && this.onStateChanged)
                        this.onStateChanged();
                    return r;
                default:
                    return this.handleVirtualCommand(command, packet);
            }
        }

        protected handleVirtualCommand(command: number, pkt: JDPacket) {
            return true;
        }

        protected handleVirtualState(time: number, state: Buffer) {
            return true;
        }
    }
}