class NetSocket {
    constructor(public ws: WebSocket) { }
    send(data: string): void {
        this.ws.send(data);
    }
    close(): void {
        this.ws.close();
    }
    onOpen(handler: RefAction): void {
        this.ws.onopen = () => {
            const r = pxsim.runtime;
            if (r) r.runFiberAsync(handler).done();
        }
    }
    onClose(handler: RefAction): void {
        this.ws.onclose = () => {
            const r = pxsim.runtime;
            if (r) r.runFiberAsync(handler).done();
        }
    }
    onError(handler: RefAction): void {
        this.ws.onerror = () => {
            const r = pxsim.runtime;
            if (r) r.runFiberAsync(handler).done();
        }
    }
    onMessage(handler: RefAction): void {
        this.ws.onmessage = (ev: MessageEvent) => {
            const r = pxsim.runtime;
            if (r) r.runFiberAsync(handler, ev.data).done();
        }
    }
}

namespace pxsim.NetMethods {
    export function connect(host: string, port: number, handler: () => void): Socket {
        // ignore port
        const ws = new WebSocket(`wss://${host}::443/$iothub/websocket`);
        return new NetSocket(ws);
    }
}

namespace pxsim.SocketMethods {
    export function send(ws: Socket, data: string): void {
        ws.send(data);
    }
    export function stop(ws: Socket): void {
        ws.stop();
    }
    export function onOpen(ws: Socket, handler: RefAction): void {
        ws.onOpen(handler);
    }
    export function onClose(ws: Socket, handler: RefAction): void {
        ws.onClose(handler);
    }
    export function onError(ws: Socket, handler: RefAction): void {
        ws.onError(handler);
    }
    export function onMessage(ws: Socket, handler: RefAction): void {
        ws.onMessage(handler);
    }
}