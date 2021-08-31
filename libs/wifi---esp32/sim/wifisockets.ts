namespace pxsim {
    export interface WifiSocketBoard extends CommonBoard {
        wifiSocketState: WifiSocketState;
    }

    export class WifiSocket {
        ws: WebSocket
        _err: number
        closed = false
        buffers: Uint8Array[] = []
        readers: (() => void)[] = []
        bytesAvail = 0

        constructor(private fd: number) { }

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
                    let buf: Uint8Array
                    if (ev.data instanceof ArrayBuffer) {
                        buf = new Uint8Array(ev.data)
                    } else {
                        buf = U.stringToUint8Array(U.toUTF8(ev.data))
                    }
                    this.buffers.push(buf)
                    if (buf.length && this.bytesAvail == 0)
                        pxsim.control.raiseEvent(_wifi.eventID(), 1000 + this.fd, undefined)
                    this.bytesAvail += buf.length
                    const rr = this.readers
                    this.readers = []
                    for (const r of rr) r()
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

        write(buf: RefBuffer) {
            if (this._err)
                return this._err
            this.ws.send(buf.data)
            return 0
        }

        close() {
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

    function getState() {
        const b = board() as WifiSocketBoard
        if (!b.wifiSocketState)
            b.wifiSocketState = new WifiSocketState()
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
            return sock.openWS("wss://" + host + "/$iothub/websocket", ["mqtt"])
        } else if (port == 443 && host == "microsoft.github.io") {
            return Promise.resolve(-1)
        } else {
            console.log("invalid host: " + host)
            return Promise.resolve(-1)
        }
    }

    export function socketWrite(fd: int32, data: RefBuffer): int32 {
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