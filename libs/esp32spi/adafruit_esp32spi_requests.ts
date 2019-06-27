namespace esp32spi {
    export class Response {
        socket: any; /** TODO: type **/
        _cached: any; /** TODO: type **/
        status_code: number
        reason: string
        _read_so_far: number
        headers: any; /** TODO: type **/
        /** The response from a request, contains all the headers/content */
        static encoding = null
        constructor(sock: any; /** TODO: type **/) {
            this.socket = sock
            this.encoding = "utf-8"
            this._cached = null
            this.status_code = null
            this.reason = null
            this._read_so_far = 0
            this.headers =  {TODO: Dict} 
        }
        
        private __enter__(): adafruit_esp32spi_requests.Response {
            return this
        }
        
        private __exit__(exc_type: any; /** TODO: type **/, exc_value: any; /** TODO: type **/, traceback: any; /** TODO: type **/): any; /** TODO: type **/ {
            this.close()
        }
        
        public close(): any; /** TODO: type **/ {
            /** Close, delete and collect the response data */
            if (this.socket) {
                this.socket.close()
                TODO: Delete
            }
            
            TODO: Delete
            gc.collect()
        }
        
        get content(): any; /** TODO: type **/ {
            /** The HTTP content direct from the socket, as bytes */
            // print(self.headers)
            try {
                let content_length = Math.trunc(this.headers["content-length"])
            }
            catch (_/* instanceof KeyError */) {
                content_length = 0
            }
            
            // print("Content length:", content_length)
            if (this._cached === null) {
                try {
                    this._cached = this.socket.read(content_length)
                }
                finally {
                    this.socket.close()
                    this.socket = null
                }
                
            }
            
            // print("Buffer length:", len(self._cached))
            return this._cached
        }
        
        get text(): any; /** TODO: type **/ {
            /** The HTTP content, encoded into a string according to the HTTP
        header encoding
 */
            return str(this.content, this.encoding)
        }
        
        public json(): any; /** TODO: type **/ {
            /** The HTTP content, parsed into a json dictionary */
            try {
            }
            catch (_/* instanceof ImportError */) {
            }
            
            return ujson.loads(this.content)
        }
        
        public iter_content(chunk_size: number = 1, decode_unicode: boolean = false): any; /** TODO: type **/ {
            /** An iterator that will stream data by only reading 'chunk_size'
        bytes and yielding them, when we can't buffer the whole datastream
 */
            if (decode_unicode) {
                control.fail("Unicode not supported")
            }
            
            while (true) {
                let chunk = this.socket.read(chunk_size)
                if (chunk) {
                     {TODO: Yield} 
                } else {
                    return
                }
                
            }
        }
        
    }
    
    // pylint: disable=too-many-branches, too-many-statements, unused-argument, too-many-arguments, too-many-locals
    export function request(method: string, url: any; /** TODO: type **/, data: any; /** TODO: type **/ = null, json: any; /** TODO: type **/ = null, headers: number[] = null, stream: boolean = false, timeout: number = 1): adafruit_esp32spi_requests.Response {
        /** Perform an HTTP request to the given url which we will parse to determine
    whether to use SSL ('https://') or not. We can also send some provided 'data'
    or a json dictionary which we will stringify. 'headers' is optional HTTP headers
    sent along. 'stream' will determine if we buffer everything, or whether to only
    read only when requested
    
 */
        // pylint: disable=global-statement, invalid-name
        TODO: global: _the_interface
        if (!headers) {
            headers =  {TODO: Dict} 
        }
        
        try {
            const tmp = url.split("/", 3)
            let proto = tmp[0]
            let dummy = tmp[1]
            let host = tmp[2]
            let path = tmp[3]
            // replace spaces in path
            path = path.replace(" ", "%20")
        }
        catch (_/* instanceof ValueError */) {
            const tmp = url.split("/", 2)
            proto = tmp[0]
            dummy = tmp[1]
            host = tmp[2]
            path = ""
        }
        
        if (proto == "http:") {
            let port = 80
        } else if (proto == "https:") {
            port = 443
        } else {
            control.fail("Unsupported protocol: " + proto)
        }
        
        if (host.indexOf(":") >= 0) {
            const tmp = host.split(":", 1)
            host = tmp[0]
            port = tmp[1]
            port = Math.trunc(port)
        }
        
        let addr_info = esp32spi_socket.getaddrinfo(host, port, 0, esp32spi_socket.SOCK_STREAM)[0]
        let sock = esp32spi_socket.socket(addr_info[0], addr_info[1], addr_info[2])
        // our response
        let resp = new adafruit_esp32spi_requests.Response(sock)
        // socket read timeout
        sock.settimeout(timeout)
        try {
            if (proto == "https:") {
                let conntype = _the_interface.TLS_MODE
                // for SSL we need to know the host name
                sock.connect([host, port], conntype)
            } else {
                conntype = _the_interface.TCP_MODE
                sock.connect(addr_info[-1], conntype)
            }
            
            sock.write(hex `2573202f257320485454502f312e300d0a` % [method, path])
            if (headers.indexOf("Host") < 0) {
                sock.write(hex `486f73743a2025730d0a` % host)
            }
            
            if (headers.indexOf("User-Agent") < 0) {
                sock.write(hex `557365722d4167656e743a2041646166727569742043697263756974507974686f6e0d0a`)
            }
            
            // Iterate over keys to avoid tuple alloc
            for (let k of headers) {
                sock.write(k.encode())
                sock.write(hex `3a20`)
                sock.write(headers[k].encode())
                sock.write(hex `0d0a`)
            }
            if (json !== null) {
                control.assert(data === null)
                try {
                }
                catch (_/* instanceof ImportError */) {
                }
                
                data = ujson.dumps(json)
                sock.write(hex `436f6e74656e742d547970653a206170706c69636174696f6e2f6a736f6e0d0a`)
            }
            
            if (data) {
                sock.write(hex `436f6e74656e742d4c656e6774683a2025640d0a` % data.length)
            }
            
            sock.write(hex `0d0a`)
            if (data) {
                sock.write(pins.createBufferFromArray(data, "utf-8"))
            }
            
            let line = sock.readline()
            // print(line)
            line = line.split(null, 2)
            let status = Math.trunc(line[1])
            let reason = ""
            if (line.length > 2) {
                reason = line[2].rstrip()
            }
            
            while (true) {
                line = sock.readline()
                if (!line || line == hex `0d0a`) {
                    break
                }
                
                // print("**line: ", line)
                const tmp = line.split(hex `3a20`, 1)
                let title = tmp[0]
                let content = tmp[1]
                if (title && content) {
                    title = str(title.lower(), "utf-8")
                    content = str(content, "utf-8")
                    resp.headers[title] = content
                }
                
                if (line.startswith(hex `5472616e736665722d456e636f64696e673a`)) {
                    if (line.indexOf(hex `6368756e6b6564`) >= 0) {
                        control.fail("Unsupported " + line)
                    }
                    
                } else if (line.startswith(hex `4c6f636174696f6e3a`) && !(200 <= status && status <= 299)) {
                    control.fail("Redirects not yet supported")
                }
                
            }
        }
        catch (_) {
            sock.close()
            throw
        }
        
        resp.status_code = status
        resp.reason = reason
        return resp
    }
    
    // pylint: enable=too-many-branches, too-many-statements, unused-argument
    // pylint: enable=too-many-arguments, too-many-locals
    export function head(url: any; /** TODO: type **/, TODO **kw): adafruit_esp32spi_requests.Response {
        /** Send HTTP HEAD request */
        return request("HEAD", url)
    }
    
    export function get(url: any; /** TODO: type **/, TODO **kw): adafruit_esp32spi_requests.Response {
        /** Send HTTP GET request */
        return request("GET", url)
    }
    
    export function post(url: any; /** TODO: type **/, TODO **kw): adafruit_esp32spi_requests.Response {
        /** Send HTTP POST request */
        return request("POST", url)
    }
    
    export function put(url: any; /** TODO: type **/, TODO **kw): adafruit_esp32spi_requests.Response {
        /** Send HTTP PUT request */
        return request("PUT", url)
    }
    
    export function patch(url: any; /** TODO: type **/, TODO **kw): adafruit_esp32spi_requests.Response {
        /** Send HTTP PATCH request */
        return request("PATCH", url)
    }
    
    export function delete_(url: any; /** TODO: type **/, TODO **kw): adafruit_esp32spi_requests.Response {
        /** Send HTTP DELETE request */
        return request("DELETE", url)
    }
    
}
