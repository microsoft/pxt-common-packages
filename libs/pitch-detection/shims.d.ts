//% icon="\uf075"
//% color="#f59c16"
//% block="Pitch Detection"
declare namespace pitchdetection {
    
    /**
     * Setup environment for pitch detection.
     */
     //% shim=pitchdetection::_initializePitchDetection
    //% blockId=init_pitch_detection
    //% block="setup detector"
    //% weight=90
    function initializePitchDetection(): void;

    /**
     * Start listening on microphone.
     */
     //% shim=pitchdetection::_startLiveInput
    //% blockId=start_live_input
    //% block="start listening to microphone"
    //% weight=91
    function startLiveInput(): void;

    //TODO:
    //function pauseLiveInput():void;
    
    /**
     * Reads the current note detected
     */
    //% blockId=note_value block="note value"
    //% group="Values" weight=49 blockGap=8
    //% shim=pitchdetection::_getNote
    function getNote():string;

    /**
     * Reads the current pitch detected
     */
    //% blockId=pitch_value block="pitch value"
    //% group="Values" weight=50 blockGap=8
    //% shim=pitchdetection::_getPitch
    function getPitch():number;


}
