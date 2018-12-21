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

        //% blockCombine blockSetVariable=left
        //% group="Controller"
        get left() {
            return this.getPressed(ControllerButtonOffset.Left);
        }

        //% blockCombine blockCombineShadow=toggleUpDown blockSetVariable=left
        //% group="Controller"
        set left(value: boolean) {
            this.setPressed(ControllerButtonOffset.Left, value);
        }

        //% blockCombine
        //% group="Controller"
        get right() {
            return this.getPressed(ControllerButtonOffset.Right);
        }

        //% blockCombine
        //% group="Controller"
        set right(value: boolean) {
            this.setPressed(ControllerButtonOffset.Right, value);
        }

        //% blockCombine
        //% group="Controller"
        get up() {
            return this.getPressed(ControllerButtonOffset.Up);
        }

        //% blockCombine
        //% group="Controller"
        set up(value: boolean) {
            this.setPressed(ControllerButtonOffset.Up, value);
        }

        //% blockCombine
        //% group="Controller"
        get down() {
            return this.getPressed(ControllerButtonOffset.Down);
        }

        //% blockCombine
        //% group="Controller"
        set down(value: boolean) {
            this.setPressed(ControllerButtonOffset.Down, value);
        }

        //% blockCombine
        //% group="Controller"
        get A() {
            return this.getPressed(ControllerButtonOffset.A);
        }

        //% blockCombine
        //% group="Controller"
        set A(value: boolean) {
            this.setPressed(ControllerButtonOffset.A, value);
        }

        //% blockCombine
        //% group="Controller"
        get B() {
            return this.getPressed(ControllerButtonOffset.B);
        }

        //% blockCombine
        //% group="Controller"
        set B(value: boolean) {
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