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

        public hostbyName(hostname: string): Buffer {
            return undefined;
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

    let _defaultController: Controller;
    export function defaultController(): Controller {
        if (_defaultController) return _defaultController;

        const cs = pins.pinByCfg(DAL.CFG_PIN_ESP32_CS)
        const busy = pins.pinByCfg(DAL.CFG_PIN_ESP32_BUSY);
        const reset = pins.pinByCfg(DAL.CFG_PIN_ESP32_RESET);
        const gpio0 = pins.pinByCfg(DAL.CFG_PIN_ESP32_GPIO0);
        if (!cs || !busy || !reset)
            return undefined;

        const mosi = pins.pinByCfg(DAL.CFG_PIN_ESP32_MOSI);
        const miso = pins.pinByCfg(DAL.CFG_PIN_ESP32_MISO);
        const sck = pins.pinByCfg(DAL.CFG_PIN_ESP32_SCK);
        if (mosi && miso && sck) {
            const spi = pins.createSPI(mosi, miso, sck);
            if (!spi)
                control.panic(/* PANIC_CODAL_HARDWARE_CONFIGURATION_ERROR = */ 90);
            return _defaultController = new SPIController(spi, cs, busy, reset, gpio0);
        }
        return undefined;
    }
}