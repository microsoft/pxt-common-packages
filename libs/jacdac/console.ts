enum JDConsoleMode {
    Off,
    Broadcast,
    Listen
}

namespace jacdac {
    export function toHex(n: number): string {
        const hexBuf = control.createBuffer(4);
        hexBuf.setNumber(NumberFormat.UInt32LE, 0, n);
        return hexBuf.toHex();
    }
    export function toHex16(n: number): string {
        const hexBuf = control.createBuffer(2);
        hexBuf.setNumber(NumberFormat.UInt16LE, 0, n);
        return hexBuf.toHex();
    }
    export function toHex8(n: number): string {
        const hexBuf = control.createBuffer(1);
        hexBuf.setNumber(NumberFormat.UInt8LE, 0, n);
        return hexBuf.toHex();
    }

    /**
     * Console logging driver. The driver is off, broadcasting or listening. Cannot do both.
     */
    export class ConsoleDriver extends Broadcast {
        private _lastListenerTime: number;

        static NAME = "log"
        static BROADCAST_TIMEOUT = 2000;

        constructor() {
            super(ConsoleDriver.NAME, jacdac.LOGGER_DEVICE_CLASS, 2);
            this.controlData[0] = JDConsoleMode.Off;
            this.controlData[1] = console.minPriority; // TODO this may get outdated
            console.addListener((priority, text) => this.broadcast(priority, text));
        }

        setMode(mode: JDConsoleMode) {
            this.start();
            if (this.mode != mode) {
                this.controlData[0] = mode;
                this.supressLog = this.mode == JDConsoleMode.Broadcast;
                this.priority = this.mode == JDConsoleMode.Broadcast ? ConsolePriority.Error : ConsolePriority.Log;
                this.log(`mode ${this.mode}`);
            }
        }

        get mode(): JDConsoleMode {
            return this.controlData[0];
        }

        get priority(): ConsolePriority {
            this.controlData[1] = console.minPriority;
            return this.controlData[1];
        }

        set priority(value: ConsolePriority) {
            this.controlData[1] = value;
            console.minPriority = value; // keep in sync
        }

        public handleControlPacket(pkt: Buffer): boolean {
            const packet = new ControlPacket(pkt);
            const mode = packet.data[0];
            if (mode == JDConsoleMode.Listen) {
                // if a listener entres the bus, automatically start listening
                if (this.mode != JDConsoleMode.Listen)
                    this.setMode(JDConsoleMode.Broadcast);
                // update priority if needed
                const priority = packet.data[1];
                if (priority < this.priority) // update priority
                    this.priority = priority;
                this._lastListenerTime = control.millis();
            }
            return true;
        }

        public handlePacket(pkt: Buffer): boolean {
            if (this.mode != JDConsoleMode.Listen)
                return true;

            const packet = new JDPacket(pkt);
            const data = packet.data;
            const priority = data[0];
            // shortcut
            if (priority < console.minPriority) return true;
            // send message to console
            const str = bufferToString(data, 1);
            // pipe to console
            console.add(priority, `${toHex8(packet.address)}> ${str}`);

            return true;
        }

        private broadcast(priority: ConsolePriority, str: string) {
            if (this.mode != JDConsoleMode.Broadcast)
                return;

            // no one listening -- or disconnected?
            if (!this.isConnected
                || control.millis() - this._lastListenerTime > ConsoleDriver.BROADCAST_TIMEOUT) {
                this.setMode(JDConsoleMode.Off);
                return;
            }

            let cursor = 0;
            while (cursor < str.length) {
                const txLength = Math.min(str.length - cursor, DAL.JD_SERIAL_DATA_SIZE - 1);
                const buf = control.createBuffer(txLength + 1);
                buf[0] = priority;
                for (let i = 0; i < txLength; i++)
                    buf[i + 1] = str.charCodeAt(i + cursor);
                this.sendPacket(buf);
                cursor += txLength;
            }
        }
    }

    //% whenUsed
    export const consoleDriver = new ConsoleDriver();
}