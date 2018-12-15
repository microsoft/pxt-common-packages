namespace jacdac {
    //% fixedInstances
    //% weight=1
    export class SensorClient extends Client {
        // virtual mode only
        protected _localTime: number;
        protected _lastState: Buffer;
        private _stateChangedHandler: () => void;

        private _sensorState: SensorState;

        constructor(name: string, deviceClass: number) {
            super(name, deviceClass);
            this._lastState = control.createBuffer(0);
            this._sensorState = SensorState.None;
        }

        public get state() {
            this.start();
            return this._lastState;
        }

        /**
         * Enables or disable streaming the sensor internal state
         * @param on streaming enabled
         */
        //% blockid=jacdacsensorstreaming block="jacdac %sensor set streaming %on"
        //% on.shadow=toggleOnOff weight=1
        //% group="Services"
        public setStreaming(on: boolean) {
            this.start();
            this._sensorState = on ? SensorState.Streaming : SensorState.Stopped;
            this.sync();
        }

        private sync() {
            if (this._sensorState == SensorState.None) return;
            
            const buf = control.createBuffer(1);
            const cmd = (this._sensorState & SensorState.Streaming)
                ? SensorCommand.StartStream : SensorCommand.StopStream;
            buf.setNumber(NumberFormat.UInt8LE, 0, cmd);
            this.sendPacket(buf);
        }

        public onStateChanged(handler: () => void) {
            this._stateChangedHandler = handler;
            this.start();
        }

        handleControlPacket(pkt: Buffer): boolean {
            if (this._sensorState == SensorState.None) return true;
            const packet = new ControlPacket(pkt);
            const state = packet.data.getNumber(NumberFormat.UInt8LE, 1);
            if ((this._sensorState & SensorState.Streaming) != (state & SensorState.Streaming))
                this.sync(); // start            
            return true;
        }

        public handlePacket(pkt: Buffer): boolean {
            const packet = new JDPacket(pkt);
            const command = packet.getNumber(NumberFormat.UInt8LE, 0);
            this.log(`vpkt ${command}`)
            switch (command) {
                case SensorCommand.State:
                    const state = packet.data.slice(1);
                    const changed = !jacdac.bufferEqual(this._lastState, state);
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

        static renderControlPacket(data: Buffer): string {
            const state = data[0];
            switch(state) {
                case SensorState.Stopping: return "stopping";
                case SensorState.Streaming: return "stream";
                default: return "stop";
            }
        }
        
        static renderClientPacket(data: Buffer, renderCustom: (data:Buffer) => string): string {
            const cmd = data[0];
            switch(cmd) {
                case SensorCommand.StartStream:
                    const interval = data.getNumber(NumberFormat.UInt32LE, 1);
                    return `start stream ${interval ? `(${interval}ms)` : ''}`;
                case SensorCommand.StopStream:
                    return `stop stream`;
                case SensorCommand.LowThreshold:                
                    return `low ${data[1]}`
                case SensorCommand.HighThreshold:
                    return `high ${data[1]}`
                default:
                    return renderCustom(data);
            }
        }

        protected handleCustomCommand(command: number, pkt: JDPacket) {
            return true;
        }

        protected handleVirtualState(state: Buffer) {
            return true;
        }

        protected setThreshold(low: boolean, value: number) {
            this.start();
            const buf = control.createBuffer(5);
            const cmd = low ? SensorCommand.LowThreshold : SensorCommand.HighThreshold;
            buf.setNumber(NumberFormat.UInt8LE, 0, cmd);
            buf.setNumber(NumberFormat.Int32LE, 1, value);
            this.sendPacket(buf);
        }
    }
}