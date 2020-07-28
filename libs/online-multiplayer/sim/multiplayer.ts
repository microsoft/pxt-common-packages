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
        origin?: "server" | "client";
        content: string;
        id?: number;
    }

    export interface MultiplayerImageMessage extends SimulatorMultiplayerMessage {
        content: "Image";
        data: RefImage;
    }

    export interface MultiplayerButtonEvent extends SimulatorMultiplayerMessage {
        content: "Button";
        button: number; // pxsim.Key.A, ...
        state: "Pressed" | "Released" | "Held";
    }

    export class MultiplayerState {
        lastMessageId: number;
        origin: "client" | "server"

        constructor() {
            this.lastMessageId = 0;
            this.origin = "server";
        }

        send(msg: SimulatorMultiplayerMessage) {
            Runtime.postMessage(<SimulatorMultiplayerMessage>{
                ...msg,
                type: "multiplayer",
                origin: this.origin,
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
                (board() as any).setButton(
                    msg.button + 7, // + 7 to make it player 2 controls
                    msg.state === "Pressed" || msg.state === "Held"
                );
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