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
        }

        showServices() {
            this.renderServices();
        }

        renderServices() {
            const devices = jacdac.devices();
            console.log(`${devices.length} devices (${jacdac.isConnected() ? "connected" : "disconnected"})`)
            devices.forEach(device => {
                const services = device.services;
                services.forEach(service => {
                    const serviceClass = service.service_class;
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
