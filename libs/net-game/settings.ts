namespace net {
    class Configurator {
        private accessPoints: net.AccessPoint[];
        private apIndex: number;
        private scanning: boolean;
        private wifi: net.Controller;

        constructor() {
            this.scanning = false;
            this.apIndex = 0;
        }

        private select() {
            const ap = this.accessPoints && this.accessPoints[this.apIndex];
            if (ap) {
                const wifis = net.knownAccessPoints();
                const known = wifis[ap.ssid] !== undefined ? "*" : "?";
                console.log(`${known} ${ap.ssid}`);
            }
        }

        private connect() {
            console.log("connecting...")
            this.wifi.connect();
            console.log(this.wifi.isConnected ? `connected to ${this.wifi.ssid}` : `disconnected`);
            if (this.wifi.isConnected) {
                for (let i = 0; i < 3; ++i) {
                    const ping = this.wifi.ping("bing.com")
                    console.log(`bing.com ping ${ping}ms`);
                }
            }
        }

        private scan() {
            if (this.scanning) return;

            this.scanning = true;
            const mac = this.wifi.MACaddress;
            console.log(`MAC: ${mac ? mac.toHex() : "???"}`)
            console.log("scanning...")
            control.runInBackground(() => {
                this.accessPoints = this.wifi.scanNetworks()
                if (this.accessPoints && this.accessPoints.length) {
                    const wifis = net.knownAccessPoints();
                    for (let i = 0; i < this.accessPoints.length; ++i) {
                        const ap = this.accessPoints[i];
                        const known = wifis[ap.ssid] !== undefined ? "*" : "?";
                        console.log(` ${known} ${ap.ssid}`);
                    }
                    console.log(" ");
                    this.apIndex = 0;
                    console.log("*: AP known")
                    console.log("up/down: select AP")
                    console.log("left: erase AP info")
                    console.log("right: enter AP password")
                    console.log("A: connect")
                    console.log(" ");
                    this.select();
                }
                this.scanning = false;
            });
        }

        main() {
            this.wifi = net.instance().controller;
            if (!this.wifi) {
                console.log("WiFi module not configured");
                return;
            }
            pauseUntil(() => this.wifi.isIdle, 30000);
            if (!this.wifi.isIdle) {
                console.log("WiFi module not responding")
                return;
            }
            controller.up.onEvent(ControllerButtonEvent.Pressed, () => {
                this.apIndex = this.apIndex + 1;
                if (this.accessPoints)
                    this.apIndex = this.apIndex % this.accessPoints.length;
                this.select();
            })
            controller.down.onEvent(ControllerButtonEvent.Pressed, () => {
                this.apIndex = this.apIndex - 1;
                this.apIndex = (this.apIndex + this.accessPoints.length) % this.accessPoints.length;
                this.select();
            })
            controller.left.onEvent(ControllerButtonEvent.Pressed, () => {
                const ap = this.accessPoints && this.accessPoints[this.apIndex];
                if (!ap) return;
                net.updateAccessPoint(ap.ssid, undefined);
                console.log(`password erased`)
                this.scan();
            })
            controller.right.onEvent(ControllerButtonEvent.Pressed, () => {
                const ap = this.accessPoints && this.accessPoints[this.apIndex];
                if (!ap) return;
                game.consoleOverlay.setVisible(false);
                const pwd = game.askForString(`password for ${ap.ssid}`, 24);
                game.consoleOverlay.setVisible(true);
                net.updateAccessPoint(ap.ssid, pwd);
                console.log(`password saved`)
                this.scan();
            })
            controller.A.onEvent(ControllerButtonEvent.Pressed, () => {
                this.connect();
            })
            controller.B.onEvent(ControllerButtonEvent.Pressed, () => {
                game.popScene();
                game.consoleOverlay.setVisible(false);
            });
            this.scan();
        }
    }

    function wifiSystemMenu() {
        scene.systemMenu.closeMenu();
        game.pushScene();
        game.consoleOverlay.setVisible(true);
        console.log("WiFi configuration")
        const config = new Configurator();
        config.main()
    }

    scene.systemMenu.addEntry(
        () => "WiFi",
        () => wifiSystemMenu(),
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
}