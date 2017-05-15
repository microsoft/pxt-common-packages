// Auto-generated. Do not edit.
declare namespace input {

    /**
     * Registers an event that runs when particular lighting conditions (dark, bright) are encountered.
     * @param condition the condition that event triggers on
     */
    //% help=input/on-sound-condition-changed weight=97
    //% blockId=input_on_sound_condition_changed block="on sound %condition"
    //% parts="microphone" blockGap=8 shim=input::onSoundConditionChanged
    function onSoundConditionChanged(condition: LoudnessCondition, handler: () => void): void;

    /**
     * Reads the loudness through the microphone from 0 (silent) to 255 (very loud)
     */
    //% help=input/sound-level weight=75
    //% blockId=device_get_sound_level block="sound level" blockGap=8
    //% parts="microphone" shim=input::soundLevel
    function soundLevel(): int32;
}

// Auto-generated. Do not edit. Really.
