namespace jacdac {
    //% fixedInstances
    //% weight=1
    export class SensorClient extends Client {
        // virtual mode only
        protected _localTime: number;
        protected _lastState: Buffer;
        private _stateChangedHandler: () => void;

        public isStreaming = false

        constructor(name: string, deviceClass: number, requiredDevice: string) {
            super(name, deviceClass, requiredDevice);
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
            this.setRegInt(REG_IS_STREAMING, this.isStreaming ? 1 : 0)
        }

        /**
         * Requests the sensor to calibrate
         */
        public calibrate() {
            this.sendCommand(JDPacket.onlyHeader(CMD_CALIBRATE))
        }

        public onStateChanged(handler: () => void) {
            this._stateChangedHandler = handler;
            this.start();
        }

        handlePacket(packet: JDPacket) {
            // this.log(`vpkt ${packet.service_command}`)
            switch (packet.service_command) {
                case CMD_GET_REG | REG_READING: {
                    const state = packet.data
                    const changed = !state.equals(this._lastState);
                    this.handleVirtualState(state);
                    this._lastState = state;
                    this._localTime = control.millis();
                    if (changed && this._stateChangedHandler)
                        this._stateChangedHandler();
                    break
                }
                case CMD_EVENT:
                    control.raiseEvent(this.eventId, packet.intData);
                    break
                default:
                    this.handleCustomCommand(packet);
                    break
            }
        }

        protected handleCustomCommand(pkt: JDPacket) {
        }

        protected handleVirtualState(state: Buffer) {
        }

        protected setThreshold(low: boolean, value: number) {
            this.setRegInt(low ? REG_LOW_THRESHOLD : REG_HIGH_THRESHOLD, value)
        }
    }
}