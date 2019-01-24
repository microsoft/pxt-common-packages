namespace mqtt {
/**
 * Interfaces for net and socket.
 */
export interface INetConnectOptions {
    host: string;
    port?: number;
}

export interface ISocket {
    write(data: string): void;
    on(event: string, listener: (args: string) => void): void;
    removeAllListeners(event: string): void;
    end(): void;
}

export interface INet {
    connect(options: INetConnectOptions, callback: () => void): ISocket;
}

}