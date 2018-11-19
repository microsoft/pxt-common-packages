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
            jacdac.addDriver(this);
            console.addListener((priority, text) => this.broadcastLog(priority, text));
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
                const txLength = Math.min(str.length - cursor, DAL.JD_SERIAL_DATA_SIZE - 1);
                const buf = control.createBuffer(txLength + 1);
                buf.setNumber(NumberFormat.UInt8LE, 0, priority);
                for (let i = 0; i < txLength; i++) {
                    buf.setNumber(NumberFormat.UInt8LE, i + 1, str.charCodeAt(i + cursor));
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

            // send message to console
            let str = "";
            for (let i = 1; i < packetSize; i++)
                str += String.fromCharCode(packet.data.getNumber(NumberFormat.UInt8LE, i));

            // pipe to console TODO suppress forwarding
            console.add(priority, str);

            return true;
        }
    }
}