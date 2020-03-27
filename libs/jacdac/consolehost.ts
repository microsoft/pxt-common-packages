namespace jacdac {
    export class ConsoleHost extends Host {
        private _lastListenerTime: number = 0;
        minPriority = JDConsolePriority.Silent;

        constructor() {
            super("conh", jd_class.LOGGER);
            this._lastListenerTime = 0;
        }

        handlePacket(packet: JDPacket) {
            switch (packet.service_command) {
                case JDConsoleCommand.SetMinPriority:
                    const now = control.millis()
                    // lower the priority immedietly, but tighten it only when no one 
                    // was asking for lower one for some time
                    const d = packet.intData
                    if (d <= this.minPriority ||
                        now - this._lastListenerTime > 1500) {
                        this.minPriority = d
                        this._lastListenerTime = now
                    }
                    break;
                default:
                    break;
            }
        }

        debug(message: string): void {
            this.add(JDConsolePriority.Debug, message);
        }
        log(message: string): void {
            this.add(JDConsolePriority.Log, message);
        }
        warn(message: string): void {
            this.add(JDConsolePriority.Warning, message);
        }
        error(message: string): void {
            this.add(JDConsolePriority.Error, message);
        }

        add(priority: JDConsolePriority, message: string): void {
            if (!message || !message.length || priority < this.minPriority || !this._lastListenerTime)
                return;

            // no one listening?
            if (control.millis() - this._lastListenerTime > 3000) {
                this._lastListenerTime = 0;
                return;
            }

            for (let buf of Buffer.chunkedFromUTF8(message, JD_SERIAL_MAX_PAYLOAD_SIZE)) {
                this.sendReport(JDPacket.from(JDConsoleCommand.MessageDbg + priority, buf))
            }
        }
    }

    //% whenUsed
    export const consoleHost = new ConsoleHost()
}