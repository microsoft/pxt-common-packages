namespace net {
    export let logPriority = ConsolePriority.Silent;
    export function log(msg: string) {
        console.add(logPriority, "net:" + msg);
    }
    export function debug(msg: string) {
        console.add(ConsolePriority.Debug, "net:" + msg);
    }

    export function monotonic(): number {
        return control.millis() / 1000.0;
    }

    export class AccessPoint {
        rssi: number;
        encryption: number;
        constructor(public ssid: string) { }
    }

    export interface Socket {
        connect(): void;
        send(data: string | Buffer): void;
        read(contentLength: number): Buffer;
        close(): void;
        onOpen(handler: () => void): void;
        onClose(handler: () => void): void;
        onError(handler: (msg: string) => void): void;
        onMessage(handler: (data: Buffer) => void): void;
        setTimeout(millis: number): void;
        readLine(): string;
    }

    export class Net {
        private _controller: Controller;
        constructor(private factory: () => Controller) {
            Net.instance = this;
        }

        static instance: Net;

        get controller(): net.Controller {
            if (!this._controller)
                this._controller = this.factory();
            return this._controller;
        }

        createSocket(host: string, port: number, secure: boolean): net.Socket {
            const c = this.controller;
            if (!c) return undefined;
            const socket = new net.ControllerSocket(c, host, port, secure ? net.TLS_MODE : net.TCP_MODE);
            return socket;
        }

        hostByName(host: string): string {
            const c= this.controller;
            if (!c) return undefined;
            const b = this.controller.hostbyName(host);
            if (b) return b.toString();
            return undefined;
        }
    }

    const AP_SECRETS_KEY = "wifi";
    /**
     * Gets the map of SSID -> password pairs
     */
    export function knownAccessPoints(): StringMap {
        return settings.deviceSecrets.readSecret(AP_SECRETS_KEY) || {};
    }

    export function updateAccessPoint(ssid: string, password: string) {
        const k: StringMap = {};
        k[ssid] = password;
        settings.deviceSecrets.updateSecret(AP_SECRETS_KEY, k);
    }
}