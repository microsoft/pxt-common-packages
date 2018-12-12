enum GameLobbyState {
    Alone,
    Service,
    Client
}

enum GameLobbyEvent {
    StateChanged = 1,
    PlayerChanged
}

namespace jacdac {
    // 0: state
    // 1-4: program hash
    // 5-9: player addresses
    class GamePacket {
        buf: Buffer;
        constructor(buf: Buffer) {
            this.buf = buf;
        }

        get hash(): number {
            return this.buf.getNumber(NumberFormat.UInt32LE, 0);
        }

        set hash(value: number) {
            this.buf.setNumber(NumberFormat.UInt32LE, 0, value);
        }

        get state(): GameLobbyState {
            return this.buf[4];
        }

        set state(value: GameLobbyState) {
            this.buf[4] = value;
        }

        get players(): Buffer {
            return this.buf.slice(5, 4);
        }

        set players(b: Buffer) {
            this.buf.write(5, b);
        }

        updatePlayers(b: Buffer): boolean {
            let changed = false;
            for (let i = 0; i < b.length; ++i) {
                changed = changed || this.buf[5 + i] != b[i];
                this.buf[5 + i] = b[i];
            }
            return changed;
        }

        setPlayer(index: number, address: number) {
            this.buf[5 + index] = address;
        }

        indexOfPlayer(address: number): number {
            for (let i = 5; i < this.buf.length; ++i)
                if (this.buf[i] == address)
                    return i - 5;
            return -1;
        }
    }

    export class GameLobbyDriver extends Broadcast {
        current: GamePacket;
        lastServerTime: number;

        constructor() {
            super("ly", jacdac.GAMELOBBY_DEVICE_CLASS, 9);
            this.current = new GamePacket(this.controlData);
            this.current.hash = control.programHash();
            this.lastServerTime = 0;
        }

        get state() {
            return this.current.state;
        }

        set state(value: number) {
            if (value != this.state) {
                this.current.state = value;
                control.raiseEvent(this.id, GameLobbyEvent.StateChanged);
            }
        }

        get players(): Buffer {
            return this.current.players;
        }

        isServiceLost(): boolean {
            return this.state == GameLobbyState.Client
                && control.millis() - this.lastServerTime > 2000;
        }

        onEvent(event: GameLobbyEvent, handler: () => void) {
            control.onEvent(this.id, event, handler);
        }

        handleControlPacket(pkt: Buffer): boolean {
            const packet = new ControlPacket(pkt);
            const data = packet.data;
            return this.processPacket(packet.address, data);
        }

        handlePacket(pkt: Buffer): boolean {
            const packet = new JDPacket(pkt);
            const data = packet.data;
            return this.processPacket(packet.address, data);
        }

        private processPacket(otherAddress: number, data: Buffer) {
            const otherState = new GamePacket(data);
            if (otherState.hash != this.current.hash) {
                return true; // ignore other games
            }
            switch (this.state) {
                // game is alone
                case GameLobbyState.Alone: {
                    switch (otherState.state) {
                        case GameLobbyState.Alone:
                            // we detect that another player is on the bus, but neighter has started a server,
                            // put a gameserer on the bus
                            this.log(`starting game service`);
                            this.current.setPlayer(0, this.device.address);
                            this.state = GameLobbyState.Service;
                            gameService.start();
                            // update all players with data
                            this.sendPacket(this.controlData);
                            break;
                        case GameLobbyState.Service:
                            // another player is on the bus as a server or client already
                            // check if address is a player
                            const device = this.device;
                            if (otherState.indexOfPlayer(device.address) == -1) {
                                this.log(`player not in service`)
                                break;
                            }
                            // so launching a client to connect to the server
                            this.log(`starting game client`);
                            this.current.players = otherState.players;
                            this.state = GameLobbyState.Client;
                            gameClient.setPlayerAddress(device.address);
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
                case GameLobbyState.Service: {
                    switch (otherState.state) {
                        case GameLobbyState.Alone:
                            // check if this player is still in our list
                            if (this.current.indexOfPlayer(otherAddress) > -1)
                                break;
                            // add player to list
                            const currentPlayers = this.current.players;
                            let i = 1;
                            for (; i < currentPlayers.length; ++i) {
                                if (!currentPlayers[i]) {
                                    this.current.setPlayer(i, otherAddress);
                                    // update all players with data
                                    this.sendPacket(this.controlData);
                                    break;
                                }
                            }
                            // check if we're out of players
                            if (i == currentPlayers.length)
                                this.log(`out of players for ${toHex8(otherAddress)}`);
                            break;
                        // there are 2 services on the bus, one has to go
                        // shutting down the one with lower address
                        case GameLobbyState.Service:
                            if (!this.device.isConnected() || this.device.address < otherAddress) {
                                this.log(`stopping dup service`);
                                this.state = GameLobbyState.Alone;
                                gameService.stop();
                                // update all players with data
                                this.sendPacket(this.controlData);
                            }
                            break;
                        case GameLobbyState.Client:
                            // connected client?
                            break;
                    }
                    break;
                }
                // game is a client
                case GameLobbyState.Client:
                    switch (otherState.state) {
                        case GameLobbyState.Service:
                            // am i part of the list?
                            if (otherState.indexOfPlayer(this.device.address)) {
                                // update player map from server
                                if (this.current.updatePlayers(otherState.players)) {
                                    this.log(`players changed`);
                                    control.raiseEvent(this.id, GameLobbyEvent.PlayerChanged);
                                }
                                // keep track when the server was seen
                                this.lastServerTime = control.millis();
                            }
                            break;
                        case GameLobbyState.Alone:
                        case GameLobbyState.Client:
                            // ignore
                            break;
                    }
                    break;
            }
            return true;
        }
    }

    //% whenUsed
    export const gameLobby = new GameLobbyDriver();
}