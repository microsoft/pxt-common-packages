
function wifiSystemMenu() {
    game.pushScene();
    const wifi = esp32spi.defaultController();
    if (!wifi) {
        game.splash("WiFi module not configured");
        game.popScene();
        return;        
    }

    screen.print("connecting...", 4, 12);
    wifi.connect();

    let accessPoints: net.AccessPoint[];
    let scanning = false;

    function scan() {
        if (!scanning) {
            scanning = true;
            control.runInBackground(() => {                
                accessPoints = wifi.scanNetworks()
                scanning = false;
            });
        }
    }
    controller.A.onEvent(ControllerButtonEvent.Pressed, scan);
    controller.B.onEvent(ControllerButtonEvent.Pressed, () => game.popScene());
    game.onPaint(() => {
        screen.print(wifi.isConnected ? "connected" : "disconnected", 4, 12);
        if (accessPoints) {
            for(let i = 0; i < accessPoints.length; ++i) {
                const ap = accessPoints[i];
                screen.print(`${ap.ssid} ${ap.rssi}`, 4, 12 * (i + 2));
            }
        } else if (scanning) {
            screen.print(`scanning...`, 4, 12 * 2);
        }
    })

    scan();
}

scene.systemMenu.addEntry(
    () => "WiFi",
    wifiSystemMenu,
    img`
    . . . . . . . . . . . . . . . .
    . . . . . . 8 8 8 8 . . . . . .
    . . . . 8 8 8 6 6 6 8 8 . . . .
    . . . 8 6 6 6 6 6 6 6 6 8 . . .
    . . 8 6 6 . . . . . . 6 6 8 . .
    . 8 6 6 . . . . . . . . 6 6 8 .
    8 6 6 . . . 8 8 8 8 . . . 6 6 8
    . 6 . . . 8 6 6 6 6 8 . . . 6 .
    . . . . 8 6 6 6 6 6 6 8 . . . .
    . . . 8 6 6 . . . . 6 6 8 . . .
    . . . . 6 . . . . . . 6 . . . .
    . . . . . . . 8 8 . . . . . . .
    . . . . . . 8 6 6 8 . . . . . .
    . . . . . . 6 6 6 6 . . . . . .
    . . . . . . . 6 6 . . . . . . .
    . . . . . . . . . . . . . . . .
`);