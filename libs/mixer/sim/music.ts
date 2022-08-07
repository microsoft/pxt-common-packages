namespace pxsim.music {
    export function playInstructions(b: RefBuffer) {
        return AudioContextManager.playInstructionsAsync(b.data)
    }

    export function queuePlayInstructions(when: number, b: RefBuffer) {
        AudioContextManager.queuePlayInstructions(when, b)
    }

    export function stopPlaying() {
        AudioContextManager.muteAllChannels()
    }

    export function forceOutput(mode: number) { }
}