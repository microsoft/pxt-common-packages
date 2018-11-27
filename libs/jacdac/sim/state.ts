namespace pxsim {
    export interface SimulatorJacDacMessage extends pxsim.SimulatorBroadcastMessage {
        type: "jacdac";
        broadcast: true;
        address: number;
        packet: Uint8Array;
    }

    export class JacDacState {
        drivers: JacDacDriverStatus[];
        logic: jacdac.JDLogicDriver;
        running = false;

        constructor(board: BaseBoard) {
            this.drivers = [new JacDacDriverStatus(0, 0, undefined, undefined)]
            this.drivers[0].dev.driverAddress = 0; // logic driver is always at address 0
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
            if (msg && msg.type == "jacdac") {
                const jdmsg = msg as pxsim.SimulatorJacDacMessage;
                // TODO
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