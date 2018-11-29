namespace jacdac {
    export enum SensorState {
        Stopped = 0x01,
        Streaming = 0x02,
        Stopping = 0x04
    }

    export enum SensorCommand {
        State,
        Event,
        StartStream,
        StopStream
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

    /**
     * JacDac service running on sensor and streaming data out
     */
    export class SensorHostDriver extends Driver {
        static MAX_SILENCE = 500;
        private stateSerializer: () => Buffer;
        private sensorState: SensorState;
        private _sendTime: number;
        private _sendState: Buffer;
        public streamingInterval: number; // millis

        constructor(name: string, stateSerializer: () => Buffer, deviceClass: number) {
            super(name, DriverType.HostDriver, deviceClass, 1);
            this.stateSerializer = stateSerializer;
            this.sensorState = SensorState.Stopped;
            this._sendTime = 0;
            this.streamingInterval = 50;
            jacdac.addDriver(this);
        }

        public updateControlPacket() {
            // send streaming state in control package
            this.controlData.setNumber(NumberFormat.UInt8LE, 0, this.sensorState);
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
                default:
                    // let the user deal with it
                    return this.handleCustomCommand(command, packet);
            }
        }

        // override
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
                    const state = this.stateSerializer();
                    if (!!state) {
                        // did the state change?
                        if (this.isConnected
                            && (!this._sendState
                                || (control.millis() - this._sendTime > SensorHostDriver.MAX_SILENCE)
                                || !bufferEqual(state, this._sendState))) {

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

    //% fixedInstances
    export class SensorVirtualDriver extends Driver {
        // virtual mode only
        protected _localTime: number;
        protected _lastState: Buffer;
        private _stateChangedHandler: () => void;

        constructor(name: string, deviceClass: number) {
            super(name, DriverType.VirtualDriver, deviceClass);
            this._lastState = control.createBuffer(0);
            jacdac.addDriver(this);
        }

        public get state() {
            return this._lastState;
        }

        /**
         * Enables or disable streaming the sensor internal state
         * @param on streaming enabled
         */
        //% blockid=jacdacsensorstreaming block="jacdac %sensor set streaming %on"
        //% on.shadow=toggleOnOff weight=1
        //% group="Input"
        public setStreaming(on: boolean) {
            const msg = control.createBuffer(1);
            msg.setNumber(NumberFormat.UInt8LE, 0, on ? SensorCommand.StartStream : SensorCommand.StopStream);
            this.sendPacket(msg);
        }

        public onStateChanged(handler: () => void) {
            this._stateChangedHandler = handler;
        }

        public handlePacket(pkt: Buffer): boolean {
            const packet = new JDPacket(pkt);
            const command = packet.getNumber(NumberFormat.UInt8LE, 0);
            this.log(`vpkt ${command}`)
            switch (command) {
                case SensorCommand.State:
                    const state = packet.data.slice(1);
                    const changed = !bufferEqual(this._lastState, state);
                    const r = this.handleVirtualState(state);
                    this._lastState = state;
                    this._localTime = control.millis();
                    if (changed && this._stateChangedHandler)
                        this._stateChangedHandler();
                    return r;
                case SensorCommand.Event:
                    const value = packet.data.getNumber(NumberFormat.UInt16LE, 1);
                    control.raiseEvent(this.id, value);
                    return true;
                default:
                    return this.handleCustomCommand(command, packet);
            }
        }

        protected handleCustomCommand(command: number, pkt: JDPacket) {
            return true;
        }

        protected handleVirtualState(state: Buffer) {
            return true;
        }
    }
}