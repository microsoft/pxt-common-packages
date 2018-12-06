const enum JDSwitchDirection {
    //% block="left"
    Left = DAL.DEVICE_BUTTON_EVT_UP,
    //% block="right"
    Right = DAL.DEVICE_BUTTON_EVT_DOWN,
}

namespace jacdac {
    //% fixedInstances
    export class SwitchVirtualDriver extends SensorVirtualDriver {
        constructor(name: string) {
            super(name, jacdac.SWITCH_DEVICE_CLASS);
        }

        /**
         * Reads the current x value from the sensor
         */
        //% blockId=jacdacswitchright block="jacdac %switch right"
        //% group="Switch"
        right(): number {
            const s = this.state;
            if (!s || s.length < 1) return 0;
            return s.getNumber(NumberFormat.UInt8LE, 0);
        }

        /**
         * Runs code when an event happens on the sensor
         * @param gesture 
         * @param handler 
         */
        //% blockId=jacdacswitchonevent block="jacdac %switch on %event"
        //% group="Touch"
        onEvent(event: JDSwitchDirection, handler: () => void) {
            control.onEvent(this.id, event, handler);
        }
    }

    //% fixedInstance whenUsed
    export const switchButton = new TouchButtonVirtualDriver("switch");
}