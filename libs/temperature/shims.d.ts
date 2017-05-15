// Auto-generated. Do not edit.
declare namespace input {

    /**
     * Run some code when the temperature changes from hot to cold, or from cold to hot.
     * @param condition the condition, hot or cold, the event triggers on
     * @param temperature the temperature, in degree Celsius, at which this event happens, eg: 15
     */
    //% blockId=input_on_temperature_condition_changed block="on temperature %condition|at (°C)%temperature"
    //% parts="thermometer" weight=95 blockGap=8 advanced=true
    //% help=input/on-temperature-condition-changed shim=input::onTemperateConditionChanged
    function onTemperateConditionChanged(condition: TemperatureCondition, temperature: int32, handler: () => void): void;

    /**
     * Get the temperature in Celsius or Fahrenheit degrees.
     */
    //% weight=75
    //% help=input/temperature
    //% blockId=device_temperature block="temperature in %unit" blockGap=8
    //% parts="thermometer" shim=input::temperature
    function temperature(unit: TemperatureUnit): int32;
}

// Auto-generated. Do not edit. Really.
