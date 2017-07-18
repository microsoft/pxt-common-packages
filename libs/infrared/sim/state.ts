namespace pxsim {
    export class InfraredState {        
        packet: RefBuffer;
        // notify view that a packet was received
        packetReceived = false;

        IR_COMPONENT_ID = 0x2042;
        IR_PACKET_EVENT = 0x2;
        IR_PACKET_ERROR_EVENT = 0x3;

        send(buf: RefBuffer) {
            Runtime.postMessage(<SimulatorInfraredPacketMessage>{
                type: "irpacket",
                packet:  buf.data
            })
        }

        listen(body: RefAction) {
            pxtcore.registerWithDal(this.IR_COMPONENT_ID, this.IR_PACKET_EVENT, body);            
        }

        listenError(body: RefAction) {
            pxtcore.registerWithDal(this.IR_COMPONENT_ID, this.IR_PACKET_ERROR_EVENT, body);            
        }

        receive(buf: RefBuffer) {
            pxsim.decr(this.packet);
            this.packet = buf;
            pxsim.incr(this.packet);
            this.packetReceived = true;
            board().bus.queue(this.IR_COMPONENT_ID, this.IR_PACKET_EVENT);
        }
    }
    
    export interface InfraredBoard extends CommonBoard {
        irState: InfraredState;
    }

    export function getInfraredState() {
        return (board() as InfraredBoard).irState;
    }
}