namespace controller {
    /**
     * Get the temperature in Celsius or Fahrenheit degrees.
     */
    //% blockId=ctrltemperature block="temperature in %unit"
    //% parts="thermometer"
    //% weight=26
    //% group="Extras"
    export function temperature(unit: TemperatureUnit): number {
        return input.temperature(unit);
    }
}