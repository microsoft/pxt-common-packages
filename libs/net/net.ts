namespace net {
    export let logPriority = ConsolePriority.Silent;
    export function log(msg: string) {
        console.add(logPriority, `net: ` + msg);
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
        constructor() {
            Net.instance = this;
        }

        static instance: Net;

        createSocket(host: string, port: number, secure: boolean): Socket {
            return undefined;
        }
        hostByName(host: string): string {
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
        let k: StringMap = {};
        k[ssid] = password;
        settings.deviceSecrets.updateSecret(AP_SECRETS_KEY, k);
    }
}