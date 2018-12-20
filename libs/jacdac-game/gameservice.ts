namespace jacdac {
    /*
    export enum GameServiceCommand {
        Sprite = 1
    }

    export class GameService extends Service {
        private buttons: controller.MetaButton[];
        constructor() {
            super("game", jacdac.GAMEENGINE_DEVICE_CLASS);
            this.buttons = [
                controller.multiLeft,
                controller.multiRight,
                controller.multiUp,
                controller.multiDown,
                controller.multiA,
                controller.multiB
            ];
        }

        handlePacket(pkt: Buffer): boolean {
            const packet = new JDPacket(pkt);
            const data = packet.data;
            const playerAddress = data[0];
            const cmd = data[1];
            const playerNumber: PlayerNumber = gameLobby.current.indexOfPlayer(playerAddress) + 1;
            if (playerNumber <= 0) {
                // unknown player
                this.log(`ukn plyr ${toHex8(playerAddress)}`)
                return true;
            }
            switch (cmd) {
                case GameClientCommand.Controller:
                    const buttonsPressed = data[2];
                    for (let i = 0; i < this.buttons.length; ++i)
                        this.buttons[i].setPressed(playerNumber, !!(buttonsPressed & (1 << this.buttons[i].buttonOffset)));
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

    //% whenUsed
    export const gameService = new GameService();
    */
}