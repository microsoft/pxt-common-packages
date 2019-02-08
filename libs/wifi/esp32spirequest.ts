namespace wifi {
    // The MIT License (MIT)
    // Copyright (c) 2019 Paul Sokolovsky & ladyada for Adafruit Industries
    // Permission is hereby granted, free of charge, to any person obtaining a copy
    // of this software and associated documentation files (the "Software"), to deal
    // in the Software without restriction, including without limitation the rights
    // to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    // copies of the Software, and to permit persons to whom the Software is
    // furnished to do so, subject to the following conditions:
    // The above copyright notice and this permission notice shall be included in
    // all copies or substantial portions of the Software.
    // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    // IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    // FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    // AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    // LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    // OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
    // THE SOFTWARE.
    /** 
`adafruit_esp32spi_requests`
================================================================================
A requests-like library for web interfacing


* Author(s): ladyada, Paul Sokolovsky

Implementation Notes
--------------------

Adapted from https://github.com/micropython/micropython-lib/tree/master/urequests

micropython-lib consists of multiple modules from different sources and
authors. Each module comes under its own licensing terms. Short name of
a license can be found in a file within a module directory (usually
metadata.txt or setup.py). Complete text of each license used is provided
at https://github.com/micropython/micropython-lib/blob/master/LICENSE

author='Paul Sokolovsky'
license='MIT'

 */
    // pylint: disable=no-name-in-module
    // pylint: disable=invalid-name
    let _the_interface = null
    export function set_interface(iface: any; /** TODO: type **/): any; /** TODO: type **/ {
        /** Helper to set the global internet interface */
        // pylint: disable=invalid-name, global-statement
        TODO: global: _the_interface
        _the_interface = iface
        adafruit_esp32spi.adafruit_esp32spi_socket.set_interface(iface)
    }
    
    export class Response {
        socket: adafruit_esp32spi.adafruit_esp32spi_socket.socket
        _cached: any; /** TODO: type **/
        status_code: number
        reason: string
        /** The response from a request, contains all the headers/content */
        static headers =  {TODO: Dict} 
        static encoding = null
        constructor(socket: adafruit_esp32spi.adafruit_esp32spi_socket.socket) {
            this.socket = socket
            this.encoding = "utf-8"
            this._cached = null
            this.status_code = null
            this.reason = null
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
            return ujson.loads(this.content)
        }
        
    }
    
    // pylint: disable=too-many-branches, too-many-statements, unused-argument, too-many-arguments, too-many-locals
    export function request(method: string, url: any; /** TODO: type **/, data: any; /** TODO: type **/ = null, json: any; /** TODO: type **/ = null, headers: Buffer[] = null, stream: any; /** TODO: type **/ = null): adafruit_esp32spi.adafruit_esp32spi_requests.Response {
        /** Perform an HTTP request to the given url which we will parse to determine
    whether to use SSL ('https://') or not. We can also send some provided 'data'
    or a json dictionary which we will stringify. 'headers' is optional HTTP headers
    sent along. 'stream' is unused in this implementation
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
        
        let addr_info = adafruit_esp32spi.adafruit_esp32spi_socket.getaddrinfo(host, port, 0, adafruit_esp32spi.adafruit_esp32spi_socket.SOCK_STREAM)[0]
        let sock = new adafruit_esp32spi.adafruit_esp32spi_socket.socket(addr_info[0], addr_info[1], addr_info[2])
        // our response
        let resp = new adafruit_esp32spi.adafruit_esp32spi_requests.Response(sock)
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
                sock.write(k)
                sock.write(hex `3a20`)
                sock.write(headers[k])
                sock.write(hex `0d0a`)
            }
            if (json !== null) {
                control.assert(data === null)
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
        catch (_/* instanceof OSError */) {
            sock.close()
            throw
        }
        
        resp.status_code = status
        resp.reason = reason
        return resp
    }
    
    // pylint: enable=too-many-branches, too-many-statements, unused-argument
    // pylint: enable=too-many-arguments, too-many-locals
    export function head(url: any; /** TODO: type **/, TODO **kw): adafruit_esp32spi.adafruit_esp32spi_requests.Response {
        /** Send HTTP HEAD request */
        return request("HEAD", url)
    }
    
    export function get(url: any; /** TODO: type **/, TODO **kw): adafruit_esp32spi.adafruit_esp32spi_requests.Response {
        /** Send HTTP GET request */
        return request("GET", url)
    }
    
    export function post(url: any; /** TODO: type **/, TODO **kw): adafruit_esp32spi.adafruit_esp32spi_requests.Response {
        /** Send HTTP POST request */
        return request("POST", url)
    }
    
    export function put(url: any; /** TODO: type **/, TODO **kw): adafruit_esp32spi.adafruit_esp32spi_requests.Response {
        /** Send HTTP PUT request */
        return request("PUT", url)
    }
    
    export function patch(url: any; /** TODO: type **/, TODO **kw): adafruit_esp32spi.adafruit_esp32spi_requests.Response {
        /** Send HTTP PATCH request */
        return request("PATCH", url)
    }
    
    export function delete_(url: any; /** TODO: type **/, TODO **kw): adafruit_esp32spi.adafruit_esp32spi_requests.Response {
        /** Send HTTP DELETE request */
        return request("DELETE", url)
    }
    
}
