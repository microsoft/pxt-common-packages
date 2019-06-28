namespace esp32spi {
    export class Response {
        socket: Socket
        _cached: Buffer
        status_code: number
        reason: string
        _read_so_far: number
        headers: StringMap

        /** The response from a request, contains all the headers/content */
        constructor(sock: Socket) {
            this.socket = sock
            this._cached = null
            this.status_code = null
            this.reason = null
            this._read_so_far = 0
            this.headers = {}
        }

        public close() {
            /** Close, delete and collect the response data */
            if (this.socket) {
                this.socket.close()
                this.socket = null
            }
            this._cached = null
        }

        get content() {
            /** The HTTP content direct from the socket, as bytes */
            let content_length = parseInt(this.headers["content-length"]) || 0

            // print("Content length:", content_length)
            if (this._cached === null) {
                this._cached = this.socket.read(content_length)
                this.socket.close()
                this.socket = null
            }

            // print("Buffer length:", len(self._cached))
            return this._cached
        }

        /** The HTTP content, encoded into a string according to the HTTP
    header encoding
*/
        get text() {
            return this.content.toString()
        }

        public json() {
            return JSON.parse(this.text)
        }
    }

    export type StringMap = { [v: string]: string; };

    export interface RequestOptions {
        data?: string | Buffer;
        json?: any; // will call JSON.stringify()
        headers?: StringMap;
        stream?: boolean;
        timeout?: number; // in ms
    }

    const _the_interface = esp32spi.ESP_SPIcontrol.instance

    export function dataAsBuffer(data: string | Buffer): Buffer {
        if (data == null)
            return null
        if (typeof data == "string")
            return control.createBufferFromUTF8(data)
        return data
    }


    export function request(method: string, url: string, options: RequestOptions): Response {
        /** Perform an HTTP request to the given url which we will parse to determine
    whether to use SSL ('https://') or not. We can also send some provided 'data'
    or a json dictionary which we will stringify. 'headers' is optional HTTP headers
    sent along. 'stream' will determine if we buffer everything, or whether to only
    read only when requested
     
    */
        // pylint: disable=global-statement, invalid-name
        if (!options.headers) {
            options.headers = {}
        }

        const tmp = url.split("/", 3)
        let proto = tmp[0]
        let host = tmp[2]
        let path = tmp[3] || ""
        // replace spaces in path
        path = path.replace(" ", "%20")

        let port = 0
        if (proto == "http:") {
            port = 80
        } else if (proto == "https:") {
            port = 443
        } else {
            control.fail("Unsupported protocol: " + proto)
        }

        if (host.indexOf(":") >= 0) {
            const tmp = host.split(":", 1)
            host = tmp[0]
            port = parseInt(tmp[1])
        }

        let ipaddr = esp32spi.ESP_SPIcontrol.instance.get_host_by_name(host)

        let sock = new Socket()
        // our response
        let resp = new Response(sock)
        // socket read timeout
        sock.settimeout(options.timeout)



        let conntype = esp32spi.TCP_MODE
        if (proto == "https:") {
            conntype = esp32spi.TLS_MODE
            // for SSL we need to know the host name
            sock.connect(host, port, conntype)
        } else {
            sock.connect(ipaddr, port, conntype)
        }

        sock.write(`${method} /${path} HTTP/1.0\r\n`)

        if (!options.headers["Host"])
            sock.write(`Host: ${options.headers["host"]}\r\n`)

        if (!options.headers["User-Agent"])
            sock.write("User-Agent: MakeCode ESP32\r\n")

        // Iterate over keys to avoid tuple alloc
        for (let k of Object.keys(options.headers))
            sock.write(`${k}: ${options.headers[k]}\r\n`)

        if (options.json != null) {
            control.assert(options.data == null, 100)
            options.data = JSON.stringify(options.json)
            sock.write("Content-Type: application/json\r\n")
        }

        let dataBuf = dataAsBuffer(options.data)

        if (dataBuf)
            sock.write(`Content-Length: ${dataBuf.length}\r\n`)

        sock.write("\r\n")
        if (dataBuf)
            sock.write(dataBuf)

        let line = sock.readline()
        // print(line)
        let line2 = line.split(" ", 2)
        let status = parseInt(line2[1])
        let reason = ""
        if (line2.length > 2) {
            reason = line2[2]
        }

        while (true) {
            line = sock.readline()
            if (!line || line == "\r\n") {
                break
            }

            // print("**line: ", line)
            const tmp = line.split(": ", 1)
            let title = tmp[0]
            let content = tmp[1]
            if (title && content) {
                title = title.toLowerCase()
                content = content.toLowerCase()
                resp.headers[title] = content
            }
        }

        /*

elif line.startswith(b"Location:") and not 200 <= status <= 299:
raise NotImplementedError("Redirects not yet supported")
*/

        if ((resp.headers["transfer-encoding"] || "").indexOf("chunked") >= 0)
            control.fail("not supported chunked encoding")

        resp.status_code = status
        resp.reason = reason
        return resp
    }

    /** Send HTTP HEAD request */
    export function head(url: string, options: RequestOptions) {
        return request("HEAD", url, options)
    }

    /** Send HTTP GET request */
    export function get(url: string, options: RequestOptions) {
        return request("GET", url, options)
    }

    /** Send HTTP POST request */
    export function post(url: string, options: RequestOptions) {
        return request("POST", url, options)
    }

    /** Send HTTP PUT request */
    export function put(url: string, options: RequestOptions) {
        return request("PUT", url, options)
    }

    /** Send HTTP DELETE request */
    export function del(url: string, options: RequestOptions) {
        return request("DELETE", url, options)
    }

}
