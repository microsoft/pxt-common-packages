// Auto-generated. Do not edit.
declare namespace input {

    /**
     * Run some code when the temperature changes from hot to cold, or from cold to hot.
     * @param condition the condition, hot or cold, the event triggers on
     * @param temperature the temperature at which this event happens, eg: 15
     * @param unit the unit of the temperature
     */
    //% blockId=input_on_temperature_condition_changed block="on temperature %condition|at %temperature|%unit"
    //% parts="thermometer" weight=95 blockGap=8 advanced=true
    //% help=input/on-temperature-condition-changed blockExternalInputs=0 shim=input::onTemperatureConditionChanged
    function onTemperatureConditionChanged(condition: TemperatureCondition, temperature: int32, unit: TemperatureUnit, handler: () => void): void;

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
