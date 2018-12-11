enum GameLobbyState {
    Alone,
    Service,
    Client
}

namespace jacdac {
    export class GameLobbyDriver extends Broadcast {
        constructor() {
            super("lobby", jacdac.GAMELOBBY_DEVICE_CLASS, 1);
        }

        get state(): GameLobbyState {
            return this.controlData[1];
        }

        set state(value: GameLobbyState) {
            this.controlData[0] = value;
        }

        handleControlPacket(pkt: Buffer): boolean {
            const packet = new ControlPacket(pkt);
            const data = packet.data;
            const remote: GameLobbyState = packet.data[0];
            switch (this.state) {
                // game is alone
                case GameLobbyState.Alone: {
                    switch (remote) {
                        case GameLobbyState.Alone:
                            // we detect that another player is on the bus, but neighter has started a server,
                            // put a gameserer on the bus
                            this.log(`starting game service`);
                            this.state = GameLobbyState.Service;
                            gameService.start();
                            break;
                        case GameLobbyState.Client:
                        case GameLobbyState.Service:
                            // another player is on the bus as a server or client already,
                            // so launching a client to connect to the server
                            this.log(`starting game client`)
                            this.state = GameLobbyState.Client;
                            gameClient.start();
                            break;
                    }
                    break;
                }
                // game is a service
                case GameLobbyState.Service:
                    switch (remote) {
                        // there are 2 services on the bus, one has to go
                        // shutting down the one with lower address
                        case GameLobbyState.Service: {
                            if (!this.device.isConnected() || this.device.address < packet.address) {
                                this.log(`stopping dup service`);
                                this.state = GameLobbyState.Alone;
                                gameService.stop();
                            }
                            break;
                        }
                    }
                    break;
                // game is a client
                case GameLobbyState.Client:
                    // nothing to do, ignore
                    break;
            }
            return true;
        }
    }

    const MAX_PLAYERS = 4;
    export class GameService extends Service {
        constructor() {
            super("game", jacdac.GAMEENGINE_DEVICE_CLASS, MAX_PLAYERS);
        }

        setPlayerAddress(index: number, address: number) {
            this.controlData[index] = address;
        }
    }

    //% whenUsed
    export const gameService = new GameService();

    export class GameClient extends Client {
        playerMap: Buffer;

        constructor() {
            super("game", jacdac.GAMEENGINE_DEVICE_CLASS);
            this.playerMap = control.createBuffer(MAX_PLAYERS);
        }

        handleControlPacket(pkt: Buffer): boolean {
            const packet = new ControlPacket(pkt);
            const data = packet.data;
            this.playerMap = data.slice(0, MAX_PLAYERS);            
            return false;
        }
    }

    //% whenUsed
    export const gameClient = new GameClient();
}