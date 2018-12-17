namespace jacdac {

    enum Mode {
        None,
        Drivers,
        Devices,
        Packets,
        Players
    }
    let mode = Mode.None;

    function createDebugViews(): DebugView[] {
        return [
            jacdac.MessageBusService.debugView(),
            jacdac.ConsoleDriver.debugView(),
            /*
            jacdac.AccelerometerClient.debugView(),
            jacdac.MicrophoneClient.debugView(),
            jacdac.ButtonClient.debugView(),
            jacdac.TouchClient.debugView(),
            jacdac.SwitchClient.debugView(),
            jacdac.LightSensorClient.debugView(),
            jacdac.ThermometerClient.debugView(),
            jacdac.PixelClient.debugView(),
            jacdac.LightClient.debugView(),
            jacdac.MusicClient.debugView(),
            */
            jacdac.GameLobbyDriver.debugView()
        ];
    }

    function showDrivers() {
        jacdac.clearBridge();
        renderDrivers();
    }

    function renderDrivers() {
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

        const debugViews = createDebugViews();
        let drivers = jacdac.drivers();
        drivers = drivers.slice(1, drivers.length);
        console.log(`${drivers.length} drivers (${jacdac.isConnected() ? "connected" : "disconected"})`)
        drivers.forEach(d => {
            const driverClass = d.driverClass;
            const dbgView = debugViews.find(d => driverClass == d.driverClass);
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
            while(flags.length < 4) flags += " ";
            console.log(`${toHex8(d.address)} ${driverName} ${flags} ${toHex(d.serialNumber)}`);
            const err = d.error;
            if (err != JDDriverErrorCode.DRIVER_OK)
                console.log(` e ${errors[<number>err] || err}`);
        })
        console.log("");
    }

    function showDevices() {
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

    let _logAllDriver: LogAllDriver;
    function showPackets() {
        if (!_logAllDriver) _logAllDriver = new LogAllDriver(createDebugViews());
        _logAllDriver.start();
    }

    function showPlayers() {
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

    function refresh() {
        if (!jacdac.isConnected())
            console.log(`disconnected`);
        switch (mode) {
            case Mode.Drivers: showDrivers(); break;
            case Mode.Devices: showDevices(); break;
            case Mode.Packets: showPackets(); break;
            case Mode.Players: showPlayers(); break;
        }
    }

    function start() {
        game.pushScene(); // start game
        jacdac.onEvent(JDEvent.BusConnected, () => {
            game.consoleOverlay.clear();
            console.log(`connected`)
            refresh()
        });
        jacdac.onEvent(JDEvent.BusDisconnected, () => {
            game.consoleOverlay.clear();
            console.log(`disconnected`)
            refresh()
        });
        jacdac.onEvent(JDEvent.DriverChanged, () => {
            console.log(`driver changed`)
            if (mode == Mode.Packets) {
                renderDrivers();
            } else
                game.consoleOverlay.clear();
            refresh()
        });
        controller.left.onEvent(ControllerButtonEvent.Pressed, function () {
            mode = Mode.Drivers;
            game.consoleOverlay.clear();
            refresh();
        })
        controller.right.onEvent(ControllerButtonEvent.Pressed, function () {
            mode = Mode.Devices;
            game.consoleOverlay.clear();
            refresh();
        })
        controller.down.onEvent(ControllerButtonEvent.Pressed, function () {
            mode = Mode.Packets;
            game.consoleOverlay.clear();
            console.log(`sniffing...`)
            refresh();
        })
        controller.up.onEvent(ControllerButtonEvent.Pressed, function () {
            mode = Mode.Players;
            game.consoleOverlay.clear();
            console.log(`players`)
            refresh();
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
        refresh();
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

    scene.systemMenu.addEntry(() => "jacdac sniff", start, false, () => clearBridge());
}
