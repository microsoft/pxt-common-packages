namespace jacdac {
    enum GameCommand {
        Controller = 1
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
                case GameCommand.Controller:
                    const buttonsPressed = data[2];
                    for (let i = 0; i < this.buttons.length; ++i)
                        this.buttons[i].setPressed(playerNumber, !!(buttonsPressed & (1 << this.buttons[i].buttonOffset)));
                    break;
            }
            return true;
        }
    }

    //% whenUsed
    export const gameService = new GameService();

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

            const state = controller.serializeState();
            const buf = control.createBuffer(state.length + 2);
            buf[0] = this.playerAddress;
            buf[1] = GameCommand.Controller;
            buf.write(2, state);
            this.sendPacket(buf);
        }
    }

    //% whenUsed
    export const gameClient = new GameClient();
}