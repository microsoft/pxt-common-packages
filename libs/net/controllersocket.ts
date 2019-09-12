namespace net {

    export const SOCK_STREAM = 1
    export const AF_INET = 2
    export const MAX_PACKET = 4000
    export const TCP_MODE = 0
    export const UDP_MODE = 1
    export const TLS_MODE = 2

    export class ControllerSocket implements net.Socket {
        _buffer: Buffer;
        _socknum: number;
        _timeout: number;
        _closed: boolean;
        _openHandler: () => void;
        _closeHandler: () => void;
        _errorHandler: (msg: string) => void;
        _messageHandler: (data: Buffer) => void;

        /** A simplified implementation of the Python 'socket' class, for connecting
    through an interface to a remote device
 */
        constructor(private controller: Controller, private host: string | Buffer, private port: number, private conntype: number = null) {
            if (this.conntype === null) {
                this.conntype = net.TCP_MODE
            }
            this._buffer = hex``
            this._socknum = this.controller.socket()
            this.setTimeout(0)
        }

        /** Connect the socket to the 'address' (which can be 32bit packed IP or
    a hostname string). 'conntype' is an extra that may indicate SSL or not,
    depending on the underlying interface
*/
        public connect() {
            if (!this.controller.socketConnect(this._socknum, this.host, this.port, this.conntype)) {
                this.error(`failed to connect to ${this.host}`)
                return;
            }

            this._buffer = hex``

            if (this._openHandler)
                this._openHandler();
        }

        /** Send some data to the socket */
        public send(data: string | Buffer) {
            //console.log("sock wr: " + data)
            this.controller.socketWrite(this._socknum, net.dataAsBuffer(data))
        }

        private error(msg: string) {
            if (this._errorHandler)
                this._errorHandler(msg)
        }

        onOpen(handler: () => void): void {
            this._openHandler = handler;
        }
        onClose(handler: () => void): void {
            this._closeHandler = handler;
        }
        onError(handler: (msg: string) => void): void {
            this._errorHandler = handler;
        }
        onMessage(handler: (data: Buffer) => void): void {
            if (this._messageHandler === undefined) {
                control.runInParallel(() => {
                    while (!this._closed) {
                        let buf = this.read()
                        if (buf.length) {
                            if (this._messageHandler)
                                this._messageHandler(buf)
                        } else {
                            pause(200)
                        }
                    }
                })
            }
            this._messageHandler = handler || null;
        }

        /** Attempt to return as many bytes as we can up to but not including '\r\n' */
        public readLine(): string {
            // print("Socket readline")
            let stamp = monotonic()
            while (this._buffer.indexOf(hex`0d0a`) < 0) {
                // there's no line already in there, read some more
                let avail = Math.min(this.controller.socketAvailable(this._socknum), MAX_PACKET)
                if (avail) {
                    this._buffer = this._buffer.concat(this.controller.socketRead(this._socknum, avail))
                } else if (this._timeout > 0 && monotonic() - stamp > this._timeout) {
                    // Make sure to close socket so that we don't exhaust sockets.
                    this.close()
                    control.fail("Didn't receive full response, failing out")
                }

            }
            const pos = this._buffer.indexOf(hex`0d0a`)
            const pref = this._buffer.slice(0, pos)
            this._buffer = this._buffer.slice(pos + 2)
            // print("rd: " + this._buffer.length + " / " + pref.length + " :" + pref.toString())
            return pref.toString()
        }

        /** Read up to 'size' bytes from the socket, this may be buffered internally! If 'size' isnt specified, return everything in the buffer. */
        public read(size: number = 0): Buffer {
            // print("Socket read", size)
            if (size == 0) {
                if (this._buffer.length == 0) {
                    let avail = Math.min(this.controller.socketAvailable(this._socknum), MAX_PACKET)
                    if (avail)
                        this._buffer = this._buffer.concat(this.controller.socketRead(this._socknum, avail))
                }
                let ret = this._buffer
                this._buffer = hex``
                return ret
            }

            let stamp = monotonic()
            let to_read = size - this._buffer.length
            let received = []
            while (to_read > 0) {
                // print("Bytes to read:", to_read)
                let avail = Math.min(this.controller.socketAvailable(this._socknum), MAX_PACKET)
                if (avail) {
                    stamp = monotonic()
                    let recv = this.controller.socketRead(this._socknum, Math.min(to_read, avail))
                    received.push(recv)
                    to_read -= recv.length
                }

                if (this._timeout > 0 && monotonic() - stamp > this._timeout) {
                    break
                }

            }
            // print(received)
            received.unshift(this._buffer)
            this._buffer = pins.concatBuffers(received)
            let ret = null
            if (this._buffer.length == size) {
                ret = this._buffer
                this._buffer = hex``
            } else {
                ret = this._buffer.slice(0, size)
                this._buffer = this._buffer.slice(size)
            }

            return ret
        }

        /** Set the read timeout for sockets, if value is 0 it will block */
        public setTimeout(value: number) {
            this._timeout = value
        }

        /** Close the socket, after reading whatever remains */
        public close() {
            this._closed = true;
            this.controller.socketClose(this._socknum)
            if (this._closeHandler)
                this._closeHandler();
        }
    }
}
