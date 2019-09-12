namespace esp32spi {
    export class Esp32Net extends net.Net {
        constructor() {
            super();
        }

        get controller(): SPIController {
            return defaultController();
        }

        createSocket(host: string, port: number, secure: boolean): net.Socket {
            const c = this.controller;
            if (!c) return undefined;
            const socket = new net.ControllerSocket(c, host, port, secure ? net.TLS_MODE : net.TCP_MODE);
            return socket;
        }
        hostByName(host: string): string {
            const c= this.controller;
            if (c) {
                const b = c.hostbyName(host);
                if (b) 
                    return b.toString();
            }

            return undefined;
        }
    }

    let _defaultController: SPIController;
    function defaultController(): SPIController {
        if (_defaultController) return _defaultController;

        const cs = pins.pinByCfg(DAL.CFG_PIN_WIFI_CS)
        const busy = pins.pinByCfg(DAL.CFG_PIN_WIFI_BUSY);
        const reset = pins.pinByCfg(DAL.CFG_PIN_WIFI_RESET);
        const gpio0 = pins.pinByCfg(DAL.CFG_PIN_WIFI_GPIO0);
        if (!cs || !busy || !reset) {
            control.dmesg(`cs ${!!cs} busy ${!!busy} reset ${!!reset}`)
            return undefined;
        }

        const mosi = pins.pinByCfg(DAL.CFG_PIN_WIFI_MOSI);
        const miso = pins.pinByCfg(DAL.CFG_PIN_WIFI_MISO);
        const sck = pins.pinByCfg(DAL.CFG_PIN_WIFI_SCK);
        let spi: SPI;
        if (!mosi && !miso && !sck) {
            spi = pins.spi();
        } else if (mosi && miso && sck) {
            spi = pins.createSPI(mosi, miso, sck);
        }
        if (!spi)
            control.panic(control.PXT_PANIC.CODAL_HARDWARE_CONFIGURATION_ERROR);
        return _defaultController = new SPIController(spi, cs, busy, reset, gpio0);
    }

    // initialize net
    new Esp32Net();
}