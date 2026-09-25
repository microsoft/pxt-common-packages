namespace pxsim.radio {
    export function raiseEvent(id: number, eventid: number): void {
        const state = pxsim.getRadioState();
        state.raiseEvent(id, eventid);
    }

    export function setGroup(id: number): void {
        const state = pxsim.getRadioState();
        state.setGroup(id);
    }

    export function setTransmitPower(power: number): void {
        const state = pxsim.getRadioState();
        state.setTransmitPower(power);
    }

    export function setFrequencyBand(band: number) {
        const state = pxsim.getRadioState();
        state.setFrequencyBand(band);
    }

    export function sendRawPacket(buf: RefBuffer) {
        BufferMethods.typeCheck(buf);
        let cb = getResume();
        const state = pxsim.getRadioState();
        if (state.enable) {
            state.datagram.send({
                type: 0,
                groupId: state.groupId,
                bufferData: buf.data
            });
        }
        setTimeout(cb, 1);
    }

    export function readRawPacket() {
        const state = pxsim.getRadioState();
        const packet = state.datagram.recv();
        const buf = packet.payload.bufferData;
        const n = buf.length;
        if (!n)
            return undefined;

        const rbuf = BufferMethods.createBuffer(n + 4);
        for(let i = 0; i < buf.length; ++i)
            rbuf.data[i] = buf[i];
        // append RSSI
        BufferMethods.setNumber(rbuf, BufferMethods.NumberFormat.Int32LE, n, packet.rssi)
        return rbuf;
    }

    export function onDataReceived(handler: RefAction): void {
        const state = pxsim.getRadioState();
        state.datagram.onReceived(handler);
    }

    export function off(){
        const state = pxsim.getRadioState();
        state.off();
    }

    export function on(){
        const state = pxsim.getRadioState();
        state.on();
    }

}