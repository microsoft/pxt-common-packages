namespace jacdac {
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

        protected handleCustomCommand(command: number, pkt: JDPacket) {
            return true;
        }

        protected handleVirtualState(state: Buffer) {
            return true;
        }

        protected setThreshold(low: boolean, value: number) {
            const buf = control.createBuffer(5);
            const cmd = low ? SensorCommand.LowThreshold : SensorCommand.HighThreshold;
            buf.setNumber(NumberFormat.UInt8LE, 0, cmd);
            buf.setNumber(NumberFormat.Int32LE, 1, value);
            this.sendPacket(buf);
        }
    }
}