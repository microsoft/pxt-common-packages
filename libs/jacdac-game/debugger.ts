namespace jacdac {
    function toHex(n: number): string {
        const hexBuf = control.createBuffer(4);
        hexBuf.setNumber(NumberFormat.UInt32LE, 0, n);
        return hexBuf.toHex();
    }
    function toHex16(n: number): string {
        const hexBuf = control.createBuffer(2);
        hexBuf.setNumber(NumberFormat.UInt16LE, 0, n);
        return hexBuf.toHex();
    }
    function toHex8(n: number): string {
        const hexBuf = control.createBuffer(1);
        hexBuf.setNumber(NumberFormat.UInt8LE, 0, n);
        return hexBuf.toHex();
    }

    enum Mode {
        None,
        Drivers,
        Devices,
        Packets
    }
    let mode = Mode.None;
    function showDrivers() {
        jacdac.clearBridge();
        const drivers = jacdac.drivers();
        console.log(`${drivers.length} drivers (${jacdac.isConnected() ? "conn" : "disc"})`)
        console.log(`ad class    serial`);
        console.log(` flags status`);
        drivers.forEach(d => {
            console.log(`${toHex8(d.address)} ${d.driverClass} ${toHex(d.serialNumber)}`);
            let flags = " " + toHex16(d.flags) + " ";
            if (d.driverClass == 0)
                flags += "logic";
            else {
                if (d.isVirtualDriver())
                    flags += "client";
                else if (d.isHostDriver())
                    flags += "service";
                else if (d.isBroadcastDriver())
                    flags += "broa";
                else if (d.isSnifferDriver())
                    flags += "sniff";
            }
            if (d.isPaired())
                flags += " paired";
            if (d.isPairing())
                flags += " pairing";
            if (d.flags & DAL.JD_DEVICE_FLAGS_CP_SEEN)
                flags += " cp"
            if (d.flags & DAL.JD_DEVICE_FLAGS_INITIALISED)
                flags += " inited"
            if (d.flags & DAL.JD_DEVICE_FLAGS_INITIALISING)
                flags += " initing"
            console.log(flags)
        })
        console.log("");
    }

    function showDevices() {
        jacdac.clearBridge();
        const drivers = jacdac.drivers();
        let serials: any = {};
        drivers.forEach(d => {
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
        if (!_logAllDriver) _logAllDriver = new LogAllDriver();
        _logAllDriver.start();
    }

    function refresh() {
        if (!jacdac.isConnected()) {
            console.log(`disconnected`);
            return;
        }
        switch (mode) {
            case Mode.Drivers: showDrivers(); break;
            case Mode.Devices: showDevices(); break;
            case Mode.Packets: showPackets(); break;
        }
    }

    function start() {
        game.pushScene(); // start game
        jacdac.onEvent(JacDacEvent.BusConnected, () => {
            console.log(`connected`)
            refresh()
        });
        jacdac.onEvent(JacDacEvent.BusDisconnected, () => {
            console.log(`disconnected`)
            refresh()
        });
        jacdac.onEvent(JacDacEvent.DriverChanged, () => {
            console.log(`driver changed`)
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
        controller.B.onEvent(ControllerButtonEvent.Pressed, function () {
            // done
            game.popScene();
            game.consoleOverlay.setVisible(false);
        })

        game.consoleOverlay.setVisible(true);
        console.log(`jacdac console`);
        console.log(` LEFT for drivers`)
        console.log(` RIGHT for devices`)
        console.log(` DOWN for packets`)
        console.log(` B for exit`)
        refresh();
    }

    class LogAllDriver extends BridgeDriver {
        constructor() {
            super("log")
        }

        handlePacket(pkt: Buffer): boolean {
            const packet = new JDPacket(pkt);
            if (packet.address == 0) {
                const cp = new ControlPacket(packet.data);
                console.log(`jd>cp ${cp.address}=${cp.driverClass} ${cp.flags}`)
                const data = cp.data;
                if (data.length)
                    console.log(" " + cp.data.toHex());
                return true;
            } else {
                console.log(`jd>p ${packet.address} ${packet.size}b`)
                const data = packet.data;
                if (data.length)
                    console.log(" " + packet.data.toHex());
            }
            return true;
        }
    }

    scene.systemMenu.addEntry(() => "jacdac console", start);
}
