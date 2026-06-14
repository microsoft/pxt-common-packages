namespace pxsim.network {
    export function cableSendPacket(buf: RefBuffer): void {
        BufferMethods.typeCheck(buf);
        const state = getCableState();
        state.send(buf);
    }

    export function cablePacket() : RefBuffer {
        const state = getCableState();
        return (state.packet);
    }

    export function onCablePacket(body: RefAction): void {
        const state = getCableState();
        state.listen(body);
    }

    export function onCableError(body: RefAction): void {
        const state = getCableState();
        state.listenError(body);
    }
}