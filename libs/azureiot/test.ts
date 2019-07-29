interface Secrets {
    connString: string;
    wifi: pxt.StringMap;
}
// this is to be overridden in a separate file
let secrets: Secrets;
function test() {

    const log = console.log;
    const esp = new esp32spi.SPIController(pins.spi(),
        pins.D13, pins.D11, pins.D12, pins.D10, 1)

    if (esp.status != esp32spi.WL_IDLE_STATUS)
        return

    log(`Firmware vers. ${esp.firmwareVersion}`)
    log(`MAC addr: ${esp.MACaddress.toHex()}`)
    log("Temp: " + esp.getTemperature())

    const networks = esp.scanNetworks()

    log(JSON.stringify(secrets.wifi))

    for (const ap of networks)
        log(`\t${ap.ssid}\t\tRSSI: ${ap.rssi}`)

    for (let k of Object.keys(secrets.wifi)) {
        if (networks.some(n => n.ssid == k)) {
            log("connecting to " + k)
            esp.connectAP(k, secrets.wifi[k])
            break
        }
    }

    if (!esp.isConnected) {
        log("can't connect")
        return
    }

    log("ping: " + esp.ping("bing.com"))

    azureiot.network = new esp32spi.NetTLS()
    azureiot.connString = secrets.connString
    azureiot.connect()
    log("mqtt connected")

    azureiot.onMessageReceived((msg) => {
        log("MSG:" + JSON.stringify(msg))
    })

    azureiot.onMethod("echo", msg => {
        log("ECHO " + msg.displayedValue)
        msg.type = "echo"
        return {}
    })
}

test();