namespace esp32spi {
    
    export const SOCK_STREAM = 1
    export const AF_INET = 2
    export const MAX_PACKET = 4000
    // pylint: disable=too-many-arguments, unused-argument
    export function getaddrinfo(host: any; /** TODO: type **/, port: any; /** TODO: type **/, family: number = 0, socktype: number = 0, proto: number = 0, flags: number = 0): number[][] {
        /** Given a hostname and a port name, return a 'socket.getaddrinfo'
    compatible list of tuples. Honestly, we ignore anything but host & port
 */
        if (!isinstance(port, int)) {
            control.fail("Port must be an integer")
        }
        
        let ipaddr = _the_interface.get_host_by_name(host)
        return [[AF_INET, socktype, proto, "", [ipaddr, port]]]
    }
    
    // pylint: enable=too-many-arguments, unused-argument
    // pylint: disable=unused-argument, redefined-builtin, invalid-name
    export class Socket {
        _buffer: any; /** TODO: type **/
        _socknum: any; /** TODO: type **/
        _timeout: number
        /** A simplified implementation of the Python 'socket' class, for connecting
    through an interface to a remote device
 */
        constructor(family: number = AF_INET, type: number = SOCK_STREAM, proto: number = 0, fileno: any; /** TODO: type **/ = null) {
            if (family != AF_INET) {
                control.fail("Only AF_INET family supported")
            }
            
            if (type != SOCK_STREAM) {
                control.fail("Only SOCK_STREAM type supported")
            }
            
            this._buffer = hex ``
            this._socknum = _the_interface.get_socket()
            this.settimeout(0)
        }
        
        public connect(address: any; /** TODO: type **/, conntype: any; /** TODO: type **/ = null): any; /** TODO: type **/ {
            /** Connect the socket to the 'address' (which can be 32bit packed IP or
        a hostname string). 'conntype' is an extra that may indicate SSL or not,
        depending on the underlying interface
 */
            const tmp = address
            let host = tmp[0]
            let port = tmp[1]
            if (conntype === null) {
                conntype = _the_interface.TCP_MODE
            }
            
            if (!_the_interface.socket_connect(this._socknum, host, port, {conn_mode: conntype})) {
                control.fail(`RuntimeError("Failed to connect to host", host)`)
            }
            
            this._buffer = hex ``
        }
        
        // pylint: disable=no-self-use
        public write(data: any; /** TODO: type **/): any; /** TODO: type **/ {
            /** Send some data to the socket */
            _the_interface.socket_write(this._socknum, data)
            gc.collect()
        }
        
        public readline(): any; /** TODO: type **/ {
            /** Attempt to return as many bytes as we can up to but not including '
'
 */
            // print("Socket readline")
            let stamp = time.monotonic()
            while (this._buffer.indexOf(hex `0d0a`) < 0) {
                // there's no line already in there, read some more
                let avail = Math.min(_the_interface.socket_available(this._socknum), MAX_PACKET)
                if (avail) {
                    this._buffer += _the_interface.socket_read(this._socknum, avail)
                } else if (this._timeout > 0 && time.monotonic() - stamp > this._timeout) {
                    // Make sure to close socket so that we don't exhaust sockets.
                    this.close()
                    control.fail("Didn't receive full response, failing out")
                }
                
            }
            const tmp = this._buffer.split(hex `0d0a`, 1)
            let firstline = tmp[0]
            this._buffer = tmp[1]
            gc.collect()
            return firstline
        }
        
        public read(size: number = 0): any; /** TODO: type **/ {
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
                gc.collect()
                let ret = this._buffer
                this._buffer = hex ``
                gc.collect()
                return ret
            }
            
            let stamp = time.monotonic()
            let to_read = size - this._buffer.length
            let received = []
            while (to_read > 0) {
                // print("Bytes to read:", to_read)
                avail = Math.min(_the_interface.socket_available(this._socknum), MAX_PACKET)
                if (avail) {
                    stamp = time.monotonic()
                    let recv = _the_interface.socket_read(this._socknum, Math.min(to_read, avail))
                    received.push(recv)
                    to_read -= recv.length
                    gc.collect()
                }
                
                if (this._timeout > 0 && time.monotonic() - stamp > this._timeout) {
                    break
                }
                
            }
            // print(received)
            this._buffer += hex ``.join(received)
            ret = null
            if (this._buffer.length == size) {
                ret = this._buffer
                this._buffer = hex ``
            } else {
                ret = this._buffer.slice(0, size)
                this._buffer = this._buffer.slice(size)
            }
            
            gc.collect()
            return ret
        }
        
        public settimeout(value: number): any; /** TODO: type **/ {
            /** Set the read timeout for sockets, if value is 0 it will block */
            this._timeout = value
        }
        
        public close(): any; /** TODO: type **/ {
            /** Close the socket, after reading whatever remains */
            _the_interface.socket_close(this._socknum)
        }
        
    }
    
}
