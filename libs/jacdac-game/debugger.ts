namespace jacdac.dbg {

    enum Mode {
        None,
        Services,
        Devices
    }

    class DebugMenu {
        private started: boolean;
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
            // populate know list of drivers
            console.log(`address class status serial`);
            console.log(`c(lient),s(service)`)
            console.log(`b(roadcast),f(sniffer)`)
            console.log(`i(connecting),c(connected)`);
            console.log(`d(isconnected)`);
            console.log(`p(aired),g(pairing)`);

            const devices = jacdac.devices();
            console.log(`${devices.length} devices (${jacdac.isConnected() ? "connected" : "disconnected"})`)
            devices.forEach(device => {
                const services = device.services;
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
            if (!this.started) return;
            this.started = false;

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
            controller.A.onEvent(ControllerButtonEvent.Pressed, () => {
                const consoleService = jacdac.consoleService();
                if (consoleService.consoleMode == JDConsoleServiceMode.Listen) {
                    consoleService.consoleMode = JDConsoleServiceMode.Off;
                    console.log(`jacdac console off`);
                } else {
                    consoleService.consoleMode = JDConsoleServiceMode.Listen;
                    console.log(`jacdac console on`);
                }
            })
            controller.B.onEvent(ControllerButtonEvent.Pressed, () => {
                stop();
                // done
                if (_menu) {
                    _menu.stop();
                    _menu = undefined;
                }
            })

            game.consoleOverlay.setVisible(true);
            console.log(`jacdac dashboard`);
            console.log(` LEFT for services`)
            console.log(` RIGHT for devices`)
            console.log(` A console on/off`)
            console.log(` B for exit`)
            this.refresh();
        }
    }

    let _menu: DebugMenu;
    /**
     * Shows a basic debugger interface
     */
    export function show() {
        if (_menu)
            _menu.stop();
        _menu = new DebugMenu();
        _menu.start();
    }

    scene.systemMenu.addEntry(
        () => "jacdac dashboard",
        show, false, () => { });
}
