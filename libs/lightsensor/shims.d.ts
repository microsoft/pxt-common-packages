// Auto-generated. Do not edit.
declare namespace input {

    /**
     * Register an event that runs when light conditions (darker or brighter) change.
     * @param condition the condition that event triggers on
     */
    //% help=input/on-light-condition-changed weight=97
    //% blockId=input_on_light_condition_changed block="on light %condition"
    //% parts="lightsensor" blockGap=8 shim=input::onLightConditionChanged
    function onLightConditionChanged(condition: LightCondition, handler: () => void): void;

    /**
     * Read the light level applied to the LED screen in a range from 0 (dark) to 255 (bright).
     */
    //% help=input/light-level weight=76
    //% blockId=device_get_light_level block="light level" blockGap=8
    //% parts="lightsensor" shim=input::lightLevel
    function lightLevel(): int32;

    /**
     * Set the threshold value for the light condition event.
     */
    //% help=input/set-light-threshold
    //% blockId=lightsensor_set_threshold block="light set threshold %condition|to %value"
    //% parts="lightsensor" advanced=true
    //% weight=2
    //% value.min=1 value.max=255 shim=input::setLightThreshold
    function setLightThreshold(condition: LightCondition, value: int32): void;
}

// Auto-generated. Do not edit. Really.
