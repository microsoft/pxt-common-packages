// Auto-generated. Do not edit.
declare namespace input {

    /**
     * Registers an event that runs when a lound sound is detected
     */
    //% help=input/on-loud-sound weight=97
    //% blockId=input_on_loud_sound block="on loud sound"
    //% parts="microphone" blockGap=8 shim=input::onLoudSound
    function onLoudSound(handler: () => void): void;

    /**
     * Reads the loudness through the microphone from 0 (silent) to 100 (very loud)
     */
    //% help=input/sound-level weight=75
    //% blockId=device_get_sound_level block="sound level" blockGap=8
    //% parts="microphone" shim=input::soundLevel
    function soundLevel(): int32;

    /**
     * Sets the minimum threshold for a loud sound
     */
    //% help=input/set-loud-sound-threshold
    //% blockId=input_set_loud_sound_threshold block="set loud sound threshold %value"
    //% parts="microphone" advanced=true
    //% weight=2
    //% value.min=1 value.max=100 shim=input::setLoudSoundThreshold
    function setLoudSoundThreshold(value: int32): void;
}

// Auto-generated. Do not edit. Really.
