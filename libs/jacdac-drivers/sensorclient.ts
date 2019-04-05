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

        handleServiceInformation(device: JDDevice, serviceInfo: JDServiceInformation): number {
            if (this._sensorState == SensorState.None) return DEVICE_OK;
            const data = serviceInfo.data;
            const state = data.getNumber(NumberFormat.UInt8LE, 1);
            if ((this._sensorState & SensorState.Streaming) != (state & SensorState.Streaming))
                this.sync(); // start            
            return DEVICE_OK;
        }

        handlePacket(packet: JDPacket): number {
            const data = packet.data;
            const command = data.getNumber(NumberFormat.UInt8LE, 0);
            this.log(`vpkt ${command}`)
            switch (command) {
                case SensorCommand.State:
                    const state = data.slice(1);
                    const changed = !jacdac.bufferEqual(this._lastState, state);
                    const r = this.handleVirtualState(state);
                    this._lastState = state;
                    this._localTime = control.millis();
                    if (changed && this._stateChangedHandler)
                        this._stateChangedHandler();
                    return r;
                case SensorCommand.Event:
                    const value = data.getNumber(NumberFormat.UInt16LE, 1);
                    control.raiseEvent(this.eventId, value);
                    return jacdac.DEVICE_OK;
                default:
                    return this.handleCustomCommand(command, packet);
            }
        }

        protected handleCustomCommand(command: number, pkt: JDPacket): number {
            return jacdac.DEVICE_OK;
        }

        protected handleVirtualState(state: Buffer): number {
            return jacdac.DEVICE_OK;
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