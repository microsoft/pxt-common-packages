namespace jacdac {
    //% fixedInstances
    export class MicrophoneVirtualDriver extends SensorVirtualDriver {
        constructor(name: string) {
            super(name, jacdac.MICROPHONE_DEVICE_CLASS);
        }

        /**
         * Reads the current x value from the sensor
         */
        get level(): number {
            const s = this.state;
            if (!s || s.length < 1) return 0;
            return s.getNumber(NumberFormat.UInt8LE, 0);
        }

        /**
         * Runs code when an event happens on the sensor
         * @param gesture 
         * @param handler 
         */
        //% blockId=jacadacmicrophoneonevent block="jacdac %microphone on loud sound"
        //% group="Microphone"
        onLoudSound(handler: () => void) {
            control.onEvent(this.id, DAL.SENSOR_THRESHOLD_HIGH, handler);
        }

        /**
         * Sets the threshold value for the event
         * @param level 
         * @param value 
         */
        //% blockId=jacdacmicrophonesetthreshold block="jacdac %microphone set loud sound threshold to %value"
        //% group="Microphone"
        setLoudSoundThreshold(value: number) {
            this.setThreshold(false, value);
        }
    }

    //% fixedInstance whenUsed block="microphone"
    export const microhponeService = new MicrophoneVirtualDriver("microphone");
}