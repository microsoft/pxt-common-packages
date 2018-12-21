namespace jacdac {
    export enum GameClientCommand {
        Controller = 1
    }

    //% fixedInstances
    export class GameClient extends Client {
        playerAddress: number;
        handler: () => void;
        constructor() {
            super("game", jacdac.GAMEENGINE_DEVICE_CLASS);
            this.playerAddress = 0;
        }

        start() {
            super.start();
            if (!this.handler) {
                this.handler = () => this.sendControllerUpdate();
                game.currentScene().eventContext.registerFrameHandler(19.5, this.handler);
            }
        }

        setPlayerAddress(address: number) {
            this.playerAddress = address;
        }

        sendControllerUpdate() {
            if (!this.playerAddress) return;

            const buf = controller.serialize(2);
            buf[0] = this.playerAddress;
            buf[1] = GameClientCommand.Controller;
            this.sendPacket(buf);
        }

        handlePacket(pkt: Buffer): boolean {
            const packet = new JDPacket(pkt);
            const data = packet.data;
            const cmd: GameServiceCommand = data[0];
            switch (cmd) {
                case GameServiceCommand.Sprite: {
                    const id = data.getNumber(NumberFormat.UInt32LE, 1);
                    break;
                }
            }
            return true;
        }
    }

    //% whenUsed block="game client"
    export const gameClient = new GameClient();
}