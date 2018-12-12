namespace jacdac {
    export class GameService extends Service {
        constructor() {
            super("game", jacdac.GAMEENGINE_DEVICE_CLASS);
        }
    }

    //% whenUsed
    export const gameService = new GameService();

    export class GameClient extends Client {
        constructor() {
            super("game", jacdac.GAMEENGINE_DEVICE_CLASS);
        }
    }

    //% whenUsed
    export const gameClient = new GameClient();
}