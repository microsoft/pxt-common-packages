namespace jacdac {
    //% fixedInstances
    export class ControllerService extends Broadcast {

        constructor() {
            super("ctrl", jacdac.CONTROLLER_DEVICE_CLASS, 5);
            this.controlData[0] = JDControllerCmd.Server;
        }

        private connectClient(address: number, serverAddress: number): number {
            // search existing player index
            for (let i = 1; i < this.controlData.length; ++i)
                if (address == this.controlData[i]) {
                    return i;
                }

            this.log(`new player ${toHex8(address)}`);
            const drivers = jacdac.drivers();
            const players = controller.players();
            const ids: number[] = [0, 0, 0, 0, 0];
            players.forEach(p => {
                this.log(` found ${p.playerIndex}`)
                ids[p.playerIndex] = 1;
            });

            // did it move?
            // clean dead players
            for (let i = 1; i < this.controlData.length; ++i) {
                const ci = this.controlData[i];
                if (ci && !drivers.some(d => d.address == ci)) {
                    this.log(`del ${toHex8(this.controlData[i])} from ${i}`);
                    this.controlData[i] = 0;
                }
            }

            // add new player
            // try 2,3,4 first
            for (let i = 1; i < this.controlData.length; ++i) {
                // if slot is free and there is such a player
                if (this.controlData[i] == 0 && ids[i]) {
                    this.log(`${toHex8(address)} -> ${i}`);
                    this.controlData[i] = address;
                    return i;
                }
            }
            // try player 1
            if (this.controlData[1] == 0 && ids[1]) {
                this.log(`${toHex8(address)} -> ${1}`);
                this.controlData[1] = address;
                return 1;
            }

            // no slots available
            this.log(`no player for ${toHex8(address)}`);
            return -1;
        }

        handleControlPacket(pkt: Buffer) {
            const cp = new ControlPacket(pkt);
            const data = cp.data;
            return this.processPacket(cp.address, data);
        }

        handlePacket(pkt: Buffer) {
            const packet = new JDPacket(pkt);
            const data = packet.data;
            return this.processPacket(packet.address, data);
        }

        private processPacket(address: number, data: Buffer): boolean {
            const cmd: JDControllerCmd = data[0];
            switch(cmd) {
                case JDControllerCmd.Client:
                    this.connectClient(address, data[1]);
                    return true;
                case JDControllerCmd.Buttons:
                    return this.processButtonsPacket(address, data);
                default:
                    return true;
            }
        }

        private processButtonsPacket(address: number, data: Buffer) {
            const playerIndex = this.connectClient(address, -1);
            if (playerIndex < 0) {
                this.log(`no player for ${toHex8(address)}`);
                return false;
            }
            const player = controller.players().find(p => p.playerIndex == playerIndex);
            if (!player) {
                this.log(`no player ${player.playerIndex}`);
                return true;
            }
            const state = data[1];
            const btns = player.buttons;
            for (let i = 0; i < btns.length; ++i)
                btns[i].setPressed(!!(state & (1 << (i + 1))));
            return true;
        }
    }

    //% fixedInstance whenUsed block="controller service"
    export const controllerService = new ControllerService();
}