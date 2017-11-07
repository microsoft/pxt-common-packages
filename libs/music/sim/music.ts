namespace pxsim {

    export class AudioState {
        private playing: boolean;
        public outputDestination_ = 0;
        public pitchPin_: Pin;
        public volume = 100;
        constructor() {
            this.playing = false;
        }

        startPlaying() {
            this.playing = true;
        }
        stopPlaying() {
            this.playing = false;
        }
        isPlaying() {
            return this.playing;
        }
    }
}

namespace pxsim.music {

    export function noteFrequency(note: number) {
        return note;
    }

    export function setOutput(mode: number) {
        const audioState = getAudioState();
        audioState.outputDestination_ = mode;
    }

    export function setVolume(volume: number) {
        const audioState = getAudioState();
        audioState.volume = Math.max(0, 1024, volume * 4);
    }

    export function setPitchPin(pin: Pin) {
        const audioState = getAudioState();
        audioState.pitchPin_ = pin;
    }

    export function setTone(buffer: RefBuffer) {
        // TODO: implement set tone in the audio context
    }

    export function playTone(frequency: number, ms: number) {
        const b = board();
        if (!b) return;

        const audioState = getAudioState();

        const currentOutput = audioState.outputDestination_;

        audioState.startPlaying();
        runtime.queueDisplayUpdate();
        AudioContextManager.tone(frequency, 1);
        let cb = getResume();
        if (ms <= 0) cb();
        else {
            setTimeout(() => {
                AudioContextManager.stop();
                audioState.stopPlaying();

                runtime.queueDisplayUpdate();
                cb()
            }, ms);
        }
    }

    function getPitchPin() {
        const audioState = getAudioState();
        if (!audioState.pitchPin_) {
            audioState.pitchPin_ = (board() as MusicBoard).getDefaultPitchPin();
        }
        return audioState.pitchPin_;
    }
}