declare interface MessageEvent {
    data: any;
}
declare interface Socket {
    //% shim=SocketMethods::onSend
    send(data: string): void;
    //% shim=SocketMethods::onClose
    close(): void;
    //% shim=SocketMethods::onOpen
    onOpen(handler: () => void): void;
    //% shim=SocketMethods::onClose
    onClose(handler: () => void): void;
    //% shim=SocketMethods::onError
    onError(handler: () => void): void;
    //% shim=SocketMethods::onMessage
    onMessage(handler: (data: string) => void): void;
}

declare interface Net {
    //% shim=NetMethods::connect
    connect(host: string, port: number): Socket;
}
