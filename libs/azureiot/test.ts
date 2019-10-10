function test() {

    const log = console.log;
    const esp = net.instance().controller();

    if (!esp.connect()) {
        log("can't connect")
        return
    }

    log("ping: " + esp.ping("bing.com"))

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