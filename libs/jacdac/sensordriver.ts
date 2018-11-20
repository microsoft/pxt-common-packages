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
        State,
        Event
    }

    function bufferEqual(l: Buffer, r: Buffer): boolean {
        if (!l || !r) return !!l == !!r;
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
    export class StreamingHostDriver extends JacDacDriver {
        private stateSerializer: () => Buffer;
        private streamingState: StreamingState;
        private _sendTime: number;
        private _sendState: Buffer;
        public streamingInterval: number; // millis

        constructor(name: string, stateSerializer: () => Buffer, deviceClass: number) {
            super(name, DriverType.HostDriver, deviceClass);
            this.stateSerializer = stateSerializer;
            this.streamingState = StreamingState.Stopped;
            this._sendTime = 0;
            this.streamingInterval = 50;
            jacdac.addDriver(this);
        }

        public handlePacket(pkt: Buffer): boolean {
            const packet = new JDPacket(pkt);
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
                    return this.handleCustomCommand(command, packet);
            }
        }

        // override
        protected handleCustomCommand(command: number, pkt: JDPacket) {
            return true;
        }

        public startStreaming() {
            if (this.streamingState != StreamingState.Stopped)
                return;

            this.log(`start`);
            this.streamingState = StreamingState.Streaming;
            control.runInBackground(() => {
                while (this.streamingState == StreamingState.Streaming) {
                    // run callback                    
                    const state = this.stateSerializer();
                    if (!!state) {
                        // did the state change?
                        if (!this._sendState
                            || (control.millis() - this._sendTime > STREAMING_MAX_SILENCE)
                            || !bufferEqual(state, this._sendState)) {

                            // send state and record time
                            const pkt = control.createBuffer(state.length + 5);
                            pkt.setNumber(NumberFormat.UInt8LE, 0, StreamingCommand.State);
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
                this.streamingState = StreamingState.Stopped;
            })
        }

        public stopStreaming() {
            if (this.streamingState == StreamingState.Streaming) {
                this.streamingState = StreamingState.Stopping;
                pauseUntil(() => this.streamingState == StreamingState.Stopped);
                this.log(`stopped`);
            }
        }
    }

    export class StreamingVirtualDriver extends JacDacDriver {
        // virtual mode only
        protected _localTime: number;
        protected _lastHostTime: number;
        protected _lastState: Buffer;
        onStateChanged: () => void;

        constructor(name: string, deviceClass: number) {
            super(name, DriverType.VirtualDriver, deviceClass);
            this._lastState = control.createBuffer(0);
            jacdac.addDriver(this);
        }

        public get state() {
            return this._lastState;
        }

        public handlePacket(pkt: Buffer): boolean {
            const packet = new JDPacket(pkt);
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
                case StreamingCommand.Event:
                    const value = packet.data.getNumber(NumberFormat.UInt16LE, 0);
                    control.raiseEvent(this.device.id, value);
                    return true;
                default:
                    return this.handleCustomCommand(command, packet);
            }
        }

        protected handleCustomCommand(command: number, pkt: JDPacket) {
            return true;
        }

        protected handleVirtualState(time: number, state: Buffer) {
            return true;
        }
    }
}