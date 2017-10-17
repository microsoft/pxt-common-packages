namespace pxsim {
    export class CableState {        
        packet: RefBuffer;
        // notify view that a packet was received
        packetReceived = false;

        // PULSE_IR_COMPONENT_ID = 0x2042;
        PULSE_CABLE_COMPONENT_ID = 0x2043;
        PULSE_PACKET_EVENT = 0x2;
        PULSE_PACKET_ERROR_EVENT = 0x3;

        send(buf: RefBuffer) {
            Runtime.postMessage(<SimulatorInfraredPacketMessage>{
                type: "irpacket",
                packet:  buf.data
            })
        }

        listen(body: RefAction) {
            pxtcore.registerWithDal(this.PULSE_CABLE_COMPONENT_ID, this.PULSE_PACKET_EVENT, body);            
        }

        listenError(body: RefAction) {
            pxtcore.registerWithDal(this.PULSE_CABLE_COMPONENT_ID, this.PULSE_PACKET_ERROR_EVENT, body);            
        }

        receive(buf: RefBuffer) {
            pxsim.decr(this.packet);
            this.packet = buf;
            pxsim.incr(this.packet);
            this.packetReceived = true;
            board().bus.queue(this.PULSE_CABLE_COMPONENT_ID, this.PULSE_PACKET_EVENT);
        }
    }
    
    export interface CableBoard extends CommonBoard {
        cableState: CableState;
    }

    export function getCableState() {
        return (board() as CableBoard).cableState;
    }
}