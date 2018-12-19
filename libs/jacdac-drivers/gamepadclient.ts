namespace jacdac {
    //% fixedInstances
    export class GamepadClient extends Client {
        constructor() {
            super("gpad", jacdac.GAMEPAD_DEVICE_CLASS);
        }

        /** 
         * Sets the button state to down
         */
        //% blockId=jdjoystickSetButton block="%gamepad button %index=joystickStandardButton|%down=toggleDownUp"
        //% weight=100 group="Gamepad"
        setButton(index: number, down: boolean): void {
            const buf = control.createBuffer(3);
            buf[0] = JDGamepadCommand.Button;
            buf[1] = index;
            buf[2] = down ? 1 : 0;
            this.sendPacket(buf);
        }

        /**
         * Sets the current move on the gamepad
         **/
        //% blockId=gamepadMove block="%gamepad %index|move by x %x|y %y"
        //% help=gamepad/move
        //% index.min=0 index.max=1
        //% blockGap=8 group="Gamepad"
        move(index: number, x: number, y: number): void {
            const buf = control.createBuffer(3);
            buf[0] = JDGamepadCommand.Move;
            buf[1] = index;
            buf.setNumber(NumberFormat.Int8LE, 2, x);
            buf.setNumber(NumberFormat.Int8LE, 3, y);
            this.sendPacket(buf);
        }

        /** 
         * Sets the throttle state
         */
        //% blockId=gamepadSetThrottle block="%gamepad set throttle %index|to %value"
        //% gamepad/set-throttle blockHidden=1
        //% index.min=0 index.max=1
        //% value.min=0 value.max=31
        //% group="Gamepad"
        setThrottle(index: number, value: number): void {
            const buf = control.createBuffer(3);
            buf[0] = JDGamepadCommand.Move;
            buf[1] = index;
            buf.setNumber(NumberFormat.Int8LE, 2, value);
            this.sendPacket(buf);
        }
    }

    //% fixedInstance whenUsed block="gamepad"
    export const gamepadClient = new GamepadClient();
}