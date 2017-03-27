// Auto-generated. Do not edit.
declare namespace input {


    //% indexedInstanceNS=input indexedInstanceShim=pxt::getMicrophoneButton
    //% block="microphone" fixedInstance shim=pxt::getMicrophoneButton(0)
    const microphone: Button;

    /**
     * Registers an event that runs when particular lighting conditions (dark, bright) are encountered.
     * @param condition the condition that event triggers on
     */
    //% help=input/on-loudness-condition-changed weight=97
    //% blockId=input_on_loudness_condition_changed block="on sound %condition"
    //% parts="microphone" blockGap=8 shim=input::onSoundConditionChanged
    function onSoundConditionChanged(condition: LoudnessCondition, handler: () => void): void;

    /**
     * Reads the loudness through the microphone from 0 (silent) to 255 (very loud)
     */
    //% help=input/loudness weight=75
    //% blockId=device_get_sound_level block="sound level" blockGap=8
    //% parts="microphone" shim=input::soundLevel
    function soundLevel(): number;
}

// Auto-generated. Do not edit. Really.
