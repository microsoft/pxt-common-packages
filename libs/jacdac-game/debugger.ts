namespace jacdac {

    enum Mode {
        None,
        Drivers,
        Devices,
        Packets,
        Players
    }

    class DebugMenu {
        private mode: Mode;
        private _debugViews: DebugView[];
        constructor() {
            this.mode = Mode.None;
            this._debugViews = undefined;
        }
        get debugViews(): DebugView[] {
            if (!this._debugViews) {
                this._debugViews = jacdac.defaultDebugViews();
                this._debugViews.push(jacdac.GameLobbyDriver.debugView())
            }
            return this._debugViews;
        }

        showDrivers() {
            jacdac.clearBridge();
            this.renderDrivers();
        }

        renderDrivers() {
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

            let drivers = jacdac.drivers();
            drivers = drivers.slice(1, drivers.length);
            console.log(`${drivers.length} drivers (${jacdac.isConnected() ? "connected" : "disconected"})`)
            drivers.forEach(d => {
                const driverClass = d.driverClass;
                const dbgView = this.debugViews.find(d => driverClass == d.driverClass);
                let driverName = dbgView ? dbgView.name : driverClass.toString();
                while (driverName.length < 4) driverName += " ";
                let flags = "";
                if (d.isVirtualDriver())
                    flags += "c";
                else if (d.isHostDriver())
                    flags += "s";
                else if (d.isBroadcastDriver())
                    flags += "b";
                else if (d.isSnifferDriver())
                    flags += "f";
                if (d.isPaired())
                    flags += "p";
                else if (d.isPairing())
                    flags += "g";
                if (d.isConnecting())
                    flags += "i"
                else if (d.isConnected())
                    flags += "c"
                else
                    flags += "d";
                while (flags.length < 4) flags += " ";
                console.log(`${toHex8(d.address)} ${driverName} ${flags} ${toHex(d.serialNumber)}`);
                const err = d.error;
                if (err != JDDriverErrorCode.DRIVER_OK)
                    console.log(` e ${errors[<number>err] || err}`);
            })
            console.log("");
        }

        showDevices() {
            jacdac.clearBridge();
            const drivers = jacdac.drivers();
            let serials: any = {};
            drivers.filter(d => !!d.serialNumber).forEach(d => {
                const sn = toHex(d.serialNumber)
                if (!serials[sn]) {
                    serials[sn] = d;
                }
            })
            const devs = Object.keys(serials);
            console.log(`${devs.length} devices`)
            devs.forEach(d => console.log(`${d}`));
            console.log("");
        }

        private _logAllDriver: LogAllDriver;
        showPackets() {
            if (!this._logAllDriver) 
                this._logAllDriver = new LogAllDriver(this.debugViews);
            this._logAllDriver.start();
        }

        showPlayers() {
            jacdac.clearBridge();
            console.log(`game state: ${["alone", "service", "client"][jacdac.gameLobby.state]}`);
            const players = jacdac.gameLobby.players;
            for (let i = 0; i < players.length; ++i) {
                const pa = players[i];
                console.log(`  ${toHex8(pa)}`);
            }
            /*
            players.forEach(player => {
                let r = "";
                const state = player.data[0];
                r += (state & (1 << controller.A.id)) ? "A" : "-";
                r += (state & (1 << controller.B.id)) ? "B" : "-";
                r += (state & (1 << controller.left.id)) ? "L" : "-";
                r += (state & (1 << controller.up.id)) ? "U" : "-";
                r += (state & (1 << controller.right.id)) ? "R" : "-";
                r += (state & (1 << controller.down.id)) ? "D" : "-";
                console.log(` ${toHex8(player.address)}: ${r}`)
            })
            */
        }

        refresh() {
            if (!jacdac.isConnected())
                console.log(`disconnected`);
            switch (this.mode) {
                case Mode.Drivers: this.showDrivers(); break;
                case Mode.Devices: this.showDevices(); break;
                case Mode.Packets: this.showPackets(); break;
                case Mode.Players: this.showPlayers(); break;
            }
        }

        stop() {
            clearBridge()
            if (this._logAllDriver) {
                this._logAllDriver.stop();
                this._logAllDriver = undefined;
            }
            this._debugViews = undefined;
        }

        start() {
            game.pushScene(); // start game
            jacdac.onEvent(JDEvent.BusConnected, () => {
                game.consoleOverlay.clear();
                console.log(`connected`)
                this.refresh()
            });
            jacdac.onEvent(JDEvent.BusDisconnected, () => {
                game.consoleOverlay.clear();
                console.log(`disconnected`)
                this.refresh()
            });
            jacdac.onEvent(JDEvent.DriverChanged, () => {
                console.log(`driver changed`)
                if (this.mode == Mode.Packets) {
                    this.renderDrivers();
                } else
                    game.consoleOverlay.clear();
                this.refresh()
            });
            controller.left.onEvent(ControllerButtonEvent.Pressed, function () {
                this.mode = Mode.Drivers;
                game.consoleOverlay.clear();
                this.refresh();
            })
            controller.right.onEvent(ControllerButtonEvent.Pressed, function () {
                this.mode = Mode.Devices;
                game.consoleOverlay.clear();
                this.refresh();
            })
            controller.down.onEvent(ControllerButtonEvent.Pressed, function () {
                this.mode = Mode.Packets;
                game.consoleOverlay.clear();
                console.log(`sniffing...`)
                this.refresh();
            })
            controller.up.onEvent(ControllerButtonEvent.Pressed, function () {
                this.mode = Mode.Players;
                game.consoleOverlay.clear();
                console.log(`players`)
                this.refresh();
            })
            controller.B.onEvent(ControllerButtonEvent.Pressed, function () {
                // done
                game.popScene();
                game.consoleOverlay.setVisible(false);
            })

            game.consoleOverlay.setVisible(true);
            console.log(`jacdac console`);
            console.log(` LEFT for drivers`)
            console.log(` RIGHT for devices`)
            console.log(` DOWN for sniffing packets`)
            console.log(` UP for game debug`)
            console.log(` B for exit`)
            this.refresh();
        }
    }

    class LogAllDriver extends BridgeDriver {
        debugViews: DebugView[];
        constructor(debugViews: DebugView[]) {
            super("log")
            this.debugViews = debugViews;
        }

        findDevice(packet: JDPacket): JDDevice {
            const drivers = jacdac.drivers();
            const driver = drivers.find(d => d.address == packet.address);
            return driver;
        }

        findView(driver: JDDevice, packet: JDPacket) {
            const dbgView = driver ? this.debugViews.find(d => d.driverClass == driver.driverClass) : undefined;
            return dbgView;
        }

        handlePacket(pkt: Buffer): boolean {
            const packet = new JDPacket(pkt);
            if (packet.address == 0) {
                const cp = new ControlPacket(packet.data);
                console.log(`jd>cp ${cp.address}=${cp.driverClass} ${cp.flags}`)
                let device: JDDevice;
                let dbgView: DebugView;
                if ((device = this.findDevice(packet))
                    && (dbgView = this.findView(device, packet))) {
                    const str = dbgView.renderControlPacket(cp);
                    if (str)
                        console.log(" " + str);
                }
                return true;
            } else {
                console.log(`jd>p ${packet.address} ${packet.size}b`)
                let device: JDDevice;
                let dbgView: DebugView;
                let str: string;
                if ((device = this.findDevice(packet))
                    && (dbgView = this.findView(device, packet))
                    && (str = dbgView.renderPacket(device, packet))) {
                    console.log(" " + str);
                } else {
                    console.log(" " + packet.data.toHex());
                }
            }
            return true;
        }
    }

    let _menu: DebugMenu;
    scene.systemMenu.addEntry(() => "jacdac dashboard", () => {
        _menu = new DebugMenu();
        _menu.start();
    }, false, () => {
        _menu.stop();
        _menu = undefined;
    });
}
