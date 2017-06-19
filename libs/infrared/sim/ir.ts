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
        const state = getAudioState();
        pxtcore.registerWithDal(0x2042 /*DAL.IR_COMPONENT_ID*/, 0x2 /*DAL.IR_PACKET_EVENT*/, body);
    }    
}