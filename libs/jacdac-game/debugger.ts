namespace jacdac.dbg {

    export const JACDAC_ICON = img`
        . . . . . 1 . 1 . . . . . 1 . .
        . . . 1 . . . . . 1 . . . . . 1
        . . . . . f f f f f f f f f f .
        . . . . . f . . . . . . . . f .
        . . . 1 . f . 1 . . . 1 . . f 1
        . . . . . f . . . . . . . . f .
        f f f f f f f . . f f f f f f f
        f 4 4 4 4 4 f . . f 5 5 5 5 5 f
        f 4 f f f 4 f . . f 5 f f f 5 f
        f 4 f d f 4 f . . f 5 f d f 5 f
        f 4 f d f 4 f . . f 5 f d f 5 f
        f 4 f f f 4 f . . f 5 f f f 5 f
        f 4 4 4 4 4 f . . f 5 5 5 5 5 f
        f 4 f 4 f 4 f . . f 5 f 5 f 5 f
        f 4 4 4 4 4 f . . f 5 5 5 5 5 f
        f f f f f f f . . f f f f f f f
        `;

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
        show, JACDAC_ICON);

    scene.systemMenu.addEntry(
        () => jacdac.consoleService().consoleMode == JDConsoleMode.Listen ? "hide jacdac console" : "show jacdac console",
        () => {
            if (jacdac.consoleService().consoleMode == JDConsoleMode.Listen) {
                game.consoleOverlay.setVisible(false);
                jacdac.consoleService().consoleMode = JDConsoleMode.Off;
            }
            else {
                game.consoleOverlay.setVisible(true);
                jacdac.consoleService().consoleMode = JDConsoleMode.Listen;
                console.log(`listening to jacdac...`);
            }
        },
        JACDAC_ICON
    );
}
