namespace pxsim {
    export class InfraredState {
        packet: RefBuffer;

        send(buf: RefBuffer) {
            Runtime.postMessage(<SimulatorInfraredPacketMessage>{
                type: "irpacket",
                packet:  buf.data
            })   
        }
    }
    
    export interface InfraredBoard extends CommonBoard {
        irState: InfraredState;
    }

    export function getInfraredState() {
        return (board() as InfraredBoard).irState;
    }
}