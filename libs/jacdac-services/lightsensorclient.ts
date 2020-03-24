namespace jacdac {
    //% fixedInstances
    export class LightSensorClient extends SensorClient {
        constructor(name: string) {
            super(name, jd_class.LIGHT_SENSOR);
        }

        /**
         * Reads the current x value from the sensor
         */
        //% blockId=jacdaclightsensorlevel block="jacdac %lightsensor light level"
        //% group="Light sensor"
        get lightLevel(): number {
            const s = this.state;
            if (!s || s.length < 1) return 0;
            return s.getNumber(NumberFormat.UInt8LE, 0);
        }

        /**
         * Runs code when an event happens on the sensor
         * @param gesture 
         * @param handler 
         */
        //% blockId=jacadaclightsensoronevent block="jacdac %client on %event"
        //% group="Light sensor"
        onEvent(event: JDLightCondition, handler: () => void) {
            this.registerEvent(event, handler);
        }

        /**
         * Sets the threshold value for the event
         * @param level 
         * @param value 
         */
        //% blockId=jacdaclightsetthrshold block="jacdac %lightsensor set threshold %level to %value"
        //% group="Light sensor"
        setLightConditionThreshold(level: JDLightCondition, value: number) {
            this.setThreshold(level == JDLightCondition.Dark, value);
        }
    }

    //% fixedInstance whenUsed block="light sensor client"
    export const lightSensorClient = new LightSensorClient("lis");
}