namespace net {
    export class Controller {
        constructor() { }

        public scanNetworks(): net.AccessPoint[] {
            return [];
        }

        public socket(): number {
            return -1;
        }

        public socketConnect(socket_num: number, dest: string | Buffer, port: number, conn_mode = TCP_MODE): boolean {
            return false;
        }

        public socketWrite(socket_num: number, buffer: Buffer): void {
        }

        public socketAvailable(socket_num: number): number {
            return -1;
        }

        public socketRead(socket_num: number, size: number): Buffer {
            return undefined;
        }

        public socketClose(socket_num: number): void {
        }

        public hostbyName(hostname: string): Buffer {
            return undefined;
        }
        get isIdle(): boolean { return false; }
        get isConnected(): boolean { return false; }
        connectAP(bssid: string, password: string) { return false }
        connect(maxTries = 10000): boolean {
            if (this.isConnected) return true

            if (control.deviceDalVersion() == "sim") {
                this.connectAP("", "")
                return true
            }

            const wifis = net.knownAccessPoints();
            const ssids = Object.keys(wifis);

            for (let i = 0; i < maxTries; ++i) {
                const networks = this.scanNetworks()
                    .filter(network => ssids.indexOf(network.ssid) > -1);
                // try connecting to known networks
                for (const network of networks) {
                    if (this.connectAP(network.ssid, wifis[network.ssid]))
                        return true
                }
                net.log(`re-trying scan, attempt ${i}...`)
            }

            // no compatible SSID
            net.log(`connection failed`)
            return false
        }
        get ssid(): string { return undefined; }
        get MACaddress(): Buffer { return undefined; }
        public ping(dest: string, ttl: number = 250): number { return -1; }

        // optional dataAvailable event
        public dataAvailableSrc(socket_num: number): number { return -1; }
        public dataAvailableValue(socket_num: number): number { return -1; }
    }
}