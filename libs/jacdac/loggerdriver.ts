namespace jacdac {
    // TODO allocate ID in DAL
    const LOGGER_DRIVER_CLASS = 4220;

    let _logBroadcastDriver: LoggerBroadcastDriver;
    /**
     * Sends console messages over JacDac
     */
    //% blockId=jacdac_broadcast_console block="jacdac broadcast console"
    export function broadcastConsole() {
        if (!_logBroadcastDriver)
            _logBroadcastDriver = new LoggerBroadcastDriver();
    }

    export function suppressLogBroadcast(logf: () => void) {
        // pipe to console
        if (_logBroadcastDriver) // avoid cyclic repetition of messages
            _logBroadcastDriver.suppressForwading = true;
        logf();
        if (_logBroadcastDriver)
            _logBroadcastDriver.suppressForwading = false;
    }


    class LoggerBroadcastDriver extends JacDacDriver {
        public suppressForwading: boolean;
        constructor() {
            super("log", DriverType.VirtualDriver, LOGGER_DRIVER_CLASS, true); // TODO pickup type from DAL
            // send to other devices
            this.suppressForwading = false;
            console.addListener((priority, text) => this.broadcastLog(priority, text));
            jacdac.addDriver(this);
        }

        /**
         * Sends a log message through jacdac
         * @param str
         */
        private broadcastLog(priority: ConsolePriority, str: string) {
            if (!this.device.isConnected || this.suppressForwading)
                return;

            let cursor = 0;
            while (cursor < str.length) {
                const txLength = Math.min(str.length - cursor, DAL.JD_SERIAL_DATA_SIZE - 1 - 4);
                const buf = control.createBuffer(txLength + 1);
                buf.setNumber(NumberFormat.UInt8LE, 0, priority);
                buf.setNumber(NumberFormat.UInt32LE, 1, this.device.serialNumber);
                for (let i = 0; i < txLength; i++) {
                    buf.setNumber(NumberFormat.UInt8LE, i + 5, str.charCodeAt(i + cursor));
                }
                jacdac.sendPacket(buf, this.device.driverAddress);
                cursor += txLength;
            }
        }
    }

    let _logListenerDriver: LoggerListenDriver;
    /**
     * Listens for console messages from other devices
     */
    //% blockId=jacdac_listen_console block="jacdac listen console"
    export function listenConsole() {
        if (!_logListenerDriver)
            _logListenerDriver = new LoggerListenDriver();
    }

    class LoggerListenDriver extends JacDacDriver {
        constructor() {
            super("log", DriverType.HostDriver, LOGGER_DRIVER_CLASS); // TODO pickup type from DAL
            jacdac.addDriver(this);
        }

        handleControlPacket(pkt: Buffer): boolean {
            console.log("ctrl packet")
            return super.handleControlPacket(pkt);
        }

        deviceConnected(): void {
            console.log("dev conn")
            super.deviceConnected();
        }

        deviceRemoved() {
            console.log("dev rem");
            super.deviceRemoved();
        }

        public handlePacket(pkt: Buffer): boolean {
            console.log("rcvd packet")
            const packet = new JDPacket(pkt);
            const packetSize = packet.size;
            if (!packetSize) return true;

            const priority = packet.data.getNumber(NumberFormat.UInt8LE, 0);
            // shortcut
            if (priority < console.minPriority) return true;

            // who sent this?            
            const serial = packet.data.getNumber(NumberFormat.UInt32LE, 1);

            // send message to console
            let str = "";
            for (let i = 5; i < packetSize; i++)
                str += String.fromCharCode(packet.data.getNumber(NumberFormat.UInt8LE, i));

            // pipe to console TODO suppress forwarding
            console.add(priority, str);

            return true;
        }
    }

    let _snifferLoggerDriver: SnifferLoggerDriver = undefined;
    /**
     * Enables or disables all jacdac activity to the console
     */
    export function sniffAllPacketsToConsole(enabled = true) {
        if (!_snifferLoggerDriver)
            _snifferLoggerDriver = new SnifferLoggerDriver();
        _snifferLoggerDriver.enabled = enabled;
    }

    class SnifferLoggerDriver extends JacDacDriver {
        public enabled: boolean;
        constructor() {
            super("snif", DriverType.SnifferDriver, 0);
            this.enabled = true;
            jacdac.addDriver(this);
        }

        public handleControlPacket(pkt: Buffer): boolean {
            if (this.enabled) {
                const ctrl = new ControlPacket(pkt);
                suppressLogBroadcast(() => this.log(`ctrl>from ${ctrl.serialNumber}:${ctrl.address}>${ctrl.data.toHex()}`))
            }
            return super.handleControlPacket(pkt);
        }

        public handlePacket(pkt: Buffer): boolean {
            if (this.enabled) {
                const jd = new JDPacket(pkt);
                suppressLogBroadcast(() => this.log(`ctrl>${jd.address}>${jd.data.toHex()}`))
            }
            return super.handlePacket(pkt);
        }

        public deviceConnected(): void {
            suppressLogBroadcast(() => this.log(`dev>con`));
        }

        public deviceRemoved(): void {
            suppressLogBroadcast(() => this.log(`dev>dis`));
        }
    }
}