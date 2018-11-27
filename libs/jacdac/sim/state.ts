namespace pxsim {
    export interface SimulatorJacDacMessage extends pxsim.SimulatorBroadcastMessage {
        type: "jacdac";
        broadcast: true;
        address: number;
        packet: Uint8Array;
    }

    export class JacDacState {
        drivers: jacdac.JDDriver[];
        running = false;

        constructor(board: BaseBoard) {
            this.drivers = [new jacdac.JDLogicDriver()]
            board.addMessageListener(this.processMessage.bind(this));
        }

        start() {
            this.running = true;
        }

        stop() {
            this.running = false;
        }

        addDriver(d: JacDacDriverStatus) {
            this.drivers.push(d);
            this.start();
        }

        sendPacket(packet: pxsim.RefBuffer, address: number): number {
            if (this.running)
                Runtime.postMessage(<SimulatorJacDacMessage>{
                    type: "jacdac",
                    broadcast: true,
                    address: address,
                    packet: packet.data
                })
            return 0;
        }

        processMessage(msg: pxsim.SimulatorMessage) {
            if (!this.running) return;
            
            if (msg && msg.type == "jacdac") {
                const jdmsg = msg as pxsim.SimulatorJacDacMessage;
                this.drivers[0].handleLogicPacket(new jacdac.JDPacket(jdmsg.packet));
            }
        }   
    }

    export interface JacDacBoard extends CommonBoard {
        jacdacState: JacDacState;
    }
    export function getJacDacState() {
        return (board() as JacDacBoard).jacdacState;
    }

}