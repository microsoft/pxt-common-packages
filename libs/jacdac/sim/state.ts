namespace pxsim {
    export class JacDacState {
        drivers: JacDacDriverStatus[];
        running = false;

        constructor() {
            this.drivers = [new JacDacDriverStatus(0, 0, undefined, undefined)]
            this.drivers[0].dev.driverAddress = 0; // logic driver is always at address 0
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
            return 0;
        }
    }

    export interface JacDacBoard extends CommonBoard {
        jacdacState: JacDacState;
    }
    export function getJacDacState() {
        return (board() as JacDacBoard).jacdacState;
    }

}