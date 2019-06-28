namespace esp32spi {
    export class Net extends net.Net {
        constructor() {
            super();
        }

        createSocket(host: string, port: number): net.Socket {
            const socket = new Socket(host, port);
            return socket;
        }
    }
}