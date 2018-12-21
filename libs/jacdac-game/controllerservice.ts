namespace jacdac {
    interface PlayerInfo {
        cp: ControlPacket;
        playerIndex: number;
    }

    export class ControllerService extends Service {
        players: PlayerInfo[];

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
                // did it move?
                const previous = this.players.find(p => p.cp.serialNumber == cp.serialNumber);
                if(previous) {
                    previous.cp = cp;
                    this.log(`${toHex8(cp.address)} -> ${previous.playerIndex}`);
                    return true;
                }
                // add new player
                const playerNumber = [2,3,4].filter(i => !this.players.some(p => p.playerIndex == i))[0];
                this.players.push(player = <PlayerInfo>{ cp: cp, playerIndex: playerNumber });
                this.log(`${toHex8(cp.address)} -> ${playerNumber}`);
            }
            
            return true;
        }

        handlePacket(pkt: Buffer): boolean {
            const packet = new JDPacket(pkt);
            const playerInfo = this.players.find(p => p.cp.address == packet.address);
            if (playerInfo) {
                const player = controller.players().find(p => p.playerIndex == playerInfo.playerIndex);
                if (player) {
                    const state= packet.data[0];
                    const btns = player.buttons;
                    for(let i = 0; btns.length; ++i)
                        btns[i].setPressed(!!(state & (1 << i)));
                }
            }
            return true;
        }
    }

    export class ControllerClient extends Client {
        constructor() {
            super("ctrl", jacdac.CONTROLLER_DEVICE_CLASS);
        }

        handleControlPacket(pkt: Buffer): boolean {
            return true;
        }

        handlePacket(pkt: Buffer): boolean {
            return true;
        }

        update(buttonsPressed: boolean[]) {
            if (!this.isConnected()) return;

            const buf = control.createBuffer(1);
            let b = 0;
            for (let i = 0; i < buttonsPressed.length; ++i)
                b |= (buttonsPressed ? 1 : 0) << i;
            buf[0] = i;
        }
    }
}