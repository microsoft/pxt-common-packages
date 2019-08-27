function test() {

    const log = console.log;
    const esp = new esp32spi.SPIController(pins.spi(),
        pins.D13, pins.D11, pins.D12, pins.D10, 1)

    if (!esp.isIdle)
        return

    log(`Firmware vers. ${esp.firmwareVersion}`)
    log(`MAC addr: ${esp.MACaddress.toHex()}`)
    log("Temp: " + esp.getTemperature())

    if (!esp.connect()) {
        log("can't connect")
        return
    }

    log("ping: " + esp.ping("bing.com"))
}

test();