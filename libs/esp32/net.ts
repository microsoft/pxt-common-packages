namespace esp32spi {
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
    new net.Net(defaultController);
}