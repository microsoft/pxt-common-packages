namespace jacdac {
    //% fixedInstances
    export class TouchClient extends SensorClient {
        constructor(name: string) {
            super(name, jacdac.TOUCHBUTTON_DEVICE_CLASS);
        }

        /**
         * Reads the current x value from the sensor
         */
        //% blockId=jacadactouchispressed block="jacdac %button value"
        //% group="Touch"
        value(): number {
            const s = this.state;
            if (!s || s.length < 2) return 0;
            return s.getNumber(NumberFormat.UInt16LE, 0);
        }

        /**
         * Runs code when an event happens on the sensor
         * @param gesture 
         * @param handler 
         */
        //% blockId=jacadactouchonevent block="jacdac %button on %event"
        //% group="Touch"
        onEvent(event: JDButtonEvent, handler: () => void) {
            control.onEvent(this.id, event, handler);
        }

        static debugView(): DebugView {
            return new TouchDebugView();
        }
    }

    //% fixedInstance whenUsed block="touch"
    export const touchClient = new TouchClient("touch");

    class TouchDebugView extends SensorDebugView {
        constructor() {
            super("tch", jacdac.BUTTON_DEVICE_CLASS);
        }

        renderEvent(value: number): string {
            switch(value) {
                case JDButtonEvent.Click: return "click";
                case JDButtonEvent.Down: "down";
                case JDButtonEvent.Up: "up";
                case JDButtonEvent.LongClick: return "lg click" 
                default: return "";
            }
        }

        renderState(data: Buffer): string {
            return `${data.getNumber(NumberFormat.UInt16LE, 0)}`;
        }
    }

}