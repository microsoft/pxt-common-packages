namespace jacdac {
    let _loggerDriver: LoggerVirtualDriver;
    /**
     * Sends console messages over JacDac
     */
    //% blockId=jacdac_broadcast_console block="jacdac broadcast console"
    export function broadcastConsole() {
        if (!_loggerDriver)
            _loggerDriver = new LoggerVirtualDriver();
    }

    export function suppressLogBroadcast(logf: () => void) {
        // pipe to console
        if (_loggerDriver) // avoid cyclic repetition of messages
            _loggerDriver.suppressForwading = true;
        logf();
        if (_loggerDriver)
            _loggerDriver.suppressForwading = false;
    }


    class LoggerVirtualDriver extends JacDacDriver {
        public suppressForwading: boolean;
        constructor() {
            super("log", DriverType.VirtualDriver, 20); // TODO pickup type from DAL
            this.suppressForwading = false;
            // send to other devices
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

    let _logListenerDriver: LoggerHostDriver;

    /**
     * Listens for console messages from other devices
     */
    //% blockId=jacdac_listen_console block="jacdac listen console"
    export function listenConsole() {
        if (!_logListenerDriver)
            _logListenerDriver = new LoggerHostDriver();
    }

    class LoggerHostDriver extends JacDacDriver {
        constructor() {
            super("log", DriverType.HostDriver, 20); // TODO pickup type from DAL
            jacdac.addDriver(this);
        }

        public handlePacket(pkt: Buffer): boolean {
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

            // pipe to console
            suppressLogBroadcast(() => this.log(str));

            return true;
        }
    }

    let _snifferLoggerDriver: SnifferLoggerDriver = undefined;
    /**
     * Logs all jacdac activity to the console
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