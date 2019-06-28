namespace esp32spi {

    export const SOCK_STREAM = 1
    export const AF_INET = 2
    export const MAX_PACKET = 4000

    const _the_interface = esp32spi.ESP_SPIcontrol.instance

    export class Socket {
        _buffer: Buffer;
        _socknum: number
        _timeout: number
        /** A simplified implementation of the Python 'socket' class, for connecting
    through an interface to a remote device
 */
        constructor() {
            this._buffer = hex``
            this._socknum = _the_interface.get_socket()
            this.settimeout(0)
        }

        public connect(host: string | Buffer, port: number, conntype: number = null) {
            /** Connect the socket to the 'address' (which can be 32bit packed IP or
        a hostname string). 'conntype' is an extra that may indicate SSL or not,
        depending on the underlying interface
    */
            if (conntype === null) {
                conntype = esp32spi.TCP_MODE
            }

            if (!_the_interface.socket_connect(this._socknum, host, port, conntype)) {
                control.fail(`RuntimeError("Failed to connect to host", host)`)
            }

            this._buffer = hex``
        }

        /** Send some data to the socket */
        public write(data: string | Buffer) {
            _the_interface.socket_write(this._socknum, dataAsBuffer(data))
        }

        /** Attempt to return as many bytes as we can up to but not including '\r\n' */
        public readline(): string {
            // print("Socket readline")
            let stamp = time.monotonic()
            while (this._buffer.indexOf(hex`0d0a`) < 0) {
                // there's no line already in there, read some more
                let avail = Math.min(_the_interface.socket_available(this._socknum), MAX_PACKET)
                if (avail) {
                    this._buffer = this._buffer.concat(_the_interface.socket_read(this._socknum, avail))
                } else if (this._timeout > 0 && time.monotonic() - stamp > this._timeout) {
                    // Make sure to close socket so that we don't exhaust sockets.
                    this.close()
                    control.fail("Didn't receive full response, failing out")
                }

            }
            const tmp = this._buffer.split(hex`0d0a`, 1)
            let firstline = tmp[0]
            this._buffer = tmp[1]
            return firstline
        }

        public read(size: number = 0): Buffer {
            /** Read up to 'size' bytes from the socket, this may be buffered internally!
        If 'size' isnt specified, return everything in the buffer.
    */
            // print("Socket read", size)
            // read as much as we can at the moment
            if (size == 0) {
                while (true) {
                    let avail = Math.min(_the_interface.socket_available(this._socknum), MAX_PACKET)
                    if (avail) {
                        this._buffer += _the_interface.socket_read(this._socknum, avail)
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
                let avail = Math.min(_the_interface.socket_available(this._socknum), MAX_PACKET)
                if (avail) {
                    stamp = time.monotonic()
                    let recv = _the_interface.socket_read(this._socknum, Math.min(to_read, avail))
                    received.push(recv)
                    to_read -= recv.length
                }

                if (this._timeout > 0 && time.monotonic() - stamp > this._timeout) {
                    break
                }

            }
            // print(received)
            this._buffer += hex``.join(received)
            ret = null
            if (this._buffer.length == size) {
                ret = this._buffer
                this._buffer = hex``
            } else {
                ret = this._buffer.slice(0, size)
                this._buffer = this._buffer.slice(size)
            }

            return ret
        }

        public settimeout(value: number) {
            /** Set the read timeout for sockets, if value is 0 it will block */
            this._timeout = value
        }

        public close() {
            /** Close the socket, after reading whatever remains */
            _the_interface.socket_close(this._socknum)
        }
    }
}
