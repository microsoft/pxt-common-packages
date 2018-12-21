namespace jacdac {
    class ControllerClientInfo {
        cp: ControlPacket;
        playerIndex: number;
        constructor(cp: ControlPacket, playerIndex: number) {
            this.cp = cp;
            this.playerIndex = playerIndex;
        }
        toString(): string {
            return `${toHex8(this.cp.address)}: player ${this.playerIndex}`;
        }
    }

    //% fixedInstances
    export class ControllerService extends Service {
        players: ControllerClientInfo[];

        constructor() {
            super("ctrl", jacdac.CONTROLLER_DEVICE_CLASS);
            this.players = [];
        }

        handleControlPacket(pkt: Buffer): boolean {
            const cp = new ControlPacket(pkt);
            let player = this.players.find(p => p.cp.address == cp.address);
            if (!player) {
                // did it move?
                const previous = this.players.find(p => p.cp.serialNumber == cp.serialNumber);
                if (previous) {
                    previous.cp = cp;
                    this.log(`updated: ${previous.toString()}`);
                    return true;
                }
                // add new player
                const playerNumber = [2, 3, 4].filter(i => !this.players.some(p => p.playerIndex == i))[0];
                if (!!playerNumber) {
                    this.players.push(player = new ControllerClientInfo(cp, playerNumber));
                    this.log(`joined: ${player.toString()}`);
                } else {
                    this.log(`refused: ${toHex8(cp.address)}`);
                }
            }
            return true;
        }

        handlePacket(pkt: Buffer): boolean {
            const packet = new JDPacket(pkt);
            const playerInfo = this.players.find(p => p.cp.address == packet.address);
            if (!playerInfo) {
                //  this.log(`no player at ${toHex8(packet.address)}`)
                return true;
            }
            const player = controller.players().find(p => p.playerIndex == playerInfo.playerIndex);
            if (!player) {
                //this.log(`no player ${player.playerIndex}`);
                return true;
            }

            const state = packet.data[0];
            const btns = player.buttons;
            for (let i = 0; btns.length; ++i)
                btns[i].setPressed(!!(state & (1 << i)));
            return true;
        }
    }

    //% fixedInstance whenUsed block="controller service"
    export const controllerService = new ControllerService();
}