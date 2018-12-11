enum JDConsoleMode {
    Off,
    Broadcast,
    Listen
}

enum JDConsoleMessage {
    SetOff = JDConsoleMode.Off,
    SetBroadcast = JDConsoleMode.Broadcast,
    Reserved,
    Add
}

namespace jacdac {

    /**
     * Console logging driver. The driver is off, broadcasting or listening. Cannot do both.
     */
    export class ConsoleDriver extends Driver {
        _mode: JDConsoleMode;

        constructor() {
            super("log", DriverType.BroadcastDriver, jacdac.LOGGER_DEVICE_CLASS, 1);
            this.supressLog = true;
            this._mode = JDConsoleMode.Off;
            console.addListener((priority, text) => this.broadcast(priority, text));
        }

        setMode(mode: JDConsoleMode) {
            if (this._mode != mode) {
                this._mode = mode;
                switch (this._mode) {
                    case JDConsoleMode.Broadcast:
                    case JDConsoleMode.Listen:
                        this.start();
                        break;
                    case JDConsoleMode.Off:
                        break; // nothing
                }
                this.log(`mode ${this._mode}`);
            }
        }

        /**
         * Sends a command to another device to broadcast or not
         */
        setBroadcastCommand(broadcast: boolean, address: number) {
            const buf = control.createBuffer(5);
            buf[0] = broadcast ? JDConsoleMessage.SetBroadcast : JDConsoleMessage.SetOff;
            buf[1] = address;
            this.sendPacket(buf);
        }

        mode(): JDConsoleMode {
            return this._mode;
        }

        updateControlPacket() {
            // advertise mode in control packet
            this.controlData[0] = this._mode;
        }

        public handlePacket(pkt: Buffer): boolean {
            const packet = new JDPacket(pkt);
            const data = packet.data;
            const cmd = data[0];
            switch (cmd) {
                case JDConsoleMessage.SetOff:
                case JDConsoleMessage.SetBroadcast:
                    const address = data[1];
                    if (!address || address == this.device.address)
                        this.setMode(cmd);
                    break;
                case JDConsoleMessage.Add:
                    this.addMessage(data);
                    break;
            }
            return true;
        }

        private addMessage(data: Buffer) {
            const priority = data[1];
            // shortcut
            if (priority < console.minPriority) return true;
            // send message to console
            const packetSize = data.length;
            let str = "";
            for (let i = 2; i < packetSize; i++)
                str += String.fromCharCode(data[i]);
            // pipe to console
            console.add(priority, str);

            return true;
        }

        private broadcast(priority: ConsolePriority, str: string) {
            if (this._mode != JDConsoleMode.Broadcast || !this.isConnected)
                return;

            let cursor = 0;
            while (cursor < str.length) {
                const txLength = Math.min(str.length - cursor, DAL.JD_SERIAL_DATA_SIZE - 2);
                const buf = control.createBuffer(txLength + 2);
                buf[0] = JDConsoleMessage.Add;
                buf[1] = priority;
                for (let i = 0; i < txLength; i++)
                    buf[i + 2] = str.charCodeAt(i + cursor);
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