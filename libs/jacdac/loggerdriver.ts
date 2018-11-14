namespace jacdac {
    export class LoggerDriver extends JacDacDriver {
        public minPriority: LogPriority;

        constructor() {
            super(DriverType.VirtualDriver, 20); // TODO pickup type from DAL
            this.minPriority = LogPriority.Silent;
            jacdac.addDriver(this);
            console.addListener((priority, text) => this.log(priority, text));
        }

        public handlePacket(pkt: Buffer): boolean {
            const packet = new JDPacket(pkt);
            const packetSize = packet.size;
            if (!packetSize) return true;

            const command = packet.data.getNumber(NumberFormat.UInt8LE, 0);
            switch(command) {
                case 0x01: // set priority
                    this.minPriority = packet.data.getNumber(NumberFormat.UInt8LE, 1);
                    break;
                default: // ignore...
            }
            return true;
        }        

        /**
         * Sends a log message through jacdac
         * @param str
         */
        public log(priority: console.LogPriority, str: string) {
            if (!this.device.isConnected || !str || priority < this.minPriority)
                return;

            let cursor = 0;
            while (cursor < str.length) {
                const txLength = Math.min(str.length - cursor, 31); // DAL constant needed for max size
                const buf = control.createBuffer(txLength + 1);
                buf.setNumber(NumberFormat.UInt8LE, 0, priority); // priority....
                for (let i = 0; i < txLength; i++) {
                    buf.setNumber(NumberFormat.UInt8LE, i + 1,  str.charCodeAt(i + cursor));
                }
                jacdac.sendPacket(buf, this.device.driverAddress);
                cursor += txLength;
            }
        }
    }

    export class LogListenerDriver extends JacDacDriver {
        public minPriority: LogPriority;

        constructor(fp: (str: string) => {}) {
            super(DriverType.HostDriver, 21); // TODO pickup type from DAL
            this.minPriority = LogPriority.Log;
            jacdac.addDriver(this);
        }

        public handlePacket(pkt: Buffer): boolean {
            const packet = new JDPacket(pkt);
            const packetSize = packet.size;
            if (!packetSize) return true;

            const priority = packet.data.getNumber(NumberFormat.UInt8LE, 0);
            if (priority < this.minPriority) return true;

            let str = "";
            for (let i = 1; i < packetSize; i++)
                str += String.fromCharCode(packet.data.getNumber(NumberFormat.UInt8LE, i));

            // TODO: handle priority priority
            console.log(str);
            return true;
        }
    }
}