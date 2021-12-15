namespace pxsim.tts {
    export function _getLanguageCode() {
        return window.navigator.language;
    }

    export function _speakAsync(text: string, pitch?: number, rate?: number, volume?: number, language?: string, onStart?: RefAction, onBoundary?: RefAction): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.voice = getVoiceForLanguage(language || _getLanguageCode());

            if (pitch != undefined) utterance.pitch = pitch;
            if (rate != undefined) utterance.rate = rate;
            if (volume != undefined) utterance.volume = volume;

            utterance.onend = () => resolve();
            utterance.onerror = reject;

            if (onStart) {
                utterance.onstart = () => runtime.runFiberAsync(onStart);
            }

            if (onBoundary) {
                utterance.onboundary = event => {
                    const offset = event.charIndex;
                    const nextWord = text.substring(offset).split(/\s/).shift();

                    runtime.runFiberAsync(onBoundary, offset, nextWord, text);
                }
            }

            speechSynthesis.speak(utterance);
        });
    }

    export function _pause() {
        speechSynthesis.pause();
    }

    export function _isPaused(): boolean {
        return speechSynthesis.paused;
    }

    export function _resume() {
        speechSynthesis.resume();
    }

    export function _cancel() {
        speechSynthesis.cancel();
    }

    function getVoiceForLanguage(language: string): SpeechSynthesisVoice {
        language = language.toLowerCase();
        const generalCode = language.substring(0, 2);

        let bestMatch: SpeechSynthesisVoice;
        let bestNonlocalMatch: SpeechSynthesisVoice;

        for (const voice of speechSynthesis.getVoices()) {
            const current = voice.lang.toLowerCase();
            if (current === language) {
                if (voice.localService) return voice;
                else bestNonlocalMatch = voice;
            }
            else if (current.substring(0, 2) === generalCode) {
                if (!bestMatch && voice.localService) bestMatch = voice;
                if (!bestNonlocalMatch && !voice.localService) bestNonlocalMatch = voice
            }
        }

        return bestMatch || bestNonlocalMatch || (language !== "en-us" ? getVoiceForLanguage("en-US") : undefined);
    }
}