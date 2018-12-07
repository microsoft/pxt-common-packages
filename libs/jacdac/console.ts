namespace jacdac {
    class ConsoleClient extends Client {
        public suppressForwading: boolean;
        constructor() {
            super("log", DriverType.VirtualDriver, jacdac.LOGGER_DEVICE_CLASS);
            this.supressLog = true;
            this.suppressForwading = false;
            console.addListener((priority, text) => this.broadcast(priority, text));
        }

        /**
         * Sends a log message through jacdac
         * @param str
         */
        private broadcast(priority: ConsolePriority, str: string) {
            if (!this.isConnected || this.suppressForwading)
                return;

            let cursor = 0;
            while (cursor < str.length) {
                const txLength = Math.min(str.length - cursor, DAL.JD_SERIAL_DATA_SIZE - 1);
                const buf = control.createBuffer(txLength + 1);
                buf.setNumber(NumberFormat.UInt8LE, 0, priority);
                for (let i = 0; i < txLength; i++) {
                    buf.setNumber(NumberFormat.UInt8LE, i + 1, str.charCodeAt(i + cursor));
                }
                this.sendPacket(buf);
                cursor += txLength;
            }
        }
    }

    let _consoleClient: ConsoleClient;
    /**
     * Sends console messages over JacDac
     */
    //% blockId=jacdac_broadcast_console block="jacdac broadcast console"
    //% group="Console"
    export function broadcastConsole() {
        if (!_consoleClient) {
            _consoleClient = new ConsoleClient();
            _consoleClient.start();
        }
    }
}