namespace jacdac {

    enum Mode {
        None,
        Services,
        Devices
    }

    class DebugMenu {
        private mode: Mode;
        private consoleVisible: boolean;
        constructor() {
            this.mode = Mode.None;
            this.consoleVisible = game.consoleOverlay.isVisible();
            jacdac.debugger.registerDebugViews();
        }

        showServices() {
            this.renderServices();
        }

        renderServices() {
            const errors = [
                "ok",
                "cal ing",
                "cal req",
                "no res",
                "busy",
                "comms err",
                "inv state",
                "periph mal"
            ];

            // populate know list of drivers
            console.log(`address class status serial`);
            console.log(`c(lient),s(service)`)
            console.log(`b(roadcast),f(sniffer)`)
            console.log(`i(connecting),c(connected)`);
            console.log(`d(isconnected)`);
            console.log(`p(aired),g(pairing)`);

            const devices = jacdac.devices();
            console.log(`${devices.length} devices (${jacdac.isConnected() ? "connected" : "disconected"} ${this.state()})`)
            devices.forEach(device => {
                const services = d.services;
                services.forEach(service => {
                    const serviceClass = service.service_class;
                    const dbgView = jacdac.debugger.debugView(serviceClass);
                    let driverName = dbgView ? dbgView.name : serviceClass.toString();
                    while (driverName.length < 8) driverName += " ";
                    let flags = "";
                    while (flags.length < 4) flags += " ";
                    console.log(`${device} ${flags} ${dbgView}`);
                })
            })
            console.log("");
        }

        showDevices() {
            const devices = jacdac.devices();
            console.log(`${devices.length} devices`)
            devices.forEach(d => console.log(d.toString()));
            console.log("");
        }

        refresh() {
            if (!jacdac.isConnected())
                console.log(`disconnected`);
            switch (this.mode) {
                case Mode.Services: this.showServices(); break;
                case Mode.Devices: this.showDevices(); break;
            }
        }

        stop() {
            game.popScene();
            game.consoleOverlay.setVisible(this.consoleVisible);
        }

        start() {
            game.pushScene();
            controller.left.onEvent(ControllerButtonEvent.Pressed, () => {
                this.mode = Mode.Services;
                game.consoleOverlay.clear();
                this.refresh();
            })
            controller.right.onEvent(ControllerButtonEvent.Pressed, () => {
                this.mode = Mode.Devices;
                game.consoleOverlay.clear();
                this.refresh();
            })
            controller.B.onEvent(ControllerButtonEvent.Pressed, () => {
                // done
                if (_menu) {
                    _menu.stop();
                    _menu = undefined;
                }
            })

            game.consoleOverlay.setVisible(true);
            console.log(`jacdac dashboard`);
            console.log(` LEFT for drivers`)
            console.log(` RIGHT for devices`)
            console.log(` B for exit`)
            this.refresh();
        }
    }

    let _menu: DebugMenu;
    scene.systemMenu.addEntry(() => "jacdac dashboard", () => {
        _menu = new DebugMenu();
        _menu.start();
    }, false, () => { });
}
