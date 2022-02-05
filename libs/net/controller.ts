namespace net {
    export enum ControllerEvent {
        NewScan = 1,
        GotIP = 2,
        LostIP = 3,
        NoScannedNetworks = 4,
        NoKnownNetworks = 5,
        Connecting = 6,
        ConnectionFailed = 7,
        LoginServerStarted = 8
    }
    export class Controller {
        eventID: number
        private _isConnected = false

        onConnectSSIDFailed: (ssid: string) => void;

        constructor() {
            this.eventID = control.allocateEventSource()
        }

        protected setConnected(isConnected: boolean) {
            if (this._isConnected != isConnected) {
                this._isConnected = isConnected
                this.emitEvent(isConnected ? ControllerEvent.GotIP : ControllerEvent.LostIP)
            }
        }

        protected emitEvent(ev: ControllerEvent) {
            control.raiseEvent(this.eventID, ev)
        }

        onEvent(ev: ControllerEvent, h: () => void) {
            control.onEvent(this.eventID, ev, h)
        }

        public scanNetworks(): net.AccessPoint[] {
            this.lastScanResults = this.scanNetworksCore()
            this.emitEvent(ControllerEvent.NewScan)
            return this.lastScanResults
        }

        protected scanNetworksCore(): net.AccessPoint[] {
            return [];
        }

        public startLoginServer(hostName: string): void {
            
        }

        public isLoginServerEnabled(): boolean {
            return false;
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
        get isConnected(): boolean { return this._isConnected; }
        connectAP(bssid: string, password: string) { return false }
        disconnectAP() { }

        lastScanResults: net.AccessPoint[]
        protected reconnectRunning: {}

        autoconnect() {
            if (this.reconnectRunning)
                return
            const myReconn = {}
            this.reconnectRunning = myReconn
            this.emitEvent(ControllerEvent.Connecting)
            control.runInParallel(() => {
                while (this.reconnectRunning == myReconn) {
                    if (this.isConnected) {
                        pause(1000)
                    } else {
                        this.connectCore()
                        pause(500)
                    }
                }
            })
        }

        disconnect() {
            this.reconnectRunning = null
            this.disconnectAP()
        }

        protected connectCore(): boolean {
            if (control.deviceDalVersion() == "sim") {
                this.connectAP("", "")
                return true
            }

            this.scanNetworks()
            if (!this.lastScanResults || this.lastScanResults.length == 0) {
                net.log(`no networks detected`)
                this.emitEvent(ControllerEvent.NoScannedNetworks)
                return false
            }

            if (!this.reconnectRunning)
                return false

            const wifis = net.knownAccessPoints();
            const ssids = Object.keys(wifis);
            const networks = this.lastScanResults
                .filter(network => ssids.indexOf(network.ssid) > -1);

            if (!networks.length) {
                net.log(`no known networks`)
                this.emitEvent(ControllerEvent.NoKnownNetworks)
                return false
            }

            const priorities = net.accessPointPriorities()
            networks.sort((a, b) => {
                const pa = priorities[a.ssid] || 0
                const pb = priorities[b.ssid] || 0
                return pb - pa || b.rssi - a.rssi
            })

            // try connecting to known networks
            for (const network of networks) {
                net.log(`connecting to ${network.ssid}...`)
                const pwd = wifis[network.ssid]
                if (this.connectAP(network.ssid, pwd)) {
                    net.log(`connected to ${network.ssid}`)
                    return true
                }
                if (!this.reconnectRunning)
                    return false

                if (this.onConnectSSIDFailed)
                    this.onConnectSSIDFailed(network.ssid)
            }

            net.log(`connection failed`)
            this.emitEvent(ControllerEvent.ConnectionFailed)
            return false
        }

        connect(timeout_ms?: number): boolean {
            this.autoconnect()
            pauseUntil(() => this.isConnected, timeout_ms)
            return this.isConnected
        }

        get ssid(): string { return undefined; }
        get rssi(): number { return undefined; }
        get MACaddress(): Buffer { return undefined; }
        get IPaddress(): Buffer { return undefined; }
        public ping(dest: string, ttl: number = 250): number { return -1; }

        // optional dataAvailable event
        public dataAvailableSrc(socket_num: number): number { return -1; }
        public dataAvailableValue(socket_num: number): number { return -1; }
    }
}