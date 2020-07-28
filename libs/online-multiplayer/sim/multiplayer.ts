namespace pxsim.multiplayer {
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

    let isServer = false;
    export function setIsServer(server: boolean) {
        isServer = server;
    }

    export function postImage(im: pxsim.RefImage) {
        postMultiplayerMessage(<MultiplayerImageMessage>{
            origin: isServer ? "server" : "client",
            content: "Image",
            data: im,
        });
    }

    let msgId = 0;
    function postMultiplayerMessage(msg: SimulatorMultiplayerMessage) {
        Runtime.postMessage(<SimulatorMultiplayerMessage>{
            ...msg,
            type: "online-multiplayer",
            id: msgId++
        });
    }
}
