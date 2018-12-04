enum JacDacTemperatureCondition {
    //% block="hot"
    Hot = DAL.SENSOR_THRESHOLD_HIGH,  // ANALOG_THRESHOLD_HIGH
    //% block="cold"
    Cold = DAL.SENSOR_THRESHOLD_LOW  // ANALOG_THRESHOLD_LOW
}


enum JacDacTemperatureUnit {
    //% block="°C"
    Celsius = 0,
    //% block="°F"
    Fahrenheit = 1,
}

namespace jacdac {
    //% fixedInstances
    export class ThermometerVirtualDriver extends SensorVirtualDriver {
        constructor(name: string) {
            super(name, jacdac.THERMOMETER_DEVICE_CLASS);
        }

        /**
         * Reads the current x value from the sensor
         */
        temperature(unit: JacDacTemperatureUnit): number {
            const s = this.state;
            if (!s || s.length < 2) return 0;
            const t = s.getNumber(NumberFormat.Int16LE, 0);
            switch(unit) {
                case JacDacTemperatureUnit.Fahrenheit: (t * 18) / 10 + 32;
                default: return t;
            }
        }

        /**
         * Runs code when an event happens on the sensor
         * @param gesture 
         * @param handler 
         */
        //% blockId=jacadacthermoonevent block="jacdac %lightsensor on %lightCondition"
        //% group="Thermometer"
        onTemperatureConditionChanged(condition: JacDacTemperatureCondition, temperature: number, unit: JacDacTemperatureUnit, handler: () => void): void {
            if (unit == JacDacTemperatureUnit.Fahrenheit)
                temperature = (temperature - 32) * 5 / 9;
            this.setThreshold(condition == JacDacTemperatureCondition.Cold, temperature);
            control.onEvent(this.id, condition, handler);
        }
    }

    //% fixedInstance whenUsed
    export const thermometer = new ThermometerVirtualDriver("thermometer");
}