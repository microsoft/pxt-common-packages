namespace wifi {
    let _the_interface = null
    export function set_interface(iface: any; /** TODO: type **/): any; /** TODO: type **/ {
        /** Helper to set the global internet interface */
        // pylint: disable=global-statement, invalid-name
        TODO: global: _the_interface
        _the_interface = iface
    }
    
    export const SOCK_STREAM = 1
    export const AF_INET = 2
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
    
    export class ESP32SPISocket {
        _buffer: Buffer; /** TODO: type **/
        _socknum: number; /** TODO: type **/
        constructor(family: number = AF_INET, type: number = SOCK_STREAM, proto: number = 0, fileno: any; /** TODO: type **/ = null) {
            if (family != AF_INET) {
                control.fail("Only AF_INET family supported")
            }
            
            if (type != SOCK_STREAM) {
                control.fail("Only SOCK_STREAM type supported")
            }
            
            this._buffer = hex ``
            this._socknum = _the_interface.get_socket()
        }
        
        public connect(address: any; /** TODO: type **/, conntype: any; /** TODO: type **/ = null): any; /** TODO: type **/ {
            /** Connect the socket to the 'address' (which can be 32bit packed IP or
        a hostname string). 'conntype' is an extra that may indicate SSL or not,
        depending on the underlying interface
 */
            const tmp = address
            let host = tmp[0]
            let port = tmp[1]
            if (!_the_interface.socket_connect(this._socknum, host, port, {conn_mode: conntype})) {
                control.fail(`RuntimeError("Failed to connect to host", host)`)
            }
            
            this._buffer = hex ``
        }
        
        // pylint: disable=no-self-use
        public write(data: Buffer): any; /** TODO: type **/ {
            /** Send some data to the socket */
            _the_interface.socket_write(this._socknum, data)
        }
        
        public readline(): any; /** TODO: type **/ {
            /** Attempt to return as many bytes as we can up to but not including '
'
 */
            while (this._buffer.indexOf(hex `0d0a`) < 0) {
                // there's no line already in there, read some more
                let avail = _the_interface.socket_available(this._socknum)
                if (avail) {
                    this._buffer += _the_interface.socket_read(this._socknum, avail)
                }
                
            }
            const tmp = this._buffer.split(hex `0d0a`, 1)
            let firstline = tmp[0]
            this._buffer = tmp[1]
            return firstline
        }
        
        public read(size: number = 0): any; /** TODO: type **/ {
            /** Read up to 'size' bytes from the socket, this may be buffered internally!
        If 'size' isnt specified, return everything in the buffer.
 */
            let avail = _the_interface.socket_available(this._socknum)
            if (avail) {
                this._buffer += _the_interface.socket_read(this._socknum, avail)
            }
            
            // read as much as we can at the moment
            if (size == 0) {
                let ret = this._buffer
                this._buffer = hex ``
                return ret
            }
            
            while (this._buffer.length < size) {
                avail = _the_interface.socket_available(this._socknum)
                if (avail) {
                    this._buffer += _the_interface.socket_read(this._socknum, avail)
                }
                
            }
            ret = this._buffer.slice(0, size)
            this._buffer = this._buffer.slice(size)
            return ret
        }
        
        public close(): any; /** TODO: type **/ {
            /** Close the socket, after reading whatever remains */
            _the_interface.socket_close(this._socknum)
        }
        
    }
    
}