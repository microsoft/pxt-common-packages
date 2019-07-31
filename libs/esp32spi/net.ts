namespace esp32spi {
    export class Controller {
        constructor() {}        

        public socket(): number {
            return -1;
        }

        public socketConnect(socket_num: number, dest: string | Buffer, port: number, conn_mode = TCP_MODE): boolean {
            return false;
        }

        public socketWrite(socket_num: number, buffer: Buffer): void {
        }

        public socketAvailable(socket_num: number): number {
            return -1;
        }

        public socketRead(socket_num: number, size: number): Buffer {
            return undefined;
        }

        public socketClose(socket_num: number): void {
        }
    }

    export class NetTLS extends net.Net {
        constructor(public controller: Controller) {
            super();
        }

        createSocket(host: string, port: number): net.Socket {
            const socket = new Socket(this.controller, host, port, TLS_MODE);
            return socket;
        }
    }
}