namespace pxsim.multiplayer {
    const throttledImgPost = pxsim.U.throttle((msg: MultiplayerImageMessage) =>{
        getMultiplayerState().send(msg);
    }, 50, true);

    export function postImage(im: pxsim.RefImage) {
        const asBuf = pxsim.image.toBuffer(im);
        const sb = board() as ScreenBoard;
        throttledImgPost(<MultiplayerImageMessage>{
            content: "Image",
            image: asBuf,
            palette: sb?.screenState?.currPaletteString(),
        });
    }


    export function getCurrentImage(): pxsim.RefImage {
        return getMultiplayerState().backgroundImage;
    }

    export function setOrigin(origin: "client" | "server" | undefined) {
        getMultiplayerState().origin = origin;

    }

    export function getOrigin(): string {
        return getMultiplayerState().origin;
    }
}

namespace pxsim {
    export interface MultiplayerBoard extends EventBusBoard {
        multiplayerState: MultiplayerState;
    }

    export function getMultiplayerState() {
        return (board() as EventBusBoard as MultiplayerBoard).multiplayerState;
    }

    export interface SimulatorMultiplayerMessage extends SimulatorBroadcastMessage {
        broadcast: true
        type: "multiplayer";
        content: string;
        origin?: "server" | "client";
        clientNumber?: number;
        id?: number;
    }

    export interface MultiplayerImageMessage extends SimulatorMultiplayerMessage {
        content: "Image";
        image: RefBuffer;
        // hex byte triplets repr e.g. 000000ffffff...
        palette: string;
    }

    export interface MultiplayerButtonEvent extends SimulatorMultiplayerMessage {
        content: "Button";
        button: number; // pxsim.Key.A, ...
        state: "Pressed" | "Released" | "Held";
    }

    export class MultiplayerState {
        lastMessageId: number;
        origin: string;
        backgroundImage: RefImage;
        textEncoder: TextEncoder;

        constructor() {
            this.lastMessageId = 0;
            this.textEncoder = new TextEncoder();
        }

        send(msg: SimulatorMultiplayerMessage) {
            Runtime.postMessage(<SimulatorMultiplayerMessage>{
                ...msg,
                broadcast: true,
                toParentIFrameOnly: true,
                type: "multiplayer",
                origin: this.origin,
                id: this.lastMessageId++
            });
        }

        init(origin: string) {
            this.origin = origin;
            runtime.board.addMessageListener(msg => this.messageHandler(msg));
        }

        setButton(key: number, isPressed: boolean) {
            if (this.origin === "client") {
                this.send(<pxsim.MultiplayerButtonEvent>{
                    content: "Button",
                    button: key,
                    state: isPressed ? "Pressed" : "Released"
                })
            }
        }

        protected messageHandler(msg: SimulatorMessage) {
            if (!isMultiplayerMessage(msg)) {
                return;
            }

            if (isImageMessage(msg)) {
                if (this.origin === "client") {
                    // HACK: peer js can convert Uint8Array into ArrayBuffer when transmitting; fix this.
                    if (!ArrayBuffer.isView(msg.image.data)) {
                        msg.image.data = new Uint8Array(msg.image.data);
                    }
                    this.backgroundImage = pxsim.image.ofBuffer(msg.image);
                    if (msg.palette) {
                        const b = board() as ScreenBoard;
                        const screenState = b && b.screenState;
                        const splitPalette = msg.palette.match(/[0-9a-f]{6}/ig);
                        if (splitPalette.length === 16) {
                            screenState.setPaletteFromHtmlColors(splitPalette);
                        }
                    }
                }
            } else if (isButtonMessage(msg)) {
                if (this.origin === "server") {
                    (board() as any).handleKeyEvent(
                        msg.button + (7 * (msg.clientNumber || 1)), // + 7 to make it player 2 controls,
                        msg.state === "Pressed" || msg.state === "Held"
                    );
                }
            }
        }
    }

    function isMultiplayerMessage(msg: SimulatorMessage): msg is SimulatorMultiplayerMessage {
        return msg && msg.type === "multiplayer";
    }

    function isImageMessage(msg: SimulatorMultiplayerMessage): msg is MultiplayerImageMessage {
        return msg && msg.content === "Image";
    }

    function isButtonMessage(msg: SimulatorMultiplayerMessage): msg is MultiplayerButtonEvent {
        return msg && msg.content === "Button";
    }
}