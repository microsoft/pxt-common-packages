namespace pxsim.music {
    export function sendMonoSynthMessage(
        channel: number,
        message: RefBuffer
    ) {
        AudioContextManager.sendMonoSynthMessage(channel, message);
    }
}