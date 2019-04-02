namespace sensors {
    export interface ColorSensor {
        /**
         * Reads an RGB color from the sensor
         */
        color(): number;
    }
}