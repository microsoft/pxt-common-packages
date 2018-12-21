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

    export class ControllerService extends Service {
        players: ControllerClientInfo[];

        constructor() {
            super("ctrl", jacdac.CONTROLLER_DEVICE_CLASS);
            this.players = [];
        }

        handleControlPacket(pkt: Buffer): boolean {
            if (this.players.length > 3)
                return true;

            const cp = new ControlPacket(pkt);
            let player = this.players.find(p => p.cp.address == cp.address);
            if (!player) {
                this.log(`new player ${toHex8(cp.address)}`)
                // did it move?
                const previous = this.players.find(p => p.cp.serialNumber == cp.serialNumber);
                if (previous) {
                    previous.cp = cp;
                    this.log(previous.toString());
                    return true;
                }
                // add new player
                const playerNumber = [2, 3, 4].filter(i => !this.players.some(p => p.playerIndex == i))[0];
                this.players.push(player = new ControllerClientInfo(cp, playerNumber);
                this.log(player.toString());
            }
            return true;
        }

        handlePacket(pkt: Buffer): boolean {
            const packet = new JDPacket(pkt);
            const playerInfo = this.players.find(p => p.cp.address == packet.address);
            if (playerInfo) {
                const player = controller.players().find(p => p.playerIndex == playerInfo.playerIndex);
                if (player) {
                    const state = packet.data[0];
                    const btns = player.buttons;
                    for (let i = 0; btns.length; ++i)
                        btns[i].setPressed(!!(state & (1 << i)));
                }
            }
            return true;
        }
    }

    //% fixedInstance whenUsed block="controller service"
    export const controllerService = new ControllerService();
}