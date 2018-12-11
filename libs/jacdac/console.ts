namespace jacdac {
    //% fixedInstances
    export class ConsoleClient extends Client {
        public suppressForwading: boolean;
        constructor() {
            super("log", jacdac.LOGGER_DEVICE_CLASS);
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

    //% fixedInstance whenUsed block="console"
    export const consoleClient = new ConsoleClient();

    /**
     * Receives messages from console.log
     */
    //% fixedInstances
    export class ConsoleService extends Service {
        constructor() {
            super("log", jacdac.LOGGER_DEVICE_CLASS); // TODO pickup type from DAL
        }

        public handlePacket(pkt: Buffer): boolean {
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

    //% fixedInstance whenUsed block="console service"
    export const consoleService = new ConsoleService();
}