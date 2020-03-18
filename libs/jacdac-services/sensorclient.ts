namespace jacdac {
    //% fixedInstances
    //% weight=1
    export class SensorClient extends Client {
        // virtual mode only
        protected _localTime: number;
        protected _lastState: Buffer;
        private _stateChangedHandler: () => void;

        public isStreaming = false

        constructor(name: string, deviceClass: number) {
            super(name, deviceClass);
            this._lastState = control.createBuffer(0);
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
            this.isStreaming = on
            this.sync()
        }

        /**
         * Requests the sensor to calibrate
         */
        public calibrate() {
            this.start();
            this.sendCommand(JDPacket.onlyHeader(CMD_CALIBRATE, 0))
        }

        private sync() {
            if (!this.isConnected()) return;
            this.sendCommand(JDPacket.onlyHeader(CMD_SET_STREAMING, this.isStreaming ? 1 : 0))
        }

        public onStateChanged(handler: () => void) {
            this._stateChangedHandler = handler;
            this.start();
        }

        protected onAttach() {
            this.sync()
        }

        handlePacket(packet: JDPacket) {
            this.log(`vpkt ${packet.service_command}`)
            switch (packet.service_command) {
                case CMD_GET_STATE: {
                    const state = packet.data
                    const changed = !state.equals(this._lastState);
                    this.handleVirtualState(state);
                    this._lastState = state;
                    this._localTime = control.millis();
                    if (changed && this._stateChangedHandler)
                        this._stateChangedHandler();
                }
                case CMD_EVENT:
                    control.raiseEvent(this.eventId, packet.service_argument);
                default:
                    this.handleCustomCommand(packet);
            }
        }

        protected handleCustomCommand(pkt: JDPacket) {
        }

        protected handleVirtualState(state: Buffer) {
        }

        protected setThreshold(low: boolean, value: number) {
            this.start();
            const cmd = low ? ARG_LOW_THRESHOLD : ARG_HIGH_THRESHOLD
            this.sendCommand(JDPacket.packed(CMD_SET_THRESHOLD, cmd, "i", [value]))
        }
    }
}