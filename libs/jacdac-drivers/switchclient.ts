const enum JDSwitchDirection {
    //% block="left"
    Left = DAL.DEVICE_BUTTON_EVT_UP,
    //% block="right"
    Right = DAL.DEVICE_BUTTON_EVT_DOWN,
}

namespace jacdac {
    //% fixedInstances
    export class SwitchClient extends SensorClient {
        constructor(name: string) {
            super(name, jacdac.SWITCH_DEVICE_CLASS);
        }

        /**
         * Reads the current x value from the sensor
         */
        //% blockId=jacdacswitchright block="jacdac %switch right"
        //% group="Switch"
        right(): boolean {
            const s = this.state;
            if (!s || s.length < 1) return false;
            return !!s.getNumber(NumberFormat.UInt8LE, 0);
        }

        /**
         * Runs code when an event happens on the sensor
         * @param gesture 
         * @param handler 
         */
        //% blockId=jacdacswitchonevent block="jacdac %switch on %event"
        //% group="Switch"
        onEvent(event: JDSwitchDirection, handler: () => void) {
            this.registerEvent(event, handler);
        }
    }

    //% fixedInstance whenUsed block="switch"
    export const switchClient = new SwitchClient("switch");
}