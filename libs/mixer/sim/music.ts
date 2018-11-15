namespace pxsim.music {
    export function playInstructions(b: RefBuffer) {
        return AudioContextManager.playInstructionsAsync(b)
    }

    export function forceOutput(mode: number) { }
}