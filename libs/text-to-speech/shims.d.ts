//% icon="\uf075"
//% color="#f59c16"
//% block="Text to Speech"
declare namespace tts {
    //% shim=tts::_speakAsync promise
    function speak(text: string, pitch?: number, rate?: number, volume?: number, language?: string, onStart?: () => void, onBoundary?: (offset: number, nextWord: string, fullText: string) => void): void;

    //% shim=tts::_getLanguageCode
    function getLanguageCode(): string;

    /**
     * Pauses the current text being spoken. Any calls waiting for the text to finish
     * will not return until the text is either resumed or cancelled.
     */
    //% shim=tts::_pause
    //% blockId=tts_pause
    //% block="pause speech"
    //% weight=90
    function pause(): void;

    /**
     * Returns true if the text to speech is currently paused
     */
    //% shim=tts::_isPaused
    //% blockId=tts_isPaused
    //% block="is speech paused"
    //% weight=60
    function isPaused(): boolean;

    /**
     * Resumes the current text being spoken if in the paused state.
     */
    //% shim=tts::_resume
    //% blockId=tts_resume
    //% block="resume speech"
    //% weight=80
    function resume(): void;

    /**
     * Cancels all text currently being spoken and any that has been queued.
     */
    //% shim=tts::_cancel
    //% blockId=tts_cancel
    //% block="cancel speech"
    //% weight=70
    function cancel(): void;
}
