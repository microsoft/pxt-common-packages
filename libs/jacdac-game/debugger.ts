namespace jacdac.dbg {

    export const JACDAC_DEBUG_ICON = img`
        . . . . . c . . . . c . . 1 . .
        . . . 1 . . c c c c . . . . . 1
        . f f f f f 5 c c 5 f f f f f .
        . f . . . . c c c c . . . . f .
        . f . 1 . c . . . . c 1 . . f 1
        . f . . . . . . . . . . . . f .
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

    export const JACDAC_CONSOLE_ICON = img`
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
        private debugFont: image.Font;
        private marginx: number;
        private marginy: number;

        constructor() {
            this.debugFont = image.font5;
            this.marginy = 2;
            this.marginx = 4;
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

        makeDiagnostic(label:string, value:string, horizontalOffset: number, color: number, barHeight: number)
        {
            const charCount = Math.max(value.length, label.length)
            let size = this.debugFont.charWidth * charCount + this.marginx
            screen.fillRect(horizontalOffset,screen.height - barHeight,size, barHeight,color);

            screen.print(label, (this.marginx / 2) + horizontalOffset, screen.height - barHeight + this.marginy, 1, this.debugFont);
            screen.print(value, (this.marginx / 2) + horizontalOffset, screen.height - (this.debugFont.charHeight + (2 * this.marginy)), 1, this.debugFont);

            horizontalOffset += size + 1

            return horizontalOffset;
        }

        paintDiagnosticsBar(){
            const diag = jacdac.diagnostics();
            let background = 1
            if (diag.bus_state)
                background = 2
            const height = 2 * (this.debugFont.charHeight + (2 * this.marginy))
            screen.fillRect(0, screen.height - height, screen.width, height, background);
            const errorCount = diag.bus_lo_error + diag.bus_uart_error + diag.bus_timeout_error;

            let horiz = 1;
            horiz = this.makeDiagnostic("TX", diag.packets_sent.toString(), horiz, 6, height);
            horiz = this.makeDiagnostic("RX", diag.packets_received.toString(), horiz, 7, height);
            horiz = this.makeDiagnostic("DR", diag.packets_dropped.toString(),horiz, 2, height);
            horiz = this.makeDiagnostic("ERR", errorCount.toString(),horiz, 2, height);

            return height
        }

        showDevices() {
            const devices = jacdac.devices();
            console.log(`${devices.length} devices`)
            devices.forEach(d => console.log(d.toString()));
            console.log("");
        }

        refresh() {
            let verticalOffset = this.paintDiagnosticsBar()
            if (!jacdac.isConnected())
                screen.print("disconnected", this.marginx, verticalOffset, 4, this.debugFont);
            switch (this.mode) {
                case Mode.Services: this.showServices(); break;
                case Mode.Devices: this.showDevices(); break;
            }
        }

        stop() {
            if (!this.started) return;
            this.started = false;

            game.popScene();
            game.consoleOverlay.setVisible(false);

            // controller._setUserEventsEnabled(true);
        }

        start() {
            game.pushScene();
            // controller._setUserEventsEnabled(false);
            game.onShade(() => {
                this.paintDiagnosticsBar();
            });
            controller.left.onEvent(SYSTEM_KEY_DOWN, () => {
                this.mode = Mode.Services;
                game.consoleOverlay.clear();
                this.refresh();
            })
            controller.right.onEvent(SYSTEM_KEY_DOWN, () => {
                this.mode = Mode.Devices;
                game.consoleOverlay.clear();
                this.refresh();
            })
            controller.B.onEvent(SYSTEM_KEY_DOWN, () => {
                // done
                if (_menu) {
                    _menu.stop();
                    _menu = undefined;
                }
            })

            game.consoleOverlay.setVisible(true);
            // console.log(`jacdac dashboard`);
            // console.log(` LEFT for services`)
            // console.log(` RIGHT for devices`)
            // console.log(` A console on/off`)
            // console.log(` B for exit`)
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
        show, JACDAC_DEBUG_ICON);

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
        JACDAC_CONSOLE_ICON
    );
}
