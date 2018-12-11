enum JDConsoleMode {
    Off,
    Broadcast,
    Listen
}

namespace jacdac {

    /**
     * Console logging driver. The driver is off, broadcasting or listening. Cannot do both.
     */
    export class ConsoleDriver extends Driver {
        private _mode: JDConsoleMode;
        private _lastListenerTime: number;

        static BROADCAST_TIMEOUT = 10000;

        constructor() {
            super("log", DriverType.BroadcastDriver, jacdac.LOGGER_DEVICE_CLASS, 1);
            this.supressLog = true;
            this._mode = JDConsoleMode.Off;
            console.addListener((priority, text) => this.broadcast(priority, text));
        }

        setMode(mode: JDConsoleMode) {
            this.start();
            if (this._mode != mode) {
                this._mode = mode;
                this.log(`mode ${this._mode}`);
            }
        }

        mode(): JDConsoleMode {
            return this._mode;
        }

        updateControlPacket() {
            // advertise mode in control packet
            this.controlData[0] = this._mode;
        }

        public handleControlPacket(pkt: Buffer): boolean {
            const packet = new ControlPacket(pkt);
            const mode = packet.data[0];
            if (mode == JDConsoleMode.Listen) {
                // if a listener entres the bus, automatically start listening
                if (this._mode != JDConsoleMode.Listen)
                    this.setMode(JDConsoleMode.Broadcast);
                this._lastListenerTime = control.millis();
            }
            return true;
        }

        public handlePacket(pkt: Buffer): boolean {
            if (this._mode != JDConsoleMode.Listen) 
                return true;

            const packet = new JDPacket(pkt);
            const data = packet.data;
            const priority = data[0];
            // shortcut
            if (priority < console.minPriority) return true;
            // send message to console
            const packetSize = data.length;
            let str = "";
            for (let i = 1; i < packetSize; i++)
                str += String.fromCharCode(data[i]);
            // pipe to console
            console.add(priority, str);

            return true;
        }

        private broadcast(priority: ConsolePriority, str: string) {
            if (this._mode != JDConsoleMode.Broadcast || !this.isConnected)
                return;

            // no one listening?
            if (control.millis() - this._lastListenerTime > ConsoleDriver.BROADCAST_TIMEOUT) {
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

    //% whenUsed block="console"
    export const consoleDriver = new ConsoleDriver();

    /**
     * Broadcast console messages
     */
    //% group="Console" block="broadcast console" blockId=jdbroadcast
    export function broadcastConsole() {
        consoleDriver.setMode(JDConsoleMode.Broadcast);
    }

    /**
     * Listens for console messages
     */
    //% group="Console" block="listen to console" blockId=jdlistenconsole
    export function listenConsole() {
        consoleDriver.setMode(JDConsoleMode.Listen);
    }
}