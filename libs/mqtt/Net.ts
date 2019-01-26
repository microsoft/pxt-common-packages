declare interface Socket {
    send(data: string): void;
    close(): void;
    onOpen(handler: () => void): void;
    onClose(handler: () => void): void;
    onError(handler: () => void): void;
    onMessage(handler: (data: string) => void): void;
}

declare interface Net {
    connect(host: string, port: number): Socket;
}
