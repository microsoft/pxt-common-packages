namespace jacdac {
    enum ControllerButtonOffset {
        A = 5,
        B = 6,
        Left = 1,
        Up = 2,
        Right = 3,
        Down = 4,
        Menu = 7
    }

    //% fixedInstances
    export class ControllerClient extends Broadcast {
        state: Buffer;
        streamingState: jacdac.SensorState;

        constructor() {
            super("ctrl", jacdac.CONTROLLER_DEVICE_CLASS, 2);
            this.controlData[0] = JDControllerCmd.Client;
            this.serverAddress = 0;
            this.state = control.createBuffer(2);
            this.state[0] = JDControllerCmd.Buttons;
            this.streamingState = jacdac.SensorState.Stopped;
        }

        get serverAddress() {
            return this.controlData[1];
        }

        set serverAddress(value: number) {
            this.controlData[1] = value;
        }

        private getPressed(offset: ControllerButtonOffset): boolean {
            return !!(this.state[1] & (1 << offset));
        }

        private setPressed(offset: ControllerButtonOffset, down: boolean) {
            const b = this.state[1];
            const msk = 1 << offset;
            this.state[0] = down ? (b | msk) : (b ^ msk);
            this.start();
        }

        //% blockCombine blockCombineShadow=toggleOnOff block="left pressed" blockSetVariable="button"
        //% group="Controller"
        get leftPressed() {
            return this.getPressed(ControllerButtonOffset.Left);
        }

        //% blockCombine
        //% group="Controller"
        set leftPressed(value: boolean) {
            this.setPressed(ControllerButtonOffset.Left, value);
        }

        //% blockCombine block="right pressed"
        //% group="Controller"
        get rightPressed() {
            return this.getPressed(ControllerButtonOffset.Right);
        }

        //% blockCombine
        //% group="Controller"
        set rightPressed(value: boolean) {
            this.setPressed(ControllerButtonOffset.Right, value);
        }

        //% blockCombine block="up pressed"
        //% group="Controller"
        get upPressed() {
            return this.getPressed(ControllerButtonOffset.Up);
        }

        //% blockCombine
        //% group="Controller"
        set upPressed(value: boolean) {
            this.setPressed(ControllerButtonOffset.Up, value);
        }

        //% blockCombine block="down pressed"
        //% group="Controller"
        get downPressed() {
            return this.getPressed(ControllerButtonOffset.Down);
        }

        //% blockCombine
        //% group="Controller"
        set downPressed(value: boolean) {
            this.setPressed(ControllerButtonOffset.Down, value);
        }

        //% blockCombine block="A pressed"
        //% group="Controller"
        get APressed() {
            return this.getPressed(ControllerButtonOffset.A);
        }

        //% blockCombine
        //% group="Controller"
        set APressed(value: boolean) {
            this.setPressed(ControllerButtonOffset.A, value);
        }

        //% blockCombine block="B pressed"
        //% group="Controller"
        get BPressed() {
            return this.getPressed(ControllerButtonOffset.B);
        }

        //% blockCombine
        //% group="Controller"
        set BPressed(value: boolean) {
            this.setPressed(ControllerButtonOffset.B, value);
        }

        isActive(): boolean {
            return !!this.serverAddress;
        }

        handleControlPacket(pkt: Buffer) {
            const cp = new ControlPacket(pkt);
            const data = cp.data;
            return this.processPacket(cp.address, data);
        }

        handlePacket(pkt: Buffer) {
            const packet = new JDPacket(pkt);
            const data = packet.data;
            return this.processPacket(packet.address, data);
        }

        private processPacket(address: number, data: Buffer): boolean {
            const cmd: JDControllerCmd = data[0];
            // received a packet from the server
            if (cmd == JDControllerCmd.Server) {
                const address = this.device.address;
                for (let i = 1; i < 5; ++i) {
                    if (data[i] == address) {
                        // we are connected!
                        if (this.serverAddress != address) {
                            this.serverAddress = address;
                            this.log(`server ${toHex8(this.serverAddress)}`);
                            this.startStreaming();
                            return true;
                        }
                    }
                }

                // did the server drop us
                if (address == this.serverAddress) {
                    this.serverAddress = 0; // streaming will stop automatically
                    this.log(`dropped`)
                }

                // nope, doesn't seem to be our server
                // do nothing
            }

            return true;
        }

        start() {
            if (!this._proxy)
                super.start();
            this.startStreaming();
        }

        private startStreaming() {
            if (this.streamingState != SensorState.Stopped)
                return;

            this.log(`start`);
            this.streamingState = SensorState.Streaming;
            control.runInBackground(() => {
                while (this.streamingState == SensorState.Streaming) {
                    if (this.isActive())
                        this.sendPacket(this.state);
                    // waiting for a bit
                    pause(100);
                }
                this.streamingState = SensorState.Stopped;
                this.log(`stopped`);
            })
        }

        private stopStreaming() {
            if (this.streamingState == SensorState.Streaming) {
                this.log(`stopping`)
                this.streamingState = SensorState.Stopping;
                pauseUntil(() => this.streamingState == SensorState.Stopped);
            }
        }
    }

    //% fixedInstance whenUsed block="controller"
    export const controllerClient = new ControllerClient();
}