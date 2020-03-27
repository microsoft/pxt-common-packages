namespace jacdac {
    export enum SensorStateTODO {
        None = 0,
        Stopped = 0x01,
        Stopping = 0x02,
        Streaming = 0x04,
    }

    //% fixedInstances
    export class ControllerClient extends Broadcast {
        state: Buffer;
        streamingState: jacdac.SensorStateTODO;
        streamingInterval: number;
        stateUpdateHandler: () => void;
        lastServerTime: number;
        controlData: Buffer

        constructor() {
            super("ctrl", jd_class.CONTROLLER);
            this.controlData = Buffer.create(3)
            this.controlData[0] = JDControllerCommand.ControlClient;
            this.serverAddress = 0;
            this.playerIndex = 0;
            this.state = control.createBuffer(2);
            this.state[0] = JDControllerCommand.ClientButtons;
            this.streamingState = jacdac.SensorStateTODO.Stopped;
            this.streamingInterval = 25;
            this.lastServerTime = 0;
        }

        get serverAddress() {
            return this.controlData[1];
        }

        set serverAddress(value: number) {
            this.controlData[1] = value;
        }

        get playerIndex(): number {
            return this.controlData[2];
        }

        set playerIndex(index: number) {
            this.controlData[2] = index;
        }

        isPressed(offset: JDControllerButton): boolean {
            const msk = 1 << offset;
            return !!(this.state[1] & msk);
        }

        setIsPressed(offset: JDControllerButton, down: boolean) {
            const b = this.state[1];
            const msk = 1 << offset;
            this.state[1] = down ? (b | msk) : (~(~b | msk));
        }

        //% blockCombine blockCombineShadow=toggleOnOff block="left is pressed" blockSetVariable="button"
        //% group="Controller"
        get leftIsPressed() {
            return this.isPressed(JDControllerButton.Left);
        }

        //% blockCombine
        //% group="Controller"
        set leftIsPressed(value: boolean) {
            this.setIsPressed(JDControllerButton.Left, value);
        }

        //% blockCombine block="right is pressed"
        //% group="Controller"
        get rightIsPressed() {
            return this.isPressed(JDControllerButton.Right);
        }

        //% blockCombine
        //% group="Controller"
        set rightIsPressed(value: boolean) {
            this.setIsPressed(JDControllerButton.Right, value);
        }

        //% blockCombine block="up is pressed"
        //% group="Controller"
        get upIsPressed() {
            return this.isPressed(JDControllerButton.Up);
        }

        //% blockCombine
        //% group="Controller"
        set upIsPressed(value: boolean) {
            this.setIsPressed(JDControllerButton.Up, value);
        }

        //% blockCombine block="down is pressed"
        //% group="Controller"
        get downIsPressed() {
            return this.isPressed(JDControllerButton.Down);
        }

        //% blockCombine
        //% group="Controller"
        set downIsPressed(value: boolean) {
            this.setIsPressed(JDControllerButton.Down, value);
        }

        //% blockCombine block="A is pressed"
        //% group="Controller"
        get AIsPressed() {
            return this.isPressed(JDControllerButton.A);
        }

        //% blockCombine
        //% group="Controller"
        set AIsPressed(value: boolean) {
            this.setIsPressed(JDControllerButton.A, value);
        }

        //% blockCombine block="B is pressed"
        //% group="Controller"
        get BIsPressed() {
            return this.isPressed(JDControllerButton.B);
        }

        //% blockCombine
        //% group="Controller"
        set BIsPressed(value: boolean) {
            this.setIsPressed(JDControllerButton.B, value);
        }

        /**
         * Register code to run when the state is about to be sent
         * @param handler 
         */
        //% blockId=jdctrlclientonstate block="on %controller state update"
        //% group="Controller"
        onStateUpdate(handler: () => void) {
            this.stateUpdateHandler = handler;
        }

        isActive(): boolean {
            return !!this.serverAddress && this.client.isConnected()
        }

        handlePacket(packet: JDPacket) {
            const data = packet.data;
            const cmd: JDControllerCommand = data[0];
            // received a packet from the server
            if (cmd == JDControllerCommand.ControlServer) {
                this.log(`server ${packet.device_identifier}`)
                /* JDTODO
                for (let i = 1; i <= 4; ++i) {
                    if (data[i] == address) {
                        // check that we are still connected to the same server
                        if (this.serverAddress != packetAddress) {
                            this.serverAddress = packetAddress;
                            this.playerIndex = i;
                            this.log(`server ${toHex8(this.serverAddress)}`);
                        }
                        this.lastServerTime = control.millis();
                        // start streaming
                        this.startStreaming();
                        return jacdac.DEVICE_OK;
                    }
                }
                // did the server drop us
                if (address == this.serverAddress) {
                    this.log(`dropped`);
                    this.serverAddress = 0; // streaming will stop automatically
                    this.playerIndex = 0;
                    this.stopStreaming();
                }
                */

                // nope, doesn't seem to be our server
                // do nothing
            }
        }

        start() {
            super.start();
            this.startStreaming();
        }

        private startStreaming() {
            if (this.streamingState != SensorStateTODO.Stopped)
                return;

            this.log(`start`);
            this.streamingState = SensorStateTODO.Streaming;
            control.runInBackground(() => this.stream());
        }

        private stream() {
            while (this.streamingState == SensorStateTODO.Streaming) {
                // alllow handle to update state
                if (this.stateUpdateHandler)
                    this.stateUpdateHandler();
                // send state
                this.sendReport(
                    JDPacket.from(CMD_GET_REG | REG_READING, this.state))
                // waiting for a bit
                pause(this.streamingInterval);
                // check if server still alive
                if (control.millis() - this.lastServerTime > 1000) {
                    this.serverAddress = 0; // inactive
                }
            }
            this.streamingState = SensorStateTODO.Stopped;
            this.log(`stopped`);
        }

        private stopStreaming() {
            if (this.streamingState == SensorStateTODO.Streaming) {
                this.log(`stopping`)
                this.streamingState = SensorStateTODO.Stopping;
                pauseUntil(() => this.streamingState == SensorStateTODO.Stopped);
            }
        }
    }

    //% fixedInstance whenUsed block="controller client"
    export const controllerClient = new ControllerClient();
}