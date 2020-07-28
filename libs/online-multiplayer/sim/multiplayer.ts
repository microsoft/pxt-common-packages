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
        return (board() as EventBusBoard as MultiplayerBoard).multiplayerState;
    }

    export interface SimulatorMultiplayerMessage extends SimulatorMessage {
        type: "multiplayer";
        origin: "server" | "client";
        content: string;
        id: number;
        data: any;
    }

    export interface MultiplayerImageMessage extends SimulatorMultiplayerMessage {
        content: "Image";
        data: RefImage;
    }

    export interface MultiplayerButtonEvent extends SimulatorMultiplayerMessage {
        content: "Button";
        button: "A" | "B" | "UP" | "DOWN" | "LEFT" | "RIGHT" | "MENU";
        state: "Pressed" | "Released" | "Held";
    }

    export class MultiplayerState {
        lastMessageId: number;

        constructor(public isServer: boolean) {
            this.lastMessageId = 0;
        }

        send(msg: SimulatorMultiplayerMessage) {
            Runtime.postMessage(<SimulatorMultiplayerMessage>{
                ...msg,
                type: "multiplayer",
                origin: this.isServer ? "server" : "client",
                id: this.lastMessageId++
            });
        }

        addListeners() {
            runtime.board.addMessageListener(msg => this.messageHandler(msg));
        }

        protected messageHandler(msg: SimulatorMessage) {
            if (!isMultiplayerMessage(msg)) {
                return;
            }

            if (isImageMessage(msg)) {
                // do what we need to propagate image to sim
            } else if (isButtonMessage(msg)) {
                // propagate button event to sim
            }
        }
    }

    function isMultiplayerMessage(msg: SimulatorMessage): msg is SimulatorMultiplayerMessage {
        return msg?.type === "multiplayer";
    }

    function isImageMessage(msg: SimulatorMultiplayerMessage): msg is MultiplayerImageMessage {
        return msg?.content === "Image";
    }

    function isButtonMessage(msg: SimulatorMultiplayerMessage): msg is MultiplayerButtonEvent {
        return msg?.content === "Button";
    }
}