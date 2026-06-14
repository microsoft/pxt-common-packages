namespace pxsim.network {
    export function infraredSendPacket(buf: RefBuffer): void {
        BufferMethods.typeCheck(buf);
        const state = getInfraredState();
        state.send(buf);
    }

    export function infraredPacket() : RefBuffer {
        const state = getInfraredState();
        return state.packet;
    }

    export function onInfraredPacket(body: RefAction): void {
        const state = getInfraredState();
        state.listen(body);
    }

    export function onInfraredError(body: RefAction): void {
        const state = getInfraredState();
        state.listenError(body);
    }
}