namespace pxsim {
    export interface WifiSocketBoard extends CommonBoard {
        wifiSocketState: WifiSocketState;
    }

    export class WifiSocket {
        ws: WebSocket
        _err: number
        buffers: Uint8Array[] = []
        readers: (() => void)[] = []
        bytesAvail = 0

        reqInit: RequestInit = {
            headers: {},
            credentials: "omit",
            mode: "cors",
            cache: "no-cache",
            redirect: "manual",
            referrer: "",
        }
        reqUrl: string
        reqSent = false

        constructor(private fd: number) { }

        async openReq(host: string, port: number) {
            if (!/^[\w\-\.]+$/.test(host))
                throw new Error("bad host")
            this.reqUrl = "https://" + host + ":" + port + "/"
            return 0
        }

        _queue(data: string | Uint8Array | ArrayBuffer) {
            let buf: Uint8Array
            if (data instanceof ArrayBuffer)
                buf = new Uint8Array(data)
            else if (data instanceof Uint8Array)
                buf = data
            else
                buf = U.stringToUint8Array(U.toUTF8(data))
            this.buffers.push(buf)
            if (buf.length && this.bytesAvail == 0)
                _wifi._raiseEvent(1000 + this.fd)
            this.bytesAvail += buf.length
            const rr = this.readers
            this.readers = []
            for (const r of rr) r()
        }

        openWS(url: string, proto: string[]) {
            this.ws = new WebSocket(url, proto)
            this.ws.binaryType = "arraybuffer"
            return new Promise<number>((resolve) => {
                this.ws.onopen = () => {
                    this.ws.onerror = err => {
                        console.log("ws error", err)
                        this._err = -2
                    }
                    resolve(0)
                }
                this.ws.onclose = () => {
                    console.log("ws close")
                    this._err = -20
                }
                this.ws.onmessage = ev => {
                    this._queue(ev.data)
                }
                this.ws.onerror = () => resolve(-1)
            })
        }

        waitRead() {
            return new Promise<void>(resolve => {
                this.readers.push(resolve)
            })
        }

        read(maxlen: number) {
            if (this._err)
                return this._err
            let b = this.buffers[0]
            if (b) {
                if (b.length <= maxlen) {
                    this.buffers.shift()
                } else {
                    this.buffers[0] = b.slice(maxlen)
                    b = b.slice(0, maxlen)
                }
                this.bytesAvail -= b.length
                return new RefBuffer(b)
            }
            return null
        }

        private async handleFetch() {
            // we ignore post for now
            this.reqSent = true
            const resp = await fetch(this.reqUrl, this.reqInit)
            this._queue(`HTTP/1.1 ${resp.status} ${resp.statusText}\r\n`)
            resp.headers.forEach((v, k) => {
                if (k.toLowerCase() == "content-length")
                    return
                this._queue(`${k}: ${v}\r\n`)
            })
            const data = await resp.arrayBuffer()
            this._queue(`Content-Length: ${data.byteLength}\r\n`)
            this._queue(`\r\n`)
            this._queue(data)
            return 0
        }

        async write(buf: RefBuffer) {
            if (this._err)
                return this._err
            if (this.ws)
                this.ws.send(buf.data)
            else {
                if (this.reqSent)
                    return -2
                let str = U.fromUTF8(U.uint8ArrayToString(buf.data))
                if (str == "\r\n") {
                    const dummy = this.handleFetch()
                    return 0
                }
                str = str.replace(/\r?\n$/, "")
                if (!this.reqInit.method) {
                    const m = /^\s*(\S+)\s+\/(\S+)/.exec(str)
                    if (m) {
                        this.reqInit.method = m[1]
                        this.reqUrl += m[2]
                    }
                } else {
                    const m = /^([^:]+):\s*(.*)/.exec(str)
                    if (m) {
                        (this.reqInit.headers as Record<string, string>)[m[1]] = m[2]
                    }
                }
            }
            return 0
        }

        close() {
            if (this.ws)
                this.ws.close()
        }
    }

    export class WifiSocketState {
        sockets: WifiSocket[] = [null]
    }
}

namespace pxsim._wifi {
    type int32 = number
    const MAX_SOCKET = 16
    const WIFI_ID = 1234

    export function _allowed() {
        const bid = board()?.runOptions?.boardDefinition?.id
        return /esp32|-s2/.test(bid)
    }

    function getState() {
        const b = board() as WifiSocketBoard
        if (!b.wifiSocketState) {
            if (!_allowed())
                throw new Error("_wifi not enabled")
            b.wifiSocketState = new WifiSocketState()
        }
        return b.wifiSocketState
    }

    function getSock(fd: int32) {
        if (fd < 0 || fd >= MAX_SOCKET)
            return null
        return getState().sockets[fd]
    }

    export function socketAlloc(): int32 {
        const state = getState()
        for (let i = 1; i < state.sockets.length; ++i) {
            if (!state.sockets[i]) {
                state.sockets[i] = new WifiSocket(i)
                return i
            }
        }
        const idx = state.sockets.length
        if (idx > MAX_SOCKET)
            return -1
        state.sockets.push(new WifiSocket(idx))
        return idx
    }

    export function socketConnectTLS(fd: int32, host: string, port: int32): Promise<int32> {
        const sock = getSock(fd)
        if (!sock)
            return Promise.resolve(-11)
        // TODO loosen this up in future
        if (port == 8883 && /\.azure-devices.net$/.test(host)) {
            return sock.openWS("wss://" + host + "/$iothub/websocket?iothub-no-client-cert=true", ["mqtt"])
        } else if (port == 443 && host == "microsoft.github.io") {
            return sock.openReq(host, port)
        } else {
            console.log("invalid host: " + host)
            return Promise.resolve(-1)
        }
    }

    export async function socketWrite(fd: int32, data: RefBuffer): Promise<int32> {
        BufferMethods.typeCheck(data);
        const sock = getSock(fd)
        if (!sock)
            return -11
        return sock.write(data)
    }

    export async function socketRead(fd: int32, size: int32): Promise<number | RefBuffer> {
        const sock = getSock(fd)
        if (!sock)
            return -11
        for (; ;) {
            const buf = sock.read(size)
            if (buf)
                return buf
            await sock.waitRead()
        }
    }

    export function socketBytesAvailable(fd: int32): int32 {
        const sock = getSock(fd)
        if (!sock)
            return -11
        return sock.bytesAvail
    }

    export function socketClose(fd: int32): int32 {
        const sock = getSock(fd)
        if (!sock)
            return -11
        sock.close()
        return 0
    }

    export function eventID(): int32 {
        return WIFI_ID
    }

    export function scanStart(): void {
        _raiseEvent(WifiEvent.ScanDone)
    }

    export function startLoginServer(): void {
    }

    export function scanResults(): RefBuffer {
        const b = new Uint8Array(7)
        b[0] = -20 // rssi
        b[1] = 0  // authmode
        b.set(U.stringToUint8Array("WiFi"), 2)
        return new RefBuffer(b)
    }

    export function connect(ssid: string, pass: string): int32 {
        _raiseEvent(WifiEvent.GotIP)
        return 0
    }
    export function disconnect(): int32 {
        return 0
    }
    export function isConnected(): boolean { return true }
    export function ipInfo(): RefBuffer { return new RefBuffer(new Uint8Array(4 * 3)) }
    export function rssi(): number { return -24 }

    declare const enum WifiEvent {
        ScanDone = 1,
        GotIP = 2,
        Disconnected = 3,
    }


    export function _raiseEvent(id: number) {
        pxsim.control.raiseEvent(_wifi.eventID(), id, undefined)
    }
}

namespace pxsim.crypto {
    export function _sha256(bufs: RefCollection): Promise<RefBuffer> {
        Array_.typeCheck(bufs);
        let len = 0
        const buffers = bufs.toArray().filter(e => e instanceof RefBuffer).map((b: RefBuffer) => {
            len += b.data.length
            return b.data
        })
        const concat = new Uint8Array(len)
        len = 0
        for (const b of buffers) {
            concat.set(b, len)
            len += b.length
        }
        const r = window?.crypto?.subtle?.digest("SHA-256", concat)
        if (r)
            return r.then(buf => new RefBuffer(new Uint8Array(buf)))
        else
            return Promise.resolve(undefined)
    }
}