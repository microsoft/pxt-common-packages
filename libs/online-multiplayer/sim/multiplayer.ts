namespace pxsim.multiplayer {
    export interface SimulatorMultiplayerMessage extends SimulatorMessage {
        type: "online-multiplayer";
        origin: "server" | "client";
        content: string;
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
        Runtime.postMessage(<MultiplayerImageMessage>{
            type: "online-multiplayer",
            origin: isServer ? "server" : "client",
            content: "Image",
            data: im,
        })
    }
}
