namespace tts {
    class TextToSpeechState {
        boundaryListeners: ((offset: number, nextWord: string, fullText: string) => void)[];

        constructor() {
            this.boundaryListeners = [];
        }
    }

    let state: TextToSpeechState;

    /**
     * Runs code each time a word or sentence boundary is reached in text being spoken
     */
    //% blockId=tts_onWordSpoken
    //% block="on word spoken from $fullText at $offset with $nextWord"
    //% draggableParameters="reporter"
    //% weight=10
    export function onWordSpoken(handler: (offset: number, nextWord: string, fullText: string) => void) {
        getState().boundaryListeners.push(handler);
    }

    /**
     * Speak some text using the computer's text to speech voice and pause until the speaking has finished.
     * If some text is already being spoken, this text will be queued until the other text finishes.
     *
     * @param text The text to speak
     * @param volume The volume to speak at
     * @param pitch A pitch modifier for moving the pitch of text up or down
     * @param rate The rate at which the text will be spoken; higher is faster
     * @param language The ISO language code for the text to be spoken; defaults to the system language
     */
    //% blockId=tts_speakText
    //% block="speak $text||with volume $volume pitch $pitch rate $rate language $language"
    //% inlineInputMode=inline
    //% volume.min=0
    //% volume.max=255
    //% volume.defl=128
    //% pitch.min=0
    //% pitch.max=255
    //% pitch.defl=128
    //% rate.min=0
    //% rate.max=255
    //% rate.defl=25
    //% weight=100
    export function speakText(text: string, volume = 128, pitch = 128, rate = 25, language?: string) {
        // Ranges from 0 to 1
        volume = Math.map(Math.clamp(0, 255, volume), 0, 255, 0, 1);
        // Ranges from 0 to 2
        pitch = Math.map(Math.clamp(0, 255, pitch), 0, 255, 0, 2);;
        // Ranges from 0.1 to 10
        rate = Math.map(Math.clamp(0, 255, rate), 0, 255, 0.1, 10);

        tts.speak(text, pitch, rate, volume, language, undefined, onBoundary);
    }

    function onBoundary(offset: number, nextWord: string, fullText: string) {
        for (const handler of getState().boundaryListeners) {
            control.runInParallel(() => handler(offset, nextWord, fullText))
        }
    }

    function getState() {
        if (!state) {
            state = new TextToSpeechState();
        }

        return state;
    }
}