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
        let cb = getResume();
        const state = pxsim.getRadioState();
        state.datagram.send({
            type: 0,
            groupId: state.groupId,
            bufferData: buf.data
        });
        setTimeout(cb, 1);
    }

    export function readRawPacket() {
        const state = pxsim.getRadioState();
        const packet = state.datagram.recv();
        const buf = packet.payload.bufferData;
        const n = buf.lengt;
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
}