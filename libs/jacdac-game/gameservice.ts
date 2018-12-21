namespace jacdac {
    export enum GameServiceCommand {
        Sprite = 1
    }
    
    //% fixedInstances
    export class GameService extends Service {
        constructor() {
            super("game", jacdac.GAMEENGINE_DEVICE_CLASS);
        }

        handlePacket(pkt: Buffer): boolean {
            const packet = new JDPacket(pkt);
            const data = packet.data;
            const playerAddress = data[0];
            const cmd = data[1];
            const playerNumber = gameLobby.current.indexOfPlayer(playerAddress) + 1;
            const player = controller.players().find(p => p.playerIndex == playerNumber);
            if (!player) {
                // unknown player
                this.log(`ukn plyr ${toHex8(playerAddress)}`)
                return true;
            }
            switch (cmd) {
                case GameClientCommand.Controller:
                    const buttonsPressed = data[2];
                    const btns = player.buttons;
                    for (let i = 0; i < btns.length; ++i)
                        btns[i].setPressed(!!(buttonsPressed & (1 << i)));
                    break;
            }
            return true;
        }

        sendUpdate() {
            // serialize the entire game state to the client
            const scene = game.currentScene();
            scene.allSprites.forEach(sprite => {
                const buf = sprite.__serialize(1);
                if (buf) {
                    buf[0] = GameServiceCommand.Sprite;
                    buf.setNumber(NumberFormat.UInt32LE, 1, sprite.id);
                    this.sendPacket(buf);
                }
            })
        }
    }

    //% whenUsed block="game service"
    export const gameService = new GameService();
}