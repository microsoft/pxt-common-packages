namespace pxsim.infrared {
    export function sendBuffer(buf: RefBuffer): void {
        const state = getInfraredState();
        state.send(buf);
    }

    export function currentPacket() : RefBuffer {
        const state = getInfraredState();
        return state.packet;
    }

    export function onPacket(body: RefAction) {
        const state = getInfraredState();
        state.listen(body);
    }    

    export function onError(body: RefAction) {
        const state = getInfraredState();
        state.listenError(body);
    }
}