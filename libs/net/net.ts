/**
 * Networking, WiFi, web requests
 */
//% weight=1
//% advanced=true
//% icon="\uf1eb" color="#8446cf"
namespace net {
    /**
     * Default priority of net log messages
     **/
    export let logPriority: ConsolePriority = -1;
    export function log(msg: string) {
        console.add(logPriority, "net:" + msg);
    }
    export function debug(msg: string) {
        if (logPriority > ConsolePriority.Debug)
            console.add(ConsolePriority.Debug, "net:" + msg);
    }
    export function fail(reason: string) {
        net.log(`error: ${reason}`);
        throw reason;
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
            this._controller = undefined; // null failed to initialize
        }

        static instance: Net;

        get controller(): net.Controller {
            if (this._controller === undefined) {
                net.log(`init controller`)
                this._controller = this.factory();
                if (!this._controller) {
                    net.log(`controller not found`)
                    this._controller = null;
                }
            }
            return this._controller;
        }

        /**
         * Scan for APs
         */
        scanNetworks(): net.AccessPoint[] {
            const c = this.controller;
            try {
                return c ? c.scanNetworks() : [];
            } catch (e) {
                console.error("" + e)
                return [];
            }
        }

        createSocket(host: string, port: number, secure: boolean): net.Socket {
            const c = this.controller;
            if (!c) return undefined;
            const socket = new net.ControllerSocket(c, host, port, secure ? net.TLS_MODE : net.TCP_MODE);
            return socket;
        }

        hostByName(host: string): string {
            const c = this.controller;
            if (!c) return undefined;
            const b = this.controller.hostbyName(host);
            if (b) return b.toString();
            return undefined;
        }
    }

    /**
     * Gets the current Net instance
     */
    export function instance(): Net {
        return net.Net.instance;
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

    export function clearAccessPoints() {
        settings.deviceSecrets.setSecret(AP_SECRETS_KEY, undefined);
    }
}