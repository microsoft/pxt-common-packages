namespace esp32spi {

    export const SOCK_STREAM = 1
    export const AF_INET = 2
    export const MAX_PACKET = 4000

    export class Socket implements net.Socket {
        _buffer: Buffer;
        _socknum: number;
        _timeout: number;
        _openHandler: () => void;
        _closeHandler: () => void;
        _errorHandler: (msg: string) => void;
        _messageHandler: (data: string) => void;

        /** A simplified implementation of the Python 'socket' class, for connecting
    through an interface to a remote device
 */
        constructor(private host: string | Buffer, private port: number, private conntype: number = null) {
            if (this.conntype === null) {
                this.conntype = esp32spi.TCP_MODE
            }
            this._buffer = hex``
            this._socknum = esp32spi.SPIController.instance.socket()
            this.setTimeout(0)
        }

        /** Connect the socket to the 'address' (which can be 32bit packed IP or
    a hostname string). 'conntype' is an extra that may indicate SSL or not,
    depending on the underlying interface
*/
        public connect() {
            if (!esp32spi.SPIController.instance.socketConnect(this._socknum, this.host, this.port, this.conntype)) {
                this.error(`failed to connect to ${this.host}`)
                return;
            }

            this._buffer = hex``

            if(this._openHandler)
                this._openHandler();
        }

        /** Send some data to the socket */
        public send(data: string | Buffer) {
            esp32spi.SPIController.instance.socketWrite(this._socknum, dataAsBuffer(data))
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
        onMessage(handler: (data: string) => void): void {
            this._messageHandler = handler;
        }

        /** Attempt to return as many bytes as we can up to but not including '\r\n' */
        public readLine(): string {
            // print("Socket readline")
            let stamp = time.monotonic()
            while (this._buffer.indexOf(hex`0d0a`) < 0) {
                // there's no line already in there, read some more
                let avail = Math.min(esp32spi.SPIController.instance.socketAvailable(this._socknum), MAX_PACKET)
                if (avail) {
                    this._buffer = this._buffer.concat(esp32spi.SPIController.instance.socketRead(this._socknum, avail))
                } else if (this._timeout > 0 && time.monotonic() - stamp > this._timeout) {
                    // Make sure to close socket so that we don't exhaust sockets.
                    this.close()
                    control.fail("Didn't receive full response, failing out")
                }

            }
            const pos = this._buffer.indexOf(hex`0d0a`)
            const pref = this._buffer.slice(0, pos)
            this._buffer = this._buffer.slice(pos + 2)
            return pref.toString()
        }

        /** Read up to 'size' bytes from the socket, this may be buffered internally!
    If 'size' isnt specified, return everything in the buffer.
*/
        public read(size: number = 0): Buffer {
            // print("Socket read", size)
            // read as much as we can at the moment
            if (size == 0) {
                while (true) {
                    let avail = Math.min(esp32spi.SPIController.instance.socketAvailable(this._socknum), MAX_PACKET)
                    if (avail) {
                        this._buffer = this._buffer.concat(esp32spi.SPIController.instance.socketRead(this._socknum, avail))
                    } else {
                        break
                    }

                }
                let ret = this._buffer
                this._buffer = hex``
                return ret
            }

            let stamp = time.monotonic()
            let to_read = size - this._buffer.length
            let received = []
            while (to_read > 0) {
                // print("Bytes to read:", to_read)
                let avail = Math.min(esp32spi.SPIController.instance.socketAvailable(this._socknum), MAX_PACKET)
                if (avail) {
                    stamp = time.monotonic()
                    let recv = esp32spi.SPIController.instance.socketRead(this._socknum, Math.min(to_read, avail))
                    received.push(recv)
                    to_read -= recv.length
                }

                if (this._timeout > 0 && time.monotonic() - stamp > this._timeout) {
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
            esp32spi.SPIController.instance.socketClose(this._socknum)
            if (this._closeHandler)
                this._closeHandler();
        }
    }
}
