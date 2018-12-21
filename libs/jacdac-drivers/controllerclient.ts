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
    export class ControllerClient extends Client {
        state: Buffer;
        constructor() {
            super("ctrl", jacdac.CONTROLLER_DEVICE_CLASS);
            this.state = control.createBuffer(1);
        }

        private getPressed(offset: ControllerButtonOffset): boolean {
            return !!(this.state[0] & (1 << offset));
        }

        private setPressed(offset: ControllerButtonOffset, down: boolean) {
            const b = this.state[0];
            const msk = 1 << offset;
            this.state[0] = down ? (b | msk) : (b ^ msk);
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

        start() {
            if (!this._proxy) {
                super.start();
                control.runInBackground(() => {
                    while (this._proxy) {
                        this.sendPacket(this.state);
                        pause(20);
                    }
                })
            }
        }
    }

    //% fixedInstance whenUsed block="controller"
    export const controllerClient = new ControllerClient();
}