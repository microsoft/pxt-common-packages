enum GameLobbyState {
    Alone,
    Service,
    Client
}

namespace jacdac {
    export class GameLobby extends Broadcast {
        constructor() {
            super("lobby", jacdac.GAMELOBBY_DEVICE_CLASS, 9);
            this.controlData.setNumber(NumberFormat.UInt32LE, 4, control.programHash());
            this.state = GameLobbyState.Alone;
            // 0: state
            // 1-4: program hash
            // 5-9: player addresses
        }

        get state(): GameLobbyState {
            return this.controlData[4];
        }

        set state(value: GameLobbyState) {
            this.controlData[4] = value;
        }

        get players(): Buffer {
            return this.controlData.slice(5, 4);
        }

        set players(buf: Buffer) {
            this.controlData.write(5, buf);
        }

        setPlayer(index: number, address: number) {
            if (this.controlData[5 + index] != address) {
                this.log(`set player ${index} to ${toHex8(address)}`);
                this.controlData[5 + index] = address;
            }
        }

        handleControlPacket(pkt: Buffer): boolean {
            const packet = new ControlPacket(pkt);
            const data = packet.data;
            return this.processPacket(packet.address, data);
        }

        handlePacket(pkt: Buffer): boolean {
            const packet = new ControlPacket(pkt);
            const data = packet.data;
            return this.processPacket(packet.address, data);
        }

        private indexOfPlayer(address: number): number {
            const players = this.players;
            for (let i = 0; i < players.length; ++i)
                if (players[i] == address)
                    return i;
            return -1;
        }

        private processPacket(otherAddress: number, data: Buffer) {
            const hash = data.getNumber(NumberFormat.UInt32LE, 0);
            if (hash != control.programHash())
                return true; // ignore other games
            const other: GameLobbyState = data[4];
            const otherPlayers = data.slice(5, 4);
            switch (this.state) {
                // game is alone
                case GameLobbyState.Alone: {
                    switch (other) {
                        case GameLobbyState.Alone:
                            // we detect that another player is on the bus, but neighter has started a server,
                            // put a gameserer on the bus
                            this.log(`starting game service`);
                            this.state = GameLobbyState.Service;
                            this.setPlayer(0, this.device.address);
                            gameService.start();
                            // update all players with data
                            this.sendPacket(this.controlData);
                            break;
                        case GameLobbyState.Service:
                            // another player is on the bus as a server or client already,
                            // so launching a client to connect to the server
                            this.log(`starting game client`);
                            this.state = GameLobbyState.Client;
                            this.players = otherPlayers;
                            gameClient.start();
                            // update all players with data
                            this.sendPacket(this.controlData);
                            break;
                        case GameLobbyState.Client:
                            // do nothing, wait for server message
                            break;
                    }
                    break;
                }
                // game is a service
                case GameLobbyState.Service:
                    switch (other) {
                        case GameLobbyState.Alone:
                            // new player on the bus, allocate player index
                            const currentPlayers = this.players;
                            // check if this player is still in our list
                            if (this.indexOfPlayer(otherAddress))
                                break;
                            // add player to list
                            for (let i = 1; i < currentPlayers.length; ++i) {
                                if (!currentPlayers[i]) {
                                    this.setPlayer(i, otherAddress);
                                    // update all players with data
                                    this.sendPacket(this.controlData);
                                    break;
                                }
                            }
                            // we're out of players
                            this.log(`out of players for ${toHex8(otherAddress)}`);
                            break;
                        // there are 2 services on the bus, one has to go
                        // shutting down the one with lower address
                        case GameLobbyState.Service: {
                            if (!this.device.isConnected() || this.device.address < otherAddress) {
                                this.log(`stopping dup service`);
                                this.state = GameLobbyState.Alone;
                                gameService.stop();
                                // update all players with data
                                this.sendPacket(this.controlData);
                            }
                            break;
                        }
                    }
                    break;
                // game is a client
                case GameLobbyState.Client:
                    // update player map from server
                    this.players = otherPlayers;
                    break;
            }
            return true;
        }
    }

    //% whenUsed
    export const gameLobby = new GameLobby();
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