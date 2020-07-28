namespace pxsim.multiplayer {
    let isServer = false;
    export function setIsServer(server: boolean) {
        isServer = server;
    }

    export function postImage(im: pxsim.RefImage) {
        getMultiplayerState().send(<MultiplayerImageMessage>{
            origin: isServer ? "server" : "client",
            content: "Image",
            data: im,
        });
    }
}

namespace pxsim {
    export interface MultiplayerBoard extends EventBusBoard {
        multiplayerState: MultiplayerState;
    }

    export function getMultiplayerState() {
        return (board() as any as MultiplayerBoard).multiplayerState;
    }

    export interface SimulatorMultiplayerMessage extends SimulatorMessage {
        type: "online-multiplayer";
        origin: "server" | "client";
        content: string;
        id: number;
        data: any;
    }

    export interface MultiplayerImageMessage extends SimulatorMultiplayerMessage {
        content: "Image";
        data: RefImage;
    }

    export class MultiplayerState {
        lastMessageId: number;
        constructor() {
            this.lastMessageId = 0;
        }

        send(msg: SimulatorMultiplayerMessage) {
            Runtime.postMessage(<SimulatorMultiplayerMessage>{
                ...msg,
                type: "online-multiplayer",
                id: this.lastMessageId++
            });
        }

        addListeners() {
            const board = runtime.board as pxsim.BaseBoard;
            board.addMessageListener(msg => this.messageHandler(msg));
        }

        private messageHandler(msg: SimulatorMessage) {
            if (msg.type == "online-multiplayer") {
                this.receiveMessage(<SimulatorMultiplayerMessage>msg);
            }
        }

        protected receiveMessage(msg: SimulatorMultiplayerMessage) {

        }
    }
}