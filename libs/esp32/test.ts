function test() {

    const log = console.log;
    const esp = net.instance().controller()

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