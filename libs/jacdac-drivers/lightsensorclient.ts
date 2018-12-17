enum JacdacLightCondition {
    //% block="dark"
    Dark = DAL.SENSOR_THRESHOLD_LOW,
    //% block="bright"
    Bright = DAL.SENSOR_THRESHOLD_HIGH
}

namespace jacdac {
    //% fixedInstances
    export class LightSensorClient extends SensorClient {
        constructor(name: string) {
            super(name, jacdac.LIGHT_SENSOR_DEVICE_CLASS);
        }

        /**
         * Reads the current x value from the sensor
         */
        //% blockId=jacdaclightsensorlevel block="jacdac %lightsensor light level"
        //% group="Light sensor"
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
        //% blockId=jacadaclightsensoronevent block="jacdac %lightsensor on %lightCondition"
        //% group="Light sensor"
        onEvent(lightCondition: JacdacLightCondition, handler: () => void) {
            this.registerEvent(lightCondition, handler);
        }

        /**
         * Sets the threshold value for the event
         * @param level 
         * @param value 
         */
        //% blockId=jacdaclightsetthrshold block="jacdac %lightsensor set threshold %level to %value"
        //% group="Light sensor"
        setLightConditionThreshold(level: JacdacLightCondition, value: number) {
            this.setThreshold(level == JacdacLightCondition.Dark, value);
        }

        static debugView(): DebugView {
            return new LightSensorDebugView();
        }
    }

    //% fixedInstance whenUsed block="light sensor"
    export const lightSensorClient = new LightSensorClient("lis");

    class LightSensorDebugView extends SensorDebugView {
        constructor() {
            super("lis", jacdac.LIGHT_SENSOR_DEVICE_CLASS);
        }
    }
}