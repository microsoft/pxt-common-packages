const enum JDButtonEvent {
    //% block="click"
    Click = 3,  // DEVICE_BUTTON_EVT_CLICK
    //% block="long click"
    LongClick = 4,  // DEVICE_BUTTON_EVT_LONG_CLICK
    //% block="up"
    Up = 2,  // DEVICE_BUTTON_EVT_UP
    //% block="down"
    Down = 1,  // DEVICE_BUTTON_EVT_DOWN
}

namespace jacdac {
    //% fixedInstances
    export class ButtonVirtualDriver extends SensorVirtualDriver {
        constructor(name: string) {
            super(name, jacdac.BUTTON_DRIVER_CLASS);
        }

        /**
         * Reads the current x value from the sensor
         */
        //% blockId=jacadacbtispressed block="jacdac %button is pressed"
        //% group="Input"
        isPressed(): boolean {
            const s = this.state;
            if (!s || s.length < 1) return false;
            return !!s.getNumber(NumberFormat.UInt8LE, 0);
        }

        /**
         * Runs code when an event happens on the sensor
         * @param gesture 
         * @param handler 
         */
        //% blockId=jacadacbtnonevent block="jacdac %button on %event"
        //% group="Input"
        onEvent(event: JDButtonEvent, handler: () => void) {
            control.onEvent(this.id, event, handler);
        }
    }

    //% fixedInstance whenUsed
    export const button = new ButtonVirtualDriver("button");
}