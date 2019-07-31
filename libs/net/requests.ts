namespace net {
    export class Response {
        _cached: Buffer
        status_code: number
        reason: string
        _read_so_far: number
        headers: StringMap;

        /** 
         * The response from a request, contains all the headers/content 
         */
        constructor(private socket: Socket) {
            this._cached = null
            this.status_code = null
            this.reason = null
            this._read_so_far = 0
            this.headers = {}
        }

        /** 
         * Close, delete and collect the response data 
         */
        public close() {
            if (this.socket) {
                this.socket.close()
                this.socket = null
            }
            this._cached = null
        }

        /** 
         * The HTTP content direct from the socket, as bytes 
         */
        get content() {
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

        /** 
         * The HTTP content, encoded into a string according to the HTTP header encoding
        */
        get text() {
            return this.content.toString()
        }

        get json() {
            return JSON.parse(this.text)
        }

        public toString() {
            return `HTTP ${this.status_code}; ${Object.keys(this.headers).length} headers; ${this._cached ? this._cached.length : -1} bytes content`
        }
    }

    export interface RequestOptions {
        data?: string | Buffer;
        json?: any; // will call JSON.stringify()
        headers?: StringMap;
        stream?: boolean;
        timeout?: number; // in ms
    }

    export function dataAsBuffer(data: string | Buffer): Buffer {
        if (data == null)
            return null
        if (typeof data == "string")
            return control.createBufferFromUTF8(data)
        return data
    }
}