namespace net {
    const EV_ScanCompleted = 1000

    export class WifiController extends net.Controller {
        private networks: net.AccessPoint[]
        private inScan: boolean
        private _isConnected: boolean

        constructor() {
            super()
            control.internalOnEvent(_wifi.eventID(), WifiEvent.ScanDone, this.scanDone)
            control.internalOnEvent(_wifi.eventID(), WifiEvent.Disconnected, () => {
                this._isConnected = false
            })
            control.internalOnEvent(_wifi.eventID(), WifiEvent.GotIP, () => {
                this._isConnected = true
            })
        }

        private scanDone() {
            const buf = _wifi.scanResults()
            this.networks = []
            this.inScan = false
            if (!buf)
                return

            let i = 0
            while (i < buf.length) {
                const rssi = buf.getNumber(NumberFormat.Int8LE, i++)
                const authmode = buf[i++]
                let ep = i
                while (ep < buf.length) {
                    if (!buf[ep])
                        break
                    ep++
                }
                if (ep == buf.length)
                    break
                const ap = new net.AccessPoint(buf.slice(i, ep - i).toString())
                ap.rssi = rssi
                ap.encryption = authmode
                i = ep + 1
                this.networks.push(ap)
            }

            control.raiseEvent(_wifi.eventID(), EV_ScanCompleted)
        }

        public scanNetworks(): net.AccessPoint[] {
            if (!this.inScan) {
                this.inScan = true
                _wifi.scanStart()
            }
            control.waitForEvent(_wifi.eventID(), EV_ScanCompleted)
            return this.networks
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
        get isIdle(): boolean { return true; }
        get isConnected(): boolean { return this._isConnected; }
        connect(): void { }
        get ssid(): string { return undefined; }
        get MACaddress(): Buffer { return undefined; }
        public ping(dest: string, ttl: number = 250): number { return -1; }
    }
}