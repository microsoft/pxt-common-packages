namespace pxsim.multiplayer {
    export function postImage(im: pxsim.RefImage) {
        getMultiplayerState().send(<MultiplayerImageMessage>{
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

        constructor(public isServer: boolean) {
            this.lastMessageId = 0;
        }

        send(msg: SimulatorMultiplayerMessage) {
            Runtime.postMessage(<SimulatorMultiplayerMessage>{
                ...msg,
                type: "online-multiplayer",
                origin: this.isServer ? "server" : "client",
                id: this.lastMessageId++
            });
        }

        addListeners() {
            const board = runtime.board as pxsim.BaseBoard;
            board.addMessageListener(msg => this.messageHandler(msg));
        }

        protected messageHandler(msg: SimulatorMessage) {
            if (!isMultiplayerMessage(msg)) {
                return;
            }

            if (isImageMessage(msg)) {
                // do what we need to propagate image to sim
            }
        }
    }

    function isMultiplayerMessage(msg: SimulatorMessage): msg is SimulatorMultiplayerMessage {
        return msg?.type === "online-multiplayer";
    }

    function isImageMessage(msg: SimulatorMultiplayerMessage) {
        return msg?.content === "Image";
    }
}