namespace pxsim {
    export class NetSocket {
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
        onClose(handler: pxsim.RefAction): void {
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

    export class Net {
        connect(host: string, port: number): NetSocket {
            // ignore port
            const r = pxsim.runtime;
            if (!r) return undefined;
            const ws = r.createWebSocket(`${host}::443/$iothub/websocket`);
            return new NetSocket(ws);
        }
    }
}

namespace pxsim.azureiot {
    export function createAzureNet(): Net {
        return new Net();
    }
}

namespace pxsim.NetMethods {
    export function connect(net: Net, host: string, port: number): NetSocket {
        return net.connect(host, port);
    }
}

namespace pxsim.SocketMethods {
    export function send(ws: pxsim.NetSocket, data: string): void {
        ws.send(data);
    }
    export function close(ws: pxsim.NetSocket): void {
        ws.close();
    }
    export function onOpen(ws: pxsim.NetSocket, handler: RefAction): void {
        ws.onOpen(handler);
    }
    export function onClose(ws: pxsim.NetSocket, handler: RefAction): void {
        ws.onClose(handler);
    }
    export function onError(ws: pxsim.NetSocket, handler: RefAction): void {
        ws.onError(handler);
    }
    export function onMessage(ws: pxsim.NetSocket, handler: RefAction): void {
        ws.onMessage(handler);
    }
}