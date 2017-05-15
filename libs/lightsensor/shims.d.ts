// Auto-generated. Do not edit.
declare namespace input {

    /**
     * Registers an event that runs when particular lighting conditions (dark, bright) are encountered.
     * @param condition the condition that event triggers on
     */
    //% help=input/on-light-condition-changed weight=97
    //% blockId=input_on_light_condition_changed block="on light %condition"
    //% parts="lightsensor" blockGap=8 shim=input::onLightConditionChanged
    function onLightConditionChanged(condition: LightCondition, handler: () => void): void;

    /**
     * Reads the light level applied to the LED screen in a range from 0 (dark) to 255 (bright).
     */
    //% help=input/light-level weight=76
    //% blockId=device_get_light_level block="light level" blockGap=8
    //% parts="lightsensor" shim=input::lightLevel
    function lightLevel(): int32;
}

// Auto-generated. Do not edit. Really.
