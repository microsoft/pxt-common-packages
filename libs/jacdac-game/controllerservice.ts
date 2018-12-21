namespace jacdac {
    //% fixedInstances
    export class ControllerService extends Broadcast {

        constructor() {
            super("ctrl", jacdac.CONTROLLER_DEVICE_CLASS, 4);
        }

        private connectClient(address: number): number {
            // search existing player index
            for (let i = 0; i < this.controlData.length; ++i)
                if (address == this.controlData[i])
                    return i + 1;

            // did it move?
            // clean dead players
            const drivers = jacdac.drivers();
            for (let i = 0; i < this.controlData.length; ++i)
                if (this.controlData[i] && !drivers.some(d => d.address == this.controlData[i])) {
                    this.log(`del ${toHex8(this.controlData[i])} from ${i + 1}`);
                    this.controlData[i] = 0;
                }

            // add new player
            // try 2,3,4 first
            for (let i = 1; i < this.controlData.length; ++i) {
                if (this.controlData[i] == 0) {
                    this.log(`${toHex8(address)} -> ${i + 1}`);
                    this.controlData[i] = address;
                    return i + 1;
                }
            }
            // try player 1
            if (this.controlData[0] == 0) {
                this.log(`${toHex8(address)} -> ${1}`);
                this.controlData[0] = address;
                return 1;
            }

            // no slots available
            return -1;
        }

        public handlePacket(pkt: Buffer): boolean {
            const packet = new JDPacket(pkt);
            const playerIndex = this.connectClient(packet.address);
            if (playerIndex < 0) {
                this.log(`no player for ${toHex8(packet.address)}`);
                return false;
            }
            const player = controller.players().find(p => p.playerIndex == playerIndex);
            if (!player) {
                this.log(`no player ${player.playerIndex}`);
                return true;
            }
            const state = packet.data[0];
            const btns = player.buttons;
            for (let i = 0; i < btns.length; ++i)
                btns[i].setPressed(!!(state & (1 << (i + 1))));
            return true;
        }
    }

    //% fixedInstance whenUsed block="controller service"
    export const controllerService = new ControllerService();
}