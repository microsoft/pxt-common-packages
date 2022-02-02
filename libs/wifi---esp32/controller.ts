namespace net {
    //% shim=_wifi::_readLastAccessPointCredentials
    declare function _readLastAccessPointCredentials(): string[];

    const EV_ScanCompleted = 1000

    export class WifiController extends net.Controller {
        private networks: net.AccessPoint[]
        private inScan: boolean
        private _ssid: string

        constructor() {
            super()
            control.internalOnEvent(_wifi.eventID(), WifiEvent.ScanDone, () => this.scanDone())
            control.internalOnEvent(_wifi.eventID(), WifiEvent.Disconnected, () => {
                this.setConnected(false)
            })
            control.internalOnEvent(_wifi.eventID(), WifiEvent.GotIP, () => {
                this.setConnected(true)
            })
        }

        private scanDone() {
            const buf = _wifi.scanResults()
            this.networks = []
            this.inScan = false
            if (!buf)
                return
            let i = 0
            const entrySize = 48
            while (i < buf.length) {
                const ap = net.AccessPoint.fromBuffer(buf.slice(i, entrySize))
                control.dmesg(`${ap.ssid} [${ap.rssi}dB]`)
                this.networks.push(ap)
                i += entrySize
            }
            control.raiseEvent(_wifi.eventID(), EV_ScanCompleted)
        }

        public scanNetworksCore(): net.AccessPoint[] {
            if (!this.inScan) {
                this.inScan = true
                _wifi.scanStart()
            }
            control.waitForEvent(_wifi.eventID(), EV_ScanCompleted)
            return this.networks
        }

        public startLoginServer(hostName: string): void {
            if (_wifi.isLoginServerEnabled())
                return
                
            this.disconnect()
            _wifi.startLoginServer(hostName);
            control.onEvent(_wifi.eventID(), WifiEvent.AccessPointCredentialsAvailable, () => {
                const credentials = _readLastAccessPointCredentials()
                if (!!credentials && credentials.length == 2) {
                    const ssid = credentials[0]
                    const pwd = credentials[1]
                    net.updateAccessPoint(ssid, pwd)
                    console.debug(`restarting...`);
                    pause(100);
                    control.reset();
                }
            })
            this.emitEvent(ControllerEvent.LoginServerStarted);
        }

        public isLoginServerEnabled(): boolean {
            return _wifi.isLoginServerEnabled()
        }

        public disconnectAP() {
            _wifi.disconnect()
        }

        public connectAP(ssid: string, pass: string) {
            control.dmesg(`connecting to [${ssid}]...`)
            this._ssid = ssid
            const res = _wifi.connect(ssid, pass)
            if (res != 0)
                return false
            pauseUntil(() => this.isConnected, 15000)
            control.dmesg(`${this.isConnected ? "" : "not "}connected to [${ssid}]`)
            return this.isConnected
        }

        public socket(): number {
            return _wifi.socketAlloc()
        }

        private logError(lbl: string, res: number) {
            if (res < 0) {
                control.dmesg(`sock ${lbl} failed: ${res}`)
                return false
            }
            return true
        }

        public socketConnect(socket_num: number, dest: string | Buffer, port: number, conn_mode = TCP_MODE): boolean {
            if (conn_mode != TLS_MODE)
                throw "only TLS supported for now"
            if (typeof dest != "string")
                throw "connection by IP not supported in TLS mode"
            return this.logError("connect", _wifi.socketConnectTLS(socket_num, dest, port))
        }

        public socketWrite(socket_num: number, buffer: Buffer): void {
            this.logError("write", _wifi.socketWrite(socket_num, buffer))
        }

        public socketAvailable(socket_num: number): number {
            return _wifi.socketBytesAvailable(socket_num)
        }

        public socketRead(socket_num: number, size: number): Buffer {
            const r = _wifi.socketRead(socket_num, size)
            if (typeof r == "number") {
                this.logError("read", r)
                return undefined
            } else {
                return (r as any) as Buffer
            }
        }

        public socketClose(socket_num: number): void {
            this.logError("close", _wifi.socketClose(socket_num))
        }

        public hostbyName(hostname: string): Buffer {
            return undefined;
        }
        get isIdle(): boolean { return true; }
        get MACaddress(): Buffer { return control.deviceLongSerialNumber().slice(1, 6); }
        get IPaddress(): Buffer { return this.isConnected ? _wifi.ipInfo().slice(0, 4) : undefined; }
        get ssid(): string { return this.isConnected ? this._ssid : "" }
        get rssi(): number { return _wifi.rssi() }
        public ping(dest: string, ttl: number = 250): number { return -1; }

        public dataAvailableSrc(socket_num: number): number { return _wifi.eventID(); }
        public dataAvailableValue(socket_num: number): number { return 1000 + socket_num; }

    }

    // initialize Net.instance
    new net.Net(() => new WifiController())
}
