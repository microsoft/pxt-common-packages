const enum JDMouseButton {
    //% block="right" enumval=1
    Right = 0x01,
    //% block="middle" enumval=4
    Middle = 0x04,
    //% block="left" enumval=2
    Left = 0x02,
}

namespace jacdac {
    //% fixedInstances
    export class MouseClient extends Client {
        constructor() {
            super("mous", jacdac.MOUSE_DEVICE_CLASS);
        }

        /** 
         * Sets the mouse button state to down
         */
        //% blockId=jdmouseSetButton block="%mouse button %index|%down=toggleDownUp"
        //% group="Mouse"
        setButton(button: JDMouseButton, down: boolean): void {
            const buf = control.createBuffer(3);
            buf[0] = JDMouseCommand.Button;
            buf[1] = button;
            buf[2] = down ? 1 : 0;
            this.sendPacket(buf);
        }

        /**
         * Moves the mouse
         **/
        //% help=mouse/move
        //% blockId=mouseMove block="%mouse move x %x|y %y"
        //% x.min=-128 x.max=127
        //% y.min=-128 y.max=127
        //% group="Mouse"
        move(x: number, y: number): void {
            const buf = control.createBuffer(3);
            buf[0] = JDMouseCommand.Move;
            buf.setNumber(NumberFormat.Int8LE, 1, x);
            buf.setNumber(NumberFormat.Int8LE, 2, y);
            this.sendPacket(buf);
        }

        /**
         * Moves the mouse
         **/
        //% help=mouse/wheel
        //% blockId=mouseWheel block="%mouse turn wheel %w"
        //% w.min=-128 w.max=127
        //% group="Mouse"
        turnWheel(w: number): void {
            const buf = control.createBuffer(2);
            buf[0] = JDMouseCommand.TurnWheel;
            buf.setNumber(NumberFormat.Int8LE, 1, w);
            this.sendPacket(buf);
        }
    }

    //% fixedInstance whenUsed block="mouse"
    export const mouseClient = new MouseClient();
}