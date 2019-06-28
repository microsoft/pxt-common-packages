namespace esp32spi {
    export class Net extends net.Net {
        constructor() {
            super();
        }

        connect(host: string, port: number): net.Socket {
            const socket = new Socket()
            socket.connect(host, port);
            return socket;
        }
    }

    export const networkManager = new net.Net;
}